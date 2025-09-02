
import React from 'react';

interface PromptInputProps {
  onSend: (prompt: string, images: { mimeType: string; data: string }[]) => void;
  onStop: () => void;
  isLoading: boolean;
  isSignedIn: boolean;
  onImagesChange: (files: File[]) => void;
  isLimitReached?: boolean;
  isFreePlan?: boolean;
}

interface ImageFile {
    dataUrl: string;
    file: File;
}

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// IMPORTANT: Replace this placeholder with your actual Deno Deploy URL.
// Your URL will look something like: https://your-project-name.deno.dev
const BACKEND_URL = "https://backendforai.deno.dev"; 

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


const PromptInput: React.FC<PromptInputProps> = ({ onSend, onStop, isLoading, isSignedIn, onImagesChange, isLimitReached, isFreePlan }) => {
    const [text, setText] = React.useState('');
    const [images, setImages] = React.useState<ImageFile[]>([]);
    const [showComingSoonModal, setShowComingSoonModal] = React.useState(false);
    const [isListening, setIsListening] = React.useState(false);
    const [liveTranscript, setLiveTranscript] = React.useState('');
    const [isRefining, setIsRefining] = React.useState(false);

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const recognitionRef = React.useRef<any>(null);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);
    const animationFrameIdRef = React.useRef<number | null>(null);
    const silenceTimeoutRef = React.useRef<number | null>(null);
    const liveTranscriptRef = React.useRef('');
    
    // This effect hook centralizes the textarea resizing logic.
    // It runs whenever the `text` state changes, from any source.
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height to correctly calculate scrollHeight
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        // Resizing logic is now handled by the useEffect hook.
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
            // Resizing logic is now handled by the useEffect hook.
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

            const filesToProcess = isFreePlan ? [files[0]] : files;

            filesToProcess.forEach(file => {
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    if (loadEvent.target?.result) {
                        newImageFiles.push({ dataUrl: loadEvent.target.result as string, file });
                    }
                    processedCount++;
                    if (processedCount === filesToProcess.length) {
                        const updatedImages = isFreePlan ? newImageFiles : [...images, ...newImageFiles];
                        setImages(updatedImages);
                        onImagesChange(updatedImages.map(i => i.file));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        if (e.target) {
            e.target.value = '';
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        const updatedImages = images.filter((_, index) => index !== indexToRemove);
        setImages(updatedImages);
        onImagesChange(updatedImages.map(i => i.file));
    };

    const cleanupRecognition = React.useCallback(() => {
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.onresult = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setLiveTranscript('');
    }, []);

    const drawWaveform = React.useCallback(() => {
        if (!analyserRef.current || !canvasRef.current) return;
        const analyser = analyserRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            animationFrameIdRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength);
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                const barHeight = Math.pow(dataArray[i] / 255, 2) * canvas.height;
                ctx.fillStyle = `rgba(45, 212, 191, ${dataArray[i] / 255})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth;
            }
        };
        draw();
    }, []);

    const handleListen = React.useCallback(async () => {
        if (!SpeechRecognition) {
            alert("Speech Recognition is not supported by your browser.");
            return;
        }
        if (isListening) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            setIsListening(true);
            setLiveTranscript('Listening...');
            liveTranscriptRef.current = '';

            const context = new AudioContext();
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            let finalTranscript = '';
            recognition.onresult = (event: any) => {
                if (silenceTimeoutRef.current) {
                    clearTimeout(silenceTimeoutRef.current);
                }

                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                const currentTranscript = (finalTranscript + interimTranscript).trim();
                liveTranscriptRef.current = currentTranscript;
                setLiveTranscript(currentTranscript || 'Listening...');

                silenceTimeoutRef.current = window.setTimeout(() => {
                    if (recognitionRef.current) {
                        recognitionRef.current.stop();
                    }
                }, 1000);
            };

            recognition.onend = () => {
                setText(prev => (prev + ' ' + liveTranscriptRef.current).trim().replace('Listening...', '').trim());
                cleanupRecognition();
            };
            
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setLiveTranscript(`Error: ${event.error}`);
            };

            recognition.start();
            drawWaveform();

        } catch (err) {
            console.error('Error accessing microphone', err);
            setLiveTranscript('Microphone access denied.');
            setIsListening(false);
        }
    }, [isListening, cleanupRecognition, drawWaveform]);

    const handleStopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleCancelRecording = () => {
        cleanupRecognition();
    };

    const handleRefinePrompt = async () => {
        if (!text.trim() || isRefining || isLoading) return;

        setIsRefining(true);
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: 'refinePrompt',
                    prompt: text,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to refine prompt.');
            }

            const data = await response.json();
            if (data.refinedPrompt) {
                setText(data.refinedPrompt);
                // The useEffect hook will handle the resize automatically.
            }
        } catch (error) {
            console.error("Error refining prompt:", error);
            // Optionally: Set an error message to display to the user
        } finally {
            setIsRefining(false);
        }
    };
    
    React.useEffect(() => {
      return () => cleanupRecognition();
    }, [cleanupRecognition]);

    const isDisabled = !isSignedIn || isLoading || isLimitReached;

    return (
        <>
            {showComingSoonModal && <ComingSoonModal onClose={() => setShowComingSoonModal(false)} />}
            <div className="flex-shrink-0 p-4 bg-[#171717] border-t border-zinc-800">
                <div className="relative bg-[#2f2f2f] rounded-xl p-3 shadow-lg border border-zinc-700">
                    {images.length > 0 && !isListening && (
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
                    
                    {!isListening ? (
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
                            disabled={!isSignedIn || isLimitReached || isRefining}
                        />
                    ) : (
                         <div className="w-full flex items-center justify-between gap-3 min-h-[48px] px-1">
                            <button 
                                onClick={handleCancelRecording}
                                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white font-semibold rounded-md transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <div className="relative flex-grow h-12">
                                <canvas ref={canvasRef} width="300" height="48" className="absolute inset-0 w-full h-full"></canvas>
                                <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
                                    <p className="text-zinc-200 text-sm text-center truncate bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">{liveTranscript}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleStopRecording}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md transition-colors text-sm"
                            >
                                Stop
                            </button>
                        </div>
                    )}


                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <button 
                                onClick={() => setShowComingSoonModal(true)}
                                className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-50"
                                disabled={!isSignedIn || isRefining}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                                Generate Image
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple={!isFreePlan}
                                onChange={handleFileChange}
                                disabled={isDisabled || isListening || isRefining}
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-gray-400" disabled={isDisabled || isListening || isRefining}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                                Upload Image
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            {isLoading && !isListening ? (
                                <button 
                                    className="w-8 h-8 flex items-center justify-center bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                    onClick={onStop}
                                    aria-label="Stop generating"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 6h12v12H6z"/>
                                    </svg>
                                </button>
                            ) : !isListening && (
                                <>
                                    <button 
                                        onClick={handleListen} 
                                        className="w-8 h-8 flex items-center justify-center bg-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isDisabled || isRefining}
                                        aria-label="Speech to Text"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
                                    </button>
                                    <button
                                        onClick={handleRefinePrompt}
                                        className="w-8 h-8 flex items-center justify-center bg-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isDisabled || !text.trim() || isRefining}
                                        aria-label="Refine Prompt"
                                    >
                                        {isRefining ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                                        )}
                                    </button>
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed" 
                                        onClick={handleSendClick}
                                        disabled={(!text.trim() && images.length === 0) || !isSignedIn || isLimitReached || isRefining}
                                        aria-label="Send message"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PromptInput;