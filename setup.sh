#!/bin/bash

# Swasthya Sathi Setup Script
# This script helps automate the initial setup process

echo "🏥 Swasthya Sathi - Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js v16 or higher from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env from .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and add your AWS credentials!"
    echo ""
else
    echo "✅ backend/.env file exists"
    echo ""
fi

# Check if AWS credentials are configured
if grep -q "your_access_key_here" backend/.env; then
    echo "⚠️  AWS credentials not configured in .env"
    echo ""
    echo "Please edit backend/.env and add:"
    echo "  - AWS_ACCESS_KEY_ID"
    echo "  - AWS_SECRET_ACCESS_KEY"
    echo "  - AWS_REGION"
    echo ""
    echo "Then run: node backend/scripts/verify-aws-setup.js"
    echo ""
else
    echo "✅ AWS credentials appear to be configured"
    echo ""
    
    # Ask if user wants to verify AWS setup
    read -p "Would you like to verify AWS setup now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔍 Verifying AWS setup..."
        cd backend
        node scripts/verify-aws-setup.js
        cd ..
    fi
fi

echo ""
echo "================================"
echo "✅ Setup script complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your AWS credentials (if not done)"
echo "2. Enable Bedrock models in AWS Console"
echo "3. Run: cd backend && node scripts/setup-dynamodb.js"
echo "4. Run: cd backend && node scripts/verify-aws-setup.js"
echo "5. Start backend: cd backend && npm run dev"
echo "6. Open frontend/index.html in your browser"
echo ""
echo "For detailed instructions, see:"
echo "  - AWS-SETUP-GUIDE.md"
echo "  - SETUP-CHECKLIST.md"
echo "================================"
