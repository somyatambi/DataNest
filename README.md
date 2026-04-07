# DataNest - Smart Excel Report and Dashboard System

A web application to upload Excel files, clean the data automatically, view charts, and download cleaned results.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Chart.js
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via sql.js - no installation required)
- **Auth:** JWT tokens

## How to Run

### 1. Install dependencies
```bash
# Root (frontend)
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Start the backend server
```bash
cd server
node index.js
```
Server runs on http://localhost:5000

### 3. Start the frontend
```bash
npm run dev
```
App runs on http://localhost:5173

### 4. Open http://localhost:5173 in your browser

## Features
- **Landing Page** — Feature overview with signup/login
- **Signup/Login** — JWT-based secure authentication
- **Employee Dashboard:**
  - Upload Excel (.xlsx or .xls) files
  - Clean data (remove duplicates, fill missing values, trim spaces)
  - View cleaned data in a table with charts
  - Download cleaned Excel file
  - View file history
- **Admin Dashboard:**
  - View all users and manage roles
  - View global file history
  - Charts for activity overview

## Database (SQLite)
The database file `growthcast.db` is created automatically in the project root on first run.  
Tables: `users`, `file_history`

## Default Test Accounts
After running the server for the first time, sign up via the UI. Select **Admin** role when creating an admin account.
