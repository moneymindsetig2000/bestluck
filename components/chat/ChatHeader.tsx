import React from 'react';

interface ModelConfig {
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface ChatHeaderProps {
  model: ModelConfig;
  isExpanded: boolean;
  isCollapsed: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
}

const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean, onToggle: () => void }) => {
    return (
        <button onClick={onToggle} className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
            <span className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    );
};

const ResizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20L20 4M15 4h5v5M4 15v5h5" />
    </svg>
);

const ChatHeader: React.FC<ChatHeaderProps> = ({ model, isExpanded, isCollapsed, onToggleExpand, onToggleEnabled }) => {
    return (
        <header className="flex-shrink-0 bg-[#171717] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
            <div
                className="flex items-center gap-2 text-sm font-medium text-gray-200 whitespace-nowrap cursor-default overflow-hidden"
            >
                {model.icon}
                {!isCollapsed && <span>{model.name}</span>}
            </div>
            <div className="flex items-center gap-4">
                <button className="group" aria-label={isExpanded ? "Collapse column" : "Expand column"} onClick={onToggleExpand}>
                    <ResizeIcon />
                </button>
                {!isCollapsed && <ToggleSwitch enabled={model.enabled} onToggle={onToggleEnabled} />}
            </div>
        </header>
    );
};

export default ChatHeader;