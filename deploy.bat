@echo off
REM Swasthya Sathi - AWS App Runner Deployment Script (Windows)
REM This script builds and pushes the Docker image to ECR, then deploys to App Runner

setlocal enabledelayedexpansion

REM Configuration
if "%AWS_REGION%"=="" set AWS_REGION=us-east-1
if "%APP_NAME%"=="" set APP_NAME=swasthya-sathi
if "%IMAGE_TAG%"=="" set IMAGE_TAG=latest

echo.
echo ========================================
echo   Swasthya Sathi Deployment Script
echo ========================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: AWS CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed. Please install it first.
    exit /b 1
)

REM Get AWS account ID
echo Getting AWS account information...
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set AWS_ACCOUNT_ID=%%i
echo AWS Account ID: %AWS_ACCOUNT_ID%

REM ECR repository URL
set ECR_REPO=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/%APP_NAME%

REM Login to ECR
echo.
echo Logging in to Amazon ECR...
aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to login to ECR
    exit /b 1
)
echo Successfully logged in to ECR

REM Build Docker image
echo.
echo Building Docker image...
docker build -t %APP_NAME%:%IMAGE_TAG% .
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to build Docker image
    exit /b 1
)
echo Docker image built successfully

REM Tag image for ECR
echo.
echo Tagging image for ECR...
docker tag %APP_NAME%:%IMAGE_TAG% %ECR_REPO%:%IMAGE_TAG%
echo Image tagged: %ECR_REPO%:%IMAGE_TAG%

REM Push to ECR
echo.
echo Pushing image to ECR...
docker push %ECR_REPO%:%IMAGE_TAG%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to push image to ECR
    exit /b 1
)
echo Image pushed successfully

REM Get App Runner service ARN
echo.
echo Checking App Runner service...
for /f "tokens=*" %%i in ('aws apprunner list-services --region %AWS_REGION% --query "ServiceSummaryList[?ServiceName=='%APP_NAME%'].ServiceArn" --output text') do set SERVICE_ARN=%%i

if "%SERVICE_ARN%"=="" (
    echo WARNING: App Runner service not found. Please deploy infrastructure first using Terraform.
    echo.
    echo Run the following commands:
    echo   cd terraform
    echo   terraform init
    echo   terraform apply
    exit /b 1
)

echo Found App Runner service: %SERVICE_ARN%

REM Trigger deployment
echo.
echo Triggering App Runner deployment...
aws apprunner start-deployment --service-arn %SERVICE_ARN% --region %AWS_REGION%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to trigger deployment
    exit /b 1
)
echo Deployment triggered

REM Get service URL
echo.
echo Getting service URL...
for /f "tokens=*" %%i in ('aws apprunner describe-service --service-arn %SERVICE_ARN% --region %AWS_REGION% --query "Service.ServiceUrl" --output text') do set SERVICE_URL=%%i
echo Service URL: https://!SERVICE_URL!

echo.
echo ========================================
echo   Deployment completed successfully!
echo ========================================
echo.
echo Next steps:
echo   1. Wait 2-3 minutes for the deployment to complete
echo   2. Check deployment status: aws apprunner describe-service --service-arn %SERVICE_ARN% --region %AWS_REGION%
echo   3. Access your application: https://!SERVICE_URL!
echo   4. View logs: aws logs tail /aws/apprunner/%APP_NAME% --follow --region %AWS_REGION%
echo.

endlocal
