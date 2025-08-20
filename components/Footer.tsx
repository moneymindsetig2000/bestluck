import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-gray-400">
      <div className="container mx-auto px-6 py-12">
        {/* Support Email */}
        <div className="flex justify-center mb-8">
          <a href="mailto:support@aifiesta.ai" className="flex items-center gap-3 text-base text-gray-300 hover:text-white transition-colors duration-300">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            <span>support@aifiesta.ai</span>
          </a>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-8 mb-4 sm:mb-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
          <p className="text-gray-500">
            &copy; 2025 AI Fiesta. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
