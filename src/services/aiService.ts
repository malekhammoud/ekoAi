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
    const provider = getPreferredProvider();
    
    if (!provider) {
      // Fallback to mock feedback if no API key
      return this.generateMockFeedback(text, mode);
    }

    try {
      switch (provider) {
        case 'google':
          return await this.generateGeminiFeedback(text, mode);
        case 'openai':
          return await this.generateOpenAIFeedback(text, mode);
        case 'anthropic':
          return await this.generateAnthropicFeedback(text, mode);
        default:
          return this.generateMockFeedback(text, mode);
      }
    } catch (error) {
      console.error('AI Service error:', error);
      return this.generateMockFeedback(text, mode);
    }
  }

  private async generateGeminiFeedback(text: string, mode: LearningModes): Promise<string> {
    const prompt = this.buildPrompt(text, mode);
    
    const response = await fetch(
      `${AI_CONFIG.google.baseURL}/models/${AI_CONFIG.google.model}:generateContent?key=${AI_CONFIG.google.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from Gemini');
    }

    return content.trim();
  }

  private async generateOpenAIFeedback(text: string, mode: LearningModes): Promise<string> {
    const prompt = this.buildPrompt(text, mode);
    
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
        max_tokens: 150,
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
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_CONFIG.anthropic.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: AI_CONFIG.anthropic.model,
        max_tokens: 150,
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

  async recognizeHandwriting(strokes: any[]): Promise<string> {
    if (!AI_CONFIG.handwriting.apiKey) {
      // Fallback to mock recognition
      return this.generateMockText(strokes.length);
    }

    try {
      // Implement actual handwriting recognition API call
      // This would depend on your chosen provider (MyScript, Google, etc.)
      const response = await fetch(AI_CONFIG.handwriting.apiUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.handwriting.apiKey}`
        },
        body: JSON.stringify({
          strokes: strokes,
          configuration: {
            lang: 'en_US',
            export: {
              'text/plain': {}
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Handwriting API error: ${response.status}`);
      }

      const data = await response.json();
      return data.exports?.['text/plain']?.value || '';
      
    } catch (error) {
      console.error('Handwriting recognition error:', error);
      return this.generateMockText(strokes.length);
    }
  }

  private buildPrompt(text: string, mode: LearningModes): string {
    const basePrompt = `You are an encouraging AI writing tutor. Analyze this text and provide brief, helpful feedback: "${text}"`;
    
    switch (mode) {
      case 'grammar':
        return `${basePrompt}\n\nFocus on grammar, spelling, and sentence structure. Be encouraging and constructive. Keep feedback under 30 words and speak as if talking directly to the writer.`;
      case 'creativity':
        return `${basePrompt}\n\nFocus on creativity, style, and storytelling. Praise creative elements and suggest improvements. Keep feedback under 30 words and be enthusiastic.`;
      case 'minimal':
        return `${basePrompt}\n\nProvide very brief, positive encouragement only. Keep feedback under 15 words and be supportive.`;
      default:
        return basePrompt;
    }
  }

  private generateMockFeedback(text: string, mode: LearningModes): string {
    // Fallback mock feedback when AI service is unavailable
    const mockResponses = {
      grammar: [
        "Your sentence structure is improving! Consider varying your sentence lengths for better flow.",
        "Good use of punctuation. Try reading aloud to catch any remaining grammar issues.",
        "Nice work! Watch for subject-verb agreement in longer sentences.",
        "Great progress with grammar! Your writing is becoming more polished."
      ],
      creativity: [
        "I love your creative word choice! Try adding more sensory details to enhance the imagery.",
        "Great storytelling! Consider showing rather than telling to make it more engaging.",
        "Your writing voice is developing well. Experiment with different sentence structures.",
        "Wonderful creativity! Your imagination really shines through in this piece."
      ],
      minimal: [
        "Great progress!",
        "Keep writing!",
        "Nice work!",
        "You're improving!",
        "Excellent effort!",
        "Well done!"
      ]
    };

    const responses = mockResponses[mode];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateMockText(strokeCount: number): string {
    const mockPhrases = [
      "The quick brown fox",
      "jumps over the lazy dog",
      "Writing is thinking on paper",
      "Creativity flows like water",
      "Every story has a beginning",
      "and an end worth discovering"
    ];
    
    const phraseIndex = Math.min(Math.floor(strokeCount / 5), mockPhrases.length - 1);
    return mockPhrases[phraseIndex] || "";
  }
}