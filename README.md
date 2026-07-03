# Spendoray 💸

Spendoray is a beautiful, full-featured **Expense Tracker App** built using the complete **MERN stack**, styled dynamically with Tailwind CSS and Recharts, and powered by RTK Query with automatic caching and store states.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + Recharts + Lucide Icons + Redux Toolkit (with RTK Query)
- **Backend**: Node.js + Express.js + Hybrid MongoDB / Mongoose support
- **Auth**: Secure JSON Web Tokens (stored safely in browser LocalStorage)
- **Data Persistence**: Configured with a Zero-Setup persistence engine out-of-the-box (simulates database models locally inside `server/data_store.json`), supporting transparent plug-and-play MongoDB Atlas server connectivity automatically when you set `MONGO_URI`.

---

## 🚀 Setup & Running Instructions

### 1. Launch the Backend Server
```bash
cd server
npm install
npm run dev
```

### 2. Launch the Frontend Client
```bash
cd client
npm install
npm run dev
```

---

## 🎨 Architectural Design
- **Mobile-First Layout**: Fully constrained and centered to look gorgeous as a mobile dashboard on wide widescreen monitors.
- **Hero Balance Panel**: Shows your calculated available net balance, overall income additions, and expense outflows.
- **Financial Analytics**: Displays period-specific toggles (Week, Month, Year), daily transaction histograms, category classification donut charts, and deep insight tiles (highest spend spike days, averages, no-spend streaks).
- **Control Budget Limits**: Offers visual target lines showing how close your expenses are to limit boundaries (Amber alerts on 70%, Hot Red over 90%) with interactive overlays to adjust settings inside a sandbox.
