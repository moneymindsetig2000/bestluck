
import React from 'react';

interface ResponseWithCitationsProps {
  text: string;
  sources?: any[]; // Kept for type compatibility
}

// A simple function to render text with **bold** markdown.
const renderMainContent = (content: string) => {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const ResponseWithCitations: React.FC<ResponseWithCitationsProps> = ({ text }) => {
  if (!text) {
    return null;
  }

  // Split the text into the main content and the sources section.
  const sourceSplit = text.split(/\n\s*Sources:/i);
  const mainContent = sourceSplit[0];
  const sourcesText = sourceSplit.length > 1 ? sourceSplit[1] : '';

  // Extract URLs from the sources section.
  const urlRegex = /https?:\/\/[^\s]+/g;
  const foundUrls = sourcesText.match(urlRegex) || [];

  return (
    <>
      {/* Render the main content part */}
      <div className="whitespace-pre-wrap">{renderMainContent(mainContent)}</div>
      
      {/* If sources were found, render them in a list */}
      {foundUrls.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-700/50">
          <h4 className="font-semibold text-zinc-300 mb-2">Sources</h4>
          <ul className="list-none p-0 m-0 space-y-2 text-sm">
            {foundUrls.map((url, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-zinc-500 pt-0.5">&bull;</span>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-cyan-400 hover:underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default ResponseWithCitations;
