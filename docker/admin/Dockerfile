# docker/admin/Dockerfile - React Admin Panel (Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --prefer-offline

# Build args for Vite env
ARG VITE_API_URL
ARG VITE_REVERB_HOST
ARG VITE_REVERB_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_REVERB_HOST=$VITE_REVERB_HOST
ENV VITE_REVERB_KEY=$VITE_REVERB_KEY

# Copy source and build
COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
