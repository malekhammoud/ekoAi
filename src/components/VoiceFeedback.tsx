import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Subtitles, Eye, EyeOff } from 'lucide-react';

interface VoiceFeedbackProps {
  feedback: string;
  isGenerating: boolean;
}

export function VoiceFeedback({ feedback, isGenerating }: VoiceFeedbackProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (feedback && !isGenerating) {
      setWords(feedback.split(' '));
      setCurrentWordIndex(-1);
      speakText(feedback);
    }
  }, [feedback, isGenerating]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find a suitable voice (prefer female, English)
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentWordIndex(0);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
      };

      // Simulate word-by-word highlighting
      if (showSubtitles && words.length > 0) {
        const wordDuration = (utterance.rate || 1) * 60000 / (200 * words.length); // Approximate timing
        let wordIndex = 0;
        
        const wordTimer = setInterval(() => {
          if (wordIndex < words.length && isSpeaking) {
            setCurrentWordIndex(wordIndex);
            wordIndex++;
          } else {
            clearInterval(wordTimer);
          }
        }, wordDuration);
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
  };

  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  if (!feedback && !isGenerating && !isSpeaking) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-6 z-40">
      <div className="glass rounded-2xl p-6 max-w-md">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                title="Stop speaking"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-2 bg-violet-500/20 text-violet-400 rounded-lg">
                <Volume2 className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-white">AI Assistant</h4>
                {(isGenerating || isSpeaking) && (
                  <div className="flex items-center space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="voice-wave w-1 bg-cyan-400 rounded-full"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={toggleSubtitles}
                className={`p-1.5 rounded-md transition-colors ${
                  showSubtitles 
                    ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
                title={showSubtitles ? 'Hide subtitles' : 'Show subtitles'}
              >
                {showSubtitles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            
            {isGenerating ? (
              <div className="text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                  <span>Analyzing your writing...</span>
                </div>
              </div>
            ) : showSubtitles ? (
              <div className="text-sm text-gray-300 leading-relaxed">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`transition-all duration-200 ${
                      index === currentWordIndex && isSpeaking
                        ? 'bg-cyan-400/30 text-cyan-200 px-1 rounded'
                        : index < currentWordIndex && isSpeaking
                        ? 'text-gray-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {word}{index < words.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                🎧 Audio feedback playing...
              </div>
            )}
          </div>
        </div>
        
        {showSubtitles && isSpeaking && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <Subtitles className="w-3 h-3" />
                <span>Live subtitles</span>
              </div>
              <div className="text-cyan-400">
                {currentWordIndex + 1} / {words.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}