// Star systems data with project information and explicit connections for on-rails navigation
export const starSystems = {
  'cygnus': {
    name: 'Cygnus Constellation',
    description: 'The Swan constellation, home to innovative web applications and cosmic creativity.',
    stars: [
      { 
        x: 100, 
        y: 150, 
        id: 'cygnus-1', 
        name: 'Deneb Alpha', 
        type: 'project', 
        project: {
          title: 'Stellar Portfolio Engine',
          description: 'A dynamic portfolio system that grows and evolves like the cosmos itself. Built with modern web technologies to showcase projects in an immersive starfield experience.',
          tech: ['JavaScript', 'CSS3', 'HTML5', 'SVG']
        }
      },
      { x: 200, y: 100, id: 'cygnus-2', name: 'Sadr Beta', type: 'cosmic' },
      { 
        x: 300, 
        y: 200, 
        id: 'cygnus-3', 
        name: 'Gienah Gamma', 
        type: 'project',
        project: {
          title: 'Constellation Mapper',
          description: 'An interactive star mapping application that connects celestial objects with smooth animations and real-time data visualization.',
          tech: ['React', 'D3.js', 'WebGL', 'API Integration']
        }
      }
    ],
    // These connections define both the visual lines and the navigation paths
    connections: [[0, 1], [1, 2], [0, 2]]
  },
  'orion': {
    name: 'Orion Constellation',
    description: 'The Hunter constellation, where powerful applications and robust systems are forged.',
    stars: [
      { 
        x: 500, 
        y: 300, 
        id: 'orion-1', 
        name: 'Betelgeuse', 
        type: 'project',
        project: {
          title: 'Nebula Framework',
          description: 'A lightweight yet powerful framework for building scalable web applications with stellar performance and cosmic flexibility.',
          tech: ['TypeScript', 'Node.js', 'GraphQL', 'Docker']
        }
      },
      { x: 450, y: 350, id: 'orion-2', name: 'Rigel', type: 'cosmic' },
      { x: 550, y: 380, id: 'orion-3', name: 'Bellatrix', type: 'cosmic' }
    ],
    connections: [[0, 1], [1, 2], [0, 2]]
  }
}; 