# Personal Dashboard

## Problem Statement
Managing daily tasks, monitoring financial health, tracking habits, and staying updated on personal goals often requires juggling multiple applications and platforms. This fragmentation leads to reduced productivity and a scattered overview of personal data.

## Objectives
- Create a unified, centralized hub for managing personal information.
- Provide an intuitive, modern, and visually appealing user interface.
- Ensure secure authentication and personalized experiences for users.
- Deliver real-time or near-real-time updates on tasks, schedules, and metrics.

## Tech Stack Used
### Backend
- **Node.js + Express**: RESTful API server.
- **MongoDB (Mongoose)**: NoSQL Database for flexible data storage.
- **Clerk (Node SDK)**: Secure backend authentication validation.

### Frontend
- **React (Vite)**: Fast, modern UI development.
- **Tailwind CSS v4**: Utility-first styling.
- **Clerk (React SDK)**: Seamless user authentication and session management.
- **Framer Motion**: Fluid animations and transitions.
- **Recharts**: Data visualization and charts.
- **Lucide React**: Beautiful, consistent iconography.

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB Atlas** account (or local MongoDB)
- A **Clerk** account → [clerk.com](https://clerk.com)

---

## First-time setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd personal-dashboard

# 2. Install all dependencies (backend + web)
npm run install:all

# 3. Configure environment variables
#    Backend
cp backend/.env.example backend/.env
#    Web
cp web/.env.example web/.env

# Open each .env file and fill in your real values:
#   - MONGO_URI       → your Atlas connection string
#   - CLERK_SECRET_KEY       → from Clerk Dashboard → API Keys
#   - VITE_CLERK_PUBLISHABLE_KEY → from Clerk Dashboard → API Keys
```

---

## Running locally

Open **two terminal windows** (or tabs):

### Terminal 1 — Backend (Express API)

```bash
cd personal-dashboard
npm run dev:backend
# → Server running on http://localhost:5000
# → Health check: http://localhost:5000/api/health
```

### Terminal 2 — Frontend (React / Vite)

```bash
cd personal-dashboard
npm run dev:web
# → Vite dev server at http://localhost:5173
```

> **Note:** The backend must be running for API calls from the frontend to work.

---

## Project structure

```
personal-dashboard/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/         # (empty — add feature controllers here)
│   ├── middleware/
│   │   ├── clerkAuth.js     # Clerk auth placeholder
│   │   └── errorHandler.js  # Global Express error handler
│   ├── models/              # (empty — add Mongoose models here)
│   ├── routes/
│   │   └── index.js         # Root API router + /health endpoint
│   ├── .env.example
│   ├── package.json
│   └── server.js            # Express entry point
│
├── web/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js    # Fetch wrapper (reads VITE_API_BASE_URL)
│   │   ├── components/      # (empty — add shared UI components here)
│   │   ├── hooks/
│   │   │   └── useApi.js    # Generic data-fetching hook
│   │   ├── pages/
│   │   │   └── Home.jsx     # Placeholder home page
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # Vite entry point (ClerkProvider wrapper)
│   ├── .env.example
│   └── package.json
│
├── .env.example             # Combined env reference for both sides
├── .gitignore
├── package.json             # Root convenience scripts
└── README.md
```

---

## Environment variables reference

| Variable | Side | Description |
|----------|------|-------------|
| `PORT` | backend | Express port (default: 5000) |
| `NODE_ENV` | backend | `development` or `production` |
| `MONGO_URI` | backend | MongoDB Atlas connection string |
| `CLERK_SECRET_KEY` | backend | Clerk server-side secret |
| `CLIENT_ORIGIN` | backend | Allowed CORS origin (frontend URL) |
| `VITE_CLERK_PUBLISHABLE_KEY` | web | Clerk publishable key (browser-safe) |
| `VITE_API_BASE_URL` | web | Backend API base URL |

---

## Things Yet to Be Done
- Define and implement Mongoose schemas in `backend/models/` (User, Tasks, Notes, etc.).
- Create API route handlers and controllers in `backend/controllers/` and `backend/routes/`.
- Build the main dashboard UI pages and components in `web/src/pages/` and `web/src/components/`.
- Integrate Recharts to visualize dashboard data.
- Connect the frontend React application to the backend Express API using `client.js`.

## Future Improvements
- Add mobile responsiveness and Progressive Web App (PWA) support.
- Implement dark/light mode theming with Tailwind CSS.
- Add third-party integrations (e.g., Google Calendar, GitHub activity).
- Introduce a notification system (email or push notifications).
