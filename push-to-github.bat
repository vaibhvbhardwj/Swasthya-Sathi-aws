@echo off
echo ========================================
echo Push Swasthya Sathi to GitHub
echo ========================================
echo.

echo Step 1: Checking if git is initialized...
if not exist .git (
  echo Initializing git repository...
  git init
  echo ✅ Git initialized
) else (
  echo ✅ Git already initialized
)
echo.

echo Step 2: Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/vaibhvbhardwj/Swasthya-Sathi-aws.git
echo ✅ Remote added
echo.

echo Step 3: Checking .gitignore...
if exist .gitignore (
  echo ✅ .gitignore exists
) else (
  echo ❌ .gitignore not found! Create it first.
  pause
  exit /b 1
)
echo.

echo Step 4: Staging all files...
git add .
echo ✅ Files staged
echo.

echo Step 5: Showing what will be committed...
echo.
git status
echo.

echo ========================================
echo IMPORTANT: Check the list above
echo ========================================
echo.
echo Make sure these are NOT listed:
echo   - .env files
echo   - terraform.tfvars
echo   - terraform.tfstate
echo   - node_modules/
echo.
set /p CONTINUE="Continue with commit? (y/n): "
if /i not "%CONTINUE%"=="y" (
  echo Aborted.
  pause
  exit /b 0
)
echo.

echo Step 6: Committing changes...
git commit -m "Initial commit: Swasthya Sathi healthcare platform with AWS deployment"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ❌ Commit failed. Check if you have configured git:
  echo    git config --global user.name "Your Name"
  echo    git config --global user.email "your-email@example.com"
  pause
  exit /b 1
)
echo ✅ Committed
echo.

echo Step 7: Pushing to GitHub...
echo.
echo You may be prompted for GitHub credentials:
echo   Username: vaibhvbhardwj
echo   Password: Use Personal Access Token (not your GitHub password)
echo.
echo To create a token: GitHub → Settings → Developer settings → Personal access tokens
echo.
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ❌ Push failed. Trying to pull first...
  git pull origin main --allow-unrelated-histories
  echo.
  echo Retrying push...
  git push -u origin main
)
echo.

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ========================================
  echo ✅ SUCCESS!
  echo ========================================
  echo.
  echo Your code is now on GitHub:
  echo https://github.com/vaibhvbhardwj/Swasthya-Sathi-aws
  echo.
) else (
  echo.
  echo ========================================
  echo ❌ Push failed
  echo ========================================
  echo.
  echo Common issues:
  echo 1. Authentication: Use Personal Access Token, not password
  echo 2. Remote conflicts: Run 'git pull origin main --rebase' first
  echo 3. Git not configured: Run git config commands
  echo.
  echo See git-setup-guide.md for detailed help
  echo.
)

pause
