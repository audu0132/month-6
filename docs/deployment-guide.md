# Enterprise Microservices Deployment Guide

This guide details how to launch the complete enterprise platform in **Local Development** (Docker Compose) and **Production Orchestration** (Kubernetes).

---

## 1. Local Development via Docker Compose

### Prerequisites
- Docker Engine 24+ & Docker Compose v2+
- Node.js 20+ (for local test execution)

### Launch Commands
```bash
# 1. Clone repository & enter project directory
cd "month 6"

# 2. Build and start all 5 microservices, frontend, and databases
docker compose up --build -d

# 3. View live aggregation logs across all microservices
docker compose logs -f

# 4. Tear down containers and volumes
docker compose down -v
```

### Verified Service Ports
| Service | URL / Port | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:3000](http://localhost:3000) | React SPA + Executive Console |
| **API Gateway** | [http://localhost:4000](http://localhost:4000) | Main API ingress |
| **Gateway Health** | [http://localhost:4000/health](http://localhost:4000/health) | Gateway Liveness probe |
| **Auth Service** | [http://localhost:4001](http://localhost:4001) | Identity & JWT provider |
| **User Service** | [http://localhost:4002](http://localhost:4002) | User profiles & directory |
| **Product Service**| [http://localhost:4003](http://localhost:4003) | Catalog & stock engine |
| **Order Service** | [http://localhost:4004](http://localhost:4004) | Order & payment pipeline |
| **MongoDB** | `localhost:27017` | Persistent document storage |
| **Redis** | `localhost:6379` | Token blacklist & caching |

---

## 2. Production Deployment via Kubernetes

### Step 1: Apply ConfigMaps & Secrets
```bash
# Apply environment configuration
kubectl apply -f kubernetes/configmaps/app-configmap.yaml

# Apply encrypted secrets (customize passwords in production)
kubectl apply -f kubernetes/configmaps/secrets-template.yaml
```

### Step 2: Apply Microservices Deployments
```bash
kubectl apply -f kubernetes/deployments/
```

### Step 3: Apply ClusterIP Services & Ingress
```bash
kubectl apply -f kubernetes/services/
```

### Step 4: Validate Cluster State
```bash
# Verify all pods are running and healthy
kubectl get pods -l app.kubernetes.io/part-of=enterprise-platform

# Verify services
kubectl get svc

# Inspect ingress configuration
kubectl get ingress
```

---

## 3. Zero-Downtime Rolling Updates
To roll out a new image version with zero downtime:
```bash
kubectl set image deployment/api-gateway api-gateway=enterprise/api-gateway:v1.1.0
kubectl rollout status deployment/api-gateway
```
Kubernetes guarantees that old pods remain serving traffic until new pods pass their HTTP `/health` readiness probes.
