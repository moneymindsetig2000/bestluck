import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Singleton promise to ensure the SDK is loaded only once.
let puterSDKPromise: Promise<void> | null = null;

const loadPuterSDK = (): Promise<void> => {
  if (puterSDKPromise) {
    return puterSDKPromise;
  }

  puterSDKPromise = new Promise<void>((resolve, reject) => {
    // If SDK is already available, resolve immediately.
    if (typeof window.puter?.ai?.chat === 'function' && typeof window.puter?.auth?.getUser === 'function') {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;

    // A global timeout for the entire process, including download.
    const globalTimeout = setTimeout(() => {
        reject(new Error("Puter SDK timed out after 30 seconds. This could be due to a slow network connection or an ad-blocker."));
    }, 30000);

    script.onload = () => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (typeof window.puter?.ai?.chat === 'function' && typeof window.puter?.auth?.getUser === 'function') {
                clearInterval(interval);
                clearTimeout(globalTimeout);
                resolve();
            } else if (Date.now() - startTime > 10000) {
                clearInterval(interval);
                clearTimeout(globalTimeout);
                let detailedError = "Puter SDK was downloaded but failed to initialize within 10 seconds. This can be caused by browser extensions (like ad-blockers), corporate firewalls, or a temporary issue with the Puter service. Please try disabling extensions and refreshing the page.";
                 if (window.puter) {
                  detailedError += " The 'puter' object was found, but was incomplete. Some modules might be missing."
                } else {
                  detailedError += " The 'puter' object was not found on the window."
                }
                reject(new Error(detailedError));
            }
        }, 100);
    };

    script.onerror = () => {
        clearTimeout(globalTimeout);
        reject(new Error("Failed to load the Puter SDK script. Please check your network connection and disable any ad-blockers that may be blocking js.puter.com."));
    };

    document.body.appendChild(script);
  });

  return puterSDKPromise;
};

const CHATS_DIR = '/apps/ai-fiesta-clone/chats';

interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
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

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  lastUpdatedAt: string;
}

interface ChatDocument {
  id: string;
  title: string;
  history: Record<string, Response[]>;
  createdAt: string;
  lastUpdatedAt: string;
}

const initialModels: ModelConfig[] = [
  { name: 'ChatGPT', icon: <ChatGptIcon />, enabled: true, puterModel: 'openrouter:openai/gpt-4o' },
  { name: 'Gemini', icon: <GeminiIcon />, enabled: true, puterModel: 'openrouter:google/gemini-flash-1.5' },
  { name: 'DeepSeek', icon: <DeepSeekIcon />, enabled: true, puterModel: 'openrouter:deepseek/deepseek-chat' },
  { name: 'Perplexity', icon: <PerplexityIcon />, enabled: true, puterModel: 'openrouter:perplexity/sonar-pro' },
  { name: 'Claude', icon: <ClaudeIcon />, enabled: true, puterModel: 'openrouter:anthropic/claude-3.7-sonnet' },
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

const LoginModal: React.FC<{ onLogin: () => void; isLoggingIn: boolean; onClose: () => void; }> = ({ onLogin, isLoggingIn, onClose }) => (
  <div className="bg-[#171717] p-8 rounded-2xl border border-zinc-800 text-center max-w-sm shadow-lg animate-fade-in relative">
    <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
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
        To start chatting with all AIs at once, please sign in with your Puter account. This is a one-time step for security.
    </p>
    <button
        onClick={onLogin}
        disabled={isLoggingIn}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 relative overflow-hidden text-lg transform hover:-translate-y-0.5 group disabled:opacity-70 disabled:cursor-wait disabled:transform-none disabled:shadow-none"
    >
        <span className="relative z-10">{isLoggingIn ? 'Connecting...' : 'Connect and Start Chatting'}</span>
         {!isLoggingIn && (
            <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
         )}
    </button>
  </div>
);

const ChatPage: React.FC = () => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>(initialModels);
  const [responses, setResponses] = useState<Record<string, Response[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const prevLoadingStatesRef = useRef<Record<string, boolean>>({});
  
  const saveChat = useCallback(async (userId: string, chatId: string) => {
    if (!userId || !chatId) return;
  
    const currentSession = chatSessions.find(s => s.id === chatId);
    if (!currentSession) return;
  
    const chatDocPath = `${CHATS_DIR}/${chatId}.json`;
    let createdAt = currentSession.createdAt;
    try {
        const blob = await window.puter.fs.read(chatDocPath);
        const existingContent = await blob.text();
        if (existingContent) {
          const existingData = JSON.parse(existingContent);
          createdAt = existingData.createdAt || createdAt;
        }
    } catch (e) {
        // File likely doesn't exist for a new chat, which is fine.
    }

    const dataToSave: ChatDocument = {
      id: chatId,
      title: currentSession.title,
      history: responses,
      createdAt: createdAt,
      lastUpdatedAt: new Date().toISOString(),
    };
  
    try {
      await window.puter.fs.write(chatDocPath, JSON.stringify(dataToSave, null, 2), { createMissingParents: true });
      console.log(`Chat ${chatId} saved to Puter.`);
    } catch (error) {
      console.error("Save to Puter failed", error);
      setDbError("Failed to save chat to Puter.");
    }
  }, [responses, chatSessions]);

  const setupAndLoadChats = useCallback(async (uid: string) => {
    setDbError(null);
    try {
      await window.puter.fs.mkdir(CHATS_DIR, { createMissingParents: true });
      const files = await window.puter.fs.readdir(CHATS_DIR);
      const chatFiles = files.filter((f: any) => f.name.endsWith('.json'));

      if (chatFiles.length === 0) {
        setActiveChatId(null);
        setResponses({});
        setChatSessions([]);
        return;
      }
      
      const sessionsPromises = chatFiles.map(async (file: any) => {
        try {
          const blob = await window.puter.fs.read(`${CHATS_DIR}/${file.name}`);
          const content = await blob.text();
          if (!content) return null;
          const data = JSON.parse(content);
          return {
            id: file.name.replace('.json', ''),
            title: data.title,
            createdAt: data.createdAt,
            lastUpdatedAt: data.lastUpdatedAt,
          };
        } catch (e) {
          console.error(`Failed to read or parse chat file ${file.name}`, e);
          return null;
        }
      });
  
      let sessions = (await Promise.all(sessionsPromises)).filter(Boolean) as ChatSession[];
      sessions.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
      
      setChatSessions(sessions);
  
      if (sessions.length > 0) {
        const mostRecentId = sessions[0].id;
        setActiveChatId(mostRecentId);
        const blob = await window.puter.fs.read(`${CHATS_DIR}/${mostRecentId}.json`);
        const content = await blob.text();
        if (content) {
          const chatData = JSON.parse(content) as ChatDocument;
          setResponses(chatData.history || {});
        } else {
          setResponses({});
        }
      }
    } catch (error) {
      console.error('Failed to load chat sessions from Puter:', error);
      setDbError('Error loading chat history from Puter.');
    }
  }, []);

  const checkAuthState = useCallback(async () => {
    if (typeof window.puter?.auth?.getUser !== 'function') {
        setIsAuthChecking(false);
        console.error("Puter SDK auth module not available.");
        setDbError("Authentication service failed to load. Please refresh.");
        return;
    }
    setIsAuthChecking(true);
    try {
        const puterUser = await window.puter.auth.getUser();
        if (puterUser) {
            setUser({
                uid: puterUser.uid,
                displayName: puterUser.name,
                photoURL: puterUser.avatar,
            });
            await setupAndLoadChats(puterUser.uid);
        } else {
            setUser(null);
            setResponses({});
            setChatSessions([]);
            setActiveChatId(null);
        }
    } catch (error) {
        console.error("Puter auth check failed:", error);
        setDbError("Failed to check authentication status.");
    } finally {
        setIsAuthChecking(false);
    }
  }, [setupAndLoadChats]);
  
  useEffect(() => {
    loadPuterSDK().then(() => {
        checkAuthState();
    }).catch(error => {
        console.error("Puter SDK failed to load:", error);
        alert(error.message);
        setIsAuthChecking(false);
    });
  }, [checkAuthState]);

  useEffect(() => {
    const wasLoading = Object.values(prevLoadingStatesRef.current).some(Boolean);
    const isNowLoading = Object.values(loadingStates).some(Boolean);
    prevLoadingStatesRef.current = loadingStates;

    if (wasLoading && !isNowLoading && user && activeChatId) {
        saveChat(user.uid, activeChatId);
    }
  }, [loadingStates, user, activeChatId, saveChat]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await window.puter.auth.signIn();
      await checkAuthState();
      setShowLoginModal(false);
    } catch (error: any) {
      console.log("Puter sign-in process was not completed:", error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = async () => {
    try {
       await window.puter.auth.signOut();
       setUser(null);
       setResponses({});
       setChatSessions([]);
       setActiveChatId(null);
    } catch (error) {
      console.error("Puter sign-out process failed.", error);
      alert("Sign-out failed. Please try again.");
    }
  };

  const promptLogin = () => {
    setShowLoginModal(true);
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
  
  const createTitleFromPrompt = (prompt: string): string => {
    const words = prompt.split(' ');
    let title = words.slice(0, 5).join(' ');
    if (words.length > 5) {
      title += '...';
    }
    return title.trim() || 'New Chat';
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setResponses({});
    setExpandedModel(null);
  };

  const handleSelectChat = async (chatId: string) => {
    if (chatId === activeChatId || !user) return;
    
    try {
        const blob = await window.puter.fs.read(`${CHATS_DIR}/${chatId}.json`);
        const content = await blob.text();
        if (content) {
            const chatData = JSON.parse(content) as ChatDocument;
            setActiveChatId(chatId);
            setResponses(chatData.history || {});
        } else {
            setActiveChatId(chatId);
            setResponses({});
        }
    } catch (error) {
        console.error(`Failed to load chat ${chatId} from Puter:`, error);
        setDbError(`Could not load chat. An error occurred.`);
    }
  };

  const streamResponseForModel = async (prompt: string, model: ModelConfig) => {
    if (!model.puterModel) return;

    try {
      const responseStream = await window.puter.ai.chat(prompt, {
        model: model.puterModel,
        stream: true,
      });

      for await (const part of responseStream) {
        setResponses(prev => {
          const modelHistory = prev[model.name] ? [...prev[model.name]] : [];
          if (modelHistory.length === 0) return prev;

          const lastResponse = { ...modelHistory[modelHistory.length - 1] };

          if (part?.text) {
            lastResponse.answer += part.text;
          }

          if (part?.sources && Array.isArray(part.sources) && part.sources.length > 0) {
            const formattedSources = part.sources
              .filter((s: any) => s)
              .map((s: any) => ({
                title: s.title || 'Source',
                url: s.url || s.uri || '#',
              }));
            lastResponse.sources = (lastResponse.sources || []).concat(formattedSources);
          }

          modelHistory[modelHistory.length - 1] = lastResponse;
          return { ...prev, [model.name]: modelHistory };
        });
      }
    } catch (error) {
      console.error(`Error streaming from ${model.name}:`, error);
      setResponses(prev => {
         const modelHistory = prev[model.name] ? [...prev[model.name]] : [];
         if (modelHistory.length === 0) return prev;

         const lastResponse = { ...modelHistory[modelHistory.length - 1] };
         lastResponse.answer += "\n\n[Error: Could not get response.]";
         modelHistory[modelHistory.length - 1] = lastResponse;

         return { ...prev, [model.name]: modelHistory };
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [model.name]: false }));
    }
  };

  const handleSend = async (prompt: string) => {
    if (!user) {
        promptLogin();
        return;
    }

    let chatIdToUse = activeChatId;
    const isNewChat = !chatIdToUse;

    if (isNewChat) {
      chatIdToUse = crypto.randomUUID();
      const newTitle = createTitleFromPrompt(prompt);
      const now = new Date().toISOString();
      const newSession: ChatSession = { id: chatIdToUse, title: newTitle, createdAt: now, lastUpdatedAt: now };
      setActiveChatId(chatIdToUse);
      setChatSessions(prev => [newSession, ...prev]);
      setResponses({});
    } else {
      setChatSessions(prev => {
          const current = prev.find(s => s.id === chatIdToUse);
          if (!current) return prev;
          const others = prev.filter(s => s.id !== chatIdToUse);
          const updatedCurrent = { ...current, lastUpdatedAt: new Date().toISOString() };
          return [updatedCurrent, ...others].sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
      });
    }

    const targetModels = expandedModel
      ? modelConfigs.filter(m => m.name === expandedModel && m.puterModel)
      : modelConfigs.filter(m => m.enabled && m.puterModel);
    if (targetModels.length === 0) return;

    setResponses(currentResponses => {
      const responsesForThisChat = isNewChat ? {} : currentResponses;
      const nextResponses = { ...responsesForThisChat };
      targetModels.forEach(model => {
        const history = nextResponses[model.name] || [];
        nextResponses[model.name] = [...history, { prompt, answer: '', sources: [] }];
      });
      return nextResponses;
    });

    const updatedLoadingStates: Record<string, boolean> = {};
    targetModels.forEach(model => {
      updatedLoadingStates[model.name] = true;
    });
    setLoadingStates(updatedLoadingStates);

    targetModels.forEach(model => {
      streamResponseForModel(prompt, model);
    });
  };

  const isAnyModelLoading = Object.values(loadingStates).some(isLoading => isLoading);

  return (
    <div className="flex h-screen bg-[#212121] text-white font-sans overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(p => !p)} 
        user={user}
        onLogout={handleLogout}
        onLogin={promptLogin}
        isAuthChecking={isAuthChecking}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <div 
        className="flex flex-1 flex-col overflow-hidden"
      >
        <main className="flex flex-1 overflow-x-auto">
          {modelConfigs.map((model) => {
            const isExpanded = expandedModel === model.name;
            const isCollapsed = expandedModel !== null && !isExpanded;
            
            let widthClass = 'basis-[35%] flex-shrink-0';
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
                  {responses[model.name] && responses[model.name].length > 0 ? (
                    <div className="p-4 space-y-6 text-base">
                      {responses[model.name].map((exchange, index) => (
                        <React.Fragment key={index}>
                          <div className="flex items-start gap-4">
                            <UserIcon />
                            <div className="flex-1 bg-black/30 rounded-lg p-3 text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
                              {exchange.prompt}
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                              {model.icon}
                            </div>
                            <div className="flex-1 text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
                              {model.name === 'Perplexity' ? (
                                <ResponseWithCitations 
                                  text={exchange.answer}
                                  sources={exchange.sources}
                                />
                              ) : (
                                renderWithMarkdown(exchange.answer)
                              )}
                              {loadingStates[model.name] && index === responses[model.name].length - 1 && <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
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
        {dbError && (
          <div className="flex-shrink-0 p-2 text-center bg-red-900/50 text-red-300 text-sm border-t border-zinc-800">
            {dbError}
          </div>
        )}
        <PromptInput onSend={handleSend} isLoading={isAnyModelLoading} isSignedIn={!!user} />
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <LoginModal onLogin={handleLogin} isLoggingIn={isLoggingIn} onClose={() => setShowLoginModal(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;