const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: media } = await supabase.from('jewelry_media').select('id, jewelry_id, url, media_type');
  const { data: jewels } = await supabase.from('jewelries').select('id, title, media_url');

  const allUrls = [
    ...(media || []).map(m => ({ source: 'jewelry_media', id: m.id, url: m.url })),
    ...(jewels || []).filter(j => j.media_url).map(j => ({ source: 'jewelries', id: j.id, title: j.title, url: j.media_url })),
  ];

  console.log(`Toplam ${allUrls.length} URL kontrol ediliyor...\n`);

  for (const item of allUrls) {
    try {
      const res = await fetch(item.url, { method: 'HEAD' });
      const ct = res.headers.get('content-type') || 'unknown';
      const ok = res.ok ? 'OK' : `HATA ${res.status}`;
      console.log(`[${ok}] [${ct}] ${item.source} - ${item.title || item.id}`);
      console.log(`       ${item.url}`);
    } catch (err) {
      console.log(`[NETWORK HATA] ${item.source} - ${item.id}`);
      console.log(`       ${item.url}`);
    }
  }
}

check();
