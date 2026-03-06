@echo off
REM Add Required IAM Permissions for Deployment
REM Run this if you get "Access Denied" errors

echo.
echo ========================================
echo   Adding IAM Permissions
echo ========================================
echo.

REM Get current user name
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query "Arn" --output text') do set USER_ARN=%%i
echo Current user: %USER_ARN%
echo.

REM Extract username from ARN
for /f "tokens=6 delims=/" %%a in ("%USER_ARN%") do set USERNAME=%%a
echo Username: %USERNAME%
echo.

echo Adding required permissions...
echo.

REM Add ECR permissions
echo [1/4] Adding ECR permissions...
aws iam attach-user-policy --user-name %USERNAME% --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess
if %ERRORLEVEL% EQU 0 (
    echo   SUCCESS: ECR permissions added
) else (
    echo   WARNING: Could not add ECR permissions
)
echo.

REM Add App Runner permissions
echo [2/4] Adding App Runner permissions...
aws iam attach-user-policy --user-name %USERNAME% --policy-arn arn:aws:iam::aws:policy/AWSAppRunnerFullAccess
if %ERRORLEVEL% EQU 0 (
    echo   SUCCESS: App Runner permissions added
) else (
    echo   WARNING: Could not add App Runner permissions
)
echo.

REM Add IAM permissions
echo [3/4] Adding IAM permissions...
aws iam attach-user-policy --user-name %USERNAME% --policy-arn arn:aws:iam::aws:policy/IAMFullAccess
if %ERRORLEVEL% EQU 0 (
    echo   SUCCESS: IAM permissions added
) else (
    echo   WARNING: Could not add IAM permissions
)
echo.

REM Add CloudWatch permissions
echo [4/4] Adding CloudWatch permissions...
aws iam attach-user-policy --user-name %USERNAME% --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
if %ERRORLEVEL% EQU 0 (
    echo   SUCCESS: CloudWatch permissions added
) else (
    echo   WARNING: Could not add CloudWatch permissions
)
echo.

echo ========================================
echo   Verifying Permissions
echo ========================================
echo.

REM Verify ECR access
echo Testing ECR access...
aws ecr describe-repositories --region us-east-1 --max-items 1 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ECR: OK
) else (
    echo   ECR: FAILED - You may need to add permissions manually
)

REM Verify App Runner access
echo Testing App Runner access...
aws apprunner list-services --region us-east-1 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   App Runner: OK
) else (
    echo   App Runner: FAILED - You may need to add permissions manually
)

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo If you see any FAILED messages above, you may need to:
echo   1. Ask your AWS administrator to add permissions
echo   2. Or add them manually via AWS Console
echo.
echo See FIX-ECR-PERMISSIONS.md for detailed instructions.
echo.

pause
