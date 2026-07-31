import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signAWS4 } from '@/lib/r2';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const jewelry_id = formData.get('jewelry_id') as string;

    if (!file || !jewelry_id) {
      return NextResponse.json({ error: 'Dosya ve jewelry_id zorunludur.' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Dosya 50 MB'dan büyük olamaz." }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'bin';

    const { data: jewelry } = await supabaseAdmin
      .from('jewelries')
      .select('nfc_tag_id')
      .eq('id', jewelry_id)
      .single();
    const folder = jewelry?.nfc_tag_id
      ? jewelry.nfc_tag_id.replace(/[^a-zA-Z0-9_-]/g, '_')
      : jewelry_id;

    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';

    const { url, authorization, datetime, payloadHash } = signAWS4('PUT', key, buffer, contentType);

    const r2Res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Authorization': authorization,
        'x-amz-date': datetime,
        'x-amz-content-sha256': payloadHash,
      },
      body: buffer,
    });

    if (!r2Res.ok) {
      const text = await r2Res.text();
      throw new Error(`R2 yükleme başarısız: ${r2Res.status} — ${text}`);
    }

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ url: publicUrl, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}