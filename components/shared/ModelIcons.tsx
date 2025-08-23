import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ChatGptIcon = ({ size = 32, className = '', style }: IconProps) => (
    <div
        className={`bg-[#10A37F] rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size, ...style }}
    >
        <span
            className="text-white font-bold tracking-tighter leading-none"
            style={{ fontSize: size * 0.35 }}
        >
            GPT
        </span>
    </div>
);

export const GeminiIcon = ({ size = 32, className = '', style }: IconProps) => (
    <div className={`flex items-center justify-center flex-shrink-0 ${className}`} style={{ width: size, height: size, ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size * 0.75} height={size * 0.75} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 3Z"/></svg>
    </div>
);

export const DeepSeekIcon = ({ size = 32, className = '', style }: IconProps) => (
    <div
        className={`bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size, ...style }}
    >
        <span
            className="text-white font-bold tracking-tighter leading-none"
            style={{ fontSize: size * 0.35 }}
        >
            DS
        </span>
    </div>
);

export const PerplexityIcon = ({ size = 32, className = '', style }: IconProps) => (
    <div className={`flex items-center justify-center text-blue-500 flex-shrink-0 ${className}`} style={{ width: size, height: size, ...style }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12H18A6,6 0 0,0 12,6V4M4,12A8,8 0 0,1 12,4V6A6,6 0 0,0 6,12H4M12,20A8,8 0 0,1 4,12H6A6,6 0 0,0 12,18V20M20,12A8,8 0 0,1 12,20V18A6,6 0 0,0 18,12H20Z" />
        </svg>
    </div>
);

export const ClaudeIcon = ({ size = 32, className = '', style }: IconProps) => (
    <div
        className={`rounded-md bg-[#d0825f] flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
        style={{ width: size, height: size, ...style }}
    >
        <span className="leading-none" style={{ fontSize: size * 0.5 }}>
            C
        </span>
    </div>
);

export const GrokIcon = ({ size = 32, className = '', style }: IconProps) => (
    <div
        className={`rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size, padding: size * 0.15, ...style }}
    >
        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 256 256">
            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path>
        </svg>
    </div>
);