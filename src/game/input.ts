// Input handler: tracks WASD/arrow movement, shift-to-run, interact key, and
// pointer position. Also exposes a set of "virtual" buttons for touch controls.

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  interactPressed: boolean; // edge-triggered, cleared after consumed
}

export function createInputState(): InputState {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    run: false,
    interactPressed: false,
  };
}

const keyMap: Record<string, keyof InputState> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "run",
  ShiftRight: "run",
};

export function attachKeyboard(input: InputState): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    const k = keyMap[e.code];
    if (k) {
      (input[k] as boolean) = true;
      if (e.code.startsWith("Arrow")) e.preventDefault();
    }
    if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter") {
      if (!e.repeat) input.interactPressed = true;
      e.preventDefault();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const k = keyMap[e.code];
    if (k) (input[k] as boolean) = false;
  };
  const onBlur = () => {
    input.up = input.down = input.left = input.right = input.run = false;
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  };
}
