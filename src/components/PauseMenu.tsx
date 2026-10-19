// Pause / settings menu. Toggles mute and reduced motion, shows controls,
// offers reset progress, and contact access.

import { profile } from "@/data/portfolio";
import { X, Volume2, VolumeX, Zap, Snail, RotateCcw, Mail, Github, Linkedin } from "lucide-react";

interface Props {
  muted: boolean;
  reducedMotion: boolean;
  onToggleMute: () => void;
  onToggleReducedMotion: () => void;
  onResetProgress: () => void;
  onContact: () => void;
  onResume: () => void;
}

export function PauseMenu({
  muted,
  reducedMotion,
  onToggleMute,
  onToggleReducedMotion,
  onResetProgress,
  onContact,
  onResume,
}: Props) {
  const isPlaceholder = (v: string) => v.startsWith("PLACEHOLDER");

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="rise w-full max-w-md rounded-2xl border border-bone-deep/30 bg-[#0b0d12]/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-bone">Paused</h2>
          <button
            onClick={onResume}
            aria-label="Close"
            className="rounded-full p-2 text-bone-dim transition hover:bg-white/5 hover:text-bone"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          <ToggleRow
            active={muted}
            onClick={onToggleMute}
            icon={muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            label="Mute Audio"
          />
          <ToggleRow
            active={reducedMotion}
            onClick={onToggleReducedMotion}
            icon={reducedMotion ? <Snail size={16} /> : <Zap size={16} />}
            label="Reduced Motion"
          />
        </div>

        <div className="mt-5 rounded-xl border border-bone-deep/20 bg-white/[0.02] p-4 text-xs text-bone-dim">
          <p className="mb-2 font-display text-[11px] uppercase tracking-widest text-bone">Controls</p>
          <div className="grid grid-cols-2 gap-1">
            <span>WASD / Arrows</span><span className="text-bone">Move</span>
            <span>Shift</span><span className="text-bone">Run</span>
            <span>E / Space</span><span className="text-bone">Interact</span>
            <span>M</span><span className="text-bone">Map</span>
            <span>P / Esc</span><span className="text-bone">Pause</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("Reset all discovered milestones? This cannot be undone.")) {
              onResetProgress();
            }
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-blood/40 bg-blood/10 py-3 text-xs uppercase tracking-widest text-bone-dim transition hover:border-blood hover:text-bone"
        >
          <RotateCcw size={14} /> Reset Progress
        </button>

        <div className="mt-5 border-t border-bone-deep/15 pt-4">
          <p className="text-[11px] uppercase tracking-widest text-bone-deep">{profile.name}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-bone-dim">
            {!isPlaceholder(profile.contact.email) && (
              <a href={`mailto:${profile.contact.email}`} className="flex items-center gap-1 hover:text-bone"><Mail size={12} /> Email</a>
            )}
            {!isPlaceholder(profile.contact.github) && (
              <a href={profile.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-bone"><Github size={12} /> GitHub</a>
            )}
            {!isPlaceholder(profile.contact.linkedin) && (
              <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-bone"><Linkedin size={12} /> LinkedIn</a>
            )}
            <button onClick={onContact} className="ml-auto rounded-full border border-blood/50 px-3 py-1 uppercase tracking-widest text-bone hover:bg-blood/20">
              Contact
            </button>
          </div>
        </div>

        <button
          onClick={onResume}
          className="mt-6 w-full rounded-full border border-blood/50 bg-blood/15 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/30"
        >
          Resume
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-bone-deep/20 bg-white/[0.02] px-4 py-3 text-sm text-bone-dim transition hover:border-bone-dim/50 hover:text-bone"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        className={`flex h-6 w-11 items-center rounded-full px-0.5 transition ${
          active ? "bg-blood/40 justify-end" : "bg-bone-deep/30 justify-start"
        }`}
      >
        <span className="h-5 w-5 rounded-full bg-bone" />
      </span>
    </button>
  );
}
