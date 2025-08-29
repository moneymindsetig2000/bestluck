import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import PromptInput from '../components/chat/PromptInput';
import { ChatGptIcon, GeminiIcon, DeepSeekIcon, PerplexityIcon, ClaudeIcon, GrokIcon } from '../components/shared/ModelIcons';
import ResponseWithCitations from '../components/chat/ResponseWithCitations';
import { safePuterFs, getChatsDirForUser, getSettingsDirForUser } from '../lib/puterUtils';
import type { Subscription } from '../lib/puterUtils';
import { User } from '../../App';

// IMPORTANT: Replace this placeholder with your actual Deno Deploy URL.
// Your URL will look something like: https://your-project-name.deno.dev
const BACKEND_URL = "https://backendforai.deno.dev"; 

declare global {
  interface Window {
    puter: any;
  }
}

const formatDateTime = (isoString: string) => {
    if (!isoString) return 'Calculating...';
    return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
};

interface ChatPageProps {
  user: User;
  subscription: Subscription;
  setSubscription: React.Dispatch<React.SetStateAction<Subscription | null>>;
  onLogout: () => void;
}

interface ModelConfig {
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface Source {
  title: string;
  url: string;
}

interface ImagePayload {
  mimeType: string;
  data: string;
}

interface Response {
  prompt: string;
  images?: ImagePayload[];
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
  { name: 'ChatGPT', icon: <ChatGptIcon />, enabled: true },
  { name: 'Gemini', icon: <GeminiIcon />, enabled: true },
  { name: 'DeepSeek', icon: <DeepSeekIcon />, enabled: true },
  { name: 'Perplexity', icon: <PerplexityIcon />, enabled: true },
  { name: 'Claude', icon: <ClaudeIcon />, enabled: true },
  { name: 'Grok', icon: <GrokIcon />, enabled: true },
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

const ChatPage: React.FC<ChatPageProps> = ({ user, subscription, setSubscription, onLogout }) => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>(initialModels);
  const [responses, setResponses] = useState<Record<string, Response[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const [dbError, setDbError] = useState<string | null>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<ChatSession | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState('subscription');
  const [notification, setNotification] = useState<string | null>(null);

  const prevLoadingStatesRef = useRef<Record<string, boolean>>({});
  
  const saveChat = useCallback(async (chatId: string) => {
    if (!chatId) return;
  
    const currentPuterUser = await window.puter.auth.getUser();
    if (!currentPuterUser) {
        console.error("Cannot save chat: user not authenticated.");
        setDbError("Could not save chat. Your session may have expired.");
        return;
    }
    
    const userChatsDir = getChatsDirForUser(currentPuterUser);
    if (!userChatsDir || userChatsDir.startsWith('/tmp')) {
        console.error("Cannot save chat: could not determine user directory.");
        return;
    }

    const currentSession = chatSessions.find(s => s.id === chatId);
    if (!currentSession) return;
  
    const chatDocPath = `${userChatsDir}/${chatId}.json`;
    let createdAt = currentSession.createdAt;
    try {
        const blob = await safePuterFs.read(chatDocPath);
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
      // Ensure directory exists before writing. `write` has `createMissingParents`, but an explicit `mkdir` is safer.
      await safePuterFs.mkdir(userChatsDir, { createMissingParents: true });
      await safePuterFs.write(chatDocPath, JSON.stringify(dataToSave, null, 2));
      console.log(`Chat ${chatId} saved to Puter.`);
    } catch (error) {
      console.error("Save to Puter failed", error);
      setDbError("Failed to save chat to Puter.");
    }
  }, [responses, chatSessions]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        setChatSessions([]);
        setActiveChatId(null);
        setResponses({});
        return;
      }
  
      setDbError(null);
      try {
        const currentPuterUser = await window.puter.auth.getUser();
        if (!currentPuterUser || !(currentPuterUser.uuid || currentPuterUser.uid || currentPuterUser.sub)) {
          setDbError("User session expired. Please sign in again.");
          return;
        }

        console.log('Authenticated Puter User for FS:', { uuid: currentPuterUser.uuid, uid: currentPuterUser.uid, sub: currentPuterUser.sub });
        
        // Load Chat History
        const userChatsDir = getChatsDirForUser(currentPuterUser);
        console.log('Resolved chats directory to access:', userChatsDir);
        await safePuterFs.mkdir(userChatsDir, { createMissingParents: true });
        const files = await safePuterFs.readdir(userChatsDir);
        const chatFiles = (Array.isArray(files) ? files : []).filter((f: any) => f && f.name && f.name.endsWith('.json'));
        if (chatFiles.length > 0) {
          const sessionsPromises = chatFiles.map(async (file: any) => {
            try {
              const blob = await safePuterFs.read(`${userChatsDir}/${file.name}`);
              const content = await blob.text();
              if (content) {
                const data = JSON.parse(content) as ChatDocument;
                return {
                  id: data.id,
                  title: data.title,
                  createdAt: data.createdAt,
                  lastUpdatedAt: data.lastUpdatedAt,
                };
              }
              return null;
            } catch (error) {
              console.error(`Failed to load chat session from ${file.name}:`, error);
              return null;
            }
          });
          let sessions = (await Promise.all(sessionsPromises)).filter(Boolean) as ChatSession[];
          sessions.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
          setChatSessions(sessions);
    
          if (sessions.length > 0) {
            const mostRecentId = sessions[0].id;
            setActiveChatId(mostRecentId);
            const blob = await safePuterFs.read(`${userChatsDir}/${mostRecentId}.json`);
            const content = await blob.text();
            if (content) {
              const chatData = JSON.parse(content) as ChatDocument;
              setResponses(chatData.history || {});
            }
          }
        }
      } catch (error: any) {
        console.error('Failed to load initial data from Puter:', error);
        if (error?.code === 'permission_denied' || error?.status === 403) {
          setDbError("Permission denied. Could not access your data. Please try signing out and in again.");
        } else {
          setDbError('Error loading data from Puter.');
        }
      }
    };
    loadInitialData();
  }, [user]);

  useEffect(() => {
    const wasLoading = Object.values(prevLoadingStatesRef.current).some(Boolean);
    const isNowLoading = Object.values(loadingStates).some(Boolean);
    prevLoadingStatesRef.current = loadingStates;

    if (wasLoading && !isNowLoading) {
        if (activeChatId) {
            saveChat(activeChatId);
        }
    }
  }, [loadingStates, activeChatId, saveChat]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
        const currentPuterUser = await window.puter.auth.getUser();
        if (!currentPuterUser) throw new Error("User not authenticated");
        const userChatsDir = getChatsDirForUser(currentPuterUser);

        const blob = await safePuterFs.read(`${userChatsDir}/${chatId}.json`);
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

  const handleInitiateDelete = (session: ChatSession) => {
    setChatToDelete(session);
  };

  const handleDeleteChatConfirm = async () => {
    if (!chatToDelete || !user) return;

    try {
      const currentPuterUser = await window.puter.auth.getUser();
      if (!currentPuterUser) throw new Error("User not authenticated for deletion");
      
      const userChatsDir = getChatsDirForUser(currentPuterUser);
      const chatFilePath = `${userChatsDir}/${chatToDelete.id}.json`;

      await safePuterFs.delete(chatFilePath);

      setChatSessions(prev => prev.filter(s => s.id !== chatToDelete.id));

      if (activeChatId === chatToDelete.id) {
        setActiveChatId(null);
        setResponses({});
      }
    } catch (error) {
      console.error(`Failed to delete chat ${chatToDelete.id}:`, error);
      setDbError("Failed to delete the chat. Please try again.");
    } finally {
      setChatToDelete(null); // Close the modal
    }
  };
  
  const handleImagesChange = (files: File[]) => {
    if (files.length > 0) {
      const deepSeekModel = modelConfigs.find(m => m.name === 'DeepSeek');
      if (deepSeekModel && deepSeekModel.enabled) {
        setModelConfigs(prev => prev.map(m => m.name === 'DeepSeek' ? { ...m, enabled: false } : m));
        setNotification('DeepSeek does not support images and has been disabled.');
      }
    }
  };

  const handleUpgrade = async () => {
    const now = new Date();
    // Set expiry to 30 days from now
    const expiryTimestamp = now.setDate(now.getDate() + 30);
    
    const newSub: Subscription = {
      plan: 'pro',
      expires: expiryTimestamp,
    };

    try {
      const currentPuterUser = await window.puter.auth.getUser();
      if (!currentPuterUser) throw new Error("User not authenticated");
      
      const settingsDir = getSettingsDirForUser(currentPuterUser);
      const subPath = `${settingsDir}/subscription.json`;

      await safePuterFs.write(subPath, JSON.stringify(newSub));
      setSubscription(newSub);
      setNotification('Successfully upgraded to Pro plan!');
    } catch (error) {
      console.error("Failed to upgrade subscription:", error);
      setDbError("An error occurred while upgrading. Please try again.");
    }
  };

  const streamResponseForModel = async (prompt: string, images: ImagePayload[], model: ModelConfig) => {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          images: images,
          modelName: model.name,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedAnswer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedAnswer += chunk;
        
        // Live update the answer as chunks arrive
        setResponses(prev => {
          const modelHistory = [...(prev[model.name] || [])];
          if (modelHistory.length === 0) return prev;
          const lastResponseIndex = modelHistory.length - 1;
          modelHistory[lastResponseIndex] = { ...modelHistory[lastResponseIndex], answer: accumulatedAnswer };
          return { ...prev, [model.name]: modelHistory };
        });
      }

      // After stream is complete, do final processing for citations
      let finalAnswer = accumulatedAnswer;
      let finalSources: Source[] | undefined = undefined;

      if (model.name === 'Perplexity') {
          const sourceRegex = /\[(\d+)\]:\s*(.*?)\s*\((https?:\/\/[^\s)]+)\)/g;
          const matches = [...accumulatedAnswer.matchAll(sourceRegex)];
          
          if (matches.length > 0) {
              const sourcesFound: Source[] = [];
              finalAnswer = accumulatedAnswer.replace(sourceRegex, '').trim();
              
              for (const match of matches) {
                  sourcesFound.push({ title: match[2].trim(), url: match[3].trim() });
              }
              finalSources = sourcesFound;
          }
      }

      // Perform a final state update with parsed sources and cleaned answer
      setResponses(prev => {
        const modelHistory = [...(prev[model.name] || [])];
        if (modelHistory.length === 0) return prev;
        const lastResponseIndex = modelHistory.length - 1;
        modelHistory[lastResponseIndex] = { ...modelHistory[lastResponseIndex], answer: finalAnswer, sources: finalSources };
        return { ...prev, [model.name]: modelHistory };
      });

    } catch (error) {
      console.error(`Error streaming response for ${model.name}:`, error);
      const errorMessage = `**Error:** Could not get response from ${model.name}. Please check the backend connection and try again. Is the URL \`${BACKEND_URL}\` correct?`;
      setResponses(prev => {
        const modelHistory = [...(prev[model.name] || [])];
        if (modelHistory.length === 0) return prev;
        
        const lastResponseIndex = modelHistory.length - 1;
        modelHistory[lastResponseIndex] = { ...modelHistory[lastResponseIndex], answer: errorMessage };
        return { ...prev, [model.name]: modelHistory };
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [model.name]: false }));
    }
  };

  const handleSend = async (prompt: string, images: ImagePayload[]) => {
    if (BACKEND_URL.includes("your-project-name")) {
        alert("Backend URL is not configured. Please edit `pages/ChatPage.tsx` and set the `BACKEND_URL` constant to your Deno Deploy URL.");
        return;
    }

    let chatIdToUse = activeChatId;
    const isNewChat = !chatIdToUse;

    if (isNewChat) {
      chatIdToUse = crypto.randomUUID();
      const newTitle = createTitleFromPrompt(prompt || 'Image Query');
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
      ? modelConfigs.filter(m => m.name === expandedModel)
      : modelConfigs.filter(m => m.enabled);
    if (targetModels.length === 0) return;

    setResponses(currentResponses => {
      const responsesForThisChat = isNewChat ? {} : currentResponses;
      const nextResponses = { ...responsesForThisChat };
      targetModels.forEach(model => {
        const history = nextResponses[model.name] || [];
        nextResponses[model.name] = [...history, { prompt, images, answer: '', sources: [] }];
      });
      return nextResponses;
    });

    const updatedLoadingStates: Record<string, boolean> = {};
    targetModels.forEach(model => {
      updatedLoadingStates[model.name] = true;
    });
    setLoadingStates(updatedLoadingStates);

    targetModels.forEach(model => {
      streamResponseForModel(prompt, images, model);
    });
  };

  const isAnyModelLoading = Object.values(loadingStates).some(isLoading => isLoading);
  const isPro = subscription.plan === 'pro';
  const isFree = subscription.plan === 'free';

  return (
    <div className="flex h-screen bg-[#212121] text-white font-sans overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(p => !p)} 
        user={user}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onInitiateDelete={handleInitiateDelete}
        onHelpClick={() => setShowHelpModal(true)}
      />
      <div 
        className="flex flex-1 flex-col overflow-hidden relative"
      >
        <main className="flex flex-1 overflow-x-auto">
          {modelConfigs.map((model) => {
            const isExpanded = expandedModel === model.name;
            const isCollapsed = expandedModel !== null && !isExpanded;
            
            let widthClass = 'basis-[30%] flex-shrink-0';
            if (isExpanded) {
              widthClass = 'flex-grow basis-1/2'; 
            } else if (isCollapsed) {
              widthClass = 'flex-shrink-0 basis-16';
            }

            return (
              <div 
                key={model.name} 
                className={`flex flex-col h-full border-r border-zinc-800 last:border-r-0 transition-all duration-500 ease-in-out min-w-0 ${widthClass}`}
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
                             <div className="flex-1 min-w-0 bg-black/30 rounded-lg p-3 text-zinc-200">
                                {exchange.images && exchange.images.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mb-2">
                                        {exchange.images.map((img, i) => <img key={i} src={`data:${img.mimeType};base64,${img.data}`} alt={`user-upload-${i}`} className="h-24 w-24 object-cover rounded-md" />)}
                                    </div>
                                )}
                                {exchange.prompt && <div className="whitespace-pre-wrap font-sans leading-relaxed break-words">{exchange.prompt}</div>}
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                              {model.icon}
                            </div>
                            <div className="flex-1 min-w-0 text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed break-words">
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
        <PromptInput onSend={handleSend} isLoading={isAnyModelLoading} isSignedIn={!!user} onImagesChange={handleImagesChange} />
         {notification && (
            <div className="absolute bottom-28 right-4 bg-yellow-900/70 backdrop-blur-md border border-yellow-500/40 text-yellow-300 px-4 py-3 rounded-lg shadow-lg animate-fade-in z-20 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.636-1.1 2.142-1.1 2.778 0l5.485 9.5c.636 1.1-.114 2.5-1.389 2.5H4.161c-1.275 0-2.025-1.4-1.389-2.5l5.485-9.5zM9 8a1 1 0 011 1v2a1 1 0 01-2 0V9a1 1 0 011-1zm1 6a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd" />
              </svg>
              <span>{notification}</span>
              <button onClick={() => setNotification(null)} className="absolute -top-1 -right-1 h-5 w-5 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
        )}
      </div>

      {chatToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#171717] p-8 rounded-2xl border border-zinc-800 text-center max-w-sm shadow-lg animate-fade-in relative">
            <h2 className="text-xl font-bold text-white mb-2">Delete Chat?</h2>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete the chat titled "{chatToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setChatToDelete(null)}
                className="px-6 py-2 rounded-full bg-zinc-700 text-white font-semibold hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChatConfirm}
                className="px-6 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#1C1C1C] max-w-4xl w-full h-[600px] rounded-2xl border border-zinc-800 shadow-lg flex overflow-hidden relative">
            <button 
              onClick={() => setShowHelpModal(false)} 
              aria-label="Close" 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-700 z-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Sidebar */}
            <div className="w-1/4 bg-[#171717] p-4 border-r border-zinc-800 flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6 px-2">Settings</h2>
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveSettingTab('subscription')}
                  className={`flex items-center gap-3 w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${activeSettingTab === 'subscription' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  <span>Subscription</span>
                </button>
                <button
                  onClick={() => setActiveSettingTab('account')}
                  className={`flex items-center gap-3 w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${activeSettingTab === 'account' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>Account</span>
                </button>
              </nav>
            </div>
            
            {/* Content */}
            <div className="w-3/4 p-8 overflow-y-auto">
              {activeSettingTab === 'subscription' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Manage Subscription</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Free Plan Card */}
                    <div className={`bg-[#27272a] border-2 ${isFree ? 'border-zinc-500' : 'border-zinc-700'} rounded-xl p-6 flex flex-col relative`}>
                      {isFree && <span className="absolute top-4 right-4 text-xs font-semibold bg-zinc-600 text-zinc-200 px-2 py-1 rounded-full">Current Plan</span>}
                      <h4 className="text-xl font-bold text-white">Free Plan</h4>
                      <p className="text-3xl font-bold text-white mt-2">$0 <span className="text-xl font-medium text-zinc-400">/ month</span></p>
                      <ul className="space-y-3 mt-6 text-zinc-300 text-sm flex-grow">
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Limited AI model access</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Basic message limits</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Standard support</li>
                      </ul>
                      <button disabled className="mt-6 w-full text-center py-3 rounded-lg bg-zinc-700 text-zinc-400 font-semibold cursor-not-allowed">Your Plan</button>
                    </div>
                    {/* Pro Plan Card */}
                    <div className={`bg-[#27272a] border-2 ${isPro ? 'border-green-400/60' : 'border-green-400/30 hover:border-green-400/60'} rounded-xl p-6 flex flex-col transition-colors relative`}>
                      {isPro && <span className="absolute top-4 right-4 text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Current Plan</span>}
                      <h4 className="text-xl font-bold text-white">Pro Plan</h4>
                      <p className="text-3xl font-bold text-white mt-2">₹999 <span className="text-xl font-medium text-zinc-400">/ month</span></p>
                      <ul className="space-y-3 mt-6 text-zinc-300 text-sm flex-grow">
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>All premium AI models</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>400,000 tokens/month</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Prompt enhancement</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Image & Audio features</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Community & Promptbook</li>
                      </ul>
                      <button 
                        onClick={handleUpgrade}
                        disabled={isPro}
                        className="mt-6 w-full text-center bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-0.5 group disabled:bg-none disabled:bg-green-600/50 disabled:text-zinc-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                      >
                          {isPro ? 'Your Current Plan' : 'Upgrade to Pro'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeSettingTab === 'account' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-8">Account Details</h3>
                  
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-5">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'A')}&background=27272a&color=fff&size=64&bold=true`}
                      alt={user.displayName || 'User Avatar'} 
                      className="h-16 w-16 rounded-full flex-shrink-0" 
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xl font-bold text-white truncate">{user.displayName || 'Anonymous User'}</p>
                      <p className="text-sm text-zinc-400 font-mono mt-1 truncate">UID: {user.uid}</p>
                    </div>
                  </div>

                  <div className="mt-10">
                    <h4 className="text-lg font-semibold text-red-500 mb-3">Danger Zone</h4>
                    <div className="bg-zinc-900 border border-red-500/40 rounded-xl p-5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-base">Sign Out</p>
                        <p className="text-sm text-zinc-400 mt-1">You will be returned to the login screen.</p>
                      </div>
                      <button 
                        onClick={onLogout} 
                        className="bg-transparent text-red-400 border border-red-600 px-5 py-2 rounded-lg font-semibold hover:bg-red-600/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ChatPage;