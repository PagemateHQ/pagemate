# Setup Guide

This guide will help you set up the Pagemate development environment using Moon, UV (Python), and Bun (Next.js).

## Prerequisites

- **Node.js**: v22.17.0 (Moon will handle this)
- **Python**: 3.13 (Moon will handle this)
- **Git**: For version control
- **Moon**: Task orchestration tool

## Installation

### 1. Install Moon

https://moonrepo.dev/docs/install

### 2. Clone the Repository

```bash
git clone https://github.com/pagematehq/pagemate
cd pagemate
```

### 3. Initialize Moon Workspace

```bash
moon setup
moon sync
```

This command will:
- Install Node.js 22.17.0
- Install Python 3.13
- Install Bun 1.2.19 as the Node package manager
- Install UV as the Python package manager
- Sync all project dependencies

### 4. Install Dependencies

```bash
# Install all dependencies for both frontend and backend
moon run :install

# Or install individually:
moon run fe:install  # Frontend dependencies with Bun
moon run be:install  # Backend dependencies with UV
```

## Development

### Running the Applications

```bash
# Start both frontend and backend in development mode
moon run :dev

# Or run individually:
moon run fe:dev      # Start Next.js dev server (usually port 3000)
moon run be:dev      # Start Python backend (check main.py for port)
```

### Available Moon Tasks

```bash
# List all available tasks
moon task list

# Common tasks:
moon run fe:build    # Build Next.js production bundle
moon run fe:lint     # Run ESLint
moon run fe:format   # Format code with Prettier
moon run be:test     # Run Python tests
moon run be:lint     # Run Python linter
```

## Project Structure

```
pagemate/
├── .moon/
│   ├── workspace.yml    # Moon workspace configuration
│   ├── toolchain.yml    # Toolchain versions (Node, Python, etc.)
│   └── tasks.yml        # Global task definitions
├── apps/
│   ├── fe/
│   │   ├── moon.yml    # Frontend-specific Moon config
│   │   ├── package.json # Frontend dependencies
│   │   ├── src/         # Next.js source code
│   │   └── public/      # Static assets
│   └── be/
│       ├── moon.yml     # Backend-specific Moon config
│       ├── pyproject.toml # Python dependencies
│       ├── uv.lock      # Locked Python dependencies
│       └── main.py      # Backend entry point
└── packages/            # Shared packages (if any)
```
