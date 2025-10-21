export type GenerationMode =
  | 'General'
  | 'SEO Tutorial'
  | 'App Deep Dive'
  | 'Success Story'
  | 'Q&A / Myth Busting'
  | 'Pain Point Agitator'
  | 'Competitive Angle'
  | 'Comparison'
  | 'Feature Update'
  | 'Seasonal Hooks';

export interface BlogSection {
  heading: string;
  points: string[];
}

export interface BlogPost {
  title: string;
  introduction: string;
  sections: BlogSection[];
  conclusion: string;
}

export interface RepurposedContent {
  blog: BlogPost | string; // Support both object and string for backward compatibility
  tiktok: string;
}

export interface ThumbnailSuggestion {
  text: string;
  style: string;
  imageUrl?: string;
  error?: string;
}

export interface ScriptScene {
  scene: number;
  timestamp: string;
  visuals: string;
  dialogue: string;
}

export interface Script {
  title: string;
  scenes: ScriptScene[];
}

export type ScriptTemplateId =
  | 'none'
  | 'aida'
  | 'pas'
  | 'listicle'
  | 'tutorial'
  | 'interview'
  | 'myth-busting'
  | 'comparison'
  | 'case-study'
  | 'behind-the-scenes'
  | 'unboxing';

export interface ScriptTemplate {
  id: ScriptTemplateId;
  name: string;
  description: string;
}

export interface KeywordResearchResult {
  keyword: string;
  volume: string;
  difficulty: string;
}

export interface ChannelAnalysis {
  mainTopics: string[];
  targetAudience: string;
  contentStrategySuggestion: string;
}

export interface VideoIdea {
  title: string;
  hook: string;
  keyPoints: string[];
  visuals: string;
  keywords: string;
  cta: string;
  repurposed?: RepurposedContent;
  thumbnails?: ThumbnailSuggestion[];
  script?: Script;
}

export interface AppInfo {
  id: string;
  name: string;
  url: string;
  tags: string[];
}