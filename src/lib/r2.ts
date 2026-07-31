import { createHash, createHmac } from 'crypto';

interface SignResult {
  url: string;
  authorization: string;
  datetime: string;
  payloadHash: string;
  contentType: string;
}

/**
 * Cloudflare R2 (S3-uyumlu) için AWS Signature Version 4 imzalama.
 * PUT (yükleme) ve DELETE (silme) metodlarını destekler.
 */
export function signAWS4(
  method: 'PUT' | 'DELETE',
  key: string,
  buffer: Buffer | null,
  contentType: string
): SignResult {
  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
  const bucket = process.env.R2_BUCKET_NAME!;

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const region = 'auto';
  const service = 's3';
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const datetime = now.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';

  const path = `/${bucket}/${key}`;
  const payloadHash = createHash('sha256').update(buffer ?? '').digest('hex');

  const canonicalRequest = [
    method,
    path,
    '',
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${datetime}`,
    '',
    'host;x-amz-content-sha256;x-amz-date',
    payloadHash,
  ].join('\n');

  const canonicalHash = createHash('sha256').update(canonicalRequest).digest('hex');
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${datetime}\n${credentialScope}\n${canonicalHash}`;

  const kDate = createHmac('sha256', `AWS4${secretAccessKey}`).update(date).digest();
  const kRegion = createHmac('sha256', kDate).update(region).digest();
  const kService = createHmac('sha256', kRegion).update(service).digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  return {
    url: `https://${host}${path}`,
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`,
    datetime,
    payloadHash,
    contentType,
  };
}

/**
 * R2 public URL'inden object key'ini çıkarır.
 * Örn: https://pub-xxx.r2.dev/folder/file.jpg → folder/file.jpg
 */
export function extractR2Key(url: string): string | null {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) return null;
  const parts = url.split(`${base}/`);
  return parts.length > 1 ? parts[1] : null;
}

/**
 * Verilen URL'deki dosyayı Cloudflare R2'den siler.
 * @returns silme başarılı mı
 */
export async function deleteFromR2(url: string): Promise<boolean> {
  const key = extractR2Key(url);
  if (!key) return false;

  const { url: deleteUrl, authorization, datetime, payloadHash } = signAWS4('DELETE', key, null, 'application/octet-stream');

  const response = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: authorization,
      'x-amz-date': datetime,
      'x-amz-content-sha256': payloadHash,
    },
  });

  return response.ok;
}