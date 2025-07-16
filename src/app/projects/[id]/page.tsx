'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import navigableStars from '@/data/navigableStars.json';
import projectAssignments from '@/data/projectAssignments.json';

interface Star {
  id: string;
  proper: string;
  displayX: number;
  displayY: number;
  mag: number;
  color: string;
  constellation: string;
  isNavigable: boolean;
  type: 'project' | 'cosmic';
  spectrum?: string;
  dist?: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  image: string;
  links: {
    github?: string;
    live?: string;
  };
}

interface ProjectAssignment {
  starId: string;
  starName: string;
  constellation: string;
  projectId: string;
  project: Project;
}

// Generate static params for all possible project IDs
export async function generateStaticParams() {
  // Get all star IDs
  const starIds = (navigableStars as Star[]).map(star => ({
    id: star.id
  }));
  
  // Get all project IDs
  const projectIds = Object.values(projectAssignments as Record<string, ProjectAssignment>)
    .map(assignment => ({
      id: assignment.projectId
    }));
  
  // Combine both sets of IDs (removing duplicates)
  const allIds = [...starIds, ...projectIds];
  const uniqueIds = Array.from(new Set(allIds.map(item => item.id)))
    .map(id => ({ id }));
  
  return uniqueIds;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [star, setStar] = useState<Star | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  const id = params.id as string;
  
  // Find the star and project data
  useEffect(() => {
    // Cast to appropriate types
    const stars = navigableStars as Star[];
    const assignments = projectAssignments as Record<string, ProjectAssignment>;
    
    // First try to find the star directly by ID
    const foundStar = stars.find(s => s.id === id);
    let foundProject: Project | null = null;
    
    // If star found directly, look for its project
    if (foundStar) {
      // Check if this star has a project assigned
      const assignment = Object.values(assignments).find(a => a.starId === foundStar.id);
      if (assignment) {
        foundProject = assignment.project;
      }
      
      setStar(foundStar);
      if (foundProject) {
        setProject(foundProject);
      }
    } else {
      // If not found by ID, try finding by project ID
      const assignment = Object.values(assignments).find(a => a.projectId === id);
      if (assignment) {
        const projectStar = stars.find(s => s.id === assignment.starId);
        if (projectStar) {
          setStar(projectStar);
          setProject(assignment.project);
        } else {
          // If star not found, redirect to home
          console.error(`Star for project ID ${id} not found`);
          // Timeout to prevent immediate redirect during development
          setTimeout(() => router.push('/'), 2000);
        }
      } else {
        // Neither star nor project found
        console.error(`Star or project with ID ${id} not found`);
        // Timeout to prevent immediate redirect during development
        setTimeout(() => router.push('/'), 2000);
      }
    }
    
    setLoading(false);
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-2xl">Loading stellar data...</div>
      </div>
    );
  }

  // If we didn't find a project but found a star
  if (!project && star) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-6">
        <nav className="mb-8">
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-900 text-white rounded font-mono hover:bg-blue-700 transition-colors"
          >
            ← Return to Star Chart
          </button>
        </nav>
        
        <div className="max-w-4xl mx-auto text-center">
          <header className="mb-8">
            <h1 className="text-4xl font-bold font-mono mb-2">{star.proper}</h1>
            <div className="flex items-center justify-center text-gray-400">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: star.color }}></span>
              <span>{star.constellation} Constellation • Mag {star.mag.toFixed(2)}</span>
            </div>
          </header>
          
          <div className="bg-gray-900 border border-gray-800 p-8 rounded">
            <div className="text-2xl mb-6">Cosmic Object</div>
            <p className="text-gray-300 mb-4">
              This star does not have an associated project yet. It is a cosmic body in the {star.constellation} constellation.
            </p>
            <div className="mt-8">
              <p className="text-blue-400">Spectral type: {star.spectrum || 'Unknown'}</p>
              <p className="text-blue-400">Distance: {star.dist?.toFixed(1) || 'Unknown'} parsecs</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <nav className="mb-8">
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-900 text-white rounded font-mono hover:bg-blue-700 transition-colors"
        >
          ← Return to Star Chart
        </button>
      </nav>
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-bold font-mono mb-2">{project?.title || 'Unknown Project'}</h1>
          <div className="flex items-center text-gray-400">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: star?.color || '#ffffff' }}></span>
            <span>{star?.proper} • {star?.constellation} Constellation • Mag {star?.mag.toFixed(2)}</span>
          </div>
        </header>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="mb-6 bg-gray-900 border border-gray-800 p-4 rounded">
              <h2 className="text-xl font-mono mb-3 text-blue-400">Project Description</h2>
              <p className="text-gray-300">{project?.description || 'Description unavailable'}</p>
            </div>
            
            <div className="mb-6 bg-gray-900 border border-gray-800 p-4 rounded">
              <h2 className="text-xl font-mono mb-3 text-blue-400">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project?.tech?.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
                {(!project?.tech || project.tech.length === 0) && (
                  <span className="text-gray-500">No technologies listed</span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 p-4 rounded">
              <h2 className="text-xl font-mono mb-3 text-blue-400">Links</h2>
              <div className="flex gap-4">
                {project?.links?.github && (
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer"
                     className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors">
                    GitHub Repository
                  </a>
                )}
                {project?.links?.live && (
                  <a href={project.links.live} target="_blank" rel="noopener noreferrer"
                     className="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded text-white transition-colors">
                    Live Demo
                  </a>
                )}
                {(!project?.links?.github && !project?.links?.live) && (
                  <span className="text-gray-500">No links available</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 p-4 rounded">
            <div className="aspect-video bg-black rounded overflow-hidden flex items-center justify-center">
              <div className="text-gray-600 font-mono">Project visualization will appear here</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 