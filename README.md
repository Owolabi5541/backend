# backend

npm **workspaces** monorepo: HTTP **gateway**, **users** and **wallet** gRPC microservices, shared **proto** and **Prisma** libraries.

## Layout

| Path | Role |
|------|------|
| `apps/gateway` | HTTP API → gRPC (`/api`, Swagger at `/docs`) |
| `apps/users` | User gRPC service |
| `apps/wallet` | Wallet gRPC service |
| `libs/proto` | Shared `.proto` files and `PROTO_PATHS` |
| `libs/prisma` | Prisma: `user/` and `wallet/` schemas + migrations |
| `postman` | `backend.postman_collection.json` |

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

## Project setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if your Postgres host, ports, or credentials differ.

## Database (Docker)

```bash
npm run docker:up
```

Wait until Postgres is ready, then run migrations.

## Prisma migrations and generate

Two separate Prisma projects live under `libs/prisma/user/` and `libs/prisma/wallet/`. Always run commands from the **repository root** so `.env` is found.

**First time or clean database:**

```bash
npm run migrate:reset
npm run generate
```

**After you change a Prisma schema (development):**

```bash
npm run migrate:dev
npm run generate
```

### Useful scripts

| Command | Purpose |
|--------|---------|
| `npm run migrate:reset` | Reset both DB schemas and re-apply migrations |
| `npm run migrate:dev` | `migrate dev` for user, then wallet |
| `npm run generate` | Generate both Prisma clients |
| `npm run prisma:studio:user` | Prisma Studio (user DB) |
| `npm run prisma:studio:wallet` | Prisma Studio (wallet DB) |

## How to run services

Use **three terminals** at the repo root. **Start Wallet before Users** (creating a user calls the Wallet service over gRPC).

```bash
# Terminal 1
npm run dev:wallet

# Terminal 2
npm run dev:users

# Terminal 3
npm run dev:gateway
```

| Service | Role | Default |
|--------|------|---------|
| Wallet | gRPC | `WALLET_SERVICE_URL` (e.g. `0.0.0.0:50052`) |
| Users | gRPC | `USER_SERVICE_URL` (e.g. `0.0.0.0:50051`) |
| Gateway | HTTP → gRPC | `GATEWAY_PORT` (default **3000**) |

- **REST base path:** `http://localhost:3000/api/...`
- **Swagger / OpenAPI UI:** `http://localhost:3000/docs`

## Example requests

Base URL for JSON APIs: **`http://localhost:3000/api`**. Replace `USER_ID` with a UUID from the create-user response.

### Create user

Passwords are stored as **bcrypt** hashes (never returned). Minimum length **8** characters.

```bash
curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","name":"John Doe","password":"secretpass123"}'
```

### List all users

```bash
curl -s http://localhost:3000/api/users
```

### Get user by id

```bash
curl -s http://localhost:3000/api/users/USER_ID
```

### Create wallet (manual; usually unnecessary — one is created with the user)

```bash
curl -s -X POST http://localhost:3000/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID"}'
```

### Credit wallet

```bash
curl -s -X POST http://localhost:3000/api/wallets/USER_ID/credit \
  -H "Content-Type: application/json" \
  -d '{"amount":5000}'
```

### Debit wallet

```bash
curl -s -X POST http://localhost:3000/api/wallets/USER_ID/debit \
  -H "Content-Type: application/json" \
  -d '{"amount":2000}'
```

### Get wallet

```bash
curl -s http://localhost:3000/api/wallets/USER_ID
```

### Postman

Import **`postman/backend.postman_collection.json`**. Set **`baseUrl`** to **`http://localhost:3000/api`** and **`userId`** after creating a user.

## Repository layout (deliverables)

| Item | Location |
|------|----------|
| Source | `apps/users`, `apps/wallet`, `apps/gateway`, `libs/*` |
| Prisma | `libs/prisma/user/schema.prisma`, `libs/prisma/wallet/schema.prisma` |
| Proto | `libs/proto/src/protos/*.proto` |
| Examples | This section + `postman/` |

## Architecture (short)

- **Users** and **Wallet** talk over **gRPC** using shared `.proto` files.
- **Wallet** checks **User** exists (`GetUserById`) before creating a wallet; **Users** triggers **CreateWallet** after signup.
- **Gateway** exposes HTTP under **`/api`** and proxies to gRPC.

## Data models

- **User** (`user_service` schema): `id`, `email`, `name`, `passwordHash`, `createdAt` (password not in gRPC `User` message).
- **Wallet** (`wallet_service` schema): `id`, `userId`, `balance`, `createdAt`.

## Proto files

- `libs/proto/src/protos/user.proto` — `UserService` (CreateUser, GetUserById, GetAllUsers).
- `libs/proto/src/protos/wallet.proto` — `WalletService` (CreateWallet, GetWallet, CreditWallet, DebitWallet).
