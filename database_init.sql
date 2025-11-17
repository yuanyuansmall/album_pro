-- ================================
-- 相册管理系统数据库初始化脚本
-- ================================

-- 1. 创建用户表（可选）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建专辑表
CREATE TABLE IF NOT EXISTS public."专辑" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "用户身份" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "标题" TEXT NOT NULL,
  "封面图址" TEXT,
  "标签" TEXT,
  "创建于" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "更新于" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_album_title UNIQUE ("用户身份", "标题")
);

-- 3. 创建照片表
CREATE TABLE IF NOT EXISTS public."照片" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "专辑ID" UUID NOT NULL REFERENCES public."专辑"(id) ON DELETE CASCADE,
  "用户身份" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "网址" TEXT NOT NULL,
  "文件名" TEXT,
  "上传于" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "标签" TEXT
);

-- 4. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_album_user_id ON public."专辑"("用户身份");
CREATE INDEX IF NOT EXISTS idx_photo_album_id ON public."照片"("专辑ID");
CREATE INDEX IF NOT EXISTS idx_photo_user_id ON public."照片"("用户身份");

-- 5. 启用行级安全(RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."专辑" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."照片" ENABLE ROW LEVEL SECURITY;

-- 6. 设置 RLS 策略 - 用户表
CREATE POLICY "users_can_read_their_own_data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_insert_their_own_data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_update_their_own_data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 7. 设置 RLS 策略 - 相册表
CREATE POLICY "albums_can_be_read_by_owner" ON public."专辑"
  FOR SELECT USING (auth.uid() = "用户身份");

CREATE POLICY "albums_can_be_created_by_users" ON public."专辑"
  FOR INSERT WITH CHECK (auth.uid() = "用户身份");

CREATE POLICY "albums_can_be_updated_by_owner" ON public."专辑"
  FOR UPDATE USING (auth.uid() = "用户身份");

CREATE POLICY "albums_can_be_deleted_by_owner" ON public."专辑"
  FOR DELETE USING (auth.uid() = "用户身份");

-- 8. 设置 RLS 策略 - 照片表
CREATE POLICY "photos_can_be_read_by_owner" ON public."照片"
  FOR SELECT USING (auth.uid() = "用户身份");

CREATE POLICY "photos_can_be_created_by_users" ON public."照片"
  FOR INSERT WITH CHECK (auth.uid() = "用户身份");

CREATE POLICY "photos_can_be_deleted_by_owner" ON public."照片"
  FOR DELETE USING (auth.uid() = "用户身份");

-- 9. 创建存储桶（如果不存在）
-- 在 Supabase Console 中手动创建 'photos' 存储桶，或使用以下命令
-- INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
-- VALUES (
--   'photos',
--   'photos',
--   true,
--   false,
--   52428800,
--   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
-- )
-- ON CONFLICT DO NOTHING;

-- 10. 创建存储桶策略
-- 注意：这些需要在 Supabase Console 中的 Storage 部分设置

-- 授予公开读取权限
-- CREATE POLICY "Public Access" ON storage.objects
--   FOR SELECT USING (bucket_id = 'photos');

-- 授予认证用户上传权限
-- CREATE POLICY "Authenticated users can upload photos" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'photos' AND
--     auth.role() = 'authenticated'
--   );

-- 授予认证用户删除权限
-- CREATE POLICY "Users can delete their own photos" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'photos' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ================================
-- 完成！
-- ================================
-- 数据表已创建，RLS 已启用。
-- 请在 Supabase Console 的 Storage 部分手动创建 'photos' 存储桶，并设置相应的访问策略。
