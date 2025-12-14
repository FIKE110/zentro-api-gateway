# Stage 1: Build the Frontend
FROM node:20-alpine AS frontend-builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy webapp source
COPY webapp ./webapp

# Build webapp
# The vite config outputs to ../internal/embedf/dist, so we need to ensure the parent structure exists or just let vite create it relative to webapp
WORKDIR /app/webapp
RUN pnpm install
RUN pnpm build

# Stage 2: Build the Backend
FROM golang:1.23-alpine AS backend-builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git make

# Copy Go module files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY cmd ./cmd
COPY internal ./internal
COPY utils ./utils
# If you have other directories like pkg, copy them too

# Copy built frontend assets from the previous stage
# This places the dist folder exactly where embed.go expects it
COPY --from=frontend-builder /app/internal/embedf/dist ./internal/embedf/dist

# Build the binary
# We disable CGO for a static binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o zentro ./cmd/gateway

# Stage 3: Final Image
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Copy the binary from the builder stage
COPY --from=backend-builder /app/zentro .

# Create a directory for configuration
RUN mkdir -p /app/config

# Expose ports (adjust if your defaults are different)
# 8080: Gateway Proxy
# 8081: Management API/UI
EXPOSE 8080 8081

# Run the binary
ENTRYPOINT ["./zentro"]
