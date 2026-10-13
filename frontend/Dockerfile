# Multi-stage Dockerfile for RentFlow Frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production serving stage using Nginx unprivileged
FROM nginxinc/nginx-unprivileged:alpine-slim AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Expose internal container port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
