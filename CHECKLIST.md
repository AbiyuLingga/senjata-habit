# ✅ Deployment Checklist

Quick reference guide to deploy your habit tracker app.

---

## 🗄️ Database Setup (Supabase)

- [ ] Sign up at [supabase.com](https://supabase.com)
- [ ] Create new project → wait 2 min for initialization
- [ ] Go to **SQL Editor** → paste schema from `DEPLOYMENT.md` → Run
- [ ] Go to **Settings → API Keys** → copy:
  - [ ] Project URL
  - [ ] Publishable key (anon/public)

---

## 💻 Local Setup

- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` file in project root
- [ ] Paste your Supabase credentials:
  ```env
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGci...
  ```
- [ ] Test locally: `npm run dev` → open http://localhost:5173
- [ ] Verify data saves (add a habit, check Supabase Table Editor)

---

## 📦 GitHub Setup

- [ ] Initialize git: `git init`
- [ ] Rename branch: `git branch -m main`
- [ ] Create repo at [github.com/new](https://github.com/new)
  - Name: `senjata-habit`
  - Keep **Private**
  - Don't add README/gitignore
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/senjata-habit.git`
- [ ] First commit:
  ```bash
  git add .
  git commit -m "feat: habit tracker with Supabase"
  git push -u origin main
  ```

---

## 🚀 Vercel Deployment

- [ ] Go to [vercel.com](https://vercel.com) → Sign in with GitHub
- [ ] Click **Add New... → Project**
- [ ] Import your `senjata-habit` repo
- [ ] Before deploying, add **Environment Variables**:
  - [ ] `VITE_SUPABASE_URL` → paste your URL
  - [ ] `VITE_SUPABASE_ANON_KEY` → paste your key
  - [ ] Set for: Production, Preview, Development
- [ ] Click **Deploy** → wait ~2 minutes
- [ ] Copy your live URL (e.g., `senjata-habit.vercel.app`)

---

## ✅ Verification

- [ ] Open your Vercel URL
- [ ] Add a new habit
- [ ] Mark it as done
- [ ] Go to Supabase → **Table Editor → habits** → verify data appears
- [ ] Test calendar feature
- [ ] Test sleep tracker

---

## 🔄 Future Updates

Every time you make changes:

```bash
git add .
git commit -m "description of changes"
git push
```

Vercel auto-deploys within 1-2 minutes! 🎉

---

## 🆘 Common Issues

| Issue | Fix |
|---|---|
| "Cannot connect to Supabase" | Check env vars are set correctly in Vercel |
| Build fails | Run `npm run build` locally first |
| Data not saving | Enable "Data API" in Supabase → Integrations |
| Env vars not working | Must start with `VITE_` prefix + redeploy |

---

## 📚 Full Guides

- Detailed steps: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Project overview: [README.md](./README.md)

---

**Total time: ~20 minutes** ⏱️