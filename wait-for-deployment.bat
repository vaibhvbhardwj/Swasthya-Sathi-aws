@echo off
echo ========================================
echo Waiting for App Runner Deployment
echo ========================================
echo.

:CHECK_STATUS
echo Checking service status...
for /f "tokens=*" %%i in ('aws apprunner describe-service --service-arn arn:aws:apprunner:us-east-1:310651340735:service/swasthya-sathi/ec07f379d7374e9c9f5492755daecddf --region us-east-1 --query "Service.Status" --output text') do set STATUS=%%i

echo Current status: %STATUS%
echo.

if "%STATUS%"=="RUNNING" (
  echo ✅ Service is RUNNING!
  echo.
  echo Fetching service URL...
  aws apprunner describe-service --service-arn arn:aws:apprunner:us-east-1:310651340735:service/swasthya-sathi/ec07f379d7374e9c9f5492755daecddf --region us-east-1 --query "Service.ServiceUrl" --output text
  echo.
  echo ✅ Deployment complete! Your application is ready.
  echo.
  echo Testing the health endpoint...
  echo.
  curl -s https://buajhcpaic.us-east-1.awsapprunner.com/health
  echo.
  echo.
  goto END
)

if "%STATUS%"=="OPERATION_IN_PROGRESS" (
  echo ⏳ Deployment in progress... waiting 30 seconds
  timeout /t 30 /nobreak >nul
  goto CHECK_STATUS
)

if "%STATUS%"=="CREATE_FAILED" (
  echo ❌ Service creation failed
  goto END
)

if "%STATUS%"=="DELETE_FAILED" (
  echo ❌ Service deletion failed
  goto END
)

echo ⏳ Service status: %STATUS% - waiting 30 seconds
timeout /t 30 /nobreak >nul
goto CHECK_STATUS

:END
echo.
echo ========================================
pause
