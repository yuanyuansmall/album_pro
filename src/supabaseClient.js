import { createClient } from '@supabase/supabase-js';

// 读取 Supabase 项目 URL 和匿名密钥（来自 .env.local）
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// 校验：若环境变量未设置，报错提示
if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Missing Supabase environment variables! Please ensure .env.local contains:\n' +
    'REACT_APP_SUPABASE_URL=<your-url>\n' +
    'REACT_APP_SUPABASE_ANON_KEY=<your-key>'
  );
  throw new Error('Supabase configuration is incomplete');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
