import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const fetchRest = async (table) => {
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${table}?select=*`;
  console.log('\nRequesting', endpoint);
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json'
      }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text.slice(0, 1000));
  } catch (e) {
    console.error('Fetch error:', e);
  }
};

(async () => {
  await fetchRest('albums');
  await fetchRest('photos');
})();
