#!/bin/bash

# Quick AWS Credentials Setup for Terraform
# This script helps you configure AWS credentials for Terraform deployment

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "  AWS Credentials Setup for Terraform"
echo "========================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed!${NC}"
    echo ""
    echo "Please install AWS CLI first:"
    echo "  Mac: brew install awscli"
    echo "  Linux: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI is installed${NC}"
echo ""

# Check if backend .env file exists
if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}Found backend/.env file${NC}"
    echo ""
    echo "You can use the same credentials from your backend/.env file"
    echo ""
    echo "Your current backend/.env credentials:"
    echo "----------------------------------------"
    grep "AWS_ACCESS_KEY_ID" backend/.env || echo "AWS_ACCESS_KEY_ID not found"
    grep "AWS_SECRET_ACCESS_KEY" backend/.env | sed 's/AWS_SECRET_ACCESS_KEY=.*/AWS_SECRET_ACCESS_KEY=***hidden***/' || echo "AWS_SECRET_ACCESS_KEY not found"
    echo "----------------------------------------"
    echo ""
fi

echo "Now let's configure AWS CLI for Terraform..."
echo ""
echo "You will be prompted for:"
echo "  1. AWS Access Key ID"
echo "  2. AWS Secret Access Key"
echo "  3. Default region (enter: us-east-1)"
echo "  4. Default output format (enter: json)"
echo ""
read -p "Press Enter to continue..."

# Run aws configure
aws configure

echo ""
echo "========================================"
echo "  Verifying Configuration"
echo "========================================"
echo ""

# Verify configuration
if aws sts get-caller-identity; then
    echo ""
    echo -e "${GREEN}========================================"
    echo "  SUCCESS! Credentials configured!"
    echo "========================================${NC}"
    echo ""
    echo "You can now run Terraform:"
    echo "  cd terraform"
    echo "  terraform init"
    echo "  terraform plan"
    echo "  terraform apply"
    echo ""
else
    echo ""
    echo -e "${RED}========================================"
    echo "  ERROR: Verification failed"
    echo "========================================${NC}"
    echo ""
    echo "Please check your credentials and try again:"
    echo "  aws configure"
    echo ""
    exit 1
fi
