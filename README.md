# ultimate_search_api

a simple proj , to learn redis and boom filter

## Authentication + Item List

1. Copy `.env.example` to `.env` and fill in your Postgres credentials.
2. Create the database in Postgres: `CREATE DATABASE ultimate_search_api;`
3. Run the schema in `db-schema.sql` to create the required tables.
4. Install backend packages: `npm install`
5. Install frontend packages: `cd frontend && npm install`
6. Start the backend: `npm start`
7. Start the frontend: `cd frontend && npm run dev`
8. Open `http://localhost:5173` in a browser.

## Frontend

A React app lives in `frontend/` and uses Vite. It includes:

- login page
- signup page
- items page
- token-based auth using JWT stored in `localStorage`
- `/api` proxy to backend on `http://localhost:3000`

## How it works

- `POST /api/auth/signup` creates a user
- `POST /api/auth/login` returns a JWT token
- `GET /api/items` returns the signed-in user's items
- `POST /api/items` adds an item for the signed-in user

## DB tables

- `users` stores email + password hash
- `items` stores user-owned items with `user_id` foreign key
