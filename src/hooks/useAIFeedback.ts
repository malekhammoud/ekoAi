import { useState, useCallback } from 'react';
import { LearningModes } from '../types';
import { AIService } from '../services/aiService';

interface AIFeedbackHook {
  feedback: string;
  isGeneratingFeedback: boolean;
  generateFeedback: (text: string, mode: LearningModes) => void;
}

export function useAIFeedback(): AIFeedbackHook {
  const [feedback, setFeedback] = useState('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const generateFeedback = useCallback(async (text: string, mode: LearningModes) => {
    if (!text.trim() || text.length < 10) return;

    setIsGeneratingFeedback(true);

    try {
      const aiService = AIService.getInstance();
      const newFeedback = await aiService.generateFeedback(text, mode);
      setFeedback(newFeedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      setFeedback('Keep up the great work with your writing!');
    } finally {
      setIsGeneratingFeedback(false);
    }
  }, []);

  return {
    feedback,
    isGeneratingFeedback,
    generateFeedback
  };
}