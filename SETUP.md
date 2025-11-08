# Blog CMS Platform - Setup Guide

## Environment Configuration

This project uses Docker Compose with environment variables for configuration.

### Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your actual credentials:**
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key` |
| `POSTGRES_USER_PASSWORD` | User service database password | `user_password` |
| `ASGARDEO_ORG_NAME` | Your Asgardeo organization name | `g11engineering` |
| `ASGARDEO_CLIENT_ID` | Frontend SSO client ID | `Y4Yrhdn2PcIxQRLfWYDdEycYTfUa` |
| `ASGARDEO_M2M_CLIENT_ID` | Backend M2M client ID | `Z4uhhDswzZBUBcJX9caVDFLmys0a` |
| `ASGARDEO_M2M_CLIENT_SECRET` | Backend M2M client secret | `qYv5fgcnc8_...` |

### Optional Variables

Docker Compose will use default values if these are not set:

- Database passwords for other services
- AWS S3 configuration (if using cloud storage)

## Asgardeo Configuration

### 1. Frontend SSO Application

Create a **Traditional Web Application** in Asgardeo Console:

1. Go to: https://console.asgardeo.io
2. Navigate to **Applications** → **New Application**
3. Select **Traditional Web Application**
4. Configure:
   - **Name**: Blog CMS Frontend
   - **Authorized redirect URLs**: `http://localhost:3000/auth/callback`
   - **Allowed origins**: `http://localhost:3000`
5. Copy the **Client ID** to `ASGARDEO_CLIENT_ID`

### 2. Backend M2M Application

Create a **Machine to Machine** application for user sync:

1. Go to **Applications** → **New Application**
2. Select **Machine to Machine Application**
3. Configure:
   - **Name**: Blog CMS User Sync
4. Go to **Scopes** tab:
   - Enable: `internal_user_mgt_update`
   - Enable: `internal_user_mgt_view`
5. Go to **API Authorization** tab:
   - Click **Authorize an API Resource**
   - Select **SCIM2 Users API**
   - Enable the management scopes
   - Click **Finish**
6. Copy credentials to `.env`:
   - **Client ID** → `ASGARDEO_M2M_CLIENT_ID`
   - **Client Secret** → `ASGARDEO_M2M_CLIENT_SECRET`

### 3. Test API Access

Run the test script to verify SCIM2 API access:

```bash
node test-scim-api.js
```

**Expected Result:**
- Token Request: ✅ 200 OK
- SCIM2 API Call: ✅ 200 OK (after configuring API Authorization)

## Docker Compose Usage

### Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f user-service

# Stop services
docker-compose down
```

### Rebuild After Changes

```bash
# Rebuild specific service
docker-compose build --no-cache user-service

# Rebuild and restart
docker-compose up -d --build user-service
```

## How Environment Variables Work

Docker Compose reads variables from:

1. **`.env` file** (in project root) - Docker Compose automatically loads this
2. **Shell environment** - Variables set in your terminal
3. **Default values** - Using `${VAR:-default}` syntax

### Example:

```yaml
JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key}
```

This means:
- Use `JWT_SECRET` from `.env` if it exists
- Otherwise, use `your-super-secret-jwt-key` as default

## Security Best Practices

### ✅ DO:
- Keep `.env` file out of version control (already in `.gitignore`)
- Use strong passwords and secrets in production
- Rotate credentials regularly
- Use separate credentials for each environment (dev/staging/prod)

### ❌ DON'T:
- Commit `.env` file to repository
- Share credentials in plain text
- Use default passwords in production
- Hardcode secrets in code

## Troubleshooting

### Environment Variables Not Loading

1. Ensure `.env` file is in the project root (same level as `docker-compose.yml`)
2. Check file permissions: `chmod 644 .env`
3. Restart Docker Compose: `docker-compose down && docker-compose up -d`
4. Verify variables inside container:
   ```bash
   docker-compose exec user-service env | grep ASGARDEO
   ```

### SCIM2 API Returns 403

This means API Authorization is not configured in Asgardeo Console:

1. Go to your M2M application in Asgardeo Console
2. Find the **API Authorization** tab
3. Authorize **SCIM2 Users API** with management scopes
4. Test again with `node test-scim-api.js`

See [docs/POSTMAN_SCIM2_TEST_GUIDE.md](docs/POSTMAN_SCIM2_TEST_GUIDE.md) for detailed testing instructions.

## Production Deployment

For production deployment:

1. **Never use default values** - Always set strong secrets
2. **Use secrets management** - Consider Docker Swarm secrets, Kubernetes secrets, or AWS Secrets Manager
3. **Enable HTTPS** - Use reverse proxy (nginx, Traefik) with SSL certificates
4. **Restrict network access** - Use firewall rules and VPC configuration
5. **Monitor logs** - Set up centralized logging (ELK stack, CloudWatch)

### Production Environment File Example

```env
# Production .env (DO NOT COMMIT)
JWT_SECRET=<generate-strong-random-secret-256-bits>
POSTGRES_USER_PASSWORD=<generate-strong-password>
ASGARDEO_ORG_NAME=<your-production-org>
ASGARDEO_CLIENT_ID=<production-client-id>
ASGARDEO_M2M_CLIENT_ID=<production-m2m-client-id>
ASGARDEO_M2M_CLIENT_SECRET=<production-m2m-secret>
```

## Additional Resources

- [Asgardeo Documentation](https://wso2.com/asgardeo/docs/)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [SCIM2 API Documentation](https://wso2.com/asgardeo/docs/apis/scim2/)
