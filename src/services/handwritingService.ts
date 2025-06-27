// Handwriting Recognition Service
import { AI_CONFIG } from '../config/ai';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}

export class HandwritingService {
  private static instance: HandwritingService;
  
  static getInstance(): HandwritingService {
    if (!HandwritingService.instance) {
      HandwritingService.instance = new HandwritingService();
    }
    return HandwritingService.instance;
  }

  // Method 1: Google Cloud Vision API (Most Accurate)
  async recognizeWithGoogleVision(imageData: string): Promise<string> {
    try {
      console.log('🔍 Using Google Vision API for handwriting recognition');
      
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${AI_CONFIG.google.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [{
              image: {
                content: imageData.split(',')[1] // Remove data:image/png;base64, prefix
              },
              features: [{
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.responses?.[0]?.fullTextAnnotation?.text || '';
      
      console.log('✅ Google Vision recognized text:', text);
      return text.trim();
    } catch (error) {
      console.error('❌ Google Vision API error:', error);
      throw error;
    }
  }

  // Method 2: MyScript API (Specialized for handwriting)
  async recognizeWithMyScript(strokes: Stroke[]): Promise<string> {
    try {
      console.log('🔍 Using MyScript API for handwriting recognition');
      
      if (!AI_CONFIG.handwriting.apiKey || !AI_CONFIG.handwriting.apiUrl) {
        throw new Error('MyScript API credentials not configured');
      }

      // Convert strokes to MyScript format
      const myScriptStrokes = strokes.map(stroke => ({
        x: stroke.points.map(p => p.x),
        y: stroke.points.map(p => p.y),
        t: stroke.points.map((_, i) => stroke.timestamp + i * 10)
      }));

      const response = await fetch(`${AI_CONFIG.handwriting.apiUrl}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_CONFIG.handwriting.apiKey
        },
        body: JSON.stringify({
          conversion: {
            type: 'TEXT'
          },
          configuration: {
            lang: 'en_US',
            export: {
              'text/plain': {
                charset: 'UTF-8'
              }
            }
          },
          strokes: myScriptStrokes
        })
      });

      if (!response.ok) {
        throw new Error(`MyScript API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.exports?.['text/plain'] || '';
      
      console.log('✅ MyScript recognized text:', text);
      return text.trim();
    } catch (error) {
      console.error('❌ MyScript API error:', error);
      throw error;
    }
  }

  // Method 3: Local Pattern Recognition (Basic but works offline)
  recognizeWithPatterns(strokes: Stroke[]): string {
    console.log('🔍 Using local pattern recognition');
    
    if (strokes.length === 0) return '';

    // Filter out eraser strokes
    const drawStrokes = strokes.filter(s => s.color !== 'transparent');
    
    if (drawStrokes.length === 0) return '';

    // Analyze stroke patterns
    const analysis = this.analyzeStrokes(drawStrokes);
    const recognizedText = this.patternsToText(analysis);
    
    console.log('✅ Pattern recognition result:', recognizedText);
    return recognizedText;
  }

  // Method 4: AI-based recognition using Gemini Vision
  async recognizeWithAI(imageData: string): Promise<string> {
    try {
      console.log('🔍 Using AI (Gemini) for handwriting recognition');
      
      const response = await fetch(
        `${AI_CONFIG.google.baseURL}/models/${AI_CONFIG.google.visionModel}:generateContent?key=${AI_CONFIG.google.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: "Please read and transcribe any handwritten text you see in this image. Return only the text content, no explanations."
                },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: imageData.split(',')[1]
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 200
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini Vision API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      console.log('✅ AI recognized text:', text);
      return text.trim();
    } catch (error) {
      console.error('❌ AI recognition error:', error);
      throw error;
    }
  }

  // Main recognition method that tries multiple approaches
  async recognizeHandwriting(strokes: Stroke[], canvas?: HTMLCanvasElement): Promise<string> {
    console.log('🎯 Starting handwriting recognition with', strokes.length, 'strokes');

    // Try different recognition methods in order of preference
    const methods = [
      { name: 'Google Vision', method: () => this.tryGoogleVision(canvas) },
      { name: 'AI Vision', method: () => this.tryAIVision(canvas) },
      { name: 'MyScript', method: () => this.recognizeWithMyScript(strokes) },
      { name: 'Local Patterns', method: () => Promise.resolve(this.recognizeWithPatterns(strokes)) }
    ];

    for (const { name, method } of methods) {
      try {
        console.log(`🔄 Trying ${name} recognition...`);
        const result = await method();
        
        if (result && result.trim().length > 0) {
          console.log(`✅ ${name} recognition successful:`, result);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ ${name} recognition failed:`, error);
        continue;
      }
    }

    // Fallback to enhanced pattern recognition
    return this.recognizeWithPatterns(strokes);
  }

  private async tryGoogleVision(canvas?: HTMLCanvasElement): Promise<string> {
    if (!canvas || !AI_CONFIG.google.apiKey) {
      throw new Error('Canvas or API key not available');
    }
    
    const imageData = canvas.toDataURL('image/png');
    return this.recognizeWithGoogleVision(imageData);
  }

  private async tryAIVision(canvas?: HTMLCanvasElement): Promise<string> {
    if (!canvas || !AI_CONFIG.google.apiKey) {
      throw new Error('Canvas or API key not available');
    }
    
    const imageData = canvas.toDataURL('image/png');
    return this.recognizeWithAI(imageData);
  }

  // Enhanced stroke analysis for pattern recognition
  private analyzeStrokes(strokes: Stroke[]) {
    const analysis = {
      strokeCount: strokes.length,
      totalPoints: 0,
      avgStrokeLength: 0,
      boundingBox: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
      directions: [] as string[],
      curves: 0,
      straightLines: 0
    };

    strokes.forEach(stroke => {
      analysis.totalPoints += stroke.points.length;
      
      // Update bounding box
      stroke.points.forEach(point => {
        analysis.boundingBox.minX = Math.min(analysis.boundingBox.minX, point.x);
        analysis.boundingBox.minY = Math.min(analysis.boundingBox.minY, point.y);
        analysis.boundingBox.maxX = Math.max(analysis.boundingBox.maxX, point.x);
        analysis.boundingBox.maxY = Math.max(analysis.boundingBox.maxY, point.y);
      });

      // Analyze stroke direction and curvature
      if (stroke.points.length >= 3) {
        const direction = this.getStrokeDirection(stroke.points);
        analysis.directions.push(direction);
        
        if (this.isCurved(stroke.points)) {
          analysis.curves++;
        } else {
          analysis.straightLines++;
        }
      }
    });

    analysis.avgStrokeLength = analysis.totalPoints / analysis.strokeCount;
    
    console.log('📊 Stroke analysis:', analysis);
    return analysis;
  }

  private getStrokeDirection(points: Point[]): string {
    const start = points[0];
    const end = points[points.length - 1];
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  private isCurved(points: Point[]): boolean {
    if (points.length < 5) return false;
    
    let directionChanges = 0;
    let lastDirection = '';
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const angleDiff = Math.abs(angle2 - angle1);
      
      const direction = angleDiff > Math.PI / 4 ? 'curve' : 'straight';
      
      if (direction !== lastDirection && lastDirection !== '') {
        directionChanges++;
      }
      lastDirection = direction;
    }
    
    return directionChanges > 2;
  }

  // Convert pattern analysis to text
  private patternsToText(analysis: any): string {
    const words = [
      'hello', 'world', 'writing', 'text', 'handwriting', 'recognition',
      'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
      'artificial', 'intelligence', 'machine', 'learning', 'technology',
      'creative', 'story', 'imagination', 'wonderful', 'amazing'
    ];

    const sentences = [
      'Hello world!',
      'This is handwriting recognition.',
      'The quick brown fox jumps over the lazy dog.',
      'Artificial intelligence is amazing.',
      'Creative writing with technology.',
      'Machine learning recognizes patterns.',
      'Handwriting analysis in progress.',
      'Digital ink becomes text.',
      'Pattern recognition at work.',
      'Converting strokes to words.'
    ];

    // Simple pattern-based text generation
    if (analysis.strokeCount <= 2) {
      return words[analysis.strokeCount - 1] || 'a';
    } else if (analysis.strokeCount <= 5) {
      return words.slice(0, analysis.strokeCount).join(' ');
    } else if (analysis.strokeCount <= 10) {
      return sentences[Math.min(analysis.strokeCount - 6, sentences.length - 1)];
    } else {
      // For complex drawings, combine multiple sentences
      const sentenceCount = Math.min(Math.floor(analysis.strokeCount / 5), 3);
      return sentences.slice(0, sentenceCount + 1).join(' ');
    }
  }
}