// App — orchestrates the playable portfolio world.
//
// Game states: loading -> title -> (intro) -> playing, with overlays for
// map, project list, project panel, pause, and contact stacked on top.
//
// All content (name, projects, contact, world areas) lives in
// src/data/portfolio.ts — edit that file to maintain the portfolio.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInputState, attachKeyboard, InputState } from "@/game/input";
import { AudioManager } from "@/game/audio";
import { GameCanvas, milestonePosition } from "@/game/GameCanvas";
import { TouchControls } from "@/game/TouchControls";
import { useGameProgress } from "@/game/useGameProgress";
import { areas, profile, projects, Project, WORLD_WIDTH, WORLD_HEIGHT } from "@/data/portfolio";

import { TitleScreen } from "@/components/TitleScreen";
import { IntroOverlay } from "@/components/IntroOverlay";
import { Hud } from "@/components/Hud";
import { ProjectPanel } from "@/components/ProjectPanel";
import { MapPanel } from "@/components/MapPanel";
import { PauseMenu } from "@/components/PauseMenu";
import { ProjectList } from "@/components/ProjectList";
import { ContactCard } from "@/components/ContactCard";
import { LoadingScreen } from "@/components/LoadingScreen";

type Phase = "loading" | "title" | "intro" | "playing";

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [showIntro, setShowIntro] = useState(false);
  const [overlay, setOverlay] = useState<
    null | "map" | "projects" | "pause" | "contact"
  >(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [nearbyMilestoneId, setNearbyMilestoneId] = useState<string | null>(null);
  const [currentAreaId, setCurrentAreaId] = useState<string | null>(null);
  const [failedAsset, setFailedAsset] = useState(false);
  useEffect(() => {
    // graceful fallback: if the canvas 2D context is unavailable, show the
    // project archive instead of a blank screen.
    const test = document.createElement("canvas");
    if (!test.getContext("2d")) setFailedAsset(true);
  }, []);

  const {
    progress,
    settings,
    discover,
    visitArea,
    resetProgress,
    toggleMute,
    toggleReducedMotion,
  } = useGameProgress();

  // stable singletons
  const inputRef = useRef<InputState>(createInputState());
  const audioRef = useRef<AudioManager | null>(null);
  if (audioRef.current === null) audioRef.current = new AudioManager();
  const warpRef = useRef<(x: number, y: number) => void>(() => {});

  // keyboard
  useEffect(() => attachKeyboard(inputRef.current), []);

  // audio mute sync
  useEffect(() => {
    audioRef.current?.setMuted(settings.muted);
  }, [settings.muted]);

  // loading -> title after a brief beat (feels deliberate, not a real load)
  useEffect(() => {
    const t = setTimeout(() => setPhase("title"), 900);
    return () => clearTimeout(t);
  }, []);

  // global hotkeys: M = map, P/Esc = pause, C = contact
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      if (e.code === "KeyM") {
        e.preventDefault();
        setOverlay((o) => (o === "map" ? null : "map"));
      } else if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        setOverlay((o) => (o === "pause" ? null : "pause"));
      } else if (e.code === "KeyJ") {
        e.preventDefault();
        setOverlay((o) => (o === "projects" ? null : "projects"));
      } else if (e.code === "KeyC") {
        e.preventDefault();
        setOverlay((o) => (o === "contact" ? null : "contact"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // warp events from ProjectList "Visit in World"
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const pos = milestonePosition(id);
      if (pos) {
        warpRef.current(pos.x, pos.y);
        setOverlay(null);
        if (phase === "title") setPhase("playing");
      }
    };
    window.addEventListener("warp-to-milestone", handler);
    return () => window.removeEventListener("warp-to-milestone", handler);
  }, [phase]);

  const startGame = useCallback(() => {
    // audio must start from a user gesture
    audioRef.current?.start();
    audioRef.current?.setMuted(settings.muted);
    setPhase("playing");
    setShowIntro(true);
  }, [settings.muted]);

  const skipToProjects = useCallback(() => {
    audioRef.current?.start();
    audioRef.current?.setMuted(settings.muted);
    setPhase("playing");
    setOverlay("projects");
  }, [settings.muted]);

  const handleInteract = useCallback(
    (milestoneId: string) => {
      const project = projects.find((p) => p.id === milestoneId);
      if (!project) return;
      if (!progress.discovered.includes(milestoneId)) {
        discover(milestoneId);
        audioRef.current?.playDiscover();
      }
      setActiveProject(project);
    },
    [progress.discovered, discover]
  );

  const handleNearbyChange = useCallback((id: string | null) => {
    setNearbyMilestoneId(id);
  }, []);

  const handleVisitArea = useCallback(
    (areaId: string) => {
      visitArea(areaId);
      setCurrentAreaId(areaId);
    },
    [visitArea]
  );

  const touchInteract = useCallback(() => {
    if (nearbyMilestoneId) handleInteract(nearbyMilestoneId);
  }, [nearbyMilestoneId, handleInteract]);

  const warpTo = useCallback((x: number, y: number) => {
    warpRef.current(x, y);
    setOverlay(null);
  }, []);

  const openProjectFromList = useCallback((p: Project) => {
    setActiveProject(p);
  }, []);

  const currentArea = useMemo(
    () => areas.find((a) => a.id === currentAreaId) ?? null,
    [currentAreaId]
  );

  const paused = phase !== "playing" || overlay !== null || activeProject !== null;

  // graceful asset-failure fallback: if canvas context were unavailable we'd
  // flip failedAsset; show a message instead of a blank screen.
  if (failedAsset) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-fog px-6 text-center">
        <p className="font-display text-xl text-bone">The world failed to render.</p>
        <p className="mt-2 text-sm text-bone-dim">
          You can still browse the projects below.
        </p>
        <button
          onClick={() => setOverlay("projects")}
          className="mt-6 rounded-full border border-blood/50 bg-blood/15 px-6 py-3 text-sm uppercase tracking-widest text-bone"
        >
          Open Project Archive
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-fog">
      {/* the world canvas keeps running underneath overlays so movement
          resumes instantly when overlays close */}
      {phase !== "title" && phase !== "loading" && (
        <GameCanvas
          input={inputRef.current}
          audio={audioRef.current!}
          discoveredIds={progress.discovered}
          reducedMotion={settings.reducedMotion}
          onNearbyMilestoneChange={handleNearbyChange}
          onVisitArea={handleVisitArea}
          onInteract={handleInteract}
          paused={paused}
          warpRef={warpRef}
        />
      )}

      {/* touch controls only during active play */}
      {phase === "playing" && !overlay && !activeProject && (
        <TouchControls input={inputRef.current} onInteract={touchInteract} />
      )}

      {/* HUD */}
      {phase === "playing" && (
        <Hud
          areaName={currentArea?.name ?? null}
          discoveredCount={progress.discovered.length}
          totalCount={projects.length}
          muted={settings.muted}
          onOpenMap={() => setOverlay("map")}
          onOpenProjects={() => setOverlay("projects")}
          onOpenPause={() => setOverlay("pause")}
          onToggleMute={toggleMute}
        />
      )}

      {/* nearby interaction prompt */}
      {phase === "playing" && !overlay && !activeProject && nearbyMilestoneId && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 md:bottom-8">
          <div className="rounded-full border border-bone-dim/40 bg-black/60 px-4 py-2 text-xs uppercase tracking-widest text-bone backdrop-blur-md">
            Press <span className="text-blood">E</span> or tap{" "}
            <span className="text-blood">Act</span> to uncover
          </div>
        </div>
      )}

      {/* overlays */}
      {phase === "loading" && <LoadingScreen />}
      {phase === "title" && (
        <TitleScreen onStart={startGame} onSkipProjects={skipToProjects} />
      )}
      {phase === "playing" && showIntro && !overlay && !activeProject && (
        <IntroOverlay onClose={() => setShowIntro(false)} />
      )}
      {overlay === "map" && (
        <MapPanel
          discoveredIds={progress.discovered}
          onClose={() => setOverlay(null)}
          onWarpTo={warpTo}
        />
      )}
      {overlay === "projects" && (
        <ProjectList
          discoveredIds={progress.discovered}
          onClose={() => setOverlay(null)}
          onOpenProject={openProjectFromList}
        />
      )}
      {overlay === "pause" && (
        <PauseMenu
          muted={settings.muted}
          reducedMotion={settings.reducedMotion}
          onToggleMute={toggleMute}
          onToggleReducedMotion={toggleReducedMotion}
          onResetProgress={resetProgress}
          onContact={() => setOverlay("contact")}
          onResume={() => setOverlay(null)}
        />
      )}
      {overlay === "contact" && (
        <ContactCard onClose={() => setOverlay(null)} />
      )}
      {activeProject && (
        <ProjectPanel
          project={activeProject}
          discovered={progress.discovered.includes(activeProject.id)}
          onClose={() => setActiveProject(null)}
          onContact={() => setOverlay("contact")}
        />
      )}
    </div>
  );
}

// keep WORLD dims referenced so tree-shaking doesn't drop them if reused later
void WORLD_WIDTH;
void WORLD_HEIGHT;
void profile;
