// World geometry helpers: collision rects for obstacles, milestone positions,
// and the camera. All in world pixels. The player is a circle; obstacles are
// AABBs. We do simple circle-vs-AABB resolution per axis.

import { areas, WORLD_WIDTH, WORLD_HEIGHT, type WorldArea } from "@/data/portfolio";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Milestone {
  id: string; // project id
  areaId: string;
  x: number;
  y: number;
  label: string;
  subtitle: string;
}

export interface WorldData {
  obstacles: Rect[];
  milestones: Milestone[];
  areas: WorldArea[];
  width: number;
  height: number;
}

// Build static obstacles: area boundary walls + a few decorative ruins inside
// each area. Milestones sit at the center of each area.
export function buildWorld(): WorldData {
  const obstacles: Rect[] = [];
  const milestones: Milestone[] = [];

  // outer world walls
  const wall = 40;
  obstacles.push({ x: -wall, y: -wall, w: WORLD_WIDTH + wall * 2, h: wall });
  obstacles.push({ x: -wall, y: WORLD_HEIGHT, w: WORLD_WIDTH + wall * 2, h: wall });
  obstacles.push({ x: -wall, y: -wall, w: wall, h: WORLD_HEIGHT + wall * 2 });
  obstacles.push({ x: WORLD_WIDTH, y: -wall, w: wall, h: WORLD_HEIGHT + wall * 2 });

  for (const area of areas) {
    // area boundary walls with a gap (entrance) on one side
    const gap = 140;
    const cx = area.x + area.width / 2;
    const cy = area.y + area.height / 2;

    // top wall with gap near center
    obstacles.push({ x: area.x, y: area.y - 12, w: (area.width - gap) / 2, h: 12 });
    obstacles.push({
      x: area.x + (area.width + gap) / 2,
      y: area.y - 12,
      w: (area.width - gap) / 2,
      h: 12,
    });
    // bottom wall
    obstacles.push({ x: area.x, y: area.y + area.height, w: (area.width - gap) / 2, h: 12 });
    obstacles.push({
      x: area.x + (area.width + gap) / 2,
      y: area.y + area.height,
      w: (area.width - gap) / 2,
      h: 12,
    });
    // left wall
    obstacles.push({ x: area.x - 12, y: area.y, w: 12, h: (area.height - gap) / 2 });
    obstacles.push({
      x: area.x - 12,
      y: area.y + (area.height + gap) / 2,
      w: 12,
      h: (area.height - gap) / 2,
    });
    // right wall
    obstacles.push({ x: area.x + area.width, y: area.y, w: 12, h: (area.height - gap) / 2 });
    obstacles.push({
      x: area.x + area.width,
      y: area.y + (area.height + gap) / 2,
      w: 12,
      h: (area.height - gap) / 2,
    });

    // decorative ruins inside the area
    obstacles.push({ x: area.x + 80, y: cy - 60, w: 50, h: 50 });
    obstacles.push({ x: area.x + area.width - 130, y: cy + 10, w: 50, h: 50 });
    obstacles.push({ x: cx - 25, y: area.y + 70, w: 50, h: 40 });

    milestones.push({
      id: area.projectId,
      areaId: area.id,
      x: cx,
      y: cy,
      label: area.name,
      subtitle: area.subtitle,
    });
  }

  // a few scattered forest rocks in the open space between areas
  obstacles.push({ x: 1080, y: 300, w: 60, h: 60 });
  obstacles.push({ x: 1200, y: 1100, w: 70, h: 50 });
  obstacles.push({ x: 600, y: 900, w: 50, h: 50 });
  obstacles.push({ x: 2000, y: 950, w: 60, h: 60 });

  return { obstacles, milestones, areas, width: WORLD_WIDTH, height: WORLD_HEIGHT };
}

export function circleVsRect(
  cx: number,
  cy: number,
  r: number,
  rect: Rect
): { nx: number; ny: number } | null {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  const distSq = dx * dx + dy * dy;
  if (distSq >= r * r) return null;
  const dist = Math.sqrt(distSq) || 0.0001;
  // push out along normal
  const overlap = r - dist;
  return { nx: (dx / dist) * overlap, ny: (dy / dist) * overlap };
}

export function resolveCollisions(
  x: number,
  y: number,
  r: number,
  obstacles: Rect[]
): { x: number; y: number } {
  let px = x;
  let py = y;
  for (const rect of obstacles) {
    const hit = circleVsRect(px, py, r, rect);
    if (hit) {
      px += hit.nx;
      py += hit.ny;
    }
  }
  return { x: px, y: py };
}

export function nearestMilestone(
  x: number,
  y: number,
  milestones: Milestone[],
  threshold = 90
): Milestone | null {
  let best: Milestone | null = null;
  let bestDist = threshold * threshold;
  for (const m of milestones) {
    const dx = m.x - x;
    const dy = m.y - y;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      best = m;
    }
  }
  return best;
}

export function areaAt(x: number, y: number, areas: WorldArea[]): WorldArea | null {
  for (const a of areas) {
    if (x >= a.x && x <= a.x + a.width && y >= a.y && y <= a.y + a.height) {
      return a;
    }
  }
  return null;
}
