const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('=== jewelries.media_url ===');
  const { data: j } = await supabase.from('jewelries').select('id, title, media_url');
  for (const row of j || []) {
    console.log(`  ${row.title}: ${row.media_url || '(bos)'}`);
  }

  console.log('\n=== jewelry_media.url ===');
  const { data: m } = await supabase.from('jewelry_media').select('id, jewelry_id, url');
  if (!m || m.length === 0) {
    console.log('  Tablo bos');
  }
  for (const row of m || []) {
    console.log(`  [${row.jewelry_id}] ${row.url}`);
  }
}

check();
