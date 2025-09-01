import React from 'react';
import FadeInSection from './FadeInSection';
import Logo from './Logo';

interface ShowcaseProps {
    onLogin: () => Promise<void>;
}

const Showcase: React.FC<ShowcaseProps> = ({ onLogin }) => {
    return (
        <section className="py-20 sm:py-32">
            <div className="container mx-auto px-6">
                <FadeInSection className="text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tighter">
                        Watch AI Clavis Catch What Others Miss
                    </h2>
                    <p className="mt-6 text-lg text-gray-400">
                        Real question. Real answers. See which AI gets it right.
                    </p>
                </FadeInSection>

                <div className="mt-16 grid lg:grid-cols-5 gap-12 items-center">
                    {/* Left side: Video */}
                    <FadeInSection direction="left" className="lg:col-span-3">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/60 to-cyan-600/60 rounded-3xl blur-3xl opacity-50"></div>
                            <div className="relative bg-black border border-gray-800 rounded-2xl p-2 sm:p-4 aspect-video flex flex-col overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-center px-2 sm:px-4 py-2">
                                    <div className="flex items-center gap-3">
                                        <Logo width={24} height={24} />
                                        <p className="text-white font-medium text-sm sm:text-base hidden sm:block">
                                            Watch AI Clavis Catch What ChatGPT, Gemini, Claude, Perplexity, Deep...
                                        </p>
                                        <p className="text-white font-medium text-sm sm:text-base sm:hidden">
                                            AI Clavis Comparison
                                        </p>
                                    </div>
                                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                        <span className="text-sm font-medium hidden sm:block">Share</span>
                                    </button>
                                </div>

                                {/* Video Player Area */}
                                <div className="flex-grow bg-[#0D0D0D] rounded-lg flex items-center justify-center relative my-2">
                                    {/* Play button removed */}
                                    {/* Mock prompt at the bottom */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-gray-900/50 p-3 rounded-lg backdrop-blur-sm">
                                        <p className="text-gray-300 text-xs sm:text-sm">Can a second apple developer account have the same DUNS account as another developer account to deploy an app to it?</p>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1.5 opacity-60"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>Generate Image</span>
                                            <span className="flex items-center gap-1.5 opacity-60"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>Upload Image</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Right side: Results */}
                    <FadeInSection direction="right" className="lg:col-span-2">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-3xl font-bold text-white mb-2 text-left">The Results Will Surprise You</h3>
                            <div className="flex flex-col gap-4">
                                <div className="bg-green-600/10 border border-green-500/30 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-300">2 out of 6 got it right</p>
                                        <p className="text-gray-400 text-sm mt-1">Gave accurate, actionable answers</p>
                                    </div>
                                </div>
                                <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex-shrink-0 flex items-center justify-center">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-yellow-300">3 out of 6 were incomplete</p>
                                        <p className="text-gray-400 text-sm mt-1">Provided partial or incomplete information</p>
                                    </div>
                                </div>
                                <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-300">1 out of 6 was wrong</p>
                                        <p className="text-gray-400 text-sm mt-1">Gave misleading guidance</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onLogin}
                                className="mt-6 w-full text-center inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 relative overflow-hidden text-lg"
                                >
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)', backgroundSize: '5px 5px' }}></div>
                                <span className="relative z-10">Get smarter & more accurate AI answers</span>
                            </button>
                            <p className="text-center text-sm text-gray-500 mt-2">
                                This is why comparing matters — get the full picture every time
                            </p>
                        </div>
                    </FadeInSection>
                </div>
            </div>
        </section>
    );
};

export default Showcase;