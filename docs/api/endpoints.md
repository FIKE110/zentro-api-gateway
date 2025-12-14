# Endpoints

The Management API allows you to programmatically configure Zentro. All endpoints (except `/health` and `/auth/*`) require authentication via a Bearer Token.

## Authentication

### Login
**POST** `/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Signup
**POST** `/auth/signup`

Creates a new admin user.

**Request Body:**
```json
{
  "username": "new-admin",
  "password": "secure-password"
}
```

## Routes Management

### Get All Routes
**GET** `/api/routes`

Returns a list of all configured routes.

### Create Route
**POST** `/api/routes`

Creates a new route configuration.

**Request Body:**
```json
{
  "name": "new-service",
  "path_prefix": "/api/new",
  "methods": ["GET"],
  "upstreams": ["http://localhost:3000"],
  "enabled": true
}
```

### Get Route
**GET** `/api/routes/{id}`

Returns details of a specific route by ID.

### Update Route
**PUT** `/api/routes/{id}`

Updates an existing route configuration.

**Request Body:** Same as Create Route.

### Delete Route
**DELETE** `/api/routes/{id}`

Deletes a route configuration.

## Consumers Management

### Get All Consumers
**GET** `/api/consumers`

Returns a list of all registered API consumers.

### Create Consumer
**POST** `/api/consumers`

Registers a new API consumer.

**Request Body:**
```json
{
  "username": "client-app"
}
```

**Response:**
```json
{
  "id": "random-id",
  "username": "client-app",
  "api_key": "zen_random-key"
}
```

### Get Consumer
**GET** `/api/consumers/{id}`

Returns details of a specific consumer.

### Delete Consumer
**DELETE** `/api/consumers/{id}`

Removes an API consumer.

## Configuration & Settings

### Get Raw Config
**GET** `/api/config`

Returns the raw `routes.json` content.

### Update Raw Config
**POST** `/api/config`

Overwrites the `routes.json` file with the provided JSON body.

### Get Global Settings
**GET** `/api/settings`

Returns global gateway settings.

### Update Global Settings
**POST** `/api/settings`

Updates global gateway settings.

### Change Password
**POST** `/api/middle/settings/change-password`

Changes the authenticated user's password.

**Request Body:**
```json
{
  "oldPassword": "current-password",
  "newPassword": "new-secure-password"
}
```

### Change Username
**PUT** `/api/middle/settings/change-username`

Changes the authenticated user's username.

**Request Body:**
```json
{
  "newUsername": "new-admin-name"
}
```

## Monitoring & Tools

### Health Check
**GET** `/health`

Returns `OK` if the management server is running. No authentication required.

### Dashboard Stats
**GET** `/api/dashboard`

Returns aggregated statistics for the dashboard (request counts, error rates, etc.).

### Traffic Logs
**GET** `/api/traffic-logs`

Returns recent request logs for traffic monitoring.

### Playground Routes
**GET** `/api/playground/routes`

Returns a simplified list of routes for the playground UI.

### Playground Test
**POST** `/api/playground/test`

Executes a test request to a specific route from the server side.
