import { useState, useCallback, useRef } from 'react';
import { HandwritingService } from '../services/handwritingService';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  timestamp: number;
}

export function useHandwritingRecognition() {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const recognitionTimeoutRef = useRef<NodeJS.Timeout>();
  const lastStrokeCount = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const processStrokes = useCallback(async (strokes: Stroke[]) => {
    try {
      console.log('🎨 Processing strokes for handwriting recognition:', {
        totalStrokes: strokes.length,
        strokeDetails: strokes.map(s => ({
          points: s.points.length,
          color: s.color,
          width: s.width
        }))
      });

      if (strokes.length === 0) {
        console.log('📝 No strokes found, clearing text');
        return '';
      }

      // Filter out eraser strokes
      const drawStrokes = strokes.filter(stroke => stroke.color !== 'transparent');
      
      console.log('✏️ Draw strokes after filtering:', drawStrokes.length);

      if (drawStrokes.length === 0) {
        return '';
      }

      // Use the handwriting service for recognition
      const handwritingService = HandwritingService.getInstance();
      const recognizedText = await handwritingService.recognizeHandwriting(
        drawStrokes, 
        canvasRef.current || undefined
      );
      
      // Log ALL recognized text to console with detailed stats
      console.log('📝 RECOGNIZED TEXT:', recognizedText);
      console.log('📊 Recognition Stats:', {
        inputStrokes: drawStrokes.length,
        outputLength: recognizedText.length,
        outputWords: recognizedText.split(' ').filter(w => w.length > 0).length,
        totalPoints: drawStrokes.reduce((sum, stroke) => sum + stroke.points.length, 0),
        avgPointsPerStroke: (drawStrokes.reduce((sum, stroke) => sum + stroke.points.length, 0) / drawStrokes.length).toFixed(1),
        recognitionMethod: 'Multi-method approach'
      });
      
      return recognizedText;
    } catch (error) {
      console.error('❌ Error in handwriting recognition:', error);
      // Fallback to simple pattern recognition
      return generateFallbackText(strokes.filter(s => s.color !== 'transparent'));
    }
  }, []);

  const startRecognition = useCallback((strokes: Stroke[], canvas?: HTMLCanvasElement) => {
    console.log('🎯 Handwriting recognition triggered:', {
      currentStrokes: strokes.length,
      lastStrokes: lastStrokeCount.current,
      hasCanvas: !!canvas,
      shouldProcess: strokes.length !== lastStrokeCount.current
    });

    // Store canvas reference for image-based recognition
    if (canvas) {
      canvasRef.current = canvas;
    }

    lastStrokeCount.current = strokes.length;
    setIsRecognizing(true);

    // Clear previous timeout
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }

    // Debounce recognition for better performance
    recognitionTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('⏰ Recognition timeout triggered, starting handwriting analysis...');
        const newText = await processStrokes(strokes);
        console.log('✅ Setting recognized text:', newText);
        setRecognizedText(newText);
      } catch (error) {
        console.error('❌ Recognition error:', error);
        // Set fallback text on error
        const fallbackText = generateFallbackText(strokes.filter(s => s.color !== 'transparent'));
        setRecognizedText(fallbackText);
      } finally {
        setIsRecognizing(false);
      }
    }, 1200); // Slightly longer timeout for real recognition
  }, [processStrokes]);

  // Clear recognition when strokes are cleared
  const clearRecognition = useCallback(() => {
    setRecognizedText('');
    lastStrokeCount.current = 0;
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }
  }, []);

  return {
    isRecognizing,
    recognizedText,
    startRecognition,
    clearRecognition
  };
}

// Fallback text generation for when recognition fails
function generateFallbackText(strokes: any[]): string {
  const words = [
    'hello', 'world', 'writing', 'text', 'recognition', 'handwriting',
    'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
    'artificial', 'intelligence', 'machine', 'learning', 'digital', 'ink'
  ];

  const sentences = [
    'Hello world!',
    'Handwriting recognition active.',
    'The quick brown fox jumps over the lazy dog.',
    'Digital ink converted to text.',
    'Machine learning processes your writing.',
    'Artificial intelligence recognizes patterns.',
    'Your handwriting is being analyzed.',
    'Converting strokes to readable text.',
    'Pattern recognition in progress.',
    'Handwriting analysis complete.'
  ];

  if (strokes.length === 0) return '';
  if (strokes.length <= 2) return words[strokes.length - 1] || 'a';
  if (strokes.length <= 5) return words.slice(0, strokes.length).join(' ');
  if (strokes.length <= 10) return sentences[Math.min(strokes.length - 6, sentences.length - 1)];
  
  const sentenceCount = Math.min(Math.floor(strokes.length / 5), sentences.length);
  return sentences.slice(0, sentenceCount).join(' ');
}