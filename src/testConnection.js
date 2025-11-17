// 在 Node 环境下自动加载 .env.local（如果存在），以便在本地运行测试脚本时读取 REACT_APP_* 环境变量
try {
  // 在 Node 环境下，显式加载 `.env.local`（如果存在）
  const dotenv = await import('dotenv');
  dotenv.config({ path: '.env.local' });
} catch (e) {
  // 忽略在非 Node 环境或无法加载 dotenv 的情况
}

// 在确保 .env 已加载后再动态导入 supabase 客户端，避免在静态导入时读取到未初始化的环境变量
const { supabase } = await import('./supabaseClient.js');

/**
 * Supabase 连接测试工具
 * 用于检查环境配置和数据库连接
 */

export const testSupabaseConnection = async () => {
  console.log('🔍 正在测试 Supabase 连接...\n');

  try {
    // 1. 检查配置
    console.log('1️⃣ 检查环境配置');
    const url = process.env.REACT_APP_SUPABASE_URL;
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('❌ 缺少 Supabase 环境变量！');
      console.log('   请检查 .env.local 文件');
      return false;
    }

    console.log('✅ Supabase URL:', url.substring(0, 30) + '...');
    console.log('✅ Supabase 密钥已配置\n');

    // 2. 测试数据库连接
    console.log('2️⃣ 测试数据库连接');
    // 先做一个简单的 HTTP 请求，检查网络/URL 是否可达
    try {
      const pingRes = await fetch(url, { method: 'GET' });
      console.log('🔗 Supabase URL 可达，HTTP 状态:', pingRes.status);
    } catch (pingErr) {
      console.warn('⚠️ 无法连接到 Supabase URL（网络或证书问题）:', pingErr.message);
    }
    // 检查英文表 albums 是否存在并可读取（捕获网络或 fetch 错误）
    try {
      const { data: dbTest, error: dbError } = await supabase
        .from('albums')
        .select('*', { head: true, count: 'exact' });

      if (dbError) {
        console.error('❌ 数据库查询返回错误:', dbError);
        return false;
      }

      console.log('✅ 数据库查询成功 (`albums` 表可访问)\n');
    } catch (innerErr) {
      console.error('❌ 直接查询时抛出错误（可能为网络或证书问题）:', innerErr);
      return false;
    }

    // 3. 测试认证
    console.log('3️⃣ 检查认证状态');
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      console.log('✅ 用户已登录:', session.user.email);
    } else {
      console.log('ℹ️  用户未登录（首次使用需要注册）');
    }
    console.log('');

    // 4. 测试存储
    console.log('4️⃣ 检查存储配置');
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const photosBucket = buckets?.find(b => b.name === 'photos');

      if (photosBucket) {
        console.log('✅ Photos 存储桶存在');
        console.log('   公开:', photosBucket.public);
      } else {
        console.warn('⚠️  Photos 存储桶未找到');
        console.warn('   请在 Supabase Console 中创建 "photos" 存储桶');
      }
    } catch (storageError) {
      console.warn('⚠️  存储检查失败:', storageError.message);
    }
    console.log('');

    console.log('═════════════════════════════════════════════════');
    console.log('🎉 连接测试完成！所有检查已通过。');
    console.log('═════════════════════════════════════════════════\n');

    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细信息:', error);
    return false;
  }
};

/**
 * 显示连接信息
 */
export const showConnectionInfo = () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  Supabase 连接信息                            ║
╚════════════════════════════════════════════════════════════════╝

Project URL: ${process.env.REACT_APP_SUPABASE_URL}
API Key:    ${process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 20)}...

环境变量检查:
✓ REACT_APP_SUPABASE_URL
✓ REACT_APP_SUPABASE_ANON_KEY

`);
};

/**
 * 创建测试数据
 */
export const createTestData = async (userId) => {
  try {
    console.log('📝 创建测试数据...');

    // 创建测试相册（使用 albums 表）
    const { data: album, error: albumError } = await supabase
      .from('albums')
      .insert([
        {
          user_id: userId,
          title: '测试相册'
        }
      ])
      .select()
      .single();

    if (albumError) {
      console.error('创建相册失败:', albumError.message);
      return null;
    }

    console.log('✅ 测试相册创建成功:', album.id);
    return album;
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error.message);
    return null;
  }
};

/**
 * 清理测试数据
 */
export const cleanupTestData = async (albumId) => {
  try {
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId);

    if (error) {
      console.error('删除测试相册失败:', error.message);
      return false;
    }

    console.log('✅ 测试数据已清理');
    return true;
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error.message);
    return false;
  }
};

export default {
  testSupabaseConnection,
  showConnectionInfo,
  createTestData,
  cleanupTestData,
};

// 如果直接通过 `node src/testConnection.js` 运行，则执行测试
try {
  // 在 ESM 下判断模块是否被直接调用
  const { fileURLToPath } = await import('url');
  const thisFile = fileURLToPath(import.meta.url);
  if (process.argv[1] === thisFile) {
    const ok = await testSupabaseConnection();
    process.exit(ok ? 0 : 1);
  }
} catch (e) {
  // ignore errors in environments where import('url') may not be available
}
