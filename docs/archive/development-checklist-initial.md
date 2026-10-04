### 🟦 Phase 1: Environment & Core Setup

* [x] **WSL & Tooling:** Node 24 and Git available.
* [x] **Git Identity:** Author and Email correctly configured.
* [x] **Project Initialization:** `pnpm init` (or `npm`) and basic `package.json`.
* [x] **TypeScript Configuration:** * Setup `tsconfig.json` with **Path Aliases** (`@domain`, `@app`, `@infra`).
* [x] Strict mode enabled.
* [x] **Basic Ignore:** Standard `.gitignore` (node_modules, dist, .env).

### 🟩 Phase 2: The "Clean" Skeleton (Base Pattern)

* [x] **Directory Scaffolding:** Create `src/domain`, `src/application`, and `src/infrastructure`.
* [x] **Result Pattern:** Implement a reusable `Result<T, E>` or `Either` class for consistent error handling.
* [x] **Logging Infrastructure:** Configure **Pino** with a "pretty-print" development mode.
* [x] **Base Entity:** Create the `User` Entity and `IUserRepository` interface (Domain Layer).
* [x] **Validation:** Set up **Zod** schema structures for request validation.

### 🟨 Phase 3: Web & Infrastructure Layer

* [x] **Server Setup:** Initialize **Express** (or Fastify) in the Infrastructure layer.
* [x] **Dependency Injection (DI):** Configure **Awilix** or manual container injection to decouple layers.
* [x] **Middleware:** Create global error handling and "Request Logger" middlewares.
* [x] **Database (Mock/Initial):** Setup an in-memory repository first, then a real DB adapter (Prisma/TypeORM).

### 🟧 Phase 4: Developer Experience (DX) & CI

* [x] **Testing Setup:** Configure **Vitest** for Unit (Domain) and Integration (Infra) tests.
* [x] **Scripts:** Define `dev`, `build`, `start`, and `test` scripts.
* [x] **Environment:** Create a `.env.example` file.
* [x] **Public Documentation:** Write a professional `README.md` explaining the Clean Architecture flow.

### 🟥 Phase 5: Production & Deployment Preparation

* [x] **Security Hardening:** Implement **Helmet**, **CORS**, and **Rate Limiting**.
* [x] **Graceful Shutdown:** Handle process termination signals properly.
* [x] **Error Handling:** Centralized error handling and logging.
* [x] **Docker Configuration:** Create Dockerfile and docker-compose for containerization.
* [x] **Health Checks:** Implement health check endpoints for monitoring.
* [x] **Configuration Management:** Advanced environment configuration for different environments.