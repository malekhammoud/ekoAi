import React from 'react';
import { FileText, Clock, BarChart3 } from 'lucide-react';

interface TextAnalyzerProps {
  text: string;
  onTextUpdate: (text: string) => void;
}

export function TextAnalyzer({ text }: TextAnalyzerProps) {
  const getWordCount = () => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getCharCount = () => {
    return text.length;
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const words = getWordCount();
    return Math.ceil(words / wordsPerMinute);
  };

  const getSentenceCount = () => {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  };

  const getReadabilityScore = () => {
    const words = getWordCount();
    const sentences = getSentenceCount();
    const syllables = text.split(/\s+/).reduce((count, word) => {
      return count + Math.max(1, word.replace(/[^aeiouAEIOU]/g, '').length);
    }, 0);

    if (sentences === 0 || words === 0) return 0;

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getReadabilityLevel = (score: number) => {
    if (score >= 90) return { level: 'Very Easy', color: 'text-green-400' };
    if (score >= 80) return { level: 'Easy', color: 'text-green-300' };
    if (score >= 70) return { level: 'Fairly Easy', color: 'text-yellow-400' };
    if (score >= 60) return { level: 'Standard', color: 'text-orange-400' };
    if (score >= 50) return { level: 'Fairly Difficult', color: 'text-red-400' };
    if (score >= 30) return { level: 'Difficult', color: 'text-red-500' };
    return { level: 'Very Difficult', color: 'text-red-600' };
  };

  if (!text.trim()) {
    return null;
  }

  const readabilityScore = getReadabilityScore();
  const readabilityLevel = getReadabilityLevel(readabilityScore);

  return (
    <div className="absolute top-24 left-6 z-40">
      <div className="glass rounded-2xl p-6 w-72">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Text Analysis</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-2xl font-bold gradient-text">
                {getWordCount()}
              </div>
              <div className="text-xs text-gray-400">Words</div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-violet-400">
                {getCharCount()}
              </div>
              <div className="text-xs text-gray-400">Characters</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Reading Time</span>
              </div>
              <span className="text-sm font-medium text-white">
                {getReadingTime()} min
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Sentences</span>
              </div>
              <span className="text-sm font-medium text-white">
                {getSentenceCount()}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Readability</span>
                <span className={`text-sm font-medium ${readabilityLevel.color}`}>
                  {readabilityLevel.level}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${readabilityScore}%` }}
                />
              </div>
              
              <div className="text-xs text-gray-400 mt-1 text-center">
                Score: {readabilityScore}/100
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}