import React, { useState } from 'react';

interface Source {
  title: string;
  url: string;
}

interface ResponseWithCitationsProps {
  text: string;
  sources?: Source[];
}

const Citation: React.FC<{ source: Source; number: number }> = ({ source, number }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span 
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
    >
      <a 
        href={source.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-cyan-400 font-bold cursor-pointer hover:underline"
      >
        [{number}]
      </a>
      {showTooltip && (
        <div 
            className="absolute z-10 w-64 p-3 text-sm font-normal text-white bg-zinc-900 rounded-lg shadow-lg border border-zinc-700 transition-opacity duration-300 bottom-full left-1/2 -translate-x-1/2 mb-2"
        >
          <p className="font-semibold text-zinc-300 mb-1 truncate">{source.title}</p>
          <p className="text-cyan-500 break-all block">
            {source.url}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-zinc-900"></div>
        </div>
      )}
    </span>
  );
};

const renderMarkdownText = (text: string | undefined) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
};

const ResponseWithCitations: React.FC<ResponseWithCitationsProps> = ({ text, sources }) => {
  if (!sources || sources.length === 0 || !text) {
    return <>{renderMarkdownText(text)}</>;
  }

  // 1. Create a map from URL to the full source object for easy lookup.
  const urlToSourceInfo = new Map<string, Source>();
  sources.forEach(source => {
    urlToSourceInfo.set(source.url, source);
  });

  // 2. Find all unique URLs in the text and assign them a citation number
  //    if they exist in our verified sources list.
  const urlToCitationNumber = new Map<string, number>();
  let citationCounter = 1;
  
  const urlRegex = /\[(https?:\/\/[^\]]+)\]/g;
  const matches = text.match(urlRegex) || [];
  const uniqueUrlsInText = new Set(matches.map(m => m.slice(1, -1)));

  uniqueUrlsInText.forEach(url => {
    if (urlToSourceInfo.has(url)) {
      urlToCitationNumber.set(url, citationCounter++);
    }
  });

  // If no valid citations were found in the text, render the text as is.
  if (urlToCitationNumber.size === 0) {
    return <>{renderMarkdownText(text)}</>;
  }
  
  // 3. Split the text by the URL pattern and render citations or text parts.
  const parts = text.split(/(\[https?:\/\/[^\]]+\])/g);

  return (
    <>
      {parts.map((part, index) => {
        const urlMatch = part.match(/\[(https?:\/\/[^\]]+)\]/);
        if (urlMatch) {
          const url = urlMatch[1];
          const citationNum = urlToCitationNumber.get(url);
          const sourceInfo = urlToSourceInfo.get(url);
          
          if (citationNum && sourceInfo) {
            return <Citation key={index} source={sourceInfo} number={citationNum} />;
          }
        }
        return renderMarkdownText(part);
      })}
    </>
  );
};

export default ResponseWithCitations;
