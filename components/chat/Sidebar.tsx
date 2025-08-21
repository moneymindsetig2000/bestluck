import React from 'react';

const Logo = () => (
  <div className="flex items-center gap-2 p-2">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="14" cy="14" rx="12" ry="5" transform="rotate(45 14 14)" stroke="url(#g1_sidebar)" strokeWidth="2.5"/>
      <ellipse cx="14" cy="14" rx="12" ry="5" transform="rotate(-45 14 14)" stroke="url(#g2_sidebar)" strokeWidth="2.5"/>
      <defs>
        <linearGradient id="g1_sidebar" x1="2" y1="14" x2="26" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9"/>
          <stop offset="1" stopColor="#0891B2"/>
        </linearGradient>
        <linearGradient id="g2_sidebar" x1="2" y1="14" x2="26" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399"/>
          <stop offset="1" stopColor="#059669"/>
        </linearGradient>
      </defs>
    </svg>
  </div>
);

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user: { name: string; avatar: string; } | null;
  onLogout: () => void;
  onLogin: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, user, onLogout, onLogin }) => {
  return (
    <aside className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-[260px]'} bg-[#171717] p-2 flex flex-col h-screen border-r border-zinc-800`}>
      <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Logo />
        {!isCollapsed && 
          <button className="w-10 h-10 bg-[#272727] rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="New Chat">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      </div>

      {isCollapsed && 
        <div className="flex justify-center mb-4">
            <button className="w-10 h-10 bg-[#272727] rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="New Chat">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
      }

      <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        {/* Chat history list will be populated here */}
      </div>

      <div className="mt-auto space-y-1">
         <button onClick={onToggleCollapse} className={`flex items-center w-full p-2 rounded-lg text-gray-300 hover:bg-[#272727] ${isCollapsed ? 'justify-center' : ''}`} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H10V4Z" />
              <path d="M19 4H12V20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4ZM19 18H14V6H19V18Z" />
            </svg>
            <span className={`whitespace-nowrap overflow-hidden transition-all ${isCollapsed ? 'w-0' : 'w-auto ml-3'}`}>
                {isCollapsed ? '' : 'Collapse'}
            </span>
         </button>
          {user ? (
            <>
              <div className={`flex items-center w-full p-2 rounded-lg text-gray-300 ${isCollapsed ? 'justify-center' : ''}`}>
                <img src={user.avatar} alt={user.name} className="h-6 w-6 flex-shrink-0 rounded-full" />
                <span className={`whitespace-nowrap overflow-hidden transition-all ${isCollapsed ? 'w-0' : 'w-auto ml-3'}`}>
                  {!isCollapsed && user.name}
                </span>
              </div>
              <button onClick={onLogout} className={`flex items-center w-full p-2 rounded-lg text-gray-300 hover:bg-[#272727] ${isCollapsed ? 'justify-center' : ''}`} aria-label="Sign Out">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span className={`whitespace-nowrap overflow-hidden transition-all ${isCollapsed ? 'w-0' : 'w-auto ml-3'}`}>
                  {!isCollapsed && 'Sign Out'}
                </span>
              </button>
            </>
          ) : (
            <button onClick={onLogin} className={`flex items-center w-full p-2 rounded-lg text-gray-300 hover:bg-[#272727] ${isCollapsed ? 'justify-center' : ''}`} aria-label="Sign In">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>
                <span className={`whitespace-nowrap overflow-hidden transition-all ${isCollapsed ? 'w-0' : 'w-auto ml-3'}`}>
                  {!isCollapsed && 'Sign In'}
                </span>
              </button>
          )}
         <button className={`flex items-center w-full p-2 rounded-lg text-gray-300 hover:bg-[#272727] ${isCollapsed ? 'justify-center' : ''}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className={`whitespace-nowrap overflow-hidden transition-all ${isCollapsed ? 'w-0' : 'w-auto ml-3'}`}>
                {isCollapsed ? '' : 'Settings'}
            </span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
