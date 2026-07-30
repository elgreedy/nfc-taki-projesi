import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id, media_url } = await req.json();
    if (!id) return NextResponse.json({ error: 'id zorunludur.' }, { status: 400 });

    if (media_url) {
      const path = media_url.split('/jewelry-media/')[1];
      if (path) {
        await supabaseAdmin.storage.from('jewelry-media').remove([path]);
      }
    }

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
