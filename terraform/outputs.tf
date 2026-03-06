output "app_runner_service_url" {
  description = "App Runner service URL"
  value       = "https://${aws_apprunner_service.app.service_url}"
}

output "app_runner_service_id" {
  description = "App Runner service ID"
  value       = aws_apprunner_service.app.service_id
}

output "app_runner_service_arn" {
  description = "App Runner service ARN"
  value       = aws_apprunner_service.app.arn
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = aws_ecr_repository.app.name
}

output "instance_role_arn" {
  description = "App Runner instance role ARN"
  value       = aws_iam_role.apprunner_instance.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.apprunner.name
}
