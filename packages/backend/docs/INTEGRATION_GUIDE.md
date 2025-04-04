# Walkthrough SDK Integration Guide

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Docker Setup](#docker-setup)
4. [Manual Setup](#manual-setup)
5. [Security Considerations](#security-considerations)
6. [Troubleshooting](#troubleshooting)

## Installation

### Using NPX (Recommended)
```bash
npx create-walkthrough-backend
```
This will run an interactive setup wizard that guides you through the configuration process.

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/your-org/walkthrough-sdk.git

# Install dependencies
cd walkthrough-sdk/packages/backend
npm install

# Set up environment variables
cp .env.example .env
```

## Configuration

### Environment Variables
Create a `.env` file in your project root:

```env
# Required
API_KEY=your-secure-api-key
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Optional
PORT=3000
DATABASE_PATH=./data/walkthrough.db
```

### Configuration Details

1. **API Key**
   - Generate a secure API key
   - Keep it confidential
   - Use it in all API requests via the `X-API-Key` header

2. **Allowed Origins**
   - List all domains that will access your backend
   - Separate multiple origins with commas
   - Include protocol (http/https)
   - No trailing slashes

3. **Port** (Optional)
   - Default: 3000
   - Change if port conflicts exist

4. **Database Path** (Optional)
   - Default: ./data/walkthrough.db
   - Ensure write permissions
   - Use absolute paths in production

## Docker Setup

### Using Pre-built Image
```bash
docker pull walkthrough-sdk/backend
docker run -d \\
  -p 3000:3000 \\
  -v walkthrough-data:/app/data \\
  -e API_KEY=your-secure-api-key \\
  -e ALLOWED_ORIGINS=http://localhost:3000 \\
  walkthrough-sdk/backend
```

### Using Docker Compose
```yaml
version: '3.8'
services:
  walkthrough-backend:
    image: walkthrough-sdk/backend
    ports:
      - "3000:3000"
    volumes:
      - walkthrough-data:/app/data
    environment:
      - API_KEY=your-secure-api-key
      - ALLOWED_ORIGINS=http://localhost:3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  walkthrough-data:
```

## Manual Setup

1. **Database Initialization**
   ```bash
   npm run db:init
   ```

2. **Start the Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

3. **Verify Installation**
   ```bash
   curl http://localhost:3000/api/health
   ```

## Security Considerations

1. **API Key Protection**
   - Use secure, random API keys
   - Rotate keys periodically
   - Never expose keys in client-side code
   - Use environment variables for key storage

2. **CORS Configuration**
   - Only allow necessary origins
   - Review ALLOWED_ORIGINS regularly
   - Use https in production

3. **Database Security**
   - Secure database file permissions
   - Regular backups
   - Monitor disk space

4. **Production Deployment**
   - Use HTTPS
   - Set up rate limiting
   - Enable logging
   - Monitor server resources

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```
   Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:8080' has been blocked by CORS policy
   ```
   - Check ALLOWED_ORIGINS configuration
   - Ensure no trailing slashes in origins
   - Verify protocol matches (http/https)

2. **Database Errors**
   ```
   Error: SQLITE_CANTOPEN: unable to open database file
   ```
   - Check file permissions
   - Verify database path
   - Ensure directory exists

3. **Authentication Errors**
   ```
   401 Unauthorized: API key is required
   ```
   - Check API key in request headers
   - Verify API_KEY environment variable
   - Check for typos in key

### Health Checks

Monitor your installation:
```bash
# Check server status
curl http://localhost:3000/api/health

# Check database
npm run db:check

# View logs
npm run logs
```

### Getting Help

1. Check the [FAQ](./FAQ.md)
2. Review [Common Issues](./TROUBLESHOOTING.md)
3. Open an issue on GitHub
4. Contact support 