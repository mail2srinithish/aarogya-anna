# AarogyaAnna 🌿

> The Modern Alchemist — India's AI-powered nutrition and meal planning platform.

Built with **React 19 + Vite** (frontend) and **Node.js + Express + SQLite** (backend).  
AI is powered by **Groq (Llama 3.3 70B)** — free tier is enough to run the full app.

---

## Quick Start (after cloning)

### 1. Get a Groq API key — FREE, takes 30 seconds
Go to **https://console.groq.com/keys** → Sign up → Create API key → Copy it.

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
```
Open `backend/.env` and replace `your_groq_api_key_here` with your actual key:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```
That is the **only required change**. All other values have working defaults.

### 3. Set up the frontend
```bash
cd frontend
npm install
```
No `.env` file needed for the frontend — it proxies API calls to the backend automatically.

### 4. Run both servers (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev          # uses nodemon for auto-reload
# OR
npm start            # plain node
```
Backend runs at **http://localhost:5000**

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at **http://localhost:5173**

Open **http://localhost:5173** in your browser. The app is ready.

---

## What works without extra setup

| Feature | Status |
|---|---|
| Recipes page (1,200+ Indian foods) | ✅ Works immediately |
| Meal Planner (weekly, drag & drop) | ✅ Works immediately |
| Dashboard with nutrition tracking | ✅ Works immediately |
| AarogyaAI chatbot | ✅ Works with Groq key |
| Open Food Facts live search | ✅ Works (no key needed) |
| USDA food search | ✅ Works with DEMO_KEY |
| Wikipedia food images | ✅ Works (no key needed) |
| Google Sign-In | ⚠️ Optional (add OAuth credentials) |
| Email (password reset) | ⚠️ Optional (add SMTP config) |
| Redis cache | ⚠️ Optional (app works without it) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Zustand, React Query |
| Backend | Node.js, Express, better-sqlite3 (SQLite) |
| AI | Groq API — llama-3.3-70b-versatile |
| Food Data | Local DB (1,262 items) + Open Food Facts + USDA |
| Images | Wikipedia REST API thumbnails |
| Auth | JWT + optional Google OAuth |

---

## Project Structure

```
aarogya-anna/
├── backend/
│   ├── .env.example        ← copy to .env and add your Groq key
│   ├── server.js
│   └── src/
│       ├── controllers/    ← chatController uses GROQ_API_KEY
│       ├── routes/
│       └── config/         ← SQLite db auto-created on first run
├── frontend/
│   ├── src/
│   │   ├── pages/          ← Dashboard, Recipes, Planner, Chatbot
│   │   ├── data/foodsDb/   ← 1,262 Indian food items (local)
│   │   ├── hooks/          ← useFoodImage (Wikipedia thumbnails)
│   │   ├── services/       ← Open Food Facts, USDA APIs
│   │   └── store/          ← Zustand state (meal plan, profile)
│   └── vite.config.js      ← proxies /api → localhost:5000
└── data/
    └── aarogya_anna.db     ← auto-created SQLite file (gitignored)
```

---

## Why the AI didn't work on clone

The `GROQ_API_KEY` is stored in `backend/.env` which is gitignored (never committed to GitHub for security). After cloning, follow Step 1 & 2 above to add your own free key.

---

## Common Issues

**"Cannot connect to AI service"**  
→ Check that `GROQ_API_KEY` is set in `backend/.env` and the backend is running.

**Frontend shows blank page**  
→ Make sure both servers are running (frontend on 5173, backend on 5000).

**Port already in use**  
→ Change `PORT=5000` in `backend/.env` and update `vite.config.js` proxy target.

**Database errors on first run**  
→ The SQLite file is created automatically. No setup needed. If you see errors, delete `data/aarogya_anna.db` and restart the backend.
