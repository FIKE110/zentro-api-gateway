# Architecture

Zentro is designed as a modular, high-performance API Gateway. This section explains the core components and the lifecycle of a request as it flows through the system.

## Core Components

### 1. Router
The Router is responsible for matching incoming HTTP requests to configured routes. It uses a high-performance matching algorithm (powered by `chi`) to identify the correct route based on:
- **Path Prefix**: e.g., `/api/v1`
- **HTTP Method**: e.g., `GET`, `POST`
- **Host Header**: (Optional)

### 2. Filter Chain
Once a route is matched, the request passes through a chain of filters. Filters are middleware components that can:
- **Pre-process**: Modify the request before it reaches the upstream (e.g., Authentication, Rate Limiting, Header Injection).
- **Post-process**: Modify the response before it reaches the client (e.g., Header Removal, Body Transformation).

### 3. Load Balancer
If a route has multiple upstream services configured, the Load Balancer determines which instance should receive the request.
- **Strategy**: Currently supports **Round-Robin**.
- **Health Checks**: Passive health checking detects failures. If an upstream returns an error (502/503) or fails to connect, it is marked as unhealthy for a cooldown period.

### 4. Proxy
The Proxy component handles the actual forwarding of the request to the selected upstream service. It manages connection pooling and timeouts.

## Request Lifecycle

1.  **Incoming Request**: A client sends a request to Zentro (e.g., `GET /users/123`).
2.  **Routing**: Zentro checks `routes.json` to find a matching route.
3.  **Authentication (Optional)**: If configured, the Auth filter verifies credentials (Bearer Token, API Key, etc.).
4.  **Request Filters**: Filters like `RateLimit`, `AddHeader`, or `RewritePath` are executed in order.
5.  **Load Balancing**: The Load Balancer selects a healthy upstream target (e.g., `http://users-service-1:8080`).
6.  **Proxying**: The request is sent to the upstream service.
7.  **Response Filters**: The upstream response is intercepted. Filters like `ModifyResponseBody` or `RemoveHeader` are applied.
8.  **Final Response**: The processed response is sent back to the client.

## Load Balancing & Fault Tolerance

Zentro implements a **Passive Health Check** mechanism:
- **Failure Detection**: If a request to an upstream fails (network error or 5xx), the failure count for that target is incremented.
- **Circuit Breaking**: When failures exceed the `failureCount` threshold (default: 3), the target is marked **Unhealthy**.
- **Recovery**: After the `cooldown` period (default: 10s), the target enters a **Test** state. The next request is allowed through; if successful, the target is marked **Healthy** again.

## Management API

The Management API runs on a separate port (default: `8081`) and provides a REST interface to:
- Dynamically update configuration (hot-reload).
- View real-time traffic logs.
- Manage consumers and credentials.
