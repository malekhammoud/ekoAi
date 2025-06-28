// AI Configuration and API clients
export const AI_CONFIG = {
  google: {
    apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY,
    model: import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-pro',
    visionModel: import.meta.env.VITE_GOOGLE_AI_VISION_MODEL || 'gemini-pro-vision',
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    visionBaseURL: 'https://generativelanguage.googleapis.com/v1'
  },
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview',
    baseURL: 'https://api.openai.com/v1'
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
  },
  handwriting: {
    apiUrl: import.meta.env.VITE_HANDWRITING_API_URL,
    apiKey: import.meta.env.VITE_MYSCRIPT_API_KEY
  },
  textToSpeech: {
    elevenlabs: {
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY
    }
  },
  grammar: {
    grammarly: import.meta.env.VITE_GRAMMARLY_API_KEY,
    languageTool: import.meta.env.VITE_LANGUAGETOOL_API_URL || 'https://api.languagetool.org/v2/check'
  }
};

// Helper function to validate if an API key is properly formatted and not empty
const isValidApiKey = (apiKey: string | undefined): boolean => {
  return !!(apiKey && apiKey.trim() && apiKey !== 'undefined' && apiKey !== 'null');
};

// Validate required environment variables
export const validateAIConfig = () => {
  const errors: string[] = [];
  
  if (!isValidApiKey(AI_CONFIG.google.apiKey) && 
      !isValidApiKey(AI_CONFIG.openai.apiKey) && 
      !isValidApiKey(AI_CONFIG.anthropic.apiKey)) {
    errors.push('No valid AI API keys found. The app will use mock responses.');
  }
  
  if (errors.length > 0) {
    console.warn('AI Configuration warnings:', errors);
  }
  
  return errors.length === 0;
};

// Check if AI services are available
export const isAIAvailable = () => {
  return !!(isValidApiKey(AI_CONFIG.google.apiKey) || 
           isValidApiKey(AI_CONFIG.openai.apiKey) || 
           isValidApiKey(AI_CONFIG.anthropic.apiKey));
};

// Get preferred AI provider - only return if API key is valid
export const getPreferredProvider = (): 'google' | 'openai' | 'anthropic' | null => {
  if (isValidApiKey(AI_CONFIG.google.apiKey)) return 'google';
  if (isValidApiKey(AI_CONFIG.openai.apiKey)) return 'openai';
  if (isValidApiKey(AI_CONFIG.anthropic.apiKey)) return 'anthropic';
  return null;
};