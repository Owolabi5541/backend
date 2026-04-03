# backend

NestJS **npm workspaces** monorepo: HTTP **gateway**, **users** and **wallet** gRPC apps, shared **proto** and **prisma** libraries.

This commit establishes the **directory layout** only. Subsequent commits add database schemas, services, and tooling.

## Layout

| Path | Role |
|------|------|
| `apps/gateway` | HTTP API (planned) |
| `apps/users` | User gRPC service (planned) |
| `apps/wallet` | Wallet gRPC service (planned) |
| `libs/proto` | Shared `.proto` definitions (planned) |
| `libs/prisma` | Prisma helpers / schema roots (planned) |
| `postman` | API collection (planned) |

## Requirements

- Node.js 18+
