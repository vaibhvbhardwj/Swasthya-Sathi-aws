@echo off
REM Quick AWS Credentials Setup for Terraform
REM This script helps you configure AWS credentials for Terraform deployment

echo.
echo ========================================
echo   AWS Credentials Setup for Terraform
echo ========================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: AWS CLI is not installed!
    echo.
    echo Please install AWS CLI first:
    echo   Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
    echo.
    pause
    exit /b 1
)

echo AWS CLI is installed: OK
echo.

REM Check if backend .env file exists
if exist "backend\.env" (
    echo Found backend\.env file
    echo.
    echo You can use the same credentials from your backend\.env file
    echo.
    echo Opening backend\.env file...
    notepad backend\.env
    echo.
    echo Copy the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY values
    echo.
)

echo Now let's configure AWS CLI for Terraform...
echo.
echo You will be prompted for:
echo   1. AWS Access Key ID
echo   2. AWS Secret Access Key
echo   3. Default region (enter: us-east-1)
echo   4. Default output format (enter: json)
echo.
pause

REM Run aws configure
aws configure

echo.
echo ========================================
echo   Verifying Configuration
echo ========================================
echo.

REM Verify configuration
aws sts get-caller-identity

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Credentials configured!
    echo ========================================
    echo.
    echo You can now run Terraform:
    echo   cd terraform
    echo   terraform init
    echo   terraform plan
    echo   terraform apply
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR: Verification failed
    echo ========================================
    echo.
    echo Please check your credentials and try again:
    echo   aws configure
    echo.
)

pause
