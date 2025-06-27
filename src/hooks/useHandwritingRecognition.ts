import { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from 'tldraw';

export function useHandwritingRecognition(editor: Editor | null) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const recognitionTimeoutRef = useRef<NodeJS.Timeout>();
  const lastShapeCountRef = useRef(0);

  const processStrokes = useCallback(async () => {
    if (!editor) return '';

    try {
      const shapes = editor.getCurrentPageShapes();
      const drawShapes = shapes.filter(shape => shape.type === 'draw');
      
      if (drawShapes.length === 0) {
        return '';
      }

      // Generate more realistic text progression
      const mockText = generateMockRecognizedText(drawShapes.length);
      console.log('Generated text:', mockText);
      
      return mockText;
    } catch (error) {
      console.error('Error processing strokes:', error);
      return recognizedText;
    }
  }, [editor, recognizedText]);

  const startRecognition = useCallback(() => {
    if (!editor) return;

    const shapes = editor.getCurrentPageShapes();
    const currentShapeCount = shapes.filter(shape => shape.type === 'draw').length;
    
    // Only process if there are new shapes
    if (currentShapeCount <= lastShapeCountRef.current) {
      return;
    }

    console.log('Starting recognition for', currentShapeCount, 'shapes');
    lastShapeCountRef.current = currentShapeCount;
    setIsRecognizing(true);

    // Clear previous timeout
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }

    // Debounce recognition to avoid too frequent processing
    recognitionTimeoutRef.current = setTimeout(async () => {
      try {
        const newText = await processStrokes();
        console.log('Setting recognized text:', newText);
        setRecognizedText(newText);
      } catch (error) {
        console.error('Recognition error:', error);
      } finally {
        setIsRecognizing(false);
      }
    }, 800); // Even faster feedback
  }, [editor, processStrokes]);

  useEffect(() => {
    return () => {
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
    };
  }, []);

  return {
    isRecognizing,
    recognizedText,
    startRecognition
  };
}

// Improved mock function to simulate handwriting recognition
function generateMockRecognizedText(shapeCount: number): string {
  // Progressive text generation based on stroke count
  const textProgression = [
    "", // 0 shapes
    "The", // 1-2 shapes
    "The quick", // 3-4 shapes
    "The quick brown", // 5-6 shapes
    "The quick brown fox", // 7-8 shapes
    "The quick brown fox jumps", // 9-10 shapes
    "The quick brown fox jumps over", // 11-12 shapes
    "The quick brown fox jumps over the", // 13-14 shapes
    "The quick brown fox jumps over the lazy", // 15-16 shapes
    "The quick brown fox jumps over the lazy dog.", // 17-18 shapes
    "The quick brown fox jumps over the lazy dog. Writing is fun!", // 19-20 shapes
    "The quick brown fox jumps over the lazy dog. Writing is fun! I love creating stories.", // 21+ shapes
  ];

  const index = Math.min(Math.floor(shapeCount / 2), textProgression.length - 1);
  return textProgression[index];
}