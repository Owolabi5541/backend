# backend

Monorepo (npm workspaces): **gateway** (HTTP), **users** and **wallet** (gRPC), shared **proto** and **Prisma**.

| Path | Role |
|------|------|
| `apps/gateway` | REST under `/api`, Swagger at `/docs` |
| `apps/users` | User gRPC service |
| `apps/wallet` | Wallet gRPC service |
| `libs/proto` | `.proto` files |
| `libs/prisma` | User + wallet schemas and migrations |
| `postman/` | Postman collection |

**Prerequisites:** Node.js 18+, Docker (for PostgreSQL).

---

## Project setup

1. Install dependencies and env file:

   ```bash
   npm install
   cp .env.example .env
   ```

2. Start Postgres and ensure the `backend` database exists (matches `USER_DATABASE_URL` / `WALLET_DATABASE_URL`):

   ```bash
   npm run docker:up
   npm run db:ensure
   ```

3. Generate Prisma clients and apply migrations (from the **repo root**):

   ```bash
   npm run generate
   npm run migrate:dev
   ```

   For a **clean slate** (drops data in both schemas):

   ```bash
   npm run migrate:reset
   npm run generate
   ```

If Postgres is not on `localhost:5432`, or you use another user/password, edit `.env`. If something else already uses port **5432**, either stop it or map Docker to another host port and update the URLs in `.env`.

---

## How to run services

Use **three terminals** at the repo root. **Start wallet, then users, then gateway** (signup creates a wallet over gRPC).

```bash
npm run dev:wallet    # Terminal 1 — gRPC (default WALLET_SERVICE_URL)
npm run dev:users     # Terminal 2 — gRPC (default USER_SERVICE_URL)
npm run dev:gateway   # Terminal 3 — HTTP (default GATEWAY_PORT=3000)
```

| What | URL |
|------|-----|
| REST API | `http://localhost:3000/api` |
| Swagger | `http://localhost:3000/docs` |

---

## Migrations

Prisma is split into **`libs/prisma/user`** and **`libs/prisma/wallet`**. Run all commands from the **repository root** so `.env` is loaded.

| Command | When |
|---------|------|
| `npm run migrate:dev` | After you change a schema during development |
| `npm run migrate:reset` | Full reset of both schemas (destructive) |
| `npm run generate` | After migrations or schema changes — regenerates `@prisma/user-client` and `@prisma/wallet-client` |

Handy: `npm run prisma:studio:user` / `prisma:studio:wallet` for Prisma Studio.

---

## Example requests

Base URL: **`http://localhost:3000/api`**. Replace `USER_ID` with a UUID from the create-user response.

**Create user** (password min. 8 characters):

```bash
curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","name":"John Doe","password":"secretpass123"}'
```

**List users:**

```bash
curl -s http://localhost:3000/api/users
```

**Get user by id:**

```bash
curl -s http://localhost:3000/api/users/USER_ID
```

**Create wallet** (usually automatic on signup):

```bash
curl -s -X POST http://localhost:3000/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID"}'
```

**Credit / debit / get wallet:**

```bash
curl -s -X POST http://localhost:3000/api/wallets/USER_ID/credit \
  -H "Content-Type: application/json" \
  -d '{"amount":5000}'

curl -s -X POST http://localhost:3000/api/wallets/USER_ID/debit \
  -H "Content-Type: application/json" \
  -d '{"amount":2000}'

curl -s http://localhost:3000/api/wallets/USER_ID
```

**Postman:** import `postman/backend.postman_collection.json`, set **`baseUrl`** to `http://localhost:3000/api` and **`userId`** after creating a user.

---

## Architecture (short)

- Gateway speaks HTTP; users and wallet speak gRPC using shared protos.
- Creating a user triggers wallet creation; wallet may call users to verify a user exists.
