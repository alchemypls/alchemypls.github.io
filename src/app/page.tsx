'use client';

import { useState, useEffect } from 'react';
import StarChart from '@/components/StarChart';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-950">
      <header className="w-full max-w-5xl text-center mb-8 text-white">
        <h1 className="text-4xl md:text-6xl font-bold tracking-wider font-mono mb-4">
          <span className="text-blue-500">STELLAR</span> PORTFOLIO
        </h1>
        <p className="text-xl text-gray-300">Navigate the cosmos to discover projects and artifacts</p>
      </header>

      <div className="w-full max-w-5xl mb-12">
        {isMounted ? (
          <StarChart />
        ) : (
          <div className="bg-gray-900 rounded-lg border-2 border-gray-800 flex items-center justify-center" 
               style={{ height: '600px' }}>
            <div className="text-gray-400 text-xl font-mono">
              <span className="inline-block animate-pulse mr-2">⭐</span>
              Initializing Star Chart
              <span className="inline-block animate-pulse ml-2">⭐</span>
            </div>
          </div>
        )}
      </div>
      
      <footer className="w-full max-w-5xl text-center text-gray-500 text-sm">
        <p>Navigation system online. Use arrow keys to explore the stars.</p>
      </footer>
    </main>
  );
}
