import type { ScriptTemplate } from '../types';

export const scriptTemplates: ScriptTemplate[] = [
    {
        id: 'none',
        name: 'Standard (No Template)',
        description: 'A general, flexible script structure suitable for any topic.'
    },
    {
        id: 'aida',
        name: 'AIDA Framework',
        description: 'A classic marketing script: Grab Attention, build Interest, create Desire, and call to Action.'
    },
    {
        id: 'pas',
        name: 'Problem, Agitate, Solve',
        description: 'Introduce a common Problem, Agitate the pain point, and present the app as the Solution.'
    },
    {
        id: 'listicle',
        name: 'Top X List / Listicle',
        description: 'Structure the video around a numbered list, e.g., "Top 5 SEO Mistakes Shopify Stores Make".'
    },
    {
        id: 'tutorial',
        name: 'Step-by-Step Tutorial',
        description: 'A clear, sequential guide on how to perform a task, like setting up an app or optimizing a product page.'
    },
    {
        id: 'interview',
        name: 'Expert Interview / Q&A',
        description: 'Format the script as a question-and-answer session with a host and an expert (the AI can play both roles).'
    },
    {
        id: 'myth-busting',
        name: 'Myth Busting',
        description: 'Present a common myth about Shopify or SEO, provide evidence to debunk it, and explain the truth.'
    },
    {
        id: 'comparison',
        name: 'Product/Service Comparison',
        description: 'Compare two or more things side-by-side, such as an Avada app vs. a competitor or a manual process.'
    },
    {
        id: 'case-study',
        name: 'Case Study / Success Story',
        description: 'Tell a story of a fictional merchant who used an Avada app to achieve specific, impressive results.'
    },
    {
        id: 'behind-the-scenes',
        name: 'Behind the Scenes',
        description: 'A "day in the life" or "how we built this feature" style video that builds transparency and trust.'
    },
    {
        id: 'unboxing',
        name: 'Feature "Unboxing"',
        description: 'Treat a new app feature like a new product. Explore it for the first time, showing genuine discovery and excitement.'
    }
];
