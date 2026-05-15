# Elite Event Hub

Modern full-stack event center booking website scaffold with React, Tailwind CSS, Express, MongoDB-ready models, protected admin APIs, payments, dummy data, bookings, invoices, calendar view, reviews, gallery, and live support UI.

## Quick Start

```bash
npm install
npm run dev
```

Frontend: http://127.0.0.1:5173  
Backend: http://127.0.0.1:5000/api/health

The server connects to local MongoDB by default:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/elite-event-hub
```

On startup it seeds halls, bookings, and demo users if they do not exist. Add payment keys in `.env` when you are ready to replace the demo payment flow.

## Demo Accounts

- Admin: `admin@eliteeventhub.com` / `AdminPass123`
- User: `guest@eliteeventhub.com` / `GuestPass123`

Admin tools live on a separate protected page: http://127.0.0.1:5173/admin

## Structure

```text
src/                 React + Tailwind frontend
server/src/          Express API, validation, auth, dummy data, routes
server/src/models/   MongoDB-ready Mongoose models
```
