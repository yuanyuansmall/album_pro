# Supabase 配置指南

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - **Project Name**: album-pro
   - **Database Password**: 设置强密码
   - **Region**: 选择最近的地区
4. 点击 "Create new project" 并等待初始化完成

## 步骤 2: 获取项目凭证

1. 进入项目的 **Settings** > **API**
2. 复制以下信息到 `.env.local` 文件：
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`

示例：
```
REACT_APP_SUPABASE_URL=https://xyzproject.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 步骤 3: 创建数据库表

1. 在 Supabase Console 中进入 **SQL Editor**
2. 点击 "New Query"
3. 复制 `database_init.sql` 中的所有 SQL 代码
4. 执行查询

或者手动创建表：

### 创建用户表
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 创建相册表
```sql
CREATE TABLE IF NOT EXISTS public."专辑" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "用户身份" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "标题" TEXT NOT NULL,
  "封面图址" TEXT,
  "标签" TEXT,
  "创建于" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_album_title UNIQUE ("用户身份", "标题")
);
```

### 创建照片表
```sql
CREATE TABLE IF NOT EXISTS public."照片" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "专辑ID" UUID NOT NULL REFERENCES public."专辑"(id) ON DELETE CASCADE,
  "用户身份" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "网址" TEXT NOT NULL,
  "文件名" TEXT,
  "上传于" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 步骤 4: 创建存储桶

1. 在 Supabase Console 中进入 **Storage**
2. 点击 "Create a new bucket"
3. 设置：
   - **Name**: photos
   - **Public bucket**: ✓ (勾选)
   - **File size limit**: 50 MB
4. 点击 "Create bucket"

## 步骤 5: 设置存储策略

在 Storage 中设置访问策略：

1. 选择 "photos" 存储桶
2. 点击 "Policies"
3. 点击 "New policy"
4. 选择 "For query with Authenticated users can upload files"
5. 点击 "Review"
6. 点击 "Save policy"

## 步骤 6: 启用邮件认证

1. 进入 **Authentication** > **Providers**
2. 确保 **Email** 提供程序已启用
3. 进入 **Email Templates** 确认邮件模板

## 步骤 7: 配置应用

1. 创建 `.env.local` 文件：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 并填入你的 Supabase 凭证

## 步骤 8: 测试连接

```bash
npm start
```

访问 http://localhost:3000，尝试注册并创建相册

## 常见问题

### 表已存在错误
添加 `IF NOT EXISTS` 到 CREATE TABLE 语句

### RLS 阻止访问
确保 RLS 策略已正确设置，特别是检查 `auth.uid()` 的值

### 存储访问被拒绝
确保存储桶是公开的，并且策略允许上传

### 认证失败
检查邮件提供程序设置和 JWT 密钥

## 生产环境检查清单

- [ ] RLS 已启用所有表
- [ ] 存储策略已设置
- [ ] 邮件认证已配置
- [ ] SSL 已启用
- [ ] 备份计划已配置
- [ ] 监控告警已设置
- [ ] 环境变量已在 Netlify 中配置

## 有用的资源

- [Supabase 文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Supabase 行级安全](https://supabase.com/docs/guides/auth/row-level-security)
