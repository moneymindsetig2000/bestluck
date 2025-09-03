
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

  // Regex to capture markdown bold (**text**) and full URLs (http://... or https://...)
  // This regex is non-greedy for bold and will capture URLs until it hits a whitespace character.
  const parts = text.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Check for bold markdown
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        
        // Check for URL
        if (part.startsWith('http')) {
          // Clean the URL of any trailing punctuation that might be part of the sentence.
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

        // Render as plain text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

export default ResponseWithCitations;
