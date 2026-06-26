@echo off
REM Skillsverse Production Deployment Verification Script (Windows)
REM This script verifies that the application is ready for production deployment

setlocal enabledelayedexpansion

echo =========================================
echo Skillsverse Deployment Verification
echo =========================================
echo.

set PASSED=0
set FAILED=0
set WARNINGS=0

REM ========== BACKEND CHECKS ==========
echo --- BACKEND CHECKS ---
echo.

REM Check if backend directory exists
if exist "backend" (
    echo [OK] Backend directory exists
    set /a PASSED+=1
) else (
    echo [FAIL] Backend directory not found
    set /a FAILED+=1
    exit /b 1
)

REM Check if backend\.env exists
if exist "backend\.env" (
    echo [OK] Backend .env file exists
    set /a PASSED+=1
) else (
    echo [FAIL] Backend .env file not found - Create it based on .env.example
    set /a FAILED+=1
)

REM Check package.json
if exist "backend\package.json" (
    echo [OK] Backend package.json exists
    set /a PASSED+=1
    
    if exist "backend\node_modules" (
        echo [OK] Backend dependencies installed
        set /a PASSED+=1
    ) else (
        echo [WARN] Backend node_modules not found - Run 'npm install' before deployment
        set /a WARNINGS+=1
    )
) else (
    echo [FAIL] Backend package.json not found
    set /a FAILED+=1
)

REM Check for hardcoded credentials
echo.
echo Checking for hardcoded credentials...
findstr /r "mongodb+srv://Haseeb:haseeb123" backend\*.js > nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo [FAIL] Found hardcoded MongoDB credentials in source files
    set /a FAILED+=1
) else (
    echo [OK] No hardcoded MongoDB credentials found
    set /a PASSED+=1
)

REM ========== FRONTEND CHECKS ==========
echo.
echo --- FRONTEND CHECKS ---
echo.

REM Check if frontend directory exists
if exist "frontend" (
    echo [OK] Frontend directory exists
    set /a PASSED+=1
) else (
    echo [FAIL] Frontend directory not found
    set /a FAILED+=1
    exit /b 1
)

REM Check if frontend environment files exist
if exist "frontend\.env" (
    echo [OK] Frontend environment file exists
    set /a PASSED+=1
) else if exist "frontend\.env.production.local" (
    echo [OK] Frontend environment file exists
    set /a PASSED+=1
) else (
    echo [WARN] Frontend environment file not found - Create .env.production.local based on .env.example
    set /a WARNINGS+=1
)

REM Check package.json
if exist "frontend\package.json" (
    echo [OK] Frontend package.json exists
    set /a PASSED+=1
    
    if exist "frontend\node_modules" (
        echo [OK] Frontend dependencies installed
        set /a PASSED+=1
    ) else (
        echo [WARN] Frontend node_modules not found - Run 'npm install' before deployment
        set /a WARNINGS+=1
    )
) else (
    echo [FAIL] Frontend package.json not found
    set /a FAILED+=1
)

REM Check vite.config.js
if exist "frontend\vite.config.js" (
    echo [OK] Frontend vite.config.js exists
    set /a PASSED+=1
) else (
    echo [FAIL] Frontend vite.config.js not found
    set /a FAILED+=1
)

REM ========== SUMMARY ==========
echo.
echo =========================================
echo DEPLOYMENT VERIFICATION SUMMARY
echo =========================================
echo Passed: %PASSED%
echo Failed: %FAILED%
echo Warnings: %WARNINGS%
echo.

if %FAILED% gtr 0 (
    echo [FAIL] DEPLOYMENT NOT READY - Fix the failed checks above
    exit /b 1
) else if %WARNINGS% gtr 0 (
    echo [WARN] DEPLOYMENT READY WITH WARNINGS - Please review the warnings above
    exit /b 0
) else (
    echo [OK] READY FOR DEPLOYMENT - All checks passed
    exit /b 0
)

endlocal
