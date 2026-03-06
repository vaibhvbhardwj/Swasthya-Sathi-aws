#!/bin/bash

echo "========================================"
echo "Creating LabReports DynamoDB Table"
echo "========================================"

echo "Creating LabReports table..."
aws dynamodb create-table \
  --table-name LabReports \
  --attribute-definitions \
    AttributeName=reportId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=reportId,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ LabReports table created successfully!"
  echo ""
  echo "Waiting for table to become active..."
  aws dynamodb wait table-exists --table-name LabReports --region us-east-1
  echo ""
  echo "✅ Table is now active and ready to use!"
  echo ""
  echo "Your application should now work at:"
  echo "https://buajhcpaic.us-east-1.awsapprunner.com"
else
  echo ""
  echo "❌ Failed to create table"
  echo ""
  echo "If the table already exists, you can verify with:"
  echo "aws dynamodb describe-table --table-name LabReports --region us-east-1"
fi
