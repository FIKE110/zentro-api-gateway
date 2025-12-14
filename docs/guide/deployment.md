# Deployment

This guide covers how to deploy Zentro in a production environment.

## Building for Production

### 1. Build the Frontend
First, build the React frontend. This generates the static assets that the Go backend will serve.

```bash
cd webapp
pnpm install
pnpm build
```

This creates a `dist` directory in `webapp/`.

### 2. Build the Backend
Next, build the Go binary. You can use the provided `Makefile`.

```bash
cd ..
make build
```

This creates a `main` binary in the root directory.

## Docker Deployment

You can containerize Zentro for easy deployment. Create a `Dockerfile` in the root of your project:

```dockerfile
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/webapp
COPY webapp/package.json webapp/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY webapp/ .
RUN pnpm build

# Stage 2: Build Backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Copy built frontend assets to the expected location for embedding
COPY --from=frontend-builder /app/webapp/dist ./webapp/dist
RUN CGO_ENABLED=0 GOOS=linux go build -o zentro ./cmd/gateway

# Stage 3: Final Image
FROM alpine:latest
WORKDIR /app
COPY --from=backend-builder /app/zentro .
COPY config/ ./config/

# Expose ports
EXPOSE 8080 8081

CMD ["./zentro"]
```

### Build and Run Docker Image

```bash
docker build -t zentro-gateway .
docker run -p 8080:8080 -p 8081:8081 zentro-gateway
```

## Systemd Service (Linux)

To run Zentro as a background service on Linux:

1.  **Create a service file**: `/etc/systemd/system/zentro.service`

```ini
[Unit]
Description=Zentro API Gateway
After=network.target

[Service]
User=root
WorkingDirectory=/opt/zentro
ExecStart=/opt/zentro/zentro
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

2.  **Enable and Start**:

```bash
sudo systemctl enable zentro
sudo systemctl start zentro
```

## Production Checklist

- [ ] **Security**: Change the default admin password in `config/routes.json`.
- [ ] **TLS/SSL**: Use a reverse proxy like Nginx or Caddy in front of Zentro to handle HTTPS, or configure Zentro to use TLS certificates (if supported).
- [ ] **Firewall**: Ensure port `8081` (Management UI) is not exposed to the public internet, or is protected by a VPN/Firewall.
