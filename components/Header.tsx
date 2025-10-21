import React from 'react';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { EmailIcon } from './icons/EmailIcon';

interface HeaderProps {
    activeView: 'generated' | 'saved';
    onViewChange: (view: 'generated' | 'saved') => void;
    savedIdeasCount: number;
    onOpenHelpModal: () => void;
    onOpenApiKeyModal: () => void;
    modeDescription: string;
}

const Header: React.FC<HeaderProps> = ({ activeView, onViewChange, savedIdeasCount, onOpenHelpModal, onOpenApiKeyModal, modeDescription }) => {
  const feedbackSubject = encodeURIComponent("Feedback for Shopify Growth Video Idea Generator");
  const feedbackBody = encodeURIComponent("Hi, I have some feedback about the app:\n\n");
  const mailtoLink = `mailto:hoangcm@avadagroup.com?subject=${feedbackSubject}&body=${feedbackBody}`;
  
  return (
    <header className="text-center mb-4 md:mb-6 relative">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-purple-400">
        Shopify Growth Video Idea Generator
      </h1>
      
      <div className="absolute top-0 right-0 flex flex-col items-end gap-2 z-10">
        <a 
          href={mailtoLink}
          className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
          aria-label="Send feedback"
          title="Send Feedback"
        >
           <span className="hidden md:inline text-sm">Feedback</span>
           <div className="bg-gray-700/50 p-1.5 rounded-full"><EmailIcon /></div>
        </a>
         <button 
          onClick={onOpenApiKeyModal}
          className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
          aria-label="Open settings"
          title="Settings"
        >
           <span className="hidden md:inline text-sm">Settings</span>
           <div className="bg-gray-700/50 p-1.5 rounded-full"><SettingsIcon /></div>
        </button>
        <button 
          onClick={onOpenHelpModal}
          className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
          aria-label="Open help"
          title="Help"
        >
          <span className="hidden md:inline text-sm">Help</span>
          <div className="bg-gray-700/50 p-1.5 rounded-full"><QuestionMarkCircleIcon /></div>
        </button>
      </div>

      <p className="mt-3 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
        {modeDescription}
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <button
            onClick={() => onViewChange('generated')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                activeView === 'generated'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
            }`}
        >
            Generated Ideas
        </button>
        <button
            onClick={() => onViewChange('saved')}
            className={`relative px-4 py-2 rounded-md font-semibold transition-colors ${
                activeView === 'saved'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
            }`}
        >
            Saved Ideas
            {savedIdeasCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {savedIdeasCount}
                </span>
            )}
        </button>
    </div>
    </header>
  );
};

export default Header;