variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "swasthya-sathi"
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "cpu" {
  description = "CPU units for App Runner (1024 = 1 vCPU)"
  type        = string
  default     = "1024"
}

variable "memory" {
  description = "Memory for App Runner (in MB)"
  type        = string
  default     = "2048"
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

# DynamoDB Table Names
variable "dynamodb_users_table" {
  description = "DynamoDB Users table name"
  type        = string
  default     = "SwasthyaSathi-Users"
}

variable "dynamodb_doctors_table" {
  description = "DynamoDB Doctors table name"
  type        = string
  default     = "SwasthyaSathi-Doctors"
}

variable "dynamodb_consultations_table" {
  description = "DynamoDB Consultations table name"
  type        = string
  default     = "SwasthyaSathi-Consultations"
}

variable "dynamodb_notifications_table" {
  description = "DynamoDB Notifications table name"
  type        = string
  default     = "SwasthyaSathi-Notifications"
}

variable "dynamodb_medications_table" {
  description = "DynamoDB Medications table name"
  type        = string
  default     = "SwasthyaSathi-Medications"
}

variable "dynamodb_chat_drafts_table" {
  description = "DynamoDB Chat Drafts table name"
  type        = string
  default     = "SwasthyaSathi-ChatDrafts"
}
