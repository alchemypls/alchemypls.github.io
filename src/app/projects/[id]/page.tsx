import navigableStars from '@/data/navigableStars.json';
import projectAssignments from '@/data/projectAssignments.json';
import ClientPage from './client';

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
}

interface ProjectAssignment {
  starId: string;
  starName: string;
  constellation: string;
  projectId: string;
  project: any;
}

// Generate static params for all possible project IDs
export async function generateStaticParams() {
  // Get all star IDs
  const starIds = (navigableStars as any[]).map(star => ({
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

// Server component that renders the client component
export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ClientPage id={params.id} />;
} 