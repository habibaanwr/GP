/**
 * API service for communicating with the Multimodal RAG API
 */
import { API_CONFIG } from '../config';

// Set API base URL
let API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Debug log function that only logs when debug mode is enabled
 */
const debugLog = (message, data = null) => {
  if (API_CONFIG.DEBUG) {
    if (data) {
      console.log(`[API DEBUG] ${message}`, data);
    } else {
      console.log(`[API DEBUG] ${message}`);
    }
  }
};

/**
 * Utility function to execute an async operation without a timeout
 * @param {Function} operation - The operation to execute
 * @returns {Promise<any>} - Result of the operation
 */
const retryOperation = async (operation) => {
  return await operation();
};

/**
 * Check the API server availability (simplified to always return the base URL)
 * @returns {Promise<string>} - The API base URL
 */
export const checkServer = async () => {
  debugLog(`Using configured API server URL: ${API_BASE_URL}`);
  return API_BASE_URL;
};

/**
 * Upload and ingest a PDF document
 * @param {File} file - The PDF file to upload
 * @returns {Promise<{document_id: string, filename: string, status: string, chunks_processed: number}>}
 */
export const ingestDocument = async (file) => {
  // First check if the API server is available
  const apiUrl = await checkServer();
  
  const formData = new FormData();
  formData.append('file', file);

  return retryOperation(async () => {
    try {
      debugLog(`Uploading document to ${apiUrl}/api/v1/qa/ingest`);
      
      const response = await fetch(`${apiUrl}/api/v1/qa/ingest`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      debugLog('Document ingested successfully', data);
      return data;
    } catch (error) {
      debugLog('Error ingesting document', error.message);
      
      // Check for specific errors
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out. The server might be busy or the file may be too large.`);
      }
      
      // Check if it's a network error
      if (error.message === 'Failed to fetch') {
        throw new Error(`Network error: Unable to connect to the API server at ${apiUrl}. Please ensure the server is running.`);
      }
      
      // Check for empty file error
      if (error.message.includes('No file provided')) {
        throw new Error('No file was provided for upload. Please select a PDF file.');
      }
      
      // Check for file format errors
      if (error.message.includes('Unsupported file format')) {
        throw new Error('Unsupported file format. Only PDF files are accepted.');
      }
      
      // Check for file size errors
      if (error.message.includes('File size exceeds')) {
        throw new Error('File size exceeds the maximum limit of 20MB.');
      }
      
      throw error;
    }
  });
};

/**
 * Ask a question about the ingested document
 * @param {string} query - The question to ask
 * @param {string} documentId - Optional document ID to restrict the question to
 * @param {number} topK - Number of chunks to retrieve (default: 5)
 * @returns {Promise<{answer: string, sources: Array, query: string}>}
 */
export const askQuestion = async (query, documentId = null, topK = 5) => {
  const apiUrl = await checkServer();
  
  const payload = {
    query,
    top_k: topK
  };
  
  if (documentId) {
    payload.document_id = documentId;
  }
  
  return retryOperation(async () => {
    try {
      debugLog(`Sending question to ${apiUrl}/api/v1/qa/ask`, payload);
      
      const response = await fetch(`${apiUrl}/api/v1/qa/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      debugLog('Question answered successfully', data);
      return data;
    } catch (error) {
      debugLog('Error asking question', error.message);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out. The server might be busy or your question might be too complex.`);
      }
      
      if (error.message === 'Failed to fetch') {
        throw new Error(`Network error: Unable to connect to the API server at ${apiUrl}. Please ensure the server is running.`);
      }
      
      throw error;
    }
  });
};

/**
 * Get follow-up questions for a given question
 * @param {string} query - The original question
 * @param {string} documentId - Optional document ID to restrict follow-up questions to
 * @returns {Promise<{questions: string[]}>}
 */
export const getFollowUpQuestions = async (query, documentId = null) => {
  const apiUrl = await checkServer();
  
  const payload = {
    query
  };
  
  if (documentId) {
    payload.document_id = documentId;
  }
  
  return retryOperation(async () => {
    try {
      debugLog(`Getting follow-up questions from ${apiUrl}/api/v1/qa/follow-up`, payload);
      
      const response = await fetch(`${apiUrl}/api/v1/qa/follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      debugLog('Follow-up questions generated successfully', data);
      return data;
    } catch (error) {
      debugLog('Error generating follow-up questions', error.message);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out. The server might be busy.`);
      }
      
      if (error.message === 'Failed to fetch') {
        throw new Error(`Network error: Unable to connect to the API server at ${apiUrl}. Please ensure the server is running.`);
      }
      
      throw error;
    }
  });
};

/**
 * Generate a summary of the ingested document
 * @param {string} documentId - The document ID to summarize
 * @param {string} summaryType - Type of summary ('comprehensive' or 'executive')
 * @param {number} length - Desired length of the summary in words
 * @returns {Promise<{summary: string, document_id: string, summary_type: string, length: number}>}
 */
export const getSummary = async (documentId, summaryType = 'comprehensive', length = 250) => {
  const apiUrl = await checkServer();
  
  const payload = {
    doc_id: documentId,
    summary_type: summaryType,
    max_length: length
  };
  
  return retryOperation(async () => {
    try {
      debugLog(`Generating summary from ${apiUrl}/api/v1/summarize`, payload);
      
      const response = await fetch(`${apiUrl}/api/v1/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      debugLog('Summary generated successfully', data);
      return data;
    } catch (error) {
      debugLog('Error generating summary', error.message);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out. Summarizing large documents can take time.`);
      }
      
      if (error.message === 'Failed to fetch') {
        throw new Error(`Network error: Unable to connect to the API server at ${apiUrl}. Please ensure the server is running.`);
      }
      
      throw error;
    }
  });
};
