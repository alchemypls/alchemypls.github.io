'use client';

import React from 'react';

export const NavigationBar = () => {
  return (
    <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center p-4 bg-black/50 rounded-lg shadow-lg backdrop-blur-sm">
      <div className="text-xl font-bold text-cyan-400">
        STELLAR PORTFOLIO
      </div>
      <nav className="flex space-x-6">
        {['About', 'Projects', 'Contact', 'GitHub'].map((item) => (
          <a
            key={item}
            href="#"
            className="text-gray-300 hover:text-cyan-300 transition-colors duration-300 relative group"
          >
            {item}
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
        ))}
      </nav>
      <div className="text-sm text-gray-400">
        Status: <span className="text-green-400">Scanning</span>
      </div>
    </div>
  );
}; 