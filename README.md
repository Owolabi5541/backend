# backend

npm **workspaces** monorepo: HTTP gateway, **users** and **wallet** gRPC apps (services in a later commit), shared **proto** and **Prisma** libraries.

This commit adds **PostgreSQL schemas**, **Prisma migrations**, **Protocol Buffer** definitions, **Docker Compose**, and **environment samples**.

## Layout

| Path | Role |
|------|------|
| `apps/gateway` | HTTP API (next commit) |
| `apps/users` | User gRPC service (next commit) |
| `apps/wallet` | Wallet gRPC service (next commit) |
| `libs/proto` | Shared `.proto` files and `PROTO_PATHS` |
| `libs/prisma` | Prisma: `user/` and `wallet/` schemas + migrations |
| `postman` | Postman collection (next commit) |

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

Wait until Postgres is ready, then run migrations (below).

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

Equivalent raw commands (from repo root):

```bash
npx prisma migrate dev --schema=libs/prisma/user/schema.prisma
npx prisma migrate dev --schema=libs/prisma/wallet/schema.prisma
npx prisma generate --schema=libs/prisma/user/schema.prisma
npx prisma generate --schema=libs/prisma/wallet/schema.prisma
```

### Useful scripts

| Command | Purpose |
|--------|---------|
| `npm run migrate:reset` | Reset both DB schemas and re-apply migrations |
| `npm run migrate:dev` | `migrate dev` for user, then wallet |
| `npm run generate` | Generate both Prisma clients |
| `npm run prisma:studio:user` | Prisma Studio (user DB) |
| `npm run prisma:studio:wallet` | Prisma Studio (wallet DB) |

## Requirements

- **User** model: `id`, `email`, `name`, `passwordHash`, `createdAt` (password stored hashed; not in gRPC `User` message).
- **Wallet** model: `id`, `userId`, `balance`, `createdAt`.

## Proto files

- `libs/proto/src/protos/user.proto` — `UserService` (CreateUser, GetUserById, GetAllUsers).
- `libs/proto/src/protos/wallet.proto` — `WalletService` (CreateWallet, GetWallet, CreditWallet, DebitWallet).
