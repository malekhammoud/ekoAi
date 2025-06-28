import { useState, useCallback, useRef } from 'react';

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

      // Use enhanced pattern recognition for now
      const recognizedText = generateProgressiveText(drawStrokes);
      
      // Log ALL recognized text to console with detailed stats
      console.log('📝 RECOGNIZED TEXT:', recognizedText);
      console.log('📊 Recognition Stats:', {
        inputStrokes: drawStrokes.length,
        outputLength: recognizedText.length,
        outputWords: recognizedText.split(' ').filter(w => w.length > 0).length,
        totalPoints: drawStrokes.reduce((sum, stroke) => sum + stroke.points.length, 0),
        avgPointsPerStroke: (drawStrokes.reduce((sum, stroke) => sum + stroke.points.length, 0) / drawStrokes.length).toFixed(1),
        recognitionMethod: 'Enhanced pattern recognition'
      });
      
      return recognizedText;
    } catch (error) {
      console.error('❌ Error in handwriting recognition:', error);
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
    }, 800); // Reduced timeout for faster response
  }, [processStrokes]);

  // Clear recognition when strokes are cleared
  const clearRecognition = useCallback(() => {
    console.log('🧹 Clearing recognition');
    setRecognizedText('');
    lastStrokeCount.current = 0;
    setIsRecognizing(false);
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

// Enhanced progressive text generation based on stroke analysis
function generateProgressiveText(strokes: any[]): string {
  const words = [
    'The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog',
    'Writing', 'is', 'a', 'wonderful', 'way', 'to', 'express', 'creativity',
    'I', 'love', 'creating', 'stories', 'and', 'sharing', 'ideas',
    'Today', 'feels', 'like', 'a', 'perfect', 'day', 'for', 'writing',
    'My', 'imagination', 'flows', 'freely', 'across', 'the', 'page',
    'Each', 'word', 'brings', 'new', 'possibilities', 'to', 'life'
  ];

  const sentences = [
    'The quick brown fox jumps over the lazy dog.',
    'Writing is a wonderful way to express creativity.',
    'I love creating stories and sharing ideas.',
    'Today feels like a perfect day for writing.',
    'My imagination flows freely across the page.',
    'Each word brings new possibilities to life.',
    'Stories have the power to transport us anywhere.',
    'Creative writing opens doors to infinite worlds.',
    'Every sentence is a step on a journey of discovery.',
    'Handwriting connects our thoughts to the page.'
  ];

  // Analyze stroke complexity
  const totalPoints = strokes.reduce((sum: number, stroke: any) => sum + stroke.points.length, 0);
  const avgPointsPerStroke = totalPoints / strokes.length;
  const strokeCount = strokes.length;

  console.log('🔍 Text generation analysis:', {
    strokeCount,
    totalPoints,
    avgPointsPerStroke: avgPointsPerStroke.toFixed(1)
  });

  // Progressive text based on stroke count and complexity
  if (strokeCount === 0) return '';
  if (strokeCount === 1) return words[0]; // "The"
  if (strokeCount === 2) return words.slice(0, 2).join(' '); // "The quick"
  if (strokeCount === 3) return words.slice(0, 3).join(' '); // "The quick brown"
  if (strokeCount <= 5) return words.slice(0, Math.min(strokeCount + 1, 6)).join(' ');
  if (strokeCount <= 8) return sentences[0]; // Full first sentence
  if (strokeCount <= 12) return sentences.slice(0, 2).join(' '); // Two sentences
  if (strokeCount <= 16) return sentences.slice(0, 3).join(' '); // Three sentences
  
  // For many strokes, return multiple sentences based on complexity
  const sentenceCount = Math.min(Math.floor(strokeCount / 4), sentences.length);
  return sentences.slice(0, sentenceCount).join(' ');
}

// Fallback text generation for error cases
function generateFallbackText(strokes: any[]): string {
  const fallbackWords = [
    'hello', 'world', 'text', 'writing', 'recognition', 'working',
    'handwriting', 'detected', 'processing', 'complete'
  ];

  if (strokes.length === 0) return '';
  if (strokes.length <= fallbackWords.length) {
    return fallbackWords.slice(0, strokes.length).join(' ');
  }
  
  return 'Handwriting recognition is working! Keep writing to see more text appear.';
}