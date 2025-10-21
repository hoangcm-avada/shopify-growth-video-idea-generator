import React, { useState, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SwitchHorizontalIcon } from './icons/SwitchHorizontalIcon';
import { UploadIcon } from './icons/UploadIcon';
import { generateTopicSuggestion } from '../services/geminiService';
import type { GenerationMode } from '../types';
import { audienceOptions } from '../data/apps';
import { modeSuggestions } from '../data/suggestions';

interface InputFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  audience: string;
  onAudienceChange: (audience: string) => void;
  mode: GenerationMode;
  audienceMode: 'select' | 'custom';
  onAudienceModeChange: (mode: 'select' | 'custom') => void;
}

const getPlaceholderForMode = (mode: GenerationMode): string => {
    const placeholders: Record<GenerationMode, string> = {
        'General': 'e.g., "how to write product descriptions that sell"',
        'SEO Tutorial': 'e.g., "step-by-step guide to image ALT text on Shopify"',
        'App Deep Dive': 'e.g., "hidden features of Avada SEO Image Optimizer"',
        'Success Story': 'e.g., "how a store doubled traffic with AI blogs"',
        'Q&A / Myth Busting': 'e.g., "is Shopify SEO really that complicated?"',
        'Pain Point Agitator': 'e.g., "why your Shopify store is slow and losing sales"',
        'Competitive Angle': 'e.g., "Avada SEO vs. manual SEO for new stores"',
        'Comparison': 'e.g., "AI product descriptions vs. hiring a copywriter"',
        'Feature Update': 'e.g., "what is LLMs.txt and why you need it now"',
        'Seasonal Hooks': 'e.g., "how to prep your Shopify SEO for Black Friday"',
    };
    return placeholders[mode] || placeholders['General'];
};


const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, audience, onAudienceChange, mode, audienceMode, onAudienceModeChange }) => {
  const [topic, setTopic] = useState('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSuggestions = modeSuggestions[mode] || modeSuggestions['General'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(topic);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
    onSubmit(suggestion);
  };

  const toggleAudienceMode = () => {
    if (audienceMode === 'select') {
      onAudienceModeChange('custom');
      onAudienceChange(''); // Clear selection when switching to custom
    } else {
      onAudienceModeChange('select');
      onAudienceChange(audienceOptions[0].value); // Reset to default
    }
  };

  const handleGenerateSuggestion = async () => {
    setIsSuggestionLoading(true);
    try {
      const audienceToSubmit = audience === 'all' ? '' : audience;
      const suggestion = await generateTopicSuggestion(mode, audienceToSubmit);
      setTopic(suggestion);
    } catch (error) {
      console.error("Failed to generate suggestion:", error);
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.txt', '.md'];
    const fileNameParts = file.name.split('.');
    const fileExtension = fileNameParts.length > 1 ? `.${fileNameParts.pop()}` : '';

    if (!validExtensions.includes(fileExtension.toLowerCase())) {
        alert('Invalid file type. Please select a .txt or .md file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setTopic(text);
      }
    };
    reader.onerror = () => {
        alert('Failed to read the file.');
    };
    reader.readAsText(file);
    
    // Reset the input value to allow uploading the same file again
    if(event.target) event.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const templateContent = `
# This is a template for your video idea instruction.
# You can use Markdown or plain text. The AI will use the entire content of this file as the primary topic or instruction.

## Example 1: Brief Topic
Improve Shopify speed for fashion stores with large image files.

---

## Example 2: Detailed Instruction
Generate video ideas for a tutorial on optimizing a Shopify product page for SEO.

Key areas to cover:
- Writing compelling, keyword-rich product descriptions.
- Optimizing product images (file names, ALT text).
- Structuring product data for rich snippets.
- The importance of customer reviews for SEO.

Target Audience:
Shopify store owners who are new to SEO.

Desired Tone:
Educational, encouraging, and easy to follow.
`.trim();
    
    const blob = new Blob([templateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'idea-template.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const placeholder = getPlaceholderForMode(mode);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
            rows={3}
            disabled={isLoading}
            aria-label="Main topic input"
          />
        </div>
        
        <div className="text-sm flex items-center justify-between gap-4 -mt-2 mb-2 px-1">
            <button
                type="button"
                onClick={handleImportClick}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-gray-300 hover:text-purple-400 transition-colors font-medium disabled:opacity-50"
                title="Import content from a .txt or .md file"
            >
                <UploadIcon />
                <span>Import from File</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,text/plain,text/markdown"
            />
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleDownloadTemplate(); }}
                className="text-xs text-gray-400 hover:text-purple-400 transition-colors"
            >
                Download Template
            </a>
        </div>

        <button
          type="button"
          onClick={handleGenerateSuggestion}
          disabled={isLoading || isSuggestionLoading}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-purple-800/50"
        >
          {isSuggestionLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-t-white border-purple-400 rounded-full animate-spin"></div>
              <span>Thinking of a topic...</span>
            </>
          ) : (
            <>
              <SparklesIcon />
              <span>Generate Topic with AI</span>
            </>
          )}
        </button>
        <div className="relative">
          {audienceMode === 'select' ? (
             <select
                value={audience}
                onChange={(e) => onAudienceChange(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 appearance-none"
                disabled={isLoading}
                aria-label="Select target audience"
             >
                {audienceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
          ) : (
             <input
              type="text"
              value={audience}
              onChange={(e) => onAudienceChange(e.target.value)}
              placeholder="Enter Custom Audience (e.g., “handmade jewelry sellers”)"
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              disabled={isLoading}
              aria-label="Custom target audience"
            />
          )}
          <button
            type="button"
            onClick={toggleAudienceMode}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-gray-300 hover:text-purple-400 transition-colors"
            title={audienceMode === 'select' ? 'Enter a custom audience' : 'Choose from a list'}
          >
            <SwitchHorizontalIcon />
            {audienceMode === 'select' ? 'Custom' : 'List'}
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/50"
        >
          <SparklesIcon />
          {isLoading ? 'Generating...' : 'Generate Ideas'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-300 mb-3">Or try one of these suggestions:</p>
        <div className="grid grid-cols-3 gap-2">
          {currentSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg text-xs text-gray-200 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center text-center"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputForm;