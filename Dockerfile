# Stage 1: Build
FROM node:20-slim AS builder

# Install OS dependencies (optional for some Next.js features)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Salin seluruh project
COPY . .

# Build Next.js project
RUN npm run build

# Stage 2: Run (production)
FROM node:20-slim AS runner

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Hanya salin output build & production dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Jalankan server
EXPOSE 3000
CMD ["npm", "start"]
