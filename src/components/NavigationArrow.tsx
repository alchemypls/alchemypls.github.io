'use client';

import React from 'react';

interface NavigationArrowProps {
  direction: 'up' | 'right' | 'down' | 'left';
  onClick: () => void;
}

const NavigationArrow: React.FC<NavigationArrowProps> = ({ direction, onClick }) => {
  // Calculate position based on direction
  const getPosition = () => {
    switch (direction) {
      case 'up':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'right':
        return { top: '50%', right: '20px', transform: 'translateY(-50%)' };
      case 'down':
        return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { top: '50%', left: '20px', transform: 'translateY(-50%)' };
    }
  };

  // Get arrow shape based on direction
  const getArrowPath = () => {
    switch (direction) {
      case 'up':
        return 'M0,20 L15,0 L30,20';
      case 'right':
        return 'M0,0 L20,15 L0,30';
      case 'down':
        return 'M0,0 L15,20 L30,0';
      case 'left':
        return 'M20,0 L0,15 L20,30';
    }
  };

  const position = getPosition();

  return (
    <div 
      className="navigation-arrow"
      style={{ 
        position: 'absolute',
        ...position
      }}
      onClick={onClick}
    >
      <svg width="30" height="30" viewBox="0 0 30 30">
        <path 
          d={getArrowPath()} 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      <style jsx>{`
        .navigation-arrow {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 20, 30, 0.6);
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }

        .navigation-arrow:hover {
          background: rgba(30, 60, 120, 0.8);
          transform: scale(1.2) ${direction === 'up' ? 'translateY(-5px)' : 
                              direction === 'right' ? 'translateX(5px)' : 
                              direction === 'down' ? 'translateY(5px)' : 
                              'translateX(-5px)'};
        }

        .navigation-arrow svg {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </div>
  );
};

export default NavigationArrow; 