'use client';

import React, { useEffect, useRef, useState } from 'react';
import backgroundStars from '@/data/backgroundStars.json';
import navigableStars from '@/data/navigableStars.json';

interface BackgroundStar {
  x: number;
  y: number;
  mag: number;
  color: string;
}

interface Star {
  id: string;
  hipId?: number;
  proper: string;
  ra: number;
  dec: number;
  mag: number;
  absMag: number;
  dist: number;
  colorIndex: number;
  spectrum: string;
  x: number;
  y: number;
  z: number;
  constellation: string;
  bayer?: string;
  displayX: number;
  displayY: number;
  color: string;
  isNavigable: boolean;
  type: 'project' | 'cosmic';
}

interface StarFieldProps {
  width: number;
  height: number;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  visitedStars?: Set<string> | string[];
  onStarClick?: (star: Star) => void;
}

const StarField: React.FC<StarFieldProps> = ({
  width,
  height,
  viewportX,
  viewportY,
  viewportWidth,
  viewportHeight,
  visitedStars = new Set<string>(),
  onStarClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null);
  // Use a ref for animation time to avoid hydration issues
  const animTimeRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  // Helper function to check if a star is visited
  const isStarVisited = (starId: string): boolean => {
    if (visitedStars instanceof Set) {
      return visitedStars.has(starId);
    }
    if (Array.isArray(visitedStars)) {
      return visitedStars.includes(starId);
    }
    return false;
  };
  
  // Set mounted state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Set up animation frame for pulse effect
    let animationId: number;
    const animate = () => {
      animTimeRef.current += 1;
      setRenderTrigger(prev => !prev);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  // State to trigger renders for animations
  const [renderTrigger, setRenderTrigger] = useState(false);
  
  // Render stars on canvas
  useEffect(() => {
    if (!mounted) return; // Skip rendering until client-side
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Scale factor from star map to viewport
    const scaleX = width / viewportWidth;
    const scaleY = height / viewportHeight;
    
    // Function to convert map coordinates to screen coordinates
    const mapToScreen = (x: number, y: number) => {
      return {
        x: (x - viewportX) * scaleX,
        y: (y - viewportY) * scaleY
      };
    };
    
    // Render background stars (non-interactive)
    ctx.globalAlpha = 0.6;
    (backgroundStars as BackgroundStar[]).forEach(star => {
      // Check if the star is within the viewport
      if (
        star.x < viewportX || star.x > viewportX + viewportWidth ||
        star.y < viewportY || star.y > viewportY + viewportHeight
      ) {
        return; // Skip stars outside viewport
      }
      
      const { x, y } = mapToScreen(star.x, star.y);
      
      // Calculate size based on magnitude (brighter = larger)
      // Magnitude is inverted in astronomy (smaller number = brighter star)
      const size = Math.max(0.5, 2.5 - star.mag * 0.3);
      
      // Draw star
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Render navigable stars (interactive)
    ctx.globalAlpha = 1.0;
    (navigableStars as Star[]).forEach(star => {
      // Check if the star is within the viewport
      if (
        star.displayX < viewportX || star.displayX > viewportX + viewportWidth ||
        star.displayY < viewportY || star.displayY > viewportY + viewportHeight
      ) {
        return; // Skip stars outside viewport
      }
      
      const { x, y } = mapToScreen(star.displayX, star.displayY);
      
      // Calculate size based on magnitude (brighter = larger)
      // Add extra size for navigable stars
      const size = Math.max(3, 5 - star.mag * 0.5);
      
      // Draw star
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw glow for brighter stars
      if (star.mag < 2.5) {
        const glowSize = size * 3;
        const gradient = ctx.createRadialGradient(x, y, size, x, y, glowSize);
        gradient.addColorStop(0, `${star.color}99`); // Semi-transparent
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw special indicator for discovered stars
      if (isStarVisited(star.id)) {
        // Outer ring for visited stars
        ctx.strokeStyle = '#5352ed';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size + 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add subtle pulse effect for visited stars - using ref to avoid hydration issues
        const pulseAmplitude = 2;
        const pulseFrequency = 0.05; 
        const pulseSize = size + 8 + pulseAmplitude * Math.sin(animTimeRef.current * pulseFrequency);
        
        ctx.strokeStyle = 'rgba(83, 82, 237, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Special indicator for project stars
      if (star.type === 'project') {
        // Draw a small diamond shape around the star
        const diamondSize = size + 5;
        ctx.strokeStyle = '#ff9f43';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - diamondSize); // Top
        ctx.lineTo(x + diamondSize, y); // Right
        ctx.lineTo(x, y + diamondSize); // Bottom
        ctx.lineTo(x - diamondSize, y); // Left
        ctx.closePath();
        ctx.stroke();
      }
      
      // Highlight if this is the hovered star
      if (hoveredStar && star.id === hoveredStar.id) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, size + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw name label
        ctx.fillStyle = 'white';
        ctx.font = '14px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(star.proper, x, y + size + 20);
      }
    });
    
  }, [width, height, viewportX, viewportY, viewportWidth, viewportHeight, hoveredStar, visitedStars, renderTrigger, mounted]);
  
  // Handle mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates back to map coordinates
    const scaleX = width / viewportWidth;
    const scaleY = height / viewportHeight;
    
    const mapX = viewportX + (x / scaleX);
    const mapY = viewportY + (y / scaleY);
    
    // Find if we're hovering over a navigable star
    const hovered = (navigableStars as Star[]).find(star => {
      const dx = star.displayX - mapX;
      const dy = star.displayY - mapY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Size threshold based on magnitude
      const size = Math.max(5, 10 - star.mag);
      
      return distance <= size * (width / viewportWidth / 5);
    });
    
    setHoveredStar(hovered || null);
  };
  
  const handleClick = () => {
    if (hoveredStar && onStarClick) {
      onStarClick(hoveredStar);
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ 
        cursor: hoveredStar ? 'pointer' : 'default',
        background: 'black' 
      }}
    />
  );
};

export default StarField; 