# Elite Event Hub

Modern full-stack event center booking website scaffold with React, Tailwind CSS, Express, MongoDB-ready models, protected admin APIs, payments, dummy data, bookings, invoices, calendar view, reviews, gallery, and live support UI.

## Quick Start

```bash
npm install
npm run dev
```

Frontend: http://127.0.0.1:5173  
Backend: http://127.0.0.1:5000/api/health

The server uses in-memory dummy data by default so the demo runs immediately. Add `MONGODB_URI`, `JWT_SECRET`, and payment keys in `.env` to connect real persistence and processors.

## Demo Accounts

- Admin: `admin@eliteeventhub.com` / `AdminPass123`
- User: `guest@eliteeventhub.com` / `GuestPass123`

## Structure

```text
src/                 React + Tailwind frontend
server/src/          Express API, validation, auth, dummy data, routes
server/src/models/   MongoDB-ready Mongoose models
```
