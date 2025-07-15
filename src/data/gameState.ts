import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types for our game state
export interface Star {
  id: string;
  proper: string;
  displayX: number;
  displayY: number;
  mag: number;
  color: string;
  constellation: string;
  isNavigable: boolean;
  type: 'project' | 'cosmic';
}

export interface Constellation {
  id: string;
  abbr: string;
  name: string;
  description: string;
  stars: string[];
  mainStars: string[];
  connections: [string, string][];
  discovered: boolean;
}

export interface NavigationOption {
  direction: 'up' | 'right' | 'down' | 'left';
  starId: string;
  distance: number;
}

interface GameState {
  // Current position and view state
  currentStarId: string | null;
  visitedStars: Set<string>;
  unlockedConstellations: Set<string>;
  currentConstellation: string | null;
  zoomLevel: number;
  maxZoomLevel: number;
  
  // Star data references
  stars: Record<string, Star>;
  constellations: Record<string, Constellation>;
  
  // Game state actions
  setCurrentStar: (starId: string) => void;
  visitStar: (starId: string) => void;
  unlockConstellation: (constellationId: string) => void;
  setStarData: (stars: Star[]) => void;
  setConstellationData: (constellations: Record<string, Constellation>) => void;
  getNavigationOptions: () => NavigationOption[];
  resetProgress: () => void;
  canNavigateTo: (starId: string) => boolean;
  getCompletionStats: () => { starsFound: number, totalStars: number, constellationsCompleted: number, totalConstellations: number };
}

// Create the store with Zustand
export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStarId: null,
      visitedStars: new Set<string>(),
      unlockedConstellations: new Set<string>(['ori']), // Start with Orion unlocked
      currentConstellation: 'ori',
      zoomLevel: 1.0,
      maxZoomLevel: 1.2,
      stars: {},
      constellations: {},
      
      // Actions
      setCurrentStar: (starId) => {
        const stars = get().stars;
        const star = stars[starId];
        
        if (star) {
          set({ 
            currentStarId: starId,
            currentConstellation: star.constellation.toLowerCase()
          });
          get().visitStar(starId);
        }
      },
      
      visitStar: (starId) => {
        // Ensure visitedStars is a proper Set by creating a new one
        // If the current visitedStars is not iterable, start with an empty array
        let currentVisitedStars: string[] = [];
        try {
          // Try to convert existing visitedStars to an array if it's iterable
          if (get().visitedStars && typeof get().visitedStars[Symbol.iterator] === 'function') {
            currentVisitedStars = Array.from(get().visitedStars);
          }
        } catch (e) {
          console.warn('Error converting visitedStars to array:', e);
          // Continue with empty array
        }
        
        // Create a new Set from the array (will always work)
        const visitedStars = new Set<string>(currentVisitedStars);
        visitedStars.add(starId);
        
        // Check if adding this star completes a constellation
        const { stars, constellations, unlockedConstellations } = get();
        const star = stars[starId];
        
        if (star) {
          const constId = star.constellation.toLowerCase();
          const constellation = constellations[constId];
          
          if (constellation) {
            // Check if all main stars in this constellation are visited
            const mainStarsVisited = constellation.mainStars.every(mainStarId => 
              visitedStars.has(mainStarId)
            );
            
            // If all main stars are visited, unlock connected constellations
            if (mainStarsVisited && !constellation.discovered) {
              const updatedConstellations = { ...constellations };
              updatedConstellations[constId] = {
                ...constellation,
                discovered: true
              };
              
              // Unlock adjacent constellations (simplified - actual implementation would use real adjacency data)
              // For now let's unlock up to 3 constellations based on a predefined path
              const newUnlockedConsts = new Set(unlockedConstellations);
              
              if (constId === 'ori') {
                newUnlockedConsts.add('tau');
                newUnlockedConsts.add('gem');
                newUnlockedConsts.add('cma');
              } else if (constId === 'tau') {
                newUnlockedConsts.add('aur');
                newUnlockedConsts.add('gem');
              } else if (constId === 'gem') {
                newUnlockedConsts.add('cnc');
                newUnlockedConsts.add('leo');
              }
              // More constellation unlocking logic here...
              
              // Increase max zoom level as more constellations are unlocked
              const newMaxZoom = Math.min(3.0, 1.0 + (newUnlockedConsts.size * 0.2));
              
              set({ 
                visitedStars, 
                unlockedConstellations: newUnlockedConsts,
                constellations: updatedConstellations,
                maxZoomLevel: newMaxZoom
              });
              return;
            }
          }
        }
        
        set({ visitedStars });
      },
      
      unlockConstellation: (constellationId) => {
        const unlockedConstellations = new Set(get().unlockedConstellations);
        unlockedConstellations.add(constellationId.toLowerCase());
        set({ unlockedConstellations });
      },
      
      setStarData: (stars) => {
        const starsMap: Record<string, Star> = {};
        stars.forEach(star => {
          starsMap[star.id] = star;
        });
        set({ stars: starsMap });
      },
      
      setConstellationData: (constellations) => {
        set({ constellations });
      },
      
      getNavigationOptions: () => {
        const { currentStarId, stars, constellations, currentConstellation } = get();
        
        if (!currentStarId || !stars[currentStarId] || !currentConstellation) {
          return [] as NavigationOption[];
        }
        
        const currentStar = stars[currentStarId];
        const constellation = constellations[currentConstellation];
        
        if (!constellation) return [] as NavigationOption[];
        
        // Find all stars in the same constellation
        const constellationStars = constellation.stars
          .map(id => stars[id])
          .filter(Boolean);
        
        const currentX = currentStar.displayX;
        const currentY = currentStar.displayY;
        
        // Find stars in each direction
        let up: NavigationOption | null = null;
        let right: NavigationOption | null = null;
        let down: NavigationOption | null = null;
        let left: NavigationOption | null = null;
        
        // For each star in the constellation, check if it's in a clear direction
        // and closer than any previously found star in that direction
        constellationStars.forEach(star => {
          if (star.id === currentStarId) return;
          
          const dx = star.displayX - currentX;
          const dy = star.displayY - currentY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Define directional quadrants (simplified for clarity)
          const angleRad = Math.atan2(dy, dx);
          const angleDeg = angleRad * (180 / Math.PI);
          
          // Determine direction based on angle
          if (angleDeg >= -45 && angleDeg <= 45) {
            // Right
            if (!right || distance < right.distance) {
              right = { direction: 'right', starId: star.id, distance };
            }
          } else if (angleDeg >= 45 && angleDeg <= 135) {
            // Down
            if (!down || distance < down.distance) {
              down = { direction: 'down', starId: star.id, distance };
            }
          } else if (angleDeg >= -135 && angleDeg <= -45) {
            // Up
            if (!up || distance < up.distance) {
              up = { direction: 'up', starId: star.id, distance };
            }
          } else {
            // Left
            if (!left || distance < left.distance) {
              left = { direction: 'left', starId: star.id, distance };
            }
          }
        });
        
        // Filter out null options and return
        const options: NavigationOption[] = [];
        if (up) options.push(up);
        if (right) options.push(right);
        if (down) options.push(down);
        if (left) options.push(left);
        return options;
      },
      
      resetProgress: () => {
        set({
          currentStarId: null,
          visitedStars: new Set<string>(),
          unlockedConstellations: new Set<string>(['ori']),
          currentConstellation: 'ori',
          zoomLevel: 1.0,
          maxZoomLevel: 1.2
        });
      },
      
      canNavigateTo: (starId) => {
        const { currentStarId, stars, constellations, unlockedConstellations } = get();
        
        if (!currentStarId || !stars[starId]) return false;
        
        const targetStar = stars[starId];
        const constId = targetStar.constellation.toLowerCase();
        
        // Check if the constellation is unlocked
        if (!unlockedConstellations.has(constId)) return false;
        
        // If in the same constellation, check if there's a direct connection
        const currentStar = stars[currentStarId];
        if (currentStar.constellation === targetStar.constellation) {
          const constellation = constellations[constId];
          if (constellation) {
            // Check if these stars are directly connected
            return constellation.connections.some(
              ([id1, id2]) => 
                (id1 === currentStarId && id2 === starId) || 
                (id1 === starId && id2 === currentStarId)
            );
          }
        }
        
        return false;
      },
      
      getCompletionStats: () => {
        const { visitedStars, stars, constellations } = get();
        
        const totalStars = Object.keys(stars).length;
        const starsFound = visitedStars.size;
        
        const completedConstellations = Object.values(constellations).filter(c => c.discovered).length;
        const totalConstellations = Object.keys(constellations).length;
        
        return {
          starsFound,
          totalStars,
          constellationsCompleted: completedConstellations,
          totalConstellations
        };
      }
    }),
    {
      name: 'stellar-game-storage'
    }
  )
); 