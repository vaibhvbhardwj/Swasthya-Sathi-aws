# Git Setup and Push Guide

## Step 1: Configure Git (First Time Only)

```bash
# Set your name and email (use your GitHub account email)
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Verify configuration
git config --list
```

## Step 2: Initialize Git Repository

```bash
# Initialize git in your project directory
git init

# Check status
git status
```

## Step 3: Add Remote Repository

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/vaibhvbhardwj/Swasthya-Sathi-aws.git

# Verify remote was added
git remote -v
```

## Step 4: Stage Files

```bash
# Add all files (respecting .gitignore)
git add .

# Or add specific files
git add README.md
git add backend/
git add frontend/

# Check what will be committed
git status
```

## Step 5: Commit Changes

```bash
# Commit with a message
git commit -m "Initial commit: Swasthya Sathi healthcare platform"

# Or more detailed commit
git commit -m "feat: Initial commit with complete healthcare platform

- AI-powered lab report analyzer
- Doctor-in-the-Loop chat system
- Medication tracker
- AWS App Runner deployment with Terraform
- Complete documentation"
```

## Step 6: Push to GitHub

```bash
# Push to main branch (first time)
git push -u origin main

# If your default branch is 'master', use:
# git push -u origin master
```

## If You Get Authentication Error

### Option 1: Use Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Swasthya Sathi"
4. Select scopes: `repo` (full control)
5. Generate and copy the token
6. When pushing, use token as password:
   - Username: `vaibhvbhardwj`
   - Password: `your_personal_access_token`

### Option 2: Use SSH (Alternative)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:vaibhvbhardwj/Swasthya-Sathi-aws.git
```

## Complete Command Sequence (Copy-Paste Ready)

```bash
# 1. Configure Git (first time only)
git config --global user.name "Vaibhav Bhardwaj"
git config --global user.email "your-email@example.com"

# 2. Initialize and add remote
git init
git remote add origin https://github.com/vaibhvbhardwj/Swasthya-Sathi-aws.git

# 3. Stage all files
git add .

# 4. Check what will be committed
git status

# 5. Commit
git commit -m "Initial commit: Swasthya Sathi healthcare platform with AWS deployment"

# 6. Push to GitHub
git push -u origin main
```

## If Repository Already Has Files

If your GitHub repo already has a README or other files:

```bash
# Pull first to merge
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

## Common Issues and Fixes

### Issue: "fatal: not a git repository"
```bash
# Solution: Initialize git first
git init
```

### Issue: "remote origin already exists"
```bash
# Solution: Remove and re-add
git remote remove origin
git remote add origin https://github.com/vaibhvbhardwj/Swasthya-Sathi-aws.git
```

### Issue: "failed to push some refs"
```bash
# Solution: Pull first, then push
git pull origin main --rebase
git push -u origin main
```

### Issue: "Support for password authentication was removed"
```bash
# Solution: Use Personal Access Token instead of password
# See "Option 1: Use Personal Access Token" above
```

## After First Push

For subsequent changes:

```bash
# 1. Check status
git status

# 2. Add changes
git add .

# 3. Commit
git commit -m "Your commit message"

# 4. Push (no need for -u after first time)
git push
```

## Useful Git Commands

```bash
# View commit history
git log --oneline

# View changes before staging
git diff

# View staged changes
git diff --cached

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD

# Create and switch to new branch
git checkout -b feature-branch

# Switch branches
git checkout main

# View all branches
git branch -a
```

## Verify .gitignore is Working

```bash
# Check what files will be committed
git status

# These should NOT appear:
# - .env files
# - node_modules/
# - terraform.tfstate
# - terraform.tfvars
# - .terraform/

# If they appear, they're not being ignored properly
```

## Clean Up Sensitive Files (If Already Committed)

If you accidentally committed sensitive files before:

```bash
# Remove from git but keep locally
git rm --cached backend/.env
git rm --cached terraform/terraform.tfvars
git rm --cached -r terraform/.terraform/
git rm --cached terraform/terraform.tfstate*

# Commit the removal
git commit -m "Remove sensitive files from git"

# Push
git push
```

---

**Ready to push?** Run the commands in the "Complete Command Sequence" section!
