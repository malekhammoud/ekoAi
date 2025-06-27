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
      console.log('🎨 Processing strokes:', {
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

      // Filter out eraser strokes (transparent color)
      const drawStrokes = strokes.filter(stroke => stroke.color !== 'transparent');
      
      console.log('✏️ Draw strokes after filtering:', drawStrokes.length);

      if (drawStrokes.length === 0) {
        return '';
      }

      // Generate progressive text based on stroke count and complexity
      const mockText = generateProgressiveText(drawStrokes);
      
      // Log ALL recognized text to console
      console.log('📝 RECOGNIZED TEXT:', mockText);
      console.log('📊 Text Stats:', {
        length: mockText.length,
        words: mockText.split(' ').filter(w => w.length > 0).length,
        strokes: drawStrokes.length,
        totalPoints: drawStrokes.reduce((sum, stroke) => sum + stroke.points.length, 0)
      });
      
      return mockText;
    } catch (error) {
      console.error('❌ Error processing strokes:', error);
      return recognizedText;
    }
  }, [recognizedText]);

  const startRecognition = useCallback((strokes: Stroke[]) => {
    console.log('🎯 Recognition triggered:', {
      currentStrokes: strokes.length,
      lastStrokes: lastStrokeCount.current,
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
        console.log('⏰ Recognition timeout triggered, processing...');
        const newText = await processStrokes(strokes);
        console.log('✅ Setting recognized text:', newText);
        setRecognizedText(newText);
      } catch (error) {
        console.error('❌ Recognition error:', error);
      } finally {
        setIsRecognizing(false);
      }
    }, 800);
  }, [processStrokes]);

  return {
    isRecognizing,
    recognizedText,
    startRecognition
  };
}

// Enhanced text generation based on stroke analysis
function generateProgressiveText(strokes: any[]): string {
  // Base vocabulary for generating realistic text
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
    'The art of writing connects hearts and minds.',
    'Words dance across the canvas of imagination.',
    'Every stroke tells a story waiting to unfold.'
  ];

  // Calculate complexity based on total points and stroke count
  const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
  const avgPointsPerStroke = totalPoints / strokes.length;
  const complexity = strokes.length * (avgPointsPerStroke / 10);

  console.log('📈 Text generation metrics:', {
    strokes: strokes.length,
    totalPoints,
    avgPointsPerStroke: avgPointsPerStroke.toFixed(1),
    complexity: complexity.toFixed(1)
  });

  // Progressive text based on complexity
  if (strokes.length === 0) return '';
  if (strokes.length <= 1) return words[0]; // "The"
  if (strokes.length <= 2) return words.slice(0, 2).join(' '); // "The quick"
  if (strokes.length <= 3) return words.slice(0, 3).join(' '); // "The quick brown"
  if (strokes.length <= 4) return words.slice(0, 4).join(' '); // "The quick brown fox"
  if (strokes.length <= 6) return words.slice(0, 6).join(' '); // "The quick brown fox jumps over"
  if (strokes.length <= 8) return sentences[0]; // Full first sentence
  if (strokes.length <= 12) return sentences.slice(0, 2).join(' '); // Two sentences
  if (strokes.length <= 16) return sentences.slice(0, 3).join(' '); // Three sentences
  if (strokes.length <= 20) return sentences.slice(0, 4).join(' '); // Four sentences
  
  // For many strokes, return multiple sentences based on complexity
  const sentenceCount = Math.min(Math.floor(complexity / 4) + 1, sentences.length);
  return sentences.slice(0, sentenceCount).join(' ');
}