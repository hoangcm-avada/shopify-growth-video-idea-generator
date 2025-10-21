import type { VideoIdea, AppInfo } from '../types';

// Declaring the global jspdf object provided by the CDN script
declare const jspdf: any;

const sanitizePdfText = (text: string): string => {
    if (typeof text !== 'string') return '';
    // This function replaces common special characters with their standard equivalents
    // and strips any character that is not a printable ASCII character or a newline/tab.
    // This prevents unsupported characters from causing rendering errors in the PDF.
    return text
        .replace(/’/g, "'")
        .replace(/“|”/g, '"')
        .replace(/—/g, '-')
        .replace(/…/g, '...')
        .replace(/•/g, '- ')
        .replace(/[^\x20-\x7E\n\r\t]/g, '') 
        .trim();
};


export const generatePdfFromIdea = (idea: VideoIdea, recommendedApps: AppInfo[]): void => {
  try {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const MARGIN = 15;
    const FOOTER_HEIGHT = 20; // Reserve 20mm for footer
    let y = MARGIN;
    const page_width = doc.internal.pageSize.getWidth();
    const content_width = page_width - MARGIN * 2;

    // --- Helper Functions ---
    const checkBreak = (height: number) => {
        if (y + height > doc.internal.pageSize.getHeight() - MARGIN - FOOTER_HEIGHT) {
            doc.addPage();
            y = MARGIN;
        }
    };
    
    const addTitle = (text: string) => {
        checkBreak(20);
        doc.setFontSize(20); // Reduced from 22
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(168, 85, 247); // purple-500
        const splitText = doc.splitTextToSize(sanitizePdfText(text), content_width);
        doc.text(splitText, page_width / 2, y, { align: 'center' });
        y += doc.getTextDimensions(splitText).h + 6;
    };
    
    const addSubtitle = (text: string) => {
        checkBreak(15);
        doc.setFontSize(11); // Reduced from 12
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99); // gray-600
        const splitText = doc.splitTextToSize(sanitizePdfText(text), content_width);
        doc.text(splitText, page_width / 2, y, { align: 'center' });
        y += doc.getTextDimensions(splitText).h + 12;
    };

    const addSection = (title: string, body: () => void) => {
        checkBreak(20);
        y += 5;
        doc.setFontSize(15); // Reduced from 16
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55); // gray-800
        doc.text(sanitizePdfText(title), MARGIN, y);
        y += 8;
        doc.setDrawColor(209, 213, 219); // gray-300
        doc.line(MARGIN, y, page_width - MARGIN, y);
        y += 8;
        body();
        y += 10;
    };
    
    const addPara = (text: string) => {
        doc.setFontSize(10); // Reduced from 11
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99); // gray-600
        
        const splitText = doc.splitTextToSize(sanitizePdfText(text), content_width);
        const textHeight = doc.getTextDimensions(splitText).h;
        checkBreak(textHeight);
        doc.text(splitText, MARGIN, y);
        y += textHeight + 4;
    };
    
    const addLabelAndContent = (label: string, content: string, isItalic = false) => {
        doc.setFontSize(10); // Reduced from 11
        doc.setTextColor(75, 85, 99);
        
        const sanitizedLabel = sanitizePdfText(label);
        const sanitizedContent = sanitizePdfText(content);

        // Render label on its own line, bolded.
        doc.setFont('helvetica', 'bold');
        const splitLabel = doc.splitTextToSize(`${sanitizedLabel}:`, content_width);
        const labelHeight = doc.getTextDimensions(splitLabel).h;
        checkBreak(labelHeight + 2);
        doc.text(splitLabel, MARGIN, y);
        y += labelHeight + 1;
        
        // Render content, indented on the next line.
        doc.setFont('helvetica', isItalic ? 'italic' : 'normal');
        const splitContent = doc.splitTextToSize(sanitizedContent, content_width - 5); // Indent content by 5mm
        const contentHeight = doc.getTextDimensions(splitContent).h;
        checkBreak(contentHeight);
        doc.text(splitContent, MARGIN + 5, y);
        y += contentHeight + 4;
    };
    
    // --- PDF Structure ---
    addTitle('Content Expansion Suite');
    addSubtitle(`A full content package for the video idea: "${idea.title}"`);
    
    if (idea.script) {
        addSection(`Script: "${idea.script.title}"`, () => {
            idea.script.scenes.forEach(scene => {
                const sceneVisuals = `Visuals: ${scene.visuals}`;
                const sceneDialogue = `Dialogue: "${scene.dialogue}"`;
                const visualsHeight = doc.getTextDimensions(doc.splitTextToSize(sceneVisuals, content_width - 15)).h;
                const dialogueHeight = doc.getTextDimensions(doc.splitTextToSize(sceneDialogue, content_width - 15)).h;
                checkBreak(visualsHeight + dialogueHeight + 15);
                
                doc.setFontSize(11); // Reduced from 12
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(55, 65, 81);
                doc.text(`Scene ${scene.scene} (${scene.timestamp})`, MARGIN, y);
                y += 6;

                addLabelAndContent('Visuals', scene.visuals);
                addLabelAndContent('Dialogue', `"${scene.dialogue}"`, true);
                y += 2;
            });
        });
    }

    if (idea.thumbnails && idea.thumbnails.length > 0) {
        addSection('Thumbnail Ideas', () => {
            idea.thumbnails.forEach((thumb, i) => {
                addLabelAndContent(`Idea #${i+1} Text`, `"${thumb.text}"`);
                addLabelAndContent(`Idea #${i+1} Style`, thumb.style);
                
                if (thumb.imageUrl) {
                    try {
                        const imageWidth = 128; // mm
                        const aspectRatio = 16 / 9;
                        const imageHeight = imageWidth / aspectRatio; // 72mm
                        
                        checkBreak(imageHeight + 5); 

                        const imageX = (page_width - imageWidth) / 2;
                        
                        doc.addImage(thumb.imageUrl, 'JPEG', imageX, y, imageWidth, imageHeight);
                        y += imageHeight + 5;
                    } catch (e) {
                        console.error(`Failed to add image for thumbnail ${i+1} to PDF:`, e);
                        checkBreak(10);
                        doc.setFont('helvetica', 'italic');
                        doc.setTextColor(255, 0, 0);
                        doc.text('[Image could not be embedded]', MARGIN, y);
                        y += 10;
                    }
                }

                if (i < idea.thumbnails!.length - 1) {
                    y += 6;
                    checkBreak(5);
                    doc.setDrawColor(229, 231, 235); // gray-200
                    doc.setLineWidth(0.5);
                    doc.line(MARGIN, y, page_width - MARGIN, y);
                    y += 6;
                }
            });
        });
    }

    if (idea.repurposed) {
        addSection('Repurposed Content', () => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(55, 65, 81); // gray-700
            doc.text('Blog Post Outline:', MARGIN, y);
            y += 6;
            if (typeof idea.repurposed.blog === 'string') {
                addPara(idea.repurposed.blog);
            } else {
                const blog = idea.repurposed.blog;
                addLabelAndContent('Title', blog.title);
                addLabelAndContent('Introduction', `"${blog.introduction}"`, true);
                blog.sections.forEach(section => {
                    addLabelAndContent(section.heading, section.points.map(p => `- ${p}`).join('\n'));
                });
                addLabelAndContent('Conclusion', blog.conclusion);
            }
            
            y += 4;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(55, 65, 81);
            doc.text('TikTok Idea:', MARGIN, y);
            y += 6;

            // New structured formatting for TikTok script
            const tiktokScript = idea.repurposed.tiktok || '';
            const parts = tiktokScript.split(/(Voiceover:|Text:)/).filter(Boolean);
            if (parts.length > 1) {
                for (let i = 0; i < parts.length; i += 2) {
                    if (parts[i] && parts[i+1]) {
                        const type = parts[i].replace(':', '').trim();
                        const content = parts[i+1].trim();
                        addLabelAndContent(type, content);
                    }
                }
            } else {
                addPara(tiktokScript); // Fallback for unstructured script
            }
        });
    }
    
    // --- End of Content Flow ---
    y += 5;
    checkBreak(25); 
    doc.setDrawColor(209, 213, 219); // gray-300
    doc.line(MARGIN, y, page_width - MARGIN, y);
    y += 8;

    if (recommendedApps && recommendedApps.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 65, 81); // gray-700
        doc.text('Recommended Avada Apps', MARGIN, y);
        y += 7;

        doc.setFontSize(9);
        let currentX = MARGIN;
        const separator = "  |  ";
        const separatorWidth = doc.getTextWidth(separator);

        recommendedApps.forEach((app, index) => {
            const appName = app.name;
            const appNameWidth = doc.getTextWidth(appName);

            if (currentX > MARGIN && currentX + appNameWidth > page_width - MARGIN) {
                y += 6;
                currentX = MARGIN;
                checkBreak(6);
            }
            
            doc.setTextColor(168, 85, 247); // purple-500
            doc.textWithLink(appName, currentX, y, { url: app.url });
            currentX += appNameWidth;
            
            if (index < recommendedApps.length - 1) {
                doc.setTextColor(156, 163, 175); // gray-400
                doc.text(separator, currentX, y);
                currentX += separatorWidth;
            }
        });
    }
    
    // --- PDF Footer on every page ---
    const totalPages = doc.internal.getNumberOfPages();
    const watermarkText = "This document was generated using the Shopify Growth Video Idea Generator.";
    const yearString = new Date().getFullYear() > 2025 ? `2025 - ${new Date().getFullYear()}` : '2025';
    const copyrightText = `© ${yearString} Developed by MrLuke1618. All rights reserved.`;

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const footerY = doc.internal.pageSize.getHeight() - 15;

        // Watermark and Copyright
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0); // Black color
        
        const combinedText = `${watermarkText} ${copyrightText}`;
        const splitText = doc.splitTextToSize(combinedText, content_width);
        const textHeight = doc.getTextDimensions(splitText).h;
        doc.text(splitText, page_width / 2, footerY, { align: 'center' });

        // Page number
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100); // Dark gray
        const pageStr = `Page ${i} of ${totalPages}`;
        doc.text(pageStr, page_width / 2, footerY + textHeight + 2, { align: 'center' });
    }

    const safeTitle = idea.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);
    doc.save(`content-package-${safeTitle}.pdf`);
  } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please check the console for details.");
  }
};