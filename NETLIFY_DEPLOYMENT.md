# Netlify 部署指南

## 前提条件

- GitHub 账户
- Netlify 账户（可免费注册）
- 项目已推送到 GitHub

## 步骤 1: 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit: Album Pro - 相册管理系统"
git branch -M main
git remote add origin https://github.com/<your-username>/album-pro.git
git push -u origin main
```

## 步骤 2: 连接到 Netlify

### 方法 A: 通过 Netlify 网站

1. 访问 [Netlify](https://app.netlify.com)
2. 点击 "Add new site" > "Import an existing project"
3. 选择 "GitHub"
4. 搜索并选择 "album-pro" 仓库
5. 点击 "Deploy site"

### 方法 B: 使用 Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
```

## 步骤 3: 配置构建设置

Netlify 会自动检测到 `netlify.toml` 配置文件。

**构建配置**:
- Build command: `npm run build`
- Publish directory: `build/`

## 步骤 4: 添加环境变量

1. 进入 Netlify Dashboard
2. 选择你的站点
3. 进入 **Site settings** > **Build & deploy** > **Environment**
4. 点击 "Edit variables"
5. 添加以下环境变量：

```
REACT_APP_SUPABASE_URL = https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY = your-anon-key
```

## 步骤 5: 部署

### 自动部署

推送到 GitHub main 分支会自动触发构建：

```bash
git add .
git commit -m "Update: Add new features"
git push origin main
```

### 手动部署

```bash
netlify deploy --prod
```

## 步骤 6: 配置自定义域名（可选）

1. 在 Netlify 中进入 **Site settings** > **Domain settings**
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按照说明配置 DNS 记录
5. Netlify 会自动配置 SSL 证书

## 性能优化

### 启用缓存

在 `netlify.toml` 中已配置：

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600, must-revalidate"
```

### 启用 Gzip 压缩

Netlify 自动启用

### 监控性能

1. 进入 **Analytics** 选项卡
2. 查看页面加载时间和流量统计

## 部署验证

1. 访问你的 Netlify URL（例如：https://album-pro-xyz.netlify.app）
2. 测试以下功能：
   - 注册/登录
   - 创建相册
   - 上传照片
   - 删除操作

## 常见问题

### 构建失败

检查构建日志：
1. 进入 **Deploys**
2. 点击失败的部署
3. 查看 "Build log"

常见原因：
- 缺少环境变量
- 依赖版本不兼容
- 代码语法错误

### 环境变量未加载

- 确保变量名以 `REACT_APP_` 开头
- 重新部署后生效
- 检查构建日志中的环境变量值

### 登录不工作

- 确认 Supabase 凭证正确
- 检查 CORS 设置
- 验证 Supabase 认证提供程序已启用

### 图片上传失败

- 检查存储桶是否是公开的
- 验证存储策略是否允许上传
- 确认文件大小不超过限制

## 监控和日志

### 查看日志

```bash
netlify logs:functions
```

### 启用分析

在 Netlify Dashboard 中启用 Analytics，监控用户行为

## 回滚部署

1. 进入 **Deploys**
2. 找到之前的稳定版本
3. 点击 "Restore"

## 高级配置

### 自定义重定向规则

编辑 `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 添加构建前/后钩子

```toml
[build]
  command = "npm run build"
  
[build.lifecycle]
  pre = "echo 'Building...'"
  post = "echo 'Built successfully!'"
```

## 成本估算

- 免费计划：100 GB 带宽/月
- Pro 计划：$19/月（1 TB 带宽/月）
- 高级计划：联系销售

## 有用的资源

- [Netlify 文档](https://docs.netlify.com)
- [Netlify CLI 文档](https://cli.netlify.com)
- [Netlify 部署最佳实践](https://docs.netlify.com/site-configuration/overview/)

## 下一步

1. 配置自定义域名
2. 设置 CDN 缓存规则
3. 启用分析和监控
4. 配置持续集成测试
5. 设置日志警报
