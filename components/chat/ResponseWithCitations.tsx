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
      <span className="text-cyan-400 font-bold cursor-pointer hover:underline">[{number}]</span>
      {showTooltip && (
        <div 
            className="absolute z-10 w-64 p-3 text-sm font-normal text-white bg-zinc-900 rounded-lg shadow-lg border border-zinc-700 transition-opacity duration-300 bottom-full left-1/2 -translate-x-1/2 mb-2"
        >
          <p className="font-semibold text-zinc-300 mb-1 truncate">{source.title}</p>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline break-all block">
            {source.url}
          </a>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-zinc-900"></div>
        </div>
      )}
    </span>
  );
};

const renderMarkdownText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
};

const ResponseWithCitations: React.FC<ResponseWithCitationsProps> = ({ text, sources }) => {
  if (!sources || sources.length === 0) {
    return <>{renderMarkdownText(text)}</>;
  }

  const parts = text.split(/(\[\d+\])/g);

  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/\[(\d+)\]/);
        if (match) {
          const citationNum = parseInt(match[1], 10);
          // Citation numbers are 1-based, array is 0-based
          const source = sources[citationNum - 1];
          if (source) {
            return <Citation key={index} source={source} number={citationNum} />;
          }
        }
        return renderMarkdownText(part);
      })}
    </>
  );
};

export default ResponseWithCitations;