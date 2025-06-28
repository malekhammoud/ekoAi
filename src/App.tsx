import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { VoiceFeedback } from './components/VoiceFeedback';
import { TextAnalyzer } from './components/TextAnalyzer';
import { CreativePrompts } from './components/CreativePrompts';
import { GrammarChecker } from './components/GrammarChecker';
import { CustomCanvas } from './components/CustomCanvas';
import { LearningModes } from './types';
import { useHandwritingRecognition } from './hooks/useHandwritingRecognition';
import { useAIFeedback } from './hooks/useAIFeedback';

function App() {
  const [learningMode, setLearningMode] = useState<LearningModes>('creativity');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState('');
  
  const { isRecognizing, recognizedText, startRecognition, clearRecognition } = useHandwritingRecognition();
  const { feedback, isGeneratingFeedback, generateFeedback } = useAIFeedback();

  // Generate feedback when text changes
  useEffect(() => {
    console.log('📄 Text changed:', recognizedText);
    if (recognizedText && recognizedText.length > 3 && learningMode !== 'minimal') {
      console.log('🎯 Triggering feedback generation for mode:', learningMode);
      generateFeedback(recognizedText, learningMode);
    }
  }, [recognizedText, learningMode, generateFeedback]);

  const handleStrokeComplete = (strokes: any[], canvas?: HTMLCanvasElement) => {
    console.log('✏️ Stroke completed, total strokes:', strokes.length);
    
    if (strokes.length === 0) {
      clearRecognition();
    } else {
      startRecognition(strokes, canvas);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">✍️</span>
            </div>
            <h1 className="text-2xl font-display font-bold gradient-text">
              EkoPen
            </h1>
          </div>
          
          <div className="text-sm text-gray-400 flex items-center space-x-4">
            <div>
              {learningMode === 'grammar' && '📝 Grammar Focus'}
              {learningMode === 'creativity' && '🎨 Creativity Boost'}
              {learningMode === 'minimal' && '🎯 Minimal Distraction'}
            </div>
            <div className="text-xs text-green-400 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Recognition Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Instructions overlay for first-time users */}
      {!recognizedText && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="glass rounded-2xl p-8 text-center max-w-md">
            <div className="text-6xl mb-4">✍️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Start Writing!</h2>
            <p className="text-gray-300 text-sm mb-4">
              Write or draw on the canvas below. Advanced handwriting recognition 
              will convert your strokes to text in real-time.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <div>🔍 Multiple recognition methods active</div>
              <div>🎨 Pattern analysis enabled</div>
              <div>🤖 AI vision processing ready</div>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>Ready for handwriting input</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="h-full w-full pt-20 flex items-center justify-center">
        <CustomCanvas
          width={800}
          height={600}
          onStrokeComplete={handleStrokeComplete}
          className="shadow-2xl"
        />
      </div>

      {/* Control Panel */}
      <ControlPanel
        learningMode={learningMode}
        setLearningMode={setLearningMode}
        isVoiceEnabled={isVoiceEnabled}
        setIsVoiceEnabled={setIsVoiceEnabled}
        isRecognizing={isRecognizing}
      />

      {/* Voice Feedback with Subtitles */}
      {isVoiceEnabled && (
        <VoiceFeedback
          feedback={feedback}
          isGenerating={isGeneratingFeedback}
        />
      )}

      {/* Text Analyzer */}
      {recognizedText && (
        <TextAnalyzer
          text={recognizedText}
          onTextUpdate={() => {}} // Not needed for display-only
        />
      )}

      {/* Grammar Checker */}
      {learningMode === 'grammar' && recognizedText && (
        <GrammarChecker text={recognizedText} />
      )}

      {/* Creative Prompts */}
      {learningMode === 'creativity' && (
        <CreativePrompts
          currentText={recognizedText}
          onPromptSelect={setCurrentPrompt}
        />
      )}

      {/* Enhanced Status Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="glass rounded-full px-6 py-3 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isRecognizing ? 'bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50' : 'bg-gray-600'
            }`} />
            <span className="text-sm text-gray-300 font-medium">
              {isRecognizing ? 'Analyzing handwriting...' : 'Ready to write'}
            </span>
          </div>
          
          {recognizedText && (
            <div className="text-sm text-gray-400 flex items-center space-x-2">
              <span>📝</span>
              <span>{recognizedText.length} chars • {recognizedText.split(' ').filter(w => w.length > 0).length} words</span>
            </div>
          )}
          
          {feedback && (
            <div className="text-sm text-cyan-400 flex items-center space-x-2">
              <span>🎧</span>
              <span>AI feedback ready</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;