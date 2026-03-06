const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { awsConfig, bedrockConfig } = require('../config/aws');

const bedrockClient = new BedrockRuntimeClient(awsConfig);

/**
 * Invoke Bedrock with fallback logic
 * Primary: Amazon Nova Pro, Fallback: Amazon Nova Lite
 */
async function invokeBedrockWithFallback(prompt, guardrails = []) {
  const fullPrompt = constructPromptWithGuardrails(prompt, guardrails);
  
  const payload = {
    messages: [{
      role: 'user',
      content: [{ text: fullPrompt }]
    }],
    inferenceConfig: {
      max_new_tokens: bedrockConfig.maxTokens,
      temperature: bedrockConfig.temperature
    }
  };

  const startTime = Date.now();

  try {
    // Try primary model (Amazon Nova Pro)
    const command = new InvokeModelCommand({
      modelId: bedrockConfig.modelIdSonnet,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const latency = Date.now() - startTime;

    // Log to CloudWatch (console.log for now)
    console.log('AI Interaction:', {
      model: 'Amazon Nova Pro',
      modelId: bedrockConfig.modelIdSonnet,
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    });

    return {
      text: responseBody.output?.message?.content?.[0]?.text || '',
      model: 'Amazon Nova Pro',
      latency
    };
  } catch (error) {
    console.error('Primary model failed:', error.message);

    // Fallback to Amazon Nova Lite within 2 seconds
    if (Date.now() - startTime < 2000) {
      try {
        const fallbackCommand = new InvokeModelCommand({
          modelId: bedrockConfig.modelIdHaiku,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify(payload)
        });

        const fallbackResponse = await bedrockClient.send(fallbackCommand);
        const fallbackBody = JSON.parse(new TextDecoder().decode(fallbackResponse.body));
        const fallbackLatency = Date.now() - startTime;

        console.log('AI Interaction (Fallback):', {
          model: 'Amazon Nova Lite',
          modelId: bedrockConfig.modelIdHaiku,
          latency: `${fallbackLatency}ms`,
          timestamp: new Date().toISOString()
        });

        return {
          text: fallbackBody.output?.message?.content?.[0]?.text || '',
          model: 'Amazon Nova Lite',
          latency: fallbackLatency
        };
      } catch (fallbackError) {
        console.error('Fallback model failed:', fallbackError.message);
        throw new Error('AI service unavailable');
      }
    }

    throw new Error('AI service timeout');
  }
}

/**
 * Construct prompt with guardrails
 */
function constructPromptWithGuardrails(basePrompt, guardrails) {
  if (guardrails.length === 0) {
    return basePrompt;
  }

  let prompt = basePrompt + '\n\nIMPORTANT SAFETY GUARDRAILS - YOU MUST FOLLOW THESE:\n';
  guardrails.forEach((rule, index) => {
    prompt += `${index + 1}. ${rule}\n`;
  });

  return prompt;
}

/**
 * Default healthcare guardrails
 */
const HEALTHCARE_GUARDRAILS = [
  'Do NOT provide diagnosis',
  'Do NOT provide prescription advice',
  'Do NOT recommend stopping medications',
  'Always suggest consulting a qualified healthcare professional for medical concerns'
];

module.exports = {
  invokeBedrockWithFallback,
  constructPromptWithGuardrails,
  HEALTHCARE_GUARDRAILS
};
