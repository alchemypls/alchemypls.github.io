// Script to assign projects to specific stars in the navigable stars dataset
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Handle ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Projects to assign to stars
const projects = [
  {
    id: 'stellar-portfolio',
    title: 'Stellar Portfolio Engine',
    description: 'A dynamic portfolio system that grows and evolves like the cosmos itself. Built with modern web technologies to showcase projects in an immersive starfield experience.',
    tech: ['Next.js', 'TypeScript', 'Canvas API', 'Tailwind CSS'],
    image: '/projects/portfolio-engine.jpg',
    links: {
      github: 'https://github.com/alchemypls/stellar-portfolio',
      live: 'https://stellar-portfolio.vercel.app'
    }
  },
  {
    id: 'constellation-mapper',
    title: 'Constellation Mapper',
    description: 'An interactive star mapping application that connects celestial objects with smooth animations and real-time data visualization.',
    tech: ['React', 'D3.js', 'WebGL', 'API Integration'],
    image: '/projects/constellation-mapper.jpg',
    links: {
      github: 'https://github.com/alchemypls/constellation-mapper',
      live: 'https://constellation-mapper.vercel.app'
    }
  },
  {
    id: 'nebula-framework',
    title: 'Nebula Framework',
    description: 'A lightweight yet powerful framework for building scalable web applications with stellar performance and cosmic flexibility.',
    tech: ['TypeScript', 'Node.js', 'GraphQL', 'Docker'],
    image: '/projects/nebula-framework.jpg',
    links: {
      github: 'https://github.com/alchemypls/nebula-framework',
      live: 'https://nebula-framework.dev'
    }
  },
  {
    id: 'astral-analytics',
    title: 'Astral Analytics',
    description: 'A data visualization platform for astronomy enthusiasts, featuring real-time cosmic data and interactive celestial charts.',
    tech: ['Vue.js', 'Python', 'TensorFlow', 'Flask'],
    image: '/projects/astral-analytics.jpg',
    links: {
      github: 'https://github.com/alchemypls/astral-analytics',
      live: 'https://astral-analytics.io'
    }
  },
  {
    id: 'orbital-cms',
    title: 'Orbital CMS',
    description: 'A content management system designed for astronomers and space enthusiasts to share discoveries and research.',
    tech: ['Angular', 'MongoDB', 'Express', 'Node.js'],
    image: '/projects/orbital-cms.jpg',
    links: {
      github: 'https://github.com/alchemypls/orbital-cms',
      live: 'https://orbital-cms.com'
    }
  }
];

// Target stars for projects (by Bayer designation)
// We'll pick bright, recognizable stars from major constellations
const targetStars = [
  { bayerPattern: 'Alp', constellation: 'Cyg', projectId: 'stellar-portfolio' },     // Deneb
  { bayerPattern: 'Gam', constellation: 'Cyg', projectId: 'constellation-mapper' },  // Sadr
  { bayerPattern: 'Alp', constellation: 'Ori', projectId: 'nebula-framework' },      // Betelgeuse
  { bayerPattern: 'Alp', constellation: 'Lyr', projectId: 'astral-analytics' },      // Vega
  { bayerPattern: 'Alp', constellation: 'Leo', projectId: 'orbital-cms' }            // Regulus
];

async function assignProjects() {
  const rootDir = path.resolve(__dirname, '..');
  const dataPath = path.join(rootDir, 'data', 'navigableStars.json');
  
  // Read the navigable stars data
  console.log(`Reading navigable stars from ${dataPath}`);
  const starsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // Create the project assignments file
  const projectAssignments = {};
  let assignedCount = 0;
  
  // Find and assign projects to stars
  targetStars.forEach(target => {
    // Find the first star that matches our target criteria
    const star = starsData.find(s => 
      s.constellation === target.constellation && 
      s.bayer && 
      s.bayer.startsWith(target.bayerPattern)
    );
    
    if (star) {
      console.log(`Found star: ${star.proper} (${star.bayer}) for project: ${target.projectId}`);
      
      const project = projects.find(p => p.id === target.projectId);
      if (project) {
        projectAssignments[star.id] = {
          starId: star.id,
          starName: star.proper,
          constellation: star.constellation,
          projectId: project.id,
          project
        };
        assignedCount++;
        
        // Also update the star type in the original data
        star.type = 'project';
      }
    } else {
      console.log(`No matching star found for ${target.bayerPattern} ${target.constellation}`);
    }
  });
  
  // Save the project assignments
  const projectsPath = path.join(rootDir, 'data', 'projectAssignments.json');
  fs.writeFileSync(
    projectsPath, 
    JSON.stringify(projectAssignments, null, 2)
  );
  
  // Save the updated stars data
  fs.writeFileSync(
    dataPath, 
    JSON.stringify(starsData, null, 2)
  );
  
  console.log(`Assigned ${assignedCount} projects to stars`);
  console.log(`Saved project assignments to ${projectsPath}`);
  console.log(`Updated star types in ${dataPath}`);
}

// Run the script
assignProjects().catch(console.error); 