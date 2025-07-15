'use client';

import React from 'react';

interface ProjectPanelProps {
  project: {
    title: string;
    description: string;
    tech: string[];
  };
  onClose: () => void;
}

export const ProjectPanel = ({ project, onClose }: ProjectPanelProps) => {
  return (
    <div className="project-panel visible">
      <button className="close-btn" onClick={onClose}>×</button>
      <div className="project-title">{project.title}</div>
      <div className="project-description">{project.description}</div>
      <div className="project-tech">
        {project.tech.map((tech, index) => (
          <span key={index} className="tech-tag">{tech}</span>
        ))}
      </div>
    </div>
  );
}; 