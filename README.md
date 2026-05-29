# Hermes Diary ✦

> **个人博客网站** — 3D 地球毛玻璃背景 + 管理后台 + 跨平台同步

一个优雅的个人内容管理系统，支持博客、图片册、视频三大模块。拥有令人惊叹的 3D 交互式地球背景，毛玻璃 UI 设计，以及完整的后台管理系统。

---

## ✨ 功能特性

### 🌐 网站前台
- **3D 交互地球** — 实时渲染的写实地球，带星空粒子，鼠标拖拽旋转互动
- **毛玻璃设计** — 全站 frosted glass 毛玻璃效果，高斯模糊背景
- **三模块内容** — 博客文章 / 图片图册 / 视频库
- **响应式适配** — 手机 + 平板 + 电脑完美适配

### ⚙️ 管理后台
- **Markdown 编辑器** — 支持实时预览、图片上传
- **媒体管理** — 图片批量上传、创建图册
- **内容管理** — 文章发布/草稿切换、标签管理
- **系统设置** — 网站信息、第三方平台 API 配置

### 🔄 跨平台同步 *(预留接口)*
- **𝕏 (Twitter)** — 自动发布到 X
- **微信公众号** — 自动同步到公众号文章
- **币安广场** — 自动同步内容

---

## 🚀 快速部署

### 1️⃣ 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xuxiaominger/hermes-diary)

**或者手动部署：**
1. Fork 这个仓库
2. 在 [Vercel](https://vercel.com) 点击 "Add New → Project"
3. 选择你的仓库
4. 点击 "Deploy"

### 2️⃣ 配置 Supabase 数据库

1. 在 [Supabase](https://supabase.com) 注册免费账号
2. 创建一个新项目
3. 进入 **SQL Editor**，粘贴并运行 `supabase-schema.sql` 中的全部 SQL
4. 在 Storage 中创建两个 bucket：`images` 和 `videos`，设置为 public
5. 在 Authentication → Providers 中启用 Email 登录
6. 创建一个用户用于管理后台

### 3️⃣ 设置环境变量

在 Vercel 项目设置中配置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 4️⃣ 绑定域名

建议使用 Cloudflare DNS 解析：
- 在 Cloudflare 添加你的域名
- 在 Vercel 项目设置中添加域名
- 等待 DNS 生效

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **Next.js 16** | React 全栈框架 |
| **Three.js** | 3D 地球 + 星空渲染 |
| **Tailwind CSS v4** | 样式 + 毛玻璃效果 |
| **Supabase** | 数据库 + 存储 + 认证 |
| **EasyMDE** | Markdown 编辑器 |
| **Vercel** | 部署 + 托管 |

---

## 📁 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局（3D地球背景）
│   ├── page.tsx            # 首页
│   ├── blog/               # 博客页面
│   ├── gallery/            # 图册页面
│   ├── video/              # 视频页面
│   ├── admin/              # 管理后台
│   └── api/                # API 路由
├── components/
│   ├── Earth.tsx           # 3D 地球组件
│   ├── Navbar.tsx          # 导航栏
│   ├── GlassCard.tsx       # 毛玻璃卡片
│   └── GlassButton.tsx     # 毛玻璃按钮
├── lib/
│   ├── supabase.ts         # Supabase 客户端
│   ├── queries.ts          # 数据库查询
│   └── admin.ts            # 管理端客户端
└── types/
    └── index.ts            # TypeScript 类型
```

---

## 📝 使用指南

### 写一篇文章
1. 访问 `你的域名/admin/login`
2. 用 Supabase 创建的用户登录
3. 点击 "写新文章"
4. 使用 Markdown 编辑内容，上传封面图片
5. 设置标签和同步选项
6. 发布！

### 上传图片
1. 在后台进入 "媒体管理"
2. 先创建图册
3. 上传图片，点击图片添加到图册

### 跨平台同步 *(需要配置 API)*
在后台 "系统设置" 中填入各平台的 API Key，发布时勾选对应平台即可。

---

## 📄 许可证

MIT License © 2026 Hermes Diary
