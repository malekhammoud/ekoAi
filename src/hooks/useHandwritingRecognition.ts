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
    }, 1500); // Wait 1.5 seconds after user stops drawing
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
    "In the beginning was the Word, and the Word was with creativity.",
    "Writing is thinking on paper, and drawing is thinking with your hands.",
    "Every story has a beginning, a middle, and an end - but not necessarily in that order.",
    "The pen is mightier than the sword, but the stylus is mightier than both.",
    "Creativity flows like water - it finds its own path and shape.",
    "Great writers are not born, they are made through practice and persistence.",
    "The canvas of imagination knows no boundaries or limitations.",
    "Words have power - they can build bridges or tear down walls.",
    "In the digital age, handwriting connects us to our humanity."
  ];

  const sentences = currentText.split('.').filter(s => s.trim());
  const wordsPerShape = Math.max(2, Math.floor(shapeCount / 3));
  
  if (shapeCount < 3) {
    return currentText;
  }

  // Add new content based on shape count
  const targetSentences = Math.floor(shapeCount / 8) + 1;
  
  if (sentences.length < targetSentences) {
    const newSentence = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
    return currentText + (currentText ? ' ' : '') + newSentence;
  }

  // Add words to existing content
  const additionalWords = [
    'creativity', 'inspiration', 'imagination', 'innovation', 'expression',
    'beautiful', 'elegant', 'thoughtful', 'meaningful', 'profound',
    'story', 'narrative', 'journey', 'adventure', 'discovery'
  ];

  const wordCount = currentText.split(' ').length;
  if (wordCount < wordsPerShape * 2) {
    const newWord = additionalWords[Math.floor(Math.random() * additionalWords.length)];
    return currentText + (currentText ? ' ' : '') + newWord;
  }

  return currentText;
}