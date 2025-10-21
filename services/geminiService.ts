import { GoogleGenAI, Type } from "@google/genai";
import type { VideoIdea, GenerationMode, RepurposedContent, ThumbnailSuggestion, Script, BlogPost, ScriptTemplateId, KeywordResearchResult, ChannelAnalysis } from '../types';
import { getCustomApiKey } from '../utils/localStorage';
import { scriptTemplates } from '../data/templates';

// This function creates an AI client on-demand with the correct key
const getGenAIClient = () => {
    const customKey = getCustomApiKey();
    const apiKey = customKey || process.env.API_KEY;

    if (!apiKey) {
        // This error will be caught by the calling function and displayed to the user
        throw new Error("API Key not found. Please set your API key in the settings or ensure the default key is available.");
    }

    return new GoogleGenAI({ apiKey });
}

// Utility to remove common markdown characters for cleaner display.
const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  return text.replace(/[*#_`]/g, '').trim();
};

// Helper function to handle JSON parsing safely
const parseJsonResponse = <T>(jsonString: string, context: string): T => {
    try {
        return JSON.parse(jsonString.trim());
    } catch (e) {
        console.error(`Error parsing JSON from ${context}:`, e);
        console.error("Received string:", jsonString);
        throw new Error(`Failed to parse response from AI for ${context}. The response was not valid JSON.`);
    }
};

/**
 * Generates video ideas based on a topic, mode, and audience.
 */
export const generateVideoIdeas = async (topic: string, mode: GenerationMode, audience: string): Promise<VideoIdea[]> => {
    const ai = getGenAIClient();
    const systemInstruction = `You are a viral video strategist for "Avada Commerce", a company that builds Shopify apps to help merchants with SEO, marketing, and sales. Your task is to generate 5 unique, engaging, and educational YouTube video ideas based on a given topic, generation mode, and target audience. The ideas must be directly relevant to Shopify merchants and demonstrate how Avada's apps can solve their problems. The output must be a JSON array of objects.`;
    
    const userPrompt = `
Topic: "${topic}"
Generation Mode: "${mode}"
Target Audience: "${audience || 'All Shopify Merchants'}"

Generate 5 video ideas. For each idea, provide:
- title: A catchy, SEO-friendly YouTube title.
- hook: A strong opening line (first 3-5 seconds) to grab attention.
- keyPoints: An array of 3-5 bullet points covering the main content.
- visuals: Suggestions for b-roll, screen recordings, or graphics.
- keywords: A comma-separated string of relevant keywords and hashtags for YouTube.
- cta: A clear call-to-action, encouraging viewers to try an Avada app.
`;

    const videoIdeaSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            visuals: { type: Type.STRING },
            keywords: { type: Type.STRING },
            cta: { type: Type.STRING },
        },
        required: ['title', 'hook', 'keyPoints', 'visuals', 'keywords', 'cta']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: videoIdeaSchema
            },
        },
    });

    const ideas = parseJsonResponse<VideoIdea[]>(response.text, 'generateVideoIdeas');
    
    return ideas.map(idea => ({
        ...idea,
        title: sanitizeText(idea.title),
        hook: sanitizeText(idea.hook),
        keyPoints: idea.keyPoints.map(sanitizeText),
        visuals: sanitizeText(idea.visuals),
        keywords: sanitizeText(idea.keywords),
        cta: sanitizeText(idea.cta),
    }));
};

/**
 * Repurposes a video idea into a blog post and a TikTok script.
 */
export const repurposeVideoIdea = async (idea: VideoIdea, isRetry: boolean = false): Promise<RepurposedContent> => {
    const ai = getGenAIClient();
    const systemInstruction = `You are a content repurposing expert specializing in Shopify marketing.`;
    let userPrompt = `
Based on the following video idea, create content for two other platforms:
1. A structured blog post outline. It must be a JSON object with keys: "title" (string), "introduction" (string), "sections" (an array of objects, each with "heading" and "points" which is an array of strings), and "conclusion" (string).
2. A punchy, engaging script for a TikTok/YouTube Short as a single string. Use "Voiceover:" and "Text:" labels to structure the script.

Video Idea:
Title: ${idea.title}
Hook: ${idea.hook}
Key Points: ${idea.keyPoints.join(', ')}
CTA: ${idea.cta}

Provide the output as a JSON object with two keys: "blog" and "tiktok".
`;
    
    if (isRetry) {
        userPrompt += "\n\nImportant: This is a retry. Please generate a completely new and different version of the blog post and TikTok script. Be more creative and change the structure or angle from any previous attempt.";
    }

    const blogSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            introduction: { type: Type.STRING },
            sections: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        heading: { type: Type.STRING },
                        points: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['heading', 'points']
                }
            },
            conclusion: { type: Type.STRING }
        },
        required: ['title', 'introduction', 'sections', 'conclusion']
    };

    const repurposedContentSchema = {
        type: Type.OBJECT,
        properties: {
            blog: blogSchema,
            tiktok: { type: Type.STRING, description: "A script for a short-form video (TikTok/Shorts) based on the video idea." }
        },
        required: ['blog', 'tiktok']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: repurposedContentSchema
        },
    });

    const content = parseJsonResponse<RepurposedContent>(response.text, 'repurposeVideoIdea');
    
    // Sanitize all text fields to remove markdown characters
    const sanitizedBlog = typeof content.blog === 'string' 
        ? sanitizeText(content.blog) 
        : {
            title: sanitizeText(content.blog.title),
            introduction: sanitizeText(content.blog.introduction),
            sections: content.blog.sections.map(section => ({
                heading: sanitizeText(section.heading),
                points: section.points.map(sanitizeText),
            })),
            conclusion: sanitizeText(content.blog.conclusion),
        };

    return {
        blog: sanitizedBlog,
        tiktok: sanitizeText(content.tiktok),
    };
};

/**
 * Generates thumbnail ideas for a video.
 */
export const generateThumbnailIdeas = async (idea: VideoIdea, isRetry: boolean = false): Promise<ThumbnailSuggestion[]> => {
    const ai = getGenAIClient();
    const systemInstruction = `You are a YouTube thumbnail design expert with a focus on high click-through rates (CTR) for a business/tech audience.`;
    let userPrompt = `
For the video titled "${idea.title}", generate 3 distinct and compelling thumbnail concepts.
For each concept, provide:
- text: The short, punchy text to display on the thumbnail.
- style: A brief description of the visual style (e.g., "Bold text, contrasting colors, an intriguing graphic").

Output a JSON array of objects.
`;

    if (isRetry) {
        userPrompt += "\n\nImportant: This is a retry. Please generate 3 completely new and different thumbnail concepts. Use different text, styles, and psychological triggers than any previous attempt.";
    }

    const thumbnailSuggestionSchema = {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING },
            style: { type: Type.STRING }
        },
        required: ['text', 'style']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: thumbnailSuggestionSchema
            },
        },
    });

    const suggestions = parseJsonResponse<ThumbnailSuggestion[]>(response.text, 'generateThumbnailIdeas');

    return suggestions.map(suggestion => ({
        ...suggestion,
        text: sanitizeText(suggestion.text),
        style: sanitizeText(suggestion.style),
    }));
};

/**
 * Generates a video script from an idea.
 */
export const generateScript = async (idea: VideoIdea, isRetry: boolean = false, isFaceless: boolean = false, lengthOption: string, customLength: string, scriptTemplateId: ScriptTemplateId): Promise<Script> => {
    const ai = getGenAIClient();
    const systemInstruction = `You are a professional scriptwriter who creates clear, concise, and engaging video scripts for a business audience on YouTube.`;
    let userPrompt = `
Write a complete video script based on the following idea.
The script should have a title and be broken down into scenes. Each scene needs a "visuals" description, a "dialogue" line for the speaker, and an estimated "timestamp".
The tone should be educational, encouraging, and professional.
`;

    if (isFaceless) {
      userPrompt += `
Important Style Guideline: The script must be for a "faceless" video. This means:
- The "dialogue" is a voiceover, not spoken by an on-screen person.
- The "visuals" descriptions must be very detailed, specifying screen recordings of the Shopify dashboard, animations, b-roll footage of someone working on a laptop, or stock videos. Avoid any actions that require a person to be on camera.
`;
    }

    let lengthInstruction = '';
    switch (lengthOption) {
        case 'short':
            lengthInstruction = 'The total video duration should be under 5 minutes.';
            break;
        case 'medium':
            lengthInstruction = 'The total video duration should be between 5 and 10 minutes.';
            break;
        case 'long':
            lengthInstruction = 'The total video duration should be over 10 minutes.';
            break;
        case 'custom':
            lengthInstruction = `The total video duration should be exactly ${customLength}.`;
            break;
    }

    let templateInstruction = '';
    if (scriptTemplateId && scriptTemplateId !== 'none') {
        const template = scriptTemplates.find(t => t.id === scriptTemplateId);
        if (template) {
            templateInstruction = `
Script Structure Template: "${template.name}"
This template follows the structure: ${template.description}
Please adhere strictly to this structure when creating the scenes.
`;
        }
    }

    userPrompt += `
${templateInstruction}
${lengthInstruction} The final timestamp should align with this requested video length.

Video Idea:
Title: ${idea.title}
Hook: ${idea.hook}
Key Points: \n- ${idea.keyPoints.join('\n- ')}
Visuals: ${idea.visuals}
CTA: ${idea.cta}

Output a JSON object with a "title" string and a "scenes" array. Each object in the scenes array should have "scene" (number), "timestamp" (string, e.g., "00:15"), "visuals" (string), and "dialogue" (string).
`;

    if (isRetry) {
        userPrompt += "\n\nImportant: This is a retry. Please generate a completely new and different script. Alter the pacing, scene structure, or the speaker's tone from any previous attempt.";
    }

    const scriptSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        scene: { type: Type.INTEGER },
                        timestamp: { type: Type.STRING, description: "Estimated timestamp for the scene, e.g., '00:45'" },
                        visuals: { type: Type.STRING },
                        dialogue: { type: Type.STRING }
                    },
                    required: ['scene', 'timestamp', 'visuals', 'dialogue']
                }
            }
        },
        required: ['title', 'scenes']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: scriptSchema
        },
    });
    
    const script = parseJsonResponse<Script>(response.text, 'generateScript');
    
    return {
        ...script,
        title: sanitizeText(script.title),
        scenes: script.scenes.map(scene => ({
            ...scene,
            timestamp: sanitizeText(scene.timestamp || ''),
            visuals: sanitizeText(scene.visuals),
            dialogue: sanitizeText(scene.dialogue),
        })),
    };
};


/**
 * Generates a thumbnail image from a suggestion.
 */
export const generateThumbnailImage = async (thumbnail: ThumbnailSuggestion, isRetry: boolean): Promise<string> => {
    const ai = getGenAIClient();
    let prompt = `Create a 1280x720 YouTube thumbnail for a business video about Shopify growth and SEO.
Style: ${thumbnail.style}.
The thumbnail must prominently feature the following English text: "${thumbnail.text}".
Ensure all text is clearly visible, easy to read, and does not overlap with other key visual elements, unless creating a "text-behind-character" effect. The language of the text must be English.
The overall design should be highly professional, clean, and eye-catching with high contrast colors.`;
    
    if (isRetry) {
        prompt += "\n\nImportant: This is a retry. Generate a significantly different creative variation. Use a different color palette, font, and overall composition from the previous attempt.";
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });
        
        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Image generation failed to return an image.");
        }
        
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        return imageUrl;
    } catch (error) {
        if (error instanceof Error && (error.message.includes('quota') || error.message.includes('429'))) {
             throw new Error("IMAGE_QUOTA_EXCEEDED");
        }
        console.error("Image generation failed:", error);
        throw new Error("Failed to generate thumbnail image. Please try again.");
    }
};

/**
 * Generates a single topic suggestion based on the current mode and audience.
 */
export const generateTopicSuggestion = async (mode: GenerationMode, audience: string): Promise<string> => {
    const ai = getGenAIClient();
    const systemInstruction = "You are a creative strategist specializing in Shopify and eCommerce. Your goal is to provide a single, compelling, and specific video topic idea.";
    const userPrompt = `
Based on the following criteria, suggest one video topic.
The topic should be a practical problem or question a Shopify merchant might have.

Generation Mode: "${mode}"
Target Audience: "${audience || 'All Shopify Merchants'}"

Return ONLY the topic as a single line of plain text. Do not include quotes, labels, or any other formatting.
Example output: how to improve Shopify site speed with lazy loading
`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
        },
    });

    return sanitizeText(response.text.replace(/^"|"$/g, ''));
};

/**
 * Recommends Avada apps based on a custom audience description.
 */
export const generateAppRecommendations = async (customAudience: string): Promise<string[]> => {
    const ai = getGenAIClient();
    const systemInstruction = `You are a Shopify app consultant for Avada Commerce. Your task is to analyze a custom audience description and recommend the most relevant apps from the provided list. You must return only a JSON array of the app IDs for your recommendations.`;

    const appsInfo = `
- id: "seo-optimizer", name: "Avada SEO Image Optimizer", description: "All-in-one SEO tool for audits, page speed, image optimization, lazy loading, and technical SEO like JSON-LD and sitemaps. Great for improving Google rankings. Best for merchants needing a comprehensive SEO foundation."
- id: "blog-builder", name: "SEO On: AI Blog Post Builder", description: "AI-powered tool to write SEO-friendly blog posts quickly. Helps drive organic traffic through content marketing. Best for merchants focused on building a content strategy."
- id: "product-description", name: "SEO On: AI Product Description", description: "Generates SEO-optimized product descriptions in bulk. Saves time and improves product page conversions. Best for merchants with large catalogs or dropshippers."
- id: "aeo-optimizer", name: "SEO On: AEO optimizer llms.txt", description: "Prepares a store for AI search engines like ChatGPT and Gemini by creating an LLMs.txt file. Improves visibility in conversational AI. Best for forward-thinking merchants wanting to capture AI-driven traffic."
`;

    const userPrompt = `
Based on this list of apps:\n${appsInfo}\n
Which apps are most suitable for the following Shopify merchant audience?
Audience: "${customAudience}"

Return a JSON array containing only the string IDs of the recommended apps. For example: ["seo-optimizer", "product-description"].
If the audience is too generic or unclear, recommend the "seo-optimizer".
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
    });

    return parseJsonResponse<string[]>(response.text, 'generateAppRecommendations');
};

/**
 * Performs keyword research for a given topic.
 */
export const researchKeywords = async (topic: string, youtubeChannelHandle?: string | null): Promise<KeywordResearchResult[]> => {
    const ai = getGenAIClient();
    const systemInstruction = `You are an expert YouTube SEO and keyword research tool. Your task is to provide a list of related keywords, along with estimated search volume and ranking difficulty, based on a primary topic.`;
    
    let channelContext = '';
    if (youtubeChannelHandle) {
        channelContext = `
CRITICAL CONTEXT: You are performing this research for the YouTube channel with the handle "${youtubeChannelHandle}".
You must act as if you have analyzed this channel's content, style, and audience.
Your keyword suggestions should be highly relevant to this specific channel.
The difficulty assessment should be relative to what this channel could realistically rank for, not for a generic new channel.
Look for keyword opportunities that align with their existing content but also offer new avenues for growth within their niche.
`;
    }

    const userPrompt = `
Primary Topic: "${topic}"
${channelContext}
Please generate a list of 10-15 related keywords. For each keyword, provide:
1.  **keyword**: The keyword phrase itself.
2.  **volume**: An estimated monthly search volume. Use categorical, non-numeric labels: "Very High", "High", "Medium", "Low", "Very Low".
3.  **difficulty**: An estimated ranking difficulty for this specific YouTube channel. Use categorical labels: "Hard", "Medium", "Easy".

Provide the output as a JSON array of objects.
`;

    const keywordSchema = {
        type: Type.OBJECT,
        properties: {
            keyword: { type: Type.STRING },
            volume: { type: Type.STRING },
            difficulty: { type: Type.STRING }
        },
        required: ['keyword', 'volume', 'difficulty']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: keywordSchema
            },
        },
    });

    const results = parseJsonResponse<KeywordResearchResult[]>(response.text, 'researchKeywords');

    return results.map(result => ({
        keyword: sanitizeText(result.keyword),
        volume: sanitizeText(result.volume),
        difficulty: sanitizeText(result.difficulty),
    }));
};

/**
 * Analyzes a YouTube channel handle and returns a summary.
 */
export const analyzeYoutubeChannel = async (youtubeChannelHandle: string): Promise<ChannelAnalysis> => {
    const ai = getGenAIClient();
    const systemInstruction = `You are a world-class YouTube channel strategist. Your task is to provide a concise analysis of a YouTube channel based on its handle. You must infer the channel's niche, audience, and suggest a content strategy.`;
    
    const userPrompt = `
Analyze the YouTube channel with the handle: "${youtubeChannelHandle}"

Based on this handle, provide a summary covering:
1.  **mainTopics**: An array of 3-4 main topics or themes the channel likely covers.
2.  **targetAudience**: A brief description of the channel's likely target audience.
3.  **contentStrategySuggestion**: One actionable suggestion for their content strategy to improve engagement or growth.

Provide the output as a single, clean JSON object.
`;

    const analysisSchema = {
        type: Type.OBJECT,
        properties: {
            mainTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            targetAudience: { type: Type.STRING },
            contentStrategySuggestion: { type: Type.STRING }
        },
        required: ['mainTopics', 'targetAudience', 'contentStrategySuggestion']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        },
    });

    const result = parseJsonResponse<ChannelAnalysis>(response.text, 'analyzeYoutubeChannel');

    return {
        mainTopics: result.mainTopics.map(sanitizeText),
        targetAudience: sanitizeText(result.targetAudience),
        contentStrategySuggestion: sanitizeText(result.contentStrategySuggestion),
    };
};