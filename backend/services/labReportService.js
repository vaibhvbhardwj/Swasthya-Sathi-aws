const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { awsConfig, bedrockConfig } = require('../config/aws');

const bedrockClient = new BedrockRuntimeClient(awsConfig);

/**
 * Parse lab report text into structured format
 * Extracts: HbA1c, LDL, HDL, WBC, RBC, Hemoglobin
 */
function parseLabReport(reportText) {
  const tests = [];
  const lines = reportText.split('\n');
  
  const testPatterns = {
    'HbA1c': /hba1c|glycated|hemoglobin a1c/i,
    'LDL': /ldl|low.density/i,
    'HDL': /hdl|high.density/i,
    'WBC': /wbc|white.blood.cell/i,
    'RBC': /rbc|red.blood.cell/i,
    'Hemoglobin': /hemoglobin|hgb|hb(?!\w)/i
  };

  for (const line of lines) {
    for (const [testName, pattern] of Object.entries(testPatterns)) {
      if (pattern.test(line)) {
        const valueMatch = line.match(/(\d+\.?\d*)/);
        const unitMatch = line.match(/(\w+\/\w+|%|g\/dL|mg\/dL|cells\/μL)/i);
        const rangeMatch = line.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
        
        if (valueMatch) {
          tests.push({
            name: testName,
            value: parseFloat(valueMatch[1]),
            unit: unitMatch ? unitMatch[1] : '',
            referenceRange: rangeMatch ? {
              min: parseFloat(rangeMatch[1]),
              max: parseFloat(rangeMatch[2])
            } : null
          });
        }
      }
    }
  }

  return { tests };
}

/**
 * Pretty print LabReport object back to text
 */
function prettyPrintLabReport(labReport) {
  let output = 'Lab Report:\n\n';
  
  for (const test of labReport.tests) {
    output += `${test.name}: ${test.value} ${test.unit}`;
    if (test.referenceRange) {
      output += ` (Reference: ${test.referenceRange.min}-${test.referenceRange.max})`;
    }
    output += '\n';
  }
  
  return output;
}

/**
 * Detect abnormal results
 */
function detectAbnormals(labReport) {
  const abnormals = [];
  
  for (const test of labReport.tests) {
    if (test.referenceRange) {
      const { value, referenceRange } = test;
      if (value < referenceRange.min || value > referenceRange.max) {
        abnormals.push(test.name);
      }
    }
  }
  
  return abnormals;
}

/**
 * Generate AI explanation using Amazon Nova Pro with guardrails
 */
async function generateAIExplanation(labReport, abnormals) {
  const prompt = `You are a healthcare AI assistant. Analyze this lab report and provide a patient-friendly explanation.

Lab Results:
${prettyPrintLabReport(labReport)}

Abnormal Results: ${abnormals.length > 0 ? abnormals.join(', ') : 'None'}

IMPORTANT GUARDRAILS - YOU MUST FOLLOW THESE:
1. Do NOT provide diagnosis
2. Do NOT provide prescription advice
3. Do NOT recommend stopping medications
4. Explain what the values mean in simple terms
5. Suggest consulting a doctor for abnormal values

Provide a clear, patient-friendly explanation:`;

  const payload = {
    messages: [{
      role: 'user',
      content: [{ text: prompt }]
    }],
    inferenceConfig: {
      max_new_tokens: bedrockConfig.maxTokens,
      temperature: bedrockConfig.temperature
    }
  };

  try {
    const command = new InvokeModelCommand({
      modelId: bedrockConfig.modelIdSonnet,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.output?.message?.content?.[0]?.text || 'Unable to generate explanation';
  } catch (error) {
    console.error('Bedrock error:', error);
    
    // Fallback to Nova Lite
    try {
      const fallbackCommand = new InvokeModelCommand({
        modelId: bedrockConfig.modelIdHaiku,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });
      
      const fallbackResponse = await bedrockClient.send(fallbackCommand);
      const fallbackBody = JSON.parse(new TextDecoder().decode(fallbackResponse.body));
      
      return fallbackBody.output?.message?.content?.[0]?.text || 'Unable to generate explanation';
    } catch (fallbackError) {
      throw new Error('AI service unavailable');
    }
  }
}

module.exports = {
  parseLabReport,
  prettyPrintLabReport,
  detectAbnormals,
  generateAIExplanation
};
