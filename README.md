# 🎯 Senjata Habit — Daily Habit Tracker

A beautiful, modern habit tracking app built with React, Vite, TailwindCSS, and Supabase. Track your daily habits, visualize progress, and manage activities with a sleek Gantt-style calendar.

![Habit Tracker](https://img.shields.io/badge/React-19.2-blue) ![Vite](https://img.shields.io/badge/Vite-7.3-purple) ![Supabase](https://img.shields.io/badge/Supabase-Powered-green)

---

## ✨ Features

- ✅ **Daily Check-ins** — Track habit completion with smooth animations
- 📊 **Monthly Analytics** — Visual progress charts and streak tracking
- 📅 **Gantt Calendar** — Plan and track longer activities/projects
- 🌙 **Sleep Tracking** — Monitor sleep quality and patterns
- 🎨 **Beautiful UI** — Dark theme with glassmorphism effects
- 💾 **Cloud Sync** — All data saved to Supabase (no more lost data!)
- 📱 **Mobile-First** — Optimized for phone screens

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier works great)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/senjata-habit.git
cd senjata-habit
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → paste and run the schema from `DEPLOYMENT.md` Step 1.2
3. Go to **Settings → API Keys** → copy:
   - **Project URL**
   - **Publishable key** (anon/public key)

### 3. Configure Environment

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ This file is gitignored — never commit it!

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:5173

---

## 📦 Deployment

### Deploy to Vercel (Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy! 🎉

**Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7 |
| **Styling** | TailwindCSS, Custom CSS Animations |
| **Charts** | Recharts |
| **Database** | Supabase (PostgreSQL) |
| **Hosting** | Vercel |
| **Auth** | Supabase Auth (optional) |

---

## 📂 Project Structure

```
senjata-habit/
├── src/
│   ├── App.jsx              # Main app component
│   ├── TrackerTab.jsx       # Daily tracker view
│   ├── supabase.js          # Supabase client config
│   ├── supabaseService.js   # Database CRUD operations
│   ├── index.css            # Global styles + animations
│   └── main.jsx             # React entry point
├── public/                  # Static assets
├── .env.local              # Environment variables (create this)
├── DEPLOYMENT.md           # Full deployment guide
└── package.json
```

---

## 🎨 Customization

### Change Default Habits

Edit `src/supabaseService.js`:

```js
const DEFAULT_HABITS = [
  { name: 'Your habit', color: '#ef4444', isDefault: true, type: 'main' },
  // Add more...
];
```

### Change Colors

Edit `src/index.css` or update `tailwind.config.js` for global theme changes.

### Modify Animations

All animations are in `src/index.css`:
- `animate-slide-up` / `animate-slide-down`
- `animate-backdrop` / `animate-backdrop-out`

---

## 🐛 Troubleshooting

### Environment variables not working
- Make sure they start with `VITE_` prefix
- Restart dev server after adding `.env.local`

### Supabase connection fails
- Verify URL and key are correct in `.env.local`
- Check Supabase project is active (not paused)
- Enable "Data API" in Supabase → Integrations → Data API

### Build errors
```bash
npm run build
```
Check terminal output for specific errors.

---

## 📈 Roadmap

- [ ] User authentication (login/signup)
- [ ] Multi-user support with Row Level Security
- [ ] Export data as CSV/JSON
- [ ] Push notifications for reminders
- [ ] PWA support (install as app)
- [ ] Dark/Light theme toggle

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) — Backend as a Service
- [Vercel](https://vercel.com) — Hosting platform
- [Recharts](https://recharts.org) — Chart library
- [TailwindCSS](https://tailwindcss.com) — Utility-first CSS

---

**Made with 💜 by AbiyuLingga**

Need help? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.