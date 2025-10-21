import React, { useState } from 'react';
import type { GenerationMode } from '../types';

interface Mode {
  id: GenerationMode;
  label: string;
  description: string;
}

interface ModeGroup {
  title: string;
  modes: Mode[];
}

export const modeGroups: ModeGroup[] = [
  { 
    title: 'Start Here',
    modes: [
      { id: 'General', label: 'General', description: 'A balanced mix of all content types. Perfect for getting a wide range of ideas.' },
    ]
  },
  {
    title: 'Educational Content',
    modes: [
       { id: 'SEO Tutorial', label: 'SEO Tutorial', description: 'Generate step-by-step guides and how-to videos for Shopify optimization.' },
       { id: 'App Deep Dive', label: 'App Deep Dive', description: 'Create in-depth tutorials and "hidden feature" showcases for a single Avada app.' },
    ]
  },
  {
    title: 'Growth & Trust',
    modes: [
      { id: 'Success Story', label: 'Success Story', description: 'Create narrative-driven content about merchant transformations and achievements.' },
      { id: 'Q&A / Myth Busting', label: 'Q&A / Myth Busting', description: 'Answer common questions or debunk popular myths to build community trust.' },
    ]
  },
  {
    title: 'Strategic Angles',
    modes: [
      { id: 'Pain Point Agitator', label: 'Pain Point Agitator', description: 'Explore a common merchant problem in-depth, then present an Avada app as the solution.' },
      { id: 'Competitive Angle', label: 'Competitive Angle', description: 'Position Avada as the superior choice against competitors or traditional methods.' },
      { id: 'Comparison', label: 'Comparison', description: 'Generate ideas that compare different Avada apps or contrast them with alternatives.' },
    ]
  },
  {
    title: 'Timely Content',
    modes: [
      { id: 'Feature Update', label: 'Feature Update', description: 'Produce timely content about new app features, updates, or emerging industry trends.' },
      { id: 'Seasonal Hooks', label: 'Seasonal Hooks', description: 'Frame ideas around holidays and major sales events (like BFCM) for timely impact.' },
    ]
  }
];

const defaultDescription = 'Hover over a mode to see its description.';

interface ModeSelectorProps {
  currentMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  disabled: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange, disabled }) => {
  const [hoveredDescription, setHoveredDescription] = useState<string>(defaultDescription);

  return (
    <div className="bg-slate-800/20 border border-slate-700/50 rounded-lg p-4 sticky top-8 shadow-lg shadow-purple-900/10 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/40">
      <h3 className="text-xl font-bold text-slate-200 mb-4 px-1">Generation Mode</h3>
      <div className="flex-grow space-y-4">
        {modeGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">{group.title}</h4>
            <div className="flex flex-col gap-1">
              {group.modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  onMouseEnter={() => setHoveredDescription(mode.description)}
                  onMouseLeave={() => setHoveredDescription(defaultDescription)}
                  disabled={disabled}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                    currentMode === mode.id
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'hover:bg-purple-600/50 text-slate-300 font-medium'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-purple-400 h-14 px-1">
            {hoveredDescription}
        </p>
      </div>
    </div>
  );
};

export default ModeSelector;