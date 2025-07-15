'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import StarField from './StarField';
import constellations from '@/data/processedConstellations.json';
import navigableStars from '@/data/navigableStars.json';
import { useRouter } from 'next/navigation';
import { useGameState, Star, NavigationOption } from '@/data/gameState';
import NavigationArrow from './NavigationArrow';

// Type for constellation data from JSON
interface Constellation {
  id: string;
  abbr: string;
  name: string;
  description: string;
  stars: string[];
  mainStars: string[];
  connections: [string, string][];
}

interface StarChartProps {
  initialStarId?: string;
  initialZoom?: number;
}

const StarChart: React.FC<StarChartProps> = ({ 
  initialStarId = "alnilam", // Default to Alnilam (middle star of Orion's Belt)
  initialZoom = 1.0 
}) => {
  // State for viewport and interaction
  const [viewportX, setViewportX] = useState(0);
  const [viewportY, setViewportY] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(4000);
  const [viewportHeight, setViewportHeight] = useState(2000);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [navigationOptions, setNavigationOptions] = useState<NavigationOption[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Refs
  const animationRef = useRef<number | null>(null);
  const targetPositionRef = useRef<{x: number, y: number} | null>(null);
  
  const router = useRouter();

  // Get game state
  const { 
    stars,
    constellations: gameConstellations,
    currentStarId,
    visitedStars,
    unlockedConstellations,
    zoomLevel,
    maxZoomLevel,
    setCurrentStar,
    visitStar,
    getNavigationOptions,
    setStarData,
    setConstellationData,
    getCompletionStats
  } = useGameState();

  // Set mounted state to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize game data
  useEffect(() => {
    if (!isMounted) return;
    
    // Load star data if not already loaded
    if (Object.keys(stars).length === 0) {
      setStarData(navigableStars as Star[]);
    }
    
    // Load constellation data if not already loaded
    if (Object.keys(gameConstellations).length === 0) {
      // Transform constellations to add the discovered property
      const constellationsWithDiscovery: Record<string, any> = {};
      Object.entries(constellations).forEach(([key, value]) => {
        constellationsWithDiscovery[key.toLowerCase()] = {
          ...value,
          discovered: false
        };
      });
      setConstellationData(constellationsWithDiscovery);
    }
    
    // Set initial star if none is selected yet
    if (!currentStarId && initialStarId && Object.keys(stars).length > 0) {
      if (stars[initialStarId]) {
        setCurrentStar(initialStarId);
      } else {
        // If specified star doesn't exist, find a star in Orion
        const orionStar = Object.values(stars).find(s => 
          s.constellation.toLowerCase() === 'ori'
        );
        if (orionStar) {
          setCurrentStar(orionStar.id);
        }
      }
    }
  }, [stars, gameConstellations, currentStarId, initialStarId, setCurrentStar, setStarData, setConstellationData, isMounted]);

  // Update navigation options when current star changes
  useEffect(() => {
    if (currentStarId) {
      const options = getNavigationOptions();
      setNavigationOptions(options);
    }
  }, [currentStarId, getNavigationOptions]);

  // Center viewport on current star
  useEffect(() => {
    if (currentStarId && stars[currentStarId]) {
      const currentStar = stars[currentStarId];
      centerOnStar(currentStar, false);
    }
  }, [currentStarId, stars]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 40, 1200);
      const height = Math.floor(width * 0.6);
      setDimensions({ width, height });
    };
    
    handleResize(); // Set initial dimensions
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle zoom changes based on progress
  useEffect(() => {
    // Calculate zoom level based on progress
    const stats = getCompletionStats();
    const progressFactor = Math.min(1, stats.constellationsCompleted / (stats.totalConstellations * 0.75));
    const calculatedZoom = 1.0 + progressFactor * 2.0;
    
    // Apply zoom constraints
    const viewWidth = 4000 / (calculatedZoom * zoomLevel);
    const viewHeight = viewWidth / (dimensions.width / dimensions.height);
    
    setViewportWidth(viewWidth);
    setViewportHeight(viewHeight);
  }, [getCompletionStats, zoomLevel, dimensions.width, dimensions.height, maxZoomLevel]);

  // Function to center the viewport on a star
  const centerOnStar = useCallback((star: Star, animate: boolean = true) => {
    if (!star) return;
    
    const targetX = star.displayX - viewportWidth / 2;
    const targetY = star.displayY - viewportHeight / 2;
    
    if (animate) {
      // Cancel any running animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      targetPositionRef.current = { x: targetX, y: targetY };
      setIsMoving(true);
      
      // Start animation
      const startTime = Date.now();
      const duration = 1000; // 1 second animation
      const startX = viewportX;
      const startY = viewportY;
      const deltaX = targetX - startX;
      const deltaY = targetY - startY;
      
      const animateMove = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-in-out function
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        setViewportX(startX + deltaX * eased);
        setViewportY(startY + deltaY * eased);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateMove);
        } else {
          setIsMoving(false);
          animationRef.current = null;
          targetPositionRef.current = null;
        }
      };
      
      animationRef.current = requestAnimationFrame(animateMove);
    } else {
      // Immediate positioning
      setViewportX(targetX);
      setViewportY(targetY);
    }
  }, [viewportWidth, viewportHeight, viewportX, viewportY]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMoving) return; // Ignore keypresses during animation
      
      let direction: 'up' | 'right' | 'down' | 'left' | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          break;
      }
      
      if (direction) {
        const option = navigationOptions.find(opt => opt.direction === direction);
        if (option && stars[option.starId]) {
          setCurrentStar(option.starId);
          setSelectedStar(stars[option.starId]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigationOptions, stars, setCurrentStar, isMoving]);
  
  // Handle star click
  const handleStarClick = (star: Star) => {
    // Only allow navigation to connected stars
    if (!currentStarId || 
        navigationOptions.some(opt => opt.starId === star.id) ||
        star.id === currentStarId) {
      setCurrentStar(star.id);
      setSelectedStar(star);
      
      if (star.type === 'project') {
        // Navigate to project page if this is a project star
        router.push(`/projects/${star.id}`);
      }
    }
  };

  const stats = getCompletionStats();

  // Convert visitedStars Set to Array for prop passing (to avoid "has is not a function" error)
  const visitedStarsArray = visitedStars ? Array.from(visitedStars) : [];

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center" style={{ width: dimensions.width, height: dimensions.height, background: 'black' }}>
        <div className="text-white font-mono">Loading star chart...</div>
      </div>
    );
  }

  return (
    <div className="star-chart-container">
      <div className="star-field-container" style={{ width: dimensions.width, height: dimensions.height }}>
        <StarField
          width={dimensions.width}
          height={dimensions.height}
          viewportX={viewportX}
          viewportY={viewportY}
          viewportWidth={viewportWidth}
          viewportHeight={viewportHeight}
          onStarClick={handleStarClick}
          visitedStars={visitedStarsArray}
        />
        
        {/* Navigation arrows */}
        {navigationOptions.map((option) => (
          <NavigationArrow 
            key={option.direction}
            direction={option.direction}
            onClick={() => {
              if (!isMoving && stars[option.starId]) {
                setCurrentStar(option.starId);
                setSelectedStar(stars[option.starId]);
              }
            }}
          />
        ))}
        
        {/* Star info panel */}
        {selectedStar && (
          <div className="star-info-panel">
            <h3>{selectedStar.proper}</h3>
            <p>Constellation: {selectedStar.constellation}</p>
            <p>Magnitude: {selectedStar.mag.toFixed(2)}</p>
            {visitedStars.has(selectedStar.id) ? (
              <span className="text-green-400">✓ Discovered</span>
            ) : (
              <span className="text-gray-400">Not yet discovered</span>
            )}
            {selectedStar.type === 'project' && (
              <button 
                onClick={() => router.push(`/projects/${selectedStar.id}`)}
                className="mt-3 px-4 py-2 bg-blue-700 text-white rounded"
              >
                View Project
              </button>
            )}
          </div>
        )}
        
        {/* Progress indicator */}
        <div className="progress-panel">
          <div className="progress-title">Stellar Exploration</div>
          <div className="progress-stats">
            <div>Stars: {stats.starsFound}/{stats.totalStars}</div>
            <div>Constellations: {stats.constellationsCompleted}/{stats.totalConstellations}</div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(stats.starsFound / stats.totalStars) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .star-chart-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 1rem;
        }
        
        .star-field-container {
          position: relative;
          border: 2px solid #2f3542;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 30, 60, 0.5);
        }
        
        .star-info-panel {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(10, 20, 30, 0.8);
          padding: 15px;
          border-radius: 8px;
          color: #dfe4ea;
          max-width: 300px;
          font-family: 'Space Mono', monospace;
        }
        
        .star-info-panel h3 {
          margin-top: 0;
          color: #5352ed;
        }
        
        .progress-panel {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(10, 20, 30, 0.8);
          padding: 15px;
          border-radius: 8px;
          color: #dfe4ea;
          width: 250px;
          font-family: 'Space Mono', monospace;
        }
        
        .progress-title {
          font-size: 14px;
          margin-bottom: 10px;
          color: #5352ed;
        }
        
        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: #5352ed;
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  );
};

export default StarChart; 