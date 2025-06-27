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
    console.log('AIService: Generating feedback for text:', text.slice(0, 50));
    
    const provider = getPreferredProvider();
    console.log('AIService: Using provider:', provider);
    
    if (!provider) {
      console.log('AIService: No provider available, using mock feedback');
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
      
      console.log('AIService: Generated feedback:', result);
      return result;
    } catch (error) {
      console.error('AI Service error:', error);
      const fallback = this.generateMockFeedback(text, mode);
      console.log('AIService: Using fallback feedback:', fallback);
      return fallback;
    }
  }

  private async generateGeminiFeedback(text: string, mode: LearningModes): Promise<string> {
    const prompt = this.buildPrompt(text, mode);
    console.log('AIService: Sending request to Gemini with prompt:', prompt.slice(0, 100));
    
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
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response:', data);
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error('No content received from Gemini:', data);
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
        return `${basePrompt}\n\nFocus on grammar, spelling, and sentence structure. Be encouraging and constructive. Keep feedback under 25 words and speak as if talking directly to the writer. Be conversational and supportive.`;
      case 'creativity':
        return `${basePrompt}\n\nFocus on creativity, style, and storytelling. Praise creative elements and suggest improvements. Keep feedback under 25 words and be enthusiastic and encouraging.`;
      case 'minimal':
        return `${basePrompt}\n\nProvide very brief, positive encouragement only. Keep feedback under 10 words and be supportive.`;
      default:
        return basePrompt;
    }
  }

  private generateMockFeedback(text: string, mode: LearningModes): string {
    // Enhanced mock feedback that's more realistic and varied
    const mockResponses = {
      grammar: [
        "Your sentence structure is improving nicely! Consider varying your sentence lengths for better flow.",
        "Good use of punctuation. Try reading aloud to catch any remaining grammar issues.",
        "Nice work! Watch for subject-verb agreement in longer sentences.",
        "Great progress with grammar! Your writing is becoming more polished and clear.",
        "Excellent attention to detail! Your grammar skills are really developing well.",
        "Well done! Your punctuation and capitalization are spot on in this piece."
      ],
      creativity: [
        "I love your creative word choice! Try adding more sensory details to enhance the imagery.",
        "Great storytelling! Consider showing rather than telling to make it more engaging.",
        "Your writing voice is developing beautifully. Experiment with different sentence structures.",
        "Wonderful creativity! Your imagination really shines through in this piece.",
        "Fantastic use of descriptive language! Your readers can really picture the scene.",
        "Your narrative flow is excellent! Keep exploring different ways to express your ideas."
      ],
      minimal: [
        "Great progress!",
        "Keep writing!",
        "Nice work!",
        "You're improving!",
        "Excellent effort!",
        "Well done!",
        "Keep going!",
        "Good job!",
        "Nice flow!",
        "Great ideas!"
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