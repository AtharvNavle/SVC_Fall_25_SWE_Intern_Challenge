# How to Run and Check Tests - Complete Guide

## 🚀 Quick Commands

### Run All Tests
```bash
npm test
```

### Run Frontend Tests Only (No Database Needed)
```bash
npm run test:frontend
```

### Run Backend Tests Only (Needs Database)
```bash
npm run test:backend
```

## 📋 Step-by-Step Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Choose Your Test Option

#### Option A: Full Test Suite (Recommended)
```bash
# Automatically sets up database if Docker is available
npm test
```

#### Option B: Frontend Only (Fastest, No Database)
```bash
npm run test:frontend
```

#### Option C: Backend Only (Needs Database)
```bash
# First, set database URL:
$env:TEST_DATABASE_URL="postgresql://user:password@localhost:5432/fairdatause_test"
$env:NODE_ENV="test"

# Then run:
npm run test:backend
```

### 3. Check Coverage Reports

After running tests, coverage reports are generated:

**Open in Browser:**
- Frontend: `coverage/frontend/index.html`
- Backend: `coverage/backend/index.html`

**Or check terminal output** - it shows coverage percentages:
```
Coverage report generated
Statements: 100%
Branches: 100%
Functions: 100%
Lines: 100%
```

## 📊 Understanding Coverage Reports

### HTML Reports
1. Open `coverage/frontend/index.html` or `coverage/backend/index.html`
2. Navigate through files
3. **Green** = Covered code ✅
4. **Red** = Uncovered code ❌
5. Click on files to see line-by-line coverage

### Terminal Output
The test output shows:
- ✅ **100%** = All code covered (tests pass)
- ❌ **< 100%** = Some code not covered (tests fail)

## 🔍 Detailed Commands

### Watch Mode (Auto-rerun on changes)
```bash
npm run test:frontend:watch
npm run test:backend:watch
```

### Coverage Only
```bash
npm run test:frontend:coverage
npm run test:backend:coverage
npm run test:coverage  # Both
```

### Type Checking
```bash
npm run typecheck
```

## ✅ What Success Looks Like

When everything works, you'll see:

```
✓ client/pages/NotFound.test.tsx (3 tests) 123ms
✓ client/hooks/useAuth.test.tsx (5 tests) 234ms
✓ tests/ping.test.ts (5 tests) 45ms
...

Test Files: 25 passed (25)
Tests: 150+ passed (150+)
Duration: 5.2s

Coverage report generated
Statements: 100% (500/500)
Branches: 100% (200/200)
Functions: 100% (100/100)
Lines: 100% (500/500)
```

## 🐛 Common Issues & Solutions

### Issue: "No database connection available"

**Solutions:**
1. **Install Docker Desktop** (easiest)
   - Download: https://www.docker.com/products/docker-desktop
   - Start Docker Desktop
   - Run `npm test`

2. **Use existing PostgreSQL**
   ```bash
   $env:TEST_DATABASE_URL="postgresql://user:password@localhost:5432/fairdatause_test"
   npm test
   ```

3. **Run frontend tests only** (no database needed)
   ```bash
   npm run test:frontend
   ```

### Issue: "Coverage is below 100%"

1. Open the coverage HTML report
2. Find files with red/uncovered code
3. Click on the file to see which lines are uncovered
4. Add tests for those lines
5. Re-run tests

### Issue: "Cannot find module"

Run:
```bash
npm install
```

### Issue: Tests are slow

- First run is slower (database setup)
- Use watch mode for faster iteration
- Frontend tests are faster than backend

## 📁 File Locations

### Test Files
- Frontend: `client/**/*.test.tsx` and `client/**/*.spec.ts`
- Backend: `tests/**/*.test.ts`

### Coverage Reports
- Frontend: `coverage/frontend/`
- Backend: `coverage/backend/`

### Configuration
- Frontend tests: `client/vitest.config.ts`
- Backend tests: `vitest.config.backend.ts`
- CI: `.github/workflows/ci.yml`

## 🎯 Coverage Requirements

**100% coverage is required** for:
- ✅ Statements
- ✅ Branches  
- ✅ Functions
- ✅ Lines

Tests will **fail** if coverage is below 100%. This is intentional.

## 🚢 CI/CD

When you push to GitHub:
1. CI automatically runs all tests
2. Checks coverage thresholds (must be 100%)
3. Uploads coverage artifacts
4. Fails if coverage < 100%

View results in: GitHub → Actions tab

## 📚 Additional Resources

- `TESTING_REPORT.md` - Detailed testing documentation
- `HOW_TO_RUN_TESTS.md` - Comprehensive guide
- `QUICK_START.md` - Quick reference

## 💡 Pro Tips

1. **Start with frontend tests** - They're faster and don't need a database
2. **Use watch mode** during development for instant feedback
3. **Check HTML reports** to see exactly what's not covered
4. **Run `npm test`** before committing to catch issues early

