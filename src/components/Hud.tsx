// HUD: the top bar shown during gameplay. Shows discovered count, current
// area name, and buttons for map, projects, pause, and mute.

import { Map as MapIcon, List, Pause, Volume2, VolumeX, Compass } from "lucide-react";

interface Props {
  areaName: string | null;
  discoveredCount: number;
  totalCount: number;
  muted: boolean;
  onOpenMap: () => void;
  onOpenProjects: () => void;
  onOpenPause: () => void;
  onToggleMute: () => void;
}

export function Hud({
  areaName,
  discoveredCount,
  totalCount,
  muted,
  onOpenMap,
  onOpenProjects,
  onOpenPause,
  onToggleMute,
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full border border-bone-deep/20 bg-black/45 px-3 py-2 backdrop-blur-md sm:px-4">
        {/* area + progress */}
        <div className="flex min-w-0 items-center gap-2">
          <Compass size={16} className="shrink-0 text-blood" />
          <div className="min-w-0">
            <p className="truncate font-display text-xs uppercase tracking-widest text-bone sm:text-sm">
              {areaName ?? "The Open Fog"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-bone-deep">
              {discoveredCount}/{totalCount} milestones
            </p>
          </div>
        </div>

        {/* buttons */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <HudButton label="Map" onClick={onOpenMap}><MapIcon size={16} /></HudButton>
          <HudButton label="Projects" onClick={onOpenProjects}><List size={16} /></HudButton>
          <HudButton label="Mute" onClick={onToggleMute}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </HudButton>
          <HudButton label="Pause" onClick={onOpenPause}><Pause size={16} /></HudButton>
        </div>
      </div>
    </div>
  );
}

function HudButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-bone-deep/20 text-bone-dim transition hover:border-bone-dim/60 hover:bg-white/5 hover:text-bone sm:h-10 sm:w-10"
    >
      {children}
    </button>
  );
}
