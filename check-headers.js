const https = require('https');

const url = 'https://nfc-taki-projesi-taki8.vercel.app/taki/asda';
https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('--- Headers ---');
  Object.entries(res.headers).forEach(([k, v]) => console.log(k + ':', v));
});

// Also check R2 URL headers
const r2url = 'https://placehold.co/1200x600/e2e8f0/1e293b?text=A_test_image_file_named__1753735680459_test_jpg__l';
https.get(r2url, (res) => {
  console.log('\n--- R2 URL Headers ---');
  console.log('Status:', res.statusCode);
  Object.entries(res.headers).forEach(([k, v]) => console.log(k + ':', v));
});
