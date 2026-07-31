const https = require('https');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaG5kbWpweGtvcXBpamlrc3ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI2NTU0OSwiZXhwIjoyMTAwODQxNTQ5fQ.JIYtK_j4PJxRkw1G9tlPtt-uvNw8YKBTtPBL9PQyOSI';

function get(path) {
  return new Promise((resolve, reject) => {
    const req = https.get('https://zshndmjpxkoqpijiksvp.supabase.co' + path, {
      headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
  });
}

get('/rest/v1/jewelries?select=id,title,nfc_tag_id,media_url').then(d => {
  console.log('jewelries:', d);
}).catch(e => console.error(e));
