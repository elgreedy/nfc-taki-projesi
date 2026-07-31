import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { deleteFromR2 } from '@/lib/r2';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id, url, jewelry_id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id zorunludur.' }, { status: 400 });

    // 1. Dosyayı R2'den sil
    if (url) {
      await deleteFromR2(url).catch(() => {});
    }

    // 2. Tablodan sil
    const { error } = await supabaseAdmin.from('jewelry_media').delete().eq('id', id);
    if (error) throw error;

    // 3. Kalan medyaların ilkini jewelries.media_url olarak güncelle (geriye dönük uyumluluk)
    if (jewelry_id) {
      const { data: remaining } = await supabaseAdmin
        .from('jewelry_media')
        .select('url')
        .eq('jewelry_id', jewelry_id)
        .order('order_index', { ascending: true })
        .limit(1);

      const newUrl = remaining && remaining.length > 0 ? remaining[0].url : '';
      await supabaseAdmin.from('jewelries').update({ media_url: newUrl }).eq('id', jewelry_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}