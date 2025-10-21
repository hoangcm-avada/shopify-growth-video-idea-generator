import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import ApiKeyModal from './components/ApiKeyModal';
import ModeSelector, { modeGroups } from './components/ModeSelector';
import ExpandIdeaModal from './components/ExpandIdeaModal';
import EmptyState from './components/EmptyState';
import { generateVideoIdeas, repurposeVideoIdea, generateThumbnailIdeas, generateScript, generateThumbnailImage, generateAppRecommendations, researchKeywords } from './services/geminiService';
import type { VideoIdea, GenerationMode, AppInfo, ScriptTemplateId, KeywordResearchResult } from './types';
import { getSavedIdeas, saveIdea, removeIdea, createSavedIdeasMap, getYoutubeChannelHandle, saveYoutubeChannelHandle } from './utils/localStorage';
import { audienceOptions } from './data/apps';
import BackToTopButton from './components/BackToTopButton';
import { allApps } from './data/apps';

const App: React.FC = () => {
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<VideoIdea[]>([]);
  const [savedIdeasMap, setSavedIdeasMap] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'generated' | 'saved'>('generated');
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationMode>('General');
  const [audience, setAudience] = useState(audienceOptions[0].value);
  const [audienceMode, setAudienceMode] = useState<'select' | 'custom'>('select');
  const [recommendedApps, setRecommendedApps] = useState<AppInfo[]>(allApps);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [youtubeChannel, setYoutubeChannel] = useState<string | null>(null);
  
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [expandingIdea, setExpandingIdea] = useState<VideoIdea | null>(null);

  useEffect(() => {
    const ideasFromStorage = getSavedIdeas();
    setSavedIdeas(ideasFromStorage);
    const channelFromStorage = getYoutubeChannelHandle();
    setYoutubeChannel(channelFromStorage);
  }, []);

  useEffect(() => {
    setSavedIdeasMap(createSavedIdeasMap(savedIdeas));
  }, [savedIdeas]);

  // Effect for handling app recommendations in the footer
  useEffect(() => {
    // Logic for select mode (no API call)
    if (audienceMode === 'select') {
      setIsRecommendationLoading(false);
      if (audience === 'all' || !audience) {
        setRecommendedApps(allApps);
      } else {
        const filtered = allApps.filter(app => app.tags.includes(audience));
        setRecommendedApps(filtered);
      }
      return;
    }

    // Logic for custom mode (debounced API call)
    if (audience.trim().length < 5) {
      setRecommendedApps(allApps); // Don't run on very short input, default to all
      return;
    }

    setIsRecommendationLoading(true);
    const handler = setTimeout(async () => {
      try {
        const recommendedIds = await generateAppRecommendations(audience);
        const newRecommendedApps = allApps.filter(app => recommendedIds.includes(app.id));
        setRecommendedApps(newRecommendedApps.length > 0 ? newRecommendedApps : allApps);
      } catch (e) {
        console.error("Failed to get AI recommendations:", e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        setRecommendedApps(allApps); // Fallback on error
      } finally {
        setIsRecommendationLoading(false);
      }
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [audience, audienceMode]);

  const handleGenerate = async (topic: string) => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setLoadingMessage("🧠 Generating viral video ideas...");
    setError(null);
    setVideoIdeas([]);
    setView('generated');

    try {
      const audienceToSubmit = audience === 'all' ? '' : audience;
      const ideas = await generateVideoIdeas(topic, mode, audienceToSubmit);
      setVideoIdeas(ideas);
    // FIX: Add missing curly braces to the catch block to fix syntax error.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleSaveIdea = (idea: VideoIdea) => {
    const updatedIdeas = saveIdea(idea);
    setSavedIdeas(updatedIdeas);
  };

  const handleRemoveIdea = (idea: VideoIdea) => {
    const updatedIdeas = removeIdea(idea);
    setSavedIdeas(updatedIdeas);
  };

  const updateIdeaInState = (updatedIdea: VideoIdea, updateData: Partial<VideoIdea>) => {
    const finalIdea = { ...updatedIdea, ...updateData };
    
    const updateList = (list: VideoIdea[]) => list.map(idea => idea.title === finalIdea.title ? finalIdea : idea);

    setVideoIdeas(current => updateList(current));
    
    if (savedIdeasMap.has(finalIdea.title)) {
        const updatedSavedIdeas = updateList(savedIdeas);
        setSavedIdeas(updatedSavedIdeas);
        // Persist the full updated idea to localStorage
        saveIdea(finalIdea);
    }
    
    setExpandingIdea(finalIdea); // Keep modal updated with new data
  };

  const handleRepurpose = async (idea: VideoIdea) => {
    const content = await repurposeVideoIdea(idea);
    updateIdeaInState(idea, { repurposed: content });
  };
  
  const handleGenerateThumbnails = async (idea: VideoIdea) => {
    const thumbnails = await generateThumbnailIdeas(idea);
    updateIdeaInState(idea, { thumbnails });
  };
  
  const handleGenerateScript = async (idea: VideoIdea, isFaceless: boolean, scriptLength: string, customLength: string, scriptTemplate: ScriptTemplateId) => {
    const script = await generateScript(idea, false, isFaceless, scriptLength, customLength, scriptTemplate);
    updateIdeaInState(idea, { script });
  };

  const handleGenerateThumbnailImage = async (idea: VideoIdea, thumbnailIndex: number) => {
    if (!idea.thumbnails || !idea.thumbnails[thumbnailIndex]) return;

    try {
      const targetThumbnail = idea.thumbnails[thumbnailIndex];
      const imageUrl = await generateThumbnailImage(targetThumbnail, false);
      
      const updatedThumbnails = idea.thumbnails.map((thumb, index) => 
        index === thumbnailIndex ? { text: thumb.text, style: thumb.style, imageUrl } : thumb
      );
      updateIdeaInState(idea, { thumbnails: updatedThumbnails });

    } catch (e) {
      let errorMessage = "Image generation failed. Please try again.";
      if (e instanceof Error && e.message === 'IMAGE_QUOTA_EXCEEDED') {
          errorMessage = "Quota exceeded. Use your own API key in Settings for unlimited access.";
      }
      const updatedThumbnails = idea.thumbnails.map((thumb, index) => 
        index === thumbnailIndex ? { ...thumb, imageUrl: undefined, error: errorMessage } : thumb
      );
      updateIdeaInState(idea, { thumbnails: updatedThumbnails });
    }
  };

  const handleRetryThumbnailImage = async (idea: VideoIdea, thumbnailIndex: number) => {
    if (!idea.thumbnails || !idea.thumbnails[thumbnailIndex]) return;

    // Immediately clear error and old image for better UX
    const clearedThumbnails = idea.thumbnails.map((thumb, index) => 
      index === thumbnailIndex ? { text: thumb.text, style: thumb.style } : thumb
    );
    updateIdeaInState(idea, { thumbnails: clearedThumbnails });

    try {
      const targetThumbnail = clearedThumbnails[thumbnailIndex];
      const imageUrl = await generateThumbnailImage(targetThumbnail, true); // isRetry = true
      
      const updatedThumbnails = clearedThumbnails.map((thumb, index) => 
        index === thumbnailIndex ? { ...thumb, imageUrl } : thumb
      );
      updateIdeaInState(idea, { thumbnails: updatedThumbnails });

    } catch (e) {
      let errorMessage = "Image generation failed. Please try again.";
      if (e instanceof Error && e.message === 'IMAGE_QUOTA_EXCEEDED') {
           errorMessage = "Quota exceeded. Use your own API key in Settings for unlimited access.";
      }
      const updatedThumbnails = clearedThumbnails.map((thumb, index) => 
        index === thumbnailIndex ? { ...thumb, error: errorMessage } : thumb
      );
      updateIdeaInState(idea, { thumbnails: updatedThumbnails });
    }
  };

  const handleRegenerateAll = async (idea: VideoIdea, isFaceless: boolean, scriptLength: string, customLength: string, scriptTemplate: ScriptTemplateId) => {
    const [repurposed, thumbnails, script] = await Promise.all([
        repurposeVideoIdea(idea, true),
        generateThumbnailIdeas(idea, true),
        generateScript(idea, true, isFaceless, scriptLength, customLength, scriptTemplate),
    ]);
    // Clear any previously generated images from the old thumbnail ideas
    const thumbnailsWithoutImages = thumbnails.map(({ text, style }) => ({ text, style }));
    updateIdeaInState(idea, { repurposed, thumbnails: thumbnailsWithoutImages, script });
  };

  const handleKeywordResearch = async (topic: string): Promise<KeywordResearchResult[]> => {
    // This function simply calls the service and returns the data or throws an error.
    // The modal will handle its own loading and error states.
    return await researchKeywords(topic, youtubeChannel);
  };

  const handleSetYoutubeChannel = (handle: string) => {
    const sanitizedHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    if (sanitizedHandle === '@') {
        saveYoutubeChannelHandle(''); // Clear if only '@' is left
        setYoutubeChannel(null);
    } else {
        saveYoutubeChannelHandle(sanitizedHandle);
        setYoutubeChannel(sanitizedHandle);
    }
  };

  const getCurrentModeInfo = (): { label: string; description: string } => {
    for (const group of modeGroups) {
      const foundMode = group.modes.find(m => m.id === mode);
      if (foundMode) return { label: foundMode.label, description: foundMode.description };
    }
    const defaultDescription = "Generate endless, viral-ready, educational video ideas that help Shopify merchants boost their sales with Avada Commerce's apps.";
    return { label: 'General', description: defaultDescription };
  };

  const { label: currentModeLabel, description: currentModeDescription } = getCurrentModeInfo();

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <div className="relative isolate overflow-hidden flex-grow">
        <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute top-0 left-0 -z-10 h-64 w-64 bg-purple-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 -z-10 h-64 w-64 bg-blue-500/20 blur-[100px] rounded-full"></div>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <Header
            activeView={view}
            onViewChange={setView}
            savedIdeasCount={savedIdeas.length}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            modeDescription={currentModeDescription}
          />

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mt-8">
            <aside className="w-full md:w-80 self-start sticky top-8">
              <ModeSelector
                currentMode={mode}
                onModeChange={setMode}
                disabled={!!loadingMessage}
              />
            </aside>

            <div className="flex-1 min-w-0">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg shadow-purple-900/30 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/40">
                <InputForm
                  onSubmit={handleGenerate}
                  isLoading={!!loadingMessage}
                  audience={audience}
                  onAudienceChange={setAudience}
                  mode={mode}
                  audienceMode={audienceMode}
                  onAudienceModeChange={setAudienceMode}
                />
              </div>

              {loadingMessage && <LoadingSpinner message={loadingMessage} />}
              {error && <p className="text-center text-red-400 mt-8">{error}</p>}

              {!loadingMessage && view === 'generated' && videoIdeas.length > 0 && (
                <ResultsDisplay
                  title="Your Video Ideas"
                  ideas={videoIdeas}
                  savedIdeasMap={savedIdeasMap}
                  onSave={handleSaveIdea}
                  onRemove={handleRemoveIdea}
                  onExpand={setExpandingIdea}
                />
              )}

              {!loadingMessage && view === 'generated' && videoIdeas.length === 0 && !error && (
                <EmptyState modeLabel={currentModeLabel} />
              )}

              {!loadingMessage && view === 'saved' && (
                 <ResultsDisplay
                  title="Your Saved Ideas"
                  ideas={savedIdeas}
                  savedIdeasMap={savedIdeasMap}
                  onSave={handleSaveIdea}
                  onRemove={handleRemoveIdea}
                  onExpand={setExpandingIdea}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer recommendedApps={recommendedApps} isLoading={isRecommendationLoading} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
      {expandingIdea && (
        <ExpandIdeaModal 
          isOpen={!!expandingIdea}
          onClose={() => setExpandingIdea(null)}
          idea={expandingIdea}
          onRepurpose={handleRepurpose}
          onGenerateThumbnails={handleGenerateThumbnails}
          onGenerateScript={handleGenerateScript}
          onGenerateThumbnailImage={handleGenerateThumbnailImage}
          onRetryThumbnailImage={handleRetryThumbnailImage}
          onRegenerateAll={handleRegenerateAll}
          onKeywordResearch={handleKeywordResearch}
          recommendedApps={recommendedApps}
          onOpenSettings={() => setIsApiKeyModalOpen(true)}
          youtubeChannel={youtubeChannel}
          onConnectYoutubeChannel={handleSetYoutubeChannel}
        />
      )}
      <BackToTopButton />
    </div>
  );
};

export default App;