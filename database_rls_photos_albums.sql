-- SQL: 启用 RLS 并为 albums/photos 创建策略
-- 在 Supabase Console -> SQL Editor 中运行此文件（以 admin 身份执行）

-- 启用扩展（如需）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 启用 RLS（如果尚未启用）
ALTER TABLE IF EXISTS public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.photos ENABLE ROW LEVEL SECURITY;

-- albums 策略：认证用户可插入属于自己的 album；公开相册可被任何人查询
DROP POLICY IF EXISTS policy_albums_insert_owner ON public.albums;
CREATE POLICY policy_albums_insert_owner
  ON public.albums
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS policy_albums_select_public_or_owner ON public.albums;
CREATE POLICY policy_albums_select_public_or_owner
  ON public.albums
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- photos 策略：认证用户可插入/读取属于自己的照片
DROP POLICY IF EXISTS policy_photos_insert_owner ON public.photos;
CREATE POLICY policy_photos_insert_owner
  ON public.photos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS policy_photos_select_owner ON public.photos;
CREATE POLICY policy_photos_select_owner
  ON public.photos
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS policy_photos_update_owner ON public.photos;
CREATE POLICY policy_photos_update_owner
  ON public.photos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS policy_photos_delete_owner ON public.photos;
CREATE POLICY policy_photos_delete_owner
  ON public.photos
  FOR DELETE
  USING (auth.uid() = user_id);

-- 可选：查看已创建 policy
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('albums','photos');

-- 注意：在启用 RLS 后，前端必须在认证用户上下文中执行插入（auth.uid() 与 user_id 匹配）。
