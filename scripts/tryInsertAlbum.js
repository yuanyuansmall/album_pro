import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

const run = async () => {
  try {
    console.log('Looking for an existing user id in `profiles` table...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (usersError) {
      console.error('Error reading `user` table:', usersError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.error('No users found in `profiles` table. Cannot insert album without valid user_id.');
      process.exit(1);
    }

    const userId = users[0].id;
    console.log('Using user id:', userId);

    console.log('Attempting to insert album...');
    const payload = [{ user_id: userId, title: '测试相册-cli', cover_url: null }];

    const { data, error } = await supabase
      .from('albums')
      .insert(payload)
      .select();

    if (error) {
      console.error('Insert error object:', error);
      // If the error has more details (PostgREST), try a raw fetch to capture response body
      try {
        const endpoint = `${url.replace(/\/$/, '')}/rest/v1/albums`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        console.log('Raw HTTP status:', res.status);
        const text = await res.text();
        console.log('Raw response body:', text);
      } catch (fetchErr) {
        console.error('Raw fetch failed:', fetchErr);
      }
      process.exit(1);
    }

    console.log('Insert succeeded, returned:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
};

run();
