// Skippable intro overlay shown once when entering the world. Explains
// controls for both desktop and mobile.

import { Keyboard, MousePointerClick, Hand, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function IntroOverlay({ onClose }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="rise w-full max-w-lg rounded-2xl border border-bone-deep/30 bg-[#0b0d12]/95 p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-blood">
              Welcome, Wanderer
            </p>
            <h2 className="mt-2 font-display text-2xl text-bone">Before You Enter</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Skip intro"
            className="rounded-full p-2 text-bone-dim transition hover:bg-white/5 hover:text-bone"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-bone-dim">
          You arrive in a fog-shrouded world where five regions hide Waleed's real
          projects. Walk to a glowing milestone and press interact to uncover its
          story. Your discoveries are saved on this device.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-bone-deep/20 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2 text-bone">
              <Keyboard size={18} />
              <span className="text-xs uppercase tracking-widest">Desktop</span>
            </div>
            <ul className="space-y-1 text-xs text-bone-dim">
              <li><span className="text-bone">WASD / Arrows</span> — move</li>
              <li><span className="text-bone">Shift</span> — run</li>
              <li><span className="text-bone">E / Space</span> — interact</li>
              <li><span className="text-bone">M</span> — map · <span className="text-bone">Esc</span> — pause</li>
            </ul>
          </div>
          <div className="rounded-xl border border-bone-deep/20 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2 text-bone">
              <Hand size={18} />
              <span className="text-xs uppercase tracking-widest">Mobile</span>
            </div>
            <ul className="space-y-1 text-xs text-bone-dim">
              <li><span className="text-bone">Left pad</span> — drag to move</li>
              <li><span className="text-bone">Act button</span> — interact</li>
              <li><span className="text-bone">Top bar</span> — map & menu</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-bone-deep">
          <MousePointerClick size={14} />
          Prefer not to play? Use the Projects button in the top bar to browse everything.
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-blood/50 bg-blood/15 py-3 font-display text-sm uppercase tracking-widest text-bone transition hover:bg-blood/30"
        >
          Begin Exploring
        </button>
      </div>
    </div>
  );
}
