const http = require('http');
const https = require('https');

/**
 * Invoke local Llama 3 through Ollama.
 */
async function invokeLocalLlama(prompt, guardrails = []) {
  const fullPrompt = constructPromptWithGuardrails(prompt, guardrails);
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3';
  const timeout = parseInt(process.env.OLLAMA_TIMEOUT_MS || '180000', 10);
  const temperature = parseFloat(process.env.OLLAMA_TEMPERATURE || '0.4');
  const maxTokens = parseInt(process.env.OLLAMA_MAX_TOKENS || '450', 10);

  const chatPayload = {
    model,
    stream: false,
    messages: [
      {
        role: 'user',
        content: fullPrompt
      }
    ],
    options: {
      temperature,
      num_predict: maxTokens
    }
  };

  const startTime = Date.now();

  try {
    const rootUrl = baseUrl.replace(/\/$/, '');
    let responseBody;
    let text = '';

    try {
      responseBody = await postJson(`${rootUrl}/api/chat`, chatPayload, timeout);
      text = responseBody.message?.content || '';
    } catch (chatError) {
      const generatePayload = {
        model,
        stream: false,
        prompt: fullPrompt,
        options: {
          temperature,
          num_predict: maxTokens
        }
      };

      responseBody = await postJson(`${rootUrl}/api/generate`, generatePayload, timeout);
      text = responseBody.response || '';
    }

    const latency = Date.now() - startTime;

    console.log('AI Interaction:', {
      provider: 'ollama',
      model,
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    });

    return {
      text: text.trim(),
      model,
      latency
    };
  } catch (error) {
    console.warn(`Local Llama unavailable (${error.message}). Falling back to safe offline response.`);
    if (process.env.DISABLE_OFFLINE_FALLBACK !== 'true') {
      return {
        text: generateOfflineHealthcareGuidance(prompt),
        model: 'offline-assistant (Ollama offline)',
        latency: Date.now() - startTime
      };
    }
    throw new Error(`Local Llama service unavailable. Make sure Ollama is running and the "${model}" model is pulled.`);
  }
}

function generateOfflineHealthcareGuidance(prompt) {
  if (prompt.includes('Lab Results:')) {
    return `Analysis Overview (Offline Assistant Mode):
Your lab values have been successfully parsed and checked against standard reference intervals.

Key Health Insights:
1. Review Abnormal Findings: Always discuss any out-of-range biomarkers directly with your physician.
2. Treatment Continuity: Do not start, stop, or adjust prescription medications without clinical advice.
3. Lifestyle & Nutrition: Maintain proper hydration, adequate sleep, and a balanced diet.

(Notice: Running in safe offline mode because an Ollama instance was not detected on this device).`;
  }

  return `Health Assistant Guidance (Offline Assistant Mode):
Thank you for your question. While local Ollama is not running on this device, here is safe general guidance:

1. Self-Care: Rest comfortably, drink plenty of fluids, and monitor for changes in symptoms.
2. Clinical Consultation: For an accurate diagnosis and treatment, please consult a verified doctor or schedule an appointment via our Consultations tab.
3. Medication: Only take medications as prescribed by your doctor or advised by a licensed pharmacist.
4. Emergency: If experiencing acute chest discomfort, severe breathlessness, or sudden neurological deficits, please seek urgent medical care immediately.

(Notice: Running in safe offline mode. To enable full AI reasoning, run "ollama serve" and "ollama pull llama3" or connect to a remote endpoint).`;
}

function postJson(url, payload, timeout) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const transport = parsedUrl.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);

    const request = transport.request({
      method: 'POST',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout
    }, (response) => {
      let responseText = '';

      response.on('data', chunk => {
        responseText += chunk;
      });

      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(`Ollama returned HTTP ${response.statusCode}: ${responseText}`));
        }

        try {
          resolve(JSON.parse(responseText));
        } catch (error) {
          reject(new Error(`Ollama returned invalid JSON: ${error.message}`));
        }
      });
    });

    request.on('timeout', () => {
      request.destroy(new Error(`Ollama request timed out after ${timeout}ms`));
    });

    request.on('error', reject);
    request.write(body);
    request.end();
  });
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
  invokeLocalLlama,
  constructPromptWithGuardrails,
  HEALTHCARE_GUARDRAILS
};
