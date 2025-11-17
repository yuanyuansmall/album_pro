import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

const run = async () => {
  try {
    const id = randomUUID();

    const username = 'testcli_' + id.slice(0, 8);
    const password = '';

    console.log('Creating test profile with id:', id);
    // 注意：profiles.password 为 NOT NULL，根据 schema 我们写入空字符串以满足约束（仅作测试）
    const payload = [{ id, username, password }];

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Upsert user error:', error);
      process.exit(1);
    }

    console.log('Test user upserted:', data);
    console.log('\nNOTE: This creates a row in your `user` table for testing only.');
    console.log('Use this id to test album inserts:', id);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
};

run();
