import React from 'react';
import type { VideoIdea } from '../types';
import IdeaCard from './IdeaCard';

interface ResultsDisplayProps {
  title: string;
  ideas: VideoIdea[];
  savedIdeasMap: Set<string>;
  onSave: (idea: VideoIdea) => void;
  onRemove: (idea: VideoIdea) => void;
  onExpand: (idea: VideoIdea) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ title, ideas, savedIdeasMap, onSave, onRemove, onExpand }) => {
  if (ideas.length === 0) {
    return (
      <section className="mt-12 text-center text-gray-200">
        <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
        <p>You haven't saved any ideas yet. Save your favorites to see them here!</p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {ideas.map((idea, index) => (
          <IdeaCard 
            key={`${idea.title}-${index}`}
            idea={idea} 
            index={index}
            isSaved={savedIdeasMap.has(idea.title)}
            onSave={onSave}
            onRemove={onRemove}
            onExpand={onExpand}
          />
        ))}
      </div>
    </section>
  );
};

export default ResultsDisplay;