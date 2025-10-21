import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface EmptyStateProps {
    modeLabel: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ modeLabel }) => {
  return (
    <div className="text-center mt-12 text-gray-300 bg-gray-800/50 border border-gray-700 rounded-lg p-10 shadow-lg shadow-purple-900/30 transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/40">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
            <SparklesIcon />
        </div>
      </div>
      <p className="text-lg text-gray-200">
        Ready to generate <span className="font-bold text-purple-400">{modeLabel}</span> ideas.
      </p>
      <p className="mt-1">Enter a topic above to start!</p>
    </div>
  );
};

export default EmptyState;