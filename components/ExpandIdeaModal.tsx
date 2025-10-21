import React, { useState, useEffect } from 'react';
import type { VideoIdea, AppInfo, RepurposedContent, BlogPost, ScriptTemplateId, KeywordResearchResult, ChannelAnalysis } from '../types';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotographIcon } from './icons/PhotographIcon';
import { FilmIcon } from './icons/FilmIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RetryIcon } from './icons/RetryIcon';
import { generatePdfFromIdea } from '../utils/pdfGenerator';
import { generateDocFromIdea } from '../utils/docGenerator';
import { SettingsIcon } from './icons/SettingsIcon';
import { KeyIcon } from './icons/KeyIcon';
import { scriptTemplates } from '../data/templates';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { analyzeYoutubeChannel } from '../services/geminiService';


interface ExpandIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: VideoIdea;
  onRepurpose: (idea: VideoIdea) => Promise<void>;
  onGenerateThumbnails: (idea: VideoIdea) => Promise<void>;
  onGenerateScript: (idea: VideoIdea, isFaceless: boolean, scriptLength: string, customLength: string, scriptTemplate: ScriptTemplateId) => Promise<void>;
  onGenerateThumbnailImage: (idea: VideoIdea, thumbnailIndex: number) => Promise<void>;
  onRetryThumbnailImage: (idea: VideoIdea, thumbnailIndex: number) => Promise<void>;
  onRegenerateAll: (idea: VideoIdea, isFaceless: boolean, scriptLength: string, customLength: string, scriptTemplate: ScriptTemplateId) => Promise<void>;
  onKeywordResearch: (topic: string) => Promise<KeywordResearchResult[]>;
  recommendedApps: AppInfo[];
  onOpenSettings: () => void;
  youtubeChannel: string | null;
  onConnectYoutubeChannel: (handle: string) => void;
}

type LoadingState = 'repurpose' | 'thumbnails' | 'script' | `thumb-${number}` | null;
type ScriptLength = 'short' | 'medium' | 'long' | 'custom';

const ExpandIdeaModal: React.FC<ExpandIdeaModalProps> = ({ 
  isOpen, 
  onClose, 
  idea, 
  onRepurpose,
  onGenerateThumbnails,
  onGenerateScript,
  onGenerateThumbnailImage,
  onRetryThumbnailImage,
  onRegenerateAll,
  onKeywordResearch,
  recommendedApps,
  onOpenSettings,
  youtubeChannel,
  onConnectYoutubeChannel
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState<LoadingState>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isFaceless, setIsFaceless] = useState(false);
  const [scriptLength, setScriptLength] = useState<ScriptLength>('short');
  const [customLength, setCustomLength] = useState('');
  const [scriptTemplate, setScriptTemplate] = useState<ScriptTemplateId>('none');

  const handleAction = async (action: 'repurpose' | 'thumbnails' | 'script') => {
    setLoading(action);
    try {
      if (action === 'repurpose') await onRepurpose(idea);
      if (action === 'thumbnails') await onGenerateThumbnails(idea);
      if (action === 'script') await onGenerateScript(idea, isFaceless, scriptLength, customLength, scriptTemplate);
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      alert(`Failed to perform action: ${action}. Please try again.`);
    } finally {
      setLoading(null);
    }
  };
  
  const handleThumbnailImageAction = async (index: number, isRetry: boolean) => {
    setLoading(`thumb-${index}`);
    try {
        if (isRetry) {
          await onRetryThumbnailImage(idea, index);
        } else {
          await onGenerateThumbnailImage(idea, index);
        }
    } catch (error) {
        console.error(`Error generating thumbnail image for index ${index}:`, error);
        alert(`Failed to generate image. Please try again.`);
    } finally {
        setLoading(null);
    }
  };

  const handleRegenerateAll = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateAll(idea, isFaceless, scriptLength, customLength, scriptTemplate);
    } catch (error) {
      console.error('Error regenerating all content:', error);
      alert('Failed to regenerate content. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    generatePdfFromIdea(idea, recommendedApps);
  };

  const handleDownloadDoc = () => {
    generateDocFromIdea(idea, recommendedApps);
  };

  const allContentGenerated = !!(idea.repurposed && idea.thumbnails && idea.script);

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expand-modal-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 md:p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="min-w-0">
                 <h2 id="expand-modal-title" className="text-xl md:text-2xl font-bold text-purple-400">Content Expansion Suite</h2>
                 <p className="text-sm text-gray-300 mt-1 truncate pr-4">{idea.title}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {allContentGenerated && (
                <button
                  onClick={handleRegenerateAll}
                  disabled={isRegenerating}
                  className="flex items-center gap-2 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-wait"
                  title="Generate a new version of all expanded content"
                >
                  {isRegenerating ? (
                    <div className="w-4 h-4 border-2 border-t-purple-400 border-gray-500 rounded-full animate-spin"></div>
                  ) : (
                    <RetryIcon />
                  )}
                  <span className="hidden md:inline">{isRegenerating ? 'Regenerating...' : 'Regenerate All'}</span>
                </button>
              )}
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <XIcon />
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6 overflow-y-auto flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                <ActionButton icon={<FilmIcon/>} text="Create Full Script" action="script" loading={loading} onClick={handleAction} disabled={!!idea.script} />
                <ActionButton icon={<PhotographIcon/>} text="Generate Thumbnail Ideas" action="thumbnails" loading={loading} onClick={handleAction} disabled={!!idea.thumbnails} />
                <ActionButton icon={<SparklesIcon/>} text="Repurpose for Blog/TikTok" action="repurpose" loading={loading} onClick={handleAction} disabled={!!idea.repurposed} />
            </div>

            {/* Script Options Section */}
             <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h4 className="text-base font-bold text-gray-200 mb-3">Script Generation Options</h4>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <input 
                            type="checkbox" 
                            id="faceless-checkbox" 
                            checked={isFaceless}
                            onChange={(e) => setIsFaceless(e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 disabled:opacity-50"
                            disabled={loading !== null || !!idea.script}
                        />
                        <label htmlFor="faceless-checkbox" className="cursor-pointer">Faceless video style</label>
                    </div>

                     <div className="flex items-center gap-2">
                        <label htmlFor="script-template-select" className="text-sm font-medium text-gray-300 flex-shrink-0">Template:</label>
                        <select 
                            id="script-template-select"
                            value={scriptTemplate} 
                            onChange={(e) => setScriptTemplate(e.target.value as ScriptTemplateId)} 
                            disabled={loading !== null || !!idea.script}
                            className="w-full sm:w-auto flex-shrink-0 bg-gray-800/50 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                        >
                            {scriptTemplates.map(template => (
                                <option key={template.id} value={template.id}>{template.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-grow flex items-center gap-2">
                        <label htmlFor="script-length-select" className="text-sm font-medium text-gray-300 flex-shrink-0">Length:</label>
                        <select 
                            id="script-length-select"
                            value={scriptLength} 
                            onChange={(e) => setScriptLength(e.target.value as ScriptLength)} 
                            disabled={loading !== null || !!idea.script}
                            className="w-full sm:w-auto flex-shrink-0 bg-gray-800/50 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                        >
                            <option value="short">Short (&lt;5 min)</option>
                            <option value="medium">Medium (5-10 min)</option>
                            <option value="long">Long (&gt;10 min)</option>
                            <option value="custom">Custom</option>
                        </select>
                        {scriptLength === 'custom' && (
                            <input 
                                type="text"
                                value={customLength}
                                onChange={(e) => setCustomLength(e.target.value)}
                                placeholder="e.g., '7 minutes'"
                                disabled={loading !== null || !!idea.script}
                                className="w-full sm:w-auto flex-grow bg-gray-800/50 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <KeywordResearchDisplay 
                    initialKeywords={idea.keywords} 
                    onKeywordResearch={onKeywordResearch} 
                    youtubeChannel={youtubeChannel}
                    onConnectChannel={onConnectYoutubeChannel}
                />
                {idea.repurposed && <RepurposedContentDisplay content={idea.repurposed} />}
                {idea.thumbnails && (
                    <ThumbnailDisplay 
                        thumbnails={idea.thumbnails} 
                        ideaTitle={idea.title}
                        onGenerate={(index) => handleThumbnailImageAction(index, false)}
                        onRetry={(index) => handleThumbnailImageAction(index, true)}
                        onPreview={setPreviewImageUrl}
                        loadingIndex={typeof loading === 'string' && loading.startsWith('thumb-') ? parseInt(loading.split('-')[1], 10) : null}
                        onOpenSettings={onOpenSettings}
                    />
                )}
                {idea.script && <ScriptDisplay script={idea.script} />}
                {!idea.repurposed && !idea.thumbnails && !idea.script && loading === null && (
                    <div className="text-center py-12 text-gray-400">
                        <p>Select an action above to expand this video idea.</p>
                    </div>
                )}
            </div>
        </div>

        {allContentGenerated && (
          <footer className="p-4 border-t border-gray-700 flex-shrink-0 bg-gray-800/80 backdrop-blur-sm">
              <div className="flex gap-4">
                <button
                    onClick={handleDownloadPdf}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/50"
                >
                    <DownloadIcon />
                    Download as PDF
                </button>
                <button
                    onClick={handleDownloadDoc}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-blue-900/50"
                >
                    <DownloadIcon />
                    Download as DOC
                </button>
              </div>
          </footer>
        )}
      </div>
      {previewImageUrl && (
        <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
      )}
    </div>
  );
};

const ActionButton: React.FC<{icon: React.ReactNode, text: string, action: LoadingState, loading: LoadingState, onClick: (action: any) => void, disabled: boolean}> = ({icon, text, action, loading, onClick, disabled}) => {
    const getLoadingText = () => {
        switch (action) {
            case 'script': return "Writing script...";
            case 'thumbnails': return "Generating ideas...";
            case 'repurpose': return "Repurposing content...";
            default: return "Working...";
        }
    };
    
    return (
        <button 
            onClick={() => onClick(action)}
            disabled={loading !== null || disabled}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg text-center transition-all duration-200 border h-full flex-grow ${
                disabled 
                    ? 'bg-green-900/50 border-green-700/50 text-green-300 cursor-default'
                    : loading === action
                        ? 'bg-gray-700 border-purple-600 animate-pulse'
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-purple-500'
            } disabled:opacity-70`}
        >
            {loading === action 
                ? <div className="w-6 h-6 border-2 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
                : <div className="w-6 h-6">{icon}</div>
            }
            <span className="text-sm font-semibold">
                {loading === action ? getLoadingText() : (disabled ? `✓ ${text}` : text)}
            </span>
        </button>
    );
}

// Helper to format the TikTok string
const formatTikTokScript = (script: string) => {
    // Split by the labels but keep the delimiters
    const parts = script.split(/(Voiceover:|Text:)/).filter(Boolean);
    const formattedParts: { type: 'Voiceover' | 'Text'; content: string }[] = [];

    for (let i = 0; i < parts.length; i += 2) {
        if (parts[i] && parts[i+1]) {
            const type = parts[i].replace(':', '').trim() as 'Voiceover' | 'Text';
            const content = parts[i+1].trim();
            formattedParts.push({ type, content });
        }
    }
    return formattedParts;
};

const RepurposedContentDisplay: React.FC<{ content: RepurposedContent }> = ({ content }) => {
    const formattedTikTok = content?.tiktok ? formatTikTokScript(content.tiktok) : [];

    return (
        <Section title="Repurposed Content">
            <div className="space-y-6">
                {content?.blog && (
                    <div>
                        <h4 className="font-semibold text-lg text-gray-200 mb-2">✍️ Blog Post Idea</h4>
                        <div className="p-4 bg-gray-900/50 rounded-md space-y-4">
                            {/* FIX: Swapped ternary condition to check for string type first, which allows TypeScript to correctly narrow the types and prevent rendering an object. */}
                            {typeof content.blog === 'string' ? (
                                <p className="text-gray-200 whitespace-pre-wrap text-sm">{content.blog}</p>
                            ) : (
                                <>
                                    <h5 className="text-purple-400 font-bold text-base">{content.blog.title}</h5>
                                    <p className="text-gray-300 text-sm italic">"{content.blog.introduction}"</p>
                                    {content.blog.sections.map((section, index) => (
                                        <div key={index}>
                                            <h6 className="font-semibold text-gray-200 text-sm">{section.heading}</h6>
                                            <ul className="list-disc list-inside text-gray-300/90 text-sm space-y-1 mt-1 pl-2">
                                                {section.points.map((point, pIndex) => <li key={pIndex}>{point}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                    <p className="text-gray-300 text-sm">{content.blog.conclusion}</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {content?.tiktok && formattedTikTok.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-lg text-gray-200 mb-2">📱 TikTok Idea</h4>
                        <div className="p-4 bg-gray-900/50 rounded-md space-y-3">
                            {formattedTikTok.map((part, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <span className={`font-bold w-20 flex-shrink-0 ${part.type === 'Voiceover' ? 'text-blue-400' : 'text-green-400'}`}>{part.type}:</span>
                                    <p className="text-gray-300">{part.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
};

const ThumbnailDisplay: React.FC<{ 
    thumbnails: VideoIdea['thumbnails'], 
    ideaTitle: string,
    onGenerate: (index: number) => void,
    onRetry: (index: number) => void,
    onPreview: (url: string) => void,
    loadingIndex: number | null,
    onOpenSettings: () => void;
}> = ({ thumbnails, ideaTitle, onGenerate, onRetry, onPreview, loadingIndex, onOpenSettings }) => (
    <Section title="Thumbnail Ideas">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {thumbnails?.map((thumb, i) => (
                <div key={i} className="bg-gray-900/50 rounded-md p-3 flex flex-col justify-between">
                    <div>
                        <p className="font-bold text-purple-300">"{thumb.text}"</p>
                        <p className="text-sm text-gray-300 mt-1">{thumb.style}</p>
                    </div>
                    <div className="mt-4">
                        {thumb.error ? (
                            <div className="p-2 bg-red-900/50 border border-red-700/50 rounded-md text-center space-y-2">
                                <p className="text-xs text-red-300">{thumb.error}</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onRetry(i)}
                                        disabled={loadingIndex !== null}
                                        className="flex-1 text-center flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-wait text-sm"
                                    >
                                        {loadingIndex === i ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
                                                <span>Retrying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <RetryIcon />
                                                <span>Retry</span>
                                            </>
                                        )}
                                    </button>
                                     <button
                                        onClick={onOpenSettings}
                                        disabled={loadingIndex !== null}
                                        className="flex-1 text-center flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-wait text-sm"
                                        title="Open API Key Settings"
                                    >
                                        <SettingsIcon />
                                        <span>Settings</span>
                                    </button>
                                </div>
                            </div>
                        ) : thumb.imageUrl ? (
                           <div className="space-y-3">
                                <div className="relative group cursor-pointer" onClick={() => onPreview(thumb.imageUrl)}>
                                    <img src={thumb.imageUrl} alt={thumb.text} className="rounded-md w-full aspect-video object-cover"/>
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                        <span className="text-white font-bold text-lg">Click to Preview</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <a 
                                        href={thumb.imageUrl} 
                                        download={`thumbnail-${ideaTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}-${i+1}.jpg`}
                                        className="flex-1 text-center flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300"
                                    >
                                        <DownloadIcon />
                                        Download
                                    </a>
                                    <button
                                        onClick={() => onRetry(i)}
                                        disabled={loadingIndex !== null}
                                        className="flex-1 text-center flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {loadingIndex === i ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
                                                <span>Retrying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <RetryIcon />
                                                <span>Retry</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => onGenerate(i)}
                                disabled={loadingIndex !== null}
                                className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 text-sm"
                            >
                                {loadingIndex === i ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <PhotographIcon />
                                        <span>Generate Image</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </Section>
);

const ScriptDisplay: React.FC<{ script: VideoIdea['script'] }> = ({ script }) => (
     <Section title={`Script: "${script?.title}"`}>
        <div className="space-y-4">
            {script?.scenes.map(scene => (
                <div key={scene.scene} className="p-3 bg-gray-900/50 rounded-md">
                    <h5 className="font-bold text-gray-300 flex items-center gap-2">
                      <span className="text-xs font-mono bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-md">{scene.timestamp}</span>
                      <span>Scene {scene.scene}</span>
                    </h5>
                    <p className="text-sm mt-2 pl-2 border-l-2 border-gray-700"><span className="font-semibold text-purple-300/80">Visuals:</span> {scene.visuals}</p>
                    <p className="text-sm mt-1 pl-2 border-l-2 border-gray-700"><span className="font-semibold text-purple-300/80">Dialogue:</span> <span className="italic">"{scene.dialogue}"</span></p>
                </div>
            ))}
        </div>
    </Section>
);

const KeywordResearchDisplay: React.FC<{
    initialKeywords: string;
    onKeywordResearch: (topic: string) => Promise<KeywordResearchResult[]>;
    youtubeChannel: string | null;
    onConnectChannel: (handle: string) => void;
}> = ({ initialKeywords, onKeywordResearch, youtubeChannel, onConnectChannel }) => {
    const [topic, setTopic] = useState(initialKeywords);
    const [channelInput, setChannelInput] = useState(youtubeChannel || '');
    const [isEditingChannel, setIsEditingChannel] = useState(!youtubeChannel);
    const [researchState, setResearchState] = useState<{
        status: 'idle' | 'loading' | 'success' | 'error';
        results: KeywordResearchResult[];
        error: string | null;
    }>({ status: 'idle', results: [], error: null });
    const [analysis, setAnalysis] = useState<ChannelAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);


    useEffect(() => {
        setIsEditingChannel(!youtubeChannel);
        setChannelInput(youtubeChannel || '');
        if (!youtubeChannel) {
            setAnalysis(null);
        }
    }, [youtubeChannel]);

    useEffect(() => {
        if (isEditingChannel) {
            setAnalysis(null);
        }
    }, [isEditingChannel]);

    useEffect(() => {
        const performInitialAnalysis = async (handle: string) => {
            setIsAnalyzing(true);
            setAnalysisError(null);
            try {
                const analysisResult = await analyzeYoutubeChannel(handle);
                setAnalysis(analysisResult);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
                setAnalysisError(`Failed to analyze channel: ${errorMessage}`);
                setAnalysis(null);
            } finally {
                setIsAnalyzing(false);
            }
        };

        if (youtubeChannel && !isEditingChannel && !analysis) {
            performInitialAnalysis(youtubeChannel);
        }
    }, [youtubeChannel, isEditingChannel, analysis]);

    const handleConnect = async () => {
        if (!channelInput.trim() || isAnalyzing) return;
    
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysis(null);
        try {
          const analysisResult = await analyzeYoutubeChannel(channelInput);
          setAnalysis(analysisResult);
          onConnectChannel(channelInput);
          setIsEditingChannel(false);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
          setAnalysisError(`Failed to analyze channel: ${errorMessage}`);
        } finally {
          setIsAnalyzing(false);
        }
      };

    const handleResearch = async () => {
        if (!topic.trim()) return;
        setResearchState({ status: 'loading', results: [], error: null });
        try {
            const results = await onKeywordResearch(topic);
            setResearchState({ status: 'success', results, error: null });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setResearchState({ status: 'error', results: [], error: errorMessage });
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-800/50 text-green-300';
            case 'medium': return 'bg-yellow-800/50 text-yellow-300';
            case 'hard': return 'bg-red-800/50 text-red-300';
            default: return 'bg-gray-700/50 text-gray-300';
        }
    };

    return (
        <Section title="Keyword Research">
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 mb-3">
                <h4 className="text-sm font-semibold text-gray-200 mb-2">YouTube Channel-Aware Analysis</h4>
                {isEditingChannel ? (
                     <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={channelInput}
                            onChange={(e) => setChannelInput(e.target.value)}
                            placeholder="@your-channel-handle"
                            className="flex-grow bg-gray-800/50 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                        />
                        <button onClick={handleConnect} disabled={isAnalyzing} className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1.5 px-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-wait">
                           {isAnalyzing ? (
                                <>
                                 <div className="w-4 h-4 border-2 border-t-white border-gray-400 rounded-full animate-spin"></div>
                                 <span>Analyzing...</span>
                                </>
                           ) : (
                                <>
                                 <YouTubeIcon />
                                 <span>Connect Channel</span>
                                </>
                           )}
                        </button>
                     </div>
                ) : (
                    <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md">
                        <div className="flex items-center gap-2 text-sm">
                             <YouTubeIcon />
                             <span className="text-gray-300">Connected as:</span>
                             <span className="font-bold text-purple-400">{youtubeChannel}</span>
                        </div>
                        <button onClick={() => setIsEditingChannel(true)} className="text-xs text-gray-400 hover:text-white underline">Change</button>
                    </div>
                )}
                 <p className="text-xs text-gray-400 mt-2">Connect your channel to get keyword ideas tailored to your specific audience and content style.</p>
                 {analysisError && <p className="text-red-400 text-xs mt-2">{analysisError}</p>}
            </div>

            {isAnalyzing && (
                <div className="mb-4 p-3 bg-gray-800/60 rounded-lg border border-gray-700/70 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                        <div className="w-4 h-4 border-2 border-t-purple-400 border-gray-500 rounded-full animate-spin"></div>
                        <span>Analyzing {channelInput || youtubeChannel}...</span>
                    </div>
                </div>
            )}

            {analysis && !isEditingChannel && !isAnalyzing && (
                <div className="mb-4 p-3 bg-gray-800/60 rounded-lg border border-gray-700/70">
                    <h5 className="text-sm font-bold text-purple-300 mb-2">Channel Analysis Summary</h5>
                    <div className="space-y-2 text-xs text-gray-300">
                        <div><span className="font-semibold text-gray-100">Main Topics: </span>{analysis.mainTopics.join(', ')}</div>
                        <div><span className="font-semibold text-gray-100">Target Audience: </span>{analysis.targetAudience}</div>
                        <div><span className="font-semibold text-gray-100">Strategy Suggestion: </span>{analysis.contentStrategySuggestion}</div>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter keywords to research..."
                    className="flex-grow bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                    disabled={researchState.status === 'loading'}
                />
                <button
                    onClick={handleResearch}
                    disabled={!topic.trim() || researchState.status === 'loading'}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-wait"
                >
                    {researchState.status === 'loading' ? (
                        <>
                            <div className="w-4 h-4 border-2 border-t-white border-purple-400 rounded-full animate-spin"></div>
                            <span>Researching...</span>
                        </>
                    ) : (
                        <>
                            <KeyIcon />
                            <span>Research Keywords</span>
                        </>
                    )}
                </button>
            </div>
            {researchState.status === 'error' && <p className="text-red-400 text-sm mt-3">{researchState.error}</p>}
            {researchState.status === 'success' && researchState.results.length > 0 && (
                 <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-4 py-2">Keyword</th>
                                <th scope="col" className="px-4 py-2">Est. Volume</th>
                                <th scope="col" className="px-4 py-2">Difficulty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {researchState.results.map((result, index) => (
                                <tr key={index} className="border-b border-gray-700/50">
                                    <td className="px-4 py-2 font-medium text-gray-100">{result.keyword}</td>
                                    <td className="px-4 py-2">{result.volume}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getDifficultyColor(result.difficulty)}`}>
                                            {result.difficulty}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             {researchState.status === 'success' && researchState.results.length === 0 && (
                <p className="text-gray-400 text-sm mt-3 text-center">No keywords found for this topic.</p>
             )}
        </Section>
    );
}

const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="bg-gray-800/50 border border-gray-700/80 rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-200 mb-3 break-words">{title}</h3>
        {children}
    </div>
);

const ImagePreviewModal: React.FC<{ imageUrl: string, onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Thumbnail Preview" className="object-contain max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        <button 
            onClick={onClose} 
            className="absolute -top-3 -right-3 bg-gray-800 rounded-full p-1.5 text-white hover:bg-gray-700 transition-colors shadow-lg"
            aria-label="Close image preview"
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
};


export default ExpandIdeaModal;