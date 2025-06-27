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

      // Simulate handwriting recognition processing
      // In a real app, you'd send the stroke data to an ML service
      const mockText = generateMockRecognizedText(drawShapes.length, recognizedText);
      
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
        setRecognizedText(newText);
      } catch (error) {
        console.error('Recognition error:', error);
      } finally {
        setIsRecognizing(false);
      }
    }, 1000); // Reduced to 1 second for faster feedback
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

// Mock function to simulate handwriting recognition
function generateMockRecognizedText(shapeCount: number, currentText: string): string {
  const mockPhrases = [
    "The quick brown fox jumps over the lazy dog.",
    "Writing is a journey of discovery and creativity.",
    "Every word we write shapes our thoughts and dreams.",
    "Creativity flows like water finding its own path.",
    "Great writers are made through practice and persistence.",
    "The pen is mightier than the sword in changing minds.",
    "Stories have the power to transform hearts and souls.",
    "In writing, we find our voice and share our truth.",
    "Words are the building blocks of imagination and wonder.",
    "Through writing, we connect with others across time and space."
  ];

  // Generate more realistic text progression
  if (shapeCount < 5) {
    return "The quick brown";
  } else if (shapeCount < 10) {
    return "The quick brown fox jumps";
  } else if (shapeCount < 15) {
    return "The quick brown fox jumps over the lazy dog.";
  } else if (shapeCount < 25) {
    return "The quick brown fox jumps over the lazy dog. Writing is a journey";
  } else if (shapeCount < 35) {
    return "The quick brown fox jumps over the lazy dog. Writing is a journey of discovery and creativity.";
  } else {
    // Add more content for longer writing sessions
    const baseText = "The quick brown fox jumps over the lazy dog. Writing is a journey of discovery and creativity.";
    const additionalIndex = Math.floor((shapeCount - 35) / 10) % mockPhrases.length;
    return baseText + " " + mockPhrases[additionalIndex];
  }
}