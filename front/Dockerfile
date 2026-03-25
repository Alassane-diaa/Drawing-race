# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src src
COPY index.html vite.config.js eslint.config.js ./

# Set build argument for API URL
ARG VITE_API_URL=http://backend:8080
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install serve to run static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
