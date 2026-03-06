@echo off
REM Swasthya Sathi Setup Script for Windows
REM This script helps automate the initial setup process

echo.
echo ========================================
echo 🏥 Swasthya Sathi - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js v16 or higher from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version
echo.

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo ⚠️  .env file not found
    echo Creating .env from .env.example...
    copy backend\.env.example backend\.env
    echo ✅ Created backend\.env
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env and add your AWS credentials!
    echo.
) else (
    echo ✅ backend\.env file exists
    echo.
)

REM Check if AWS credentials are configured
findstr /C:"your_access_key_here" backend\.env >nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  AWS credentials not configured in .env
    echo.
    echo Please edit backend\.env and add:
    echo   - AWS_ACCESS_KEY_ID
    echo   - AWS_SECRET_ACCESS_KEY
    echo   - AWS_REGION
    echo.
    echo Then run: node backend\scripts\verify-aws-setup.js
    echo.
) else (
    echo ✅ AWS credentials appear to be configured
    echo.
    
    REM Ask if user wants to verify AWS setup
    set /p verify="Would you like to verify AWS setup now? (y/n): "
    if /i "%verify%"=="y" (
        echo 🔍 Verifying AWS setup...
        cd backend
        node scripts\verify-aws-setup.js
        cd ..
    )
)

echo.
echo ========================================
echo ✅ Setup script complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your AWS credentials (if not done)
echo 2. Enable Bedrock models in AWS Console
echo 3. Run: cd backend ^&^& node scripts\setup-dynamodb.js
echo 4. Run: cd backend ^&^& node scripts\verify-aws-setup.js
echo 5. Start backend: cd backend ^&^& npm run dev
echo 6. Open frontend\index.html in your browser
echo.
echo For detailed instructions, see:
echo   - AWS-SETUP-GUIDE.md
echo   - SETUP-CHECKLIST.md
echo ========================================
echo.
pause
