const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaG5kbWpweGtvcXBpamlrc3ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI2NTU0OSwiZXhwIjoyMTAwODQxNTQ5fQ.JIYtK_j4PJxRkw1G9tlPtt-uvNw8YKBTtPBL9PQyOSI', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaG5kbWpweGtvcXBpamlrc3ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI2NTU0OSwiZXhwIjoyMTAwODQxNTQ5fQ.JIYtK_j4PJxRkw1G9tlPtt-uvNw8YKBTtPBL9PQyOSI' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
  });
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ status: res.statusCode, contentType: res.headers['content-type'], contentLength: res.headers['content-length'] });
      res.resume();
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

async function main() {
  const SUPABASE_URL = 'https://zshndmjpxkoqpijiksvp.supabase.co';

  const mediaRes = await httpsGet(`${SUPABASE_URL}/rest/v1/jewelry_media?select=id,jewelry_id,url,media_type`);
  console.log('jewelry_media:', mediaRes.body);

  const jewelryRes = await httpsGet(`${SUPABASE_URL}/rest/v1/jewelry?select=id,title,media_url`);
  console.log('\njewelry:', jewelryRes.body);

  const items = JSON.parse(mediaRes.body);
  for (const item of items) {
    console.log('\nChecking URL:', item.url);
    const result = await checkUrl(item.url);
    console.log('Result:', JSON.stringify(result));
  }
}

main().catch(console.error);
