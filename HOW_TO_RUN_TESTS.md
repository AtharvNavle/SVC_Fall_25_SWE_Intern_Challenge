# How to Run and Check Tests

## Quick Start

### Option 1: With Docker (Recommended)

If you have Docker installed:

```bash
npm test
```

This will automatically:
1. Set up a PostgreSQL database in Docker
2. Run all backend tests with coverage
3. Run all frontend tests with coverage
4. Generate coverage reports

### Option 2: Without Docker

If you don't have Docker, you can:

**A. Use an existing PostgreSQL database:**

```bash
# Set your test database URL
$env:TEST_DATABASE_URL="postgresql://user:password@localhost:5432/fairdatause_test"

# Or use your existing DATABASE_URL
$env:DATABASE_URL="postgresql://user:password@localhost:5432/your_database"

# Run tests
npm test
```

**B. Run frontend tests only (no database needed):**

```bash
npm run test:frontend
```

**C. Skip database setup and run backend tests with existing connection:**

```bash
# Set database URL first
$env:TEST_DATABASE_URL="postgresql://user:password@localhost:5432/fairdatause_test"
$env:NODE_ENV="test"

# Run backend tests directly
npm run test:backend
```

## Checking Coverage

### View Coverage Reports

After running tests, coverage reports are generated in:

- **Backend Coverage**: `coverage/backend/index.html`
- **Frontend Coverage**: `coverage/frontend/index.html`

Open these HTML files in your browser to see:
- Line-by-line coverage
- Uncovered code highlighted
- Coverage percentages

### Check Coverage from Command Line

```bash
# Run tests with coverage (shows summary in terminal)
npm run test:coverage

# Or run individually:
npm run test:backend:coverage
npm run test:frontend:coverage
```

The terminal output will show:
```
Coverage report generated
Statements: 100% (X/Y)
Branches: 100% (X/Y)
Functions: 100% (X/Y)
Lines: 100% (X/Y)
```

### Coverage Thresholds

The tests are configured to **fail if coverage is below 100%**. This means:
- ✅ If all tests pass → 100% coverage achieved
- ❌ If tests fail → Coverage is below 100%, check the report

## Individual Test Commands

```bash
# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# Watch mode (auto-rerun on file changes)
npm run test:backend:watch
npm run test:frontend:watch

# Coverage reports only
npm run test:backend:coverage
npm run test:frontend:coverage
```

## Troubleshooting

### "No database connection available"

**Solution 1**: Install Docker Desktop and ensure it's running

**Solution 2**: Set TEST_DATABASE_URL environment variable:
```bash
$env:TEST_DATABASE_URL="postgresql://user:password@host:port/database"
```

**Solution 3**: Run frontend tests only (no database needed):
```bash
npm run test:frontend
```

### "Coverage is below 100%"

1. Open the coverage HTML report to see what's missing
2. Look for red/uncovered lines
3. Add tests for those lines
4. Re-run tests

### Tests are slow

- Backend tests require database setup (first run is slower)
- Frontend tests are faster (no database needed)
- Use watch mode for faster iteration during development

## What to Expect

When you run `npm test`, you should see:

1. **Database Setup** (if Docker available):
   ```
   🚀 Setting up test database...
   🐳 Starting Docker container...
   ✅ Database is ready
   ```

2. **Backend Tests**:
   ```
   ✓ tests/ping.test.ts (5 tests)
   ✓ tests/demo.test.ts (6 tests)
   ✓ tests/social-qualify-form.test.ts (X tests)
   ...
   Test Files: X passed (X)
   Tests: X passed (X)
   Coverage: 100%
   ```

3. **Frontend Tests**:
   ```
   ✓ client/pages/NotFound.test.tsx (3 tests)
   ✓ client/hooks/useAuth.test.tsx (X tests)
   ...
   Test Files: X passed (X)
   Tests: X passed (X)
   Coverage: 100%
   ```

4. **Coverage Summary**:
   ```
   Coverage report generated
   Statements: 100%
   Branches: 100%
   Functions: 100%
   Lines: 100%
   ```

## CI/CD

When you push to GitHub, the CI workflow (`.github/workflows/ci.yml`) will:
- Automatically run all tests
- Check coverage thresholds
- Upload coverage artifacts
- Fail if coverage < 100%

You can view CI results in the "Actions" tab of your GitHub repository.

