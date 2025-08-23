import React from 'react';
import FadeInSection from './FadeInSection';
import Logo from './Logo';

const ChatGptIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 0.00012207C11.1856 0.00012207 10.3756 0.160122 9.60561 0.470122C8.83561 0.780122 8.12061 1.23512 7.50061 1.81512C6.88061 2.39512 6.37561 3.08012 6.01561 3.84012C5.65561 4.60012 5.45561 5.41512 5.43061 6.25512C4.93561 6.30012 4.45061 6.42512 3.99061 6.63512C3.53061 6.84512 3.10561 7.13012 2.73061 7.48512C2.35561 7.84012 2.03561 8.25512 1.79061 8.71012C1.54561 9.16512 1.38061 9.65012 1.30561 10.1551C1.23061 10.6601 1.25061 11.1701 1.36561 11.6651C1.48061 12.1601 1.68561 12.6351 1.97061 13.0651C2.25561 13.4951 2.61561 13.8701 3.03061 14.1701L3.02061 14.1751C2.90561 14.4751 2.83061 14.8001 2.80061 15.1301C2.77061 15.4601 2.78561 15.7951 2.85061 16.1201C2.91561 16.4451 3.02561 16.7551 3.18061 17.0451C3.33561 17.3351 3.53561 17.6001 3.77061 17.8351L3.77061 17.8301C3.47561 18.2551 3.25561 18.7251 3.12561 19.2251C2.99561 19.7251 2.95561 20.2451 3.01061 20.7601C3.06561 21.2751 3.21561 21.7751 3.45561 22.2401C3.69561 22.7051 4.02061 23.1251 4.41561 23.4801C4.81061 23.8351 5.27061 24.1201 5.77061 24.3201C6.27061 24.5201 6.80061 24.6301 7.33561 24.6401C7.87061 24.6501 8.40061 24.5651 8.90561 24.3851C9.41061 24.2051 9.88061 23.9351 10.2956 23.5901L10.2956 23.5951C10.5906 23.7051 10.9006 23.7751 11.2206 23.8001C11.5406 23.8251 11.8656 23.8051 12.1806 23.7401C12.4956 23.6751 12.8006 23.5651 13.0856 23.4151C13.3706 23.2651 13.6306 23.0701 13.8656 22.8401L13.8656 22.8401C14.2906 23.1251 14.7656 23.3301 15.2706 23.4451C15.7756 23.5601 16.2956 23.5801 16.8056 23.5051C17.3156 23.4301 17.8106 23.2651 18.2656 23.0151C18.7206 22.7651 19.1256 22.4351 19.4656 22.0451C19.8056 21.6551 20.0756 21.1901 20.2656 20.6901C20.4556 20.1901 20.5606 19.6651 20.5756 19.1351C20.5906 18.6051 20.5156 18.0801 20.3556 17.5801C20.1956 17.0801 19.9506 16.6151 19.6356 16.2051L19.6406 16.2101C19.7556 15.9101 19.8306 15.5851 19.8606 15.2551C19.8906 14.9251 19.8756 14.5901 19.8106 14.2651C19.7456 13.9401 19.6356 13.6301 19.4806 13.3401C19.3256 13.0501 19.1256 12.7851 18.8906 12.5551L18.8956 12.5601C19.1906 12.1351 19.4106 11.6651 19.5406 11.1651C19.6706 10.6651 19.7106 10.1451 19.6556 9.63012C19.6006 9.11512 19.4506 8.61512 19.2106 8.15012C18.9706 7.68512 18.6456 7.26512 18.2506 6.92012C17.8556 6.57512 17.3956 6.29012 16.8956 6.09012C16.3956 5.89012 15.8656 5.78012 15.3306 5.77012C14.7956 5.76012 14.2656 5.84512 13.7606 6.02512C13.2556 6.20512 12.7856 6.47512 12.3706 6.82012L12.3756 6.82012C12.0806 6.71012 11.7706 6.64012 11.4506 6.61512C11.1306 6.59012 10.8056 6.61012 10.4906 6.67512C10.1756 6.74012 9.87061 6.85012 9.58561 7.00012C9.30061 7.15012 9.04061 7.34512 8.81061 7.57512L8.81061 7.57512C8.38561 7.29012 7.91061 7.08512 7.40561 6.97012C6.90061 6.85512 6.38061 6.83512 5.87061 6.91012C5.36061 6.98512 4.86561 7.15012 4.41061 7.40012C3.95561 7.65012 3.55061 7.98012 3.21061 8.37012C2.87061 8.76012 2.60061 9.22512 2.41061 9.72512C2.22061 10.2251 2.11561 10.7501 2.10061 11.2801C2.08561 11.8101 2.16061 12.3351 2.32061 12.8351C2.48061 13.3351 2.72561 13.8001 3.04061 14.2101L3.03061 14.1701L5.90061 16.0001L3.03061 17.8301L3.04061 17.7901C2.72561 18.1951 2.48061 18.6651 2.32061 19.1651C2.16061 19.6651 2.08561 20.1901 2.10061 20.7201C2.11561 21.2501 2.22061 21.7751 2.41061 22.2751C2.60061 22.7751 2.87061 23.2401 3.21061 23.6301C3.55061 24.0201 3.95561 24.3501 4.41061 24.6001C4.86561 24.8501 5.36061 25.0151 5.87061 25.0901C6.38061 25.1651 6.90061 25.1451 7.40561 25.0301C7.91061 24.9151 8.38561 24.7101 8.81061 24.4251L8.81061 24.4251L11.6806 22.5951L10.2956 23.5901L12.0001 24.0001C12.8156 24.0001 13.6256 23.8401 14.3956 23.5301C15.1656 23.2201 15.8806 22.7651 16.5006 22.1851C17.1206 21.6051 17.6256 20.9201 17.9856 20.1601C18.3456 19.4001 18.5456 18.5851 18.5706 17.7451C19.0656 17.7001 19.5506 17.5751 20.0106 17.3651C20.4706 17.1551 20.8956 16.8701 21.2706 16.5151C21.6456 16.1601 21.9656 15.7451 22.2106 15.2901C22.4556 14.8351 22.6206 14.3501 22.6956 13.8451C22.7706 13.3401 22.7506 12.8301 22.6356 12.3351C22.5206 11.8401 22.3156 11.3651 22.0306 10.9351C21.7456 10.5051 21.3856 10.1301 20.9706 9.83012L20.9806 9.82512C21.0956 9.52512 21.1706 9.20012 21.2006 8.87012C21.2306 8.54012 21.2156 8.20512 21.1506 7.88012C21.0856 7.55512 20.9756 7.24512 20.8206 6.95512C20.6656 6.66512 20.4656 6.40012 20.2306 6.16512L20.2306 6.17012C19.9256 5.74512 19.7056 5.27512 19.5756 4.77512C19.4456 4.27512 19.4056 3.75512 19.4606 3.24012C19.5156 2.72512 19.6656 2.22512 19.9056 1.76012C20.1456 1.29512 20.4706 0.875122 20.8656 0.520122C21.2606 0.165122 21.7206 -0.120128 22.2206 -0.320128C22.7206 -0.520128 23.2506 -0.630128 23.7856 -0.640128C24.3206 -0.650128 24.8506 -0.565128 25.3556 -0.385128C25.8606 -0.205128 26.3306 0.0651219 26.7456 0.410122L26.7456 0.405122C26.4506 0.295122 26.1406 0.225122 25.8206 0.200122C25.5006 0.175122 25.1756 0.195122 24.8606 0.260122C24.5456 0.325122 24.2406 0.435122 23.9556 0.585122C23.6706 0.735122 23.4106 0.930122 23.1756 1.16012L23.1806 1.16012C22.7556 1.44512 22.3806 1.65012 21.9756 1.76512C21.5706 1.88012 21.1406 1.90012 20.7206 1.82512C20.3006 1.75012 19.8956 1.58512 19.5306 1.33512C19.1656 1.08512 18.8506 0.755122 18.5956 0.365122C18.3406 -0.0248781 18.1506 -0.459878 18.0356 -0.924878C17.9206 -1.38988 17.8856 -1.87488 17.9356 -2.36488C17.9856 -2.85488 18.1206 -3.33488 18.3356 -3.78488C18.5506 -4.23488 18.8406 -4.64488 19.1956 -4.99488L19.2006 -4.99488L16.3306 -3.16488L18.0956 -5.40988L18.0956 -5.40988C17.8006 -5.51988 17.4906 -5.58988 17.1706 -5.61488C16.8506 -5.63988 16.5256 -5.61988 16.2106 -5.55488C15.8956 -5.48988 15.5906 -5.37988 15.3056 -5.22988C15.0206 -5.07988 14.7606 -4.88488 14.5306 -4.65488L14.5306 -4.65488L11.6606 -2.82488L13.8656 -0.369878C13.6306 -0.139878 13.3706 0.0551219 13.0856 0.205122C12.8006 0.355122 12.4956 0.465122 12.1806 0.530122C11.8656 0.595122 11.5406 0.615122 11.2206 0.590122C10.9006 0.565122 10.5906 0.495122 10.2956 0.385122L10.2956 0.385122C9.87061 0.670122 9.39561 0.875122 8.89061 0.990122C8.38561 1.10512 7.86561 1.12512 7.35561 1.05012C6.84561 0.975122 6.35061 0.810122 5.89561 0.560122C5.44061 0.310122 5.03561 -0.0198781 4.69561 -0.409878C4.35561 -0.799878 4.08561 -1.26488 3.89561 -1.76488C3.70561 -2.26488 3.60061 -2.78988 3.58561 -3.31988C3.57061 -3.84988 3.64561 -4.37488 3.80561 -4.87488C3.96561 -5.37488 4.21061 -5.83988 4.52561 -6.24988L4.53061 -6.24988L7.40061 -4.41988L4.53061 -2.58988L4.52561 -2.55488C4.21061 -2.14988 3.96561 -1.67988 3.80561 -1.17988C3.64561 -0.679878 3.57061 -0.154878 3.58561 0.375122C3.60061 0.905122 3.70561 1.43012 3.89561 1.93012C4.08561 2.43012 4.35561 2.89512 4.69561 3.28512C5.03561 3.67512 5.44061 4.00512 5.89561 4.25512C6.35061 4.50512 6.84561 4.67012 7.35561 4.74512C7.86561 4.82012 8.38561 4.80012 8.89061 4.68512C9.39561 4.57012 9.87061 4.36512 10.2956 4.08012L10.2956 4.08012L12.0001 5.09012L12.3706 6.82012C12.7856 6.47512 13.2556 6.20512 13.7606 6.02512C14.2656 5.84512 14.7956 5.76012 15.3306 5.77012L12.0001 0.00012207Z" transform="translate(0 6)" />
    </svg>
);
const ClaudeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3V21M3 12H21M5.636 5.636L18.364 18.364M5.636 18.364L18.364 5.636" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);
const GeminiIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white"/>
    </svg>
);
const PerplexityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 9h16 M4 15h16 M8 9L12 4L16 9 M8 15L12 20L16 15 M8 9v6 M16 9v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const DeepSeekIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.33,14.23C3.1,13.28,2.15,9.41,4.1,6.59C6.05,3.77,9.85,2.9,12.91,4.5C15.97,6.1,17.65,9.74,16.5,12.87C16.5,12.87,19.89,12.42,19.89,10.13C19.89,7.84,16.03,8.08,16.03,8.08L15.11,5.26C15.11,5.26,18.55,4.72,21,7.2C23.45,9.68,21.3,13.6,18.07,14.55C14.84,15.5,6.33,14.23,6.33,14.23Z" stroke="white" stroke-width="1.5" />
      <circle cx="8.5" cy="9.5" r="0.5" fill="white" />
    </svg>
);
const GrokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm-1,14H9V8h2Zm4,0H13V8h2Z" stroke="none" fill="white" />
        <path d="M12,12 L17.5,6.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
    </svg>
);


const modelData = [
    { side: 'left', icon: <ChatGptIcon />, name: 'ChatGPT 5', tag: 'All Rounder Explainer', description: 'Great for questions, brainstorming, and clear step-by-step explanations.' },
    { side: 'left', icon: <ClaudeIcon />, name: 'Claude Sonnet 4', tag: 'Co-Writing Master', description: 'Refines polished emails, essays, and scripts while keeping your style.' },
    { side: 'left', icon: <GeminiIcon />, name: 'Gemini 2.5 Pro', tag: 'Long Context Master', description: 'Handles long documents and images, tracking full context and details.' },
    { side: 'right', icon: <PerplexityIcon />, name: 'Perplexity Sonar Pro', tag: 'Live Web Researcher', description: 'Delivers fresh answers and news from credible, real-time sources.' },
    { side: 'right', icon: <DeepSeekIcon />, name: 'DeepSeek', tag: 'Reasoning Specialist', description: 'Excels at logic, math, and coding with clear, detailed solutions.' },
    { side: 'right', icon: <GrokIcon />, name: 'Grok 4', tag: 'Creative Powerhouse', description: 'Bold, unconventional ideas and punchy copy for trend-focused content.' },
];

const ModelCard = ({ icon, name, tag, description }: { icon: JSX.Element, name: string, tag: string, description: string }) => (
  <div className="bg-[#1C1C1C]/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 text-left relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500/20 to-green-600/20 flex-shrink-0 border-2 border-zinc-800">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <span className="inline-block mt-1.5 bg-zinc-800 text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full border border-zinc-700">{tag}</span>
      </div>
    </div>
    <p className="mt-4 text-zinc-400 text-sm leading-relaxed">{description}</p>
  </div>
);

const CentralLogo = () => (
    <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Grainy glow */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0) 60%)',
                filter: 'blur(30px)',
            }}
        ></div>

        {/* Concentric circles */}
        <div className="absolute inset-10 rounded-full border border-white/5 animate-pulse-slow"></div>
        <div className="absolute inset-16 rounded-full border border-white/5 animate-pulse-slow delay-150"></div>
        <div className="absolute inset-24 rounded-full border border-white/5 animate-pulse-slow delay-300"></div>

        {/* Logo SVG */}
        <Logo width={80} height={80} className="relative z-10" />
    </div>
);


const ModelShowcase: React.FC = () => {
    const allModels = [...modelData.filter(m => m.side === 'left'), ...modelData.filter(m => m.side === 'right')];

    return (
      <section className="py-20 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
            <FadeInSection>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tighter">
                Pick the best characteristics<br />of each AI model
                </h2>
            </FadeInSection>

            {/* Desktop Layout */}
            <div className="mt-20 max-w-7xl mx-auto relative h-[700px] hidden lg:block">
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <CentralLogo />
                </div>
                
                <div className="absolute inset-0 pointer-events-none z-0">
                    <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 700" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <radialGradient id="line-grad" cx="640" cy="350" r="400" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#34D399" stopOpacity="0.1" />
                            </radialGradient>
                        </defs>
                        {/* Connector lines */}
                        {/* Left */}
                        <path d="M 620,330 C 534,330 534,110 448,110" stroke="url(#line-grad)" strokeWidth="1.5" />
                        <path d="M 600,350 C 550,390 498,310 448,350" stroke="url(#line-grad)" strokeWidth="1.5" />
                        <path d="M 620,370 C 534,370 534,590 448,590" stroke="url(#line-grad)" strokeWidth="1.5" />
                        {/* Right */}
                        <path d="M 660,330 C 746,330 746,110 832,110" stroke="url(#line-grad)" strokeWidth="1.5" />
                        <path d="M 680,350 C 730,390 782,310 832,350" stroke="url(#line-grad)" strokeWidth="1.5" />
                        <path d="M 660,370 C 746,370 746,590 832,590" stroke="url(#line-grad)" strokeWidth="1.5" />
                    </svg>
                </div>

                <div className="relative z-10 grid grid-cols-2 h-full">
                    <div className="flex flex-col justify-between h-full py-4 items-end pr-48">
                        {modelData.filter(m => m.side === 'left').map((model) => (
                            <FadeInSection key={model.name} direction="right" className="lg:max-w-sm w-full">
                                <ModelCard {...model} />
                            </FadeInSection>
                        ))}
                    </div>
                    
                    <div className="flex flex-col justify-between h-full py-4 items-start pl-48">
                        {modelData.filter(m => m.side === 'right').map((model) => (
                            <FadeInSection key={model.name} direction="left" className="lg:max-w-sm w-full">
                                <ModelCard {...model} />
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Mobile Layout */}
            <div className="mt-16 lg:hidden">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                {allModels.map((model, index) => (
                  <React.Fragment key={model.name}>
                    <FadeInSection className="w-full">
                      <ModelCard {...model} />
                    </FadeInSection>
                    {index === 2 && (
                      <div className="my-8">
                        <CentralLogo />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
        </div>
      </section>
    )
};

export default ModelShowcase;
