# University Student Portfolio

This project is a student portfolio website with a Node.js backend and user interaction support.

## Setup

1. Open a terminal in `project-card`
2. Run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000` in your browser (if port 3000 is busy, the server will automatically fall back to `http://localhost:3001`)

## Features

- Responsive student portfolio landing page
- Contact/message interface with server-side storage
- User login page with session support
- Analytics chart page powered by Chart.js
- AI voice-enabled assistant simulation on the portfolio page

## Backend

- `server.js` serves the static site and API routes
- `POST /api/contact` stores contact messages in `data/messages.json`
- `POST /api/login` validates users and starts a session
- `GET /api/user` returns current logged-in user info
- `GET /api/history` returns saved chat messages
- `GET /api/chart-data` returns analytics data for `chart.html`
- `POST /api/ai` handles AI question replies

## Pages

- `card.html` main portfolio and AI assistant page
- `login.html` user login portal
- `chart.html` analytics dashboard

## Notes

- The backend creates `data/users.json`, `data/messages.json`, and `data/chatHistory.json` automatically on first use
- Do not commit `node_modules/`

