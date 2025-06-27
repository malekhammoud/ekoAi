// AI Configuration and API clients
export const AI_CONFIG = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview',
    baseURL: 'https://api.openai.com/v1'
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
  },
  google: {
    apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY,
    model: import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-pro'
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

// Validate required environment variables
export const validateAIConfig = () => {
  const errors: string[] = [];
  
  if (!AI_CONFIG.openai.apiKey) {
    errors.push('VITE_OPENAI_API_KEY is required for AI feedback');
  }
  
  if (errors.length > 0) {
    console.warn('AI Configuration warnings:', errors);
  }
  
  return errors.length === 0;
};

// Check if AI services are available
export const isAIAvailable = () => {
  return !!(AI_CONFIG.openai.apiKey || AI_CONFIG.anthropic.apiKey || AI_CONFIG.google.apiKey);
};