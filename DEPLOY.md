# GEO Dashboard 部署指南

## 架构
```
前端 (Vercel) ← API → 后端 (Railway/Render)
                         ↓
                    SQLite/PostgreSQL
```

## 方案 A: Vercel + Railway（推荐）

### Step 1: 部署后端到 Railway
1. 打开 https://railway.app 用 GitHub 登录
2. New Project → Deploy from GitHub Repo → 选 `guixiang123124/geo-dashboard`
3. 设置 Root Directory: `backend`
4. 添加环境变量:
   - `GOOGLE_API_KEY` = 你的 Gemini API key
   - `SECRET_KEY` = 随机字符串(用于JWT)
   - `CORS_ORIGINS` = `https://geo-dashboard.vercel.app`
5. Railway 会自动检测 Dockerfile 并部署
6. 记下生成的 URL (如 `https://geo-dashboard-api.up.railway.app`)

### Step 2: 部署前端到 Vercel
```bash
cd frontend
vercel login
vercel --prod
```
设置环境变量:
- `NEXT_PUBLIC_API_URL` = Railway 后端 URL

### Step 3: 绑定域名（可选）
在 Vercel Dashboard → Settings → Domains 添加自定义域名

---

## 方案 B: 全 Vercel（更简单但后端有限制）

### 用 Vercel Serverless Functions
前端直接部署，后端改写为 API Routes
- 优点: 一个平台搞定
- 缺点: SQLite 不支持，需换 PostgreSQL

---

## 方案 C: 本地终端一键部署

### 前端
```bash
cd geo-dashboard/frontend
npx vercel --prod
```

### 后端
```bash
# 安装 Railway CLI
brew install railway
cd geo-dashboard/backend
railway login
railway init
railway up
```

---

## 环境变量清单

### 后端 (Railway)
| 变量 | 值 | 说明 |
|------|-----|------|
| GOOGLE_API_KEY | AIzaSy... | Gemini API |
| SECRET_KEY | 随机32位字符串 | JWT 签名 |
| CORS_ORIGINS | https://你的域名 | 跨域 |
| DATABASE_URL | (可选) | PostgreSQL URL |

### 前端 (Vercel)
| 变量 | 值 | 说明 |
|------|-----|------|
| NEXT_PUBLIC_API_URL | https://backend-url | 后端API地址 |
