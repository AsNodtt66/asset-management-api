# 🏗️ ARCHITECTURE OVERVIEW

Dokumentasi architecture aplikasi Asset Management API.

---

## 📊 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                      │
│            (Web Browser, Mobile App, Desktop App)                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS Request
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTIFY SERVER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API ROUTES                            │   │
│  │  ┌─────────────────┬─────────────────┬──────────────┐   │   │
│  │  │  /api/auth      │  /api/assets    │  /api/users  │   │   │
│  │  │  (Auth)         │  (Future)       │  (Future)    │   │   │
│  │  └─────────────────┴─────────────────┴──────────────┘   │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │        MIDDLEWARE CHAIN                        │    │   │
│  │  │  ┌──────────────────────────────────────────┐ │    │   │
│  │  │  │ 1. Request Logging                       │ │    │   │
│  │  │  │ 2. CORS Handling                         │ │    │   │
│  │  │  │ 3. JWT Authentication (if protected)     │ │    │   │
│  │  │  │ 4. RBAC Authorization (if restricted)    │ │    │   │
│  │  │  │ 5. Input Validation                      │ │    │   │
│  │  │  └──────────────────────────────────────────┘ │    │   │
│  │  │                                                │    │   │
│  │  │  ┌──────────────────────────────────────────┐ │    │   │
│  │  │  │        CONTROLLER LOGIC                  │ │    │   │
│  │  │  │  - Authentication (register, login)      │ │    │   │
│  │  │  │  - User Management                       │ │    │   │
│  │  │  │  - Role Management                       │ │    │   │
│  │  │  └──────────────────────────────────────────┘ │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │     PLUGINS                                    │    │   │
│  │  │  - JWT (@fastify/jwt)                         │    │   │
│  │  │  - CORS (@fastify/cors)                       │    │   │
│  │  │  - Swagger (@fastify/swagger)                 │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            ERROR HANDLING & LOGGING                      │   │
│  │  - Global error handler                                 │   │
│  │  - Structured logging (pino)                            │   │
│  │  - Request/Response tracking                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ SQL Queries
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRISMA ORM LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Models:                                                 │   │
│  │  - User (Authentication & Authorization)                │   │
│  │  - Role (Role-Based Access Control)                     │   │
│  │  - Asset (Asset Management)                             │   │
│  │  - Component (Asset Components)                         │   │
│  │  - AssetAssignment (User-Asset Mapping)                 │   │
│  │  - MaintenanceCard (Maintenance Tracking)               │   │
│  │  - Issue (Issue Management)                             │   │
│  │  - etc.                                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Features:                                               │   │
│  │  - Auto relationship management                          │   │
│  │  - Migration system                                      │   │
│  │  - Type-safe queries                                    │   │
│  │  - Connection pooling                                   │   │
│  │  └──────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               PostgreSQL DATABASE                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tables:                                                 │   │
│  │  - users                 - maintenanceCategories        │   │
│  │  - roles                 - routingTables                │   │
│  │  - assets                - maintenanceCards             │   │
│  │  - components            - issues                       │   │
│  │  - assetAssignments      - goodsReceipts               │   │
│  │  - goodsIssues                                          │   │
│  │                                                          │   │
│  │  Indexes: Optimized for performance                    │   │
│  │  Constraints: Foreign keys, Unique keys                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 REQUEST-RESPONSE FLOW

### 1️⃣ Unauthenticated Request (Register/Login)

```
Client Request
     │
     │ POST /api/auth/register
     │ {email, password, name}
     ▼
┌─────────────────────────┐
│  Fastify Server         │
│  Route Handler          │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  User Controller        │
│  - Validate input       │
│  - Check email exists   │
│  - Hash password        │
│  - Create user in DB    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Prisma ORM             │
│  - Execute query        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  PostgreSQL DB          │
│  INSERT INTO users...   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Response to Client     │
│  201 Created            │
│  {user data}            │
└─────────────────────────┘
```

### 2️⃣ Authenticated Request (Protected Route)

```
Client Request
     │
     │ GET /api/auth/me
     │ Authorization: Bearer <token>
     ▼
┌────────────────────────────────────┐
│  Fastify Server                    │
│  preHandler: [authenticate, ...]   │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Authenticate Middleware           │
│  - Extract token from header       │
│  - Verify JWT signature            │
│  - Extract user info               │
│  - Attach to request.user          │
└────────────┬───────────────────────┘
             │
             ├─ ❌ Invalid token?
             │   └─ Reply 401 Unauthorized
             │
             └─ ✅ Valid token? Continue
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  Authorization Check (if needed)   │
        │  - Get user role from DB           │
        │  - Check against allowedRoles      │
        └────────────┬───────────────────────┘
                     │
                     ├─ ❌ Role mismatch?
                     │   └─ Reply 403 Forbidden
                     │
                     └─ ✅ Role match? Continue
                             │
                             ▼
                    ┌────────────────────────────────────┐
                    │  Route Handler / Controller        │
                    │  - Execute business logic          │
                    │  - Query database if needed        │
                    └────────────┬───────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────────────┐
                    │  Response to Client                │
                    │  200 OK                            │
                    │  {requested data}                  │
                    └────────────────────────────────────┘
```

### 3️⃣ Error Handling Flow

```
Request Processing
     │
     ├─ Input Validation Error?
     │  └─ 400 Bad Request
     │
     ├─ Authentication Error?
     │  └─ 401 Unauthorized
     │
     ├─ Authorization Error?
     │  └─ 403 Forbidden
     │
     ├─ Resource Not Found?
     │  └─ 404 Not Found
     │
     ├─ Duplicate/Conflict?
     │  └─ 409 Conflict
     │
     └─ Server Error?
        └─ 500 Internal Server Error
           │
           ├─ Log error details
           ├─ Hide sensitive info in response
           └─ Return generic message
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION FLOW

### JWT Token Flow

```
1. LOGIN
┌──────────────────────────────────┐
│ Client sends: email + password   │
│ Server validates credentials     │
│ Server generates JWT token       │
│ Response: {token, user data}     │
└──────────────────────┬───────────┘
                       │
2. STORE TOKEN
┌──────────────────────────────────┐
│ Client stores token (localStorage)│
└──────────────────────┬───────────┘
                       │
3. SEND REQUESTS
┌──────────────────────────────────────────────┐
│ All subsequent requests include:             │
│ Authorization: Bearer <token>                │
└──────────────────────┬──────────────────────┘
                       │
4. VERIFY TOKEN
┌──────────────────────────────────────────────┐
│ Server receives request                      │
│ Extract token from Authorization header      │
│ Verify JWT signature (using JWT_SECRET)      │
│ Extract user info (userId, role, etc)        │
│ Attach to request.user                       │
└──────────────────────┬──────────────────────┘
                       │
5. AUTHORIZE (if needed)
┌──────────────────────────────────────────────┐
│ Get user's role from database                │
│ Check if role in allowedRoles                │
│ Allow/Deny access                            │
└──────────────────────────────────────────────┘
```

### JWT Token Structure

```
Header                  Payload                  Signature
┌───────────────┐      ┌────────────────┐       ┌───────────────┐
│ {             │      │ {              │       │ HMACSHA256(   │
│  alg: HS256   │  .   │  userId: 1,    │   .   │  base64Url(   │
│  typ: JWT     │      │  email: "...",  │       │    header) +  │
│ }             │      │  role: "ADMIN", │       │   base64Url(  │
│               │      │  iat: 123456,   │       │    payload)   │
│               │      │  exp: 234567    │       │ )             │
│               │      │ }               │       │               │
└───────────────┘      └────────────────┘       └───────────────┘
```

### RBAC Role Hierarchy

```
        ┌──────────────┐
        │  Database    │
        │  (Roles)     │
        └────────┬─────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
   ┌──────┐            ┌──────┐
   │ADMIN │            │ USER │
   │      │            │      │
   │Full  │            │Basic │
   │access│            │access│
   └──────┘            └──────┘
```

---

## 📦 TECHNOLOGY STACK

```
Frontend Layer
├─ Web Browser / Mobile App
└─ Any HTTP client

API Server Layer
├─ Fastify (Web Framework)
├─ @fastify/jwt (Authentication)
├─ @fastify/cors (CORS)
├─ @fastify/swagger (API Documentation)
├─ Node.js/TypeScript (Runtime)
└─ Pino (Logging)

ORM Layer
├─ Prisma
├─ Prisma Client (Type-safe queries)
└─ Prisma Migrate (Schema versioning)

Database Layer
└─ PostgreSQL (Relational Database)
```

---

## 🔒 SECURITY LAYERS

```
1. TRANSPORT LAYER
   ├─ HTTPS/TLS (encryption in transit)
   └─ No sensitive data in URLs

2. AUTHENTICATION LAYER
   ├─ Password hashing (bcryptjs)
   ├─ JWT tokens (signed with secret)
   ├─ Token expiration (24 hours)
   └─ Secure secret storage

3. AUTHORIZATION LAYER
   ├─ Role-based access control (RBAC)
   ├─ Route-level authorization
   ├─ Database-level permissions
   └─ Audit logging

4. INPUT VALIDATION LAYER
   ├─ Schema validation (JSON schema)
   ├─ Type checking (TypeScript)
   ├─ Sanitization
   └─ Constraint checking

5. OUTPUT PROTECTION LAYER
   ├─ Hide sensitive info in errors
   ├─ Structured error responses
   ├─ No stack traces in production
   └─ Consistent response format

6. STORAGE LAYER
   ├─ Prepared statements (SQL injection prevention)
   ├─ Foreign key constraints
   ├─ Unique constraints (no duplicates)
   └─ Database access control
```

---

## 📊 DATABASE SCHEMA

### Core Models

```
┌────────────────┐
│      User      │
├────────────────┤
│ id (PK)        │
│ email (UNIQUE) │
│ password       │
│ name           │
│ roleId (FK)    │
│ createdAt      │
│ updatedAt      │
└────────────────┘
     │  ▲
     │  │ (n-to-1)
     │  │
     ▼  │
┌────────────────┐
│     Role       │
├────────────────┤
│ id (PK)        │
│ name (UNIQUE)  │
│ createdAt      │
│ updatedAt      │
└────────────────┘
```

### Relationships

```
User
├─ role (belongsTo Role)
├─ assetAssignments (hasMany AssetAssignment)
├─ goodsReceipts (hasMany GoodsReceipt)
├─ goodsIssues (hasMany GoodsIssue)
├─ issuesReported (hasMany Issue as ReportedBy)
└─ issuesAssigned (hasMany Issue as AssignedTo)

Role
├─ users (hasMany User)
├─ routingTables (hasMany RoutingTable)
└─ maintenanceCards (hasMany MaintenanceCard)

Asset
├─ components (hasMany Component)
├─ assignments (hasMany AssetAssignment)
├─ issues (hasMany Issue)
└─ maintenanceCards (hasMany MaintenanceCard)
```

---

## 🎯 API ENDPOINT STRUCTURE

### Hierarchy

```
/api
├─ /auth (Authentication & Authorization)
│  ├─ POST /register       (public)
│  ├─ POST /login          (public)
│  ├─ POST /logout         (protected)
│  ├─ GET /me              (protected)
│  ├─ POST /roles          (protected + ADMIN)
│  ├─ GET /roles           (protected + ADMIN)
│  ├─ GET /users           (protected)
│  └─ PUT /users/:id/role  (protected + ADMIN)
│
├─ /assets (Future - Asset Management)
│  ├─ GET /
│  ├─ POST /
│  ├─ GET /:id
│  ├─ PUT /:id
│  └─ DELETE /:id
│
├─ /warehouse (Future - Warehouse Management)
│  ├─ POST /receipts
│  ├─ GET /receipts
│  ├─ POST /issues
│  └─ GET /issues
│
├─ /maintenance (Future - Maintenance Management)
│  ├─ GET /cards
│  ├─ POST /cards
│  ├─ PUT /cards/:id
│  └─ GET /categories
│
├─ /issues (Future - Issue Management)
│  ├─ GET /
│  ├─ POST /
│  ├─ GET /:id
│  ├─ PUT /:id
│  └─ DELETE /:id
│
└─ /dashboard (Future - Analytics & Reports)
   ├─ GET /summary
   ├─ GET /inventory
   ├─ GET /maintenance
   └─ GET /issues
```

---

## 🔄 DEPLOYMENT ARCHITECTURE (Future)

```
                    ┌──────────────┐
                    │  DNS / CDN   │
                    └──────┬───────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
   ┌─────────────┐                    ┌─────────────┐
   │  Load       │                    │   Load      │
   │  Balancer   │                    │   Balancer  │
   └──────┬──────┘                    └──────┬──────┘
          │                                   │
    ┌─────┴────────┐                  ┌──────┴──────┐
    │              │                  │             │
    ▼              ▼                  ▼             ▼
  ┌───────────────────┐         ┌───────────────────┐
  │ Fastify Server 1  │         │ Fastify Server 2  │
  │ Instance A        │         │ Instance B        │
  └───────────────────┘         └───────────────────┘
           │                             │
           └──────────────┬──────────────┘
                          │
                    ┌─────▼────────┐
                    │  Connection  │
                    │  Pooling     │
                    └─────┬────────┘
                          │
                    ┌─────▼────────┐
                    │ PostgreSQL   │
                    │ Cluster      │
                    └──────────────┘
```

---

## 📈 PERFORMANCE OPTIMIZATION

```
1. Database Level
   ├─ Indexes on frequently queried columns
   ├─ Connection pooling (Prisma)
   ├─ Query optimization
   └─ Prepared statements

2. Application Level
   ├─ Async/await (non-blocking)
   ├─ Caching (future)
   ├─ Rate limiting (future)
   └─ Pagination

3. Deployment Level
   ├─ Load balancing
   ├─ Horizontal scaling
   ├─ CDN for static assets (future)
   └─ Database replication (future)
```

---

## 📋 MONITORING & LOGGING

```
┌─────────────────────────────────────┐
│     Application Logging (Pino)      │
├─────────────────────────────────────┤
│ Request/Response Logs               │
│ Error Logs                          │
│ Database Query Logs                 │
│ Authentication Logs                 │
│ Authorization Logs                  │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   ┌─────────┐         ┌──────────┐
   │Console  │         │ Log File │
   │(Dev)    │         │(Prod)    │
   └─────────┘         └──────────┘
```

---

## ✨ SUMMARY

**Architecture Pattern:** Layered Architecture + MVC

**Key Features:**
- ✅ Type-safe with TypeScript
- ✅ Secure with JWT + RBAC
- ✅ Scalable with async processing
- ✅ Maintainable with clear separation of concerns
- ✅ Tested with Swagger documentation
- ✅ Production-ready with error handling

**Status:** ✅ Ready for development & production
