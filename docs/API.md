# API 文档

## 概述

相册管理系统使用 Supabase 作为后端。所有数据操作都通过 Supabase JavaScript 客户端进行。

## 基础配置

### 初始化 Supabase 客户端

```javascript
import { supabase } from './supabaseClient';
```

## 认证 API

### 用户注册

```javascript
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

**参数**:
- `email` (string): 用户邮箱
- `password` (string): 密码

**响应**:
- `data`: 包含用户信息的对象
- `error`: 错误信息（如果有）

### 用户登录

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

**返回**:
- `data.session`: 包含认证令牌的会话对象

### 获取当前会话

```javascript
const { data: { session } } = await supabase.auth.getSession();
```

### 监听认证状态变化

```javascript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event);
    console.log('Session:', session);
  }
);

// 取消订阅
subscription?.unsubscribe();
```

### 用户登出

```javascript
const { error } = await supabase.auth.signOut();
```

## 相册 API

### 获取用户的所有相册

```javascript
const { data, error } = await supabase
  .from('专辑')
  .select('id, 标题, 封面图址')
  .eq('用户身份', userId)
  .order('创建于', { ascending: false });
```

**响应示例**:
```javascript
[
  {
    id: 'uuid-1',
    标题: '我的相册',
    封面图址: 'https://...'
  }
]
```

### 创建相册

```javascript
const { data, error } = await supabase
  .from('专辑')
  .insert([
    {
      用户身份: userId,
      标题: '新相册',
      封面图址: null,
      标签: 'family',
    }
  ])
  .select()
  .single();
```

**参数**:
- `用户身份` (UUID): 用户 ID
- `标题` (string): 相册名称，必需
- `封面图址` (string): 封面图片 URL，可选
- `标签` (string): 标签，可选

### 更新相册

```javascript
const { error } = await supabase
  .from('专辑')
  .update({
    标题: '更新后的名称',
    封面图址: 'https://...',
  })
  .eq('id', albumId);
```

### 删除相册

```javascript
const { error } = await supabase
  .from('专辑')
  .delete()
  .eq('id', albumId);
```

**注意**: 删除相册会级联删除所有包含的照片

### 获取相册详情

```javascript
const { data, error } = await supabase
  .from('专辑')
  .select('*')
  .eq('id', albumId)
  .single();
```

## 照片 API

### 获取相册中的所有照片

```javascript
const { data, error } = await supabase
  .from('照片')
  .select('*')
  .eq('专辑ID', albumId)
  .order('上传于', { ascending: false });
```

**响应示例**:
```javascript
[
  {
    id: 'uuid-1',
    专辑ID: 'album-uuid',
    用户身份: 'user-uuid',
    网址: 'https://...',
    文件名: 'photo.jpg',
    上传于: '2024-01-01T12:00:00Z'
  }
]
```

### 添加照片记录

```javascript
const { data, error } = await supabase
  .from('照片')
  .insert([
    {
      专辑ID: albumId,
      用户身份: userId,
      网址: publicUrl,
      文件名: file.name,
    }
  ])
  .select()
  .single();
```

**参数**:
- `专辑ID` (UUID): 所属相册 ID
- `用户身份` (UUID): 用户 ID
- `网址` (string): 照片公开 URL
- `文件名` (string): 原始文件名

### 删除照片

```javascript
const { error } = await supabase
  .from('照片')
  .delete()
  .eq('id', photoId);
```

### 搜索照片

```javascript
const { data, error } = await supabase
  .from('照片')
  .select('*')
  .eq('专辑ID', albumId)
  .ilike('文件名', `%${query}%`);
```

## 存储 API

### 上传照片

```javascript
const { data, error } = await supabase.storage
  .from('photos')
  .upload(`${userId}/${albumId}/${fileName}`, file);
```

**参数**:
- `path` (string): 存储路径 `{userId}/{albumId}/{fileName}`
- `file` (File): 文件对象

**响应**:
```javascript
{
  path: 'user-id/album-id/photo.jpg',
  fullPath: 'photos/user-id/album-id/photo.jpg'
}
```

### 获取公开 URL

```javascript
const { data } = supabase.storage
  .from('photos')
  .getPublicUrl(`${userId}/${albumId}/${fileName}`);

console.log(data.publicUrl);
// 输出: https://project.supabase.co/storage/v1/object/public/photos/...
```

### 删除照片文件

```javascript
const { error } = await supabase.storage
  .from('photos')
  .remove([`${userId}/${albumId}/${fileName}`]);
```

### 列出文件

```javascript
const { data, error } = await supabase.storage
  .from('photos')
  .list(`${userId}/${albumId}`);
```

## 实时订阅

### 监听相册变化

```javascript
const subscription = supabase
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: '专辑',
      filter: `用户身份=eq.${userId}`,
    },
    (payload) => {
      console.log('Album change:', payload);
    }
  )
  .subscribe();

// 取消订阅
subscription.unsubscribe();
```

### 监听照片变化

```javascript
const subscription = supabase
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: '照片',
      filter: `专辑ID=eq.${albumId}`,
    },
    (payload) => {
      console.log('Photo change:', payload);
    }
  )
  .subscribe();
```

## 错误处理

### 基本错误处理

```javascript
try {
  const { data, error } = await supabase
    .from('专辑')
    .select('*');

  if (error) {
    console.error('错误代码:', error.code);
    console.error('错误信息:', error.message);
    throw error;
  }

  return data;
} catch (error) {
  console.error('操作失败:', error.message);
}
```

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `PGRST116` | 无权限访问 | 检查 RLS 策略 |
| `invalid_grant` | 认证失败 | 检查邮箱和密码 |
| `duplicate_key` | 唯一性约束冲突 | 检查相册名称是否重复 |
| `storage_object_not_found` | 文件不存在 | 检查文件路径 |

## 性能优化

### 分页查询

```javascript
const pageSize = 20;
const page = 0;

const { data, error } = await supabase
  .from('照片')
  .select('*', { count: 'exact' })
  .eq('专辑ID', albumId)
  .range(page * pageSize, (page + 1) * pageSize - 1);
```

### 选择特定字段

```javascript
// 只获取需要的字段，减少数据传输
const { data } = await supabase
  .from('照片')
  .select('id, 网址, 上传于')
  .eq('专辑ID', albumId);
```

### 缓存策略

```javascript
const cacheKey = `album_${albumId}`;
const cached = localStorage.getItem(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const { data } = await supabase
  .from('照片')
  .select('*')
  .eq('专辑ID', albumId);

localStorage.setItem(cacheKey, JSON.stringify(data));
return data;
```

## 完整示例

### 创建相册并上传照片

```javascript
import { supabase } from './supabaseClient';

async function createAlbumWithPhoto(userId, albumTitle, photoFile) {
  try {
    // 1. 创建相册
    const { data: album, error: albumError } = await supabase
      .from('专辑')
      .insert([{ 用户身份: userId, 标题: albumTitle }])
      .select()
      .single();

    if (albumError) throw albumError;

    // 2. 上传照片文件
    const fileName = `${Date.now()}_${photoFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(`${userId}/${album.id}/${fileName}`, photoFile);

    if (uploadError) throw uploadError;

    // 3. 获取公开 URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(`${userId}/${album.id}/${fileName}`);

    // 4. 添加照片记录到数据库
    const { error: photoError } = await supabase
      .from('照片')
      .insert([
        {
          专辑ID: album.id,
          用户身份: userId,
          网址: publicUrl,
          文件名: photoFile.name,
        }
      ]);

    if (photoError) throw photoError;

    return { album, photoUrl: publicUrl };
  } catch (error) {
    console.error('操作失败:', error);
    throw error;
  }
}

export default createAlbumWithPhoto;
```

## 类型定义（TypeScript）

```typescript
interface Album {
  id: string;
  用户身份: string;
  标题: string;
  封面图址?: string;
  标签?: string;
  创建于: string;
}

interface Photo {
  id: string;
  专辑ID: string;
  用户身份: string;
  网址: string;
  文件名: string;
  上传于: string;
  标签?: string;
}

interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}
```

## 限制和配额

| 项目 | 限制 | 说明 |
|------|------|------|
| 文件大小 | 50 MB | 单个文件最大大小 |
| API 请求 | 无限制* | 付费计划 |
| 存储空间 | 1 GB* | 免费计划 |
| 并发连接 | 100 | 单个项目 |

*免费计划限制

## 参考资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
