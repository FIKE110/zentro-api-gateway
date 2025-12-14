# Getting Started

## Prerequisites

- **Go**: Version 1.24 or later.
- **Node.js**: Version 20 or later.
- **pnpm**: Recommended package manager.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/fike110/zentro.git
    cd zentro
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    cd webapp
    pnpm install
    ```

3.  **Build the Frontend:**
    ```bash
    pnpm build
    ```

4.  **Run the Backend:**
    ```bash
    cd ..
    make run
    ```

The API Gateway will start on `http://localhost:8080` and the Management UI on `http://localhost:8081`.
