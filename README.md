# Doctors Tracker

A modern, session-protected administrative application for managing doctors and their patients in one place. Built with Next.js and Better Auth on the frontend and a standalone Express + MongoDB REST API on the backend, it provides secure CRUD workflows, fast searchable directories, flexible filters, server-side pagination, and meaningful analytics for patient activity and doctor workload.

- **Frontend:** [Doctors-Tracker](https://github.com/mr-mizanur/Doctors-Tracker)
- **API:** [Doctors-Tracker-Server](https://github.com/mr-mizanur/Doctors-Tracker-Server)
- **Demo:** Not deployed in this README; configure your deployments before submitting a live link.

## Features

- Better Auth email/password registration, login, persistent sessions and logout
- Database-backed role-based access control: new registrations are users; only admins can access the dashboard, doctors, patients, and REST APIs
- Doctor management: create, update, delete, filter by specialization/date, name/hospital prefix search and pagination
- Patient management: assign doctor, create, edit, delete, search by name prefix, condition/date/doctor filtering and pagination
- Doctor-specific patient views (`/patients?doctorId=...`)
- Dashboard: total doctors, total patients, patients added in the last 14 days and top doctors by patient count
- Mobile-friendly sidebar/navigation, loading/error/empty states and input validation

## Local setup

**Prerequisites:** Node.js 20.9+ (22+ recommended), npm, a MongoDB Atlas cluster with an authorized database user, and Git.

### 1. Clone both repositories

```bash
git clone https://github.com/mr-mizanur/Doctors-Tracker.git
git clone https://github.com/mr-mizanur/Doctors-Tracker-Server.git
```

### 2. Configure and start the backend

```bash
cd Doctors-Tracker-Server
npm install
cp .env.example .env
```

In `Doctors-Tracker-Server/.env`, configure:

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/doctor-tracker?retryWrites=true&w=majority
MONGODB_DB=doctor-tracker
FRONTEND_URL=http://localhost:3000
# Admin access is determined by the role in the Better Auth MongoDB 'user' collection.
```

Run `npm run dev`. Confirm the API process and MongoDB connection:

- `http://localhost:5000/health` → service status
- `http://localhost:5000/health/db` → database connectivity

### 3. Configure and start Next.js

In a **second terminal**:

```bash
cd Doctors-Tracker
npm install
cp .env.example .env.local
```

Set these variables in `Doctors-Tracker/.env.local`:

```dotenv
BETTER_AUTH_SECRET=YOUR_RANDOM_32_PLUS_CHARACTER_SECRET
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/doctor-tracker?retryWrites=true&w=majority
MONGODB_DB=doctor-tracker
BACKEND_URL=http://localhost:5000
# New registrations receive role 'user' and cannot self-promote.
```

`BETTER_AUTH_SECRET` is for the Next.js app, not the Express service. Keep secrets in local environment files only; do **not** commit them.

Start Next.js:

```bash
npm run dev
```

Visit `http://localhost:3000` and register. Every new account gets `role: "user"` and is redirected to `/pending`. An authorized database administrator can approve access in MongoDB Atlas, in the `doctor-tracker` database, Better Auth `user` collection, by editing **that specific user's** `role` field to the exact string `admin`. Do not change the `account` or `session` collections. After promotion, the user can press "Check my access", or sign out and sign in again.

For example, from a privileged `mongosh` session (replace the email address only):

```js
use("doctor-tracker");
db.user.updateOne(
  { email: "someone@example.com" },
  { $set: { role: "admin" } }
);
```

Avoid promoting every user or using an unauthenticated HTTP route for role changes.

### 4. Validate the project

```bash
npm run lint
npm run build
```

For API-only validation, run `npm test` in the backend directory.

## System architecture

```text
Browser (localhost:3000)
  |  Better Auth session cookie
  v
Next.js App Router
  |-- /api/auth/*                -> Better Auth / MongoDB user sessions
  |-- /dashboard, /doctors,
  |   /patients                  -> protected UI route layout
  |
  |-- /api/backend/*             -> same-origin server-side API gateway
       | checks Better Auth session + user.role === admin
       | forwards session cookie (server-to-server)
       v
Express API (localhost:5000)
  | independently checks session via Next.js /api/auth/get-session
  | performs validation, filtering, pagination and aggregation
  v
MongoDB: doctors, patients, Better Auth collections
```

**Important:** `localhost:5000/api/stats` is protected, not a public analytics URL. A direct unauthenticated request should return 401. The frontend dashboard uses `http://localhost:3000/api/backend/stats` with your signed-in session.

## REST APIs

| Method | URL | Function |
| --- | --- | --- |
| GET / POST | `/api/doctors` | List/create doctors |
| GET / PUT / DELETE | `/api/doctors/:id` | Detail/update/delete |
| GET / POST | `/api/patients` | List/create patients |
| PUT / DELETE | `/api/patients/:id` | Update/delete patient |
| GET | `/api/stats` | Dashboard metrics and analytics |

Filter parameters: `page`, `limit`, `search`, `dateFrom`, `dateTo`; `specialty` / `hospital` for doctors, `condition` / `doctorId` for patients. Search matches **prefixes**, not arbitrary substrings. All data operations are processed on the server. The API returns validation and error responses in JSON.

## Technical decisions

### 1. Better Auth with a Next.js gateway

Better Auth runs in Next.js because sessions are browser cookies tied to the frontend origin. Browser requests go only to the same-origin `/api/backend/*` gateway, where sessions are verified. Express independently validates the forwarded cookie through Better Auth rather than trusting user-supplied IDs. This avoids cross-origin cookie headaches, hides the backend endpoint from browser code, and gives both services an explicit access-control boundary. Roles are server-owned Better Auth fields (`input: false`); **both** Next.js and Express load current `role` from the MongoDB Better Auth `user` collection on each protected request. No cached role from a session is trusted, so promoting/revoking an admin takes effect on the next request.

### 2. MongoDB indexed prefix search + aggregation

Doctors and patients store normalized search fields (`searchName`, `searchHospital`) with indexes. Escaped anchored prefix regex can use indexes more efficiently than unanchored case-insensitive regex, while server-side `skip/limit` keeps the response payload small. Date/doctor/condition filters run in MongoDB. Analytics are aggregated in the database; the app doesn't load every record to compute patient counts. This improves scalability while keeping implementation simple for an evaluation project. For very large datasets, cursor pagination and Atlas Search are logical next steps.

## UI screenshots

Add actual screenshots after starting the app or deploying it. Suggested file paths:

- `docs/screenshots/login-desktop.png`
- `docs/screenshots/dashboard-desktop.png`
- `docs/screenshots/doctors-desktop.png`
- `docs/screenshots/patients-desktop.png`
- `docs/screenshots/dashboard-mobile.png`
- `docs/screenshots/patients-mobile.png`

Do **not** include real patient names, ages, conditions, phone numbers or other private health details. To capture actual app screenshots automatically from a running local demo using **fictional records**, use a browser with the optional Playwright package:

```bash
npm install --no-save playwright
npx playwright install chromium
SCREENSHOT_EMAIL=demo-admin@example.com SCREENSHOT_PASSWORD=YOUR_DEMO_PASSWORD SCREENSHOT_TEST_DATA_ONLY=1 npm run screenshots
```

Use a demo administrator account promoted to `role: "admin"` in the local MongoDB `user` collection. The command saves real Desktop/Mobile screenshots to `docs/screenshots/`. Never commit credentials or genuine patient data. Screenshots are generated **only when you run the script**; this repository does not claim screenshots have already been captured.

## Security and deployment notes

- Only database administrators may promote a user to `admin`. For a private production instance, consider disabling public registration, adding email verification, and logging all role changes.
- Use HTTPS on both deployments and update `BACKEND_URL`, `FRONTEND_URL`, `BETTER_AUTH_URL`, and `NEXT_PUBLIC_APP_URL`.
- Allow the application's IP/network to reach MongoDB Atlas; follow least-privilege database user policies.
- Never commit `.env` / `.env.local`, never use real patient data for public demonstration, and back up data before migrations.
- Pre-existing records from the older server might not have `doctorId` or normalized search fields; backfill them for complete search and doctor-specific analytics.
- A successful Next.js build does not by itself test Atlas network access or deployment; verify the two services together before submission.

## Fix: registration 500 / MongoDB ECONNREFUSED

If your terminal shows `MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`, Next.js is **not** loading your Atlas connection string. The previous localhost fallback was removed to prevent misleading failures.

1. In the **frontend repo root** (the directory containing `package.json`), create `.env.local` (not in `src/`). It is gitignored and **never** comes down with `git pull`.
2. Put `MONGODB_URI=mongodb+srv://<database-user>:<password>@<atlas-host>/doctor-tracker?retryWrites=true&w=majority` in the frontend `.env.local` with your **own rotated credentials**. Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `BACKEND_URL=http://localhost:5000`. Do not copy the string into source files, screenshots or GitHub commits.
3. From the frontend directory, run `npm run check:db`. It checks Next.js environment loading and pings MongoDB without printing your secrets.
4. Stop any running `next dev` process, then run `npm run dev` again. Restarting is required whenever environment variables change.
5. Keep the separate Express server running on port 5000. Its own `.env` also needs the Atlas URI.
6. Visit `http://localhost:3000/register` and submit the form. `/api/auth/sign-up/email` accepts **POST**, so opening this URL in a browser with GET may give 404 and is not a registration error.

If `check:db` cannot connect to MongoDB Atlas, check the database user's password, the Atlas Network Access allowed IP, DNS/internet access and the connection string. A failed Atlas connection is not solved by changing the frontend authentication UI.

### Fix: `MongoTopologyClosedError: Topology is closed`

This can happen when a development hot-reload reuses a stale or closed `MongoClient` instance. The auth module now creates its own client rather than caching a potentially closed one on `globalThis`. After changing the database URI or pulling this fix, **stop the Next.js process and start it again**. Avoid using `npm run check:db` as a substitute for setting `.env.local` correctly; it only verifies the connection.

If `npm run check:db` says `Missing script`, your checkout is older than the GitHub main branch. `git status` may say "up to date" against a stale local tracking ref. Run `git fetch origin` then `git pull --ff-only origin main`; preserve any modified `.env.example` file using Git stash or a local backup first. Do not commit actual credentials.

## Vercel package-manager setup

This repository uses **npm only**. `package-lock.json` is the single source of truth for installation.
The obsolete `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and `packageManager: pnpm` were removed
because they made Vercel run `pnpm install --frozen-lockfile` against a stale lockfile and fail
with `ERR_PNPM_OUTDATED_LOCKFILE` after Better Auth, MongoDB and react-icons were added.

Recommended Vercel project settings:
- Framework Preset: Next.js
- Root Directory: the repository root (`.`)
- Install Command: leave blank for automatic npm selection, or explicitly set `npm ci`
- Build Command: leave at the Next.js default (`npm run build`)
- Set `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `NEXT_PUBLIC_APP_URL`, and `BACKEND_URL` as Vercel Environment Variables
  for the appropriate environments; do **not** commit `.env.local`.
- The production `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must be set to the deployed
  frontend's HTTPS origin, **not** `http://localhost:3000`.
- The production `BACKEND_URL` must be the deployed Express API HTTPS origin,
  **not** `http://localhost:5000`.

Always run `npm install` locally when changing dependencies and commit the resulting
`package-lock.json`. CI validates this path with `npm ci`.
