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

const formatDateTime = (timestamp: number) => {
    if (!timestamp) return 'Calculating...';
    return new Date(timestamp).toLocaleString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
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
  const chatEndRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
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

  useEffect(() => {
    // Auto-scroll to the bottom of any chat pane that has new content.
    Object.values(chatEndRefs.current).forEach(el => {
      el?.scrollIntoView({ behavior: "smooth" });
    });
  }, [responses]);

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
      const startDate = Date.now();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
      
      const newSub: Subscription = {
        plan: 'pro',
        requestsUsed: 0,
        requestsLimit: 240, // Pro plan limit
        periodStartDate: startDate,
        periodEndDate: endDate.getTime(),
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

  const streamResponseForModel = (prompt: string, images: ImagePayload[], model: ModelConfig): Promise<void> => {
    return new Promise(async (resolve, reject) => {
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
    
          resolve();

        } catch (error: any) {
          console.error(`Error streaming response for ${model.name}:`, error);
          const errorMessage = `**Error:** Could not get response from ${model.name}. Please check the backend connection and try again. Is the URL \`${BACKEND_URL}\` correct?`;
          setResponses(prev => {
            const modelHistory = [...(prev[model.name] || [])];
            if (modelHistory.length === 0) return prev;
            
            const lastResponseIndex = modelHistory.length - 1;
            modelHistory[lastResponseIndex] = { ...modelHistory[lastResponseIndex], answer: errorMessage };
            return { ...prev, [model.name]: modelHistory };
          });
          reject(error);
        } finally {
          setLoadingStates(prev => ({ ...prev, [model.name]: false }));
        }
    });
  };

  const handleSend = async (prompt: string, images: ImagePayload[]) => {
    if (BACKEND_URL.includes("your-project-name")) {
        alert("Backend URL is not configured. Please edit `pages/ChatPage.tsx` and set the `BACKEND_URL` constant to your Deno Deploy URL.");
        return;
    }
    
    if (subscription && subscription.requestsUsed >= subscription.requestsLimit) {
        setNotification("You have reached your monthly request limit.");
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

    const streamPromises = targetModels.map(model => streamResponseForModel(prompt, images, model));

    try {
        await Promise.all(streamPromises);
        
        // All streams finished, now update subscription
        if (subscription) {
            const newSubState = {
                ...subscription,
                requestsUsed: subscription.requestsUsed + 1,
            };
            setSubscription(newSubState);

            const currentPuterUser = await window.puter.auth.getUser();
            if (currentPuterUser) {
                const settingsDir = getSettingsDirForUser(currentPuterUser);
                const subPath = `${settingsDir}/subscription.json`;
                await safePuterFs.write(subPath, JSON.stringify(newSubState));
            }
        }

    } catch (error) {
        console.error("One or more model streams failed.", error);
    }
  };

  const isAnyModelLoading = Object.values(loadingStates).some(isLoading => isLoading);
  const isPro = subscription?.plan === 'pro';
  const isFree = subscription?.plan === 'free';
  const isLimitReached = subscription && subscription.requestsUsed >= subscription.requestsLimit;

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
                <div 
                  className={`flex-1 overflow-y-auto ${isCollapsed ? 'hidden' : 'block'}`}
                >
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
                      {/* FIX: Ensure ref callback returns void to fix TypeScript error. */}
                      <div ref={el => { chatEndRefs.current[model.name] = el; }} />
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
        {isLimitReached && subscription && (
          <div className="flex-shrink-0 p-2 text-center bg-red-900/50 text-yellow-300 text-sm font-medium">
            You have reached your monthly request limit. Your limit will reset on {formatDateTime(subscription.periodEndDate)}.
          </div>
        )}
        <PromptInput onSend={handleSend} isLoading={isAnyModelLoading} isSignedIn={!!user} onImagesChange={handleImagesChange} isLimitReached={isLimitReached} />
         {notification && (
            <div className="absolute bottom-28 right-4 bg-yellow-900/70 backdrop-blur-md border border-yellow-500/40 text-yellow-300 px-4 py-3 rounded-lg shadow-lg animate-fade-in z-20 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.636-1.1 2.142-1.1 2.778 0l5.482 9.5c.636 1.1.06 2.401-1.389 2.401H4.167c-1.449 0-2.025-1.3-1.389-2.4l5.48-9.5zM9 8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm1 2a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{notification}</span>
            </div>
          )}

        {/* Delete Confirmation Modal */}
        {chatToDelete && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
              <h2 className="text-xl font-bold text-white">Delete Chat?</h2>
              <p className="text-zinc-400 mt-2">Are you sure you want to delete "{chatToDelete.title}"? This action cannot be undone.</p>
              <div className="flex justify-center gap-4 mt-6">
                <button 
                  onClick={() => setChatToDelete(null)}
                  className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteChatConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help & Settings Modal */}
        {showHelpModal && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowHelpModal(false)}>
                <div className="bg-[#171717] border border-zinc-700 rounded-lg shadow-xl w-full max-w-2xl text-left" onClick={(e) => e.stopPropagation()}>
                    <div className="p-5 border-b border-zinc-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Help & Settings</h2>
                        <button onClick={() => setShowHelpModal(false)} className="text-zinc-400 hover:text-white">&times;</button>
                    </div>
                    <div className="flex">
                        <nav className="w-1/3 p-3 border-r border-zinc-700">
                            <ul>
                                <li><button onClick={() => setActiveSettingTab('subscription')} className={`w-full text-left px-3 py-2 rounded-md ${activeSettingTab === 'subscription' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>Subscription</button></li>
                                <li><button onClick={() => setActiveSettingTab('logout')} className={`w-full text-left px-3 py-2 rounded-md ${activeSettingTab === 'logout' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>Log Out</button></li>
                            </ul>
                        </nav>
                        <div className="w-2/3 p-5">
                            {activeSettingTab === 'subscription' && subscription && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Your Plan: <span className="capitalize text-emerald-400">{subscription.plan}</span></h3>
                                    <p className="text-zinc-400 text-sm">Requests used: {subscription.requestsUsed} / {subscription.requestsLimit}</p>
                                    <div className="w-full bg-zinc-700 rounded-full h-2.5 my-2">
                                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{width: `${(subscription.requestsUsed / subscription.requestsLimit) * 100}%`}}></div>
                                    </div>
                                    <p className="text-zinc-500 text-xs">Your plan resets on {formatDateTime(subscription.periodEndDate)}</p>
                                    {isFree && (
                                        <button onClick={handleUpgrade} className="mt-6 w-full text-center bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold px-4 py-2 rounded-md hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                                            Upgrade to Pro (240 Requests/Month)
                                        </button>
                                    )}
                                </div>
                            )}
                             {activeSettingTab === 'logout' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Log Out</h3>
                                    <p className="text-zinc-400 text-sm mb-4">Are you sure you want to log out of your account?</p>
                                    <button onClick={onLogout} className="w-full text-center bg-red-600 text-white font-bold px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;