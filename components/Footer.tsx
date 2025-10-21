import React from 'react';
import type { AppInfo } from '../types';

interface FooterProps {
    recommendedApps: AppInfo[];
    isLoading: boolean;
}

const Footer: React.FC<FooterProps> = ({ recommendedApps, isLoading }) => {
  const currentYear = new Date().getFullYear();
  const yearString = currentYear > 2025 ? `2025 - ${currentYear}` : '2025';

  return (
    <footer className="w-full bg-gray-950 text-gray-400 py-6">
      <div className="container mx-auto px-4 border-t border-gray-700/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <span className="text-sm font-semibold text-gray-300 mr-3">
             {isLoading ? "Finding recommendations..." : "Recommended:"}
          </span>
          <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 justify-center sm:justify-start">
            {isLoading ? (
               <div className="w-4 h-4 border-2 border-t-purple-400 border-gray-600 rounded-full animate-spin"></div>
            ) : (
                recommendedApps.map((app, index) => (
                <React.Fragment key={app.id}>
                    <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                    aria-label={`Link to ${app.name} on Shopify App Store`}
                    >
                    {app.name}
                    </a>
                    {index < recommendedApps.length - 1 && <span className="text-gray-600 select-none hidden sm:inline">|</span>}
                </React.Fragment>
                ))
            )}
          </div>
        </div>
        <div className="text-center sm:text-right flex-shrink-0 mt-4 sm:mt-0">
            <p className="text-xs text-gray-500">
            © {yearString} Developed by MrLuke1618. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;