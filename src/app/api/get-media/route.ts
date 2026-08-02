import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const jewelry_id = req.nextUrl.searchParams.get('jewelry_id');
  if (!jewelry_id) return NextResponse.json({ error: 'jewelry_id zorunludur.' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('jewelry_media')
    .select('*')
    .eq('jewelry_id', jewelry_id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Add caching headers - cache for 1 hour in CDN and 5 minutes in browser
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  response.headers.set('CDN-Cache-Control', 'max-age=3600');
  return response;
}
