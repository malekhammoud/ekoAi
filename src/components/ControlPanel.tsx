import React from 'react';
import { Settings, Mic, MicOff, Brain, BookOpen, Target } from 'lucide-react';
import { LearningModes } from '../types';

interface ControlPanelProps {
  learningMode: LearningModes;
  setLearningMode: (mode: LearningModes) => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  isRecognizing: boolean;
}

export function ControlPanel({
  learningMode,
  setLearningMode,
  isVoiceEnabled,
  setIsVoiceEnabled,
  isRecognizing
}: ControlPanelProps) {
  const modes = [
    {
      id: 'creativity' as LearningModes,
      label: 'Creativity Boost',
      icon: Brain,
      description: 'Get creative prompts and style suggestions',
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 'grammar' as LearningModes,
      label: 'Grammar Focus',
      icon: BookOpen,
      description: 'Focus on grammar and spelling corrections',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'minimal' as LearningModes,
      label: 'Minimal Distraction',
      icon: Target,
      description: 'Clean writing with minimal interruptions',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="absolute top-24 right-6 z-40">
      <div className="glass rounded-2xl p-6 w-80">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Writing Mode</h3>
          </div>
          
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isVoiceEnabled 
                ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = learningMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => setLearningMode(mode.id)}
                className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                  isActive
                    ? 'border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 to-violet-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${mode.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {mode.label}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {mode.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isRecognizing && (
          <div className="mt-6 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-sm text-cyan-300">Analyzing your writing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}