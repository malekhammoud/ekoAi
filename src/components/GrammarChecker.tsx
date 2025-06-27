import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { GrammarIssue } from '../types';

interface GrammarCheckerProps {
  text: string;
}

export function GrammarChecker({ text }: GrammarCheckerProps) {
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (text.length > 10) {
      analyzeText(text);
    } else {
      setIssues([]);
    }
  }, [text]);

  const analyzeText = (inputText: string) => {
    setIsAnalyzing(true);
    
    // Simulate grammar checking with realistic delay
    setTimeout(() => {
      const foundIssues = findGrammarIssues(inputText);
      setIssues(foundIssues);
      setIsAnalyzing(false);
    }, 800);
  };

  const findGrammarIssues = (inputText: string): GrammarIssue[] => {
    const issues: GrammarIssue[] = [];
    const words = inputText.toLowerCase();

    // Common grammar patterns to check
    const patterns = [
      {
        regex: /\b(its)\s+(a|an|the)\b/g,
        type: 'grammar' as const,
        suggestion: "Use 'it's' (contraction of 'it is') instead of 'its'",
        confidence: 0.9
      },
      {
        regex: /\b(there|their|they're)\b/g,
        type: 'grammar' as const,
        suggestion: "Check if you're using the correct form: there/their/they're",
        confidence: 0.7
      },
      {
        regex: /\b(your|you're)\b/g,
        type: 'grammar' as const,
        suggestion: "Verify correct usage: 'your' (possessive) vs 'you're' (you are)",
        confidence: 0.7
      },
      {
        regex: /[.]\s*[a-z]/g,
        type: 'grammar' as const,
        suggestion: "Capitalize the first letter after a period",
        confidence: 0.8
      },
      {
        regex: /\b(alot)\b/g,
        type: 'spelling' as const,
        suggestion: "Use 'a lot' (two words) instead of 'alot'",
        confidence: 0.95
      },
      {
        regex: /\b(recieve)\b/g,
        type: 'spelling' as const,
        suggestion: "Correct spelling is 'receive' (i before e except after c)",
        confidence: 0.95
      },
      {
        regex: /[a-z][A-Z]/g,
        type: 'grammar' as const,
        suggestion: "Check capitalization - consider adding a space or punctuation",
        confidence: 0.6
      }
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(inputText)) !== null) {
        issues.push({
          text: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          type: pattern.type,
          suggestion: pattern.suggestion,
          confidence: pattern.confidence
        });
      }
    });

    // Check for missing punctuation at end of sentences
    const sentences = inputText.split(/[.!?]+/);
    if (sentences.length > 1 && !inputText.match(/[.!?]$/)) {
      issues.push({
        text: inputText.slice(-10),
        position: { start: inputText.length - 1, end: inputText.length },
        type: 'punctuation',
        suggestion: "Consider adding punctuation at the end of your sentence",
        confidence: 0.7
      });
    }

    return issues.slice(0, 5); // Limit to 5 issues to avoid overwhelming
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'spelling':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'grammar':
        return <BookOpen className="w-4 h-4 text-yellow-400" />;
      case 'punctuation':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIssueColor = (type: string, confidence: number) => {
    const baseColors = {
      spelling: 'border-red-500/30 bg-red-500/10',
      grammar: 'border-yellow-500/30 bg-yellow-500/10',
      punctuation: 'border-orange-500/30 bg-orange-500/10'
    };
    
    return confidence > 0.8 ? baseColors[type as keyof typeof baseColors] : 'border-gray-500/30 bg-gray-500/10';
  };

  if (!text.trim() || text.length < 10) {
    return null;
  }

  return (
    <div className="absolute top-1/2 right-6 -translate-y-1/2 z-40">
      <div className="glass rounded-2xl p-6 w-80">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Grammar Check</h3>
          {isAnalyzing && (
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          )}
        </div>

        {isAnalyzing ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />
              <div className="h-3 bg-gray-600 rounded w-3/4 animate-pulse" />
            </div>
            <div className="text-sm text-gray-400">Analyzing your writing...</div>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Great writing! No issues found.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-300 mb-3">
              Found {issues.length} suggestion{issues.length !== 1 ? 's' : ''}:
            </div>
            
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getIssueColor(issue.type, issue.confidence)}`}
              >
                <div className="flex items-start space-x-2">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-white uppercase">
                        {issue.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {Math.round(issue.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">
                      <span className="font-mono bg-gray-800 px-1 py-0.5 rounded text-xs">
                        "{issue.text}"
                      </span>
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      {issue.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}