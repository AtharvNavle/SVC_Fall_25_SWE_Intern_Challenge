# Quick Start Guide - Running and Checking Tests

## ✅ Step 1: Install Dependencies

```bash
npm install
```

## ✅ Step 2: Run Tests

### Option A: Run All Tests (Requires Database)

```bash
# If you have Docker installed, this will auto-setup database
npm test

# If you don't have Docker, set database URL first:
$env:TEST_DATABASE_URL="postgresql://user:password@localhost:5432/fairdatause_test"
npm test
```

### Option B: Run Frontend Tests Only (No Database Needed)

```bash
npm run test:frontend
```

### Option C: Run Backend Tests Only (Requires Database)

```bash
# Set database URL first
$env:TEST_DATABASE_URL="postgresql://user:password@localhost:5432/fairdatause_test"
$env:NODE_ENV="test"
npm run test:backend
```

## 📊 Step 3: Check Coverage

### View Coverage Reports in Browser

After running tests, open these files in your browser:

- **Backend Coverage**: Open `coverage/backend/index.html` in your browser
- **Frontend Coverage**: Open `coverage/frontend/index.html` in your browser

These HTML files show:
- ✅ Green = Covered code
- ❌ Red = Uncovered code
- Coverage percentages for each file

### Check Coverage in Terminal

The test output will show coverage summary like:

```
Coverage report generated
Statements: 100% (X/Y)
Branches: 100% (X/Y)
Functions: 100% (X/Y)
Lines: 100% (X/Y)
```

### Coverage Thresholds

Tests **will fail** if coverage is below 100%. This is intentional and enforced.

## 🔍 Step 4: Individual Test Commands

```bash
# Backend tests
npm run test:backend              # Run once
npm run test:backend:watch        # Watch mode
npm run test:backend:coverage     # With coverage report

# Frontend tests
npm run test:frontend              # Run once
npm run test:frontend:watch       # Watch mode
npm run test:frontend:coverage    # With coverage report

# Both together
npm run test:coverage              # Both with coverage
```

## 🐛 Troubleshooting

### "No database connection available"

**Solution 1**: Install Docker Desktop
- Download from https://www.docker.com/products/docker-desktop
- Start Docker Desktop
- Run `npm test` again

**Solution 2**: Use existing PostgreSQL
```bash
$env:TEST_DATABASE_URL="postgresql://user:password@localhost:5432/fairdatause_test"
npm test
```

**Solution 3**: Run frontend tests only (no database)
```bash
npm run test:frontend
```

### "Coverage is below 100%"

1. Open the coverage HTML report
2. Find red/uncovered lines
3. Add tests for those lines
4. Re-run tests

### Tests are failing

Check the error messages in the terminal. Common issues:
- Missing dependencies: Run `npm install`
- Database connection: Set `TEST_DATABASE_URL`
- Type errors: Run `npm run typecheck`

## 📝 What Success Looks Like

When tests pass, you'll see:

```
✓ client/pages/NotFound.test.tsx (3 tests)
✓ client/hooks/useAuth.test.tsx (5 tests)
✓ tests/ping.test.ts (5 tests)
...

Test Files: 25 passed (25)
Tests: 150+ passed (150+)
Coverage: 100% ✅
```

## 🚀 Next Steps

1. **Run tests**: `npm test` or `npm run test:frontend`
2. **Check coverage**: Open `coverage/frontend/index.html` or `coverage/backend/index.html`
3. **Fix any failures**: Add missing tests for uncovered code
4. **Push to GitHub**: CI will automatically run tests and check coverage

## 📚 More Information

- See `TESTING_REPORT.md` for detailed testing documentation
- See `HOW_TO_RUN_TESTS.md` for comprehensive guide
- See `.github/workflows/ci.yml` for CI configuration

