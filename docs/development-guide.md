# Enterprise Microservices Development Guide

## 1. Local Monorepo Workflow

The project uses npm workspaces to coordinate the microservices and frontend application simultaneously.

### Install All Dependencies
```bash
npm install
```

### Running Services Locally in Development Mode
Each service can be run locally using ts-node-dev:
```bash
# Terminal 1: API Gateway
cd services/api-gateway && npm run dev

# Terminal 2: Auth Service
cd services/auth-service && npm run dev

# Terminal 3: User Service
cd services/user-service && npm run dev

# Terminal 4: Product Service
cd services/product-service && npm run dev

# Terminal 5: Order Service
cd services/order-service && npm run dev

# Terminal 6: React Frontend
cd frontend && npm run dev
```

---

## 2. Testing Standards

Every microservice includes automated unit and integration tests using Jest and Supertest.

```bash
# Run all tests across workspaces
npm test

# Run tests with coverage reports
npm run test:coverage
```

### Writing Microservice Tests
- Maintain test files under `services/<service-name>/tests/`.
- Verify HTTP status codes, error payloads, and database mock states.
- Avoid external side effects by leveraging in-memory repositories or test containers.

---

## 3. Git & Pull Request Guidelines

### Branch Naming
- `feature/<ticket>-<short-description>` (e.g., `feature/NX-102-jwt-rotation`)
- `fix/<ticket>-<short-description>`
- `refactor/<ticket>-<short-description>`

### Commit Message Convention (Conventional Commits)
```
feat(auth): implement token rotation and blacklist verification
fix(gateway): resolve CORS preflight handling for custom headers
docs(k8s): update deployment guide for ingress annotations
test(order): add integration test for insufficient inventory conflict
```
