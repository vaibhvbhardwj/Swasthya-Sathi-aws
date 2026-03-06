/**
 * Setup IAM Role for EC2 with Bedrock and DynamoDB Access
 * 
 * This script creates an IAM role for EC2 instances with permissions to:
 * - Access Amazon Nova Pro model (amazon.nova-pro-v1:0)
 * - Access Amazon Nova Lite model (amazon.nova-lite-v1:0)
 * - Read/write to all DynamoDB tables
 * - Write logs to CloudWatch
 * - Access S3 buckets (optional)
 * 
 * Requirements: 8.5, 10.7
 */

const { 
  IAMClient, 
  CreateRoleCommand, 
  PutRolePolicyCommand,
  CreateInstanceProfileCommand,
  AddRoleToInstanceProfileCommand,
  GetRoleCommand,
  GetInstanceProfileCommand
} = require('@aws-sdk/client-iam');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const iamClient = new IAMClient({ 
  region: process.env.AWS_REGION || 'us-east-1'
});

const ROLE_NAME = 'SwasthyaSathi-EC2-Role';
const INSTANCE_PROFILE_NAME = 'SwasthyaSathi-EC2-InstanceProfile';
const POLICY_NAME = 'SwasthyaSathi-EC2-Policy';

/**
 * Load JSON policy documents
 */
function loadPolicyDocuments() {
  const trustPolicy = fs.readFileSync(
    path.join(__dirname, 'iam-trust-policy-ec2.json'),
    'utf8'
  );
  
  const permissionsPolicy = fs.readFileSync(
    path.join(__dirname, 'iam-policy-ec2-bedrock.json'),
    'utf8'
  );
  
  return { trustPolicy, permissionsPolicy };
}

/**
 * Check if role already exists
 */
async function roleExists(roleName) {
  try {
    await iamClient.send(new GetRoleCommand({ RoleName: roleName }));
    return true;
  } catch (error) {
    if (error.name === 'NoSuchEntity') {
      return false;
    }
    throw error;
  }
}

/**
 * Check if instance profile already exists
 */
async function instanceProfileExists(profileName) {
  try {
    await iamClient.send(new GetInstanceProfileCommand({ 
      InstanceProfileName: profileName 
    }));
    return true;
  } catch (error) {
    if (error.name === 'NoSuchEntity') {
      return false;
    }
    throw error;
  }
}

/**
 * Create IAM role with trust policy
 */
async function createRole(roleName, trustPolicy) {
  console.log(`Creating IAM role: ${roleName}...`);
  
  const command = new CreateRoleCommand({
    RoleName: roleName,
    AssumeRolePolicyDocument: trustPolicy,
    Description: 'IAM role for Swasthya Sathi EC2 instances with Bedrock and DynamoDB access',
    Tags: [
      { Key: 'Project', Value: 'SwasthyaSathi' },
      { Key: 'Environment', Value: 'Production' },
      { Key: 'ManagedBy', Value: 'SetupScript' }
    ]
  });
  
  const response = await iamClient.send(command);
  console.log('✅ IAM role created successfully');
  console.log(`   Role ARN: ${response.Role.Arn}`);
  return response.Role;
}

/**
 * Attach inline policy to role
 */
async function attachPolicy(roleName, policyName, permissionsPolicy) {
  console.log(`\nAttaching permissions policy: ${policyName}...`);
  
  const command = new PutRolePolicyCommand({
    RoleName: roleName,
    PolicyName: policyName,
    PolicyDocument: permissionsPolicy
  });
  
  await iamClient.send(command);
  console.log('✅ Permissions policy attached successfully');
  
  // Parse and display permissions
  const policy = JSON.parse(permissionsPolicy);
  console.log('\n📋 Granted Permissions:');
  policy.Statement.forEach((statement, index) => {
    console.log(`   ${index + 1}. ${statement.Sid || 'Statement ' + (index + 1)}`);
    if (statement.Resource) {
      const resources = Array.isArray(statement.Resource) 
        ? statement.Resource 
        : [statement.Resource];
      resources.forEach(resource => {
        if (resource.includes('bedrock')) {
          const modelId = resource.split('/').pop();
          console.log(`      - Bedrock Model: ${modelId}`);
        } else if (resource.includes('dynamodb')) {
          const tableName = resource.split('/')[1].split('/')[0];
          if (!tableName.includes('*')) {
            console.log(`      - DynamoDB Table: ${tableName}`);
          }
        }
      });
    }
  });
}

/**
 * Create instance profile
 */
async function createInstanceProfile(profileName) {
  console.log(`\nCreating instance profile: ${profileName}...`);
  
  const command = new CreateInstanceProfileCommand({
    InstanceProfileName: profileName,
    Tags: [
      { Key: 'Project', Value: 'SwasthyaSathi' },
      { Key: 'Environment', Value: 'Production' }
    ]
  });
  
  const response = await iamClient.send(command);
  console.log('✅ Instance profile created successfully');
  console.log(`   Profile ARN: ${response.InstanceProfile.Arn}`);
  return response.InstanceProfile;
}

/**
 * Add role to instance profile
 */
async function addRoleToProfile(profileName, roleName) {
  console.log(`\nAdding role to instance profile...`);
  
  const command = new AddRoleToInstanceProfileCommand({
    InstanceProfileName: profileName,
    RoleName: roleName
  });
  
  await iamClient.send(command);
  console.log('✅ Role added to instance profile successfully');
}

/**
 * Main setup function
 */
async function setupIAMRole() {
  console.log('🚀 Starting IAM Role Setup for Swasthya Sathi EC2 Instances\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    // Load policy documents
    const { trustPolicy, permissionsPolicy } = loadPolicyDocuments();
    
    // Check if role already exists
    const exists = await roleExists(ROLE_NAME);
    if (exists) {
      console.log(`⚠️  IAM role "${ROLE_NAME}" already exists`);
      console.log('   Updating permissions policy...\n');
      
      // Update the policy
      await attachPolicy(ROLE_NAME, POLICY_NAME, permissionsPolicy);
    } else {
      // Create new role
      await createRole(ROLE_NAME, trustPolicy);
      
      // Attach permissions policy
      await attachPolicy(ROLE_NAME, POLICY_NAME, permissionsPolicy);
    }
    
    // Check if instance profile exists
    const profileExists = await instanceProfileExists(INSTANCE_PROFILE_NAME);
    if (profileExists) {
      console.log(`\n⚠️  Instance profile "${INSTANCE_PROFILE_NAME}" already exists`);
    } else {
      // Create instance profile
      await createInstanceProfile(INSTANCE_PROFILE_NAME);
      
      // Add role to instance profile
      await addRoleToProfile(INSTANCE_PROFILE_NAME, ROLE_NAME);
    }
    
    // Display summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ IAM Role Setup Complete!\n');
    console.log('📝 Summary:');
    console.log(`   Role Name: ${ROLE_NAME}`);
    console.log(`   Instance Profile: ${INSTANCE_PROFILE_NAME}`);
    console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}\n`);
    
    console.log('🔐 Permissions Granted:');
    console.log('   ✓ Amazon Bedrock - Nova Pro model');
    console.log('   ✓ Amazon Bedrock - Nova Lite model');
    console.log('   ✓ DynamoDB - All Swasthya Sathi tables (read/write)');
    console.log('   ✓ CloudWatch Logs - Write access');
    console.log('   ✓ S3 - Frontend bucket access\n');
    
    console.log('📌 Next Steps:');
    console.log('   1. When launching EC2 instance, attach this instance profile:');
    console.log(`      ${INSTANCE_PROFILE_NAME}`);
    console.log('   2. The EC2 instance will automatically have access to:');
    console.log('      - Amazon Nova Pro and Nova Lite models');
    console.log('      - All DynamoDB tables');
    console.log('      - CloudWatch for logging');
    console.log('   3. No need to configure AWS credentials on the EC2 instance\n');
    
    console.log('💡 AWS CLI Command to Launch EC2 with this Role:');
    console.log(`   aws ec2 run-instances \\`);
    console.log(`     --image-id ami-xxxxxxxxx \\`);
    console.log(`     --instance-type t3.medium \\`);
    console.log(`     --iam-instance-profile Name=${INSTANCE_PROFILE_NAME} \\`);
    console.log(`     --security-group-ids sg-xxxxxxxxx \\`);
    console.log(`     --subnet-id subnet-xxxxxxxxx\n`);
    
  } catch (error) {
    console.error('\n❌ Error setting up IAM role:', error.message);
    
    if (error.name === 'AccessDenied') {
      console.error('\n⚠️  Access Denied: Your AWS credentials do not have permission to create IAM roles.');
      console.error('   Required IAM permissions:');
      console.error('   - iam:CreateRole');
      console.error('   - iam:PutRolePolicy');
      console.error('   - iam:CreateInstanceProfile');
      console.error('   - iam:AddRoleToInstanceProfile');
      console.error('\n   Please contact your AWS administrator to grant these permissions.');
    }
    
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupIAMRole();
}

module.exports = { setupIAMRole };
