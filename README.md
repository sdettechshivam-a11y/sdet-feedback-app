# SDET Tech — Client Feedback Application

A production-grade, WCAG 2.1 AA compliant multi-step feedback collection app with an admin dashboard.

---

## 🚀 Local Setup (5 minutes)

### Prerequisites
- Node.js v18+ ([nodejs.org](https://nodejs.org))

### Step 1 — Install dependencies
```bash
cd feedback-app

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### Step 2 — Start the backend
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
# Default admin created: admin@sdettech.com / Admin@SDET2024
```

### Step 3 — Start the frontend (new terminal)
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### Access
| URL | Description |
|---|---|
| http://localhost:5173 | Client feedback form |
| http://localhost:5173/admin/login | Admin login |
| http://localhost:5000/api/health | API health check |

**Default Admin Credentials**
- Email: `admin@sdettech.com`
- Password: `Admin@SDET2024`
- ⚠️ Change these immediately via the Admin > Manage Admins panel!

---

## ☁️ Deploy to Render (Free)

### Option A — Single Service (Recommended)

1. **Build the frontend first:**
   ```bash
   cd client && npm run build
   ```

2. **Push to GitHub** (create a new repo and push)

3. **Create a Render account** at [render.com](https://render.com)

4. **New Web Service** → Connect your GitHub repo
   - Build command: `cd client && npm install && npm run build && cd ../server && npm install`
   - Start command: `cd server && node src/index.js`
   - Environment: Node

5. **Set Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   JWT_SECRET=<your_long_random_secret>
   CLIENT_URL=https://your-app-name.onrender.com
   PORT=10000
   ```

6. **Add Persistent Disk** (Render free tier):
   - Mount path: `/data`
   - Update `server/src/db/database.js` DB_PATH to `/data/feedback.db`

7. Deploy! Your app will be live at `https://your-app-name.onrender.com`

### Option B — Separate Services (Vercel + Render)

**Backend on Render:**
- Same as above but only deploy the `server/` folder
- Root directory: `server`

**Frontend on Vercel:**
- Connect repo, set root directory to `client`
- Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
- Update API calls in frontend to use `import.meta.env.VITE_API_URL`

---

## 📁 Project Structure

```
feedback-app/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── assets/          # Logo, images
│   │   ├── components/      # AppHeader, StarRating, NpsRating, ProtectedRoute
│   │   ├── pages/           # FeedbackForm, AdminLogin, AdminDashboard
│   │   └── styles/          # global.css
│   └── index.html
├── server/                  # Express backend
│   ├── src/
│   │   ├── db/              # SQLite setup
│   │   ├── middleware/      # JWT auth
│   │   └── routes/          # auth, feedback, admin
│   ├── data/                # SQLite DB file (auto-created)
│   └── .env
└── README.md
```

---

## ♿ Accessibility (WCAG 2.1 AA)

- Skip-to-main-content link
- All form inputs have associated `<label>` elements
- ARIA roles, `aria-required`, `aria-describedby`, `aria-live` regions
- Star and NPS ratings keyboard navigable (arrow keys)
- `aria-pressed` on toggle buttons
- `aria-sort` on sortable table headers
- Color contrast ≥ 4.5:1 for all text
- Focus indicators visible on all interactive elements
- Semantic HTML: `<main>`, `<nav>`, `<header>`, `<fieldset>`, `<legend>`
- No color as sole conveyor of information
