import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id, media_url } = await req.json();

    if (!id || !media_url) {
      return NextResponse.json({ error: 'id ve media_url zorunludur.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('jewelries')
      .update({ media_url })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
