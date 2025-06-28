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
  const handwritingService = HandwritingService.getInstance();

  const processStrokes = useCallback(async (strokes: Stroke[], canvas?: HTMLCanvasElement) => {
    try {
      console.log('🎨 Processing strokes for handwriting recognition:', {
        totalStrokes: strokes.length,
        drawStrokes: strokes.filter(s => s.color !== 'transparent').length,
        hasCanvas: !!canvas
      });

      if (strokes.length === 0) {
        console.log('📝 No strokes found, clearing text');
        return '';
      }

      // Use the actual handwriting service for recognition
      const recognizedText = await handwritingService.recognizeHandwriting(strokes, canvas);
      
      // Log recognition results
      console.log('📝 HANDWRITING RECOGNITION RESULT:', recognizedText);
      console.log('📊 Recognition Stats:', {
        inputStrokes: strokes.filter(s => s.color !== 'transparent').length,
        outputLength: recognizedText.length,
        outputWords: recognizedText.split(' ').filter(w => w.length > 0).length,
        recognitionMethod: 'Real handwriting analysis'
      });
      
      return recognizedText;
    } catch (error) {
      console.error('❌ Error in handwriting recognition:', error);
      return 'Recognition error - please try writing more clearly';
    }
  }, [handwritingService]);

  const startRecognition = useCallback((strokes: Stroke[], canvas?: HTMLCanvasElement) => {
    console.log('🎯 Handwriting recognition triggered:', {
      currentStrokes: strokes.length,
      lastStrokes: lastStrokeCount.current,
      hasCanvas: !!canvas
    });

    // Always update stroke count and process
    lastStrokeCount.current = strokes.length;
    setIsRecognizing(true);

    // Clear previous timeout
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }

    // Process with a short delay to allow for stroke completion
    recognitionTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('⏰ Recognition timeout triggered, starting real handwriting analysis...');
        const newText = await processStrokes(strokes, canvas);
        console.log('✅ Setting recognized text:', newText);
        setRecognizedText(newText);
      } catch (error) {
        console.error('❌ Recognition error:', error);
        setRecognizedText('Recognition failed - please try again');
      } finally {
        setIsRecognizing(false);
      }
    }, 800); // Slightly longer timeout for better recognition accuracy
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