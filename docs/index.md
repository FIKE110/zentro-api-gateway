---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Zentro"
  text: "API Gateway Documentation"
  tagline: A high-performance, lightweight API Gateway built with Go and React.
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: Management UI
      link: /guide/management-ui
    - theme: alt
      text: API Reference
      link: /api/introduction

features:
  - title: High Performance
    details: Built with Go 1.24 and Chi router for minimal latency and high throughput.
  - title: Dynamic Routing
    details: Configure routes via JSON without restarting the server. Hot-reloading supported.
  - title: Modern Dashboard
    details: Manage and monitor your gateway with a sleek React 19 & Tailwind CSS 4 UI.
---
