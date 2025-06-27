import { AI_CONFIG, getPreferredProvider } from '../config/ai';
import { LearningModes } from '../types';

export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateFeedback(text: string, mode: LearningModes): Promise<string> {
    console.log('🤖 AIService: Generating feedback for text:', text.slice(0, 50));
    console.log('🤖 AIService: Full text length:', text.length);
    console.log('🤖 AIService: Mode:', mode);
    
    const provider = getPreferredProvider();
    console.log('🤖 AIService: Using provider:', provider);
    
    if (!provider) {
      console.log('🤖 AIService: No provider available, using mock feedback');
      return this.generateMockFeedback(text, mode);
    }

    try {
      let result: string;
      switch (provider) {
        case 'google':
          result = await this.generateGeminiFeedback(text, mode);
          break;
        case 'openai':
          result = await this.generateOpenAIFeedback(text, mode);
          break;
        case 'anthropic':
          result = await this.generateAnthropicFeedback(text, mode);
          break;
        default:
          result = this.generateMockFeedback(text, mode);
      }
      
      console.log('🤖 AIService: Generated feedback:', result);
      return result;
    } catch (error) {
      console.error('🤖 AI Service error:', error);
      const fallback = this.generateMockFeedback(text, mode);
      console.log('🤖 AIService: Using fallback feedback:', fallback);
      return fallback;
    }
  }

  private async generateGeminiFeedback(text: string, mode: LearningModes): Promise<string> {
    const prompt = this.buildPrompt(text, mode);
    console.log('🤖 AIService: Sending request to Gemini with prompt:', prompt);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 100,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('🤖 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(
      `${AI_CONFIG.google.baseURL}/models/${AI_CONFIG.google.model}:generateContent?key=${AI_CONFIG.google.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    console.log('🤖 Gemini response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🤖 Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🤖 Gemini response data:', JSON.stringify(data, null, 2));
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error('🤖 No content received from Gemini:', data);
      throw new Error('No content received from Gemini');
    }

    console.log('🤖 Extracted content from Gemini:', content);
    return content.trim();
  }

  private async generateOpenAIFeedback(text: string, mode: LearningModes): Promise<string> {
    const prompt = this.buildPrompt(text, mode);
    console.log('🤖 AIService: Sending request to OpenAI');
    
    const response = await fetch(`${AI_CONFIG.openai.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI writing assistant that provides helpful, encouraging feedback to improve writing skills.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Great work on your writing!';
  }

  private async generateAnthropicFeedback(text: string, mode: LearningModes): Promise<string> {
    const prompt = this.buildPrompt(text, mode);
    console.log('🤖 AIService: Sending request to Anthropic');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_CONFIG.anthropic.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: AI_CONFIG.anthropic.model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'Great work on your writing!';
  }

  private buildPrompt(text: string, mode: LearningModes): string {
    // Special handling for startup message
    if (text.includes("I'm starting a new writing session")) {
      return "Respond with a brief, encouraging welcome message for a new writing session. Keep it under 15 words and be enthusiastic.";
    }

    const basePrompt = `You are an encouraging AI writing tutor. Analyze this text and provide brief, helpful feedback: "${text}"`;
    
    switch (mode) {
      case 'grammar':
        return `${basePrompt}\n\nFocus on grammar, spelling, and sentence structure. Be encouraging and constructive. Keep feedback under 20 words and speak as if talking directly to the writer. Be conversational and supportive.`;
      case 'creativity':
        return `${basePrompt}\n\nFocus on creativity, style, and storytelling. Praise creative elements and suggest improvements. Keep feedback under 20 words and be enthusiastic and encouraging.`;
      case 'minimal':
        return `${basePrompt}\n\nProvide very brief, positive encouragement only. Keep feedback under 8 words and be supportive.`;
      default:
        return basePrompt;
    }
  }

  private generateMockFeedback(text: string, mode: LearningModes): string {
    console.log('🤖 Generating mock feedback for mode:', mode);
    
    // Special handling for startup message
    if (text.includes("I'm starting a new writing session")) {
      const welcomeMessages = [
        "Welcome! I'm excited to help you write amazing stories today!",
        "Hello! Ready to create something wonderful together? Let's begin!",
        "Great to see you! I'm here to support your creative journey.",
        "Welcome back! Let's make today's writing session fantastic!",
        "Hi there! I'm ready to help you express your amazing ideas!"
      ];
      const welcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      console.log('🤖 Generated welcome message:', welcome);
      return welcome;
    }
    
    // Enhanced mock feedback that's more realistic and varied
    const mockResponses = {
      grammar: [
        "Your sentence structure is improving nicely! Keep up the great work.",
        "Good use of punctuation. Try reading aloud to catch any remaining issues.",
        "Nice work! Watch for subject-verb agreement in longer sentences.",
        "Great progress with grammar! Your writing is becoming more polished.",
        "Excellent attention to detail! Your grammar skills are developing well.",
        "Well done! Your punctuation and capitalization are spot on."
      ],
      creativity: [
        "I love your creative word choice! Try adding more sensory details.",
        "Great storytelling! Consider showing rather than telling for more impact.",
        "Your writing voice is developing beautifully. Keep experimenting!",
        "Wonderful creativity! Your imagination really shines through here.",
        "Fantastic use of descriptive language! Readers can picture the scene.",
        "Your narrative flow is excellent! Keep exploring different expressions."
      ],
      minimal: [
        "Great progress!",
        "Keep writing!",
        "Nice work!",
        "You're improving!",
        "Excellent effort!",
        "Well done!",
        "Keep going!",
        "Good job!"
      ]
    };

    const responses = mockResponses[mode];
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    console.log('🤖 Selected mock response:', selectedResponse);
    return selectedResponse;
  }
}