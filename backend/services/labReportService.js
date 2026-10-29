const { invokeLocalLlama } = require('./aiEngineService');

/**
 * Parse lab report text into structured format
 * Extracts common lab test values from text
 */
function parseLabReport(reportText) {
  const tests = [];
  const lines = reportText.split('\n');
  
  console.log(`Parsing ${lines.length} lines of text`);
  
  // Expanded test patterns to support more common lab tests
  const testPatterns = {
    'HbA1c': /hba1c|glycated|hemoglobin a1c/i,
    'LDL': /\bldl\b|low.density/i,
    'HDL': /\bhdl\b|high.density/i,
    'Total Cholesterol': /total.cholesterol|cholesterol.total|^cholesterol|choco/i,
    'Triglycerides': /triglyceride/i,
    'WBC': /\bwbc\b|white.blood.cell/i,
    'RBC': /\brbc\b|red.blood.cell/i,
    'Hemoglobin': /hemoglobin|hgb|hb(?!\w)/i,
    'Hematocrit': /hematocrit|hct/i,
    'Platelets': /platelet/i,
    'Glucose': /glucose|blood.sugar/i,
    'Creatinine': /creatinine|crosinine/i,
    'BUN': /\bbun\b|blood.urea.nitrogen/i,
    'Sodium': /\bsodium\b|sodom/i,
    'Potassium': /potassium|potwssom/i,
    'Chloride': /chloride|choide/i,
    'Calcium': /calcium/i,
    'Protein': /\bprotein\b|promos/i,
    'Albumin': /albumin/i,
    'Bilirubin': /bilirubin|bwamtos/i,
    'ALT': /\balt\b|alanine/i,
    'AST': /\bast\b|aspartate/i,
    'Alkaline Phosphatase': /alkaline.phosphatase|alp(?!\w)/i
  };

  for (const line of lines) {
    for (const [testName, pattern] of Object.entries(testPatterns)) {
      if (pattern.test(line)) {
        console.log(`Found potential match for ${testName} in line: ${line.substring(0, 100)}`);
        
        // Look for numeric values in the line - more flexible matching
        // Match numbers that might have spaces or other characters around them
        const valueMatches = line.match(/\b(\d+\.?\d*)\b/g);
        
        if (valueMatches && valueMatches.length > 0) {
          // Take the first numeric value found
          const value = parseFloat(valueMatches[0]);
          
          // Look for units
          const unitMatch = line.match(/(\w+\/\w+|%|g\/dL|mg\/dL|mmol\/L|cells\/μL|mEq\/L|U\/L)/i);
          
          // Look for reference range (two numbers with dash or hyphen)
          const rangeMatch = line.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
          
          console.log(`  -> Extracted value: ${value}, unit: ${unitMatch?.[1] || 'none'}`);
          
          tests.push({
            name: testName,
            value: value,
            unit: unitMatch ? unitMatch[1] : '',
            referenceRange: rangeMatch ? {
              min: parseFloat(rangeMatch[1]),
              max: parseFloat(rangeMatch[2])
            } : null
          });
          
          break; // Only match once per line
        }
      }
    }
  }

  console.log(`Parsed ${tests.length} test values`);
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
 * Generate AI explanation using local Llama 3 with guardrails
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

  try {
    const response = await invokeLocalLlama(prompt);
    return response.text || 'Unable to generate explanation';
  } catch (error) {
    console.warn('AI explanation fallback:', error.message);
    let summary = 'Lab Analysis Summary:\n';
    if (abnormals.length > 0) {
      summary += `• Out-of-range parameters: ${abnormals.join(', ')}.\n• Please consult a healthcare professional for clinical evaluation.`;
    } else {
      summary += '• All parsed test parameters are within standard reference ranges.';
    }
    return summary;
  }
}

module.exports = {
  parseLabReport,
  prettyPrintLabReport,
  detectAbnormals,
  generateAIExplanation
};
