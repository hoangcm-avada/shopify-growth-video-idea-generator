import type { VideoIdea } from '../types';

const SAVED_IDEAS_KEY = 'shopify-video-ideas-saved';
const API_KEY_KEY = 'gemini-api-key';
const YOUTUBE_CHANNEL_KEY = 'youtube-channel-handle';

// --- Saved Ideas ---

// Using the title as a unique identifier. This assumes titles are unique.
const getIdeaId = (idea: VideoIdea): string => idea.title;

export const getSavedIdeas = (): VideoIdea[] => {
  try {
    const item = localStorage.getItem(SAVED_IDEAS_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading saved ideas from localStorage', error);
    return [];
  }
};

const persistSavedIdeas = (ideas: VideoIdea[]): void => {
  try {
    localStorage.setItem(SAVED_IDEAS_KEY, JSON.stringify(ideas));
  } catch (error) {
    console.error('Error writing saved ideas to localStorage', error);
  }
};

export const saveIdea = (ideaToSave: VideoIdea): VideoIdea[] => {
  const currentIdeas = getSavedIdeas();
  const ideaExists = currentIdeas.some(idea => getIdeaId(idea) === getIdeaId(ideaToSave));
  
  let newIdeas;
  if (ideaExists) {
    // If idea exists, update it with potentially new data (like generated images/scripts)
    newIdeas = currentIdeas.map(idea => 
      getIdeaId(idea) === getIdeaId(ideaToSave) ? ideaToSave : idea
    );
  } else {
    // If it's a new idea, add it
    newIdeas = [...currentIdeas, ideaToSave];
  }
  
  persistSavedIdeas(newIdeas);
  return newIdeas;
};

export const removeIdea = (ideaToRemove: VideoIdea): VideoIdea[] => {
  const currentIdeas = getSavedIdeas();
  const newIdeas = currentIdeas.filter(idea => getIdeaId(idea) !== getIdeaId(ideaToRemove));
  persistSavedIdeas(newIdeas);
  return newIdeas;
};

export const createSavedIdeasMap = (savedIdeas: VideoIdea[]): Set<string> => {
    return new Set(savedIdeas.map(getIdeaId));
}

// --- API Key ---

export const getCustomApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_KEY);
  } catch (error) {
    console.error('Error reading API key from localStorage', error);
    return null;
  }
};

export const saveCustomApiKey = (apiKey: string): void => {
  try {
    if (apiKey && apiKey.trim()) {
      localStorage.setItem(API_KEY_KEY, apiKey.trim());
    } else {
      localStorage.removeItem(API_KEY_KEY);
    }
  } catch (error) {
    console.error('Error saving API key to localStorage', error);
  }
};

// --- YouTube Channel Handle ---

export const getYoutubeChannelHandle = (): string | null => {
  try {
    return localStorage.getItem(YOUTUBE_CHANNEL_KEY);
  } catch (error) {
    console.error('Error reading YouTube channel handle from localStorage', error);
    return null;
  }
};

export const saveYoutubeChannelHandle = (handle: string): void => {
  try {
    if (handle && handle.trim()) {
      localStorage.setItem(YOUTUBE_CHANNEL_KEY, handle.trim());
    } else {
      localStorage.removeItem(YOUTUBE_CHANNEL_KEY);
    }
  } catch (error) {
    console.error('Error saving YouTube channel handle to localStorage', error);
  }
};