import React from 'react';
import { XIcon } from './icons/XIcon';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 sticky top-0 bg-gray-800 border-b border-gray-700 z-10 flex justify-between items-center">
          <h2 id="help-modal-title" className="text-2xl font-bold text-purple-400">Welcome to the Idea Generator!</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close help modal"
          >
            <XIcon />
          </button>
        </header>
        <main className="p-6 space-y-8">
          <Section title="🚀 How It Works: Your 4-Step Workflow">
             <ol className="list-decimal list-inside space-y-3 text-gray-300">
                <li><span className="font-semibold text-gray-100">Select a Mode:</span> Choose a content strategy from the sidebar (e.g., <span className="font-mono text-xs bg-gray-700 px-1 py-0.5 rounded">SEO Tutorial</span>) to focus the AI's creativity.</li>
                <li><span className="font-semibold text-gray-100">Enter a Topic:</span> Provide a keyword, use the <span className="text-purple-400 font-bold">Generate Topic with AI</span> button, or pick from one of the six <span className="text-purple-400 font-bold">suggestion bubbles</span> for instant inspiration.</li>
                <li><span className="font-semibold text-gray-100">Define Your Audience:</span> Choose from the preset list, or toggle to <span className="font-mono text-xs bg-gray-700 px-1 py-0.5 rounded">Custom</span> mode to describe them yourself.</li>
                <li><span className="font-semibold text-gray-100">Generate & Expand:</span> Click <span className="text-purple-400 font-bold">Generate Ideas</span>, then use the <span className="text-purple-400 font-bold">Expand Idea</span> button on any card to create scripts, thumbnails, and more.</li>
            </ol>
          </Section>

          <Section title="🧠 Understanding the Generation Modes">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
              <ModeDetail icon="✨" name="General" description="A balanced mix of all content types. Perfect for getting a wide range of ideas." />
              <ModeDetail icon="🛠️" name="SEO Tutorial" description="Generate step-by-step guides and how-to videos for Shopify optimization." />
              <ModeDetail icon="📈" name="Success Story" description="Create narrative-driven content about merchant transformations and achievements." />
              <ModeDetail icon="📣" name="Feature Update" description="Produce timely content about new app features or emerging industry trends." />
              <ModeDetail icon="🤔" name="Comparison" description="Generate ideas that compare different Avada apps or contrast them with alternatives." />
              <ModeDetail icon="🎯" name="Pain Point Agitator" description="Explore a common merchant problem in-depth, then present an Avada app as the solution." />
              <ModeDetail icon="🏆" name="Competitive Angle" description="Position Avada as the superior choice against competitors or traditional methods." />
              <ModeDetail icon="🔬" name="App Deep Dive" description="Create in-depth tutorials and 'hidden feature' showcases for a single Avada app." />
              <ModeDetail icon="📅" name="Seasonal Hooks" description="Frame ideas around holidays and sales events (like BFCM) for timely impact." />
              <ModeDetail icon="❓" name="Q&A / Myth Busting" description="Answer common questions or debunk popular myths to build community trust." />
            </div>
          </Section>
          
          <Section title="🧰 Powerhouse Features">
            <div className="space-y-4">
              <FeatureDetail icon="💾" name="Save & Revisit Ideas">Click <span className="font-mono text-xs bg-gray-700 px-1 py-0.5 rounded">Save Idea</span> on your favorites. Access them anytime in the <span className="font-semibold text-gray-100">"Saved Ideas"</span> tab to keep your content pipeline full.</FeatureDetail>
              <FeatureDetail icon="💥" name="Content Expansion Suite">
                <p className="mb-3 text-gray-300">Don't just get an idea—get a full content package. Click <span className="text-purple-400 font-bold">Expand Idea</span> to open the suite and:</p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-gray-300">
                  <li><span className="font-semibold text-gray-100">YouTube Channel-Aware Analysis:</span> Connect your YouTube channel by entering its handle (e.g., <span className="font-mono text-xs bg-gray-700 px-1 py-0.5 rounded">@MrBeast</span>). Once connected, the AI performs a brief analysis, showing you a summary of your channel's likely topics and audience, plus a strategic content suggestion. This context helps the AI tailor its keyword suggestions specifically to your channel's niche.</li>
                  <li><span className="font-semibold text-gray-100">Repurpose Content:</span> Instantly get suggestions for a detailed blog post and a punchy TikTok video.</li>
                  <li><span className="font-semibold text-gray-100">Design Thumbnails:</span> Generate 3 high-CTR thumbnail concepts with compelling text and style guides.</li>
                  <li><span className="font-semibold text-gray-100">Visualize Thumbnails:</span> Click <span className="text-purple-400 font-bold">Generate Image</span> on a thumbnail idea to create a unique image. Click the generated image to open a full-size preview.</li>
                  <li><span className="font-semibold text-gray-100">Write the Script:</span> Create a complete, scene-by-scene video script. Check the <span className="font-mono text-xs bg-gray-700 px-1 py-0.5 rounded">Faceless video style</span> box for a script tailored for voiceovers.</li>
                  <li><span className="font-semibold text-gray-100">Regenerate & Refine:</span> Click <span className="text-purple-400 font-bold">Regenerate All</span> to get a completely new set of expanded ideas without changing your original concept.</li>
                  <li><span className="font-semibold text-gray-100">Package & Download:</span> Use the <span className="text-purple-400 font-bold">Download as PDF</span> button to get a clean, professional document containing your idea and all its expanded content.</li>
                </ul>
              </FeatureDetail>
              <FeatureDetail icon="🔑" name="Use Your Own API Key">
                The app uses a shared demonstration key, which may have usage limits. For unlimited, reliable access, click the <span className="font-semibold text-gray-100">Settings</span> icon in the top-right corner to add your own free Google AI Studio API key. The <span className="font-semibold text-gray-100">Help</span> and <span className="font-semibold text-gray-100">Feedback</span> icons are also located here for easy access. Your key is stored securely in your browser and never shared.
              </FeatureDetail>
            </div>
          </Section>

          <Section title="✨ Little Details, Big Impact">
             <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                <ModeDetail icon="✏️" name="Smart Placeholders" description="The input box hint changes based on your selected Mode, giving you relevant examples to get started." />
                <ModeDetail icon="💡" name="Dynamic App Footer" description="As you type a custom audience, the footer intelligently updates to recommend the best Avada apps for that merchant." />
                <ModeDetail icon="🏷️" name="Saved Count Badge" description="The red badge on the 'Saved Ideas' tab lets you see how many brilliant ideas you've stored at a glance." />
                <ModeDetail icon="📋" name="Quick Copy & Multiple Exports" description="Instantly copy an idea to your clipboard, or download it in multiple formats (.txt, .md, .json) right from the card." />
                 <ModeDetail icon="📐" name="Clean Header Layout" description="The Settings, Help, and Feedback buttons are neatly stacked in the top-right corner, ensuring a clean, uncluttered look that works perfectly on any device." />
                <ModeDetail icon="⬆️" name="Back To Top" description="Lost in a sea of great ideas? Use the purple arrow button that appears at the bottom-right to zip back to the top." />
             </div>
          </Section>

          <Section title="💡 Pro-Tips for Best Results">
            <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li><span className="font-semibold text-gray-100">Be Specific:</span> Instead of "SEO," try "how to find keywords for a new fashion store." The more detail you give, the better the ideas.</li>
                <li><span className="font-semibold text-gray-100">Connect Your Channel:</span> Always add your YouTube handle in the keyword research tool. The tailored suggestions are a game-changer for finding niche opportunities.</li>
                <li><span className="font-semibold text-gray-100">Experiment with Modes:</span> A "Pain Point Agitator" mode can unearth angles you hadn't considered for a seemingly simple topic.</li>
                <li><span className="font-semibold text-gray-100">Chain Your Actions:</span> Generate ideas, expand your favorite, create a script, then generate a thumbnail image—go from concept to production-ready in minutes.</li>
                <li><span className="font-semibold text-gray-100">Don't Settle on the First Try:</span> Use the <span className="text-purple-400 font-bold">Regenerate All</span> button in the expansion suite to explore multiple creative directions for the same core idea until you find the perfect one.</li>
            </ul>
          </Section>
        </main>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h3 className="text-xl font-semibold text-gray-100 mb-3">{title}</h3>
    <div className="border-t border-gray-700/50 pt-3">{children}</div>
  </section>
);

const ModeDetail: React.FC<{icon: string, name: string, description: string}> = ({ icon, name, description}) => (
    <div className="flex items-start gap-3">
        <span className="text-xl mt-1">{icon}</span>
        <div>
            <h4 className="font-semibold text-gray-200">{name}</h4>
            <p className="text-sm text-gray-300">{description}</p>
        </div>
    </div>
);

const FeatureDetail: React.FC<{icon: string, name: string, children: React.ReactNode}> = ({ icon, name, children}) => (
     <div className="flex items-start gap-3 p-3 bg-gray-900/30 rounded-lg">
        <span className="text-xl mt-1 text-purple-300">{icon}</span>
        <div>
            <h4 className="font-semibold text-gray-200">{name}</h4>
            <div className="text-sm text-gray-300">{children}</div>
        </div>
    </div>
);

export default HelpModal;