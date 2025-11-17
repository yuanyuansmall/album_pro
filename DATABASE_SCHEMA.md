# 项目完整文档索引

## 📚 文档导航

### 快速开始
1. **[CHECKLIST.md](./CHECKLIST.md)** - 快速启动检查清单
2. **[README.md](./README.md)** - 项目主文档

### 部署和配置
1. **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase 配置指南
2. **[NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)** - Netlify 部署指南
3. **[netlify.toml](./netlify.toml)** - Netlify 构建配置

### 开发文档
1. **[docs/API.md](./docs/API.md)** - 完整 API 文档
2. **[database_init.sql](./database_init.sql)** - 数据库初始化脚本

### 配置文件
1. **[.env.example](./.env.example)** - 环境变量模板
2. **[package.json](./package.json)** - 项目依赖配置
3. **[.gitignore](./.gitignore)** - Git 忽略规则

## 🗂️ 项目结构

```
album-pro/
│
├── 📁 public/
│   └── index.html              # HTML 入口页面
│
├── 📁 src/
│   ├── 📁 components/
│   │   ├── Auth.js            # 认证组件（登录/注册）
│   │   ├── Auth.css
│   │   ├── AlbumList.js       # 相册列表组件
│   │   ├── AlbumList.css
│   │   ├── PhotoGallery.js    # 照片库组件
│   │   └── PhotoGallery.css
│   ├── App.js                 # 主应用组件
│   ├── App.css                # 全局样式
│   ├── index.js               # React 应用入口
│   ├── supabaseClient.js      # Supabase 客户端配置
│   └── testConnection.js      # 连接测试工具
│
├── 📁 docs/
│   └── API.md                 # API 完整文档
│
├── 📋 配置文件
│   ├── .env.example
│   ├── .gitignore
│   ├── netlify.toml
│   └── package.json
│
├── 📝 说明文档
│   ├── README.md
│   ├── SUPABASE_SETUP.md
│   ├── NETLIFY_DEPLOYMENT.md
│   ├── CHECKLIST.md
│   └── DATABASE_SCHEMA.md (本文件)
│
└── 📝 其他
    ├── database_init.sql
    └── QUICKSTART.js
```

## 🎯 功能模块说明

### 认证模块 (Auth)
**文件**: `src/components/Auth.js`

**功能**:
- 用户注册
- 用户登录
- 邮件验证
- 密码复位

**组件接口**: 无 props（顶级组件）

### 相册管理 (AlbumList)
**文件**: `src/components/AlbumList.js`

**功能**:
- 显示用户的所有相册
- 创建新相册
- 删除相册
- 选择相册

**Props**:
```javascript
{
  user: Object,              // 当前用户对象
  selectedAlbum: Object,     // 选中的相册
  onSelectAlbum: Function    // 选择相册回调
}
```

### 照片库 (PhotoGallery)
**文件**: `src/components/PhotoGallery.js`

**功能**:
- 显示相册中的照片
- 上传新照片
- 删除照片
- 全屏查看照片

**Props**:
```javascript
{
  album: Object,    // 相册对象
  user: Object      // 用户对象
}
```

## 🗄️ 数据库表结构

### 专辑表 (Albums)
```sql
CREATE TABLE "专辑" (
  id UUID PRIMARY KEY,
  用户身份 UUID NOT NULL,     -- 用户 ID (FK)
  标题 TEXT NOT NULL,         -- 相册名称
  封面图址 TEXT,              -- 封面图片 URL
  标签 TEXT,                  -- 标签
  创建于 TIMESTAMP            -- 创建时间
);

-- 索引
CREATE INDEX idx_album_user_id ON "专辑"("用户身份");
```

### 照片表 (Photos)
```sql
CREATE TABLE "照片" (
  id UUID PRIMARY KEY,
  专辑ID UUID NOT NULL,       -- 相册 ID (FK)
  用户身份 UUID NOT NULL,     -- 用户 ID (FK)
  网址 TEXT NOT NULL,         -- 照片 URL
  文件名 TEXT,                -- 原始文件名
  上传于 TIMESTAMP            -- 上传时间
);

-- 索引
CREATE INDEX idx_photo_album_id ON "照片"("专辑ID");
CREATE INDEX idx_photo_user_id ON "照片"("用户身份");
```

## 🔌 API 接口总览

### 认证接口
```javascript
// 注册
supabase.auth.signUp({ email, password })

// 登录
supabase.auth.signInWithPassword({ email, password })

// 登出
supabase.auth.signOut()

// 获取会话
supabase.auth.getSession()

// 监听状态变化
supabase.auth.onAuthStateChange()
```

### 相册接口
```javascript
// 获取相册列表
supabase.from('专辑').select('*')

// 创建相册
supabase.from('专辑').insert([...])

// 更新相册
supabase.from('专辑').update({...})

// 删除相册
supabase.from('专辑').delete()
```

### 照片接口
```javascript
// 获取照片列表
supabase.from('照片').select('*')

// 添加照片记录
supabase.from('照片').insert([...])

// 删除照片记录
supabase.from('照片').delete()

// 上传文件
supabase.storage.from('photos').upload()

// 获取公开 URL
supabase.storage.from('photos').getPublicUrl()

// 删除文件
supabase.storage.from('photos').remove()
```

## 🎨 样式系统

### 颜色方案
```css
-- 主颜色: #667eea (紫色)
-- 辅色: #764ba2 (深紫)
-- 背景: #f5f5f5
-- 文本: #333
```

### 响应式设计
- 移动优先
- Flexbox 布局
- CSS Grid 用于照片库

## 🔐 安全特性

1. **行级安全 (RLS)**: 确保用户只能访问自己的数据
2. **认证**: 使用 Supabase Auth（基于 JWT）
3. **存储策略**: 限制文件上传和删除权限
4. **环境变量**: 敏感信息存储在 .env.local

## 📦 依赖列表

### 核心依赖
- `react@18.2.0` - UI 框架
- `react-dom@18.2.0` - React DOM 渲染
- `@supabase/supabase-js@2.38.0` - Supabase 客户端
- `axios@1.6.0` - HTTP 客户端

### 开发工具
- `react-scripts@5.0.1` - Create React App 脚本

## 🚀 部署清单

### 前置要求
- [ ] GitHub 账户和仓库
- [ ] Netlify 账户
- [ ] Supabase 项目

### 部署步骤
1. [ ] 推送代码到 GitHub
2. [ ] 连接 Netlify
3. [ ] 设置环境变量
4. [ ] 自动部署
5. [ ] 配置自定义域名

## 🧪 测试方案

### 单元测试
- 待实现

### 集成测试
- 待实现

### 手动测试
1. 注册和登录
2. 创建和删除相册
3. 上传和删除照片
4. 响应式设计测试

## 📊 性能指标

目标:
- 首屏加载时间: < 3s
- 交互响应时间: < 200ms
- Lighthouse 评分: > 90

## 🔄 更新日志

### v1.0.0 (初始版本)
- ✅ 用户认证
- ✅ 相册管理
- ✅ 照片上传和删除
- ✅ 响应式设计
- ✅ Netlify 部署

### 计划中的功能
- [ ] 照片编辑
- [ ] 相册分享
- [ ] 照片搜索
- [ ] 标签功能
- [ ] 评论和点赞
- [ ] 深色模式

## 📞 支持和反馈

- GitHub Issues: [项目 Issues](https://github.com/your-username/album-pro/issues)
- 文档: 本文件
- Supabase 文档: https://supabase.com/docs

---

**最后更新**: 2024-11-17
**维护者**: Album Pro 团队
