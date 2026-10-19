// In-game map: shows all areas and milestones on a mini world map. Discovered
// milestones are lit; undiscovered ones are dim. Clicking a discovered (or any)
// area warps the player there and closes the map. Also shows progress.

import { areas, projects, WORLD_WIDTH, WORLD_HEIGHT } from "@/data/portfolio";
import { X, MapPin } from "lucide-react";

interface Props {
  discoveredIds: string[];
  onClose: () => void;
  onWarpTo: (x: number, y: number) => void;
}

export function MapPanel({ discoveredIds, onClose, onWarpTo }: Props) {
  // scale world to fit a ~640px wide panel
  const panelW = Math.min(640, window.innerWidth - 48);
  const panelH = (panelW * WORLD_HEIGHT) / WORLD_WIDTH;
  const scale = panelW / WORLD_WIDTH;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="rise w-full max-w-2xl rounded-2xl border border-bone-deep/30 bg-[#0b0d12]/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-blood">Cartograph</p>
            <h2 className="mt-1 font-display text-2xl text-bone">The World Map</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close map"
            className="rounded-full p-2 text-bone-dim transition hover:bg-white/5 hover:text-bone"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-2 text-xs text-bone-deep">
          Tap a region to travel there instantly. Discovered milestones glow green.
        </p>

        <div className="mt-4 overflow-x-auto panel-scroll">
          <div
            className="relative mx-auto rounded-xl border border-bone-deep/20 bg-black/50"
            style={{ width: panelW, height: panelH }}
          >
            {/* area rectangles */}
            {areas.map((a) => {
              const project = projects.find((p) => p.id === a.projectId);
              const discovered = project
                ? discoveredIds.includes(project.id)
                : false;
              return (
                <button
                  key={a.id}
                  onClick={() => onWarpTo(a.x + a.width / 2, a.y + a.height / 2)}
                  className="group absolute rounded-md border text-left transition"
                  style={{
                    left: a.x * scale,
                    top: a.y * scale,
                    width: a.width * scale,
                    height: a.height * scale,
                    borderColor: discovered ? "rgba(122,168,106,0.5)" : "rgba(179,64,58,0.35)",
                    background: discovered
                      ? "rgba(122,168,106,0.08)"
                      : "rgba(179,64,58,0.05)",
                  }}
                >
                  <span className="block px-1 pt-1 font-display text-[10px] uppercase tracking-wider text-bone sm:text-xs">
                    {a.name}
                  </span>
                  <span className="block px-1 text-[9px] text-bone-deep">{a.subtitle}</span>
                  <MapPin
                    size={10}
                    className={`absolute right-1 top-1 ${
                      discovered ? "text-moss" : "text-blood"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-widest text-bone-deep">
          <span>{discoveredIds.length} / {projects.length} discovered</span>
          <button
            onClick={onClose}
            className="rounded-full border border-bone-deep/30 px-4 py-2 text-bone-dim transition hover:border-bone-dim hover:text-bone"
          >
            Return to World
          </button>
        </div>
      </div>
    </div>
  );
}
