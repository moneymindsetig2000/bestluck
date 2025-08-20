import React, { useState, useEffect } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import PromptInput from '../components/chat/PromptInput';
import { ChatGptIcon, GeminiIcon, DeepSeekIcon, PerplexityIcon, ClaudeIcon } from '../components/chat/ModelIcons';
import ResponseWithCitations from '../components/chat/ResponseWithCitations';

declare global {
  interface Window {
    puter: any;
  }
}

interface ModelConfig {
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  puterModel?: string;
}

interface Source {
  title: string;
  url: string;
}

interface Response {
  prompt: string;
  answer: string;
  sources?: Source[];
}

const initialModels: ModelConfig[] = [
  { name: 'ChatGPT', icon: <ChatGptIcon />, enabled: true, puterModel: 'openrouter:openai/gpt-4.1' },
  { name: 'Gemini', icon: <GeminiIcon />, enabled: true, puterModel: 'openrouter:google/gemini-2.5-flash' },
  { name: 'DeepSeek', icon: <DeepSeekIcon />, enabled: true, puterModel: 'openrouter:deepseek/deepseek-chat-v3-0324' },
  { name: 'Perplexity', icon: <PerplexityIcon />, enabled: true, puterModel: 'openrouter:perplexity/sonar' },
  { name: 'Claude', icon: <ClaudeIcon />, enabled: true, puterModel: 'openrouter:anthropic/claude-sonnet-4' },
];

const UserIcon = () => (
  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  </div>
);


const renderWithMarkdown = (text: string | undefined) => {
  if (!text) return null;
  // Simple parser for **bold** text.
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const LoginOverlay: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
    <div className="bg-[#171717] p-8 rounded-2xl border border-zinc-800 text-center max-w-sm shadow-lg animate-fade-in">
        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#272727]">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="14" cy="14" rx="12" ry="5" transform="rotate(45 14 14)" stroke="url(#g1_login)" strokeWidth="2.5"/>
              <ellipse cx="14" cy="14" rx="12" ry="5" transform="rotate(-45 14 14)" stroke="url(#g2_login)" strokeWidth="2.5"/>
              <defs>
                <linearGradient id="g1_login" x1="2" y1="14" x2="26" y2="14" gradientUnits="userSpaceOnUse"><stop stopColor="#67E8F9"/><stop offset="1" stopColor="#0891B2"/></linearGradient>
                <linearGradient id="g2_login" x1="2" y1="14" x2="26" y2="14" gradientUnits="userSpaceOnUse"><stop stopColor="#34D399"/><stop offset="1" stopColor="#059669"/></linearGradient>
              </defs>
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to AI Fiesta</h2>
        <p className="text-zinc-400 mb-6">
            To start chatting with all AIs at once, please connect your Puter account. This is a one-time step for security.
        </p>
        <button
            onClick={onLogin}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 relative overflow-hidden text-lg transform hover:-translate-y-0.5 group"
        >
            <span className="relative z-10">Connect and Start Chatting</span>
            <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
    </div>
  </div>
);

const ChatPage: React.FC = () => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>(initialModels);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);

  const checkAuthStatus = async () => {
    if (typeof window.puter?.auth?.isSignedIn !== 'function') {
      console.error("Puter SDK not ready for auth check.");
      setIsSignedIn(false);
      setUser(null);
      return;
    }
    try {
      const signedIn = await window.puter.auth.isSignedIn();
      if (signedIn) {
        // If SDK thinks we are signed in, verify by fetching user data.
        // This protects against stale tokens which cause 401 errors.
        try {
          const currentUser = await window.puter.auth.getUser();
          setUser(currentUser);
          setIsSignedIn(true);
        } catch (getUserError) {
          console.warn("Puter isSignedIn was true, but getUser failed. Treating as logged out.", getUserError);
          setIsSignedIn(false);
          setUser(null);
        }
      } else {
        // User is not signed in.
        setIsSignedIn(false);
        setUser(null);
      }
    } catch (e) {
      console.error("Error checking Puter auth status:", e);
      setIsSignedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Poll for the Puter SDK to be ready instead of using a fixed timeout.
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds timeout
    const interval = setInterval(() => {
        attempts++;
        if (typeof window.puter?.auth?.isSignedIn === 'function') {
            clearInterval(interval);
            checkAuthStatus();
        } else if (attempts > maxAttempts) {
            clearInterval(interval);
            console.error("Puter SDK failed to load in time.");
            setIsSignedIn(false); // Assume not signed in and show login button
        }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (window.puter && window.puter.auth) {
      try {
        await window.puter.auth.signIn();
        await checkAuthStatus();
      } catch (error) {
        console.error("Sign-in process failed or was cancelled.", error);
      }
    }
  };
  
  const handleLogout = async () => {
    if (window.puter && window.puter.auth) {
      try {
        await window.puter.auth.signOut();
        setIsSignedIn(false);
        setUser(null);
      } catch (error) {
        console.error("Sign-out process failed.", error);
      }
    }
  };

  const handleToggleExpand = (modelName: string) => {
    setExpandedModel(prev => (prev === modelName ? null : modelName));
  };

  const handleToggleModelEnabled = (modelName: string) => {
    setModelConfigs(prevConfigs =>
      prevConfigs.map(m =>
        m.name === modelName ? { ...m, enabled: !m.enabled } : m
      )
    );
  };
  
  const streamResponseForModel = async (prompt: string, model: ModelConfig) => {
    if (!model.puterModel) return;

    try {
      const responseStream = await window.puter.ai.chat(prompt, {
        model: model.puterModel,
        stream: true,
      });

      for await (const part of responseStream) {
        if (part?.text) {
          setResponses(prev => {
            const currentResponse = prev[model.name] || { prompt, answer: '', sources: [] };
            return {
              ...prev,
              [model.name]: {
                ...currentResponse,
                answer: currentResponse.answer + part.text,
              },
            };
          });
        }
        if (part?.sources && Array.isArray(part.sources) && part.sources.length > 0) {
          setResponses(prev => {
            const currentResponse = prev[model.name] || { prompt, answer: '', sources: [] };
            const formattedSources = part.sources.map((s: any) => ({
              title: s.title || 'Source',
              url: s.url || s.uri || '#',
            }));
            return {
              ...prev,
              [model.name]: {
                ...currentResponse,
                sources: (currentResponse.sources || []).concat(formattedSources),
              },
            };
          });
        }
      }
    } catch (error) {
      console.error(`Error streaming from ${model.name}:`, error);
      setResponses(prev => {
         const currentResponse = prev[model.name] || { prompt, answer: '' };
         return {
           ...prev,
           [model.name]: {
             ...currentResponse,
             answer: currentResponse.answer + "\n\n[Error: Could not get response.]",
           },
         }
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [model.name]: false }));
    }
  };

  const handleSend = (prompt: string) => {
    if (!isSignedIn) {
        console.warn("Attempted to send prompt while not signed in.");
        handleLogin();
        return;
    }

    let targetModels: ModelConfig[];

    if (expandedModel) {
      const singleModel = modelConfigs.find(m => m.name === expandedModel);
      targetModels = singleModel ? [singleModel] : [];
    } else {
      targetModels = modelConfigs.filter(m => m.enabled && m.puterModel);
    }

    const updatedResponses: Record<string, Response> = {};
    const updatedLoadingStates: Record<string, boolean> = {};

    targetModels.forEach(model => {
        updatedResponses[model.name] = { prompt, answer: '', sources: [] };
        updatedLoadingStates[model.name] = true;
    });

    setResponses(prev => ({...prev, ...updatedResponses}));
    setLoadingStates(prev => ({...prev, ...updatedLoadingStates}));

    targetModels.forEach(model => {
        streamResponseForModel(prompt, model);
    });
  };

  const isAnyModelLoading = Object.values(loadingStates).some(isLoading => isLoading);

  if (isSignedIn === null) {
    return (
      <div className="flex h-screen bg-[#212121] items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#212121] text-white font-sans overflow-hidden relative">
      {isSignedIn === false && <LoginOverlay onLogin={handleLogin} />}
      
      <div className={`flex flex-1 overflow-hidden transition-all duration-300 ${isSignedIn === false ? 'blur-sm pointer-events-none' : ''}`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(p => !p)} 
          user={user}
          onLogout={handleLogout}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex flex-1 overflow-x-auto">
            {modelConfigs.map((model) => {
              const isExpanded = expandedModel === model.name;
              const isCollapsed = expandedModel !== null && !isExpanded;
              
              let widthClass = 'basis-[38%] flex-shrink-0';
              if (isExpanded) {
                widthClass = 'flex-grow basis-1/2'; 
              } else if (isCollapsed) {
                widthClass = 'flex-shrink-0 basis-16';
              }

              return (
                <div 
                  key={model.name} 
                  className={`flex flex-col h-full border-r border-zinc-800 last:border-r-0 transition-all duration-500 ease-in-out ${widthClass}`}
                >
                  <ChatHeader 
                    model={model}
                    isExpanded={isExpanded}
                    isCollapsed={isCollapsed}
                    onToggleExpand={() => handleToggleExpand(model.name)}
                    onToggleEnabled={() => handleToggleModelEnabled(model.name)}
                  />
                  <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'hidden' : 'block'}`}>
                    {responses[model.name] ? (
                      <div className="p-4 space-y-6 text-base">
                        <div className="flex items-start gap-4">
                          <UserIcon />
                          <div className="pt-1 text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
                            {responses[model.name]?.prompt}
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            {model.icon}
                          </div>
                          <div className="pt-1 text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
                            {model.name === 'Perplexity' ? (
                              <ResponseWithCitations 
                                text={responses[model.name]?.answer}
                                sources={responses[model.name]?.sources}
                              />
                            ) : (
                              renderWithMarkdown(responses[model.name]?.answer)
                            )}
                            {loadingStates[model.name] && <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center p-4">
                          <div className="text-center text-zinc-500">
                              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#171717]">
                                  <div className="scale-150">
                                      {model.icon}
                                  </div>
                              </div>
                              <h2 className="text-xl font-semibold text-zinc-300">{model.name}</h2>
                              <p className="mt-1 text-sm">Output will appear here</p>
                          </div>
                      </div>
                    )}
                  </div>
                  {isCollapsed && (
                      <div className="flex-1 overflow-hidden flex items-center justify-center">
                          <div className="scale-125 opacity-80">
                              {model.icon}
                          </div>
                      </div>
                  )}
                </div>
              );
            })}
          </main>
          <PromptInput onSend={handleSend} isLoading={isAnyModelLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;