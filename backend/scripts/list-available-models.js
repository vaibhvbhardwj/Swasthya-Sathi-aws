require('dotenv').config();
const { BedrockClient, ListFoundationModelsCommand } = require('@aws-sdk/client-bedrock');
const { awsConfig } = require('../config/aws');

async function listAvailableModels() {
  console.log('🔍 Listing Available Bedrock Models in Your Region\n');
  console.log(`Region: ${awsConfig.region}\n`);
  
  try {
    const client = new BedrockClient(awsConfig);
    const command = new ListFoundationModelsCommand({});
    const response = await client.send(command);
    
    // Filter for Claude models only
    const claudeModels = response.modelSummaries.filter(model => 
      model.modelId.includes('claude') || model.modelId.includes('anthropic')
    );
    
    console.log(`Found ${claudeModels.length} Claude models:\n`);
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    claudeModels.forEach((model, index) => {
      console.log(`\n${index + 1}. ${model.modelName || 'Unknown'}`);
      console.log(`   Model ID: ${model.modelId}`);
      console.log(`   Provider: ${model.providerName}`);
      if (model.modelLifecycle) {
        console.log(`   Lifecycle: ${model.modelLifecycle.status}`);
      }
      if (model.inferenceTypesSupported) {
        console.log(`   Inference Types: ${model.inferenceTypesSupported.join(', ')}`);
      }
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('\n✅ To use a model, copy its Model ID to your .env file:');
    console.log('   BEDROCK_MODEL_ID_SONNET=<model-id-here>');
    console.log('\n💡 Recommended: Choose a model with "ACTIVE" lifecycle status');
    console.log('❌ Avoid: Models marked as "LEGACY"');
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    console.log('\nTroubleshooting:');
    console.log('• Check AWS credentials in .env file');
    console.log('• Verify IAM permissions include bedrock:ListFoundationModels');
    console.log('• Confirm region supports Bedrock');
  }
}

listAvailableModels();
