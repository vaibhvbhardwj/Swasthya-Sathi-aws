require('dotenv').config();
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { awsConfig, bedrockConfig, dynamoDBConfig } = require('../config/aws');

async function verifyAWSSetup() {
  console.log('🔍 Verifying AWS Setup for Swasthya Sathi\n');
  
  let allChecksPass = true;
  
  // Check 1: Environment Variables
  console.log('1️⃣ Checking Environment Variables...');
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('   ❌ AWS credentials not found in .env file');
    console.log('   → Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to .env');
    allChecksPass = false;
  } else {
    console.log('   ✅ AWS credentials configured');
  }
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here_change_in_production') {
    console.log('   ⚠️  JWT_SECRET should be changed for production');
  } else {
    console.log('   ✅ JWT_SECRET configured');
  }
  console.log('');
  
  // Check 2: DynamoDB Connection
  console.log('2️⃣ Checking DynamoDB Connection...');
  try {
    const dynamoClient = new DynamoDBClient(awsConfig);
    const listCommand = new ListTablesCommand({});
    const { TableNames } = await dynamoClient.send(listCommand);
    
    console.log('   ✅ DynamoDB connection successful');
    console.log(`   📋 Found ${TableNames.length} tables`);
    
    // Check required tables
    const requiredTables = Object.values(dynamoDBConfig.tables);
    const missingTables = requiredTables.filter(table => !TableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('   ❌ Missing tables:', missingTables.join(', '));
      console.log('   → Run: node scripts/setup-dynamodb.js');
      allChecksPass = false;
    } else {
      console.log('   ✅ All required tables exist');
    }
  } catch (error) {
    console.log('   ❌ DynamoDB connection failed:', error.message);
    console.log('   → Check AWS credentials and region');
    allChecksPass = false;
  }
  console.log('');
  
  // Check 3: Bedrock Primary Model (Amazon Nova Pro)
  console.log('3️⃣ Checking Amazon Bedrock Primary Model...');
  try {
    const bedrockClient = new BedrockRuntimeClient(awsConfig);
    
    // Test primary model (Amazon Nova Pro)
    const primaryModelId = bedrockConfig.modelIdSonnet;
    const isPrimaryNova = primaryModelId.includes('amazon.nova');
    const isPrimaryClaude = primaryModelId.includes('anthropic.claude');
    
    let primaryPayload;
    let primaryModelName;
    
    if (isPrimaryNova) {
      primaryModelName = 'Amazon Nova Pro';
      primaryPayload = {
        messages: [
          {
            role: 'user',
            content: [{ text: 'Hello, respond with just "OK"' }]
          }
        ],
        inferenceConfig: {
          max_new_tokens: 10,
          temperature: 0.7
        }
      };
    } else if (isPrimaryClaude) {
      primaryModelName = 'Claude';
      primaryPayload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello, respond with just "OK"'
          }
        ]
      };
    } else {
      throw new Error(`Unsupported model type: ${primaryModelId}`);
    }
    
    const primaryCommand = new InvokeModelCommand({
      modelId: primaryModelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(primaryPayload)
    });
    
    const primaryResponse = await bedrockClient.send(primaryCommand);
    const primaryResponseBody = JSON.parse(new TextDecoder().decode(primaryResponse.body));
    
    // Extract response text based on model type
    let primaryResponseText;
    if (isPrimaryNova) {
      primaryResponseText = primaryResponseBody.output?.message?.content?.[0]?.text || 'No response';
    } else if (isPrimaryClaude) {
      primaryResponseText = primaryResponseBody.content?.[0]?.text || 'No response';
    }
    
    console.log('   ✅ Primary model connection successful');
    console.log(`   ✅ ${primaryModelName} accessible`);
    console.log(`   📊 Model ID: ${primaryModelId}`);
    console.log(`   📊 Test response: "${primaryResponseText}"`);
  } catch (error) {
    console.log('   ❌ Primary model connection failed:', error.message);
    
    if (error.message.includes('AccessDeniedException')) {
      console.log('   → Enable model access in AWS Console:');
      console.log('      1. Go to AWS Console → Amazon Bedrock');
      console.log('      2. Click "Model access" → "Manage model access"');
      console.log('      3. Enable Amazon Nova models');
      console.log('      4. Wait 2-5 minutes for access to be granted');
    } else if (error.message.includes('ValidationException') || error.message.includes('Malformed')) {
      console.log('   → Check model ID in .env file');
      console.log('   → Verify region supports this model');
      console.log(`   → Current model: ${bedrockConfig.modelIdSonnet}`);
    } else {
      console.log('   → Check AWS credentials and region');
    }
    allChecksPass = false;
  }
  console.log('');
  
  // Check 4: Bedrock Fallback Model (Amazon Nova Lite)
  console.log('4️⃣ Checking Amazon Bedrock Fallback Model...');
  try {
    const bedrockClient = new BedrockRuntimeClient(awsConfig);
    
    // Test fallback model (Amazon Nova Lite)
    const fallbackModelId = bedrockConfig.modelIdHaiku;
    const isFallbackNova = fallbackModelId.includes('amazon.nova');
    const isFallbackClaude = fallbackModelId.includes('anthropic.claude');
    
    let fallbackPayload;
    let fallbackModelName;
    
    if (isFallbackNova) {
      fallbackModelName = 'Amazon Nova Lite';
      fallbackPayload = {
        messages: [
          {
            role: 'user',
            content: [{ text: 'Hello, respond with just "OK"' }]
          }
        ],
        inferenceConfig: {
          max_new_tokens: 10,
          temperature: 0.7
        }
      };
    } else if (isFallbackClaude) {
      fallbackModelName = 'Claude Haiku';
      fallbackPayload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello, respond with just "OK"'
          }
        ]
      };
    } else {
      throw new Error(`Unsupported model type: ${fallbackModelId}`);
    }
    
    const fallbackCommand = new InvokeModelCommand({
      modelId: fallbackModelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(fallbackPayload)
    });
    
    const fallbackResponse = await bedrockClient.send(fallbackCommand);
    const fallbackResponseBody = JSON.parse(new TextDecoder().decode(fallbackResponse.body));
    
    // Extract response text based on model type
    let fallbackResponseText;
    if (isFallbackNova) {
      fallbackResponseText = fallbackResponseBody.output?.message?.content?.[0]?.text || 'No response';
    } else if (isFallbackClaude) {
      fallbackResponseText = fallbackResponseBody.content?.[0]?.text || 'No response';
    }
    
    console.log('   ✅ Fallback model connection successful');
    console.log(`   ✅ ${fallbackModelName} accessible`);
    console.log(`   📊 Model ID: ${fallbackModelId}`);
    console.log(`   📊 Test response: "${fallbackResponseText}"`);
  } catch (error) {
    console.log('   ❌ Fallback model connection failed:', error.message);
    
    if (error.message.includes('AccessDeniedException')) {
      console.log('   → Enable model access in AWS Console:');
      console.log('      1. Go to AWS Console → Amazon Bedrock');
      console.log('      2. Click "Model access" → "Manage model access"');
      console.log('      3. Enable Amazon Nova models');
      console.log('      4. Wait 2-5 minutes for access to be granted');
    } else if (error.message.includes('ValidationException') || error.message.includes('Malformed')) {
      console.log('   → Check model ID in .env file');
      console.log('   → Verify region supports this model');
      console.log(`   → Current model: ${bedrockConfig.modelIdHaiku}`);
    } else {
      console.log('   → Check AWS credentials and region');
    }
    allChecksPass = false;
  }
  console.log('');
  
  // Summary
  console.log('═══════════════════════════════════════════════════════');
  if (allChecksPass) {
    console.log('✅ All checks passed! Your AWS setup is ready.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Open frontend: Open frontend/index.html in browser');
    console.log('3. Start building: Check tasks.md for implementation tasks');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above.');
    console.log('');
    console.log('Quick fixes:');
    console.log('• Add AWS credentials to .env file');
    console.log('• Run: node scripts/setup-dynamodb.js');
    console.log('• Enable Bedrock models in AWS Console');
  }
  console.log('═══════════════════════════════════════════════════════');
}

verifyAWSSetup().catch(console.error);
