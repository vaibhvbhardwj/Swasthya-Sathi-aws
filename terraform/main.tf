terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources for existing resources
data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# DynamoDB Tables (assuming they already exist)
data "aws_dynamodb_table" "users" {
  name = var.dynamodb_users_table
}

data "aws_dynamodb_table" "doctors" {
  name = var.dynamodb_doctors_table
}

data "aws_dynamodb_table" "consultations" {
  name = var.dynamodb_consultations_table
}

data "aws_dynamodb_table" "notifications" {
  name = var.dynamodb_notifications_table
}

data "aws_dynamodb_table" "medications" {
  name = var.dynamodb_medications_table
}

data "aws_dynamodb_table" "chat_drafts" {
  name = var.dynamodb_chat_drafts_table
}

data "aws_dynamodb_table" "lab_reports" {
  name = "LabReports"
}

# ECR Repository for Docker images
resource "aws_ecr_repository" "app" {
  name                 = var.app_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name        = var.app_name
    Environment = var.environment
  }
}

# ECR Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}

# IAM Role for App Runner
resource "aws_iam_role" "apprunner_instance" {
  name = "${var.app_name}-apprunner-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "tasks.apprunner.amazonaws.com"
      }
    }]
  })

  tags = {
    Name        = "${var.app_name}-apprunner-instance-role"
    Environment = var.environment
  }
}

# IAM Policy for DynamoDB access
resource "aws_iam_policy" "dynamodb_access" {
  name        = "${var.app_name}-dynamodb-access"
  description = "Allow App Runner to access DynamoDB tables"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          data.aws_dynamodb_table.users.arn,
          "${data.aws_dynamodb_table.users.arn}/index/*",
          data.aws_dynamodb_table.doctors.arn,
          "${data.aws_dynamodb_table.doctors.arn}/index/*",
          data.aws_dynamodb_table.consultations.arn,
          "${data.aws_dynamodb_table.consultations.arn}/index/*",
          data.aws_dynamodb_table.notifications.arn,
          "${data.aws_dynamodb_table.notifications.arn}/index/*",
          data.aws_dynamodb_table.medications.arn,
          "${data.aws_dynamodb_table.medications.arn}/index/*",
          data.aws_dynamodb_table.chat_drafts.arn,
          "${data.aws_dynamodb_table.chat_drafts.arn}/index/*",
          data.aws_dynamodb_table.lab_reports.arn,
          "${data.aws_dynamodb_table.lab_reports.arn}/index/*"
        ]
      }
    ]
  })
}

# IAM Policy for Bedrock access
resource "aws_iam_policy" "bedrock_access" {
  name        = "${var.app_name}-bedrock-access"
  description = "Allow App Runner to invoke Amazon Bedrock models"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = [
          "arn:aws:bedrock:${data.aws_region.current.name}::foundation-model/amazon.nova-pro-v1:0",
          "arn:aws:bedrock:${data.aws_region.current.name}::foundation-model/amazon.nova-lite-v1:0"
        ]
      }
    ]
  })
}

# Attach policies to the instance role
resource "aws_iam_role_policy_attachment" "dynamodb_access" {
  role       = aws_iam_role.apprunner_instance.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

resource "aws_iam_role_policy_attachment" "bedrock_access" {
  role       = aws_iam_role.apprunner_instance.name
  policy_arn = aws_iam_policy.bedrock_access.arn
}

# IAM Role for App Runner ECR access
resource "aws_iam_role" "apprunner_ecr_access" {
  name = "${var.app_name}-apprunner-ecr-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "build.apprunner.amazonaws.com"
      }
    }]
  })

  tags = {
    Name        = "${var.app_name}-apprunner-ecr-role"
    Environment = var.environment
  }
}

# Attach ECR access policy
resource "aws_iam_role_policy_attachment" "apprunner_ecr_access" {
  role       = aws_iam_role.apprunner_ecr_access.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# App Runner Service
resource "aws_apprunner_service" "app" {
  service_name = var.app_name

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access.arn
    }

    image_repository {
      image_identifier      = "${aws_ecr_repository.app.repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "3000"

        runtime_environment_variables = {
          NODE_ENV                       = var.environment
          AWS_REGION                     = var.aws_region
          DYNAMODB_USERS_TABLE           = var.dynamodb_users_table
          DYNAMODB_DOCTORS_TABLE         = var.dynamodb_doctors_table
          DYNAMODB_CONSULTATIONS_TABLE   = var.dynamodb_consultations_table
          DYNAMODB_NOTIFICATIONS_TABLE   = var.dynamodb_notifications_table
          DYNAMODB_MEDICATIONS_TABLE     = var.dynamodb_medications_table
          DYNAMODB_CHAT_DRAFTS_TABLE     = var.dynamodb_chat_drafts_table
          BEDROCK_MODEL_ID_SONNET        = "amazon.nova-pro-v1:0"
          BEDROCK_MODEL_ID_HAIKU         = "amazon.nova-lite-v1:0"
          JWT_SECRET                     = var.jwt_secret
        }
      }
    }

    auto_deployments_enabled = true
  }

  instance_configuration {
    instance_role_arn = aws_iam_role.apprunner_instance.arn
    cpu               = var.cpu
    memory            = var.memory
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    Name        = var.app_name
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.dynamodb_access,
    aws_iam_role_policy_attachment.bedrock_access,
    aws_iam_role_policy_attachment.apprunner_ecr_access
  ]
}

# CloudWatch Log Group for App Runner
resource "aws_cloudwatch_log_group" "apprunner" {
  name              = "/aws/apprunner/${var.app_name}"
  retention_in_days = 7

  tags = {
    Name        = var.app_name
    Environment = var.environment
  }
}
