export interface ProjectDiscoveryFilter {
  category?: 'ai' | 'mern' | 'collaborative' | 'all';
  tech?: string;
  query?: string;
}

export interface DiscoveredProject {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  techStack: string[];
  description: string;
  url: string;
  githubUrl?: string;
  featured: boolean;
}

const ALL_PROJECTS: DiscoveredProject[] = [
  {
    id: 'tasknexus',
    title: 'TaskNexus — Microservices Task Platform',
    subtitle: 'AI & Microservices Task Management',
    category: 'ai',
    techStack: ['Node.js', 'React', 'MongoDB', 'Docker', 'Gemini AI', 'Tailwind'],
    description: 'Enterprise microservices platform featuring AI task breakdowns, role-based workflows, and live notifications.',
    url: '/projects/tasknexus',
    githubUrl: 'https://github.com/ggauravky/TaskNexus',
    featured: true,
  },
  {
    id: 'smartmess',
    title: 'SmartMess — Hostel Mess Automation System',
    subtitle: 'MERN Stack & Meal Analytics',
    category: 'mern',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Chart.js'],
    description: 'Automated meal attendance tracking, digital feedback, QR entry, and food waste reduction analytics.',
    url: '/projects/smartmess',
    githubUrl: 'https://github.com/ggauravky/SmartMess',
    featured: true,
  },
  {
    id: 'buildmyteam',
    title: 'BuildMyTeam — Developer Collaboration Hub',
    subtitle: 'Collaborative Team Matching',
    category: 'collaborative',
    techStack: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Tailwind'],
    description: 'Connects developers and designers based on complementary skill sets to build hackathon & portfolio projects together.',
    url: '/projects/buildmyteam',
    githubUrl: 'https://github.com/ggauravky/BuildMyTeam',
    featured: true,
  },
  {
    id: 'instax',
    title: 'InstaX — Micro Social Network',
    subtitle: 'Full-Stack Social Experience',
    category: 'mern',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Cloudinary'],
    description: 'Photo sharing platform with real-time comments, likes, and image optimization.',
    url: '/projects/instax',
    githubUrl: 'https://github.com/ggauravky/InstaX',
    featured: false,
  },
];

/**
 * Smart Project Discovery Engine.
 */
export class ProjectDiscovery {
  /**
   * Filter projects by smart criteria.
   */
  public static discoverProjects(filter: ProjectDiscoveryFilter = {}): DiscoveredProject[] {
    let results = [...ALL_PROJECTS];

    if (filter.category && filter.category !== 'all') {
      results = results.filter((p) => p.category === filter.category);
    }

    if (filter.tech) {
      const techLower = filter.tech.toLowerCase();
      results = results.filter((p) => p.techStack.some((t) => t.toLowerCase().includes(techLower)));
    }

    if (filter.query) {
      const qLower = filter.query.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower) ||
          p.techStack.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    return results;
  }

  /**
   * Get featured recruiter recommendations.
   */
  public static getRecruiterPicks(): DiscoveredProject[] {
    return ALL_PROJECTS.filter((p) => p.featured);
  }
}
