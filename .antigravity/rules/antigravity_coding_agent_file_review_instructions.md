# GitHub Copilot Code Review Agent Instructions

## Overview

This document provides instructions for automated code review agents working across diverse repositories. These instructions are task-agnostic and focus on systematic validation to prevent CI/CD failures, security vulnerabilities, and code quality regressions.

---

## Phase 1: Repository Discovery & Inventory

**Execute this discovery sequence FIRST before any code review:**

### 1.1 Project Context Files (Read in Order)
```bash
# ALWAYS check these files first (if they exist):
cat .antigravity-instructions.md   # Antigravity-specific agent instructions (THIS FILE)
cat .github/copilot-instructions.md  # Legacy Copilot instructions (if present, for reference)
cat README.md                        # Project overview and setup
cat CONTRIBUTING.md                  # Contribution guidelines
cat docs/DEVELOPMENT.md              # Development workflow
cat docs/ARCHITECTURE.md             # System architecture
```

### 1.2 Build System Identification
```bash
# Identify project type by searching for:
ls -la | grep -E "(package.json|requirements.txt|Pipfile|pyproject.toml|go.mod|Cargo.toml|pom.xml|build.gradle|Gemfile|composer.json|*.csproj|*.sln)"

# Common patterns:
# - Node.js: package.json, package-lock.json, yarn.lock, pnpm-lock.yaml
# - Python: requirements.txt, setup.py, pyproject.toml, Pipfile
# - Go: go.mod, go.sum
# - Rust: Cargo.toml, Cargo.lock
# - Java: pom.xml, build.gradle, build.gradle.kts
# - Ruby: Gemfile, Gemfile.lock
# - PHP: composer.json
# - .NET: *.csproj, *.sln
```

### 1.3 Configuration Files Inventory
```bash
# Search for all configuration files:
find . -maxdepth 2 -type f \( \
  -name ".*rc" -o \
  -name ".*config*" -o \
  -name "*.config.js" -o \
  -name "*.config.ts" -o \
  -name "tsconfig*.json" -o \
  -name "jest.config.*" -o \
  -name "vitest.config.*" -o \
  -name "webpack.config.*" -o \
  -name "vite.config.*" -o \
  -name ".eslintrc*" -o \
  -name ".prettierrc*" -o \
  -name "pylintrc" -o \
  -name ".flake8" -o \
  -name "mypy.ini" -o \
  -name ".golangci.yml" -o \
  -name "clippy.toml" \
\)

# Document the purpose and location of each config file found
```

### 1.4 CI/CD Pipeline Discovery
```bash
# Search for continuous integration configurations:
ls -la .github/workflows/          # GitHub Actions
ls -la .gitlab-ci.yml             # GitLab CI
ls -la .circleci/config.yml       # CircleCI
ls -la Jenkinsfile                # Jenkins
ls -la azure-pipelines.yml        # Azure Pipelines
ls -la .travis.yml                # Travis CI
ls -la bitbucket-pipelines.yml    # Bitbucket Pipelines

# READ each pipeline file completely to understand:
# - What commands are run
# - In what order
# - What environment variables are required
# - What success criteria must be met
```

### 1.5 Search for Build Workarounds & Known Issues
```bash
# Search for documented problems and workarounds:
grep -r "HACK" --include="*.md" --include="*.txt" .
grep -r "TODO" --include="*.md" --include="*.txt" .
grep -r "FIXME" --include="*.md" --include="*.txt" .
grep -r "WORKAROUND" --include="*.md" --include="*.txt" .
grep -r "XXX" --include="*.md" --include="*.txt" .

# Search code comments for build-related issues:
grep -r "# HACK" .
grep -r "// HACK" .
grep -r "/* TODO" .

# Document all findings - these are critical failure modes to avoid
```

### 1.6 Scripts Inventory
```bash
# Locate all build/setup scripts:
find . -maxdepth 3 -type f \( \
  -name "Makefile" -o \
  -name "*.sh" -o \
  -name "*.bash" -o \
  -name "setup*" -o \
  -name "bootstrap*" -o \
  -name "install*" -o \
  -name "build*" -o \
  -name "deploy*" \
\)

# For package.json projects, extract all scripts:
jq '.scripts' package.json

# For Python projects, check setup.py and pyproject.toml
# For Go projects, check Makefile
# For Rust projects, check .cargo/config.toml
```

---

## Phase 2: Build & Test Validation Protocol

**CRITICAL: Validate commands by actually executing them. Document failures and workarounds.**

### 2.1 Environment Setup (ALWAYS REQUIRED)

#### Node.js Projects
```bash
# 1. Check Node version requirement
cat .nvmrc || grep "node" package.json || grep "engines" package.json
# Document required version (e.g., "Node 18+ required")

# 2. Install dependencies (ALWAYS run, even if node_modules exists)
npm install
# OR
yarn install
# OR
pnpm install

# Common errors and fixes:
# - "EACCES permission denied" → Run with --unsafe-perm or fix npm permissions
# - "Unsupported engine" → Install correct Node version via nvm
# - Lockfile conflicts → Delete node_modules and package-lock.json, reinstall

# 3. Check for required environment variables
cat .env.example
# Document which vars are REQUIRED vs OPTIONAL
# Test what happens when required vars are missing
```

#### Python Projects
```bash
# 1. Check Python version requirement
cat .python-version || grep "python_requires" setup.py || grep "requires-python" pyproject.toml
# Document required version (e.g., "Python 3.9+ required")

# 2. Create virtual environment (ALWAYS recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
# OR
pip install -e ".[dev]"  # If setup.py with dev extras
# OR
poetry install
# OR
pipenv install --dev

# Common errors:
# - Missing system dependencies → Document apt/brew packages needed
# - Conflicting dependencies → Document resolution strategy
# - C extension build failures → Document build tools required
```

#### Go Projects
```bash
# 1. Check Go version
cat go.mod | grep "^go "
# Document required version (e.g., "Go 1.21+ required")

# 2. Download dependencies
go mod download

# 3. Verify dependencies
go mod verify

# 4. Tidy dependencies (if making changes)
go mod tidy
```

#### Rust Projects
```bash
# 1. Check Rust version (if specified)
cat rust-toolchain.toml || cat rust-toolchain

# 2. Build dependencies
cargo fetch

# 3. Check with clippy
cargo clippy -- -D warnings
```

### 2.2 Build Sequence Validation

**For EACH build command, document:**
- Exact command to run
- Expected duration (flag if >60 seconds)
- Preconditions (what must be run first)
- Success indicators (output messages, exit codes)
- Common failure modes and fixes

#### Node.js Build
```bash
# Test clean build from scratch:
rm -rf node_modules dist build .next .nuxt
npm install

# Run build command (identify from package.json scripts)
npm run build
# Document duration: e.g., "~45 seconds on M1 Mac, ~90 seconds on CI"
# Document output: e.g., "Creates dist/ directory with bundled assets"

# Test incremental build
npm run build
# Note: "Incremental builds ~10 seconds if only TS changes"

# Common build failures:
# - TypeScript errors → Check tsconfig.json, ensure @types/* installed
# - Memory issues → Add NODE_OPTIONS=--max-old-space-size=4096
# - Missing dependencies → Run npm install again
```

#### Python Build
```bash
# If using setup.py:
python setup.py build
python setup.py install

# If using pyproject.toml:
pip install -e .

# Document any compilation steps for C extensions
```

#### Go Build
```bash
# Standard build:
go build ./...
# Document duration and output binary location

# With race detector (ALWAYS use for concurrent code):
go build -race ./...
# Note: "Race detector increases build time by ~2x"

# Cross-compilation (if needed):
GOOS=linux GOARCH=amd64 go build
```

#### Rust Build
```bash
# Debug build:
cargo build
# Document duration: e.g., "~3 minutes first build, ~10s incremental"

# Release build:
cargo build --release
# Note: "Release builds 5-10x slower but required for benchmarks"

# Check for warnings:
RUSTFLAGS="-D warnings" cargo build
```

### 2.3 Test Execution Validation

**Test EVERY test command. Document exact sequence and timing.**

#### Node.js Testing
```bash
# 1. Run linter FIRST (fails fast on style issues)
npm run lint
# Duration: e.g., "~5 seconds"
# Fix command: npm run lint:fix (if available)

# 2. Run type checking (TypeScript projects)
npm run type-check || tsc --noEmit
# Duration: e.g., "~15 seconds"

# 3. Run unit tests
npm test
# OR
npm run test:unit
# Duration: e.g., "~30 seconds for 200 tests"

# 4. Run integration tests (if separate)
npm run test:integration
# Duration: e.g., "~2 minutes, may require Docker"

# 5. Run E2E tests (if available)
npm run test:e2e
# Duration: e.g., "~5 minutes, requires browser drivers"

# Test in watch mode during development:
npm run test:watch

# Generate coverage:
npm run test:coverage
# Check coverage thresholds in jest.config.js or vitest.config.ts

# Common test failures:
# - Timeout errors → Increase timeout in test config
# - Port conflicts → Kill processes on test ports or use random ports
# - Database connection issues → Ensure test DB is running
```

#### Python Testing
```bash
# 1. Run linter
flake8 . || pylint src/ || ruff check .
# Fix command: black . && isort . (if using these formatters)

# 2. Run type checker
mypy src/

# 3. Run tests with pytest
pytest
# OR with coverage
pytest --cov=src --cov-report=html --cov-report=term

# 4. Run tests in parallel (faster)
pytest -n auto

# Common issues:
# - Import errors → Ensure PYTHONPATH includes src/
# - Fixture not found → Check conftest.py location
# - Database fixtures failing → Document DB setup steps
```

#### Go Testing
```bash
# 1. Run linter
golangci-lint run
# OR
go vet ./...

# 2. Run tests
go test ./...

# 3. With race detector (CRITICAL for concurrent code)
go test -race ./...

# 4. With coverage
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# 5. Run benchmarks
go test -bench=. -benchmem ./...

# Common issues:
# - Race conditions → ALWAYS run with -race flag
# - Slow tests → Use -short flag to skip slow tests during development
```

#### Rust Testing
```bash
# 1. Run linter
cargo clippy -- -D warnings

# 2. Run formatter check
cargo fmt -- --check

# 3. Run tests
cargo test

# 4. With all features
cargo test --all-features

# 5. Documentation tests
cargo test --doc

# Common issues:
# - Test isolation failures → Use #[serial] attribute
# - Timing-sensitive tests → Document flaky tests
```

### 2.4 Run/Demo Validation

**Document how to actually run the application locally.**

```bash
# For web applications:
npm run dev          # Node.js
python manage.py runserver  # Django
flask run            # Flask
go run main.go       # Go
cargo run            # Rust

# Document:
# - Port number (e.g., "Runs on http://localhost:3000")
# - Required services (e.g., "Requires PostgreSQL and Redis running")
# - Environment variables needed
# - How to access (e.g., "Open browser to http://localhost:3000")
# - How to test it works (e.g., "Visit /health endpoint, should return 200")

# For CLI applications:
# Document example commands with expected output
```

---

## Phase 3: Project Architecture Documentation

### 3.1 Repository Structure
```
# Document the actual directory structure:
repo-root/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── src/                    # Source code
│   ├── components/         # (React/Vue) UI components
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   ├── utils/              # Utility functions
│   └── main.ts             # Entry point
├── tests/                  # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                   # Documentation
├── scripts/                # Build/deployment scripts
├── config/                 # Configuration files
└── public/                 # Static assets

# For each major directory, document:
# - Purpose
# - File naming conventions
# - Import patterns
# - Testing conventions
```

### 3.2 Key Files Reference

**Configuration Files:**
- `tsconfig.json` - TypeScript compiler options, path aliases
- `.eslintrc.js` - Linting rules, disabled rules with justification
- `jest.config.js` - Test configuration, coverage thresholds
- `.env.example` - Required environment variables

**Source Files:**
- `src/main.ts` - Application entry point
- `src/app.ts` - Application setup and middleware
- `src/routes/` - API route definitions
- `src/db/` - Database connection and migrations

### 3.3 CI/CD Pipeline Replication

**Document exact steps to replicate CI checks locally:**

```bash
# Example GitHub Actions workflow replication:
# (.github/workflows/ci.yml)

# 1. Setup (matches CI environment)
node --version  # Should match CI version

# 2. Install dependencies (matches CI)
npm ci  # Uses package-lock.json exactly

# 3. Lint (matches CI)
npm run lint

# 4. Type check (matches CI)
npm run type-check

# 5. Build (matches CI)
npm run build

# 6. Test (matches CI)
npm test -- --coverage --maxWorkers=2

# 7. Additional validations
npm audit  # Security vulnerabilities
npm run check-licenses  # License compliance (if configured)

# Document duration: "Total CI time ~3-4 minutes"
```

### 3.4 Dependencies & Hidden Requirements

**Document non-obvious dependencies:**

```bash
# System dependencies (often forgotten):
# - Node.js: node-gyp requires Python 2.7/3.x and build tools
# - Python: Some packages require libpq-dev, python3-dev
# - Go: CGO_ENABLED=1 requires gcc
# - Docker: Required for integration tests
# - PostgreSQL: Required for DB tests (or use testcontainers)
# - Redis: Required for cache/session tests

# Service dependencies:
# - Requires AWS credentials for S3 integration tests
# - Requires Stripe test API key for payment tests
# - Requires external API mocks (use WireMock, etc.)

# Document setup commands:
brew install postgresql  # macOS
sudo apt-get install postgresql-client  # Ubuntu
docker-compose up -d  # Start required services
```

---

## Phase 4: Code Review Execution

### 4.1 Critical Blocking Issues (MUST FIX)

**Security Vulnerabilities:**
- Hardcoded secrets, API keys, credentials
- SQL injection (raw string concatenation in queries)
- XSS vulnerabilities (unescaped user input in HTML)
- Path traversal (user-controlled file paths)
- Command injection (user input in shell commands)
- Missing authentication/authorization checks
- Insecure cryptography (weak algorithms, hardcoded keys)
- CORS misconfiguration (overly permissive origins)

**Build-Breaking Changes:**
- Compilation errors (type errors, syntax errors)
- Missing imports or moved modules
- Breaking API changes without migration path
- Removed functions/methods still referenced
- Incompatible dependency versions

**Test Failures:**
- Failing existing tests without justification
- New functionality without tests
- Deleted tests for still-active code
- Insufficient test coverage (below project threshold)

### 4.2 Required Changes (SHOULD FIX)

**Code Quality:**
- Functions >50 lines (suggest breaking down)
- Cyclomatic complexity >10
- Duplicate code blocks (DRY violations)
- Missing error handling (unhandled promises, bare try/catch)
- Resource leaks (unclosed connections, listeners)
- Magic numbers (use constants/enums)

**Performance:**
- N+1 query problems
- Missing database indexes for queries
- Synchronous operations blocking event loop
- Unbounded loops or recursion
- Missing pagination for large datasets

**Architecture:**
- Tight coupling between modules
- Circular dependencies
- Business logic in presentation layer
- Missing abstractions for external dependencies

### 4.3 Suggestions (NICE TO HAVE)

- Improved naming for clarity
- Additional comments for complex logic
- Consistent formatting (if not auto-enforced)
- Future refactoring opportunities

### 4.4 Language-Specific Patterns

**TypeScript/JavaScript:**
- `any` types → request specific types
- Missing null checks (use optional chaining `?.`)
- Unhandled promise rejections
- `var` usage → use `const`/`let`
- Missing `await` on async functions

**Python:**
- Mutable default arguments `def func(arg=[])`
- Bare `except:` clauses
- Missing type hints (if project uses them)
- F-string in SQL queries (use parameterized queries)

**Go:**
- Ignored errors `_, err := ...`
- Missing `defer` for cleanup
- Mutex not unlocked in all code paths
- Missing context cancellation

**Rust:**
- Unnecessary `.clone()` calls
- `.unwrap()` in production code (use `?` or proper error handling)
- Blocking operations in async functions

---

## Phase 5: Review Output Format

```markdown
## 🚨 Blocking Issues (Must Fix Before Merge)
[List critical issues with file:line references]

## ⚠️ Required Changes (Should Fix)
[List quality/performance issues]

## 💡 Suggestions (Optional Improvements)
[List nice-to-have improvements]

## ✅ Validation Checklist
- [ ] CI pipeline passes
- [ ] All tests pass locally
- [ ] Linting passes
- [ ] No security vulnerabilities
- [ ] Documentation updated
- [ ] Breaking changes documented
```

---

## Critical Instructions

**TRUST THESE INSTRUCTIONS:** Only perform exploratory searches (grep, find, file reads) if:
- Instructions are incomplete or contradictory
- Changes touch undocumented areas
- Validation steps fail unexpectedly

**DEFAULT BEHAVIOR:** Always defer to project-specific `.antigravity-instructions.md` (this file). If legacy `.github/copilot-instructions.md` exists, it may provide additional context but this file takes precedence.

**WHEN IN DOUBT:** Comment with questions rather than blocking. Assume developers know their codebase better than generic rules.