# Grocer

Grocer is a grocery delivery platform connecting buyers with neighbourhood grocery sellers. Buyers browse and
search sellers' catalogs, add items to a cart, and check out with pay-on-delivery; sellers manage their own
catalog, toggle stock, and work orders through a live queue. It's a MERN-stack app (MongoDB, Express, React,
Node), built end to end from a Figma design, a SysML system model, and a five-epic product backlog.

## Setup

### Prerequisites

- Node.js 18+ and npm
- A MongoDB instance (local `mongod`, or a hosted cluster such as MongoDB Atlas)

### Install

```bash
npm run install-all
```

This installs the root tooling plus the `backend` and `frontend` workspaces.

### Configure

Copy the backend environment template and fill in your own values:

```bash
cp backend/.env.example backend/.env
```

`backend/.env` fields:

- `PORT` — port the API listens on (defaults to `5001`)
- `MONGO_URI` — your MongoDB connection string, e.g. `mongodb://localhost:27017/grocer` for a local instance,
  or an Atlas SRV URI (`mongodb+srv://...`) for a hosted cluster
- `JWT_SECRET` — a long random string used to sign auth tokens

The frontend reads its API base URL from `REACT_APP_API_URL` (frontend/`.env`), defaulting to
`http://localhost:5001/api` if unset — fine for local development against the backend above.

### Run

```bash
npm run dev
```

Runs the backend (`nodemon`, auto-restart) and the frontend (CRA dev server) together. The app is served at
`http://localhost:3000`, proxying API calls to `http://localhost:5001/api`.

### Test

```bash
npm test
```

Runs the backend suite (Mocha/Chai/Sinon, stubbed against the Mongoose models — no live database required) and
the frontend suite (React Testing Library via CRA's Jest runner) back to back. Run them independently with
`npm run test:backend` or `npm run test:frontend`.

## Architecture

**Stack:** MongoDB + Mongoose, Express, React (Create React App, plain JavaScript — no TypeScript), Node.js,
Tailwind CSS, React Router v6, Axios.

**Backend** (`backend/`): a conventional Express REST API.

- `models/` — Mongoose schemas: `User` (role, name, email, address, dob, bcrypt-hashed password),
  `Product` (seller-owned catalog item with a text index for search), `Order` (buyer/seller refs, an item
  snapshot taken at checkout time, total, delivery address, status).
- `controllers/` — request handlers per resource (`authController`, `productController`, `orderController`),
  each paired with a `validate*Payload` helper in `utils/validators.js` that mirrors the frontend's client-side
  validation.
- `middleware/authMiddleware.js` — `protect` (verifies the JWT and attaches `req.user`) and
  `requireRole(role)` (buyer/seller route guards).
- `routes/` — one router per resource, mounted in `server.js` under `/api/auth`, `/api/products`,
  `/api/orders`.

**Frontend** (`frontend/src/`): route-per-screen pages under `pages/`, split into `pages/buyer/` and
`pages/seller/` once the two roles diverge, matching the Figma screens 1:1 (Home, Signup, Login, Shop-Buyer,
Cart / Cart-Empty, Checkout, Order Tracking / Order Tracking-Delivered, Shop-Seller, Edit Item-Seller, Order
Management Board-Seller / -Empty). Shared concerns live in `services/` (one Axios-based service module per
backend resource), `utils/` (client-side validation, the localStorage-backed cart, the localStorage-backed
session), and `axiosConfig.js` (a shared Axios instance that injects the JWT from the stored session).

**Auth:** JWT-based. On signup/login the backend returns `{ ...user, token }`; the frontend stores it in
`localStorage` and Axios attaches `Authorization: Bearer <token>` to every request. `role` (`buyer` or
`seller`) drives both UI routing (which screens a user sees) and backend authorization (`requireRole`).

**Cart:** kept client-side in `localStorage` rather than in the database — it's disposable, single-device
state that only needs to survive a page refresh, so a backend cart model would have been unnecessary
complexity for this scope. It's converted into a real `Order` document only at checkout.

## Known limitations

Carried over from each epic's documented "Out of Scope" boundaries, plus implementation notes worth flagging:

- **Single-seller carts.** An `Order` has one `seller` field, so a cart is assumed to hold items from a single
  seller at checkout. Multi-seller carts/orders (splitting one checkout into one order per seller) are not
  implemented.
- **Payments are unimplemented by design.** Pay-on-delivery is the only payment method, per the backlog's
  scope — there's no payment gateway integration.
- **No password reset / email verification.** Signup and login are implemented; account recovery flows are
  out of scope for this backlog.
- **No real-time updates.** The seller's order queue and the buyer's tracking page are fetched on load; there's
  no WebSocket/polling layer, so a buyer won't see a status change until they revisit or refresh the tracking
  page.
- **No image upload.** Product images are a plain URL field; there's no file upload/storage integration.
- **No pagination.** Product browsing and order lists return the full result set — fine at this scope, but
  would need pagination before a catalog or order history grows large.
- **Order editing/cancellation** isn't implemented for either buyers or sellers once an order is placed.
- **The SysML system model** (a draw.io diagram supplied via a Google Drive link) could not be programmatically
  fetched during development (Drive's export/download endpoints were not reachable from the build
  environment); the backlog's detailed epics/user stories/acceptance-criteria text was used as the
  authoritative functional source instead, and the delivered feature set was cross-checked against it.

## Deployment

Not deployed to a live URL for this submission. To deploy:

1. **Database:** provision a MongoDB Atlas cluster (or any reachable MongoDB instance) and note its
   connection string.
2. **Backend:** deploy `backend/` to a Node host (Render, Railway, Fly.io, a VM, etc.). Set `MONGO_URI`,
   `JWT_SECRET`, and `PORT` as environment variables on the host. Start command: `npm start` (runs
   `node server.js`).
3. **Frontend:** set `REACT_APP_API_URL` to the deployed backend's `/api` URL, then `npm run build` inside
   `frontend/` and deploy the resulting `frontend/build/` directory to a static host (Netlify, Vercel, S3 +
   CloudFront, etc.).
4. **CORS:** the backend enables `cors()` with default (permissive) settings, suitable for connecting a
   separately-hosted frontend; tighten it to the deployed frontend's origin before treating this as
   production-ready.

## Backlog traceability

The full backlog (epics, user stories, sub-tasks) is implemented and tracked issue-by-issue through this
repository's branch and commit history, using JIRA-style keys (`GROC-*`, since no live JIRA instance was
connected for this project):

| Epic | User Stories |
| --- | --- |
| GROC-1 — User Authentication | GROC-2 Buyer/seller signup · GROC-11 Login |
| GROC-20 — Product Catalog Management | GROC-21 Product create/edit · GROC-30 Stock toggle · GROC-39 Search/category browsing |
| GROC-48 — Cart & Checkout | GROC-49 Cart management · GROC-58 Pay-on-delivery checkout |
| GROC-66 — Order Management Dashboard | GROC-67 Live order queue · GROC-76 Order status updates |
| GROC-85 — Order Status Tracker | GROC-86 Buyer order progress tracker |

Each user story was built on its own `feature/GROC-*` branch, one commit per sub-task (`feat`/`test`/`fix`
prefixed, referencing the exact `GROC-X.Y` sub-task), then merged into `main`. See `docs/backlog.md` for the
same mapping and `git log --graph` for the full chronology.
