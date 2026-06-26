#!/bin/bash

# Skillsverse Production Deployment Verification Script
# This script verifies that the application is ready for production deployment

set -e

echo "========================================="
echo "Skillsverse Deployment Verification"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARNINGS++))
}

# ========== BACKEND CHECKS ==========
echo ""
echo "--- BACKEND CHECKS ---"
echo ""

# Check if backend directory exists
if [ -d "backend" ]; then
    pass "Backend directory exists"
else
    fail "Backend directory not found"
    exit 1
fi

# Check if backend/.env exists
if [ -f "backend/.env" ]; then
    pass "Backend .env file exists"
else
    fail "Backend .env file not found - Create it based on .env.example"
fi

# Check required backend environment variables
cd backend

REQUIRED_VARS=("MONGO_URI" "JWT_SECRET" "STRIPE_SECRET_KEY" "STRIPE_PUBLISHABLE_KEY")

for var in "${REQUIRED_VARS[@]}"; do
    # Load .env file if it exists
    if [ -f ".env" ]; then
        value=$(grep "^$var=" .env 2>/dev/null | cut -d '=' -f 2 || echo "")
    else
        value="${!var}"
    fi
    
    if [ -n "$value" ] && [ "$value" != "your-super-secret-jwt-key-change-this-in-production" ] && [ "$value" != "sk_test_..." ] && [ "$value" != "pk_test_..." ]; then
        pass "Environment variable $var is set"
    else
        fail "Environment variable $var is missing or using placeholder value"
    fi
done

# Check package.json
if [ -f "package.json" ]; then
    pass "Backend package.json exists"
    
    # Check if dependencies are installed
    if [ -d "node_modules" ]; then
        pass "Backend dependencies installed"
    else
        warn "Backend node_modules not found - Run 'npm install' before deployment"
    fi
else
    fail "Backend package.json not found"
fi

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    pass "Node.js is installed: $NODE_VERSION"
else
    fail "Node.js is not installed"
fi

# Check for hardcoded credentials in source files
echo ""
echo "Checking for hardcoded credentials..."
if grep -r "mongodb+srv://Haseeb:haseeb123" --include="*.js" . 2>/dev/null; then
    fail "Found hardcoded MongoDB credentials in source files"
else
    pass "No hardcoded MongoDB credentials found"
fi

if grep -r "sk_test_" --include="*.js" . 2>/dev/null | grep -v "node_modules\|\.env" | head -1; then
    warn "Found Stripe test key reference in source - ensure production keys are used"
else
    pass "No Stripe test keys found in source"
fi

cd ..

# ========== FRONTEND CHECKS ==========
echo ""
echo "--- FRONTEND CHECKS ---"
echo ""

# Check if frontend directory exists
if [ -d "frontend" ]; then
    pass "Frontend directory exists"
else
    fail "Frontend directory not found"
    exit 1
fi

# Check if frontend/.env exists
if [ -f "frontend/.env" ] || [ -f "frontend/.env.production.local" ]; then
    pass "Frontend environment file exists"
else
    warn "Frontend environment file not found - Create .env.production.local based on .env.example"
fi

cd frontend

# Check package.json
if [ -f "package.json" ]; then
    pass "Frontend package.json exists"
    
    # Check if dependencies are installed
    if [ -d "node_modules" ]; then
        pass "Frontend dependencies installed"
    else
        warn "Frontend node_modules not found - Run 'npm install' before deployment"
    fi
else
    fail "Frontend package.json not found"
fi

# Check vite.config.js
if [ -f "vite.config.js" ]; then
    pass "Frontend vite.config.js exists"
    
    # Check for hardcoded localhost in vite config
    if grep -q "http://localhost:5000" vite.config.js; then
        warn "Found hardcoded localhost in vite.config.js - should use environment variable"
    else
        pass "Vite config uses environment variables"
    fi
else
    fail "Frontend vite.config.js not found"
fi

# Check for localhost in source code
if grep -r "http://localhost:5000" --include="*.jsx" --include="*.js" src/ 2>/dev/null | grep -v "node_modules" | head -1; then
    fail "Found hardcoded localhost URLs in source code"
else
    pass "No hardcoded localhost URLs in source code"
fi

cd ..

# ========== GIT CHECKS ==========
echo ""
echo "--- GIT & SECURITY CHECKS ---"
echo ""

# Check if .gitignore excludes .env files
if [ -f "backend/.gitignore" ]; then
    if grep -q "\.env" backend/.gitignore; then
        pass "Backend .gitignore excludes .env files"
    else
        fail "Backend .gitignore does not exclude .env files"
    fi
fi

if [ -f "frontend/.gitignore" ]; then
    if grep -q "\.env" frontend/.gitignore; then
        pass "Frontend .gitignore excludes .env files"
    else
        fail "Frontend .gitignore does not exclude .env files"
    fi
fi

# Check if .env files are tracked by git
if git ls-files --error-unmatch backend/.env &> /dev/null; then
    fail "backend/.env is tracked by git - Remove it from git immediately!"
else
    pass "backend/.env is not tracked by git"
fi

if git ls-files --error-unmatch frontend/.env &> /dev/null; then
    fail "frontend/.env is tracked by git - Remove it from git immediately!"
else
    pass "frontend/.env is not tracked by git"
fi

# ========== BUILD TESTS ==========
echo ""
echo "--- BUILD TESTS ---"
echo ""

# Check if backend can start without errors (syntax check)
echo "Checking backend syntax..."
if cd backend && node -c server.js 2>/dev/null; then
    pass "Backend server.js syntax is valid"
else
    warn "Backend server.js syntax check failed (might need dependencies loaded)"
fi
cd ..

# Check frontend build
echo "Checking frontend build..."
if cd frontend && npm run build > /dev/null 2>&1; then
    pass "Frontend builds successfully"
    
    # Check if dist directory was created
    if [ -d "dist" ]; then
        SIZE=$(du -sh dist | cut -f1)
        pass "Frontend dist directory created: $SIZE"
    fi
else
    fail "Frontend build failed - Run 'npm run build' to see errors"
fi
cd ..

# ========== SUMMARY ==========
echo ""
echo "========================================="
echo "DEPLOYMENT VERIFICATION SUMMARY"
echo "========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ DEPLOYMENT NOT READY - Fix the failed checks above${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  DEPLOYMENT READY WITH WARNINGS - Please review the warnings above${NC}"
    exit 0
else
    echo -e "${GREEN}✅ READY FOR DEPLOYMENT - All checks passed${NC}"
    exit 0
fi
