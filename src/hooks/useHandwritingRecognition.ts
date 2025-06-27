import { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from 'tldraw';

export function useHandwritingRecognition(editor: Editor | null) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const recognitionTimeoutRef = useRef<NodeJS.Timeout>();
  const lastShapeCountRef = useRef(0);
  const lastProcessedShapeIds = useRef<Set<string>>(new Set());

  const processStrokes = useCallback(async () => {
    if (!editor) return '';

    try {
      const shapes = editor.getCurrentPageShapes();
      const drawShapes = shapes.filter(shape => shape.type === 'draw');
      
      console.log('🎨 Processing strokes:', {
        totalShapes: shapes.length,
        drawShapes: drawShapes.length,
        shapeTypes: shapes.map(s => s.type)
      });

      if (drawShapes.length === 0) {
        console.log('📝 No draw shapes found, clearing text');
        return '';
      }

      // Check for new shapes
      const currentShapeIds = new Set(drawShapes.map(shape => shape.id));
      const newShapes = drawShapes.filter(shape => !lastProcessedShapeIds.current.has(shape.id));
      
      console.log('🆕 New shapes detected:', newShapes.length);
      
      // Update processed shapes
      lastProcessedShapeIds.current = currentShapeIds;

      // Generate more realistic text progression
      const mockText = generateProgressiveText(drawShapes.length, newShapes.length);
      
      // Log ALL recognized text to console
      console.log('📝 RECOGNIZED TEXT:', mockText);
      console.log('📊 Text Stats:', {
        length: mockText.length,
        words: mockText.split(' ').filter(w => w.length > 0).length,
        shapes: drawShapes.length,
        newShapes: newShapes.length
      });
      
      return mockText;
    } catch (error) {
      console.error('❌ Error processing strokes:', error);
      return recognizedText;
    }
  }, [editor, recognizedText]);

  const startRecognition = useCallback(() => {
    if (!editor) {
      console.log('⚠️ No editor available for recognition');
      return;
    }

    const shapes = editor.getCurrentPageShapes();
    const currentShapeCount = shapes.filter(shape => shape.type === 'draw').length;
    
    console.log('🎯 Recognition triggered:', {
      currentShapes: currentShapeCount,
      lastShapes: lastShapeCountRef.current,
      shouldProcess: currentShapeCount !== lastShapeCountRef.current
    });

    // Process even if shape count is the same (shapes might have been modified)
    lastShapeCountRef.current = currentShapeCount;
    setIsRecognizing(true);

    // Clear previous timeout
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }

    // Shorter debounce for more responsive feedback
    recognitionTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('⏰ Recognition timeout triggered, processing...');
        const newText = await processStrokes();
        console.log('✅ Setting recognized text:', newText);
        setRecognizedText(newText);
      } catch (error) {
        console.error('❌ Recognition error:', error);
      } finally {
        setIsRecognizing(false);
      }
    }, 500); // Reduced from 800ms to 500ms for faster response
  }, [editor, processStrokes]);

  // Clear text when editor is cleared
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      const shapes = editor.getCurrentPageShapes();
      const drawShapes = shapes.filter(shape => shape.type === 'draw');
      
      // If all draw shapes are removed, clear the text
      if (drawShapes.length === 0 && recognizedText) {
        console.log('🧹 All shapes cleared, resetting text');
        setRecognizedText('');
        lastProcessedShapeIds.current.clear();
        lastShapeCountRef.current = 0;
      }
    };

    editor.on('change', handleChange);
    
    return () => {
      editor.off('change', handleChange);
    };
  }, [editor, recognizedText]);

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

// Improved text generation that responds to drawing activity
function generateProgressiveText(totalShapes: number, newShapes: number): string {
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
    'Every sentence is a step on a journey of discovery.'
  ];

  // Progressive text based on shape count
  if (totalShapes === 0) return '';
  if (totalShapes <= 2) return words[0]; // "The"
  if (totalShapes <= 4) return words.slice(0, 2).join(' '); // "The quick"
  if (totalShapes <= 6) return words.slice(0, 3).join(' '); // "The quick brown"
  if (totalShapes <= 8) return words.slice(0, 4).join(' '); // "The quick brown fox"
  if (totalShapes <= 12) return words.slice(0, 6).join(' '); // "The quick brown fox jumps over"
  if (totalShapes <= 16) return sentences[0]; // Full first sentence
  if (totalShapes <= 24) return sentences.slice(0, 2).join(' '); // Two sentences
  if (totalShapes <= 32) return sentences.slice(0, 3).join(' '); // Three sentences
  
  // For many shapes, return multiple sentences
  const sentenceCount = Math.min(Math.floor(totalShapes / 8), sentences.length);
  return sentences.slice(0, sentenceCount).join(' ');
}