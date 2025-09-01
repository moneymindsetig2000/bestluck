import React from 'react';
import FadeInSection from './FadeInSection';
import { ChatGptIcon, ClaudeIcon, DeepSeekIcon, GeminiIcon, GrokIcon, PerplexityIcon } from './shared/ModelIcons';

const CheckIcon = () => (
    <svg className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const ModelIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400">
        {children}
    </div>
);

// New Feature Icons
const WandIcon = () => (
    <ModelIcon>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
    </ModelIcon>
);

const ImageIcon = () => (
    <ModelIcon>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    </ModelIcon>
);

const SettingsIcon = () => (
    <ModelIcon>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
    </ModelIcon>
);


// Mockup Components
const MockupCompare = () => (
    <div className="relative aspect-video bg-black/30 border border-zinc-700 rounded-xl flex items-center justify-center p-4">
        <div className="w-full h-full flex gap-4 overflow-hidden">
            <div className="flex-1 bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-xs text-gray-400 flex flex-col space-y-3">
                <div className="flex items-center gap-2 text-white font-medium border-b border-zinc-700 pb-2">
                  <ChatGptIcon size={14} />
                  ChatGPT
                </div>
                <p className="font-medium text-gray-300">What's the best way to brew coffee at home? Give me the simple answer</p>
                <div className="mt-auto text-gray-500 space-y-1.5 pt-2">
                    <div className="h-2 bg-zinc-700 rounded-full w-full animate-pulse-slow"></div>
                    <div className="h-2 bg-zinc-700 rounded-full w-5/6 animate-pulse-slow delay-150"></div>
                    <div className="h-2 bg-zinc-700 rounded-full w-3/4 animate-pulse-slow delay-300"></div>
                </div>
            </div>
             <div className="flex-1 bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-xs text-gray-400 flex-col space-y-3 hidden sm:flex">
                <div className="flex items-center gap-2 text-white font-medium border-b border-zinc-700 pb-2">
                   <DeepSeekIcon size={14} />
                   DeepSeek
                </div>
                <p className="font-medium text-gray-300">What's the best way to brew coffee at home? Give me the simple answer</p>
                <div className="mt-auto text-gray-500 space-y-1.5 pt-2">
                    <div className="h-2 bg-zinc-700 rounded-full w-full animate-pulse-slow delay-500"></div>
                    <div className="h-2 bg-zinc-700 rounded-full w-full animate-pulse-slow delay-700"></div>
                    <div className="h-2 bg-zinc-700 rounded-full w-4/5 animate-pulse-slow"></div>
                </div>
            </div>
        </div>
    </div>
);

const MockupWindowFrame: React.FC<{children: React.ReactNode, footerContent?: React.ReactNode | null}> = ({ children, footerContent }) => (
    <div className="relative aspect-video bg-[#1C1C1C] border border-gray-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-6 py-2 border-b border-gray-800 bg-black/20">
            <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
                <span className="flex items-center gap-2 text-white">
                  <ChatGptIcon size={16} />
                  ChatGPT
                </span>
                <span className="flex items-center gap-2 opacity-60">
                  <GeminiIcon size={16} />
                  Gemini
                </span>
            </div>
        </div>
        <div className="flex-grow flex items-center justify-center bg-black/10 p-4">
          {children}
        </div>
        {footerContent && (
             <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-[#111111]">
                {footerContent}
            </div>
        )}
    </div>
);

const MockupPromptBoost = () => (
    <MockupWindowFrame 
      children={<div />} 
      footerContent={
        <>
            <div className="text-gray-500">Ask me anything...</div>
            <div className="flex gap-4 mt-3 text-sm text-gray-300">
                <span className="flex items-center gap-1.5 opacity-80"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>Generate Image</span>
                <span className="flex items-center gap-1.5 opacity-80"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>Upload Image</span>
            </div>
        </>
      }
    />
);

const MockupAudio = () => (
    <MockupWindowFrame
        children={<div />}
        footerContent={
            <div className="flex items-center gap-4">
                <div className="text-gray-400 text-sm">0:00</div>
                <div className="flex-grow h-1 bg-zinc-700 rounded-full" />
                <div className="flex items-center gap-3 text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                </div>
            </div>
        }
    />
);

const MockupProject = () => (
  <MockupWindowFrame
    footerContent={null}
    children={
      <div className="w-full max-w-sm bg-[#2a2a2a] border border-zinc-700 rounded-lg shadow-lg text-left">
        <div className="p-4 border-b border-zinc-700">
          <h4 className="font-semibold text-white">Create new project</h4>
          <p className="text-sm text-gray-400">Fill in the details below to create a new project.</p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-300">Project name</label>
            <div className="mt-1 h-8 w-full bg-zinc-800 border border-zinc-600 rounded-md" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-300">System prompt</label>
            <div className="mt-1 h-16 w-full bg-zinc-800 border border-zinc-600 rounded-md" />
          </div>
        </div>
        <div className="p-4 border-t border-zinc-700 flex justify-end">
            <div className="h-8 w-24 bg-white/80 rounded-md" />
        </div>
      </div>
    }
  />
);

const featuresData = [
    {
        icon: (
            <div className="flex items-center gap-3 mb-8">
                <ChatGptIcon size={40} />
                <GeminiIcon size={40} className="bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400" />
                <DeepSeekIcon size={40} />
                <PerplexityIcon size={40} className="bg-zinc-800 border border-zinc-700 rounded-full p-1" />
                <ClaudeIcon size={40} />
                <GrokIcon size={40} />
            </div>
        ),
        title: "Compare All Premium AIs at Once",
        description: "Free AI models often deliver restricted and inferior answers. With AI Clavis, you get access to multiple top-tier premium models, all in one place. Compare their responses side-by-side to experience faster, smarter, and most accurate answers.",
        bullets: ["Save hours of manual comparison", "Customize your AI team instantly", "Never miss the most accurate answer again"],
        mockup: <MockupCompare />,
        shadowColor: 'shadow-teal-900/20'
    },
    {
        icon: <div className="mb-8"><WandIcon /></div>,
        title: "Prompt Boost - Instant Enhancement",
        description: "No need to craft the perfect question. Just write what you want, hit Enhance Prompt, and watch every AI respond with smarter, richer answers.",
        bullets: ["Turn rough ideas into perfect prompts", "Get 10x better responses instantly", "No prompt engineering skills needed"],
        mockup: <MockupPromptBoost />,
        shadowColor: 'shadow-indigo-900/20'
    },
    {
        icon: <div className="mb-8"><ImageIcon /></div>,
        title: "Generate Images & Transcribe Audio",
        description: "Bring your creative and content ideas to life instantly with AI-powered image generation and fast, accurate audio transcription — no extra tools needed.",
        bullets: ["Generate high-quality images for any purpose.", "Get instant, clear transcripts from your recorded audio.", "Effortlessly edit outputs to meet specific project needs."],
        mockup: <MockupAudio />,
        shadowColor: 'shadow-cyan-900/20'
    },
    {
        icon: <div className="mb-8"><SettingsIcon /></div>,
        title: "Custom Projects with System Instructions",
        description: "Create unique projects with tailored system guidelines. Set ‘Marketing Mode’ or ‘Code Review Mode’ once, ensuring every AI model follows your project’s direction throughout.",
        bullets: ["One-time setup keeps all AI replies on-brand and on-task.", "Instantly switch modes across chats", "Maintain consistent tone and rules without repetition."],
        mockup: <MockupProject />,
        shadowColor: 'shadow-rose-900/20'
    },
];

const Features: React.FC = () => {
    const delays = [150, 300, 500, 700];
    return (
        <section id="features" className="py-20 sm:py-32 scroll-mt-28">
            <div className="container mx-auto px-6">
                <FadeInSection className="text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tighter">
                        One Window. Multiple Perspectives.<br /> Achieve Optimal Efficiency.
                    </h2>
                    <p className="mt-6 text-lg text-gray-400">
                        Every feature is designed to amplify your AI-powered productivity
                    </p>
                </FadeInSection>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
                    {featuresData.map((feature, index) => (
                        <FadeInSection 
                          key={index} 
                          direction={index % 2 === 0 ? 'left' : 'right'}
                          className={`delay-${delays[index]} h-full`}
                        >
                            <div className={`relative bg-[#1a1a1a]/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl ${feature.shadowColor} h-full flex flex-col`}>
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center flex-grow">
                                    <div className={index % 2 !== 0 ? 'lg:order-last' : ''}>
                                        {feature.icon}
                                        <h3 className="text-3xl font-bold text-white mb-5">{feature.title}</h3>
                                        <p className="text-gray-400 leading-relaxed mb-6">{feature.description}</p>
                                        <ul className="space-y-4 text-base">
                                            {feature.bullets.map((bullet, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <CheckIcon />
                                                    <span className="text-gray-300">{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="relative">
                                        {feature.mockup}
                                    </div>
                               </div>
                            </div>
                        </FadeInSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;