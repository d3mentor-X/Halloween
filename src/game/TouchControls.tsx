// Touch controls: a directional pad + interact button shown on touch devices.
// Rendered as fixed-position overlay. Calls back into the shared InputState.

import { useEffect, useRef } from "react";
import type { InputState } from "./input";

interface Props {
  input: InputState;
  onInteract: () => void;
}

export function TouchControls({ input, onInteract }: Props) {
  const dpadRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const center = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dpad = dpadRef.current;
    if (!dpad) return;

    const onStart = (e: PointerEvent) => {
      if (activePointer.current !== null) return;
      activePointer.current = e.pointerId;
      const rect = dpad.getBoundingClientRect();
      center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      dpad.setPointerCapture(e.pointerId);
      update(e);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointer.current) return;
      update(e);
    };
    const onEnd = (e: PointerEvent) => {
      if (e.pointerId !== activePointer.current) return;
      activePointer.current = null;
      input.up = input.down = input.left = input.right = false;
      if (knobRef.current) knobRef.current.style.transform = `translate(0,0)`;
    };
    const update = (e: PointerEvent) => {
      const dx = e.clientX - center.current.x;
      const dy = e.clientY - center.current.y;
      const dist = Math.hypot(dx, dy);
      const dead = 14;
      const max = 48;
      const nx = dist > dead ? dx / dist : 0;
      const ny = dist > dead ? dy / dist : 0;
      input.left = nx < -0.35;
      input.right = nx > 0.35;
      input.up = ny < -0.35;
      input.down = ny > 0.35;
      const kx = Math.max(-max, Math.min(max, dx));
      const ky = Math.max(-max, Math.min(max, dy));
      if (knobRef.current) knobRef.current.style.transform = `translate(${kx}px,${ky}px)`;
    };

    dpad.addEventListener("pointerdown", onStart);
    dpad.addEventListener("pointermove", onMove);
    dpad.addEventListener("pointerup", onEnd);
    dpad.addEventListener("pointercancel", onEnd);
    return () => {
      dpad.removeEventListener("pointerdown", onStart);
      dpad.removeEventListener("pointermove", onMove);
      dpad.removeEventListener("pointerup", onEnd);
      dpad.removeEventListener("pointercancel", onEnd);
    };
  }, [input]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none md:hidden">
      <div
        ref={dpadRef}
        className="pointer-events-auto absolute bottom-6 left-6 h-32 w-32 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm"
        style={{ touchAction: "none" }}
      >
        <div
          ref={knobRef}
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone/80 shadow-lg"
          style={{ transition: "transform 60ms linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/40">
          Move
        </div>
      </div>
      <button
        className="pointer-events-auto absolute bottom-6 right-6 h-20 w-20 rounded-full border border-blood/40 bg-blood/20 text-xs font-semibold uppercase tracking-widest text-bone active:scale-95"
        onPointerDown={(e) => {
          e.preventDefault();
          onInteract();
        }}
      >
        Act
      </button>
    </div>
  );
}
