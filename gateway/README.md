# Gateway / Firewall

API Gateway and reverse proxy for the StockFX Investment Platform. Provides:

- Security: Helmet (CSP, HSTS, X-Frame-Options, etc.), CORS, rate-limiting, input validation.
- Routing: Proxies requests to internal backend services.
- Logging: Morgan HTTP request logging.
- Auth: Placeholder for JWT/session validation middleware.

## Architecture

```
Frontend (localhost:5173)
         |
    (request to /api/...)
         |
         v
  Gateway (localhost:4000)
    - Security headers
    - CORS policy
    - Rate limiting
    - Input validation
         |
    +----+----+----+----+
    |    |    |    |    |
    v    v    v    v    v
  auth server   user-dashboard    user-account-service    dev-otp
  (3000)        (3001)             (3002)                  (3003)
```

## Quickstart

### Install

```bash
npm install
```

### Configure

Create a `.env` file (optional; defaults provided):

```env
GATEWAY_PORT=4000
GATEWAY_HOST=localhost

# Backend service URLs
AUTH_SERVICE_URL=http://localhost:3000
DASHBOARD_SERVICE_URL=http://localhost:3001
ACCOUNT_SERVICE_URL=http://localhost:3002
OTP_SERVICE_URL=http://localhost:3003

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:5173
```

### Run

Development with hot reload:

```bash
npm run dev
```

Production:

```bash
npm start
```

Gateway will listen on `http://localhost:4000`.

## Usage

### Routes

| Route | Service | Description |
|-------|---------|-------------|
| `/api/auth/*` | Auth service (3000) | Login, register, OTP |
| `/api/dashboard/*` | Dashboard service (3001) | User dashboard |
| `/api/account/*` | Account service (3002) | User account management |
| `/api/otp/*` | OTP service (3003) | OTP send/verify |
| `/health` | Local | Gateway health check |

### Examples

Frontend calls (from Vite dev):

```javascript
// Option 1: Set env var and call gateway base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
fetch(`${API_URL}/api/auth/login`, { method: 'POST', ... });

// Option 2: Vite dev proxy (automatic, no env change needed)
// vite.config.ts sets /api -> http://localhost:4000
fetch('/api/auth/login', { method: 'POST', ... });
```

Backend service example (register with dashboard backend on port 3001):

```bash
npm start  # in user-dashboard-backend/
# or
node index.js
```

### Testing

```bash
npm test
```

## Security Features

- **Helmet**: Sets secure HTTP headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection).
- **CORS**: Whitelist allowed origins; restrict to frontend domain in prod.
- **Rate Limiting**: 100 requests per 15 minutes (configurable).
- **Input Validation**: JSON size limits, request body parsing limits.
- **Request Logging**: Morgan logs all HTTP requests (dev mode: combined, prod: common).
- **Auth Placeholder**: Middleware to validate JWT on protected routes (add as needed).

## Deployment

### Vercel

1. Copy `gateway/` to a separate repo or monorepo folder.
2. Add a `vercel.json` to set `functions` entry points if needed.
3. Deploy with correct `.env` for production backend URLs.

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
EXPOSE 4000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t stockfx-gateway .
docker run -p 4000:4000 --env-file .env stockfx-gateway
```

### Environment Variables (Production)

```env
GATEWAY_PORT=4000
GATEWAY_HOST=0.0.0.0
AUTH_SERVICE_URL=https://auth.example.com
DASHBOARD_SERVICE_URL=https://dashboard.example.com
ACCOUNT_SERVICE_URL=https://account.example.com
OTP_SERVICE_URL=https://otp.example.com
CORS_ORIGIN=https://app.example.com
RATE_LIMIT_MAX_REQUESTS=1000
NODE_ENV=production
```

## Logs

Development:

```
GET /api/auth/login - 200 OK - 45ms
POST /api/account/register - 400 Bad Request - 12ms
```

Check `gateway.log` (if file transport added) or use Docker `docker logs <container>`.

## Troubleshooting

- **502 Bad Gateway**: Ensure backend services are running on configured ports.
- **CORS blocked**: Check `CORS_ORIGIN` env var matches frontend origin.
- **Rate limit exceeded**: Wait 15 min or adjust `RATE_LIMIT_WINDOW_MS` in `.env`.
- **Auth rejected**: Ensure JWT token is in `Authorization: Bearer <token>` header.
