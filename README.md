# SplitEasy Frontend

React frontend for SplitEasy — a Splitwise-inspired expense splitting app built in 2 days as a Spreetail internship assignment.

## AI Tool Used
**Claude (claude.ai) — Claude Sonnet 4.6**

## Live URLs
- **App:** https://spliteasy-frontend.vercel.app
- **Backend API:** https://spliteasy-backend-production.up.railway.app/docs

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS v3 |
| State | Zustand (auth) + React Query (server) |
| Real-time | Socket.io client |
| Routing | React Router v6 |
| Deploy | Vercel |

## Local Setup

### Prerequisites
- Node.js 18+

### Steps
```bash
git clone https://github.com/shriyashsk/spliteasy-frontend
cd spliteasy-frontend
npm install
cp .env.example .env            # Fill in values
npm run dev                     # Starts at http://localhost:5173
```

### Environment Variables
- VITE_API_BASE_URL=https://spliteasy-backend-production.up.railway.app
- VITE_SOCKET_URL=https://spliteasy-backend-production.up.railway.app

## Features
- Login with email/password or Google OAuth
- Create groups and invite members by email
- Add expenses with 4 split types: equal, unequal, percentage, shares
- Real-time expense chat (Socket.io)
- Group-wise and individual balance summaries
- Record settlements between members
- Activity feed with edit history
- Responsive — works on mobile and desktop
