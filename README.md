# Waleed Hasnain Shah — The Portfolio (Playable)

A dark, atmospheric, **playable** Halloween exploration portfolio. Visitors wander
a fog-shrouded open world, discover Waleed's real projects as glowing milestones,
and read polished project panels. Built with React + TypeScript + Vite + Canvas.

## Run it

```bash
npm install
npm run dev      # local development
npm run build    # production build
npm run typecheck
```

## How to play

- **Move:** WASD or Arrow keys (drag the on-screen pad on mobile)
- **Run:** Shift
- **Interact:** E, Space, or Enter (or the Act button on mobile)
- **Map:** M
- **Projects list:** J (or the Projects button in the top bar)
- **Pause / settings:** P or Esc

Walk up to a glowing red milestone and press interact to discover the project.
Discovered milestones turn green and your progress is saved in the browser
(localStorage), so it persists across visits.

Don't want to play? The title screen and top bar both have a **Skip to Projects**
button that opens the full project archive.

---

## Editing your portfolio

Almost everything you'll want to change lives in **one file**:

### `src/data/portfolio.ts`

This is the single source of truth. Edit it to change:

| What | Where in the file |
|------|-------------------|
| Your name, tagline, intro, skills | `profile` |
| Your email, GitHub, LinkedIn | `profile.contact` |
| A project's title, summary, tech, status, links | `projects` array |
| World area names, positions, colors | `areas` array |

#### Update your contact links

In `profile.contact`, replace the `PLACEHOLDER: ...` strings with your real
URLs. Anything still starting with `PLACEHOLDER` is automatically hidden or
shown as "not set yet" in the UI — so you can deploy before every link is ready.

```ts
contact: {
  email: "you@example.com",
  github: "https://github.com/your-handle",
  linkedin: "https://www.linkedin.com/in/your-handle",
}
```

#### Update a project

Find the project in the `projects` array by its `id` and edit the fields:

```ts
{
  id: "echoes-of-the-dead",          // stable id — don't change once live
  title: "Echoes of the Dead",
  subtitle: "Unity 3D zombie survival game",
  summary: "...",                    // shown in the project panel
  technologies: ["Unity", "C#", ...],
  status: "Shipped",                 // Shipped | In Progress | Research | Planned
  links: [
    { label: "Repository", url: "https://github.com/..." },
    { label: "Demo", url: "https://..." },
  ],
}
```

`status` controls the colored badge: Shipped = green, In Progress = amber,
Research = blue, Planned = dim.

#### Add a new project milestone

1. Add a new entry to the `projects` array with a unique `id`.
2. Add a matching entry to the `areas` array — set `projectId` to the same id,
   and give it an `x`/`y` position on the world map (world is 2600×1800 px).
   Pick a `tint` color for the region's fog glow.
3. Done. The new milestone appears in the world, on the map, and in the project list.

#### Move an area

Change the `x` and `y` in its `areas` entry. The milestone sits at the area's
center automatically.

---

## File structure

```
src/
  data/
    portfolio.ts        # <-- EDIT THIS: name, projects, contact, world layout
  game/
    input.ts            # keyboard input state
    audio.ts            # synthesized ambient + SFX (no audio files)
    world.ts            # collision geometry + milestone positions
    render.ts           # canvas renderer (fog, milestones, player, particles)
    GameCanvas.tsx      # game loop: movement, camera, collisions, drawing
    TouchControls.tsx   # on-screen D-pad + Act button for mobile
    useGameProgress.ts  # localStorage save/load for discoveries + settings
  components/
    TitleScreen.tsx     # entry screen
    IntroOverlay.tsx    # skippable controls intro
    Hud.tsx             # top bar (area, progress, map/projects/pause/mute)
    ProjectPanel.tsx    # project detail modal
    MapPanel.tsx        # in-game world map with fast travel
    ProjectList.tsx     # accessible project archive (no gameplay needed)
    PauseMenu.tsx       # settings: mute, reduced motion, reset, contact
    ContactCard.tsx     # contact details modal
    LoadingScreen.tsx   # loading + graceful fallback
  App.tsx               # orchestrates phases and overlays
```

## Accessibility & comfort

- **Reduced Motion** toggle (Pause menu) disables bobbing, pulsing, and particle drift.
- **Mute** toggle in the top bar and pause menu. Audio is synthesized and soft —
  no sudden loud sounds or flashes.
- **Skip to Projects** — the full archive is usable without playing.
- Text is bone-white on near-black for high contrast.

## Notes

- All visuals are drawn procedurally on a canvas — there are no image assets to
  load or fail.
- All audio is synthesized with the Web Audio API — no audio files.
- Progress is stored per-browser in `localStorage` under the
  `waleed-portfolio-progress-*` keys. Clearing site data resets it.
