import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, ArrowRight } from 'lucide-react';
import { CreativePrompt } from '../types';

interface CreativePromptsProps {
  currentText: string;
  onPromptSelect: (prompt: string) => void;
}

export function CreativePrompts({ currentText, onPromptSelect }: CreativePromptsProps) {
  const [prompts, setPrompts] = useState<CreativePrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePrompts = () => {
    setIsGenerating(true);
    
    // Simulate AI prompt generation based on current text
    setTimeout(() => {
      const newPrompts = getContextualPrompts(currentText);
      setPrompts(newPrompts);
      setIsGenerating(false);
    }, 1000);
  };

  const getContextualPrompts = (text: string): CreativePrompt[] => {
    const basePrompts = [
      {
        id: '1',
        type: 'continuation' as const,
        prompt: 'What happens next in this story?',
        context: 'Continue the narrative flow'
      },
      {
        id: '2',
        type: 'character' as const,
        prompt: 'Introduce a mysterious character who changes everything',
        context: 'Add depth to your story'
      },
      {
        id: '3',
        type: 'dialogue' as const,
        prompt: 'Write a conversation that reveals a secret',
        context: 'Enhance character development'
      },
      {
        id: '4',
        type: 'setting' as const,
        prompt: 'Describe this scene using all five senses',
        context: 'Create immersive descriptions'
      },
      {
        id: '5',
        type: 'twist' as const,
        prompt: 'Add an unexpected plot twist that changes the perspective',
        context: 'Keep readers engaged'
      }
    ];

    // Context-aware prompts based on text content
    if (text.toLowerCase().includes('dark') || text.toLowerCase().includes('night')) {
      basePrompts.push({
        id: '6',
        type: 'setting' as const,
        prompt: 'A single light pierces through the darkness, revealing...',
        context: 'Build on the dark atmosphere'
      });
    }

    if (text.toLowerCase().includes('door') || text.toLowerCase().includes('enter')) {
      basePrompts.push({
        id: '7',
        type: 'continuation' as const,
        prompt: 'Behind the door lies something unexpected...',
        context: 'Create suspense and mystery'
      });
    }

    return basePrompts.slice(0, 4); // Limit to 4 prompts
  };

  useEffect(() => {
    if (currentText.length > 20) {
      generatePrompts();
    }
  }, [currentText]);

  const handlePromptClick = (prompt: CreativePrompt) => {
    onPromptSelect(prompt.prompt);
  };

  if (!currentText.trim() || currentText.length < 20) {
    return (
      <div className="absolute bottom-20 right-6 z-40">
        <div className="glass rounded-2xl p-6 w-80">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Creative Prompts</h3>
          </div>
          <p className="text-sm text-gray-400 text-center py-4">
            Keep writing to unlock creative suggestions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-20 right-6 z-40">
      <div className="glass rounded-2xl p-6 w-80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Creative Prompts</h3>
          </div>
          
          <button
            onClick={generatePrompts}
            disabled={isGenerating}
            className="p-2 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isGenerating ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptClick(prompt)}
                className="w-full p-3 bg-gray-800/30 hover:bg-violet-500/10 border border-gray-700 hover:border-violet-500/30 rounded-lg text-left transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {prompt.prompt}
                    </p>
                    {prompt.context && (
                      <p className="text-xs text-gray-500 mt-1">
                        {prompt.context}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-violet-400 transition-colors flex-shrink-0 ml-2" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}