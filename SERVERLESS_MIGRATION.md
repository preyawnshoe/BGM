## Serverless Migration Plan

This document provides a detailed, stepwise plan to migrate this project to a serverless architecture. It is tailored to the current repository structure:
- Frontend: Create React App in `src/` with static assets in `public/`
- Backend 1: Express + Mongoose with sessions and Google OAuth in `backend/`
- Backend 2: Lightweight Express + Mongoose in `server.js`

The plan proposes two practical paths:
- Path A (quick): Wrap the existing `backend/` Express app into a single serverless function.
- Path B (clean): Refactor into per-route serverless functions and replace sessions with JWT.

Pick Path A for speed, Path B for maintainability and better cold start performance.

---

### 1) Prerequisites
- MongoDB Atlas cluster (recommended) and connection string ready
- Environment variables captured (see section 9)
- Node 18+ runtime
- Choose a target platform:
  - Vercel (recommended for per-route API functions)
  - Netlify (good DX, can also wrap Express)
  - AWS Lambda via Serverless Framework/SST (more control)

---

### 2) Repo housekeeping
- Decide which backend to keep moving forward. Recommendation: migrate `backend/` and deprecate the root `server.js` to avoid duplication.
- Ensure `backend/routes/` endpoints are the source of truth.

Actions:
- If any logic in `server.js` is required (e.g., referral/leaderboard), move equivalent handlers into `backend/routes/` and remove `server.js` from prod path after migration.

---

### 3) Platform choice and high-level path

- Path A (quick wrap):
  - Use `serverless-http` to wrap `backend/index.js` and deploy as a single function.
  - Works well on Netlify Functions and AWS Lambda/APIGW.
  - Pros: minimal edits. Cons: cold start and monolith function.

- Path B (clean refactor):
  - Create per-route functions (preferred on Vercel/Netlify).
  - Replace `express-session` with stateless JWT.
  - Share a cached Mongoose connection across invocations.
  - Pros: smaller cold start, clearer ownership, edge-capable with Data API.

Pick one of the following implementation tracks.

---

### 4) Path A — Quick wrap with serverless-http (Netlify or AWS)

Steps:
1. Add dependency in backend:
   - `npm i -w backend serverless-http`
2. Create a function entry (example for Netlify):
   - Create `netlify/functions/api.js`:
     ```js
     const serverless = require('serverless-http');
     const app = require('../../backend/index'); // Export the app from index instead of app.listen
     module.exports.handler = serverless(app);
     ```
3. Edit `backend/index.js`:
   - Export the Express `app` instead of calling `app.listen` when in serverless. Keep `app.listen` only when running locally.
   - Example:
     ```js
     // at bottom of backend/index.js
     if (require.main === module) {
       const PORT = process.env.PORT || 5000;
       app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
     }
     module.exports = app;
     ```
4. Configure Netlify:
   - Add `netlify.toml` at project root:
     ```toml
     [build]
       command = "npm run build"
       publish = "build"
       functions = "netlify/functions"

     [[redirects]]
       from = "/api/*"
       to = "/.netlify/functions/api/:splat"
       status = 200
     ```
5. Environment variables: Set in Netlify dashboard or `netlify.toml` [context] blocks.
6. Deploy:
   - `npm run build`
   - `netlify deploy --prod` (or connect repo to Netlify for CI)

Local dev:
- `npm run dev` (existing concurrently script) for CRA + backend.
- Or use Netlify CLI: `netlify dev` to emulate functions and redirects.

Notes:
- Sessions in serverless can work but are not recommended. Prefer switching to JWT even in Path A (see section 7) to avoid sticky sessions.

---

### 5) Path B — Clean refactor to per-route functions (Vercel recommended)

Steps:
1. Create serverless API folder at root:
   - `api/` (Vercel convention) or `netlify/functions/` (Netlify convention)
2. Add shared libraries:
   - `api/_lib/db.js` – cached Mongoose connection
   - `api/_lib/auth.js` – JWT sign/verify helpers and auth middleware
3. Convert each router under `backend/routes/` to a serverless handler:
   - Example mapping (Vercel):
     - `backend/routes/auth.js` → `api/auth/index.js`
     - `backend/routes/googleAuth.js` → `api/auth/google.js`
     - `backend/routes/user.js` → `api/user/index.js`
     - `backend/routes/ticket.js` → `api/ticket/index.js`, etc.
4. Remove Express app-level concerns:
   - Replace `app.use(express.json())` with per-handler body parsing (Vercel/Netlify auto-parse JSON).
   - Implement CORS as needed per handler or via platform config.
5. Delete `express-session` usage; adopt JWT (section 7).
6. Keep static hosting to platform (Vercel/Netlify) via CRA build.
7. Delete `app.listen` patterns; export handler functions.

Example `api/_lib/db.js` (connection caching):
```js
const mongoose = require('mongoose');

let cachedConnection = global._mongooseCachedConnection;
if (!cachedConnection) {
  cachedConnection = { conn: null, promise: null };
  global._mongooseCachedConnection = cachedConnection;
}

async function connectToDatabase() {
  if (cachedConnection.conn) return cachedConnection.conn;
  if (!cachedConnection.promise) {
    const uri = process.env.MONGO_URI;
    cachedConnection.promise = mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    }).then(mongoose => mongoose);
  }
  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
}

module.exports = { connectToDatabase };
```

Example handler (Vercel style):
```js
// api/user/index.js
const { connectToDatabase } = require('../_lib/db');
const User = require('../../backend/models/User');

module.exports = async (req, res) => {
  await connectToDatabase();
  if (req.method === 'GET') {
    // list or fetch logic
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
```

Vercel config (optional):
```json
{
  "version": 2,
  "builds": [
    { "src": "api/**/*.js", "use": "@vercel/node" }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

---

### 6) MongoDB options and edge runtimes
- Standard Mongoose over Node serverless is fine on Vercel/Netlify/AWS. Use connection caching to avoid reconnection per request.
- For Cloudflare Workers or Edge Functions, use MongoDB Atlas Data API or a proxy (since standard drivers may not be supported). That is outside current scope; prefer Node serverless first.

---

### 7) Authentication migration (sessions → JWT)

Current state:
- `backend/index.js` uses `express-session` and `passport.session()` (Google OAuth).

Target state:
- Stateless JWT stored in HttpOnly secure cookie. Validate per request.

Steps:
1. Remove session middleware and `passport.session()` usage.
2. On login success (email login or Google callback), sign a JWT:
   - Claims: `sub` (userId), `email`, `roles` (if any), `iat`, `exp` (e.g., 7d)
3. Set cookie: `Set-Cookie: auth=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/`.
4. Create an `authRequired` middleware for serverless handlers that verifies JWT.
5. For logout, clear cookie (set empty value with immediate expiration).

Google OAuth paths:
- Option 1: Use an auth provider (Auth0/Clerk/Firebase Auth) and simply verify provider-issued JWTs in functions.
- Option 2: Keep Passport without sessions:
  - Use OAuth state/PKCE stored in a signed, short-lived cookie
  - On callback, upsert user in DB, then issue your own JWT

---

### 8) Route-by-route migration map (from backend to serverless)

Map existing routes under `backend/routes/`:
- `auth.js` → `api/auth/*.js`
- `googleAuth.js` → `api/auth/google.js` (callback + issue JWT)
- `ticket.js` → `api/ticket/*.js`
- `ticket_user.js` → `api/ticket/user.js`
- `leaderboard.js` → `api/leaderboard/index.js`
- `user.js` → `api/user/*.js`
- `referral.js` → `api/referral/*.js`
- `volunteer.js` → `api/volunteer/*.js`
- `admin.js` / `adminAuth.js` → `api/admin/*.js` (protect with JWT role checks)

For any routes currently only in `server.js` (referral/leaderboard), ensure a single canonical implementation in `api/`.

---

### 9) Environment variables

Define and set in platform dashboard (never commit secrets):
- `MONGO_URI` (or `MONGODB_URI` consistently)
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET` (only if temporarily keeping sessions during Path A)
- Any app-specific settings (e.g., `FRONTEND_URL`, `BACKEND_URL`)

On Vercel: Project Settings → Environment Variables (Development/Preview/Production)
On Netlify: Site Settings → Build & deploy → Environment

---

### 10) Frontend build and hosting

- Keep CRA build: `npm run build` produces `build/`
- Vercel: drag & drop or connect repo; it’ll auto-detect React and deploy static build; API routes live under `api/`
- Netlify: `netlify.toml` with `publish = "build"`; keep `_redirects` for SPA fallback
- Ensure the frontend uses `/api/...` paths that match your serverless routes. Update `proxy` in root `package.json` only for local dev; not used in prod.

---

### 11) Local development

- Path A (Netlify):
  - `netlify dev` to run functions and proxy `/api/*`
- Path B (Vercel):
  - `vercel dev` to run `api/` locally
- Or keep existing concurrently script for frontend and a local Node server while migrating, but prefer platform CLIs to mirror prod.

---

### 12) Deployment steps (by platform)

Vercel (Path B):
1. Create `api/` handlers and shared libs
2. Push to GitHub; import repo into Vercel
3. Configure env vars (Dev/Preview/Prod)
4. Deploy; verify functions under `/api/*`

Netlify (Path A or B):
1. Create `netlify/functions/` (Path A) or `netlify/functions/*` per route (Path B)
2. Add `netlify.toml` and `_redirects` rules
3. Configure env vars
4. `netlify deploy --prod` or connect repo for CI

AWS (Serverless Framework/SST):
1. Initialize framework (e.g., `serverless.yml` or SST stacks)
2. Create one Lambda (Path A) or multiple (Path B)
3. Configure APIGW routes and env vars
4. Deploy; set custom domain if needed

---

### 13) Testing and validation checklist

- Database
  - Cold start path connects only once per runtime
  - Duplicate key handling works as expected
- Auth
  - JWT issuance on login and Google callback
  - Protected routes reject invalid/missing tokens
  - Cookie flags: HttpOnly, Secure, SameSite
- Routes
  - All `/api/*` endpoints return correct status codes in prod
  - SPA routing works; 200 fallbacks configured
- Observability
  - Add minimal logging per handler for method, path, requestId
  - Verify platform logs for errors and slow starts

---

### 14) Rollout strategy

- Phase 1: Stand up serverless API on a preview domain; keep current backend running for reference
- Phase 2: Switch frontend API base URL to preview; test full flows (register, login, referral, leaderboard, admin)
- Phase 3: Promote to production; monitor logs and DB metrics
- Phase 4: Decommission old Node server(s) after stability window

---

### 15) Timeline estimate

- Path A (quick wrap): 0.5–1 day including deployment and sanity tests
- Path B (clean refactor): 1–2 days for core routes + OAuth, 0.5 day for polish

---

### 16) Follow-ups and nice-to-haves

- Replace Google Passport with a hosted auth provider to simplify callback/state
- Add rate limiting per route (platform or code)
- Consider moving read-heavy endpoints to edge functions with a cache layer
- Add CI checks for `api/` (lint, type check if you add TS)


