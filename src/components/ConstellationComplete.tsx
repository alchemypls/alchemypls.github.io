'use client';

import React from 'react';

interface ConstellationCompleteProps {
  name: string;
  description: string;
}

export const ConstellationComplete = ({ name, description }: ConstellationCompleteProps) => {
  return (
    <div className="constellation-complete visible">
      <div className="constellation-name">{name}</div>
      <div className="constellation-description">{description}</div>
    </div>
  );
}; 