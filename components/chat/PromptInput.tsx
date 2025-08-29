import React from 'react';

interface PromptInputProps {
  onSend: (prompt: string) => void;
  isLoading: boolean;
  isSignedIn: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSend, isLoading, isSignedIn }) => {
    const [text, setText] = React.useState('');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleSendClick = () => {
        if (text.trim() && !isLoading) {
            onSend(text);
            setText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    return (
        <div className="flex-shrink-0 p-4 bg-[#171717] border-t border-zinc-800">
            <div className="relative bg-[#2f2f2f] rounded-xl p-3 shadow-lg border border-zinc-700">
                <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-48 disabled:opacity-50"
                    placeholder={
                        isSignedIn 
                            ? "Ask me anything..." 
                            : "Please sign in to start chatting..."
                    }
                    rows={1}
                    value={text}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                            Generate Image
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                            Upload Image
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed" 
                            onClick={handleSendClick}
                            disabled={!text.trim() || isLoading}
                            aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptInput;