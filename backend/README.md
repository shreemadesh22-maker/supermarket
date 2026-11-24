# FreshMart — Phase 2 Backend (Neon PostgreSQL)

## Important: replace the previous backend folder

Use this `backend` folder instead of the earlier Phase 2 backend. Do not keep two backend folders or merge their files.

## Expected main project layout

```text
FreshMart/
├── supermart-phase1-frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── home.html
│   ├── css/
│   └── js/
└── backend/
    ├── server.js
    ├── db.js
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── routes/
    │   └── auth.js
    ├── middleware/
    │   └── requireAuth.js
    └── frontend-integration/
        └── app.js
```

If your Phase 1 folder has a different name, update `frontendPath` in `server.js`.

## Step 1 — Configure Neon

1. Open https://console.neon.tech/ and open your FreshMart project.
2. Click **Connect**.
3. Select the database and use the Node.js connection details.
4. Copy the connection string. Keep it secret.
5. In the backend folder, create a file named `.env` by copying `.env.example`.
6. Paste the connection string after `DATABASE_URL=`.
7. Set a long random value for `SESSION_SECRET`.

Example `.env` format (replace all placeholder values):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
SESSION_SECRET=put-a-long-random-secret-here
PORT=5000
NODE_ENV=development
```

Do not share `.env`, commit it to GitHub, or paste the database URL into frontend code.

## Step 2 — Connect frontend to backend

Copy `backend/frontend-integration/app.js` and replace:

`supermart-phase1-frontend/js/app.js`

## Step 3 — Install packages

Open PowerShell in the `backend` folder:

```powershell
npm install
```

## Step 4 — Start the application

```powershell
npm start
```

Expected startup messages:

```text
Neon PostgreSQL connected; users table is ready.
FreshMart backend running at http://localhost:5000
```

Open `http://localhost:5000`. Do not use Live Server for this integrated test.

## What this backend does

- Creates the `users` table automatically if it does not exist.
- Registers users in Neon PostgreSQL.
- Hashes passwords with bcrypt before inserting them.
- Checks login credentials against Neon.
- Uses an Express session to protect `/store`.
- Provides `/api/auth/me` and `/api/auth/logout`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user in Neon |
| POST | `/api/auth/login` | Verify credentials |
| GET | `/api/auth/me` | Check login session |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/protected` | Protected API |
| GET | `/store` | Protected supermarket page |

## Notes

The user records are persistent in Neon. The current Express session uses the default in-memory session store, which is only suitable for local development and is cleared when the server restarts. Before production deployment, configure a PostgreSQL-backed session store, secure cookies, HTTPS, and other production security settings.
