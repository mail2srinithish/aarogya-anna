# 🍽️ AarogyaAnna — AI-Powered Diet & Nutrition Platform

A full-stack health and nutrition application featuring AI-powered meal planning, recipe discovery (Indian cuisine), personalized dietary recommendations, and a Groq-powered nutritional chatbot.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS 3 |
| **Backend** | Node.js 20+ + Express 5 |
| **Database** | SQLite (via better-sqlite3) |
| **AI Chatbot** | Groq Cloud (Llama 3.1) |
| **State** | Zustand + React Query |
| **Charts** | Recharts |

## Project Structure

```
aarogya-anna/
├── frontend/          → React 19 + Vite (port 5173)
├── backend/           → Express 5 API   (port 5000)
├── x-docs/            → UML diagrams & documentation
├── abt/               → Startup guide
└── package.json       → Root: runs both with `npm run dev`
```

---

## 🚀 Quick Start (New System Setup)

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | 20+ | https://nodejs.org |
| **Git** | any | https://git-scm.com |

> **Redis & Docker are optional** — the app works fully without them.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/aarogya-anna.git
cd aarogya-anna
```

### 2. Install All Dependencies

```bash
# From root directory — installs backend + frontend
npm run install:all

# Also install root dev dependencies (concurrently)
npm install
```

### 3. Configure Environment

```bash
cd aarogya-anna/backend
cp .env.example .env        # Linux/Mac
# OR
copy .env.example .env      # Windows
```

Edit `.env` and set your values:
- `JWT_SECRET` — any long random string
- `GROQ_API_KEY` — free from https://console.groq.com

### 4. Run the Application

```bash
# From root directory — starts both backend & frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts backend + frontend concurrently |
| `npm run install:all` | Installs dependencies for both backend & frontend |
| `npm run build` | Builds frontend for production |

---

## 🔑 Environment Variables

Copy `backend/.env.example` → `backend/.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret key for refresh tokens |
| `GROQ_API_KEY` | ✅ | AI chatbot (free at console.groq.com) |
| `USDA_API_KEY` | ❌ | Nutrition data sync |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth login |
| `REDIS_HOST` | ❌ | Caching (app works without it) |

---

## 🔄 Keeping Systems in Sync

```bash
# On the system where you made changes:
git add .
git commit -m "describe your changes"
git push

# On the other system:
git pull
npm run install:all    # only if package.json changed
```

---

## 📝 License

Private project — All rights reserved.
