import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const endpoint = `${url.replace(/\/$/, '')}/storage/v1/buckets`;

(async () => {
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    console.log('Status:', res.status);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('Buckets:', JSON.stringify(json, null, 2));
      const exists = Array.isArray(json) && json.some(b => b.name === 'photos');
      console.log('\nphotos bucket exists:', exists);
    } catch (e) {
      console.log('Response body:', text.slice(0, 2000));
    }
  } catch (e) {
    console.error('Fetch failed:', e);
  }
})();