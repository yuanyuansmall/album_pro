# 📷 相册管理系统 (Album Pro)

一个现代化的相册管理系统，使用 React + Supabase + Netlify 构建。

## 功能特性

- ✅ 用户认证（注册/登录）
- ✅ 创建和管理多个相册
- ✅ 上传和删除照片
- ✅ 图库预览和全屏查看
- ✅ 响应式设计
- ✅ 云端存储

## 技术栈

- **前端框架**: React 18
- **后端服务**: Supabase (PostgreSQL + Auth + Storage)
- **部署平台**: Netlify
- **样式**: CSS3

## 快速开始

### 1. 克隆项目
```bash
cd d:\workspace\album_pro
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置 Supabase

创建 `.env.local` 文件，添加你的 Supabase 凭证：

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 设置数据库

在 Supabase 中执行以下 SQL 创建表：

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 相册表
CREATE TABLE 专辑 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  用户身份 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  标题 TEXT NOT NULL,
  封面图址 TEXT,
  标签 TEXT,
  创建于 TIMESTAMP DEFAULT NOW(),
  UNIQUE(用户身份, 标题)
);

-- 照片表
CREATE TABLE 照片 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  专辑ID UUID NOT NULL REFERENCES 专辑(id) ON DELETE CASCADE,
  用户身份 UUID NOT NULL REFERENCES auth.users(id),
  网址 TEXT NOT NULL,
  文件名 TEXT,
  上传于 TIMESTAMP DEFAULT NOW()
);

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true);
```

### 5. 启动开发服务器

```bash
npm start
```

应用将在 `http://localhost:3000` 运行。

## 部署到 Netlify

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. 连接 Netlify

1. 访问 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择你的 GitHub 仓库
4. 配置构建设置（已在 `netlify.toml` 中配置）
5. 添加环境变量：
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
6. 点击部署

## 项目结构

```
album_pro/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Auth.js
│   │   ├── AlbumList.js
│   │   └── PhotoGallery.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── supabaseClient.js
├── package.json
├── netlify.toml
├── .env.example
└── README.md
```

## 数据库架构

### 专辑表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| 用户身份 | UUID | 用户ID |
| 标题 | TEXT | 相册名称 |
| 封面图址 | TEXT | 封面图片URL |
| 标签 | TEXT | 标签 |
| 创建于 | TIMESTAMP | 创建时间 |

### 照片表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| 专辑ID | UUID | 所属相册ID |
| 用户身份 | UUID | 用户ID |
| 网址 | TEXT | 照片URL |
| 文件名 | TEXT | 原始文件名 |
| 上传于 | TIMESTAMP | 上传时间 |

## 环境变量

| 变量 | 说明 |
|------|------|
| REACT_APP_SUPABASE_URL | Supabase 项目 URL |
| REACT_APP_SUPABASE_ANON_KEY | Supabase 匿名密钥 |

## API 接口

所有通过 Supabase 客户端调用，无需单独的 API 层。

## 安全考虑

- 启用 Supabase RLS（Row Level Security）
- 设置合适的权限策略
- 上传前验证文件类型和大小
- 使用 HTTPS

## 常见问题

### 上传照片失败？
检查 Supabase Storage 配置和权限。

### 环境变量未读取？
确保变量名以 `REACT_APP_` 开头，并重启开发服务器。

### 登录失败？
确认 Supabase 邮件认证已启用。

## 许可证

MIT

## 支持

如有问题或建议，欢迎提交 Issue。
