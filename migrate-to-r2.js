const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicUrl = process.env.R2_PUBLIC_URL;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function signRequest(method, path, payload = '') {
  const host = `${r2AccountId}.r2.cloudflarestorage.com`;
  const algorithm = 'AWS4-HMAC-SHA256';
  const service = 's3';
  const region = 'auto';
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const datetime = now.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';

  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
  const canonicalRequest = `${method}\n${path}\n\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${datetime}\n\nhost;x-amz-content-sha256;x-amz-date\n${payloadHash}`;
  const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');

  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${datetime}\n${credentialScope}\n${canonicalRequestHash}`;

  const kDate = crypto.createHmac('sha256', `AWS4${r2SecretAccessKey}`).update(date).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  return {
    authorization: `${algorithm} Credential=${r2AccessKeyId}/${credentialScope}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`,
    datetime,
    payloadHash,
  };
}

async function migrateToR2() {
  console.log('Starting Supabase Storage to Cloudflare R2 migration...\n');

  try {
    console.log('Listing Supabase Storage files...');
    const { data: files, error: listError } = await supabase.storage
      .from('jewelry-media')
      .list('', { limit: 1000 });

    if (listError) throw listError;
    if (!files || files.length === 0) {
      console.log('Supabase Storage is empty, no migration needed.');
      return;
    }

    console.log(`Found ${files.length} files\n`);

    const urlMap = {};
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;

      try {
        console.log(`[${i + 1}/${files.length}] Processing ${fileName}...`);

        const { data: fileData, error: downloadError } = await supabase.storage
          .from('jewelry-media')
          .download(fileName);

        if (downloadError) throw downloadError;

        const buffer = await fileData.arrayBuffer();
        const path = `/${r2BucketName}/${fileName}`;
        const { authorization, datetime, payloadHash } = signRequest('PUT', path, Buffer.from(buffer));

        const r2Url = `https://${r2AccountId}.r2.cloudflarestorage.com${path}`;
        const uploadResponse = await fetch(r2Url, {
          method: 'PUT',
          headers: {
            'Content-Type': fileData.type || 'application/octet-stream',
            'Authorization': authorization,
            'x-amz-date': datetime,
            'x-amz-content-sha256': payloadHash,
          },
          body: buffer,
        });

        if (!uploadResponse.ok) {
          const text = await uploadResponse.text();
          throw new Error(`R2 upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${text}`);
        }

        const newPublicUrl = `${r2PublicUrl}/${fileName}`;
        const oldUrl = `https://zshndmjpxkoqpijiksvp.supabase.co/storage/v1/object/public/jewelry-media/${fileName}`;
        urlMap[oldUrl] = newPublicUrl;

        console.log(`  OK Uploaded to R2: ${newPublicUrl}`);
        successCount++;
      } catch (err) {
        console.error(`  ERROR: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\nResult: ${successCount} success, ${errorCount} errors\n`);

    if (successCount > 0) {
      console.log('Updating database URLs...');

      const { data: jewelries, error: fetchError } = await supabase
        .from('jewelries')
        .select('id, media_url');

      if (fetchError) throw fetchError;

      for (const jewelry of jewelries) {
        if (jewelry.media_url && urlMap[jewelry.media_url]) {
          const newUrl = urlMap[jewelry.media_url];
          const { error: updateError } = await supabase
            .from('jewelries')
            .update({ media_url: newUrl })
            .eq('id', jewelry.id);

          if (updateError) {
            console.error(`  ERROR ${jewelry.id}: ${updateError.message}`);
          } else {
            console.log(`  OK ${jewelry.id} updated`);
          }
        }
      }

      const { data: mediaItems, error: mediaFetchError } = await supabase
        .from('jewelry_media')
        .select('id, url');

      if (mediaFetchError) throw mediaFetchError;

      for (const item of mediaItems) {
        if (item.url && urlMap[item.url]) {
          const newUrl = urlMap[item.url];
          const { error: updateError } = await supabase
            .from('jewelry_media')
            .update({ url: newUrl })
            .eq('id', item.id);

          if (updateError) {
            console.error(`  ERROR Media ${item.id}: ${updateError.message}`);
          } else {
            console.log(`  OK Media ${item.id} updated`);
          }
        }
      }

      console.log('Database updated\n');
    }

    if (successCount > 0) {
      console.log('Cleaning up Supabase Storage...');
      for (const file of files) {
        const { error: deleteError } = await supabase.storage
          .from('jewelry-media')
          .remove([file.name]);

        if (deleteError) {
          console.error(`  ERROR ${file.name}: ${deleteError.message}`);
        } else {
          console.log(`  OK ${file.name} deleted`);
        }
      }
      console.log('Supabase Storage cleaned\n');
    }

    console.log('Migration completed!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrateToR2();
