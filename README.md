# Restro POS

Restaurant point-of-sale: tables, menu, orders, receipts, admin dashboard.

- **Frontend**: React 19 + Vite, Redux Toolkit (cart/customer), TanStack Query (server data), Tailwind
- **Backend** (`backend/`): Express 5 + MongoDB (Mongoose), JWT in an httpOnly cookie, Zod validation

## Quick start (no MongoDB install needed)

```bash
npm install
npm --prefix backend install
npm --prefix backend run dev:mem
```

In a second terminal:

```bash
npm run dev
```

Open http://localhost:5173. `dev:mem` starts an in-memory MongoDB, seeds the menu and 12 tables,
and runs the API on port 8000 (Vite proxies `/api` to it). Data is wiped when it stops.

**The first account you register becomes Admin.** Every later sign-up starts as Waiter; the admin
assigns roles from Dashboard → Staff.

## With a real MongoDB

```bash
cp backend/.env.example backend/.env   # then fill MONGODB_URI and JWT_SECRET
npm --prefix backend run seed           # menu + tables (safe to re-run)
npm --prefix backend run dev
```

## Docker (server / Proxmox VM)

```bash
cp backend/.env.example backend/.env   # set JWT_SECRET; COOKIE_SECURE=false if served over plain HTTP
docker compose up -d --build
docker compose exec backend node scripts/seed.js
```

App on port 80. MongoDB data lives in the `mongo-data` volume. MongoDB 5+ needs a CPU with AVX:
in Proxmox set the VM's CPU type to `host`.

## Roles

| Action | Waiter | Cashier | Admin |
| --- | :-: | :-: | :-: |
| Create orders, change order status, view tables/orders | ✓ | ✓ | ✓ |
| Dashboard: add tables & dishes, edit prices, hide dishes | | | ✓ |
| Dashboard: manage staff roles | | | ✓ |

## Order flow

1. Home → dish button → customer name, phone, guests
2. Pick an available table
3. Add dishes to the cart, choose Cash/Online, **Place Order** → receipt
4. Orders page: *Mark as Ready* → *Complete & free table*

Prices and tax are always computed by the server from the database; the amounts shown in
the cart are only a preview.

## Online payment (optional)

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`. Without both, the Online button
is disabled. Note Razorpay charges in INR while the UI displays DH.

## Scripts

| Where | Command | What |
| --- | --- | --- |
| root | `npm run dev` / `build` / `lint` | Frontend |
| backend | `npm run dev:mem` | API + in-memory MongoDB |
| backend | `npm run dev` / `start` | API with `backend/.env` |
| backend | `npm run seed` | Seed menu & tables |
| backend | `npm test` | API integration tests |

## API

All under `/api`; everything except register/login/logout needs a session.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/user/register`, `/user/login`, `/user/logout` | rate-limited |
| GET | `/user` | current user |
| GET / PUT | `/user/all`, `/user/:id/role` | Admin |
| GET / POST / PUT | `/table`, `/table/:id` | POST is Admin |
| GET / POST / PUT | `/menu`, `/menu/:id` | POST/PUT Admin |
| GET / POST / PUT | `/order`, `/order/:id` | `Completed` frees the table |
| GET | `/stats` | today's revenue, counts, popular dishes |
| GET / POST | `/payment/config`, `/payment/create-order`, `/payment/verify-payment` | Razorpay |
