# Enterprise Microservices API Documentation

All microservices are unified under the **API Gateway** (`http://localhost:4000/api`).

---

## 1. Global Headers
| Header | Type | Description |
| :--- | :--- | :--- |
| `Authorization` | `string` | `Bearer <JWT_ACCESS_TOKEN>` for protected endpoints |
| `x-correlation-id` | `string` | Optional unique request tracing UUID |
| `Content-Type` | `string` | `application/json` |

---

## 2. Authentication Service (`/api/auth`)

### 2.1 Register Account
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "name": "Jane Developer",
  "email": "jane@enterprise.io",
  "password": "SecurePassword123!",
  "role": "customer"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Account registered successfully",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 900,
    "user": { "id": "usr_...", "name": "Jane Developer", "email": "jane@enterprise.io", "role": "customer" }
  }
}
```

### 2.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "admin@enterprise.io",
  "password": "Password123!"
}
```
- **Response `200 OK`**: Returns access and refresh token pair.

### 2.3 Rotate Refresh Token
- **Endpoint**: `POST /api/auth/refresh`
- **Request Body**: `{ "refreshToken": "..." }`
- **Response `200 OK`**: Fresh access token and newly rotated refresh token.

---

## 3. Product Catalog Service (`/api/products`)

### 3.1 List Products
- **Endpoint**: `GET /api/products`
- **Query Parameters**:
  - `category` (string, optional)
  - `search` (string, optional)
  - `minPrice` (number, optional)
  - `maxPrice` (number, optional)
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "prod_ent_001",
      "name": "Enterprise Kubernetes Cluster Node",
      "price": 1299.99,
      "category": "Hardware",
      "stock": 45,
      "rating": 4.9
    }
  ]
}
```

### 3.2 Reserve Inventory (Inter-Service)
- **Endpoint**: `POST /api/products/reserve`
- **Request Body**:
```json
{
  "items": [
    { "productId": "prod_ent_001", "quantity": 1 }
  ]
}
```
- **Response `200 OK`**: Deducts stock atomically.

---

## 4. Order Management Service (`/api/orders`)

### 4.1 Create Order
- **Endpoint**: `POST /api/orders`
- **Request Body**:
```json
{
  "userId": "usr_cust_003",
  "customerName": "Jane Customer",
  "customerEmail": "jane@enterprise.io",
  "items": [
    { "productId": "prod_ent_003", "name": "Security Hardware Key", "price": 89.95, "quantity": 2 }
  ],
  "shippingAddress": {
    "street": "100 Silicon Way",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94107",
    "country": "USA"
  }
}
```
- **Response `201 Created`**: Returns order record with status `PENDING`.

### 4.2 Pay Order
- **Endpoint**: `POST /api/orders/:id/pay`
- **Response `200 OK`**: Simulates payment capture and transitions order status to `PAID`.

### 4.3 Analytics & KPIs
- **Endpoint**: `GET /api/orders/analytics/metrics`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 14,
    "totalRevenue": 18450.25,
    "statusBreakdown": { "DELIVERED": 8, "PAID": 4, "PROCESSING": 2 }
  }
}
```
