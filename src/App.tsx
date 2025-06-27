import React, { useState, useEffect } from 'react';
import { Tldraw, Editor, TLComponents } from 'tldraw';
import 'tldraw/tldraw.css';
import { ControlPanel } from './components/ControlPanel';
import { VoiceFeedback } from './components/VoiceFeedback';
import { TextAnalyzer } from './components/TextAnalyzer';
import { CreativePrompts } from './components/CreativePrompts';
import { GrammarChecker } from './components/GrammarChecker';
import { LearningModes } from './types';
import { useHandwritingRecognition } from './hooks/useHandwritingRecognition';
import { useAIFeedback } from './hooks/useAIFeedback';

function App() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [learningMode, setLearningMode] = useState<LearningModes>('creativity');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState('');
  
  const { isRecognizing, recognizedText, startRecognition } = useHandwritingRecognition(editor);
  const { feedback, isGeneratingFeedback, generateFeedback } = useAIFeedback();

  // Custom components for tldraw
  const components: TLComponents = {
    // Hide some UI elements for cleaner look
    ActionsMenu: null,
    HelpMenu: null,
    ZoomMenu: null,
    MainMenu: null,
  };

  // Generate feedback when text changes
  useEffect(() => {
    console.log('📄 Text changed:', recognizedText);
    if (recognizedText && recognizedText.length > 3 && learningMode !== 'minimal') {
      console.log('🎯 Triggering feedback generation for mode:', learningMode);
      generateFeedback(recognizedText, learningMode);
    }
  }, [recognizedText, learningMode, generateFeedback]);

  const handleEditorMount = (editor: Editor) => {
    console.log('🎨 Editor mounted successfully');
    setEditor(editor);
    
    // Listen to changes in the canvas with more detailed logging
    editor.on('change', (change) => {
      console.log('✏️ Canvas changed:', {
        source: change.source,
        changes: Object.keys(change.changes)
      });
      startRecognition();
    });

    // Also listen to pointer events for immediate feedback
    editor.on('pointer-down', () => {
      console.log('👆 Pointer down - starting to draw');
    });

    editor.on('pointer-up', () => {
      console.log('👆 Pointer up - finished drawing stroke');
      // Trigger recognition immediately when user stops drawing
      setTimeout(() => startRecognition(), 100);
    });
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
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>AI Ready</span>
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
            <p className="text-gray-300 text-sm">
              Use the drawing tools to write or draw on the canvas. 
              Your handwriting will be recognized and analyzed in real-time.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>Ready for input</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="h-full w-full pt-20">
        <Tldraw
          onMount={handleEditorMount}
          components={components}
          className="canvas-container"
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
              {isRecognizing ? 'Recognizing...' : 'Ready to write'}
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

      {/* Debug Panel (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-32 right-96 z-50 bg-black/90 p-4 rounded-lg text-xs text-white max-w-xs border border-gray-700">
          <div className="font-bold mb-2 text-cyan-400">🔧 Debug Info:</div>
          <div className="space-y-1">
            <div><span className="text-gray-400">Text:</span> "{recognizedText.slice(0, 30)}{recognizedText.length > 30 ? '...' : ''}"</div>
            <div><span className="text-gray-400">Length:</span> {recognizedText.length}</div>
            <div><span className="text-gray-400">Words:</span> {recognizedText.split(' ').filter(w => w.length > 0).length}</div>
            <div><span className="text-gray-400">Feedback:</span> "{feedback.slice(0, 30)}{feedback.length > 30 ? '...' : ''}"</div>
            <div><span className="text-gray-400">Generating:</span> {isGeneratingFeedback ? 'Yes' : 'No'}</div>
            <div><span className="text-gray-400">Recognizing:</span> {isRecognizing ? 'Yes' : 'No'}</div>
            <div><span className="text-gray-400">Mode:</span> {learningMode}</div>
            <div><span className="text-gray-400">Voice:</span> {isVoiceEnabled ? 'On' : 'Off'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;