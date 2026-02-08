# Build stage: generate manifest and build frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY scripts/ ./scripts/
COPY tools/ ./tools/
COPY frontend/ ./frontend/

RUN node scripts/generate-manifest.js

WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app
RUN node scripts/copy-tools-to-dist.js

# Run stage: serve with Node backend
FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json ./
COPY scripts/ ./scripts/
COPY tools/ ./tools/
COPY backend/ ./backend/
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/tools-manifest.json ./

WORKDIR /app/backend
RUN npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
