// Title screen shown before the game starts. Calls onStart when the visitor
// chooses to enter the world, and onSkipProjects to jump straight to the
// accessible project list (no gameplay required).

import { profile } from "@/data/portfolio";
import { Skull, Map, List } from "lucide-react";

interface Props {
  onStart: () => void;
  onSkipProjects: () => void;
}

export function TitleScreen({ onStart, onSkipProjects }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-fog">
      {/* layered fog backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-60 animate-fog-drift"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, rgba(40,50,70,0.4), transparent 70%), radial-gradient(40% 40% at 20% 80%, rgba(60,30,30,0.25), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(50% 40% at 70% 20%, rgba(120,140,180,0.18), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex max-w-xl flex-col items-center px-6 text-center">
        <div className="mb-6 text-blood flicker">
          <Skull size={56} strokeWidth={1.25} />
        </div>
        <p className="mb-3 font-display text-xs uppercase tracking-[0.5em] text-bone-dim">
          {profile.tagline}
        </p>
        <h1 className="font-display text-4xl font-700 leading-tight text-bone sm:text-5xl md:text-6xl">
          {profile.name}
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-bone-dim">
          {profile.intro}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={onStart}
            className="group flex items-center gap-2 rounded-full border border-blood/60 bg-blood/15 px-7 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/30 hover:border-blood"
          >
            <Map size={16} className="transition group-hover:scale-110" />
            Enter the World
          </button>
          <button
            onClick={onSkipProjects}
            className="flex items-center gap-2 rounded-full border border-bone-deep/40 px-7 py-3 text-sm uppercase tracking-widest text-bone-dim transition hover:border-bone-dim hover:text-bone"
          >
            <List size={16} />
            Skip to Projects
          </button>
        </div>

        <p className="mt-10 text-[11px] uppercase tracking-widest text-bone-deep">
          Move with WASD / Arrows · Interact with E or tap
        </p>
      </div>
    </div>
  );
}
