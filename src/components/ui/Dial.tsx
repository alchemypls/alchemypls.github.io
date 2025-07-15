'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DialProps {
  sections: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
}

export const Dial: React.FC<DialProps> = ({ sections }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSections = sections.length;
  
  const rotateToSection = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black/90">
      <motion.div 
        className="relative w-[800px] h-[800px]"
        initial={false}
      >
        {sections.map((section, index) => {
          const rotation = (index - activeIndex) * (360 / totalSections);
          
          return (
            <motion.div
              key={section.id}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                transformOrigin: '50% 50%'
              }}
              animate={{
                rotate: rotation,
                scale: index === activeIndex ? 1 : 0.8,
                opacity: index === activeIndex ? 1 : 0.3,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <div className="absolute inset-4 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 p-8 overflow-hidden">
                <h2 className="text-3xl font-bold text-white mb-4">{section.title}</h2>
                {section.content}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => rotateToSection(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === activeIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}; 