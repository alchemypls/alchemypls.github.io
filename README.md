# Stellar Portfolio

An interactive stellar portfolio website that lets users navigate through constellations to discover projects. The experience combines astronomy with web development, allowing visitors to explore the cosmos while learning about featured projects.

## Features

- **Interactive Star Navigation**: Navigate between stars in constellations using intuitive controls
- **Constellation Discovery**: Progressively unlock and discover constellations as you explore
- **Canvas-based Star Rendering**: Efficient rendering of thousands of stars with proper depth and visual appeal
- **Portfolio Integration**: Projects attached to significant stars in the night sky
- **Progress Tracking**: Game-like mechanics to track visited stars and discovered constellations

## Technical Stack

- **Framework**: Next.js with TypeScript
- **Rendering**: Canvas API for efficient star field rendering
- **State Management**: Zustand for global state and persistence
- **Data**: Processed HYG star database (119,627 stars) optimized into three data files:
  - 98 navigable stars (bright, named stars users can click)
  - 3,710 background stars (dimmer stars for visual depth)
  - 25 major constellations with defined star connections

## Core Components

- **StarField**: Canvas-based component for efficient star rendering
- **StarChart**: Navigation controls and animations for constellation exploration
- **NavigationArrow**: Directional navigation between connected stars
- **Project Pages**: Individual pages for stars with attached portfolio projects

## Featured Projects

Currently attached to famous stars:

- Deneb (Alpha Cygni) → Stellar Portfolio Engine
- Sadr (Gamma Cygni) → Constellation Mapper
- Betelgeuse (Alpha Orionis) → Nebula Framework
- Vega (Alpha Lyrae) → Astral Analytics
- Regulus (Alpha Leonis) → Orbital CMS

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Roadmap

- Enhance star chart rendering with WebGL for better performance
- Add smooth transitions between star navigation
- Implement audio effects for a more immersive experience
- Create additional project showcases for more stars
- Add educational content about astronomy alongside portfolio items

## Immediate Next Steps

1. Implement constellation line rendering between connected stars
2. Add smooth transitions when navigating between stars
3. Create first detailed project showcase page with proper styling
4. Implement visual feedback for available navigation options
5. Add sound effects for star selection and navigation
