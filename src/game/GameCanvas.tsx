// GameCanvas: owns the canvas, runs the game loop (movement + camera + render),
// and reports nearby milestones up so the parent can show the project panel.
//
// Movement model: the player is a circle of radius 14 in world pixels. We
// integrate velocity with simple acceleration/friction, then resolve collisions
// against AABB obstacles axis-by-axis. The camera follows the player and is
// clamped to the world bounds.
//
// The parent can warp the player to a world position by calling the `warp`
// function passed via the `warpRef` prop (used by the map & project list).

import { useEffect, useRef } from "react";
import { InputState } from "./input";
import { AudioManager } from "./audio";
import {
  buildWorld,
  resolveCollisions,
  nearestMilestone,
  areaAt,
  WorldData,
} from "./world";
import {
  render,
  createParticles,
  updateParticles,
  Camera,
  Particle,
} from "./render";
import { areas } from "@/data/portfolio";

interface Props {
  input: InputState;
  audio: AudioManager;
  discoveredIds: string[];
  reducedMotion: boolean;
  onNearbyMilestoneChange: (id: string | null) => void;
  onVisitArea: (areaId: string) => void;
  onInteract: (milestoneId: string) => void;
  paused: boolean;
  warpRef: React.MutableRefObject<(x: number, y: number) => void>;
}

const PLAYER_RADIUS = 14;
const ACCEL = 900;
const MAX_SPEED = 170;
const RUN_SPEED = 250;
const FRICTION = 8;

export function GameCanvas({
  input,
  audio,
  discoveredIds,
  reducedMotion,
  onNearbyMilestoneChange,
  onVisitArea,
  onInteract,
  paused,
  warpRef,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<WorldData>(buildWorld());
  const camRef = useRef<Camera>({ x: 1300, y: 900 });
  const posRef = useRef({ x: 1300, y: 900 });
  const velRef = useRef({ x: 0, y: 0 });
  const facingRef = useRef(0);
  const particlesRef = useRef<Particle[]>(createParticles(120, 2600, 1800));
  const nearbyRef = useRef<string | null>(null);
  const lastAreaRef = useRef<string | null>(null);
  const stepTimerRef = useRef(0);
  const lastInteractRef = useRef(0);

  const propsRef = useRef({
    discoveredIds,
    reducedMotion,
    paused,
    onNearbyMilestoneChange,
    onVisitArea,
    onInteract,
  });
  propsRef.current = {
    discoveredIds,
    reducedMotion,
    paused,
    onNearbyMilestoneChange,
    onVisitArea,
    onInteract,
  };

  // expose warp to parent
  useEffect(() => {
    warpRef.current = (x: number, y: number) => {
      posRef.current = { x, y };
      velRef.current = { x: 0, y: 0 };
      camRef.current = { x, y };
    };
  }, [warpRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let lastTime = performance.now();
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(48, now - lastTime);
      lastTime = now;
      const p = propsRef.current;
      if (!p.paused) update(dt, now);
      draw(now);
    };

    const update = (dt: number, now: number) => {
      const p = propsRef.current;
      const pos = posRef.current;
      const vel = velRef.current;
      const world = worldRef.current;

      let ax = 0;
      let ay = 0;
      if (input.left) ax -= 1;
      if (input.right) ax += 1;
      if (input.up) ay -= 1;
      if (input.down) ay += 1;
      const mag = Math.hypot(ax, ay);
      if (mag > 0) {
        ax /= mag;
        ay /= mag;
        facingRef.current = Math.atan2(ay, ax);
      }
      const speed = input.run ? RUN_SPEED : MAX_SPEED;
      vel.x += ax * ACCEL * (dt / 1000);
      vel.y += ay * ACCEL * (dt / 1000);

      const fr = Math.exp(-FRICTION * (dt / 1000));
      vel.x *= fr;
      vel.y *= fr;

      const sp = Math.hypot(vel.x, vel.y);
      if (sp > speed) {
        vel.x = (vel.x / sp) * speed;
        vel.y = (vel.y / sp) * speed;
      }

      pos.x += vel.x * (dt / 1000);
      pos.y += vel.y * (dt / 1000);

      const resolved = resolveCollisions(pos.x, pos.y, PLAYER_RADIUS, world.obstacles);
      pos.x = Math.max(PLAYER_RADIUS, Math.min(world.width - PLAYER_RADIUS, resolved.x));
      pos.y = Math.max(PLAYER_RADIUS, Math.min(world.height - PLAYER_RADIUS, resolved.y));

      const cam = camRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const targetCamX = Math.max(vw / 2, Math.min(world.width - vw / 2, pos.x));
      const targetCamY = Math.max(vh / 2, Math.min(world.height - vh / 2, pos.y));
      const camLerp = 1 - Math.exp(-6 * (dt / 1000));
      cam.x += (targetCamX - cam.x) * camLerp;
      cam.y += (targetCamY - cam.y) * camLerp;

      if (sp > 30) {
        stepTimerRef.current += dt;
        const interval = input.run ? 280 : 420;
        if (stepTimerRef.current > interval) {
          stepTimerRef.current = 0;
          audio.playStep();
        }
      }

      const near = nearestMilestone(pos.x, pos.y, world.milestones, 95);
      const nearId = near?.id ?? null;
      if (nearId !== nearbyRef.current) {
        nearbyRef.current = nearId;
        p.onNearbyMilestoneChange(nearId);
        if (nearId) audio.playBlip();
      }

      const area = areaAt(pos.x, pos.y, world.areas);
      if (area && area.id !== lastAreaRef.current) {
        lastAreaRef.current = area.id;
        p.onVisitArea(area.id);
      }

      if (input.interactPressed) {
        input.interactPressed = false;
        if (nearId && now - lastInteractRef.current > 250) {
          lastInteractRef.current = now;
          p.onInteract(nearId);
        }
      }

      if (!p.reducedMotion) updateParticles(particlesRef.current, dt, world.width, world.height);
    };

    const draw = (now: number) => {
      const p = propsRef.current;
      const world = worldRef.current;
      render(ctx, {
        width: window.innerWidth,
        height: window.innerHeight,
        camera: camRef.current,
        playerX: posRef.current.x,
        playerY: posRef.current.y,
        facing: facingRef.current,
        walking: Math.hypot(velRef.current.x, velRef.current.y) > 10,
        milestones: world.milestones,
        discoveredIds: p.discoveredIds,
        time: now,
        reducedMotion: p.reducedMotion,
        particles: particlesRef.current,
        nearbyMilestoneId: nearbyRef.current,
      });
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [input, audio]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-label="Explorable world map"
    />
  );
}

export function milestonePosition(projectId: string): { x: number; y: number } | null {
  const world = buildWorld();
  const m = world.milestones.find((m) => m.id === projectId);
  return m ? { x: m.x, y: m.y } : null;
}

export function areaPosition(areaId: string): { x: number; y: number } | null {
  const a = areas.find((a) => a.id === areaId);
  return a ? { x: a.x + a.width / 2, y: a.y + a.height / 2 } : null;
}
