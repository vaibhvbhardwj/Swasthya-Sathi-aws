#!/bin/bash

# Swasthya Sathi - AWS App Runner Deployment Script
# This script builds and pushes the Docker image to ECR, then deploys to App Runner

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
APP_NAME="${APP_NAME:-swasthya-sathi}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo -e "${GREEN}🚀 Swasthya Sathi Deployment Script${NC}"
echo "======================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Get AWS account ID
echo -e "${YELLOW}📋 Getting AWS account information...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"

# ECR repository URL
ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"

# Login to ECR
echo ""
echo -e "${YELLOW}🔐 Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
echo -e "${GREEN}✓ Successfully logged in to ECR${NC}"

# Build Docker image
echo ""
echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
docker build -t ${APP_NAME}:${IMAGE_TAG} .
echo -e "${GREEN}✓ Docker image built successfully${NC}"

# Tag image for ECR
echo ""
echo -e "${YELLOW}🏷️  Tagging image for ECR...${NC}"
docker tag ${APP_NAME}:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}
echo -e "${GREEN}✓ Image tagged: ${ECR_REPO}:${IMAGE_TAG}${NC}"

# Push to ECR
echo ""
echo -e "${YELLOW}📤 Pushing image to ECR...${NC}"
docker push ${ECR_REPO}:${IMAGE_TAG}
echo -e "${GREEN}✓ Image pushed successfully${NC}"

# Get App Runner service ARN
echo ""
echo -e "${YELLOW}🔍 Checking App Runner service...${NC}"
SERVICE_ARN=$(aws apprunner list-services --region ${AWS_REGION} --query "ServiceSummaryList[?ServiceName=='${APP_NAME}'].ServiceArn" --output text)

if [ -z "$SERVICE_ARN" ]; then
    echo -e "${YELLOW}⚠️  App Runner service not found. Please deploy infrastructure first using Terraform.${NC}"
    echo ""
    echo "Run the following commands:"
    echo "  cd terraform"
    echo "  terraform init"
    echo "  terraform apply"
    exit 1
fi

echo -e "${GREEN}✓ Found App Runner service: ${SERVICE_ARN}${NC}"

# Trigger deployment
echo ""
echo -e "${YELLOW}🚀 Triggering App Runner deployment...${NC}"
aws apprunner start-deployment --service-arn ${SERVICE_ARN} --region ${AWS_REGION}
echo -e "${GREEN}✓ Deployment triggered${NC}"

# Get service URL
echo ""
echo -e "${YELLOW}🌐 Getting service URL...${NC}"
SERVICE_URL=$(aws apprunner describe-service --service-arn ${SERVICE_ARN} --region ${AWS_REGION} --query "Service.ServiceUrl" --output text)
echo -e "${GREEN}✓ Service URL: https://${SERVICE_URL}${NC}"

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Wait 2-3 minutes for the deployment to complete"
echo "  2. Check deployment status: aws apprunner describe-service --service-arn ${SERVICE_ARN} --region ${AWS_REGION}"
echo "  3. Access your application: https://${SERVICE_URL}"
echo "  4. View logs: aws logs tail /aws/apprunner/${APP_NAME} --follow --region ${AWS_REGION}"
echo ""
