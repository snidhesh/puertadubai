'use client';

import {useMemo} from 'react';
import type {ProjectCard as ProjectCardType} from '@/lib/sanity/queries';
import {ProjectCard} from './project-card';
import {applyClientFilters, useProjectFilters} from './project-filters';

export function ProjectsGrid({projects}: {projects: ProjectCardType[]}) {
  const [filters] = useProjectFilters();
  const filtered = useMemo(
    () => applyClientFilters(projects, filters),
    [projects, filters]
  );

  if (projects.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-[var(--divider)] p-6 text-sm text-[var(--text-muted)]">
        No projects have been published yet. Add them in Sanity Studio
        (<code>Project</code> document type) — they appear here automatically.
      </p>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No projects match the current filters. Reset to see everything.
      </p>
    );
  }

  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((project) => (
        <li key={project._id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
