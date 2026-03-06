@echo off
echo ========================================
echo Checking App Runner Logs
echo ========================================
echo.
echo Fetching last 50 log entries...
echo.

aws logs tail /aws/apprunner/swasthya-sathi --since 10m --format short --region us-east-1

echo.
echo ========================================
echo Log check complete
echo ========================================
pause
