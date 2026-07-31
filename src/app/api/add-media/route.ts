import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { jewelry_id, url, media_type } = await req.json();
    if (!jewelry_id || !url) return NextResponse.json({ error: 'jewelry_id ve url zorunludur.' }, { status: 400 });

    const { data: existing } = await supabaseAdmin
      .from('jewelry_media')
      .select('id')
      .eq('jewelry_id', jewelry_id)
      .order('order_index', { ascending: false })
      .limit(1);

    const order_index = existing && existing.length > 0 ? (existing[0] as any).order_index + 1 : 0;

    const { data, error } = await supabaseAdmin
      .from('jewelry_media')
      .insert({ jewelry_id, url, media_type: media_type || 'image', order_index })
      .select()
      .single();

    if (error) throw error;

    // İlk medya ise jewelries.media_url'i de güncelle (geriye dönük uyumluluk)
    if (order_index === 0) {
      await supabaseAdmin.from('jewelries').update({ media_url: url }).eq('id', jewelry_id);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
