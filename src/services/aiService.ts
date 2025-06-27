import { AI_CONFIG } from '../config/ai';
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
    if (!AI_CONFIG.openai.apiKey) {
      // Fallback to mock feedback if no API key
      return this.generateMockFeedback(text, mode);
    }

    try {
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
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Great work on your writing!';
      
    } catch (error) {
      console.error('AI Service error:', error);
      return this.generateMockFeedback(text, mode);
    }
  }

  async recognizeHandwriting(strokes: any[]): Promise<string> {
    if (!AI_CONFIG.handwriting.apiKey) {
      // Fallback to mock recognition
      return this.generateMockText(strokes.length);
    }

    try {
      // Implement actual handwriting recognition API call
      // This would depend on your chosen provider (MyScript, Google, etc.)
      const response = await fetch(AI_CONFIG.handwriting.apiUrl, {
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
    const basePrompt = `Please analyze this text and provide brief, encouraging feedback: "${text}"`;
    
    switch (mode) {
      case 'grammar':
        return `${basePrompt}\n\nFocus on grammar, spelling, and sentence structure. Keep feedback under 30 words.`;
      case 'creativity':
        return `${basePrompt}\n\nFocus on creativity, style, and storytelling. Suggest improvements or praise creative elements. Keep feedback under 30 words.`;
      case 'minimal':
        return `${basePrompt}\n\nProvide very brief, positive encouragement only. Keep feedback under 15 words.`;
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
        "Nice work! Watch for subject-verb agreement in longer sentences."
      ],
      creativity: [
        "I love your creative word choice! Try adding more sensory details to enhance the imagery.",
        "Great storytelling! Consider showing rather than telling to make it more engaging.",
        "Your writing voice is developing well. Experiment with different sentence structures."
      ],
      minimal: [
        "Great progress!",
        "Keep writing!",
        "Nice work!",
        "You're improving!"
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
      "Creativity flows like water"
    ];
    
    const phraseIndex = Math.min(Math.floor(strokeCount / 5), mockPhrases.length - 1);
    return mockPhrases[phraseIndex] || "";
  }
}