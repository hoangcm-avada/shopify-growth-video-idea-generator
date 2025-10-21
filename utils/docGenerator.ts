import type { VideoIdea, AppInfo, BlogPost } from '../types';

// Helper to convert BlogPost object to HTML
const blogPostToHtml = (blog: BlogPost | string): string => {
    if (typeof blog === 'string') {
        return `<p>${blog.replace(/\n/g, '<br>')}</p>`;
    }
    let html = `<h4>${blog.title}</h4>`;
    html += `<p><em>"${blog.introduction}"</em></p>`;
    blog.sections.forEach(section => {
        html += `<h5>${section.heading}</h5><ul>`;
        html += section.points.map(p => `<li>${p}</li>`).join('');
        html += `</ul>`;
    });
    html += `<p><strong>Conclusion:</strong> ${blog.conclusion}</p>`;
    return html;
};


export const generateDocFromIdea = (idea: VideoIdea, recommendedApps: AppInfo[]): void => {
    const yearString = new Date().getFullYear() > 2025 ? `2025 - ${new Date().getFullYear()}` : '2025';
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${idea.title}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 40px; }
                h1 { color: #6d28d9; text-align: center; }
                h2 { text-align: center; font-style: italic; color: #555; font-weight: normal; }
                h3 { color: #111; border-bottom: 2px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
                h4 { color: #333; }
                h5 { color: #444; }
                ul { list-style-type: disc; margin-left: 20px; }
                p { margin-bottom: 10px; }
                .script-scene { border-left: 3px solid #eee; padding-left: 15px; margin-bottom: 20px; }
                .thumbnail { margin-bottom: 20px; page-break-inside: avoid; }
                .thumbnail img { max-width: 500px; height: auto; border: 1px solid #ccc; }
                .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 0.8em; color: #777; text-align: center; }
                .footer-text { font-weight: bold; color: #000000; }
                a { color: #6d28d9; text-decoration: none; }

                @page {
                    size: A4;
                    margin: 1in;
                    @bottom-center {
                        content: "Page " counter(page);
                        font-family: Arial, sans-serif;
                        font-size: 10pt;
                        color: #555;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Content Expansion Suite</h1>
            <h2>A full content package for the video idea: "${idea.title}"</h2>
    `;
    
    if (idea.script) {
        htmlContent += `<h3>Script: "${idea.script.title}"</h3>`;
        idea.script.scenes.forEach(scene => {
            htmlContent += `
                <div class="script-scene">
                    <h4>Scene ${scene.scene} (${scene.timestamp})</h4>
                    <p><strong>Visuals:</strong> ${scene.visuals}</p>
                    <p><strong>Dialogue:</strong> <em>"${scene.dialogue}"</em></p>
                </div>
            `;
        });
    }

    if (idea.thumbnails && idea.thumbnails.length > 0) {
        htmlContent += `<h3>Thumbnail Ideas</h3>`;
        idea.thumbnails.forEach((thumb, i) => {
            htmlContent += `
                <div class="thumbnail">
                    <h4>Idea #${i+1}</h4>
                    <p><strong>Text:</strong> "${thumb.text}"</p>
                    <p><strong>Style:</strong> ${thumb.style}</p>
                    ${thumb.imageUrl ? `<p><img src="${thumb.imageUrl}" alt="Thumbnail Idea ${i+1}"></p>` : ''}
                </div>
            `;
        });
    }

    if (idea.repurposed) {
        htmlContent += `<h3>Repurposed Content</h3>`;
        htmlContent += `<h4>Blog Post Outline</h4>`;
        htmlContent += blogPostToHtml(idea.repurposed.blog);
        htmlContent += `<h4>TikTok Idea</h4>`;
        htmlContent += `<p>${idea.repurposed.tiktok.replace(/\n/g, '<br>')}</p>`;
    }

    htmlContent += `<div class="footer">`;
    if (recommendedApps && recommendedApps.length > 0) {
        htmlContent += `<h4>Recommended Avada Apps</h4>`;
        htmlContent += `<p>${recommendedApps.map(app => `<a href="${app.url}" target="_blank">${app.name}</a>`).join(' | ')}</p>`;
    }
    const watermarkText = "This document was generated using the Shopify Growth Video Idea Generator.";
    const copyrightText = `© ${yearString} Developed by MrLuke1618. All rights reserved.`;
    htmlContent += `<p class="footer-text">${watermarkText}<br>${copyrightText}</p>`;
    htmlContent += `</div>`;


    htmlContent += `</body></html>`;

    try {
        // The 'application/msword' MIME type prompts browsers to open the file with Word.
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = idea.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);
        a.download = `content-package-${safeTitle}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to generate DOC:", error);
        alert("An error occurred while generating the DOC file.");
    }
};