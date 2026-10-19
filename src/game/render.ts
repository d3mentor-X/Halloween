// Canvas renderer for the top-down exploration world. Draws:
//  - ground with area tints
//  - area boundary walls and ruins as dark silhouettes
//  - milestones as glowing artifacts with a bob animation
//  - fog (radial gradient overlay that follows the camera)
//  - player as a hooded silhouette with a faint moonlight rim
//  - particles (embers/dust) drifting
// All visual asset drawing is procedural so nothing can fail to load.

import { areas, type WorldArea } from "@/data/portfolio";
import type { Milestone } from "./world";

export interface Camera {
  x: number;
  y: number;
}

export interface RenderState {
  width: number; // viewport px
  height: number;
  camera: Camera;
  playerX: number;
  playerY: number;
  facing: number; // radians
  walking: boolean;
  milestones: Milestone[];
  discoveredIds: string[];
  time: number; // ms
  reducedMotion: boolean;
  particles: Particle[];
  nearbyMilestoneId: string | null;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: string;
}

export function createParticles(count: number, worldW: number, worldH: number): Particle[] {
  const arr: Particle[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(spawnParticle(worldW, worldH));
  }
  return arr;
}

function spawnParticle(worldW: number, worldH: number): Particle {
  return {
    x: Math.random() * worldW,
    y: Math.random() * worldH,
    vx: (Math.random() - 0.5) * 8,
    vy: -10 - Math.random() * 14,
    life: 0,
    maxLife: 4000 + Math.random() * 4000,
    size: 1 + Math.random() * 2,
    hue: Math.random() < 0.85 ? "#c9b8a0" : "#b3403a",
  };
}

export function updateParticles(particles: Particle[], dt: number, worldW: number, worldH: number) {
  for (const p of particles) {
    p.x += p.vx * (dt / 1000);
    p.y += p.vy * (dt / 1000);
    p.life += dt;
    if (p.life > p.maxLife || p.y < -20) {
      Object.assign(p, spawnParticle(worldW, worldH), { y: worldH + 10 });
    }
  }
}

function worldToScreen(wx: number, wy: number, cam: Camera, w: number, h: number) {
  return { sx: wx - cam.x + w / 2, sy: wy - cam.y + h / 2 };
}

export function render(ctx: CanvasRenderingContext2D, state: RenderState) {
  const { width: w, height: h, camera, time, reducedMotion } = state;
  const t = time / 1000;

  // base background — deep black
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, w, h);

  // draw ground tints per area (screen-space)
  for (const area of areas) {
    const { sx, sy } = worldToScreen(area.x, area.y, camera, w, h);
    const aw = area.width;
    const ah = area.height;
    // subtle radial glow from area center
    const grad = ctx.createRadialGradient(
      sx + aw / 2,
      sy + ah / 2,
      40,
      sx + aw / 2,
      sy + ah / 2,
      Math.max(aw, ah) * 0.7
    );
    grad.addColorStop(0, hexToRgba(area.tint, 0.32));
    grad.addColorStop(1, "rgba(5,6,10,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(sx, sy, aw, ah);
  }

  // scattered ground texture: faint grid of dark dots
  drawGroundDots(ctx, state);

  // draw area walls & ruins (silhouettes)
  ctx.fillStyle = "#0a0c12";
  for (const area of areas) {
    drawAreaWalls(ctx, area, camera, w, h);
  }

  // draw open-space rocks — handled via obstacles passed indirectly through area
  // (we keep rocks inside area + a few standalone, drawn here)
  drawStandaloneRocks(ctx, camera, w, h);

  // milestones (glowing artifacts)
  for (const m of state.milestones) {
    drawMilestone(ctx, m, state, t);
  }

  // particles
  for (const p of state.particles) {
    const { sx, sy } = worldToScreen(p.x, p.y, camera, w, h);
    if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;
    const alpha = 0.5 * (1 - p.life / p.maxLife);
    ctx.fillStyle = hexToRgba(p.hue, alpha);
    ctx.beginPath();
    ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // player
  drawPlayer(ctx, state, t);

  // fog: large radial gradient centered on player that darkens edges
  const { sx: pxs, sy: pys } = worldToScreen(state.playerX, state.playerY, camera, w, h);
  const fogRadius = reducedMotion ? Math.max(w, h) * 0.9 : Math.max(w, h) * 0.62;
  const fog = ctx.createRadialGradient(pxs, pys, fogRadius * 0.25, pxs, pys, fogRadius);
  fog.addColorStop(0, "rgba(5,6,10,0)");
  fog.addColorStop(1, "rgba(5,6,10,0.92)");
  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, w, h);

  // moonlight vignette (cool tint at screen edges)
  const vign = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  vign.addColorStop(0, "rgba(0,0,0,0)");
  vign.addColorStop(1, "rgba(120,140,180,0.08)");
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, w, h);
}

function drawGroundDots(ctx: CanvasRenderingContext2D, state: RenderState) {
  const spacing = 80;
  const { camera, width: w, height: h } = state;
  const offX = -camera.x + w / 2;
  const offY = -camera.y + h / 2;
  ctx.fillStyle = "rgba(60,70,90,0.12)";
  const startX = Math.floor((camera.x - w / 2) / spacing) * spacing;
  const startY = Math.floor((camera.y - h / 2) / spacing) * spacing;
  for (let gx = startX; gx < camera.x + w / 2 + spacing; gx += spacing) {
    for (let gy = startY; gy < camera.y + h / 2 + spacing; gy += spacing) {
      // hashed pseudo-random offset
      const r = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;
      const jx = (r % 40) - 20;
      const jy = ((r >> 8) % 40) - 20;
      const sx = gx + jx + offX;
      const sy = gy + jy + offY;
      ctx.fillRect(sx, sy, 2, 2);
    }
  }
}

function drawAreaWalls(
  ctx: CanvasRenderingContext2D,
  area: WorldArea,
  cam: Camera,
  w: number,
  h: number
) {
  const { sx, sy } = worldToScreen(area.x, area.y, cam, w, h);
  // boundary walls (with gaps drawn by world.ts; here we just draw a thin
  // outline to suggest ruined fences)
  ctx.strokeStyle = "rgba(20,24,32,0.9)";
  ctx.lineWidth = 6;
  const gap = 140;
  // top
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + (area.width - gap) / 2, sy);
  ctx.moveTo(sx + (area.width + gap) / 2, sy);
  ctx.lineTo(sx + area.width, sy);
  // bottom
  ctx.moveTo(sx, sy + area.height);
  ctx.lineTo(sx + (area.width - gap) / 2, sy + area.height);
  ctx.moveTo(sx + (area.width + gap) / 2, sy + area.height);
  ctx.lineTo(sx + area.width, sy + area.height);
  // left
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx, sy + (area.height - gap) / 2);
  ctx.moveTo(sx, sy + (area.height + gap) / 2);
  ctx.lineTo(sx, sy + area.height);
  // right
  ctx.moveTo(sx + area.width, sy);
  ctx.lineTo(sx + area.width, sy + (area.height - gap) / 2);
  ctx.moveTo(sx + area.width, sy + (area.height + gap) / 2);
  ctx.lineTo(sx + area.width, sy + area.height);
  ctx.stroke();

  // ruined pillars inside (drawn as dark rects matching world.ts ruins)
  const cx = area.x + area.width / 2 - area.x;
  const cy = area.y + area.height / 2 - area.y;
  ctx.fillStyle = "#0a0c12";
  ctx.fillRect(sx + 80, sy + cy - 60, 50, 50);
  ctx.fillRect(sx + area.width - 130, sy + cy + 10, 50, 50);
  ctx.fillRect(sx + cx - 25, sy + 70, 50, 40);

  // area name etched faintly near top
  ctx.fillStyle = "rgba(180,170,150,0.18)";
  ctx.font = "600 16px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(area.name, sx + area.width / 2, sy + 30);
}

const standaloneRocks: { x: number; y: number; w: number; h: number }[] = [
  { x: 1080, y: 300, w: 60, h: 60 },
  { x: 1200, y: 1100, w: 70, h: 50 },
  { x: 600, y: 900, w: 50, h: 50 },
  { x: 2000, y: 950, w: 60, h: 60 },
];

function drawStandaloneRocks(ctx: CanvasRenderingContext2D, cam: Camera, w: number, h: number) {
  ctx.fillStyle = "#0a0c12";
  for (const r of standaloneRocks) {
    const { sx, sy } = worldToScreen(r.x, r.y, cam, w, h);
    ctx.beginPath();
    ctx.ellipse(sx + r.w / 2, sy + r.h, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMilestone(
  ctx: CanvasRenderingContext2D,
  m: Milestone,
  state: RenderState,
  t: number
) {
  const { camera, width: w, height: h, discoveredIds, nearbyMilestoneId, reducedMotion } = state;
  const { sx, sy } = worldToScreen(m.x, m.y, camera, w, h);
  if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) return;

  const discovered = discoveredIds.includes(m.id);
  const isNear = nearbyMilestoneId === m.id;
  const bob = reducedMotion ? 0 : Math.sin(t * 2 + m.x) * 4;
  const baseColor = discovered ? "#7aa86a" : "#b3403a";
  const glowColor = discovered ? "rgba(122,168,106,0.5)" : "rgba(179,64,58,0.5)";

  // glow halo
  const haloR = 40 + (reducedMotion ? 0 : Math.sin(t * 2 + m.x) * 4);
  const halo = ctx.createRadialGradient(sx, sy + bob, 4, sx, sy + bob, haloR);
  halo.addColorStop(0, glowColor);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(sx, sy + bob, haloR, 0, Math.PI * 2);
  ctx.fill();

  // artifact shape: a tall stone shard
  ctx.fillStyle = "#0d0f14";
  ctx.beginPath();
  ctx.moveTo(sx, sy + bob - 22);
  ctx.lineTo(sx + 12, sy + bob + 14);
  ctx.lineTo(sx - 12, sy + bob + 14);
  ctx.closePath();
  ctx.fill();

  // accent rune line
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, sy + bob - 16);
  ctx.lineTo(sx, sy + bob + 8);
  ctx.stroke();

  // pulsing core dot
  const pulse = reducedMotion ? 0.6 : 0.4 + Math.sin(t * 3 + m.x) * 0.3;
  ctx.fillStyle = hexToRgba(baseColor, pulse);
  ctx.beginPath();
  ctx.arc(sx, sy + bob - 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // label when near
  if (isNear) {
    ctx.fillStyle = "rgba(240,235,225,0.95)";
    ctx.font = "600 13px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(m.label, sx, sy - 40);
    ctx.fillStyle = "rgba(200,190,175,0.7)";
    ctx.font = "400 11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(discovered ? "Discovered — press E to revisit" : "Press E to discover", sx, sy - 24);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: RenderState, t: number) {
  const { width: w, height: h, camera, playerX, playerY, walking, reducedMotion } = state;
  const { sx, sy } = worldToScreen(playerX, playerY, camera, w, h);
  const bob = reducedMotion || !walking ? 0 : Math.sin(t * 10) * 1.5;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 14, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // hooded silhouette body
  ctx.fillStyle = "#0b0d12";
  ctx.beginPath();
  ctx.moveTo(sx, sy - 18 + bob);
  ctx.lineTo(sx + 10, sy + 12 + bob);
  ctx.lineTo(sx - 10, sy + 12 + bob);
  ctx.closePath();
  ctx.fill();

  // moonlight rim
  ctx.strokeStyle = "rgba(180,195,225,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // faint glow around player (lantern vibe)
  const lamp = ctx.createRadialGradient(sx, sy, 4, sx, sy, 60);
  lamp.addColorStop(0, "rgba(200,180,140,0.18)");
  lamp.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lamp;
  ctx.beginPath();
  ctx.arc(sx, sy, 60, 0, Math.PI * 2);
  ctx.fill();
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
