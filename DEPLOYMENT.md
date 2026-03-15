# 🚀 Deployment Guide: Senjata Habit Tracker

Complete guide to deploy your habit tracker app with **Supabase (database)** + **Vercel (hosting)** — 100% free.

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Supabase account (sign up at supabase.com)
- [x] Vercel account (sign up at vercel.com with GitHub)
- [x] Git installed locally

---

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to **supabase.com** → Sign in → **New Project**
2. Fill in:
   - **Name**: `senjata-habit`
   - **Database Password**: Choose a strong password (save it somewhere safe)
   - **Region**: Pick the closest to you (e.g., `Southeast Asia`)
3. Click **Create new project** → wait ~2 minutes for it to initialize

### 1.2 Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste this SQL and click **Run**:

```sql
-- Habits table
create table if not exists habits (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  name text not null,
  color text not null,
  type text default 'main',
  is_default boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Daily tracking (habit completion per day)
create table if not exists tracking (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  habit_name text not null,
  year int not null,
  month int not null,
  day int not null,
  done boolean default false,
  unique(user_id, habit_name, year, month, day)
);

-- Calendar activities (Gantt timeline)
create table if not exists calendar_activities (
  id text primary key,
  user_id text not null,
  title text not null,
  start_date text not null,
  end_date text not null,
  color text not null,
  notes text default '',
  completed boolean default false
);

-- Missed habit notes
create table if not exists missed_notes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  day int not null,
  habit_name text not null,
  reason text default '',
  unique(user_id, day, habit_name)
);

-- Sleep log
create table if not exists sleep_log (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  day int not null,
  hours float not null,
  unique(user_id, day)
);
```

4. You should see: ✅ **Success. No rows returned**

### 1.3 Get Your API Keys

1. Go to **Settings** (⚙️ gear icon, bottom left sidebar)
2. Click **API Keys**
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxxx.supabase.co`)
   - **Publishable key** (the `anon public` key starting with `eyJ...`)

⚠️ **DO NOT** use the `service_role` key — that's for backend only!

---

## Step 2: Configure Environment Variables Locally

### 2.1 Update `.env.local`

Open `senjata-habit/.env.local` and paste your keys:

```env
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 Test Locally

```bash
cd ~/computing/senjata-habit
npm run dev
```

Open http://localhost:5173 — the app should load without errors. Check browser console for any connection issues.

---

## Step 3: Push to GitHub

### 3.1 Initialize Git (if not done)

```bash
cd ~/computing/senjata-habit
git init
git branch -m main
```

### 3.2 Create GitHub Repository

1. Go to **github.com/new**
2. Name it: `senjata-habit`
3. Keep it **Private** (recommended)
4. **DO NOT** check "Add README" or ".gitignore"
5. Click **Create repository**

### 3.3 Add Remote & Push

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/senjata-habit.git
git add .
git commit -m "feat: migrate to Supabase database"
git push -u origin main
```

If GitHub asks for authentication:
- **Username**: your GitHub username
- **Password**: use a **Personal Access Token** (not your GitHub password)
  - Create one at: **github.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)**
  - Give it `repo` scope

---

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to **vercel.com** → Sign in with GitHub
2. Click **Add New... → Project**
3. Import your `senjata-habit` repository
4. Vercel will auto-detect it's a **Vite** project ✅

### 4.2 Add Environment Variables

Before clicking **Deploy**, expand **Environment Variables** and add:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (your publishable key) |

**Apply to**: All environments (Production, Preview, Development)

### 4.3 Deploy

Click **Deploy** → wait ~2 minutes → you'll get a live URL like:

```
https://senjata-habit.vercel.app
```

🎉 Your app is now live!

---

## Step 5: Test Your Deployment

1. Open your Vercel URL
2. Add a new habit
3. Check a habit as done
4. Go to **Supabase dashboard → Table Editor → `habits`** — you should see your data!

---

## 🔄 Future Updates

Every time you make changes:

```bash
git add .
git commit -m "your change description"
git push
```

Vercel automatically redeploys within 1-2 minutes ✨

---

## 🔐 Optional: Add User Authentication

Right now, everyone shares the same `user_id = 'local-user'`. To add real login:

### Enable Supabase Auth

1. **Supabase dashboard → Authentication → Providers**
2. Enable **Email** (or Google/GitHub)
3. Update `src/supabaseService.js`:

```js
// Replace this line:
const USER_ID = 'local-user';

// With this:
const USER_ID = await supabase.auth.getUser().then(u => u.data?.user?.id || 'local-user');
```

4. Add login UI using [Supabase Auth UI](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

---

## 📊 Usage Monitoring

### Supabase Dashboard
- **Database**: Settings → Usage → see row count, storage
- **Free tier**: 500 MB, 50k monthly active users

### Vercel Dashboard
- **Deployments**: see build logs, preview URLs
- **Analytics**: track page views (free)
- **Free tier**: 100 GB bandwidth/month

---

## 🐛 Troubleshooting

### "Failed to fetch" or CORS errors
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel
- Redeploy after adding env vars

### Data not saving
- Check browser console for errors
- Verify Supabase tables exist (Table Editor)
- Check Supabase → API → is "Data API" enabled?

### Build fails on Vercel
- Run `npm run build` locally first to catch errors
- Check Vercel build logs for specific error messages

### Environment variables not working
- Must start with `VITE_` prefix for Vite to expose them
- Must redeploy after adding/changing env vars in Vercel

---

## 🎯 Next Steps

- [ ] Set up custom domain (Vercel Settings → Domains)
- [ ] Enable Supabase Row Level Security (RLS) for multi-user support
- [ ] Add Google/GitHub OAuth login
- [ ] Set up daily backup routine (Supabase Pro feature)

---

## 📚 Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

---

**Made with 💜 by AbiyuLingga**
