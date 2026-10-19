// ============================================================================
// PORTFOLIO CONTENT — EDIT EVERYTHING ABOUT WALEED HERE
// ============================================================================
// This is the single source of truth for Waleed's identity, projects, skills,
// contact details, and how the in-game world is laid out. You should rarely
// need to edit any other file. Anything you change here shows up in the game.
//
// HOW TO EDIT:
//   - Update `profile` to change your name, intro, and skills.
//   - Update `projects` to change project summaries, tech, status, and links.
//   - Update `areas` to rename world regions or move milestones around.
//   - Links use PLACEHOLDER values — replace the strings when you have them.
// ============================================================================

export type ProjectStatus = "Shipped" | "In Progress" | "Research" | "Planned";

export interface ProjectLink {
  label: string;
  url: string; // PLACEHOLDER until you fill in real URLs
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  technologies: string[];
  status: ProjectStatus;
  links: ProjectLink[];
}

export const profile = {
  name: "Waleed Hasnain Shah",
  tagline: "The Portfolio",
  intro:
    "A builder of games, tools, and strange little worlds. Wander the fog and uncover the real projects hidden among the ruins.",
  skills: [
    "Unity / C#",
    "Python",
    "Game Systems",
    "AI Integration",
    "Research & Backtesting",
    "Frontend & UX",
  ],
  contact: {
    email: "PLACEHOLDER: your-email@example.com",
    github: "PLACEHOLDER: https://github.com/your-handle",
    linkedin: "PLACEHOLDER: https://www.linkedin.com/in/your-handle",
  },
};

export const projects: Project[] = [
  {
    id: "echoes-of-the-dead",
    title: "Echoes of the Dead",
    subtitle: "Unity 3D zombie survival game",
    summary:
      "A Unity 3D zombie survival game. Work covered C# scripting for zombie movement and spawning, player shooting, coins and kill counters, portals, level progression, medicine pickups, missions, UI, animation, and sound.",
    technologies: ["Unity", "C#", "3D", "Game Systems", "UI", "Animation"],
    status: "Shipped",
    links: [
      { label: "Repository", url: "PLACEHOLDER: https://github.com/your-handle/echoes-of-the-dead" },
      { label: "Demo", url: "PLACEHOLDER: https://your-demo-link.example.com" },
    ],
  },
  {
    id: "crystal-core",
    title: "Crystal Core",
    subtitle: "Unity game prototype",
    summary:
      "A Unity game prototype featuring drones, colored crystal rings, sequence-based targets, and synthesized sound effects. Built as an experimental mechanics prototype.",
    technologies: ["Unity", "C#", "Prototyping", "Audio Synthesis"],
    status: "In Progress",
    links: [
      { label: "Repository", url: "PLACEHOLDER: https://github.com/your-handle/crystal-core" },
    ],
  },
  {
    id: "gold-agent",
    title: "Gold Agent",
    subtitle: "Python gold market research & backtesting",
    summary:
      "A Python-based gold market research and backtesting project. Includes a parameterized strategy, historical data handling, simulated trades, and research reports. This is research, not financial advice.",
    technologies: ["Python", "Backtesting", "Data Analysis", "Research"],
    status: "Research",
    links: [
      { label: "Repository", url: "PLACEHOLDER: https://github.com/your-handle/gold-agent" },
      { label: "Report", url: "PLACEHOLDER: https://your-report-link.example.com" },
    ],
  },
  {
    id: "ai-image-classification",
    title: "AI Image Classification",
    subtitle: "Python app using Gemini",
    summary:
      "A Python application that uses Gemini to analyze and classify images. Kept factual — add a repository or demo link below when available.",
    technologies: ["Python", "Gemini", "AI", "Image Processing"],
    status: "In Progress",
    links: [
      { label: "Repository", url: "PLACEHOLDER: https://github.com/your-handle/ai-image-classification" },
      { label: "Demo", url: "PLACEHOLDER: https://your-demo-link.example.com" },
    ],
  },
  {
    id: "wellness-app",
    title: "Wellness App",
    subtitle: "Wellness & fitness tracking",
    summary:
      "A wellness and fitness tracking project. Details to be expanded — add features and links here as the project develops.",
    technologies: ["Wellness", "Fitness Tracking"],
    status: "Planned",
    links: [
      { label: "Repository", url: "PLACEHOLDER: https://github.com/your-handle/wellness-app" },
    ],
  },
];

// ============================================================================
// WORLD LAYOUT — how the in-game map is organized
// ============================================================================
// Each area is a region of the open world. `milestone` is the project the
// player discovers there. Coordinates are in world pixels. The world is large
// enough that all areas fit without overlap (see WORLD_WIDTH/WORLD_HEIGHT).
// Move areas by changing x/y. Add a new area by copying one block and adding
// its project id to `projects` above.
// ============================================================================

export interface WorldArea {
  id: string;
  name: string;
  subtitle: string;
  projectId: string; // must match a Project.id above
  x: number;
  y: number;
  width: number;
  height: number;
  // mood color used for fog/lighting tint in this region
  tint: string;
}

export const WORLD_WIDTH = 2600;
export const WORLD_HEIGHT = 1800;

export const areas: WorldArea[] = [
  {
    id: "graveyard",
    name: "The Graveyard of Code",
    subtitle: "Echoes of the Dead",
    projectId: "echoes-of-the-dead",
    x: 200,
    y: 1200,
    width: 760,
    height: 520,
    tint: "#3a4a3a",
  },
  {
    id: "caverns",
    name: "The Crystal Caverns",
    subtitle: "Crystal Core",
    projectId: "crystal-core",
    x: 1600,
    y: 1200,
    width: 760,
    height: 520,
    tint: "#2a3a5a",
  },
  {
    id: "observatory",
    name: "The Observatory",
    subtitle: "Gold Agent",
    projectId: "gold-agent",
    x: 1600,
    y: 200,
    width: 760,
    height: 520,
    tint: "#5a4a2a",
  },
  {
    id: "lab",
    name: "The Haunted Lab",
    subtitle: "AI Image Classification",
    projectId: "ai-image-classification",
    x: 200,
    y: 200,
    width: 760,
    height: 520,
    tint: "#3a2a4a",
  },
  {
    id: "sanctuary",
    name: "The Quiet Sanctuary",
    subtitle: "Wellness App",
    projectId: "wellness-app",
    x: 920,
    y: 640,
    width: 760,
    height: 520,
    tint: "#2a4a4a",
  },
];
