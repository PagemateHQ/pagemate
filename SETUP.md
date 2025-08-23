# Setup Guide

This guide will help you set up the Pagemate development environment using Moon, UV (Python), and Bun (Next.js).

## Prerequisites

- **Node.js**: v22.17.0 (Moon will handle this)
- **Python**: 3.13 (Moon will handle this)
- **Git**: For version control
- **Moon**: Task orchestration tool

## Installation

### 1. Install Moon

```bash
# Install Moon globally
curl -fsSL https://moonrepo.dev/install/moon.sh | bash

# Or with npm/yarn/pnpm
npm install -g @moonrepo/cli
```

### 2. Clone the Repository

```bash
git clone <repository-url>
cd pagemate
```

### 3. Initialize Moon Workspace

```bash
# Moon will automatically install the required toolchain (Node.js, Python, Bun, UV)
moon setup

# Sync the entire workspace
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

### Project-Specific Commands

#### Frontend (Next.js)

```bash
cd apps/fe

# Development
bun dev              # Start dev server
bun build            # Build for production
bun start            # Start production server
bun lint             # Run linter
```

#### Backend (Python/UV)

```bash
cd apps/be

# Development
uv run python main.py     # Run the backend server
uv pip install <package>  # Install a new package
uv pip freeze            # Show installed packages
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

## Environment Variables

### Frontend (.env.local)

Create `apps/fe/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PAGEMATE_SDK_KEY=your-sdk-key
```

### Backend (.env)

Create `apps/be/.env`:

```env
PORT=8000
DATABASE_URL=your-database-url
SECRET_KEY=your-secret-key
```

## Troubleshooting

### Moon Issues

```bash
# Clear Moon cache if you encounter issues
moon clean

# Reinstall toolchain
moon setup --force

# Check Moon version
moon --version
```

### Frontend Issues

```bash
# Clear Next.js cache
rm -rf apps/fe/.next
rm -rf apps/fe/node_modules
cd apps/fe && bun install
```

### Backend Issues

```bash
# Recreate UV virtual environment
cd apps/be
rm -rf .venv
uv venv
uv pip install -r pyproject.toml
```

## Deployment

### Building for Production

```bash
# Build all projects
moon run :build

# Deploy frontend (Next.js)
cd apps/fe
bun run build
# Deploy the .next folder to your hosting provider

# Deploy backend (Python)
cd apps/be
# Package and deploy according to your infrastructure
```

## Additional Resources

- [Moon Documentation](https://moonrepo.dev/docs)
- [UV Documentation](https://github.com/astral-sh/uv)
- [Bun Documentation](https://bun.sh/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For issues or questions, please refer to the main README or contact the development team.