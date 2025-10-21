import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';
import { getCustomApiKey, saveCustomApiKey } from '../utils/localStorage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getCustomApiKey() || '');
      setIsSaved(false); // Reset saved status on open
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveCustomApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => {
        onClose();
    }, 1500); // Close modal after showing saved message
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 sticky top-0 bg-gray-800 border-b border-gray-700 z-10 flex justify-between items-center">
          <h2 id="api-key-modal-title" className="text-2xl font-bold text-purple-400">Settings: API Key</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close settings modal"
          >
            <XIcon />
          </button>
        </header>
        <main className="p-6 space-y-6">
          <div>
            <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-200 mb-2">Your Google AI Studio API Key</label>
            <input 
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key here"
              className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
            />
            <p className="text-xs text-gray-400 mt-2">Leave blank to use the default demonstration key. Your key is saved in your browser's local storage.</p>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-gray-100 mb-2">How to get your API Key</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                <li>Go to the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-semibold">Google AI Studio API Keys page</a>.</li>
                <li>Click the <span className="font-mono text-xs bg-gray-700 px-1 py-0.5 rounded">Create API key</span> button.</li>
                <li>Copy the generated key from the popup window.</li>
                <li>Paste the key into the input box above and click Save.</li>
            </ol>
          </div>
        </main>
         <footer className="p-4 border-t border-gray-700 flex-shrink-0 bg-gray-800/80 backdrop-blur-sm flex justify-end">
            <button
                onClick={handleSave}
                className={`w-32 flex items-center justify-center gap-2 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ${isSaved ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
                {isSaved ? '✓ Saved!' : 'Save Key'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ApiKeyModal;