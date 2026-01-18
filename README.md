# Node.js TypeScript Clean Architecture API Base

This is a starter template for building Node.js APIs using Clean Architecture principles with TypeScript. The architecture follows the separation of concerns principle to ensure maintainability, testability, and scalability.

## 🏗️ Architecture Overview

The project follows Clean Architecture with three main layers:

### 1. Domain Layer (`src/domain`)
- Contains business entities, rules, and interfaces
- Independent of external frameworks and databases
- Defines abstract repository interfaces

### 2. Application Layer (`src/application`)
- Contains use cases (business logic)
- Orchestrates data flow between domain and infrastructure
- Implements business rules

### 3. Infrastructure Layer (`src/infrastructure`)
- Contains frameworks, drivers, and external tools
- Implements interfaces defined in the domain layer
- Handles HTTP requests, database connections, etc.

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Dependency Injection**: Awilix
- **Logging**: Pino with Pretty printing
- **Validation**: Zod
- **Testing**: Vitest
- **Architecture Pattern**: Clean Architecture

## 📁 Project Structure

```
src/
├── domain/                 # Business entities and interfaces
│   └── user/
│       ├── entities/       # Domain entities
│       └── repositories/   # Repository interfaces
├── application/            # Use cases and business logic
│   └── user/
│       └── use-cases/      # Business use cases
├── infrastructure/         # External implementations
│   ├── database/           # Database connections
│   ├── http/               # Controllers and routes
│   ├── logging/            # Logging implementation
│   ├── middleware/         # Express middleware
│   └── validation/         # Input validation schemas
└── utils/                  # Utility functions (Result pattern)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Start development server with watch mode
- `npm start` - Start the production build
- `npm test` - Run tests with Vitest
- `npm run test:run` - Run tests once without watch mode
- `npm run test:coverage` - Run tests and generate coverage report

## 🧪 Testing

The project uses Vitest for unit and integration testing. Tests should be placed in corresponding `__tests__` directories or with a `.test.ts`/`.spec.ts` extension.

## 📝 API Endpoints

### User Management

- `POST /users` - Create a new user
  - Request Body: `{ "email": "user@example.com" }`
  - Response: `{ "id": "uuid", "email": "user@example.com", "createdAt": "date" }`

## 🏷️ Patterns Used

### Result Pattern

The project implements a Result/Either pattern for consistent error handling:

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

### Dependency Injection

Dependency injection is handled using Awilix, allowing for easy testing and loose coupling between components.

### Validation

Input validation is performed using Zod schemas to ensure data integrity.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.