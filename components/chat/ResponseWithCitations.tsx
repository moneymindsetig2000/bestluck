
import React from 'react';

interface ResponseWithCitationsProps {
  text: string;
  // The sources prop is no longer used by this component but is kept for type compatibility
  // with the ChatPage state, avoiding the need for wider refactoring.
  sources?: any[]; 
}

const ResponseWithCitations: React.FC<ResponseWithCitationsProps> = ({ text }) => {
  if (!text) {
    return null;
  }

  // 1. Separate the main content from the sources list.
  const sourceSplit = text.split(/\n\s*Sources:/i);
  const mainContent = sourceSplit[0];
  const sourcesText = sourceSplit.length > 1 ? sourceSplit[1] : '';

  // 2. Parse the sources list into a map.
  const sourcesMap: { [key: string]: string } = {};
  if (sourcesText) {
    const sourceLines = sourcesText.trim().split('\n');
    const sourceRegex = /\[(\d+)\]\s*(https?:\/\/[^\s]+)/;
    sourceLines.forEach(line => {
      const match = line.match(sourceRegex);
      if (match) {
        sourcesMap[match[1]] = match[2].trim();
      }
    });
  }

  // 3. Regex to capture bold, URLs, and new inline citations `[1]`.
  const parts = mainContent.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+|\[\d+\])/g);

  return (
    <>
      {/* Render main content with inline citations */}
      {parts.map((part, index) => {
        // Handle bold markdown
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        
        // Handle standalone URLs (as a fallback)
        if (part.startsWith('http')) {
          const url = part.replace(/[.,)!?]*$/, '');
          const trailingPunctuation = part.substring(url.length);
          return (
            <React.Fragment key={index}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
                {url}
              </a>
              {trailingPunctuation}
            </React.Fragment>
          );
        }

        // Handle numbered citations like [1], [2], etc.
        const citationMatch = part.match(/^\[(\d+)\]$/);
        if (citationMatch) {
          const number = citationMatch[1];
          const url = sourcesMap[number];
          if (url) {
            return (
              <span key={index} className="relative inline-block group mx-0.5">
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 font-bold text-xs align-super -top-1 relative px-1 bg-zinc-700/50 rounded hover:bg-zinc-700"
                >
                  {number}
                </a>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-zinc-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-zinc-700 shadow-lg break-all">
                  {url}
                </div>
              </span>
            );
          }
        }
        
        // Render as plain text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}

      {/* Render the sources list at the end if it exists */}
      {Object.keys(sourcesMap).length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-700/50">
          <h4 className="font-semibold text-zinc-300 mb-2">Sources</h4>
          <ol className="list-none p-0 m-0 space-y-1 text-sm">
            {Object.entries(sourcesMap).map(([number, url]) => (
              <li key={number} className="text-zinc-400 flex items-start gap-2">
                <span className="text-cyan-400 font-mono text-xs pt-0.5">[{number}]</span>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline break-all">
                  {url}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
};

export default ResponseWithCitations;
