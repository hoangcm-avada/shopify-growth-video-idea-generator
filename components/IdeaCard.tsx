import React, { useState } from 'react';
import type { VideoIdea, BlogPost } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckIcon } from './icons/CheckIcon';
import { MarkdownIcon } from './icons/MarkdownIcon';
import { TextFileIcon } from './icons/TextFileIcon';

interface IdeaCardProps {
  idea: VideoIdea;
  index: number;
  isSaved: boolean;
  onSave: (idea: VideoIdea) => void;
  onRemove: (idea: VideoIdea) => void;
  onExpand: (idea: VideoIdea) => void;
}

// Helper to stringify blog post objects for plaintext outputs.
const blogPostToString = (blog: BlogPost | string): string => {
  if (typeof blog === 'string') {
    return blog;
  }
  let content = `Title: ${blog.title}\n\n`;
  content += `Introduction: ${blog.introduction}\n\n`;
  blog.sections.forEach(section => {
    content += `${section.heading}\n`;
    content += `${section.points.map(p => `- ${p}`).join('\n')}\n\n`;
  });
  content += `Conclusion: ${blog.conclusion}`;
  return content;
};

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index, isSaved, onSave, onRemove, onExpand }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const handleSaveClick = () => {
    if (isSaved) {
      onRemove(idea);
    } else {
      onSave(idea);
    }
  };

  const formatIdeaForCopy = (idea: VideoIdea, includeExpansions: boolean = true): string => {
    let output = `Idea #${index + 1}\n\n`;
    output += `🎬 Video Title:\n${idea.title}\n\n`;
    output += `🧩 Hook:\n"${idea.hook}"\n\n`;
    output += `💡 Key Points:\n${idea.keyPoints.map((p, i) => `${i + 1}) ${p}`).join('\n')}\n\n`;
    output += `📈 Visuals/B-roll:\n${idea.visuals}\n\n`;
    output += `🔑 Keywords / Hashtags:\n${idea.keywords}\n\n`;
    output += `🪙 CTA:\n${idea.cta}\n\n`;

    if (includeExpansions) {
        if (idea.repurposed) {
          output += `--- REPURPOSED CONTENT ---\n\n`;
          // FIX: Handle BlogPost object by converting it to a string.
          output += `✍️ Blog Post Idea:\n${blogPostToString(idea.repurposed.blog)}\n\n`;
          output += `📱 TikTok Idea:\n${idea.repurposed.tiktok}\n\n`;
        }
        if (idea.thumbnails) {
          output += `--- THUMBNAIL IDEAS ---\n\n`;
          output += idea.thumbnails.map((t, i) => `Thumbnail ${i+1}:\nText: ${t.text}\nStyle: ${t.style}\n`).join('\n') + `\n`;
        }
        if (idea.script) {
          output += `--- VIDEO SCRIPT ---\n\n`;
          output += `Title: ${idea.script.title}\n\n`;
          output += idea.script.scenes.map(s => `Scene ${s.scene}:\nVisuals: ${s.visuals}\nDialogue: ${s.dialogue}\n`).join('\n');
        }
    }
    return output;
  }
  
  const formatIdeaForMarkdown = (idea: VideoIdea): string => {
    let output = `# Idea #${index + 1}: ${idea.title}\n\n`;
    output += `## 🎬 Video Title\n${idea.title}\n\n`;
    output += `## 🧩 Hook\n> ${idea.hook}\n\n`;
    output += `## 💡 Key Points\n${idea.keyPoints.map(p => `- ${p}`).join('\n')}\n\n`;
    output += `## 📈 Visuals/B-roll\n${idea.visuals}\n\n`;
    output += `## 🔑 Keywords / Hashtags\n\`${idea.keywords}\`\n\n`;
    output += `## 🪙 CTA\n**${idea.cta}**\n\n`;

    if (idea.repurposed || idea.thumbnails || idea.script) {
        output += `---\n\n## Expanded Content\n\n`;
        if (idea.repurposed) {
          // FIX: Handle BlogPost object by formatting it as markdown, and handle string for backward compatibility.
          let blogContent: string;
          if (typeof idea.repurposed.blog === 'object') {
              const blog = idea.repurposed.blog;
              let md = `## ${blog.title}\n\n`;
              md += `*${blog.introduction}*\n\n`;
              blog.sections.forEach(section => {
                  md += `### ${section.heading}\n${section.points.map(p => `- ${p}`).join('\n')}\n\n`;
              });
              md += `**Conclusion:**\n${blog.conclusion}`;
              blogContent = md;
          } else {
              blogContent = idea.repurposed.blog.replace(/(\r\n|\n|\r)/gm, "\n\n");
          }
          const tiktokContent = idea.repurposed.tiktok.replace(/(\r\n|\n|\r)/gm, "\n\n");
          output += `### ✍️ Repurposed for Blog & TikTok\n\n**Blog Post Idea:**\n${blogContent}\n\n**TikTok Idea:**\n${tiktokContent}\n`;
        }
        if (idea.thumbnails) {
          output += `### 🖼️ Thumbnail Ideas\n\n`;
          output += idea.thumbnails.map(t => `- **Text:** ${t.text}\n- **Style:** ${t.style}`).join('\n\n') + `\n\n`;
        }
        if (idea.script) {
           output += `### 📜 Video Script: ${idea.script.title}\n\n`;
           output += idea.script.scenes.map(s => `**Scene ${s.scene}:**\n- **Visuals:** ${s.visuals}\n- **Dialogue:** *${s.dialogue}*`).join('\n\n');
        }
    }
    return output;
  }

  const handleCopyToClipboard = () => {
    const textToCopy = formatIdeaForCopy(idea);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text.');
    });
  };

  const createDownload = (content: string, mimeType: string, extension: string) => {
     try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = idea.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);
      a.download = `video-idea-${safeTitle}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
       console.error(`Failed to download .${extension}: `, error);
       alert(`Failed to download .${extension}.`);
    }
  };

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(idea, null, 2);
    createDownload(jsonString, 'application/json', 'json');
  };
  
  const handleDownloadMd = () => {
    const markdownString = formatIdeaForMarkdown(idea);
    createDownload(markdownString, 'text/markdown', 'md');
  };

  const handleDownloadTxt = () => {
    const textString = formatIdeaForCopy(idea);
    createDownload(textString, 'text/plain', 'txt');
  };
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg shadow-purple-900/30 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-purple-400">Idea #{index + 1}</h3>
          <div className="flex items-center gap-2.5">
            <button onClick={handleCopyToClipboard} className="text-gray-300 hover:text-white transition-colors" title={isCopied ? "Copied!" : "Copy to Clipboard"}>
             {isCopied ? <CheckIcon /> : <ClipboardIcon />}
            </button>
            <button onClick={handleDownloadTxt} className="text-gray-300 hover:text-white transition-colors" title="Download as Text (.txt)">
              <TextFileIcon />
            </button>
            <button onClick={handleDownloadMd} className="text-gray-300 hover:text-white transition-colors" title="Download as Markdown (.md)">
              <MarkdownIcon />
            </button>
            <button onClick={handleDownloadJson} className="text-gray-300 hover:text-white transition-colors" title="Download as JSON">
              <DownloadIcon />
            </button>
            <div className="w-px h-5 bg-gray-600"></div>
            <button
              onClick={handleSaveClick}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                isSaved
                  ? 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              aria-label={isSaved ? 'Unsave this idea' : 'Save this idea'}
            >
              {isSaved ? '✓ Saved' : 'Save Idea'}
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <Item icon="🎬" label="Video Title" content={idea.title} />
          <Item icon="🧩" label="Hook" content={`"${idea.hook}"`} isItalic={true} />
          <Item icon="💡" label="Key Points">
            <ul className="list-disc list-inside text-gray-100 space-y-1 mt-1">
              {idea.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </Item>
          <Item icon="📈" label="Visuals/B-roll" content={idea.visuals} />
          <Item icon="🔑" label="Keywords / Hashtags" content={idea.keywords} isMono={true} />
          <Item icon="🪙"label="CTA" content={idea.cta} />
        </div>
      </div>
      
      <div className="bg-gray-900/40 mt-auto p-4 rounded-b-lg border-t border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
            {idea.repurposed && <span className="text-xs font-bold bg-green-800/50 text-green-300 px-2 py-0.5 rounded-full" title="Repurposed content generated">Blog/TikTok</span>}
            {idea.thumbnails && <span className="text-xs font-bold bg-blue-800/50 text-blue-300 px-2 py-0.5 rounded-full" title="Thumbnails generated">Thumbnails</span>}
            {idea.script && <span className="text-xs font-bold bg-yellow-800/50 text-yellow-300 px-2 py-0.5 rounded-full" title="Script generated">Script</span>}
        </div>
        <button 
          onClick={() => onExpand(idea)} 
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          <SparklesIcon/>
          Expand Idea
        </button>
      </div>
    </div>
  );
};

const Item: React.FC<{icon: string, label: string, content?: string, children?: React.ReactNode, isItalic?: boolean, isMono?: boolean}> = ({icon, label, content, children, isItalic, isMono}) => (
  <div className="flex items-start gap-3">
    <span className="text-xl mt-1" title={label}>{icon}</span>
    <div>
      <p className="font-semibold text-gray-300">{label}</p>
      {content && <p className={`text-gray-100 ${isItalic ? 'italic' : ''} ${isMono ? 'font-mono text-sm' : ''}`}>{content}</p>}
      {children}
    </div>
  </div>
);

export default IdeaCard;
