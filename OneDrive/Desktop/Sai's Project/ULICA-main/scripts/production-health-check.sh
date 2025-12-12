#!/bin/bash

# ULICA Production Health Check Script
# This script verifies all critical systems are operational

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:5001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TIMEOUT=10

echo "=========================================="
echo "ULICA Production Health Check"
echo "=========================================="
echo ""

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $name... "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
            return 0
        else
            echo -e "${YELLOW}⚠ WARNING${NC} (HTTP $response, expected $expected_status)"
            return 1
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Connection failed)"
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    local name=$1
    local value="${!name}"
    
    echo -n "Checking $name... "
    if [ -z "$value" ]; then
        echo -e "${RED}✗ MISSING${NC}"
        return 1
    else
        echo -e "${GREEN}✓ SET${NC}"
        return 0
    fi
}

# Track failures
FAILURES=0

echo "=== Environment Variables ==="
check_env_var "DATABASE_URL" || ((FAILURES++))
check_env_var "JWT_SECRET" || ((FAILURES++))
check_env_var "JWT_REFRESH_SECRET" || ((FAILURES++))
check_env_var "NEXT_PUBLIC_BACKEND_URL" || ((FAILURES++))
echo ""

echo "=== Backend Services ==="
check_endpoint "Backend Health" "$BACKEND_URL/health" || ((FAILURES++))
check_endpoint "Backend API" "$BACKEND_URL/api/products" || ((FAILURES++))
echo ""

echo "=== Frontend Services ==="
check_endpoint "Frontend Homepage" "$FRONTEND_URL" || ((FAILURES++))
echo ""

echo "=== Database ==="
echo -n "Checking database connection... "
if command -v psql &> /dev/null && [ -n "$DATABASE_URL" ]; then
    # Extract connection details from DATABASE_URL
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ CONNECTED${NC}"
    else
        echo -e "${RED}✗ CONNECTION FAILED${NC}"
        ((FAILURES++))
    fi
else
    echo -e "${YELLOW}⚠ SKIPPED${NC} (psql not available or DATABASE_URL not set)"
fi
echo ""

echo "=== External Integrations ==="
echo -n "Checking Shiprocket credentials... "
if [ -n "$SHIPROCKET_EMAIL" ] && [ -n "$SHIPROCKET_PASSWORD" ]; then
    echo -e "${GREEN}✓ CONFIGURED${NC}"
else
    echo -e "${YELLOW}⚠ NOT CONFIGURED${NC}"
fi

echo -n "Checking Razorpay credentials... "
if [ -n "$RAZORPAY_KEY_ID" ] && [ -n "$RAZORPAY_KEY_SECRET" ]; then
    echo -e "${GREEN}✓ CONFIGURED${NC}"
else
    echo -e "${YELLOW}⚠ NOT CONFIGURED${NC}"
fi

echo -n "Checking PhonePe credentials... "
if [ -n "$PHONEPE_MERCHANT_ID" ] && [ -n "$PHONEPE_SALT_KEY" ]; then
    echo -e "${GREEN}✓ CONFIGURED${NC}"
else
    echo -e "${YELLOW}⚠ NOT CONFIGURED${NC}"
fi

echo -n "Checking SMTP credentials... "
if [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASS" ]; then
    echo -e "${GREEN}✓ CONFIGURED${NC}"
else
    echo -e "${YELLOW}⚠ NOT CONFIGURED${NC}"
fi
echo ""

echo "=== Disk Space ==="
echo -n "Checking disk space... "
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✓ OK${NC} ($DISK_USAGE% used)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} ($DISK_USAGE% used)"
fi
echo ""

echo "=========================================="
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ $FAILURES check(s) failed${NC}"
    exit 1
fi

