// Accessible project list — no gameplay required. Lists every project as a
// card. Clicking a card opens the same project panel used in-game.

import { projects, profile } from "@/data/portfolio";
import { Project } from "@/data/portfolio";
import { X, ChevronRight, MapPin } from "lucide-react";

interface Props {
  discoveredIds: string[];
  onClose: () => void;
  onOpenProject: (p: Project) => void;
}

const statusDot: Record<string, string> = {
  Shipped: "bg-moss",
  "In Progress": "bg-amber",
  Research: "bg-moon",
  Planned: "bg-bone-deep",
};

export function ProjectList({ discoveredIds, onClose, onOpenProject }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-stretch justify-center bg-black/85 backdrop-blur-sm">
      <div className="rise panel-scroll w-full max-w-3xl overflow-y-auto px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-blood">Archive</p>
            <h2 className="mt-1 font-display text-2xl text-bone sm:text-3xl">All Projects</h2>
            <p className="mt-1 text-xs text-bone-deep">
              Browse without playing, or jump into the world to discover them.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-bone-dim transition hover:bg-white/5 hover:text-bone"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {projects.map((p) => {
            const discovered = discoveredIds.includes(p.id);
            return (
              <div
                key={p.id}
                className="group rounded-xl border border-bone-deep/25 bg-white/[0.02] p-4 transition hover:border-bone-dim/50 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusDot[p.status] ?? statusDot.Planned}`} />
                  <span className="text-[10px] uppercase tracking-widest text-bone-deep">{p.status}</span>
                  {discovered && (
                    <span className="ml-auto text-[10px] uppercase tracking-widest text-moss">Found</span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-lg text-bone">{p.title}</h3>
                <p className="text-[11px] uppercase tracking-wider text-blood">{p.subtitle}</p>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-bone-dim">{p.summary}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onOpenProject(p)}
                    className="flex items-center gap-1 rounded-full border border-bone-dim/40 px-3 py-1.5 text-[11px] uppercase tracking-widest text-bone transition hover:bg-white/5"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                  <button
                    onClick={() => {
                      // warp to milestone then close list
                      const ev = new CustomEvent("warp-to-milestone", { detail: p.id });
                      window.dispatchEvent(ev);
                      onClose();
                    }}
                    className="flex items-center gap-1 rounded-full border border-bone-deep/30 px-3 py-1.5 text-[11px] uppercase tracking-widest text-bone-dim transition hover:border-bone-dim hover:text-bone"
                  >
                    <MapPin size={12} /> Visit in World
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-bone-deep/20 bg-white/[0.02] p-4 text-xs text-bone-dim">
          <p className="font-display text-[11px] uppercase tracking-widest text-bone">{profile.name}</p>
          <p className="mt-1">{profile.intro}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-bone-deep/30 py-3 text-xs uppercase tracking-widest text-bone-dim transition hover:border-bone-dim hover:text-bone"
        >
          Back
        </button>
      </div>
    </div>
  );
}
