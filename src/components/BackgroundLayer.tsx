'use client';

import React from 'react';

interface BackgroundLayerProps {
  revealOpacity: number;
}

export const BackgroundLayer = ({ revealOpacity }: BackgroundLayerProps) => {
  return (
    <>
      {/* Base starfield background - you can replace these with actual image paths */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #000 70%)',
        }}
      />
      
      {/* Visceral map that gets revealed */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 z-10"
        style={{
          background: 'url("/images/visceral_map.png") center/cover no-repeat, radial-gradient(ellipse at center, rgba(65, 10, 120, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
          opacity: revealOpacity,
        }}
      />
    </>
  );
}; 