import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { deleteFromR2 } from '@/lib/r2';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id, media_url } = await req.json();
    if (!id) return NextResponse.json({ error: 'id zorunludur.' }, { status: 400 });

    // 1. jewelry_media tablosundaki tüm medyaları getir
    const { data: mediaItems } = await supabaseAdmin
      .from('jewelry_media')
      .select('url')
      .eq('jewelry_id', id);

    // 2. Her birini R2'den sil
    if (mediaItems && mediaItems.length > 0) {
      await Promise.all(
        mediaItems
          .filter((m) => m.url)
          .map((m) => deleteFromR2(m.url).catch(() => {}))
      );
    }

    // 3. Legacy media_url varsa ve listede yoksa onu da R2'den sil
    if (media_url) {
      const isInList = mediaItems?.some((m) => m.url === media_url);
      if (!isInList) {
        await deleteFromR2(media_url).catch(() => {});
      }
    }

    // 4. jewelry_media kayıtlarını veritabanından sil
    await supabaseAdmin.from('jewelry_media').delete().eq('jewelry_id', id);

    // 5. jewelries kaydını sil
    const { error } = await supabaseAdmin
      .from('jewelries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}