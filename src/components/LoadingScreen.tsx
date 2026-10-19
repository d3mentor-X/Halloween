// Loading screen shown on first mount while the world is prepared. Also used
// as a graceful fallback message if something fails.

import { Skull } from "lucide-react";

interface Props {
  message?: string;
}

export function LoadingScreen({ message = "Summoning the fog…" }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-fog">
      <div className="text-blood flicker">
        <Skull size={48} strokeWidth={1.25} />
      </div>
      <p className="mt-4 font-display text-xs uppercase tracking-[0.4em] text-bone-dim">
        {message}
      </p>
      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-bone-deep/20">
        <div className="h-full w-1/2 animate-pulse-slow bg-blood/60" />
      </div>
    </div>
  );
}
