import React from 'react';

interface PromptInputProps {
  onSend: (prompt: string, images: { mimeType: string; data: string }[]) => void;
  isLoading: boolean;
  isSignedIn: boolean;
  onImagesChange: (files: File[]) => void;
  isLimitReached?: boolean;
}

interface ImageFile {
    dataUrl: string;
    file: File;
}

const ComingSoonModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-6 w-full max-w-md text-left transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Coming Soon: AI Image Generation
        </h2>
        <p className="text-zinc-400 mt-3 mb-4">
          We're putting the finishing touches on our powerful new image generation feature. Get ready to:
        </p>
        <ul className="space-y-3 text-zinc-300">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Create stunning, high-quality images from simple text prompts.</span>
          </li>
           <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Bring your creative ideas to life in seconds.</span>
          </li>
           <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Perfect for presentations, social media, or just for fun.</span>
          </li>
        </ul>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-600 hover:bg-zinc-500 text-white font-semibold rounded-md transition-colors"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};


const PromptInput: React.FC<PromptInputProps> = ({ onSend, isLoading, isSignedIn, onImagesChange, isLimitReached }) => {
    const [text, setText] = React.useState('');
    const [images, setImages] = React.useState<ImageFile[]>([]);
    const [showComingSoonModal, setShowComingSoonModal] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleSendClick = () => {
        if ((text.trim() || images.length > 0) && !isLoading && !isLimitReached) {
            const formattedImages = images.map(img => {
                const [meta, base64Data] = img.dataUrl.split(',');
                const mimeType = meta.match(/:(.*?);/)?.[1] || 'application/octet-stream';
                return { mimeType, data: base64Data };
            });
            onSend(text, formattedImages);
            setText('');
            setImages([]);
            onImagesChange([]);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newImageFiles: ImageFile[] = [];
            let processedCount = 0;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    if (loadEvent.target?.result) {
                        newImageFiles.push({ dataUrl: loadEvent.target.result as string, file });
                    }
                    processedCount++;
                    if (processedCount === files.length) {
                        const updatedImages = [...images, ...newImageFiles];
                        setImages(updatedImages);
                        onImagesChange(updatedImages.map(i => i.file));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        // Reset file input to allow selecting the same file again
        if (e.target) {
            e.target.value = '';
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        const updatedImages = images.filter((_, index) => index !== indexToRemove);
        setImages(updatedImages);
        onImagesChange(updatedImages.map(i => i.file));
    };

    const isDisabled = !isSignedIn || isLoading || isLimitReached;

    return (
        <>
            {showComingSoonModal && <ComingSoonModal onClose={() => setShowComingSoonModal(false)} />}
            <div className="flex-shrink-0 p-4 bg-[#171717] border-t border-zinc-800">
                <div className="relative bg-[#2f2f2f] rounded-xl p-3 shadow-lg border border-zinc-700">
                    {images.length > 0 && (
                        <div className="flex gap-3 flex-wrap mb-3 border-b border-zinc-700 pb-3">
                            {images.map((image, index) => (
                                <div key={index} className="relative group flex-shrink-0">
                                    <img src={image.dataUrl} alt={`upload-preview-${index}`} className="h-20 w-20 object-cover rounded-lg" />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                        aria-label="Remove image"
                                        disabled={isDisabled}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-48 disabled:opacity-50"
                        placeholder={
                            isLimitReached
                                ? "Monthly request limit reached."
                                : isSignedIn 
                                ? "Ask me anything, or upload an image..." 
                                : "Please sign in to start chatting..."
                        }
                        rows={1}
                        value={text}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        disabled={isDisabled}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <button 
                                onClick={() => setShowComingSoonModal(true)}
                                className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-50"
                                disabled={!isSignedIn}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                                Generate Image
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                disabled={isDisabled}
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-gray-400" disabled={isDisabled}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                                Upload Image
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed" 
                                onClick={handleSendClick}
                                disabled={(!text.trim() && images.length === 0) || isDisabled}
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
        </>
    );
};

export default PromptInput;