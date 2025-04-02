# Build stage
FROM --platform=linux/amd64 node:20 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    sqlite3 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Final stage
FROM --platform=linux/amd64 node:20

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create data directory and set permissions
RUN mkdir -p /usr/src/app/data && \
    chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV DATABASE_PATH=/usr/src/app/data/walkthrough.db
ENV BACKUP_PATH=/usr/src/app/data/backups

# Start the application using built code
CMD ["sh", "-c", "node -e \"const { DatabaseSchema } = require('./dist/db/schema'); new DatabaseSchema(process.env.DATABASE_PATH);\" && npm start"] 