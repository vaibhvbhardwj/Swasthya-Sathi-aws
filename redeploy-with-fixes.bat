@echo off
echo ========================================
echo Redeploying with Credential Fixes
echo ========================================
echo.

echo Step 1: Updating Terraform infrastructure...
echo.
cd terraform
terraform apply -auto-approve
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Terraform update failed
  cd ..
  pause
  exit /b 1
)
cd ..

echo.
echo Step 2: Rebuilding and pushing Docker image...
echo.
call deploy.bat

echo.
echo ========================================
echo Redeployment complete!
echo ========================================
echo.
echo Your application should be available at:
echo https://buajhcpaic.us-east-1.awsapprunner.com
echo.
echo Wait 2-3 minutes for the new deployment to complete.
echo.
pause
