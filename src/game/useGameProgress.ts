import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "waleed-portfolio-progress";

export interface GameSettings {
  muted: boolean;
  reducedMotion: boolean;
  showFps: boolean;
}

export interface GameProgress {
  discovered: string[]; // milestone ids discovered
  visitedAreas: string[]; // area ids entered
}

const defaultProgress: GameProgress = {
  discovered: [],
  visitedAreas: [],
};

const defaultSettings: GameSettings = {
  muted: false,
  reducedMotion: false,
  showFps: false,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(() =>
    load(STORAGE_KEY + "-progress", defaultProgress)
  );
  const [settings, setSettings] = useState<GameSettings>(() =>
    load(STORAGE_KEY + "-settings", defaultSettings)
  );

  useEffect(() => save(STORAGE_KEY + "-progress", progress), [progress]);
  useEffect(() => save(STORAGE_KEY + "-settings", settings), [settings]);

  const discover = useCallback((id: string) => {
    setProgress((p) =>
      p.discovered.includes(id)
        ? p
        : { ...p, discovered: [...p.discovered, id] }
    );
  }, []);

  const visitArea = useCallback((id: string) => {
    setProgress((p) =>
      p.visitedAreas.includes(id)
        ? p
        : { ...p, visitedAreas: [...p.visitedAreas, id] }
    );
  }, []);

  const resetProgress = useCallback(() => setProgress(defaultProgress), []);

  const toggleMute = useCallback(
    () => setSettings((s) => ({ ...s, muted: !s.muted })),
    []
  );
  const toggleReducedMotion = useCallback(
    () => setSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion })),
    []
  );

  return {
    progress,
    settings,
    discover,
    visitArea,
    resetProgress,
    toggleMute,
    toggleReducedMotion,
  };
}
