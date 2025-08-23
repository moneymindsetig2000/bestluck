import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import PromptInput from '../components/chat/PromptInput';
import { ChatGptIcon, GeminiIcon, DeepSeekIcon, PerplexityIcon, ClaudeIcon, GrokIcon } from '../components/chat/ModelIcons';
import ResponseWithCitations from '../components/chat/ResponseWithCitations';
import { safePuterFs, getChatsDirForUser } from '../lib/puterUtils';
import { User } from '../../App';

declare global {
  interface Window {
    puter: any;
  }
}

interface ChatPageProps {
  user: User;
  onLogout: () => void;
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
  { name: 'Grok', icon: <GrokIcon />, enabled: true, puterModel: 'openrouter:x-ai/grok-3' },
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

const ChatPage: React.FC<ChatPageProps> = ({ user, onLogout }) => {
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
        
        const userChatsDir = getChatsDirForUser(currentPuterUser);
        console.log('Resolved chats directory to access:', userChatsDir);
        
        await safePuterFs.mkdir(userChatsDir, { createMissingParents: true });
  
        const files = await safePuterFs.readdir(userChatsDir);
        const chatFiles = (Array.isArray(files) ? files : []).filter((f: any) => f && f.name && f.name.endsWith('.json'));
  
        if (chatFiles.length === 0) {
          setActiveChatId(null);
          setResponses({});
          setChatSessions([]);
          return;
        }
  
        const sessionsPromises = chatFiles.map(async (file: any) => {
          try {
            const blob = await safePuterFs.read(`${userChatsDir}/${file.name}`);
            const content = await blob.text();
            if (!content) return null;
            const data = JSON.parse(content);
            return {
              id: file.name.replace('.json', ''),
              title: data.title,
              createdAt: data.createdAt,
              lastUpdatedAt: data.lastUpdatedAt,
            } as ChatSession;
          } catch (e) {
            console.error(`Failed to read/parse chat file ${file.name}`, e);
            return null;
          }
        });
  
        let sessions = (await Promise.all(sessionsPromises)).filter(Boolean) as ChatSession[];
        sessions.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
        setChatSessions(sessions);
  
        if (sessions.length > 0) {
          const mostRecentId = sessions[0].id;
          setActiveChatId(mostRecentId);
          try {
            const blob = await safePuterFs.read(`${userChatsDir}/${mostRecentId}.json`);
            const content = await blob.text();
            if (content) {
              const chatData = JSON.parse(content) as ChatDocument;
              setResponses(chatData.history || {});
            } else {
              setResponses({});
            }
          } catch (readErr) {
            console.error(`Failed to read most recent chat (${mostRecentId}):`, readErr);
            setResponses({});
          }
        } else {
          setActiveChatId(null);
          setResponses({});
        }
      } catch (error: any) {
        console.error('Failed to load chat sessions from Puter:', error);
        if (error?.code === 'permission_denied' || error?.status === 403) {
          setDbError("Permission denied. Could not access chat history. Please try signing out and in again.");
        } else {
          setDbError('Error loading chat history from Puter.');
        }
      }
    };
    loadInitialData();
  }, [user]);

  useEffect(() => {
    const wasLoading = Object.values(prevLoadingStatesRef.current).some(Boolean);
    const isNowLoading = Object.values(loadingStates).some(Boolean);
    prevLoadingStatesRef.current = loadingStates;

    if (wasLoading && !isNowLoading && activeChatId) {
        saveChat(activeChatId);
    }
  }, [loadingStates, activeChatId, saveChat]);

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
        onLogout={onLogout}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onInitiateDelete={handleInitiateDelete}
        onHelpClick={() => setShowHelpModal(true)}
      />
      <div 
        className="flex flex-1 flex-col overflow-hidden"
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
                    <div className="bg-[#27272a] border-2 border-zinc-700 rounded-xl p-6 flex flex-col relative">
                      <span className="absolute top-4 right-4 text-xs font-semibold bg-zinc-600 text-zinc-200 px-2 py-1 rounded-full">Current Plan</span>
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
                    <div className="bg-[#27272a] border-2 border-green-400/30 hover:border-green-400/60 rounded-xl p-6 flex flex-col transition-colors">
                      <h4 className="text-xl font-bold text-white">Pro Plan</h4>
                      <p className="text-3xl font-bold text-white mt-2">₹999 <span className="text-xl font-medium text-zinc-400">/ month</span></p>
                      <ul className="space-y-3 mt-6 text-zinc-300 text-sm flex-grow">
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>All premium AI models</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>400,000 tokens/month</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Prompt enhancement</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Image & Audio features</li>
                          <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Community & Promptbook</li>
                      </ul>
                      <button className="mt-6 w-full text-center bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-0.5 group">
                          Upgrade to Pro
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeSettingTab === 'account' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Account Details</h3>
                  <div className="bg-[#27272a] border border-zinc-700 rounded-xl p-6">
                    <p className="text-zinc-400">Account settings and user information will appear here.</p>
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