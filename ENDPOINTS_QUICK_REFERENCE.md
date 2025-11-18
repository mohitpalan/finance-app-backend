# Backend Endpoints Quick Reference

## New Endpoints

### 1. GET /api/v1/auth/me
**Get Current User Information**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User retrieved successfully"
}
```

---

### 2. GET /api/v1/dashboard
**Get Dashboard Statistics**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000,
    "totalExpenses": 3000,
    "netIncome": 2000,
    "accountsBalance": 2000,
    "recentTransactions": [ /* 5 most recent transactions */ ],
    "monthlyTrend": [
      { "month": "Jul", "income": 1000, "expenses": 500 },
      { "month": "Aug", "income": 1200, "expenses": 600 }
      // ... 6 months total
    ]
  },
  "message": "Dashboard statistics retrieved successfully"
}
```

## Implementation Files

### Auth Module
- Controller: `src/modules/auth/auth.controller.ts` (line 56-64)
- Service: `src/modules/auth/auth.service.ts` (line 161-184)

### Dashboard Module
- Module: `src/modules/dashboard/dashboard.module.ts`
- Controller: `src/modules/dashboard/dashboard.controller.ts`
- Service: `src/modules/dashboard/dashboard.service.ts`

## Testing

Run the test script:
```bash
cd backend
npm run start:dev  # Start server first
node test-endpoints.js  # In another terminal
```

## Authentication Required

Both endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Get a token by calling:
```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```
