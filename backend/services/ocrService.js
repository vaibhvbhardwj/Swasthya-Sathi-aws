const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

/**
 * Extract text from an image file using Tesseract.js (free OCR)
 * Supports all image formats: JPEG, PNG, GIF, WebP, etc.
 * 
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {string} format - The image format (jpeg, png, gif, webp)
 * @returns {Promise<string>} - Extracted text content
 * @throws {Error} - If extraction fails or text is too short
 */
async function extractTextFromImage(imageBuffer, format) {
  try {
    // Validate input
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
      throw new Error('Invalid image buffer provided');
    }

    console.log(`Processing ${format} image with Tesseract.js, size: ${imageBuffer.length} bytes`);

    // Use Tesseract.js to extract text
    const result = await Tesseract.recognize(
      imageBuffer,
      'eng', // English language
      {
        logger: info => {
          if (info.status === 'recognizing text') {
            console.log(`Tesseract progress: ${Math.round(info.progress * 100)}%`);
          }
        }
      }
    );

    const extractedText = result.data.text.trim();

    console.log(`Extracted text length: ${extractedText.length} characters`);
    console.log(`Extracted text preview: ${extractedText.substring(0, 200)}...`);

    // Validate minimum text length
    if (extractedText.length < 10) {
      throw new Error('Extracted text is too short (minimum 10 characters required). The image may not contain readable text or the quality may be too low.');
    }

    return extractedText;
  } catch (error) {
    console.error('Image OCR error:', error);
    
    if (error.message.includes('Extracted text is too short')) {
      throw error;
    }
    
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
}

/**
 * Extract text from a PDF file using pdf-parse (free PDF text extraction)
 * 
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text content
 * @throws {Error} - If extraction fails or text is too short
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    // Validate input
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Invalid PDF buffer provided');
    }

    console.log(`Processing PDF with pdf-parse, size: ${pdfBuffer.length} bytes`);

    // Use pdf-parse to extract text
    const data = await pdfParse(pdfBuffer);
    const extractedText = data.text.trim();

    console.log(`Extracted text length: ${extractedText.length} characters`);
    console.log(`PDF pages: ${data.numpages}`);

    // Validate minimum text length
    if (extractedText.length < 10) {
      throw new Error('Extracted text is too short (minimum 10 characters required). The PDF may not contain readable text or may be image-based (scanned).');
    }

    return extractedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    if (error.message.includes('Extracted text is too short')) {
      throw error;
    }
    
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

module.exports = {
  extractTextFromImage,
  extractTextFromPDF
};
