# Management UI

Zentro comes with a built-in, web-based Management UI that allows you to monitor traffic, manage routes, and configure the gateway without manually editing JSON files.

## Accessing the UI

By default, the Management UI is available at:

```
http://localhost:8081/web/
```

*(Note: The port `8081` is the default management port. If you configured a different port in your environment variables or flags, use that instead.)*

## Authentication

When you first access the UI, you will be prompted to log in.

- **Default Username**: `admin`
- **Default Password**: The password is generated on the first run and printed to the console logs.
  - *Check your terminal output where you ran `make run` or the binary.*
  - You can also configure a static password in `config/routes.json` under the `user` object.

```json
"user": {
  "username": "admin",
  "password": "your-secure-password"
}
```

## Features

### Dashboard
The **Dashboard** provides a real-time overview of your gateway's health and traffic.
- **Total Requests**: Aggregate count of requests processed.
- **Error Rate**: Percentage of failed requests.
- **Traffic Charts**: Visualizations of request volume over time.

### Route Management
The **Routes** section allows you to:
- **View** all configured routes.
- **Create** new routes via a visual form.
- **Edit** existing routes (change upstreams, add/remove filters).
- **Delete** routes.

Changes made here are persisted to `routes.json` and applied immediately (hot-reloaded).

### Consumers
Manage API consumers who are allowed to access your protected routes. You can generate API keys and manage credentials here.

### Traffic Logs
View detailed logs of recent requests, including:
- Timestamp
- Client IP
- Method & Path
- Status Code
- Latency

## Playground
The UI includes a **Playground** to test your routes directly from the browser, similar to tools like Postman. You can send requests to your configured routes and inspect the responses.
