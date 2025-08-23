import React from 'react';
import FadeInSection from './FadeInSection';
import Logo from './Logo';

const YouTubeIcon = () => (
    <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%">
        <path className="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
        <path d="M 45,24 27,14 27,34" fill="#fff"></path>
    </svg>
);

interface ShowcaseProps {
    onLogin: () => Promise<void>;
}

const Showcase: React.FC<ShowcaseProps> = ({ onLogin }) => {
    return (
        <section className="py-20 sm:py-32">
            <div className="container mx-auto px-6">
                <FadeInSection className="text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tighter">
                        Watch AI Fiesta Catch What Others Miss
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
                                            Watch AI Fiesta Catch What ChatGPT, Gemini, Claude, Perplexity, Deep...
                                        </p>
                                        <p className="text-white font-medium text-sm sm:text-base sm:hidden">
                                            AI Fiesta Comparison
                                        </p>
                                    </div>
                                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                        <span className="text-sm font-medium hidden sm:block">Share</span>
                                    </button>
                                </div>

                                {/* Video Player Area */}
                                <div className="flex-grow bg-[#0D0D0D] rounded-lg flex items-center justify-center relative my-2">
                                    <button aria-label="Play video" className="w-20 h-14 z-10 hover:scale-110 transition-transform">
                                        <YouTubeIcon />
                                    </button>
                                    {/* Mock prompt at the bottom */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-gray-900/50 p-3 rounded-lg backdrop-blur-sm">
                                        <p className="text-gray-300 text-xs sm:text-sm">Can a second apple developer account have the same DUNS account as another developer account to deploy an app to it?</p>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1.5 opacity-60"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>Generate Image</span>
                                            <span className="flex items-center gap-1.5 opacity-60"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>Upload Image</span>
                                        </div>
                                    </div>
                                </div>

                                {/* "Watch on YouTube" bar */}
                                <div className="px-4 py-2 flex items-center gap-2">
                                     <span className="text-sm text-gray-200 font-medium">Watch on</span>
                                     <svg role="img" aria-labelledby="youtube-logo" viewBox="0 0 90 20" width="90" height="20" fill="#fff">
                                        <title id="youtube-logo">YouTube</title>
                                        <path d="M2.3,16.2c-0.6-0.3-1-0.8-1.3-1.4c-0.3-0.6-0.4-1.4-0.4-2.4V7.5c0-1,0.1-1.8,0.4-2.4c0.3-0.6,0.7-1.1,1.3-1.4 C2.9,3.4,3.7,3.3,4.9,3.3h1c1.2,0,2,0.1,2.6,0.3c0.6,0.3,1,0.8,1.3,1.4c0.3,0.6,0.4,1.4,0.4,2.4v4.9c0,1-0.1,1.8-0.4,2.4 c-0.3,0.6-0.7,1.1-1.3,1.4c-0.6,0.3-1.4,0.3-2.6,0.3h-1C3.7,16.5,2.9,16.5,2.3,16.2z M5.1,14c0.2,0.1,0.4,0.1,0.7,0.1h0.1 c0.5,0,0.9-0.1,1.1-0.4c0.3-0.3,0.4-0.8,0.4-1.5V7.8c0-0.7-0.1-1.2-0.4-1.5C6.8,6.1,6.4,5.9,5.9,5.9h-0.1C5.5,5.9,5.2,6,5.1,6.1 v7.9z"></path>
                                        <path d="M12,11.5V3.5h2.4v10.3h-2.1l-2-2.5h-0.1v2.5H8V3.5h2.4v7.2L12,11.5z"></path>
                                        <path d="M22.9,13.8v-4c0-0.8-0.1-1.4-0.2-1.9s-0.4-0.8-0.7-1.1c-0.3-0.3-0.7-0.4-1.2-0.5c-0.5-0.1-1.1-0.1-1.8-0.1s-1.3,0-1.8,0.1 c-0.5,0.1-0.9,0.2-1.2,0.5c-0.3,0.3-0.5,0.6-0.7,1.1s-0.2,1.1-0.2,1.9v4c0,0.8,0.1,1.4,0.2,1.9s0.4,0.8,0.7,1.1 c0.3,0.3,0.7,0.4,1.2,0.5c0.5,0.1,1.1,0.1,1.8,0.1s1.3,0,1.8-0.1c0.5-0.1,0.9-0.2,1.2-0.5c0.3-0.3,0.5-0.6,0.7-1.1 S22.9,14.6,22.9,13.8z M19.9,14.6c-0.1,0.3-0.2,0.5-0.3,0.6s-0.3,0.2-0.6,0.2c-0.2,0-0.5,0.1-0.8,0.1s-0.6,0-0.8-0.1 c-0.3,0-0.5-0.1-0.6-0.2s-0.2-0.3-0.3-0.6c-0.1-0.3-0.1-0.7-0.1-1.2V9.5c0-0.5,0-0.9,0.1-1.2c0.1-0.3,0.2-0.5,0.3-0.6 s0.3-0.2,0.6-0.2c0.2,0,0.5-0.1,0.8-0.1s0.6,0,0.8,0.1c0.3,0,0.5,0.1,0.6,0.2s0.2,0.3,0.3,0.6c0.1,0.3,0.1,0.7,0.1,1.2v2.9 C20.1,13.9,20,14.3,19.9,14.6z"></path>
                                        <path d="M29,14.8c-0.4-0.2-0.7-0.5-0.9-0.9c-0.2-0.4-0.3-1-0.3-1.7V6.1h2.2v6.4c0,0.4,0,0.7,0.1,0.9c0.1,0.2,0.2,0.3,0.4,0.4 c0.2,0.1,0.4,0.1,0.6,0.1c0.2,0,0.5-0.1,0.8-0.2V14C30.1,14.4,29.5,14.7,29,14.8z"></path>
                                        <path d="M35.6,13.8v-4c0-0.8-0.1-1.4-0.2-1.9c-0.1-0.5-0.4-0.8-0.7-1.1c-0.3-0.3-0.7-0.4-1.2-0.5c-0.5-0.1-1.1-0.1-1.8-0.1 c-0.7,0-1.3,0-1.8,0.1c-0.5,0.1-0.9,0.2-1.2,0.5c-0.3,0.3-0.5,0.6-0.7,1.1c-0.1,0.5-0.2,1.1-0.2,1.9v4c0,0.8,0.1,1.4,0.2,1.9 c0.1,0.5,0.4,0.8,0.7,1.1c0.3,0.3,0.7,0.4,1.2,0.5c0.5,0.1,1.1,0.1,1.8,0.1c0.7,0,1.3,0,1.8-0.1c0.5-0.1,0.9-0.2,1.2-0.5 c0.3-0.3,0.5-0.6,0.7-1.1C35.5,15.2,35.6,14.6,35.6,13.8z M32.6,14.6c-0.1,0.3-0.2,0.5-0.3,0.6c-0.1,0.1-0.3,0.2-0.6,0.2 c-0.2,0-0.5,0.1-0.8,0.1s-0.6,0-0.8-0.1c-0.3,0-0.5-0.1-0.6-0.2c-0.1-0.1-0.2-0.3-0.3-0.6c-0.1-0.3-0.1-0.7-0.1-1.2V9.5 c0-0.5,0-0.9,0.1-1.2c0.1-0.3,0.2-0.5,0.3-0.6s0.3-0.2,0.6-0.2c0.2,0,0.5-0.1,0.8-0.1s0.6,0,0.8,0.1c0.3,0,0.5,0.1,0.6,0.2 s0.2,0.3,0.3,0.6c0.1,0.3,0.1,0.7,0.1,1.2v2.9C32.8,13.9,32.7,14.3,32.6,14.6z"></path>
                                        <path d="M42.4,16.2c-0.3,0.2-0.7,0.2-1.1,0.2c-0.5,0-0.9-0.1-1.2-0.3c-0.3-0.2-0.5-0.5-0.7-0.9c-0.1-0.4-0.2-1-0.2-1.8V3.5h2.2v9.8 c0,0.4,0.1,0.7,0.2,0.8c0.1,0.2,0.3,0.2,0.5,0.2c0.2,0,0.4-0.1,0.6-0.1V16.2z"></path>
                                        <path d="M43.8,11.5V3.5h2.4v10.3h-2.1l-2-2.5h-0.1v2.5h-2.2V3.5h2.4v7.2L43.8,11.5z"></path>
                                        <path d="M53.7,12.2c0,0.6-0.1,1.1-0.2,1.5c-0.1,0.4-0.3,0.7-0.6,0.9c-0.3,0.2-0.6,0.3-1,0.3c-0.5,0-0.9-0.1-1.3-0.4l0.6-2 c0.2,0.1,0.4,0.2,0.6,0.2c0.2,0,0.4-0.1,0.5-0.2c0.1-0.1,0.2-0.3,0.2-0.6c0-0.2,0-0.4-0.1-0.6l-2-5.9h2.3l1.1,3.5 c0.3,1,0.5,1.7,0.6,2.3h0.1c-0.1-0.7-0.2-1.5-0.2-2.3l0.8-3.5h2.2L53.7,12.2z"></path>
                                        <path d="M60.9,13.8v-4c0-0.8-0.1-1.4-0.2-1.9c-0.1-0.5-0.4-0.8-0.7-1.1c-0.3-0.3-0.7-0.4-1.2-0.5c-0.5-0.1-1.1-0.1-1.8-0.1 c-0.7,0-1.3,0-1.8,0.1c-0.5,0.1-0.9,0.2-1.2,0.5c-0.3,0.3-0.5,0.6-0.7,1.1c-0.1,0.5-0.2,1.1-0.2,1.9v4c0,0.8,0.1,1.4,0.2,1.9 c0.1,0.5,0.4,0.8,0.7,1.1c0.3,0.3,0.7,0.4,1.2,0.5c0.5,0.1,1.1,0.1,1.8,0.1c0.7,0,1.3,0,1.8-0.1c0.5-0.1,0.9-0.2,1.2-0.5 c0.3-0.3,0.5-0.6,0.7-1.1C60.8,15.2,60.9,14.6,60.9,13.8z M57.9,14.6c-0.1,0.3-0.2,0.5-0.3,0.6c-0.1,0.1-0.3,0.2-0.6,0.2 c-0.2,0-0.5,0.1-0.8,0.1s-0.6,0-0.8-0.1c-0.3,0-0.5-0.1-0.6-0.2c-0.1-0.1-0.2-0.3-0.3-0.6c-0.1-0.3-0.1-0.7-0.1-1.2V9.5 c0-0.5,0-0.9,0.1-1.2c0.1-0.3,0.2-0.5,0.3-0.6s0.3-0.2,0.6-0.2c0.2,0,0.5-0.1,0.8-0.1s0.6,0,0.8,0.1c0.3,0,0.5,0.1,0.6,0.2 s0.2,0.3,0.3,0.6c0.1,0.3,0.1,0.7,0.1,1.2v2.9C58.1,13.9,58,14.3,57.9,14.6z"></path>
                                        <path d="M66.5,8.1v6.2h-2.1V8.3c0-0.4-0.1-0.7-0.2-0.9c-0.1-0.2-0.3-0.3-0.5-0.3c-0.2,0-0.4,0-0.6,0.1V3.5h2.2 c1.1,0.1,1.8,0.3,2.2,0.8c0.4,0.5,0.6,1.2,0.6,2.2v1.6H66.5z M66.5,5.8C66.3,5.8,66,5.8,65.8,5.8c-0.4,0-0.8,0.1-1,0.2V7.7h1.3 C66.3,7.7,66.5,7.5,66.5,7.1V5.8z"></path>
                                    </svg>
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
