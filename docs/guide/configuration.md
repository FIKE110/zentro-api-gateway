# Configuration

Zentro is configured using JSON files located in the `config/` directory. The two main configuration files are `routes.json` and `consumers.json`.

## Routes Configuration (`routes.json`)

The `routes.json` file defines how incoming requests are matched and forwarded to upstream services. It contains a list of route objects.

### Route Object Structure

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | A unique identifier for the route. |
| `path_prefix` | String | The URL path prefix to match (e.g., `/api/v1/users`). |
| `methods` | Array | List of allowed HTTP methods (e.g., `["GET", "POST"]`). |
| `upstreams` | Array | List of backend service URLs (e.g., `["http://localhost:3000"]`). |
| `enabled` | Boolean | Whether the route is active. |
| `auth` | Object | Authentication configuration for the route. |
| `filters` | Array | List of filters to apply to the request/response. |
| `lb` | Object | Load balancing configuration. |

### Example `routes.json`

```json
{
  "routes": [
    {
      "name": "users-service",
      "path_prefix": "/users",
      "methods": ["GET", "POST"],
      "upstreams": ["http://localhost:9001", "http://localhost:9002"],
      "enabled": true,
      "auth": {
        "type": "bearer"
      },
      "filters": [
        {
          "name": "RateLimit",
          "settings": {
            "max_requests": 100,
            "per_second": 60
          }
        }
      ],
      "lb": {
        "strategy": "round-robin"
      }
    }
  ]
}
```

## Adding Filters

Filters are middleware that can modify requests before they reach the upstream service or modify responses before they reach the client. You can add filters to any route by adding them to the `filters` array in `routes.json`.

### Filter Structure

Each filter object in the `filters` array must have:
- **`name`**: The name of the filter (case-sensitive, must match supported filters).
- **`settings`**: An object containing configuration specific to that filter.

### Available Filters

#### 1. Rate Limit (`RateLimit`)
Limits the number of requests a client can make within a specific time window.

```json
{
  "name": "RateLimit",
  "settings": {
    "max_requests": 10,
    "per_second": 2
  }
}
```

#### 2. Logging (`Logging`)
Logs request details.

```json
{
  "name": "Logging",
  "settings": {
    "level": "INFO",
    "format": "json", 
    "output": "stdout"
  }
}
```
*   `format`: "json" or "text" (default).
*   `output`: "stdout" (default).

#### 3. Authentication (`Auth`)
Enforces authentication on the route.

```json
{
  "name": "Auth",
  "settings": {
    "type": "bearer",
    "header": "Authorization"
  }
}
```
*   `type`: "bearer", "basic", or "api-key".
*   `header`: The header to check (default "Authorization").

#### 4. Add Header (`AddHeader`)
Adds custom headers to the request (sent to upstream) or response (sent to client).

```json
{
  "name": "AddHeader",
  "settings": {
    "type": "response", 
    "headers": {
      "X-Custom-Header": "Zentro-Gateway",
      "X-Powered-By": "Go"
    }
  }
}
```
*   `type`: "response" (default) or "request".

#### 5. Remove Header (`RemoveHeader`)
Removes specific headers from the request or response.

```json
{
  "name": "RemoveHeader",
  "settings": {
    "type": "response",
    "headers": ["Server", "X-Internal-Id"]
  }
}
```
*   `type`: "response" (default) or "request".

#### 6. Add Request Parameter (`AddRequestParam`)
Adds query parameters to the request URL.

```json
{
  "name": "AddRequestParam",
  "settings": {
    "params": {
      "version": "v1",
      "source": "gateway"
    }
  }
}
```

#### 7. Rewrite Path (`RewritePath`)
Rewrites the request path using regex before forwarding to the upstream.

```json
{
  "name": "RewritePath",
  "settings": {
    "from": "^/api/v1/(.*)",
    "to": "/v1/$1"
  }
}
```

#### 8. Set Path (`SetPath`)
Sets the request path to a specific string.

```json
{
  "name": "SetPath",
  "settings": {
    "path": "/new/static/path"
  }
}
```

#### 9. Strip Prefix (`StripPrefix`)
Removes a specific prefix from the request path.

```json
{
  "name": "StripPrefix",
  "settings": {
    "prefix": "/api"
  }
}
```

#### 10. Prefix Path (`PrefixPath`)
Adds a prefix to the request path.

```json
{
  "name": "PrefixPath",
  "settings": {
    "prefix": "/api/v1"
  }
}
```

#### 11. Redirect To (`RedirectTo`)
Redirects the client to a different URL.

```json
{
  "name": "RedirectTo",
  "settings": {
    "status_code": 302,
    "url": "https://example.com/new-location"
  }
}
```

#### 12. Set Status (`SetStatus`)
Terminates the request and returns a specific status code.

```json
{
  "name": "SetStatus",
  "settings": {
    "status_code": 403
  }
}
```

#### 13. Modify Response Body (`ModifyResponseBody`)
Replaces text in the response body.

```json
{
  "name": "ModifyResponseBody",
  "settings": {
    "from": "Old Text",
    "to": "New Text"
  }
}
```

#### 14. Modify Request Body (`ModifyRequestBody`)
Replaces text in the request body.

```json
{
  "name": "ModifyRequestBody",
  "settings": {
    "from": "http://old-domain.com",
    "to": "https://new-domain.com"
  }
}
```

#### 15. CORS (`CorsWebFilter`)
Handles Cross-Origin Resource Sharing (CORS) headers.

```json
{
  "name": "CorsWebFilter",
  "settings": {
    "allow_origins": ["https://example.com", "*"],
    "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "allow_credentials": true,
    "max_age": 3600
  }
}
```

#### 16. Map Request Header (`MapRequestHeader`)
Moves a value from one header to another and removes the original.

```json
{
  "name": "MapRequestHeader",
  "settings": {
    "from": "X-Old-Header",
    "to": "X-New-Header"
  }
}
```

#### 17. Preserve Host Header (`PreserveHostHeader`)
Preserves the original `Host` header from the incoming request when forwarding to the upstream.

```json
{
  "name": "PreserveHostHeader",
  "settings": {}
}
```

#### 18. Request Size Limit (`RequestSize`)
Limits the size of the request body (in bytes).

```json
{
  "name": "RequestSize",
  "settings": {
    "max_size": 1048576 
  }
}
```

## Consumers Configuration (`consumers.json`)

The `consumers.json` file is used to manage API consumers and their credentials (if using API Key or Basic Auth).

```json
[
  {
    "username": "client-app-1",
    "api_key": "secret-key-123"
  }
]
```
