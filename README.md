# 灵境 Oracle

赛博玄学大师 · AI塔罗 · 灵魂画像。Next.js 15 + Supabase + OpenAI Responses API + GPT Image 的完整可运行产品原型，支持 Web、iPhone 和 Android PWA。

> 仅供娱乐与自我探索，不构成现实预测。

## 项目目录

```text
.
├── public/
│   ├── icon.svg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── compatibility/route.ts
│   │   │   ├── daily/route.ts
│   │   │   ├── fortune/route.ts
│   │   │   ├── past-life/route.ts
│   │   │   ├── report/route.ts
│   │   │   ├── soul-portrait/route.ts
│   │   │   └── tarot/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth-panel.tsx
│   │   └── ui/
│   └── lib/
│       ├── openai.ts
│       ├── supabase/
│       ├── tarot.ts
│       └── utils.ts
├── supabase/schema.sql
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── vercel.json
└── package.json
```

## 一键运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

如果未配置 `OPENAI_API_KEY`，API 会返回内置演示数据，方便先启动和验收 UI。

## 环境变量

复制 `.env.example` 为 `.env.local`，填写：

```bash
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-5
OPENAI_IMAGE_MODEL=gpt-image-1
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Stripe 字段已预留：`STRIPE_SECRET_KEY`、`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`、`STRIPE_PRICE_VIP_BASIC`、`STRIPE_PRICE_VIP_PRO`。

## Supabase

1. 创建 Supabase 项目。
2. 在 SQL Editor 执行 `supabase/schema.sql`。
3. 在 Auth Providers 启用 Google、Apple、Email。
4. 将 Site URL 设置为本地或 Vercel 域名。
5. 将 Supabase URL 和 anon key 写入 `.env.local`。
6. 将允许访问后台的邮箱写入 `ADMIN_EMAILS`，多个邮箱用英文逗号分隔。

数据库表：

- `profiles`
- `readings`
- `soul_portraits`
- `compatibility_reports`
- `subscriptions`

## API Routes

- `POST /api/fortune`：AI命运解析
- `POST /api/tarot`：三张塔罗牌
- `POST /api/soul-portrait`：灵魂画像分析与 1024x1536 海报
- `POST /api/past-life`：前世身份故事
- `POST /api/compatibility`：双人灵魂契合度
- `POST /api/daily`：今日运势星级
- `POST /api/report`：30天命运报告 PDF
- `GET /api/admin/overview`：管理员后台数据概览

OpenAI 文本调用集中在 `src/lib/openai.ts`，默认使用 Responses API 的 JSON Schema 输出；图片生成使用 GPT Image，并请求 `1024x1536` 竖版海报。

## 部署到 Vercel

1. 将项目推送到 GitHub。
2. Vercel 导入仓库。
3. Framework 选择 Next.js。
4. 填写 `.env.example` 中的环境变量。
5. 部署后把 Vercel 域名写回 Supabase Auth 的 Site URL 与 Redirect URLs。

## 管理后台

访问：

```text
http://localhost:3000/admin
```

后台用于查看：

- 用户总数与最近用户
- 占卜记录与今日占卜数
- 灵魂画像记录
- 双人契合度报告
- 订阅计划与有效VIP数量

需要配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=your-admin-email@example.com
```

先在前台使用同一个邮箱登录，再进入 `/admin`。`SUPABASE_SERVICE_ROLE_KEY` 只在服务端 API route 使用，不会暴露给浏览器。

## 安全边界

产品所有页面都展示娱乐声明。AI 系统提示禁止医疗预测、疾病判断、死亡预测、投资建议、法律建议，并避免绝对化现实预测。
