#!/bin/bash

# ULICA Test Runner Script
# This script helps run tests with clear output and error handling

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}🧪 ULICA Test Runner${NC}"
    echo "=================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if dependencies are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_warning "Node modules not found. Installing..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        print_warning "Backend dependencies not found. Installing..."
        cd backend && npm install && cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        print_warning "Frontend dependencies not found. Installing..."
        cd frontend && npm install && cd ..
    fi
    
    print_success "Dependencies checked"
}

# Run all tests
run_all_tests() {
    print_info "Running all tests..."
    echo ""
    
    if npm run test:all; then
        print_success "All tests passed!"
        return 0
    else
        print_error "Some tests failed!"
        return 1
    fi
}

# Run backend tests only
run_backend_tests() {
    print_info "Running backend tests..."
    echo ""
    
    if npm run test:backend; then
        print_success "Backend tests passed!"
        return 0
    else
        print_error "Backend tests failed!"
        return 1
    fi
}

# Run frontend tests only
run_frontend_tests() {
    print_info "Running frontend tests..."
    echo ""
    
    if npm run test:frontend; then
        print_success "Frontend tests passed!"
        return 0
    else
        print_error "Frontend tests failed!"
        return 1
    fi
}

# Run test coverage
run_coverage() {
    print_info "Running test coverage..."
    echo ""
    
    if npm run test:coverage; then
        print_success "Coverage report generated!"
        print_info "Open coverage/lcov-report/index.html to view detailed report"
        return 0
    else
        print_error "Coverage test failed!"
        return 1
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all       Run all tests (default)"
    echo "  backend   Run backend tests only"
    echo "  frontend  Run frontend tests only"
    echo "  coverage  Run test coverage"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all tests"
    echo "  $0 backend      # Run backend tests only"
    echo "  $0 coverage     # Run coverage report"
}

# Main function
main() {
    print_header
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "tests" ]; then
        print_error "Please run this script from the ULICA project root directory"
        exit 1
    fi
    
    # Check dependencies
    check_dependencies
    
    # Parse command line arguments
    case "${1:-all}" in
        "all")
            run_all_tests
            ;;
        "backend")
            run_backend_tests
            ;;
        "frontend")
            run_frontend_tests
            ;;
        "coverage")
            run_coverage
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    print_info "Test run completed!"
}

# Run main function
main "$@"
