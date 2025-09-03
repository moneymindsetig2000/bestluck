
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import PromptInput from '../components/chat/PromptInput';
import { ChatGptIcon, GeminiIcon, DeepSeekIcon, PerplexityIcon, ClaudeIcon, GrokIcon } from '../components/shared/ModelIcons';
import ResponseWithCitations from '../components/chat/ResponseWithCitations';
import { safePuterFs, getChatsDirForUser, getSettingsDirForUser } from '../lib/puterUtils';
import type { Subscription } from '../lib/puterUtils';
import { User } from '../../App';

// IMPORTANT: Replace this placeholder with your actual Deno Deploy URL for AI responses.
// Your URL will look something like: https://your-project-name.deno.dev
const BACKEND_URL = "https://backendforai.deno.dev"; 

// IMPORTANT: Replace this placeholder with your new "Standard Payment Link" URL from the Razorpay dashboard.
// The code will automatically add the necessary user ID to this link.
const RAZORPAY_PAYMENT_LINK_URL = "https://rzp.io/rzp/A2WOTpx";

declare global {
  interface Window {
    puter: any;
    Razorpay: any;
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

const initialModels: Omit<ModelConfig, 'enabled'>[] = [
  { name: 'ChatGPT', icon: <ChatGptIcon /> },
  { name: 'Gemini', icon: <GeminiIcon /> },
  { name: 'DeepSeek', icon: <DeepSeekIcon /> },
  { name: 'Perplexity', icon: <PerplexityIcon /> },
  { name: 'Claude', icon: <ClaudeIcon /> },
  { name: 'Grok', icon: <GrokIcon /> },
];

const FREE_PLAN_LOCKED_MODELS = ['Gemini', 'Perplexity', 'Grok'];


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

const UpgradeModal = ({ onClose, onUpgrade }: { onClose: () => void, onUpgrade: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-6 w-full max-w-md text-left transform transition-all" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Upgrade to Pro to Unlock
          </h2>
          <p className="text-zinc-400 mt-3 mb-4">You're currently on the Free plan. Upgrade to Pro to access all premium AI models, get higher request limits, and unlock advanced features.</p>
          <ul className="space-y-3 text-zinc-300">
             <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Access to all 6 premium AI models.</span>
            </li>
             <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>4x more requests (240/month).</span>
            </li>
          </ul>
          <div className="flex justify-end gap-4 mt-6">
            <button onClick={onClose} className="px-5 py-2 bg-zinc-600 hover:bg-zinc-500 text-white font-semibold rounded-md transition-colors">
              Maybe Later
            </button>
            <button onClick={onUpgrade} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    );
};


const ChatPage: React.FC<ChatPageProps> = ({ user, subscription, setSubscription, onLogout }) => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const [responses, setResponses] = useState<Record<string, Response[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const [dbError, setDbError] = useState<string | null>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<ChatSession | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState('subscription');
  const [notification, setNotification] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');

  const [systemInstruction, setSystemInstruction] = useState('');
  const [tempSystemInstruction, setTempSystemInstruction] = useState('');
  const [instructionGeneratorInput, setInstructionGeneratorInput] = useState('');
  const [generatedInstruction, setGeneratedInstruction] = useState('');
  const [isGeneratingInstruction, setIsGeneratingInstruction] = useState(false);

  const prevLoadingStatesRef = useRef<Record<string, boolean>>({});
  const chatPaneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  
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
    // This effect sets the model configurations based on the user's subscription plan.
    // It runs only when the subscription plan changes (e.g., free -> pro),
    // not on every request. This preserves the user's manual toggle choices.
    if (subscription) {
        const isFree = subscription.plan === 'free';
        const initialConfigs = initialModels.map(model => ({
            ...model,
            enabled: isFree ? !FREE_PLAN_LOCKED_MODELS.includes(model.name) : true,
        }));
        setModelConfigs(initialConfigs);
    }
  }, [subscription?.plan]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        setChatSessions([]);
        setActiveChatId(null);
        setResponses({});
        setSystemInstruction('');
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
        
        // Load System Instruction
        const settingsDir = getSettingsDirForUser(currentPuterUser);
        const instructionPath = `${settingsDir}/system_instruction.json`;
        try {
            const blob = await safePuterFs.read(instructionPath);
            const content = await blob.text();
            const data = JSON.parse(content);
            if (data.instruction) {
                setSystemInstruction(data.instruction);
                setTempSystemInstruction(data.instruction);
            }
        } catch (error) {
            console.log("No custom system instruction found. Using default.");
            setSystemInstruction('');
            setTempSystemInstruction('');
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
    // Auto-scroll logic: only scroll vertically within each pane.
    Object.keys(chatPaneRefs.current).forEach(modelName => {
        const pane = chatPaneRefs.current[modelName];
        if (pane) {
            // Check if there is new content that would require scrolling.
            // This is a simple check; more complex logic could be used if needed.
            if (pane.scrollHeight > pane.clientHeight) {
                // By only setting scrollTop, we avoid affecting scrollLeft.
                pane.scrollTo({ top: pane.scrollHeight, behavior: 'smooth' });
            }
        }
    });
  }, [responses]);

  // Cleanup polling interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleToggleExpand = (modelName: string) => {
    setExpandedModel(prev => (prev === modelName ? null : modelName));
  };

  const handleToggleModelEnabled = (modelName: string) => {
    const isFree = subscription?.plan === 'free';
    const isLocked = FREE_PLAN_LOCKED_MODELS.includes(modelName);
    const modelToToggle = modelConfigs.find(m => m.name === modelName);

    // If a free user tries to enable a locked model, show the upgrade modal
    if (isFree && isLocked && !modelToToggle?.enabled) {
        setShowUpgradeModal(true);
    } else {
        // Otherwise, allow toggling (for Pro users, or for disabling a model on free plan)
        setModelConfigs(prevConfigs =>
          prevConfigs.map(m =>
            m.name === modelName ? { ...m, enabled: !m.enabled } : m
          )
        );
    }
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

  const handleUpgradeFromModal = () => {
    setShowUpgradeModal(false);
    setShowHelpModal(true);
    setActiveSettingTab('subscription');
  };
  
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPollingForSubscriptionUpdate = () => {
    stopPolling(); // Ensure no multiple pollers are running

    const checkStatus = async () => {
        try {
            const currentPuterUser = await window.puter.auth.getUser();
            if (!currentPuterUser) throw new Error("User not authenticated for polling");

            const settingsDir = getSettingsDirForUser(currentPuterUser);
            const subPath = `${settingsDir}/subscription.json`;
            const blob = await safePuterFs.read(subPath);
            const content = await blob.text();
            const currentSub = JSON.parse(content) as Subscription;
            
            if (currentSub.plan === 'pro') {
                setSubscription(currentSub);
                setNotification('Upgrade successful! Welcome to the Pro plan.');
                stopPolling();
            }
        } catch (error) {
            console.warn("Polling check failed, will retry:", error);
        }
    };
    
    pollingIntervalRef.current = window.setInterval(checkStatus, 5000); // Check every 5 seconds

    // Set a timeout to stop polling after 5 minutes to prevent infinite loops
    setTimeout(() => {
        if (pollingIntervalRef.current) {
            stopPolling();
            setNotification("Payment confirmation timed out. If you have completed the payment, please refresh the page.");
        }
    }, 300000); // 5 minutes
  };
  
  const handleUpgrade = async () => {
    if (RAZORPAY_PAYMENT_LINK_URL.includes("YOUR_NEW_LINK_HERE")) {
        alert("The application developer needs to configure a new Razorpay Payment Link. See the comment in `pages/ChatPage.tsx`.");
        return;
    }

    if (!user?.uid) {
        setDbError("Could not process upgrade: User ID is missing.");
        return;
    }
    
    // Construct the unique URL for this user using the correct 'notes' parameter for Razorpay
    const paymentUrl = `${RAZORPAY_PAYMENT_LINK_URL}?notes[user_id]=${user.uid}`;
    
    // Open the payment link in a new tab
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    setShowHelpModal(false); // Close settings modal if open

    // Inform the user and start polling for the backend update
    setNotification("Opening secure payment page... Please complete your payment in the new tab. We'll upgrade your plan upon confirmation.");
    startPollingForSubscriptionUpdate();
  };

  const handleClaimCoupon = () => {
    // Placeholder for now.
    if(couponCode.trim() === '') {
        setNotification("Please enter a coupon code.");
        return;
    }
    setNotification(`Invalid coupon code: "${couponCode}"`);
    setCouponCode('');
  };

  const handleGenerateInstruction = async () => {
    if (!instructionGeneratorInput.trim()) return;
    setIsGeneratingInstruction(true);
    setGeneratedInstruction('');
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task: 'generateInstruction',
                instructionPrompt: instructionGeneratorInput
            })
        });
        if (!response.ok) {
            throw new Error('Failed to generate instruction.');
        }
        const data = await response.json();
        setGeneratedInstruction(data.instruction);
    } catch (error) {
        console.error("Error generating system instruction:", error);
        setGeneratedInstruction("Error: Could not generate instruction. Please try again.");
    } finally {
        setIsGeneratingInstruction(false);
    }
  };

  const handleApplyInstruction = async () => {
    const instructionToSave = tempSystemInstruction;
    try {
        const currentPuterUser = await window.puter.auth.getUser();
        if (!currentPuterUser) throw new Error("User not authenticated");
        
        const settingsDir = getSettingsDirForUser(currentPuterUser);
        const instructionPath = `${settingsDir}/system_instruction.json`;
        
        await safePuterFs.mkdir(settingsDir, { createMissingParents: true });
        await safePuterFs.write(instructionPath, JSON.stringify({ instruction: instructionToSave }));
        
        setSystemInstruction(instructionToSave);
        setNotification('System instruction applied successfully!');
    } catch (error) {
        console.error("Failed to save system instruction:", error);
        setDbError("Could not save system instruction.");
    }
  };

  const streamResponseForModel = (prompt: string, images: ImagePayload[], model: ModelConfig, history: any[], signal: AbortSignal): Promise<void> => {
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
              history: history,
              customSystemInstruction: systemInstruction,
            }),
            signal, // Pass the abort signal to the fetch request
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
           if (error.name === 'AbortError') {
                // When aborted, update the UI with a "stopped" message and then reject
                setResponses(prev => {
                    const modelHistory = [...(prev[model.name] || [])];
                    if (modelHistory.length === 0) return prev;
                    const lastResponseIndex = modelHistory.length - 1;
                    const currentAnswer = modelHistory[lastResponseIndex].answer;
                    if (!currentAnswer.includes("**-- Generation stopped --**")) {
                        modelHistory[lastResponseIndex] = { ...modelHistory[lastResponseIndex], answer: currentAnswer + "\n\n**-- Generation stopped --**" };
                    }
                    return { ...prev, [model.name]: modelHistory };
                });
                return reject(error); // Reject to notify Promise.all
            }
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
        alert("Please edit `pages/ChatPage.tsx` and set the `BACKEND_URL` constant to your Deno Deploy URL.");
        return;
    }
    
    if (subscription && subscription.requestsUsed >= subscription.requestsLimit) {
        setNotification("You have reached your monthly request limit.");
        return;
    }

    let chatIdToUse = activeChatId;
    const isNewChat = !chatIdToUse;
    
    const targetModels = expandedModel
      ? modelConfigs.filter(m => m.name === expandedModel)
      : modelConfigs.filter(m => m.enabled);
    if (targetModels.length === 0) return;
    
    // Before any state updates, prepare history payloads for each model
    const historyPayloads: Record<string, any[]> = {};
    if (!isNewChat) {
        targetModels.forEach(model => {
            historyPayloads[model.name] = (responses[model.name] || [])
                // Filter out incomplete/failed turns from history
                .filter(ex => ex.answer && ex.answer.trim() !== '' && !ex.answer.startsWith('**Error:**'))
                .flatMap(exchange => {
                    const userParts: any[] = [];
                    if (exchange.prompt) userParts.push({ text: exchange.prompt });
                    if (exchange.images) {
                        userParts.push(...exchange.images.map(img => ({
                            inlineData: { mimeType: img.mimeType, data: img.data }
                        })));
                    }
                    // Ensure user part is not empty before adding
                    if (userParts.length === 0) return [];

                    return [
                        { role: 'user', parts: userParts },
                        { role: 'model', parts: [{ text: exchange.answer }] }
                    ];
                });
        });
    }

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

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const streamPromises = targetModels.map(model => streamResponseForModel(prompt, images, model, historyPayloads[model.name] || [], signal));

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

    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error("One or more model streams failed.", error);
        } else {
            console.log("Stream generation was cancelled by the user.");
        }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const isAnyModelLoading = Object.values(loadingStates).some(isLoading => isLoading);
  const isPro = subscription?.plan === 'pro';
  const isFree = subscription?.plan === 'free';
  const isLimitReached = subscription && subscription.requestsUsed >= subscription.requestsLimit;

  const PlanFeature: React.FC<{ children: React.ReactNode, available: boolean }> = ({ children, available }) => (
    <li className="flex items-start gap-3">
      {available ? 
        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        : <svg className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      }
      <span className={available ? "text-zinc-200" : "text-zinc-500"}>{children}</span>
    </li>
  );

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
            const isLocked = isFree && FREE_PLAN_LOCKED_MODELS.includes(model.name);
            
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
                  isLocked={isLocked}
                  onToggleExpand={() => handleToggleExpand(model.name)}
                  onToggleEnabled={() => handleToggleModelEnabled(model.name)}
                />
                <div 
                  ref={el => { chatPaneRefs.current[model.name] = el; }}
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
        <PromptInput 
          onSend={handleSend} 
          onStop={handleStop}
          isLoading={isAnyModelLoading} 
          isSignedIn={!!user} 
          onImagesChange={handleImagesChange} 
          isLimitReached={isLimitReached} 
          isFreePlan={isFree} 
        />
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
                <div className="bg-[#171717] border border-zinc-700 rounded-lg shadow-xl w-full max-w-3xl text-left" onClick={(e) => e.stopPropagation()}>
                    <div className="p-5 border-b border-zinc-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Help & Settings</h2>
                        <button onClick={() => setShowHelpModal(false)} className="text-zinc-400 hover:text-white">&times;</button>
                    </div>
                    <div className="flex">
                        <nav className="w-56 p-3 border-r border-zinc-700">
                            <ul>
                                <li><button onClick={() => setActiveSettingTab('subscription')} className={`w-full text-left px-3 py-2 rounded-md ${activeSettingTab === 'subscription' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>Subscription</button></li>
                                <li><button onClick={() => setActiveSettingTab('system_instructions')} className={`w-full text-left px-3 py-2 rounded-md ${activeSettingTab === 'system_instructions' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>System Instructions</button></li>
                                <li><button onClick={() => setActiveSettingTab('usage')} className={`w-full text-left px-3 py-2 rounded-md ${activeSettingTab === 'usage' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>Request Usage</button></li>
                                <li><button onClick={() => setActiveSettingTab('coupons')} className={`w-full text-left px-3 py-2 rounded-md ${activeSettingTab === 'coupons' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>Coupons</button></li>
                                <li><button onClick={() => setActiveSettingTab('logout')} className={`w-full text-left px-3 py-2 rounded-md ${activeSettingTab === 'logout' ? 'bg-zinc-700' : 'hover:bg-zinc-800'}`}>Log Out</button></li>
                            </ul>
                        </nav>
                        <div className="flex-1 p-5 min-h-[450px] overflow-y-auto">
                            {activeSettingTab === 'subscription' && subscription && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Compare Plans</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        {/* Free Plan */}
                                        <div className={`p-4 rounded-lg border ${isFree ? 'border-emerald-500 bg-emerald-900/30' : 'border-zinc-700 bg-zinc-800/50'}`}>
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-white">Free Plan</h4>
                                                {isFree && <span className="text-xs font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full">Current Plan</span>}
                                            </div>
                                            <p className="text-zinc-400 mt-1">For light, personal use.</p>
                                            <p className="text-2xl font-bold text-white my-4">Free</p>
                                            <ul className="space-y-3 text-zinc-300">
                                                <PlanFeature available={true}>60 Requests/Month</PlanFeature>
                                                <PlanFeature available={true}>Access to 3 core AI models</PlanFeature>
                                                <PlanFeature available={true}>Side-by-side comparison</PlanFeature>
                                                <PlanFeature available={false}>Instant prompt enhancement</PlanFeature>
                                                <PlanFeature available={true}>1 Image Upload per Request</PlanFeature>
                                                <PlanFeature available={false}>Community & Promptbook Access</PlanFeature>
                                            </ul>
                                        </div>
                                        {/* Pro Plan */}
                                        <div className={`p-4 rounded-lg border ${isPro ? 'border-emerald-500 bg-emerald-900/30' : 'border-zinc-700 bg-zinc-800/50'}`}>
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-white">Pro Plan</h4>
                                                {isPro && <span className="text-xs font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full">Current Plan</span>}
                                            </div>
                                            <p className="text-zinc-400 mt-1">For power users & professionals.</p>
                                            <p className="text-2xl font-bold text-white my-4">₹799 <span className="text-base font-normal text-zinc-400">/mo</span></p>
                                            <ul className="space-y-3 text-zinc-300">
                                                <PlanFeature available={true}>240 Requests/Month</PlanFeature>
                                                <PlanFeature available={true}>All premium AI models</PlanFeature>
                                                <PlanFeature available={true}>Side-by-side comparison</PlanFeature>
                                                <PlanFeature available={true}>Instant prompt enhancement</PlanFeature>
                                                <PlanFeature available={true}>Image & Audio features</PlanFeature>
                                                <PlanFeature available={true}>Community & Promptbook Access</PlanFeature>
                                            </ul>
                                            {isFree && (
                                                <button onClick={handleUpgrade} className="mt-6 w-full text-center bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold px-4 py-2 rounded-md hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                                                    Upgrade to Pro
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSettingTab === 'system_instructions' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">Custom System Instructions</h3>
                                    <p className="text-zinc-400 text-sm">Define a custom role or persona for the AIs to follow in all conversations. You can generate one with AI or write your own.</p>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">1. Describe the role you want</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="text"
                                                placeholder="e.g., A helpful assistant for writing code"
                                                value={instructionGeneratorInput}
                                                onChange={(e) => setInstructionGeneratorInput(e.target.value)}
                                                className="flex-grow bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <button onClick={handleGenerateInstruction} disabled={isGeneratingInstruction} className="text-center bg-zinc-600 text-white font-bold px-4 py-2 rounded-md hover:bg-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-wait">
                                                {isGeneratingInstruction ? 'Generating...' : 'Generate'}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">2. AI-Generated Instruction (Editable)</label>
                                        <textarea
                                            value={generatedInstruction}
                                            onChange={(e) => setGeneratedInstruction(e.target.value)}
                                            placeholder="Generated instructions will appear here..."
                                            rows={5}
                                            className="w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <button onClick={() => setTempSystemInstruction(generatedInstruction)} disabled={!generatedInstruction || isGeneratingInstruction} className="text-xs mt-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                                            Use This &#x2193;
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-zinc-300">3. Final System Instruction</label>
                                        <textarea
                                            value={tempSystemInstruction}
                                            onChange={(e) => setTempSystemInstruction(e.target.value)}
                                            placeholder="Paste the generated instruction here or write your own from scratch..."
                                            rows={5}
                                            className="w-full mt-1 bg-zinc-900 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    
                                    <button onClick={handleApplyInstruction} className="w-full text-center bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold px-4 py-2 rounded-md hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                                      Apply Instruction
                                    </button>
                                </div>
                            )}
                            {activeSettingTab === 'usage' && subscription && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Your Current Usage</h3>
                                    <p className="text-zinc-400 text-sm">Requests used this period:</p>
                                    <p className="text-3xl font-bold text-white my-2">{subscription.requestsUsed} / {subscription.requestsLimit}</p>
                                    <div className="w-full bg-zinc-700 rounded-full h-2.5 my-2">
                                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{width: `${(subscription.requestsUsed / subscription.requestsLimit) * 100}%`}}></div>
                                    </div>
                                    <p className="text-zinc-500 text-xs mt-2">Your request limit will reset on {formatDateTime(subscription.periodEndDate)}.</p>
                                </div>
                            )}
                            {activeSettingTab === 'coupons' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Redeem Coupon</h3>
                                    <p className="text-zinc-400 text-sm mb-4">Have a coupon code? Enter it below to claim your free requests and extend your AI journey.</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="flex-grow bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <button 
                                          onClick={handleClaimCoupon}
                                          className="text-center bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold px-4 py-2 rounded-md hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                                        >
                                          Claim
                                        </button>
                                    </div>
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
        {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgradeFromModal} />}
      </div>
    </div>
  );
};

export default ChatPage;
