@echo off
echo ========================================
echo App Runner Diagnostics
echo ========================================
echo.

echo 1. Checking App Runner service status...
echo.
aws apprunner describe-service --service-arn arn:aws:apprunner:us-east-1:310651340735:service/swasthya-sathi/ec07f379d7374e9c9f5492755daecddf --region us-east-1 --query "Service.{Status:Status,Health:HealthCheckConfiguration,LastUpdate:UpdatedAt}" --output table

echo.
echo 2. Checking if LabReports table exists...
echo.
aws dynamodb describe-table --table-name LabReports --region us-east-1 --query "Table.{Name:TableName,Status:TableStatus,ItemCount:ItemCount}" --output table 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ❌ LabReports table does NOT exist
) else (
  echo ✅ LabReports table exists
)

echo.
echo 3. Listing all DynamoDB tables...
echo.
aws dynamodb list-tables --region us-east-1 --output table

echo.
echo 4. Checking CloudWatch log streams...
echo.
aws logs describe-log-streams --log-group-name /aws/apprunner/swasthya-sathi --region us-east-1 --order-by LastEventTime --descending --max-items 5 --query "logStreams[*].{Stream:logStreamName,LastEvent:lastEventTime}" --output table

echo.
echo 5. Fetching recent logs (last 30 minutes)...
echo.
aws logs tail /aws/apprunner/swasthya-sathi --since 30m --region us-east-1

echo.
echo ========================================
echo Diagnostics complete
echo ========================================
pause
