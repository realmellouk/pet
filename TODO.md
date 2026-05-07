# TODO

## Completed diagnosis
- Confirmed admin endpoints are protected by `authorize('admin')`.
- Confirmed admin seed user exists in `database/schema.sql` (`admin@petmarket.com`).
- Confirmed JWT signing + verification depend on `process.env.JWT_SECRET`.
- Repo search shows no `.env` / `JWT_SECRET` configuration present.

## Required fix
1. Create `server/.env` with DB + JWT settings (PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL).
2. Restart backend server (`cd server && npm run dev`).

## Verify
3. Log in as admin using `admin@petmarket.com` / `Admin@123`.
4. Ensure navigation to `/admin` works and admin API calls don’t return 401/403.

