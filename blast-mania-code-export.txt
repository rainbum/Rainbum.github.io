# Blast Mania Combined Code Export

This file combines the source code needed to move Blast Mania manually to another website.
It excludes node_modules, build artifacts, screenshots, and logs.

## Entry HTML

**Source File:** `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#4a4cc6" />
    <meta name="description" content="A colorful tap-to-blast puzzle game with boosters, combos, and saga progression!" />
    <title>Blast Mania â€” Tap, Match & Pop!</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>ðŸŽ®</text></svg>" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Project Package Setup

**Source File:** `package.json`

```json
{
  "name": "react-vite-tailwind",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "2.1.1",
    "framer-motion": "^12.38.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "tailwind-merge": "3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.17",
    "@types/node": "^22.0.0",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "5.1.1",
    "tailwindcss": "4.1.17",
    "typescript": "5.9.3",
    "vite": "7.2.4",
    "vite-plugin-singlefile": "2.3.0"
  }
}
```

## TypeScript Config

**Source File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["node"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts"]
}
```

## Vite Build Config

**Source File:** `vite.config.ts`

```ts
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

## App Bootstrap

**Source File:** `src/main.tsx`

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

## Main App Shell

**Source File:** `src/App.tsx`

```tsx
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { BlockIcon } from "./components/svg/BlockIcon";
import { DiscoVFX } from "./components/vfx/DiscoVFX";
import { RocketVFX } from "./components/vfx/RocketVFX";
import { SplashScreen } from "./components/SplashScreen";
import { BGMManager, type BGMTrack } from "./utils/BGMManager";
import { FeverOverlay } from "./components/FeverOverlay";
import { ConfettiSystem } from "./components/ConfettiSystem";
import { useMatchableIds } from "./hooks/useMatchableIds";
import { getIdleAnimParams } from "./hooks/useBlockIdleAnim";
import { BonusLootPopup } from "./components/BonusLootPopup";
import { DailyWheelModal } from "./components/DailyWheelModal";
import { EndPopup } from "./components/EndPopup";
import { ImmersiveScreen } from "./components/layout/ImmersiveScreen";
import { type MascotState } from "./components/GameMascot";
import { InGameBoosters } from "./components/InGameBoosters";
import LevelMap from "./components/LevelMap";
import { OutOfLivesPopup } from "./components/OutOfLivesPopup";
import { PauseMenu } from "./components/PauseMenu";
import { PreGameScreen } from "./components/pregame/PreGameScreen";
import { RewardToast } from "./components/RewardToast";
import { SettingsModal } from "./components/SettingsModal";
import { TreasureRewardPopup } from "./components/TreasureRewardPopup";
import { TopHUD } from "./components/TopHUD";
import { BIG_BLAST_LABELS, CELL_SIZE, COLUMNS, ECONOMY, GRID_GAP, LEVELS, ROWS, STORAGE_KEYS, TOON_COLORS } from "./game/constants";
import { getEpisodeThemeForLevel } from "./game/content/episodeThemes";
import {
  buildGrid,
  CHAMPIONS_START_LEVEL,
  createInitialTiles,
  findConnectedColorGroup,
  generateLevelData,
  getAdjacentBooster,
  MAP_LEVEL_CAP,
  resolveCombo,
  resolveTap,
  setGameMode,
  shuffleRegularTiles,
  useGloveBooster,
  useHammerBooster,
} from "./game/engine";
import { BONUS_LEVEL_CONFIG } from "./game/levelsData";
import { deriveResponsiveLayoutMode } from "./game/layout";
import { triggerHaptic } from "./game/haptics";
import {
  buildMissionCards,
  canSpinDailyWheel,
  claimMission,
  createDefaultMetaProgress,
  createTreasureChest,
  ensureMetaProgress,
  hydrateMetaProgress,
  openTreasureChest,
  queueTreasureChest,
  registerLevelWin,
  setSelectedCharacter,
  spinDailyWheel,
} from "./game/metaProgression";
import { useAudioManager } from "./game/useAudioManager";
import type {
  AppScreen,
  BlockColor,
  BlockTile,
  ChestReward,
  BonusLoot,
  EconomyState,
  DailyWheelSegment,
  FeverState,
  FloatingText,
  GamePhase,
  InGameBoosterKind,
  LevelDefinition,
  MetaProgress,
  MissionId,
  RegularTile,
  RewardBundle,
  RewardTile,
  DiscoVFXState,
  RocketVFXState,
  SagaProgress,
  SettingsState,
  TargetingMode,
} from "./game/types";

type PooledFxSlot = {
  slot: number;
  version: number;
  active: boolean;
  expiresAt: number;
};

type ParticleFx = PooledFxSlot & {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  rotation: number;
  shape: "square" | "star";
  scaleBoost: number;
};

type TargetFlyFx = PooledFxSlot & {
  id: string;
  color: BlockColor;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  arc: number;
  spin: number;
  delay: number;
};

type SplinterFx = PooledFxSlot & {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  color: string;
  width: number;
  height: number;
  delay: number;
};

type ImpactFlashFx = {
  id: string;
  x: number;
  y: number;
  intensity: number;
  radius: number;
};

type CinematicShakeMode = "normal" | "heavy" | "mega" | "grand_slam";
type CameraPulsePreset = "combo" | "mega" | "clear";

type BoosterUseFx =
  | { kind: "hammer"; x: number; y: number }
  | { kind: "glove"; y: number }
  | { kind: "shuffle" };

const DEFAULT_PROGRESS: SagaProgress = {
  unlockedLevel: 1,
  selectedLevel: 1,
  starsByLevel: {},
  bestScoreByLevel: {},
  bonusClaimedLevels: [],
};

const DEFAULT_ECONOMY: EconomyState = {
  coins: ECONOMY.startCoins,
  lives: ECONOMY.startLives,
  nextLifeAt: null,
  unlimitedLivesUntil: null,
  inventory: {
    hammer: 0,
    glove: 0,
    shuffle: 0,
  },
};

const DEFAULT_SETTINGS: SettingsState = {
  isMusicMuted: false,
  isSfxMuted: false,
  isHapticsEnabled: true,
};

const DEFAULT_META_PROGRESS: MetaProgress = createDefaultMetaProgress();

// â”€â”€ Fever Mode constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FEVER_STREAK_TRIGGER = 3;       // consecutive big blasts to activate fever
const FEVER_BLOCKS_TRIGGER = 20;      // OR this many blocks in one tap
const FEVER_DURATION_MS = 5000;       // fever lasts 5 seconds
const FEVER_SCORE_MULTIPLIER = 1.5;   // 1.5Ã— score during fever
const DEFAULT_FEVER: FeverState = {
  active: false,
  streak: 0,
  blocksThisStreak: 0,
  multiplier: 1,
  expiresAt: null,
};

const CINEMATIC_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SHAKE_PRESETS: Record<
  CinematicShakeMode,
  {
    x: number[];
    y: number[];
    rotate: number[];
    scale: number[];
    duration: number;
  }
> = {
  normal: {
    x: [0, -4, 4, -2, 1.5, 0],
    y: [0, 1.5, -1.2, 0.8, -0.3, 0],
    rotate: [0, -0.25, 0.22, -0.08, 0],
    scale: [1, 1.004, 1.002, 1],
    duration: 0.24,
  },
  heavy: {
    x: [0, -9, 10, -7, 5, -2, 0],
    y: [0, 3.2, -3.8, 2.4, -1.3, 0.4, 0],
    rotate: [0, -0.7, 0.55, -0.4, 0.22, 0],
    scale: [1, 1.01, 1.008, 1.003, 1],
    duration: 0.32,
  },
  mega: {
    x: [0, -15, 16, -12, 9, -5, 2, 0],
    y: [0, 5.5, -6.2, 4, -2.6, 1.4, -0.4, 0],
    rotate: [0, -1.05, 0.9, -0.65, 0.34, -0.12, 0],
    scale: [1, 1.016, 1.012, 1.006, 1],
    duration: 0.42,
  },
  grand_slam: {
    x: [0, -22, 24, -18, 13, -8, 4, 0],
    y: [0, 8, -9, 6.2, -4, 2.4, -0.8, 0],
    rotate: [0, -1.5, 1.24, -0.92, 0.48, -0.18, 0],
    scale: [1, 1.024, 1.016, 1.008, 1],
    duration: 0.5,
  },
};

const CAMERA_PRESETS: Record<
  CameraPulsePreset,
  {
    scale: number[];
    y: number[];
    filter: string[];
    duration: number;
  }
> = {
  combo: {
    scale: [1, 1.022, 1.01, 1],
    y: [0, -11, -4, 0],
    filter: ["brightness(1) saturate(1)", "brightness(1.08) saturate(1.06)", "brightness(1.02) saturate(1.02)", "brightness(1) saturate(1)"],
    duration: 0.34,
  },
  mega: {
    scale: [1, 1.04, 1.018, 1],
    y: [0, -18, -7, 0],
    filter: ["brightness(1) saturate(1)", "brightness(1.14) saturate(1.1)", "brightness(1.05) saturate(1.04)", "brightness(1) saturate(1)"],
    duration: 0.48,
  },
  clear: {
    scale: [1, 0.972, 0.988, 1],
    y: [0, 18, 8, 0],
    filter: ["brightness(1) saturate(1)", "brightness(1.12) saturate(1.08)", "brightness(1.04) saturate(1.02)", "brightness(1) saturate(1)"],
    duration: 0.62,
  },
};

const FX_POOL_LIMITS = {
  particles: 64,
  targetFlies: 10,
  splinters: 24,
} as const;

const FX_LIFETIME_MS = {
  particles: 380,
  targetFlies: 760,
  splinters: 460,
  cleanup: 96,
} as const;

const MASTER_BURST_THRESHOLD = 18;

function sampleEvenly<T>(items: readonly T[], count: number): T[] {
  if (count <= 0 || items.length === 0) return [];
  if (items.length <= count) return [...items];

  return Array.from({ length: count }, (_, index) => {
    const sampleIndex = Math.min(items.length - 1, Math.floor(((index + 0.5) / count) * items.length));
    return items[sampleIndex];
  });
}

function createParticlePool(size: number): ParticleFx[] {
  return Array.from({ length: size }, (_, slot) => ({
    slot,
    version: 0,
    active: false,
    expiresAt: 0,
    id: `particle_${slot}`,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    color: "#ffffff",
    size: 0,
    rotation: 0,
    shape: "square",
    scaleBoost: 1,
  }));
}

function createTargetFlyPool(size: number): TargetFlyFx[] {
  return Array.from({ length: size }, (_, slot) => ({
    slot,
    version: 0,
    active: false,
    expiresAt: 0,
    id: `target_fly_${slot}`,
    color: "blue",
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    size: 0,
    arc: 0,
    spin: 0,
    delay: 0,
  }));
}

function createSplinterPool(size: number): SplinterFx[] {
  return Array.from({ length: size }, (_, slot) => ({
    slot,
    version: 0,
    active: false,
    expiresAt: 0,
    id: `splinter_${slot}`,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    rot: 0,
    color: "#ffffff",
    width: 0,
    height: 0,
    delay: 0,
  }));
}

function releaseExpiredPoolEntries<T extends PooledFxSlot>(pool: T[], now: number) {
  let changed = false;

  for (let index = 0; index < pool.length; index += 1) {
    const entry = pool[index];
    if (!entry.active || entry.expiresAt > now) continue;
    pool[index] = { ...entry, active: false };
    changed = true;
  }

  return changed;
}

function deactivateAllPoolEntries<T extends PooledFxSlot>(pool: T[]) {
  let changed = false;

  for (let index = 0; index < pool.length; index += 1) {
    const entry = pool[index];
    if (!entry.active) continue;
    pool[index] = { ...entry, active: false };
    changed = true;
  }

  return changed;
}

function claimPoolIndex<T extends PooledFxSlot>(
  pool: T[],
  cursorRef: MutableRefObject<number>,
  now: number,
) {
  const startIndex = pool.length === 0 ? 0 : cursorRef.current % pool.length;
  let fallbackIndex = startIndex;
  let oldestExpiry = Number.POSITIVE_INFINITY;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const index = (startIndex + offset) % pool.length;
    const entry = pool[index];

    if (!entry.active || entry.expiresAt <= now) {
      cursorRef.current = (index + 1) % pool.length;
      return index;
    }

    if (entry.expiresAt < oldestExpiry) {
      oldestExpiry = entry.expiresAt;
      fallbackIndex = index;
    }
  }

  cursorRef.current = (fallbackIndex + 1) % pool.length;
  return fallbackIndex;
}

function createEmptyProgress(): Record<BlockColor, number> {
  return { red: 0, blue: 0, green: 0, yellow: 0, purple: 0 };
}

function topForRow(row: number) {
  return (ROWS - 1 - row) * (CELL_SIZE + GRID_GAP);
}

function clampProgressLevel(levelId: number) {
  const parsed = Math.floor(levelId);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(999999, parsed));
}

function getLevelForId(levelId: number): LevelDefinition {
  const safeId = clampProgressLevel(levelId);
  if (safeId <= LEVELS.length) {
    return LEVELS[safeId - 1];
  }
  return generateLevelData(safeId);
}

function readSagaProgress(): SagaProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.sagaProgress);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<SagaProgress>;
    return {
      unlockedLevel: clampProgressLevel(typeof parsed.unlockedLevel === "number" ? parsed.unlockedLevel : 1),
      selectedLevel: clampProgressLevel(typeof parsed.selectedLevel === "number" ? parsed.selectedLevel : 1),
      starsByLevel: parsed.starsByLevel ?? {},
      bestScoreByLevel: parsed.bestScoreByLevel ?? {},
      bonusClaimedLevels: Array.isArray(parsed.bonusClaimedLevels)
          ? parsed.bonusClaimedLevels.filter((levelId): levelId is number => typeof levelId === "number" && levelId % 50 === 0)
        : [],
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function readEconomyState(): EconomyState {
  if (typeof window === "undefined") return DEFAULT_ECONOMY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.economy);
    if (!raw) return DEFAULT_ECONOMY;
    const parsed = JSON.parse(raw) as Partial<EconomyState>;
    const coins = typeof parsed.coins === "number" ? Math.max(0, Math.floor(parsed.coins)) : ECONOMY.startCoins;
    const lives = typeof parsed.lives === "number" ? Math.max(0, Math.min(ECONOMY.maxLives, Math.floor(parsed.lives))) : ECONOMY.startLives;
    const nextLifeAt = typeof parsed.nextLifeAt === "number" ? parsed.nextLifeAt : null;
    const unlimitedLivesUntil = typeof parsed.unlimitedLivesUntil === "number" ? parsed.unlimitedLivesUntil : null;
    const inventory = typeof parsed.inventory === "object" && parsed.inventory !== null
      ? {
          hammer: typeof (parsed.inventory as { hammer?: unknown }).hammer === "number" ? Math.max(0, Math.floor((parsed.inventory as { hammer: number }).hammer)) : 0,
          glove: typeof (parsed.inventory as { glove?: unknown }).glove === "number" ? Math.max(0, Math.floor((parsed.inventory as { glove: number }).glove)) : 0,
          shuffle: typeof (parsed.inventory as { shuffle?: unknown }).shuffle === "number" ? Math.max(0, Math.floor((parsed.inventory as { shuffle: number }).shuffle)) : 0,
        }
      : { hammer: 0, glove: 0, shuffle: 0 };

    return {
      coins,
      lives,
      nextLifeAt: lives >= ECONOMY.maxLives ? null : nextLifeAt,
      unlimitedLivesUntil,
      inventory,
    };
  } catch {
    return DEFAULT_ECONOMY;
  }
}

function readSettingsState(): SettingsState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return {
      isMusicMuted: Boolean(parsed.isMusicMuted),
      isSfxMuted: Boolean(parsed.isSfxMuted),
      isHapticsEnabled: parsed.isHapticsEnabled ?? true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function readMetaProgress(sagaProgress: SagaProgress): MetaProgress {
  if (typeof window === "undefined") return ensureMetaProgress(DEFAULT_META_PROGRESS, sagaProgress, Date.now());
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.metaProgress);
    if (!raw) return ensureMetaProgress(DEFAULT_META_PROGRESS, sagaProgress, Date.now());
    return hydrateMetaProgress(JSON.parse(raw), sagaProgress, Date.now());
  } catch {
    return ensureMetaProgress(DEFAULT_META_PROGRESS, sagaProgress, Date.now());
  }
}

function applyLifeRefill(economy: EconomyState, now: number) {
  if (economy.unlimitedLivesUntil !== null && now < economy.unlimitedLivesUntil) {
    return { ...economy, lives: ECONOMY.maxLives, nextLifeAt: null };
  }
  if (economy.unlimitedLivesUntil !== null && now >= economy.unlimitedLivesUntil) {
    economy = { ...economy, unlimitedLivesUntil: null };
  }

  if (economy.lives >= ECONOMY.maxLives) {
    if (economy.nextLifeAt !== null) return { ...economy, nextLifeAt: null };
    return economy;
  }

  let lives = economy.lives;
  let nextLifeAt = economy.nextLifeAt ?? now + ECONOMY.lifeRefillMs;
  while (lives < ECONOMY.maxLives && now >= nextLifeAt) {
    lives += 1;
    nextLifeAt += ECONOMY.lifeRefillMs;
  }

  if (lives >= ECONOMY.maxLives) {
    return { ...economy, lives: ECONOMY.maxLives, nextLifeAt: null };
  }

  return { ...economy, lives, nextLifeAt };
}

function toCountdownLabel(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function computeStars(score: number, level: LevelDefinition) {
  if (score >= level.starThresholds[2]) return 3;
  if (score >= level.starThresholds[1]) return 2;
  if (score >= level.starThresholds[0]) return 1;
  return 0;
}

function objectivesComplete(progress: Record<BlockColor, number>, boxesDestroyed: number, level: LevelDefinition) {
  // Bonus levels never win via objectives â€” they win via timer expiry only
  if (level.mode === "bonus") return false;
  const colorTargets = Object.entries(level.targets.colors) as Array<[BlockColor, number]>;
  const colorsDone = colorTargets.every(([color, amount]) => progress[color] >= amount);
  const boxesDone = boxesDestroyed >= level.targets.boxes;
  return colorsDone && boxesDone;
}

const EMPTY_REWARD_BUNDLE: RewardBundle = {
  coins: 0,
  lives: 0,
  hammer: 0,
  glove: 0,
  shuffle: 0,
  unlimitedLivesMinutes: 0,
};

function hasRewardBundle(reward: RewardBundle | null | undefined) {
  if (!reward) return false;
  return reward.coins > 0 || reward.lives > 0 || reward.hammer > 0 || reward.glove > 0 || reward.shuffle > 0 || reward.unlimitedLivesMinutes > 0;
}

function totalObjectiveDeficit(progress: Record<BlockColor, number>, boxesDestroyed: number, level: LevelDefinition) {
  const colorDeficit = (Object.entries(level.targets.colors) as Array<[BlockColor, number]>).reduce((sum, [color, target]) => sum + Math.max(0, target - progress[color]), 0);
  const boxDeficit = Math.max(0, level.targets.boxes - boxesDestroyed);
  return colorDeficit + boxDeficit;
}

function isNearWin(progress: Record<BlockColor, number>, boxesDestroyed: number, level: LevelDefinition) {
  if (level.mode === "bonus") return false;
  return totalObjectiveDeficit(progress, boxesDestroyed, level) <= 3;
}

function findHintTarget(blocks: BlockTile[]) {
  const grid = buildGrid(blocks);
  const visited = new Set<string>();
  let bestGroup: RegularTile[] = [];

  for (const tile of blocks) {
    if (tile.kind !== "regular" || visited.has(tile.id)) continue;
    const group = findConnectedColorGroup(tile, grid);
    group.forEach((member) => visited.add(member.id));
    if (group.length >= 2 && group.length > bestGroup.length) {
      bestGroup = group;
    }
  }

  return bestGroup.length > 0 ? bestGroup[Math.floor(bestGroup.length / 2)] : null;
}

/** Returns emoji glyph ONLY for reward tiles. Boosters/boxes use custom SVG. */
function blockGlyph(tile: BlockTile): string | null {
  if (tile.kind === "reward") {
    if (tile.reward === "coin") return "ðŸª™";
    if (tile.reward === "life") return "â¤ï¸";
    if (tile.reward === "rocket_reward") return "ðŸš€";
    if (tile.reward === "hammer_reward") return "ðŸ”¨";
  }
  return null;
}

/** Whether this tile uses the custom SVG renderer instead of a flat background */
function usesSVG(tile: BlockTile): boolean {
  return tile.kind === "booster" || tile.kind === "box" || tile.kind === "honey" || tile.kind === "ice" || tile.kind === "safe" || tile.kind === "cloud";
}

function blockBackground(tile: BlockTile) {
  if (tile.kind === "regular") {
    if (tile.color === "red") return "linear-gradient(180deg, #ff8aa1 0%, #ff5c75 32%, #ff4343 68%, #d71f47 100%)";
    if (tile.color === "blue") return "linear-gradient(180deg, #aef3ff 0%, #70dbff 28%, #2d9cff 66%, #1763d4 100%)";
    if (tile.color === "green") return "linear-gradient(180deg, #b9ffc8 0%, #70ef8a 30%, #47d35b 66%, #1f9e46 100%)";
    if (tile.color === "yellow") return "linear-gradient(180deg, #fff7b3 0%, #ffe46c 28%, #ffd32d 66%, #f39b17 100%)";
    if (tile.color === "purple") return "linear-gradient(180deg, #efc3ff 0%, #cf88ff 28%, #9d50ff 66%, #6d28d9 100%)";
    return TOON_COLORS[tile.color];
  }
  // Boosters/boxes render via SVG â€” transparent background so SVG shows cleanly
  if (tile.kind === "box" || tile.kind === "honey" || tile.kind === "ice" || tile.kind === "safe" || tile.kind === "cloud") return "transparent";
  if (tile.kind === "booster") return "transparent";
  if (tile.kind === "reward") {
    if (tile.reward === "coin") return "linear-gradient(180deg, #FFE066 0%, #FFB800 100%)";
    if (tile.reward === "life") return "linear-gradient(180deg, #FF7B7B 0%, #FF2020 100%)";
    if (tile.reward === "rocket_reward") return "linear-gradient(180deg, #6ec7ff 0%, #2d9cff 100%)";
    if (tile.reward === "hammer_reward") return "linear-gradient(180deg, #c084fc 0%, #7c3aed 100%)";
  }
  return "linear-gradient(180deg, #ffe87b 0%, #ffbf38 100%)";
}

function weightedColorPool(colors: Record<BlockColor, number>) {
  const pool: BlockColor[] = [];
  for (const color of Object.keys(colors) as BlockColor[]) {
    for (let i = 0; i < Math.max(0, colors[color]); i++) pool.push(color);
  }
  return pool;
}

export default function App() {
  const nextId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const objectiveRefs = useRef<Partial<Record<BlockColor, HTMLDivElement | null>>>({});
  const resolvingRef = useRef(false);
  const settleTimeoutRef = useRef<number | null>(null);
  const invalidTapTimeoutRef = useRef<number | null>(null);
  const objectiveTimeoutsRef = useRef<number[]>([]);
  const hintTimeoutRef = useRef<number | null>(null);
  const hintHideTimeoutRef = useRef<number | null>(null);
  const popCascadeResetRef = useRef<number | null>(null);
  const popCascadeDepthRef = useRef(0);
  const nearWinTriggeredRef = useRef(false);
  const particleCursorRef = useRef(0);
  const targetFlyCursorRef = useRef(0);
  const splinterCursorRef = useRef(0);

  const [splashDone, setSplashDone] = useState(false);
  const [screen, setScreen] = useState<AppScreen>("map");
  const [sagaProgress, setSagaProgress] = useState<SagaProgress>(() => readSagaProgress());
  const [recentlyUnlockedLevel, setRecentlyUnlockedLevel] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState(() => readSagaProgress().selectedLevel);
  const [, setShowLevelInfo] = useState(false);
  const [showOutOfLives, setShowOutOfLives] = useState(false);
  const [activeLevelId, setActiveLevelId] = useState(() => readSagaProgress().selectedLevel);
  const [economy, setEconomy] = useState<EconomyState>(() => applyLifeRefill(readEconomyState(), Date.now()));
  const [settings, setSettings] = useState<SettingsState>(() => readSettingsState());
  const [metaProgress, setMetaProgress] = useState<MetaProgress>(() => readMetaProgress(readSagaProgress()));
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [coinReward, setCoinReward] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ title: string; reward: RewardBundle } | null>(null);
  const [activeTreasureChest, setActiveTreasureChest] = useState<ChestReward | null>(null);
  const [showTreasurePopup, setShowTreasurePopup] = useState(false);
  const [showDailyWheel, setShowDailyWheel] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
  }));

  // â”€â”€ Bonus Level State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [bonusTimeLeft, setBonusTimeLeft] = useState(BONUS_LEVEL_CONFIG.timeLimit);
  const bonusTimerRef = useRef<number | null>(null);
  const bonusDeadlineRef = useRef<number | null>(null);
  const bonusEndHandledRef = useRef(false);
  const [bonusLoot, setBonusLoot] = useState<BonusLoot>({ coins: 0, lives: 0, rockets: 0, hammers: 0 });
  const [showBonusLootPopup, setShowBonusLootPopup] = useState(false);

  // â”€â”€ Mascot State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const mascotTimeoutRef = useRef<number | null>(null);

  const { playSfx } = useAudioManager({ isMusicMuted: settings.isMusicMuted, isSfxMuted: settings.isSfxMuted });

  const activeLevel = getLevelForId(activeLevelId);
  const selectedLevel = useMemo(() => getLevelForId(selectedLevelId), [selectedLevelId]);
  const selectedEpisodeTheme = useMemo(() => getEpisodeThemeForLevel(selectedLevelId), [selectedLevelId]);
  const isLevelCompleted = (levelId: number) => {
    const level = getLevelForId(levelId);
    if (level.mode === "bonus") {
      return sagaProgress.bonusClaimedLevels.includes(level.id);
    }
    // Check if normal level has stars (completed)
    return (sagaProgress.starsByLevel[levelId] ?? 0) > 0;
  };

  const [blocks, setBlocks] = useState<BlockTile[]>(() => createInitialTiles(nextId, activeLevel));
  const [hoverIds, setHoverIds] = useState<Set<string>>(new Set());
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [movesLeft, setMovesLeft] = useState(activeLevel.moves);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState<Record<BlockColor, number>>(createEmptyProgress);
  const [boxesDestroyed, setBoxesDestroyed] = useState(0);
  const [stars, setStars] = useState(0);
  const shakeControls = useAnimationControls();
  const cameraControls = useAnimationControls();
  const [impactFlash, setImpactFlash] = useState<ImpactFlashFx | null>(null);
  const [particles, setParticles] = useState<ParticleFx[]>(() => createParticlePool(FX_POOL_LIMITS.particles));
  const [targetFlies, setTargetFlies] = useState<TargetFlyFx[]>(() => createTargetFlyPool(FX_POOL_LIMITS.targetFlies));
  const [objectivePulse, setObjectivePulse] = useState<Record<BlockColor, number>>(createEmptyProgress);
  const [splinters, setSplinters] = useState<SplinterFx[]>(() => createSplinterPool(FX_POOL_LIMITS.splinters));
  const [rocketBombFx, setRocketBombFx] = useState<{ x: number; y: number } | null>(null);
  const [comboSweep, setComboSweep] = useState<{ rows: number[]; cols: number[] } | null>(null);
  const [comboAnticipation, setComboAnticipation] = useState<{ c1: number; r1: number; c2: number; r2: number; type: string } | null>(null);
  const [targetingMode, setTargetingMode] = useState<TargetingMode | null>(null);
  const [shufflePulse, setShufflePulse] = useState(0);
  const [boosterUseFx, setBoosterUseFx] = useState<BoosterUseFx | null>(null);
  const [invalidTapFx, setInvalidTapFx] = useState<{ id: string; nonce: number } | null>(null);
  const [activeRocketVFX, setActiveRocketVFX] = useState<RocketVFXState | null>(null);
  const [activeDiscoVFX, setActiveDiscoVFX] = useState<DiscoVFXState | null>(null);
  const [shockedCells, setShockedCells] = useState<Set<string>>(new Set());

  // â”€â”€ Fever Mode State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [fever, setFever] = useState<FeverState>(DEFAULT_FEVER);
  const feverTimerRef = useRef<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hintPulseTarget, setHintPulseTarget] = useState<{ id: string; col: number; row: number } | null>(null);
  const [interactionNonce, setInteractionNonce] = useState(0);

  // Holds the turn snapshot so the RocketVFX onComplete callback can finalize
  const pendingTurnRef = useRef<{
    nextProgress: Record<BlockColor, number>;
    nextBoxesDestroyed: number;
    nextMoves: number;
    nextScore: number;
  } | null>(null);

  // â”€â”€ Rescue guard ref â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Set to true BEFORE any state update in rescue handlers.
  // The win/loss evaluation inside finalizeTurn reads this ref FIRST (synchronous)
  // so React's async state batching can never race and re-trigger level failure
  // while the +5 moves haven't committed yet.
  const isRescuingRef = useRef(false);

  // â”€â”€ Escalating rescue cost â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Tracks how many rescues (coin OR ad) the player has used this level.
  // Resets every time a new level starts via resetLevelRuntime.
  const [rescueCount, setRescueCount] = useState(0);

  const resetCinematicLayer = () => {
    shakeControls.stop();
    cameraControls.stop();
    shakeControls.set({ x: 0, y: 0, rotate: 0, scale: 1 });
    cameraControls.set({ scale: 1, y: 0, filter: "brightness(1) saturate(1)" });
    setImpactFlash(null);
  };

  /** Returns the coin cost for the NEXT rescue based on how many have been used. */
  const getRescueCost = (count: number): number => {
    if (count === 0) return 100;
    if (count === 1) return 150;
    if (count === 2) return 300;
    return 600; // cap at 600 for 4th rescue and beyond
  };

  const currentRescueCost = getRescueCost(rescueCount);

  useEffect(() => {
    if (!impactFlash) return;
    const timeoutId = window.setTimeout(() => {
      setImpactFlash((prev) => (prev?.id === impactFlash.id ? null : prev));
    }, 220);
    return () => window.clearTimeout(timeoutId);
  }, [impactFlash]);

  const grid = useMemo(() => buildGrid(blocks), [blocks]);
  const blockById = useMemo(() => new Map(blocks.map((b) => [b.id, b])), [blocks]);
  // All regular block IDs that belong to a group of 2+ â€” used for match-ready pulse
  const matchableIds = useMatchableIds(blocks);
  // Which single block is currently hovered (for fear reaction)
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const canInteract =
    screen === "game" &&
    phase === "playing" &&
    !showPauseMenu &&
    !showSettings &&
    !showBonusLootPopup &&
    !showTreasurePopup &&
    !showDailyWheel &&
    activeDiscoVFX === null &&
    activeRocketVFX === null;
  const isTargeting = targetingMode !== null;
  const boardWidth = COLUMNS * CELL_SIZE + (COLUMNS - 1) * GRID_GAP;
  const boardHeight = ROWS * CELL_SIZE + (ROWS - 1) * GRID_GAP;
  const APP_FRAME_MAX_WIDTH = 430;
  const gamePanelBaseWidth = Math.max(boardWidth + 16, 360);
  const gamePanelBaseHeight = 724;
  const layoutMode = deriveResponsiveLayoutMode(viewport.width, viewport.height);
  const availableGameWidth = Math.max(
    280,
    Math.min(APP_FRAME_MAX_WIDTH, viewport.width) - (layoutMode === "ultraNarrow" ? 8 : layoutMode === "narrow" ? 12 : 18),
  );
  const availableGameHeight = Math.max(
    layoutMode === "ultraNarrow" ? 520 : 560,
    viewport.height - (layoutMode === "ultraNarrow" ? 12 : 22),
  );
  const gameUIScale = Math.max(
    layoutMode === "ultraNarrow" ? 0.76 : layoutMode === "narrow" ? 0.82 : 0.88,
    Math.min(1.12, availableGameWidth / gamePanelBaseWidth, availableGameHeight / gamePanelBaseHeight),
  );
  const levelHighScore = sagaProgress.bestScoreByLevel[activeLevel.id] ?? 0;
  // canAffordRescue uses the DYNAMIC current cost (escalates each rescue)
  const canAffordRescue = economy.coins >= currentRescueCost;
  const canAffordLivesRefill = economy.coins >= ECONOMY.livesRefillCostCoins;
  const hasUnlimitedLives = economy.unlimitedLivesUntil !== null && clockNow < economy.unlimitedLivesUntil;
  const refillLabel =
    hasUnlimitedLives
      ? `${toCountdownLabel(economy.unlimitedLivesUntil! - clockNow)} free`
      : economy.lives >= ECONOMY.maxLives || economy.nextLifeAt === null
      ? "Full"
      : `Next in ${toCountdownLabel(economy.nextLifeAt - clockNow)}`;
  const missionCards = useMemo(() => buildMissionCards(metaProgress, sagaProgress), [metaProgress, sagaProgress]);
  const canUseDailyWheel = useMemo(() => canSpinDailyWheel(metaProgress, clockNow), [metaProgress, clockNow]);
  const nextPendingChest = metaProgress.pendingChests[0] ?? null;
  const hintTarget = useMemo(() => findHintTarget(blocks), [blocks]);
  const nearWin = useMemo(() => isNearWin(progress, boxesDestroyed, activeLevel), [progress, boxesDestroyed, activeLevel]);
  const activeParticles = useMemo(() => particles.filter((particle) => particle.active), [particles]);
  const activeTargetFlies = useMemo(() => targetFlies.filter((entry) => entry.active), [targetFlies]);
  const activeSplinters = useMemo(() => splinters.filter((entry) => entry.active), [splinters]);
  const mapSurfaceStyle = {
    background: "linear-gradient(180deg, rgba(7,24,22,0.34) 0%, rgba(7,24,22,0.18) 100%)",
    boxShadow: "0 24px 48px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.16)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };
  const pregameSurfaceStyle = {
    background: "transparent",
    boxShadow: "none",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
  };
  const gameSurfaceStyle = {
    background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%)",
    boxShadow: "0 24px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.16)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };

  useEffect(() => {
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    if (hintHideTimeoutRef.current !== null) {
      window.clearTimeout(hintHideTimeoutRef.current);
      hintHideTimeoutRef.current = null;
    }

    if (!canInteract || !hintTarget || screen !== "game") {
      setHintPulseTarget(null);
      return;
    }

    hintTimeoutRef.current = window.setTimeout(() => {
      setHintPulseTarget({ id: hintTarget.id, col: hintTarget.col, row: hintTarget.row });
      triggerMascot("pointing", 1900);
      hintHideTimeoutRef.current = window.setTimeout(() => {
        setHintPulseTarget(null);
        hintHideTimeoutRef.current = null;
      }, 1900);
    }, 5000);

    return () => {
      if (hintTimeoutRef.current !== null) {
        window.clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }
      if (hintHideTimeoutRef.current !== null) {
        window.clearTimeout(hintHideTimeoutRef.current);
        hintHideTimeoutRef.current = null;
      }
    };
  }, [interactionNonce, canInteract, hintTarget, screen]);

  useEffect(() => {
    if (screen !== "game" || phase !== "playing" || activeLevel.mode === "bonus") {
      nearWinTriggeredRef.current = false;
      return;
    }
    if (nearWin && !nearWinTriggeredRef.current) {
      nearWinTriggeredRef.current = true;
      triggerMascot("excited", 2200);
      return;
    }
    if (!nearWin) {
      nearWinTriggeredRef.current = false;
    }
  }, [screen, phase, activeLevel.mode, nearWin]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.sagaProgress, JSON.stringify(sagaProgress));
  }, [sagaProgress]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.economy, JSON.stringify(economy));
  }, [economy]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    setMetaProgress((prev) => ensureMetaProgress(prev, sagaProgress, clockNow));
  }, [clockNow, sagaProgress]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.metaProgress, JSON.stringify(metaProgress));
  }, [metaProgress]);

  useEffect(() => {
    if (!rewardToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRewardToast(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [rewardToast]);

  // â”€â”€ BGM mute sync (mute direction only â€” un-mute is handled by playMusic) â”€â”€
  useEffect(() => {
    if (settings.isMusicMuted) {
      BGMManager.setMuted(true);
    }
    // Un-mute is handled by the screen-transition effect below and handleToggleMusic
  }, [settings.isMusicMuted]);

  // â”€â”€ BGM screen transitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Ensures the correct track is playing for each screen after splash
  useEffect(() => {
    if (!splashDone) return;
    if (settings.isMusicMuted) return;
    // Use the correct track for whichever screen we are on
    const track: BGMTrack = screen === "game" ? "game" : "main";
    BGMManager.playMusic(track);
  }, [splashDone, screen, settings.isMusicMuted]);

  // Ensure music can start even if user did not tap during splash.
  // First interaction anywhere in the app unlocks audio and starts the right track.
  useEffect(() => {
    if (!splashDone) return;

    const unlockOnFirstInteraction = async () => {
      await BGMManager.unlock();
      if (!settings.isMusicMuted) {
        const track: BGMTrack = screen === "game" ? "game" : "main";
        BGMManager.playMusic(track);
      }
    };

    window.addEventListener("pointerdown", unlockOnFirstInteraction, { once: true });
    window.addEventListener("touchstart", unlockOnFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockOnFirstInteraction);
      window.removeEventListener("touchstart", unlockOnFirstInteraction);
    };
  }, [splashDone, screen, settings.isMusicMuted]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      const now = Date.now();
      setClockNow(now);
      setEconomy((prev) => applyLifeRefill(prev, now));
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const cleanupInterval = window.setInterval(() => {
      const now = Date.now();

      setParticles((prev) => {
        const next = prev.slice();
        return releaseExpiredPoolEntries(next, now) ? next : prev;
      });
      setTargetFlies((prev) => {
        const next = prev.slice();
        return releaseExpiredPoolEntries(next, now) ? next : prev;
      });
      setSplinters((prev) => {
        const next = prev.slice();
        return releaseExpiredPoolEntries(next, now) ? next : prev;
      });
    }, FX_LIFETIME_MS.cleanup);

    return () => window.clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      const vv = window.visualViewport;
      setViewport({
        width: vv?.width ?? window.innerWidth,
        height: vv?.height ?? window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
      }
      if (invalidTapTimeoutRef.current !== null) {
        window.clearTimeout(invalidTapTimeoutRef.current);
      }
      if (feverTimerRef.current !== null) {
        window.clearTimeout(feverTimerRef.current);
      }
      objectiveTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    if (screen !== "game" || phase !== "playing") {
      setTargetingMode(null);
    }
  }, [phase, screen]);

  // Auto-close level info popup when transitioning into game screen
  useEffect(() => {
    if (screen === "game") {
      setShowLevelInfo(false);
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") {
      setShowPauseMenu(false);
    }
  }, [screen]);

  const completeBonusLevel = () => {
    if (bonusEndHandledRef.current) return;
    bonusEndHandledRef.current = true;

    if (bonusTimerRef.current !== null) {
      window.clearInterval(bonusTimerRef.current);
      bonusTimerRef.current = null;
    }
    bonusDeadlineRef.current = null;
    bonusEndHandledRef.current = false;

    // Immediate hard stop and return to map for fast bonus cadence.
    resolvingRef.current = false;
    setPhase("playing");
    setShowPauseMenu(false);
    setShowSettings(false);
    setTargetingMode(null);
    setShowBonusLootPopup(false);
    setShowTreasurePopup(false);
    setShowDailyWheel(false);
    setActiveTreasureChest(null);
    setBonusTimeLeft(0);

    const nextLevel = activeLevel.id + 1;
    setSelectedLevelId(nextLevel);

    setSagaProgress((prev) => {
      const nextUnlocked = Math.max(prev.unlockedLevel, nextLevel);
      if (nextUnlocked > prev.unlockedLevel) setRecentlyUnlockedLevel(nextUnlocked);

      const claimedSet = new Set(prev.bonusClaimedLevels);
      claimedSet.add(activeLevel.id);

      return {
        ...prev,
        unlockedLevel: nextUnlocked,
        selectedLevel: nextLevel,
        bonusClaimedLevels: Array.from(claimedSet).sort((a, b) => a - b),
        };
      });

    setMetaProgress((prev) => registerLevelWin(ensureMetaProgress(prev, sagaProgress, Date.now())));

    setScreen("map");
    BGMManager.setFeverMode(false);
    BGMManager.playMusic("main");
  };

  // â”€â”€ Bonus level countdown timer (absolute, never paused) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (screen !== "game" || activeLevel.mode !== "bonus") {
      if (bonusTimerRef.current !== null) {
        window.clearInterval(bonusTimerRef.current);
        bonusTimerRef.current = null;
      }
      return;
    }

    if (!bonusDeadlineRef.current) {
      bonusDeadlineRef.current = Date.now() + (activeLevel.timeLimit ?? BONUS_LEVEL_CONFIG.timeLimit) * 1000;
      bonusEndHandledRef.current = false;
    }

    if (bonusTimerRef.current !== null) {
      window.clearInterval(bonusTimerRef.current);
      bonusTimerRef.current = null;
    }

    const tick = () => {
      const deadline = bonusDeadlineRef.current;
      if (!deadline) return;

      const remainingMs = Math.max(0, deadline - Date.now());
      setBonusTimeLeft(Math.ceil(remainingMs / 1000));

      if (remainingMs <= 0) {
        completeBonusLevel();
      } else if (remainingMs <= 10000) {
        setMascotState("worried");
      }
    };

    tick();
    bonusTimerRef.current = window.setInterval(tick, 100);

    return () => {
      if (bonusTimerRef.current !== null) {
        window.clearInterval(bonusTimerRef.current);
        bonusTimerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, activeLevel.mode, activeLevel.id]);

  // â”€â”€ Mascot helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const triggerMascot = (state: MascotState, durationMs = 1800) => {
    if (mascotTimeoutRef.current !== null) window.clearTimeout(mascotTimeoutRef.current);
    setMascotState(state);
    mascotTimeoutRef.current = window.setTimeout(() => {
      setMascotState("idle");
      mascotTimeoutRef.current = null;
    }, durationMs);
  };

  // â”€â”€ Reward tile collection (bonus level) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const applyRewardCollection = (collectedRewards: RewardTile[]) => {
    if (!collectedRewards || collectedRewards.length === 0) return;
    const lootDelta: BonusLoot = { coins: 0, lives: 0, rockets: 0, hammers: 0 };
    for (const reward of collectedRewards) {
      if (reward.reward === "coin") lootDelta.coins += reward.value;
      else if (reward.reward === "life") lootDelta.lives += reward.value;
      else if (reward.reward === "rocket_reward") lootDelta.rockets += reward.value;
      else if (reward.reward === "hammer_reward") lootDelta.hammers += reward.value;
    }
    setBonusLoot((prev) => ({
      coins: prev.coins + lootDelta.coins,
      lives: prev.lives + lootDelta.lives,
      rockets: prev.rockets + lootDelta.rockets,
      hammers: prev.hammers + lootDelta.hammers,
    }));

    // Reward collection is instant in treasure mode.
    setEconomy((prev) => ({
      ...prev,
      coins: prev.coins + lootDelta.coins,
      lives: Math.min(ECONOMY.maxLives, prev.lives + lootDelta.lives),
      inventory: {
        hammer: prev.inventory.hammer + lootDelta.hammers,
        // Rocket rewards feed glove inventory to support the in-game booster bar.
        glove: prev.inventory.glove + lootDelta.rockets,
        shuffle: prev.inventory.shuffle,
      },
    }));
  };

  const resetLevelRuntime = (level: LevelDefinition) => {
    if (settleTimeoutRef.current !== null) {
      window.clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    if (hintHideTimeoutRef.current !== null) {
      window.clearTimeout(hintHideTimeoutRef.current);
      hintHideTimeoutRef.current = null;
    }
    if (bonusTimerRef.current !== null) {
      window.clearInterval(bonusTimerRef.current);
      bonusTimerRef.current = null;
    }
    objectiveTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    objectiveTimeoutsRef.current = [];
    resetCascadePop();
    nearWinTriggeredRef.current = false;

    // Set engine bonus mode before creating tiles
    setGameMode(level.mode, level.rewardSpawnRate ?? BONUS_LEVEL_CONFIG.rewardSpawnRate);

    setBlocks(createInitialTiles(nextId, level));
    setHoverIds(new Set());
    setFloatingTexts([]);
    setParticles((prev) => {
      const next = prev.slice();
      return deactivateAllPoolEntries(next) ? next : prev;
    });
    setTargetFlies((prev) => {
      const next = prev.slice();
      return deactivateAllPoolEntries(next) ? next : prev;
    });
    setObjectivePulse(createEmptyProgress());
    setSplinters((prev) => {
      const next = prev.slice();
      return deactivateAllPoolEntries(next) ? next : prev;
    });
    particleCursorRef.current = 0;
    targetFlyCursorRef.current = 0;
    splinterCursorRef.current = 0;
    setRocketBombFx(null);
    setComboSweep(null);
    setHintPulseTarget(null);
    setTargetingMode(null);
    setShufflePulse(0);
    setBoosterUseFx(null);
    setInvalidTapFx(null);
    setActiveDiscoVFX(null);
    setShockedCells(new Set());
    setPhase("playing");
    setMovesLeft(level.mode === "bonus" ? 0 : level.moves);
    setScore(0);
      setCoinReward(0);
      setStars(0);
      setProgress(createEmptyProgress());
      setBoxesDestroyed(0);
      resetCinematicLayer();
      setBonusLoot({ coins: 0, lives: 0, rockets: 0, hammers: 0 });
    setBonusTimeLeft(level.timeLimit ?? BONUS_LEVEL_CONFIG.timeLimit);
    setShowBonusLootPopup(false);
    setShowTreasurePopup(false);
    setShowDailyWheel(false);
    setActiveTreasureChest(null);
    if (level.mode === "bonus") {
      bonusDeadlineRef.current = Date.now() + (level.timeLimit ?? BONUS_LEVEL_CONFIG.timeLimit) * 1000;
    }
    setMascotState("idle");
    // Reset fever
    if (feverTimerRef.current !== null) {
      window.clearTimeout(feverTimerRef.current);
      feverTimerRef.current = null;
    }
    setFever(DEFAULT_FEVER);
    setShowConfetti(false);
    BGMManager.setFeverMode(false);
    if (invalidTapTimeoutRef.current !== null) {
      window.clearTimeout(invalidTapTimeoutRef.current);
      invalidTapTimeoutRef.current = null;
    }
    resolvingRef.current = false;
    // Reset the rescue escalation counter for this level run
    setRescueCount(0);
  };

  const openPregame = (levelId: number) => {
    const clamped = clampProgressLevel(levelId);
    if (clamped > sagaProgress.unlockedLevel) {
      return;
    }

    setSelectedLevelId(clamped);
    setSagaProgress((prev) => ({ ...prev, selectedLevel: clamped }));
    setShowPauseMenu(false);
    setShowSettings(false);
    setShowOutOfLives(false);
    setShowDailyWheel(false);
    setShowTreasurePopup(false);
    setShowBonusLootPopup(false);
    setTargetingMode(null);
    setScreen("pregame");
  };

  const closePregame = () => {
    setShowOutOfLives(false);
    setShowSettings(false);
    setScreen("map");
  };

  const beginLevel = (levelId: number) => {
    // 1. Hard-reset all overlay and interaction locks synchronously
    setShowLevelInfo(false);
    setShowSettings(false);
    setShowPauseMenu(false);
    setShowOutOfLives(false);
    setActiveDiscoVFX(null);
    setActiveRocketVFX(null);
    setShowBonusLootPopup(false);
    setTargetingMode(null);
    setShockedCells(new Set());
    resolvingRef.current = false;
    isRescuingRef.current = false;
    setHoverIds(new Set());

    // 2. lives check
    if (economy.lives <= 0 && !hasUnlimitedLives) {
      setShowOutOfLives(true);
      return;
    }

    // 3. resolve level definition
    const clamped = clampProgressLevel(levelId);
    const levelDef = getLevelForId(clamped);

    // Only block bonus levels that were already claimed
    if (levelDef.mode === "bonus" && sagaProgress.bonusClaimedLevels.includes(levelDef.id)) {
      return;
    }

    // 4. Perform state cleanup + game transition in the next tick
    requestAnimationFrame(() => {
      resetLevelRuntime(levelDef);
      setScreen("game");
    });

    // â”€â”€ STEP 4: hard-clear EVERY overlay and lock state synchronously â”€â”€â”€â”€â”€â”€â”€â”€â”€
    setShowPauseMenu(false);
    setShowSettings(false);
    setShowLevelInfo(false);
    setShowOutOfLives(false);
    setShowBonusLootPopup(false);
    setShowTreasurePopup(false);
    setShowDailyWheel(false);
    setActiveTreasureChest(null);
    setTargetingMode(null);
    setActiveDiscoVFX(null);
    setActiveRocketVFX(null);
    setShockedCells(new Set());
    setHoverIds(new Set());
    setPhase("playing");

    // â”€â”€ STEP 5: set the active level and reset runtime â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    setActiveLevelId(clamped);
    setSagaProgress((prev) => ({ ...prev, selectedLevel: clamped }));
    resetLevelRuntime(levelDef);

    // â”€â”€ STEP 6: transition to game screen after React flushes state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Using two nested rAFs guarantees all state updates above have committed
    // before the game screen mounts, so canInteract is true from frame 1.
    window.requestAnimationFrame(() => {
      setScreen("game");
      BGMManager.playMusic("game");
    });
  };

  const backToMap = () => {
    if (settleTimeoutRef.current !== null) {
      window.clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
    resetCascadePop();
    resolvingRef.current = false;
    isRescuingRef.current = false;
    setSelectedLevelId(activeLevel.id);
    setSagaProgress((prev) => ({ ...prev, selectedLevel: activeLevel.id }));
    setTargetingMode(null);
    setActiveDiscoVFX(null);
    setActiveRocketVFX(null);
    setShockedCells(new Set());
    setShowPauseMenu(false);
    setShowSettings(false);
    setShowBonusLootPopup(false);
    setShowTreasurePopup(false);
    setShowDailyWheel(false);
    resetCinematicLayer();
    setActiveTreasureChest(null);
    setHintPulseTarget(null);
    setShowLevelInfo(false);
    setScreen("map");
    // â”€â”€ Switch back to main map BGM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    BGMManager.setFeverMode(false);
    BGMManager.playMusic("main");
  };

  const spendCoins = (amount: number): boolean => {
    // Read current coin balance SYNCHRONOUSLY from the economy state value
    // (not from inside the functional updater, which runs asynchronously).
    // This is safe because `economy` is a stable state snapshot for this render.
    if (economy.coins < amount) return false;
    setEconomy((prev) => ({ ...prev, coins: Math.max(0, prev.coins - amount) }));
    return true;
  };

  const grantCoins = (amount: number) => {
    if (amount <= 0) return;
    setEconomy((prev) => ({ ...prev, coins: prev.coins + amount }));
  };

  const applyRewardBundle = (reward: RewardBundle) => {
    if (!hasRewardBundle(reward)) {
      return;
    }

    setEconomy((prev) => {
      const nextLives = Math.min(ECONOMY.maxLives, prev.lives + reward.lives);
      const unlimitedLivesUntil = reward.unlimitedLivesMinutes > 0
        ? Math.max(prev.unlimitedLivesUntil ?? 0, Date.now() + reward.unlimitedLivesMinutes * 60 * 1000)
        : prev.unlimitedLivesUntil;
      return {
        ...prev,
        coins: prev.coins + reward.coins,
        lives: nextLives,
        nextLifeAt: unlimitedLivesUntil !== prev.unlimitedLivesUntil || nextLives >= ECONOMY.maxLives ? null : prev.nextLifeAt ?? Date.now() + ECONOMY.lifeRefillMs,
        unlimitedLivesUntil,
        inventory: {
          hammer: prev.inventory.hammer + reward.hammer,
          glove: prev.inventory.glove + reward.glove,
          shuffle: prev.inventory.shuffle + reward.shuffle,
        },
      };
    });
  };

  const registerInteraction = () => {
    setInteractionNonce((prev) => prev + 1);
    setHintPulseTarget(null);
  };

  const resetCascadePop = () => {
    popCascadeDepthRef.current = 0;
    if (popCascadeResetRef.current !== null) {
      window.clearTimeout(popCascadeResetRef.current);
      popCascadeResetRef.current = null;
    }
  };

  const playCascadePop = () => {
    const detuneCents = Math.min(700, popCascadeDepthRef.current * 100);
    playSfx("pop", { detuneCents });
    popCascadeDepthRef.current += 1;
    if (popCascadeResetRef.current !== null) {
      window.clearTimeout(popCascadeResetRef.current);
    }
    popCascadeResetRef.current = window.setTimeout(() => {
      popCascadeDepthRef.current = 0;
      popCascadeResetRef.current = null;
    }, 650);
  };

  const showRewardToastFor = (title: string, reward: RewardBundle) => {
    setRewardToast({ title, reward });
  };

  const openTreasurePopup = (chest: ChestReward | null) => {
    if (!chest) {
      return;
    }

    setActiveTreasureChest(chest);
    setShowPauseMenu(false);
    setShowSettings(false);
    setShowDailyWheel(false);
    setShowTreasurePopup(true);
  };

  const useInventoryBooster = (booster: InGameBoosterKind): boolean => {
    const count = economy.inventory[booster];
    if (count <= 0) return false;
    setEconomy((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [booster]: Math.max(0, prev.inventory[booster] - 1),
      },
    }));
    return true;
  };

  const openSettings = () => {
    setShowPauseMenu(false);
    setShowDailyWheel(false);
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const handleSelectCharacter = (characterIndex: number) => {
    setMetaProgress((prev) => {
      const ensured = ensureMetaProgress(prev, sagaProgress, clockNow);
      return setSelectedCharacter(ensured, characterIndex);
    });
  };

  const handleOpenDailyWheel = () => {
    setShowPauseMenu(false);
    setShowSettings(false);
    setShowLevelInfo(false);
    setShowDailyWheel(true);
  };

  const handleCloseDailyWheel = () => {
    setShowDailyWheel(false);
  };

  const handleSpinDailyWheel = (): DailyWheelSegment | null => {
    const ensured = ensureMetaProgress(metaProgress, sagaProgress, clockNow);
    const result = spinDailyWheel(ensured, clockNow);

    if (!result.segment) {
      setMetaProgress(result.meta);
      return null;
    }

    setMetaProgress(result.meta);
    applyRewardBundle(result.segment.reward);
    showRewardToastFor("Daily Lucky Spin", result.segment.reward);
    return result.segment;
  };

  const handleClaimMission = (missionId: MissionId) => {
    let claimedReward: RewardBundle | null = null;

    setMetaProgress((prev) => {
      const ensured = ensureMetaProgress(prev, sagaProgress, clockNow);
      const result = claimMission(ensured, sagaProgress, missionId);
      claimedReward = result.reward;
      return result.meta;
    });

    if (claimedReward) {
      applyRewardBundle(claimedReward);
      const title =
        missionId === "daily"
          ? "Daily Mission Complete"
          : missionId === "episode"
            ? "Episode Mission Complete"
            : "Progression Mission Complete";
      showRewardToastFor(title, claimedReward);
    }
  };

  const handleOpenPendingChest = () => {
    openTreasurePopup(nextPendingChest);
  };

  const handleClaimTreasureChest = () => {
    if (!activeTreasureChest) {
      return;
    }

    let claimedChest: ChestReward | null = null;

    setMetaProgress((prev) => {
      const ensured = ensureMetaProgress(prev, sagaProgress, clockNow);
      const result = openTreasureChest(ensured, activeTreasureChest.id);
      claimedChest = result.chest;
      return result.meta;
    });

    if (claimedChest) {
      applyRewardBundle(claimedChest);
    }
  };

  const closeTreasurePopup = () => {
    setShowTreasurePopup(false);
    setActiveTreasureChest(null);
  };

  const resetProgress = () => {
    const approved = window.confirm("Reset all progress, stars, coins, and lives? This cannot be undone.");
    if (!approved) return;

    const now = Date.now();
    const freshProgress = { ...DEFAULT_PROGRESS };
    const freshEconomy = applyLifeRefill({ ...DEFAULT_ECONOMY }, now);

    setSagaProgress(freshProgress);
    setEconomy(freshEconomy);
    setMetaProgress(ensureMetaProgress(createDefaultMetaProgress(now), freshProgress, now));
    setSelectedLevelId(1);
    setActiveLevelId(1);
    setRecentlyUnlockedLevel(null);
    setShowLevelInfo(false);
    setShowOutOfLives(false);
    setShowPauseMenu(false);
    setRewardToast(null);
    setActiveTreasureChest(null);
    setShowTreasurePopup(false);
    setShowDailyWheel(false);
    setScreen("map");
  };

  const consumeLifeOnLoss = () => {
    setEconomy((prev) => {
      if (prev.unlimitedLivesUntil !== null && Date.now() < prev.unlimitedLivesUntil) {
        return { ...prev, lives: ECONOMY.maxLives, nextLifeAt: null };
      }
      if (prev.lives <= 0) {
        return applyLifeRefill(prev, Date.now());
      }
      const nextLives = prev.lives - 1;
      return {
        ...prev,
        lives: nextLives,
        nextLifeAt: nextLives < ECONOMY.maxLives ? prev.nextLifeAt ?? Date.now() + ECONOMY.lifeRefillMs : null,
      };
    });
  };

  const triggerFloatingText = (x: number, y: number, blastSize: number) => {
    const index = Math.min(BIG_BLAST_LABELS.length - 1, Math.floor((blastSize - 5) / 2));
    const id = `fx_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    setFloatingTexts((prev) => [...prev, { id, x, y, label: BIG_BLAST_LABELS[Math.max(0, index)] }]);
    window.setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 700);
  };

  const triggerShake = (mode: CinematicShakeMode) => {
    const preset = SHAKE_PRESETS[mode];
    shakeControls.stop();
    shakeControls.set({ x: 0, y: 0, rotate: 0, scale: 1 });
    void shakeControls.start({
      x: preset.x,
      y: preset.y,
      rotate: preset.rotate,
      scale: preset.scale,
      transition: {
        duration: preset.duration,
        ease: CINEMATIC_EASE,
        times: preset.x.map((_, index) => index / (preset.x.length - 1)),
      },
    });
  };

  const triggerCameraPulse = (presetKey: CameraPulsePreset) => {
    const preset = CAMERA_PRESETS[presetKey];
    cameraControls.stop();
    cameraControls.set({ scale: 1, y: 0, filter: "brightness(1) saturate(1)" });
    void cameraControls.start({
      scale: preset.scale,
      y: preset.y,
      filter: preset.filter,
      transition: {
        duration: preset.duration,
        ease: CINEMATIC_EASE,
        times: preset.scale.map((_, index) => index / (preset.scale.length - 1)),
      },
    });
  };

  const triggerFlash = (x: number, y: number, mode: CinematicShakeMode) => {
    const intensity = mode === "grand_slam" ? 0.98 : mode === "mega" ? 0.9 : mode === "heavy" ? 0.82 : 0.68;
    const radius = mode === "grand_slam" ? 360 : mode === "mega" ? 300 : mode === "heavy" ? 244 : 180;
    setImpactFlash({
      id: `flash_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
      x,
      y,
      intensity,
      radius,
    });
  };

  // â”€â”€ Fever Mode Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const endFever = () => {
    if (feverTimerRef.current !== null) {
      window.clearTimeout(feverTimerRef.current);
      feverTimerRef.current = null;
    }
    setFever(DEFAULT_FEVER);
    setMascotState("idle");
    BGMManager.setFeverMode(false);
  };

  const activateFever = (newStreak: number) => {
    // Clear existing fever timer
    if (feverTimerRef.current !== null) {
      window.clearTimeout(feverTimerRef.current);
    }
    const expiresAt = Date.now() + FEVER_DURATION_MS;
    const multiplier = Math.min(3, FEVER_SCORE_MULTIPLIER + (newStreak - FEVER_STREAK_TRIGGER) * 0.1);

    setFever((prev) => ({
      active: true,
      streak: newStreak,
      blocksThisStreak: prev.blocksThisStreak,
      multiplier,
      expiresAt,
    }));

    // Mascot goes into fever dance
    setMascotState("fever");

    // BGM speeds up
    BGMManager.setFeverMode(true);

    // Play power-up SFX
    playSfx("boosterSpawn");
    triggerHaptic("heavy", settings.isHapticsEnabled);

    // Trigger screen shake to announce fever
    triggerShake("heavy");

    // Set auto-expiry timer
    feverTimerRef.current = window.setTimeout(() => {
      endFever();
      feverTimerRef.current = null;
    }, FEVER_DURATION_MS);
  };

  /**
   * Called after each blast resolves. Updates fever streak logic.
   * @param blastSize how many blocks were just destroyed
   * @param isBigBlast whether this counts as a "big" blast (5+ blocks)
   */
  const updateFeverStreak = (blastSize: number, isBigBlast: boolean) => {
    if (!isBigBlast) {
      // Small blast breaks the streak (only if fever not active â€” during fever, keep streak)
      setFever((prev) => {
        if (prev.active) return prev; // during fever, streaks always continue
        return { ...prev, streak: 0, blocksThisStreak: 0 };
      });
      return;
    }

    // Big blast â€” grow streak
    setFever((prev) => {
      const newStreak = prev.active ? prev.streak + 1 : prev.streak + 1;
      const newBlocksThisStreak = prev.blocksThisStreak + blastSize;
      const shouldTrigger =
        !prev.active &&
        (newStreak >= FEVER_STREAK_TRIGGER || blastSize >= FEVER_BLOCKS_TRIGGER);

      if (shouldTrigger) {
        // Trigger fever on next tick so state is consistent
        window.setTimeout(() => activateFever(newStreak), 0);
        return { ...prev, streak: newStreak, blocksThisStreak: newBlocksThisStreak, active: true };
      }

      // Extend fever if already active
      if (prev.active) {
        const expiresAt = Date.now() + FEVER_DURATION_MS;
        if (feverTimerRef.current !== null) window.clearTimeout(feverTimerRef.current);
        feverTimerRef.current = window.setTimeout(() => {
          endFever();
          feverTimerRef.current = null;
        }, FEVER_DURATION_MS);
        return { ...prev, streak: newStreak, blocksThisStreak: newBlocksThisStreak, expiresAt };
      }

      return { ...prev, streak: newStreak, blocksThisStreak: newBlocksThisStreak };
    });
  };

  const triggerInvalidTap = (tileId: string) => {
    setInvalidTapFx({ id: tileId, nonce: Date.now() });
    if (invalidTapTimeoutRef.current !== null) {
      window.clearTimeout(invalidTapTimeoutRef.current);
    }
    invalidTapTimeoutRef.current = window.setTimeout(() => {
      setInvalidTapFx((prev) => (prev?.id === tileId ? null : prev));
      invalidTapTimeoutRef.current = null;
    }, 260);
  };

  const triggerParticles = (
    x: number,
    y: number,
    colors: Record<BlockColor, number>,
    amount: number,
    scaleBoost: number,
    origins: Array<{ col: number; row: number; color: BlockColor }>,
  ) => {
    const now = Date.now();
    const masterBurst = origins.length >= MASTER_BURST_THRESHOLD || amount >= 24;
    const palette = origins.length > 0 ? origins.map((item) => item.color) : weightedColorPool(colors);
    const fallback = Object.keys(TOON_COLORS) as BlockColor[];
    const sampledOrigins = origins.length > 0
      ? sampleEvenly(origins, masterBurst ? Math.min(12, origins.length) : Math.min(18, origins.length))
      : [];
    const burstCount = Math.min(
      FX_POOL_LIMITS.particles,
      Math.max(8, Math.round(masterBurst ? amount * 0.46 : amount)),
    );

    setParticles((prev) => {
      const next = prev.slice();
      releaseExpiredPoolEntries(next, now);

      for (let index = 0; index < burstCount; index += 1) {
        const slotIndex = claimPoolIndex(next, particleCursorRef, now);
        const entry = next[slotIndex];
        const source = sampledOrigins.length > 0 ? sampledOrigins[index % sampledOrigins.length] : null;
        const angle = Math.random() * Math.PI * 2;
        const speed = (masterBurst ? 58 : 36) + Math.random() * (masterBurst ? 86 : 110) * scaleBoost;
        const poolColor = palette.length > 0 ? palette[index % palette.length] : fallback[Math.floor(Math.random() * fallback.length)];
        const gravityBias = masterBurst ? 18 + Math.random() * 24 : 28 + Math.random() * 40;
        const originX = source
          ? source.col * (CELL_SIZE + GRID_GAP) + CELL_SIZE / 2 + (Math.random() - 0.5) * CELL_SIZE * 0.26
          : x + (Math.random() - 0.5) * (masterBurst ? 18 : 8);
        const originY = source
          ? topForRow(source.row) + CELL_SIZE / 2 + (Math.random() - 0.5) * CELL_SIZE * 0.26
          : y + (Math.random() - 0.5) * (masterBurst ? 18 : 8);

        next[slotIndex] = {
          ...entry,
          active: true,
          expiresAt: now + FX_LIFETIME_MS.particles,
          version: entry.version + 1,
          id: `p_${entry.slot}_${entry.version + 1}`,
          x: originX,
          y: originY,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed + gravityBias,
          color: TOON_COLORS[poolColor],
          size: (masterBurst ? 7 : 5) + Math.random() * 5 * scaleBoost,
          rotation: Math.random() * 360 - 180,
          shape: Math.random() > (masterBurst ? 0.82 : 0.65) ? "star" : "square",
          scaleBoost: masterBurst ? scaleBoost * 1.16 : scaleBoost,
        };
      }

      return next;
    });
  };

  const registerObjectiveRef = (color: BlockColor, element: HTMLDivElement | null) => {
    objectiveRefs.current[color] = element;
  };

  const triggerTargetFly = (destroyed: Array<{ col: number; row: number; color: BlockColor }>) => {
    const boardRect = boardRef.current?.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    const scoreRect = scoreRef.current?.getBoundingClientRect();
    if (!boardRect || !containerRect || !scoreRect) return;

    const sampledDestroyed = sampleEvenly(destroyed, Math.min(FX_POOL_LIMITS.targetFlies, destroyed.length));
    if (sampledDestroyed.length === 0) return;

    const now = Date.now();
    setTargetFlies((prev) => {
      const next = prev.slice();
      releaseExpiredPoolEntries(next, now);

      sampledDestroyed.forEach((item, index) => {
        const startX = boardRect.left - containerRect.left + item.col * (CELL_SIZE + GRID_GAP) + CELL_SIZE / 2;
        const startY = boardRect.top - containerRect.top + topForRow(item.row) + CELL_SIZE / 2;
        const endX = scoreRect.left - containerRect.left + scoreRect.width * 0.62;
        const endY = scoreRect.top - containerRect.top + scoreRect.height * 0.52;
        const direction = startX < endX ? 1 : -1;
        const distance = Math.abs(endX - startX);
        const arc = -(24 + Math.random() * 24 + Math.min(18, distance * 0.06));
        const slotIndex = claimPoolIndex(next, targetFlyCursorRef, now);
        const entry = next[slotIndex];

        next[slotIndex] = {
          ...entry,
          active: true,
          expiresAt: now + FX_LIFETIME_MS.targetFlies + index * 24,
          version: entry.version + 1,
          id: `tf_${entry.slot}_${entry.version + 1}`,
          color: item.color,
          startX,
          startY,
          endX,
          endY,
          size: 8 + Math.random() * 5,
          arc,
          spin: direction * (110 + Math.random() * 120),
          delay: index * 0.012,
        };

        const timeoutId = window.setTimeout(() => {
          if (activeLevel.targets.colors[item.color]) {
            setObjectivePulse((prevPulse) => ({ ...prevPulse, [item.color]: prevPulse[item.color] + 1 }));
          }
        }, 340 + index * 16);
        objectiveTimeoutsRef.current.push(timeoutId);
      });

      return next;
    });
  };

  const triggerSplinters = (boxes: Array<{ col: number; row: number }>) => {
    const boardRect = boardRef.current?.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!boardRect || !containerRect || boxes.length === 0) return;

    const sampledBoxes = sampleEvenly(boxes, Math.min(4, boxes.length));
    const shardsPerBox = boxes.length >= 4 ? 3 : 4;
    const now = Date.now();

    setSplinters((prev) => {
      const next = prev.slice();
      releaseExpiredPoolEntries(next, now);

      sampledBoxes.forEach((box, boxIndex) => {
        const x = boardRect.left - containerRect.left + box.col * (CELL_SIZE + GRID_GAP) + CELL_SIZE / 2;
        const y = boardRect.top - containerRect.top + topForRow(box.row) + CELL_SIZE / 2;

        for (let i = 0; i < shardsPerBox; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 24 + Math.random() * 42;
          const slotIndex = claimPoolIndex(next, splinterCursorRef, now);
          const entry = next[slotIndex];

          next[slotIndex] = {
            ...entry,
            active: true,
            expiresAt: now + FX_LIFETIME_MS.splinters,
            version: entry.version + 1,
            id: `s_${entry.slot}_${entry.version + 1}`,
            x,
            y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed + 16,
            rot: Math.random() * 220 - 110,
            color: i % 2 === 0 ? "#E4B275" : "#9F5C2E",
            width: 7 + Math.random() * 5,
            height: 2 + Math.random() * 1.5,
            delay: (boxIndex * shardsPerBox + i) * 0.008,
          };
        }
      });

      return next;
    });
  };

  const finalizeTurn = (nextProgress: Record<BlockColor, number>, nextBoxesDestroyed: number, nextMoves: number, nextScore: number) => {
    // â”€â”€ GUARD 1: Rescue in flight â€” bail immediately (synchronous ref check).
    // isRescuingRef.current is set BEFORE any setState in rescue handlers,
    // so this always wins the race against React's async batching.
    if (isRescuingRef.current) return;

    // â”€â”€ GUARD 2: Only evaluate win/loss when we are actually in a playing state.
    // This prevents stale setTimeout callbacks from triggering loss evaluation
    // after the phase has already changed to "rescue" or "playing" via rescue.
    if (phase !== "playing" && phase !== "resolving") return;

    // Bonus levels never lose on move count â€” they only end when timer expires
    if (activeLevel.mode === "bonus") {
      // Only transition back to playing if we're still in a resolvable state
      setPhase((currentPhase) => (currentPhase === "won" || currentPhase === "lost" ? currentPhase : "playing"));
      return;
    }

    if (objectivesComplete(nextProgress, nextBoxesDestroyed, activeLevel)) {
      playSfx("winTrumpet");
      resetCascadePop();
      triggerHaptic("medium", settings.isHapticsEnabled);
      triggerMascot("victory", 3000);
      // End fever on win, trigger confetti
      if (feverTimerRef.current !== null) {
        window.clearTimeout(feverTimerRef.current);
        feverTimerRef.current = null;
      }
      setFever(DEFAULT_FEVER);
      BGMManager.setFeverMode(false);
      triggerCameraPulse("clear");
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 4000);
      const winCoins = ECONOMY.winBaseCoins + nextMoves * ECONOMY.winUnusedMoveCoinBonus;
      setCoinReward(winCoins);
      grantCoins(winCoins);
      const earnedStars = computeStars(nextScore, activeLevel);
      const treasureChest = createTreasureChest(activeLevel.id, earnedStars, nextScore, Date.now());
      setStars(earnedStars);
      setPhase("won");
      setMetaProgress((prev) => {
        const ensured = ensureMetaProgress(prev, sagaProgress, Date.now());
        return queueTreasureChest(registerLevelWin(ensured), treasureChest);
      });
      openTreasurePopup(treasureChest);

      setSagaProgress((prev) => {
        const previousStars = prev.starsByLevel[activeLevel.id] ?? 0;
        const nextBest = Math.max(prev.bestScoreByLevel[activeLevel.id] ?? 0, nextScore);
        const nextUnlocked = Math.max(prev.unlockedLevel, activeLevel.id + 1);
        if (nextUnlocked > prev.unlockedLevel) {
          setRecentlyUnlockedLevel(nextUnlocked);
        }
        return {
          ...prev,
          unlockedLevel: nextUnlocked,
          starsByLevel: { ...prev.starsByLevel, [activeLevel.id]: Math.max(previousStars, earnedStars) },
          bestScoreByLevel: { ...prev.bestScoreByLevel, [activeLevel.id]: nextBest },
          selectedLevel: activeLevel.id,
        };
      });
      return;
    }

    if (nextMoves <= 0) {
      triggerMascot("worried", 1600);
      setPhase("rescue");
      setSagaProgress((prev) => ({
        ...prev,
        bestScoreByLevel: {
          ...prev.bestScoreByLevel,
          [activeLevel.id]: Math.max(prev.bestScoreByLevel[activeLevel.id] ?? 0, nextScore),
        },
      }));
      return;
    }

    if (nextMoves <= 3) {
      triggerMascot("worried", 1600);
    }

    setPhase("playing");
  };

  const applyResolution = (
    resolution: ReturnType<typeof resolveTap>,
    event: PointerEvent<HTMLButtonElement>,
    options?: { consumeMove?: boolean },
  ) => {
    // Respect both the engine's intent and caller override.
    // In-game tool boosters (hammer/glove) pass consumeMove:false explicitly.
    // Reward tile blasts set didConsumeMove:false in the engine (bonus levels have no move limit).
    const shouldConsumeMove = (options?.consumeMove ?? resolution.didConsumeMove) && activeLevel.mode !== "bonus";

    if (!resolution.didResolveBlast && !resolution.didConsumeMove) {
      resolvingRef.current = false;
      return;
    }

    const nextMoves = shouldConsumeMove ? movesLeft - 1 : movesLeft;
    if (shouldConsumeMove) {
      setMovesLeft(nextMoves);
    }
    setHoverIds(new Set());

    const nextProgress: Record<BlockColor, number> = {
      red: progress.red + resolution.destroyed.colors.red,
      blue: progress.blue + resolution.destroyed.colors.blue,
      green: progress.green + resolution.destroyed.colors.green,
      yellow: progress.yellow + resolution.destroyed.colors.yellow,
      purple: progress.purple + resolution.destroyed.colors.purple,
    };
    setProgress(nextProgress);

    const nextBoxesDestroyed = boxesDestroyed + resolution.destroyed.boxes;
    setBoxesDestroyed(nextBoxesDestroyed);

    // Apply fever multiplier to score
    const feverMult = fever.active ? fever.multiplier : 1;
    const gainedScore = resolution.didResolveBlast
      ? Math.round(resolution.blastSize * resolution.blastSize * 10 * feverMult)
      : 0;
    const nextScore = score + gainedScore;

    // Update fever streak after each blast
    if (resolution.didResolveBlast) {
      const isBigBlast = resolution.blastSize >= 5;
      updateFeverStreak(resolution.blastSize, isBigBlast);
    }
    setScore(nextScore);

    const rect = boardRef.current?.getBoundingClientRect();
    let blastCenter: { x: number; y: number } | null = null;
    // Collect bonus level rewards
    if (resolution.collectedRewards && resolution.collectedRewards.length > 0) {
      applyRewardCollection(resolution.collectedRewards);
    }
    if (hasRewardBundle(resolution.rewardBundle)) {
      applyRewardBundle(resolution.rewardBundle!);
      showRewardToastFor("Golden Safe Opened", resolution.rewardBundle!);
      playSfx("coinCollect");
    }

    if (resolution.didResolveBlast && rect) {
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      blastCenter = { x: localX, y: localY };
      const isMegaCombo = resolution.megaCombo;
      const isRocketBomb = resolution.comboKind === "rocket_bomb";
      const particleScale = isMegaCombo ? 1.5 : 1;
      const particleCount = Math.min(46, Math.max(12, Math.floor(resolution.blastSize * 2.1 * particleScale)));

      triggerParticles(localX, localY, resolution.destroyed.colors, particleCount, particleScale, resolution.destroyedRegulars);
      triggerTargetFly(resolution.destroyedRegulars);
      triggerSplinters(resolution.destroyedBoxes);

      if (resolution.blastSize >= 5) {
        triggerFloatingText(localX, localY, resolution.blastSize);
        triggerMascot(isMegaCombo ? "shocked" : "cheer", isMegaCombo ? 2200 : 1400);
      }
      if (resolution.blastSize >= 7) {
        triggerCameraPulse(isMegaCombo || resolution.impact === "grand_slam" ? "mega" : "combo");
      }

      if (isRocketBomb) {
        setRocketBombFx({ x: localX, y: localY });
        window.setTimeout(() => setRocketBombFx(null), 140);
        if (resolution.comboCenter) {
          const center = resolution.comboCenter;
          const rows = [center.row - 1, center.row, center.row + 1].filter((row) => row >= 0 && row < ROWS);
          const cols = [center.col - 1, center.col, center.col + 1].filter((col) => col >= 0 && col < COLUMNS);
          setComboSweep({ rows, cols });
          window.setTimeout(() => setComboSweep(null), 130);
        }
      }

      if (isMegaCombo) {
        triggerHaptic("heavy", settings.isHapticsEnabled);
        const comboId = `fx_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
        setFloatingTexts((prev) => [...prev, { id: comboId, x: localX, y: localY - 6, label: "MEGA COMBO!", tone: "mega" }]);
        window.setTimeout(() => {
          setFloatingTexts((prev) => prev.filter((item) => item.id !== comboId));
        }, 760);
      }
      if (hasRewardBundle(resolution.rewardBundle)) {
        const safeId = `safe_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
        setFloatingTexts((prev) => [...prev, { id: safeId, x: localX, y: localY - 20, label: "SAFE OPEN!", tone: "normal" }]);
        window.setTimeout(() => {
          setFloatingTexts((prev) => prev.filter((item) => item.id !== safeId));
        }, 720);
      }
    }

    if (resolution.didResolveBlast) {
      if (resolution.impact === "grand_slam") {
        playSfx("comboBlast", { volumeScale: 1.05 });
        triggerHaptic("heavy", settings.isHapticsEnabled);
      } else if (
        resolution.impact === "mega" ||
        resolution.comboKind === "rocket_bomb" ||
        resolution.comboKind === "bomb_bomb" ||
        resolution.comboKind === "disco_rocket" ||
        resolution.comboKind === "disco_bomb"
      ) {
        playSfx("comboBlast");
        triggerHaptic("heavy", settings.isHapticsEnabled);
      } else if (resolution.impact === "heavy") {
        playSfx("bombExplode");
        triggerHaptic("medium", settings.isHapticsEnabled);
      } else {
        playCascadePop();
      }
    }

    if (resolution.didResolveBlast) {
      const shakeMode: CinematicShakeMode | null =
        resolution.impact === "grand_slam"
          ? "grand_slam"
          : resolution.impact === "mega" ||
              resolution.comboKind === "rocket_bomb" ||
              resolution.comboKind === "bomb_bomb" ||
              resolution.comboKind === "disco_rocket" ||
              resolution.comboKind === "disco_bomb"
            ? "mega"
            : resolution.impact === "heavy"
              ? "heavy"
              : resolution.blastSize >= 8
                ? "normal"
                : null;

      if (shakeMode) {
        triggerShake(shakeMode);
        if (blastCenter) {
          triggerFlash(blastCenter.x, blastCenter.y, shakeMode);
        }
      }
    }

    setPhase("resolving");

    // â”€â”€ Disco lightning cinematic VFX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Triggered only for direct disco taps. Board commit is deferred until
    // DiscoVFX reports completion.
    if (resolution.discoCinematic && resolution.comboKind === "none") {
      const dc = resolution.discoCinematic;
      pendingTurnRef.current = { nextProgress, nextBoxesDestroyed, nextMoves, nextScore };
      playSfx("boosterSpawn");
      triggerHaptic("medium", settings.isHapticsEnabled);
      triggerCameraPulse("mega");
      setActiveDiscoVFX({
        id: `dvfx_${Date.now()}`,
        col: dc.origin.col,
        row: dc.origin.row,
        targetColor: dc.targetColor,
        targets: dc.targets,
        pendingTiles: resolution.tiles,
      });
      return;
    }

    // â”€â”€ Rocket cinematic VFX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // If a rocket was the primary trigger, show the dash animation before
    // settling tiles. The VFX fires in the overlay and calls onComplete which
    // then commits the new tile state.
    if (resolution.rocketOrigin && resolution.comboKind === "none") {
      const ro = resolution.rocketOrigin;
      const vfxId = `rvfx_${Date.now()}`;
      // Store turn snapshot for the VFX callback
      pendingTurnRef.current = { nextProgress, nextBoxesDestroyed, nextMoves, nextScore };
      // Screen shake fires at dash moment (after 200ms charge)
      window.setTimeout(() => triggerShake("normal"), 100);
      triggerCameraPulse("combo");
      playSfx("rocketSwoosh");
      triggerHaptic("medium", settings.isHapticsEnabled);
      setActiveRocketVFX({
        id: vfxId,
        col: ro.col,
        row: ro.row,
        axis: ro.axis,
        pendingTiles: resolution.tiles,
      });
      // The RocketVFX component calls onComplete after ~520ms total
      // (200ms charge + 300ms dash). We commit tiles there.
      return;
    }

    const settleDelay = resolution.comboKind === "rocket_bomb" ? 160 : 55;
    settleTimeoutRef.current = window.setTimeout(() => {
      setBlocks(resolution.tiles);
      finalizeTurn(nextProgress, nextBoxesDestroyed, nextMoves, nextScore);
      resolvingRef.current = false;
      settleTimeoutRef.current = null;
    }, settleDelay);
  };

  const handleRocketVFXComplete = () => {
    const vfx = activeRocketVFX;
    const turn = pendingTurnRef.current;
    if (!vfx || !turn) {
      resolvingRef.current = false;
      setActiveRocketVFX(null);
      return;
    }
    // Commit tile state after the rocket animation finishes
    setBlocks(vfx.pendingTiles);
    setActiveRocketVFX(null);
    pendingTurnRef.current = null;
    finalizeTurn(turn.nextProgress, turn.nextBoxesDestroyed, turn.nextMoves, turn.nextScore);
    resolvingRef.current = false;
  };

  const handleDiscoShockStart = () => {
    if (!activeDiscoVFX) return;
    const keys = new Set(activeDiscoVFX.targets.map((cell) => `${cell.col}:${cell.row}`));
    setShockedCells(keys);
  };

  const handleDiscoShockEnd = () => {
    setShockedCells(new Set());
  };

  const handleDiscoImpact = () => {
    const impactX = activeDiscoVFX ? activeDiscoVFX.col * (CELL_SIZE + GRID_GAP) + CELL_SIZE / 2 : boardWidth / 2;
    const impactY = activeDiscoVFX ? topForRow(activeDiscoVFX.row) + CELL_SIZE / 2 : boardHeight / 2;
    playSfx("bombExplode");
    triggerHaptic("heavy", settings.isHapticsEnabled);
    triggerShake("mega");
    triggerCameraPulse("mega");
    triggerFlash(impactX, impactY, "mega");
  };

  const handleDiscoVFXComplete = () => {
    const vfx = activeDiscoVFX;
    const turn = pendingTurnRef.current;
    setShockedCells(new Set());
    if (!vfx || !turn) {
      resolvingRef.current = false;
      setActiveDiscoVFX(null);
      return;
    }

    setBlocks(vfx.pendingTiles);
    setActiveDiscoVFX(null);
    pendingTurnRef.current = null;
    finalizeTurn(turn.nextProgress, turn.nextBoxesDestroyed, turn.nextMoves, turn.nextScore);
    resolvingRef.current = false;
  };

  const handleHover = (id: string) => {
    setHoveredBlockId(id);
    if (!canInteract || isTargeting) {
      setHoverIds(new Set());
      return;
    }
    const origin = blockById.get(id);
    if (!origin || origin.kind !== "regular") {
      setHoverIds(new Set());
      return;
    }
    const group = findConnectedColorGroup(origin as RegularTile, grid);
    setHoverIds(group.length >= 2 ? new Set(group.map((block) => block.id)) : new Set());
  };

  const handleBlockLeave = () => {
    setHoveredBlockId(null);
    setHoverIds(new Set());
  };

  const handleTap = (id: string, event: PointerEvent<HTMLButtonElement>) => {
    if (!canInteract || resolvingRef.current) return;
    registerInteraction();
    triggerHaptic("light", settings.isHapticsEnabled);
    resolvingRef.current = true;

    const tappedTile = blockById.get(id);
    if (!tappedTile) {
      resolvingRef.current = false;
      return;
    }

    if (targetingMode === "hammer") {
      const usedInventory = useInventoryBooster("hammer");
      const paid = usedInventory ? true : spendCoins(ECONOMY.boosterCosts.hammer);
      if (!paid) {
        resolvingRef.current = false;
        return;
      }
      setTargetingMode(null);
      triggerHaptic("medium", settings.isHapticsEnabled);
      const resolution = useHammerBooster(blocks, tappedTile, nextId);
      if (!resolution.didResolveBlast) {
        resolvingRef.current = false;
        return;
      }
      const rect = boardRef.current?.getBoundingClientRect();
      if (rect) {
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        setBoosterUseFx({ kind: "hammer", x: localX, y: localY });
        window.setTimeout(() => setBoosterUseFx(null), 150);
      }
      applyResolution(resolution, event, { consumeMove: false });
      return;
    }

    if (targetingMode === "glove") {
      const usedInventory = useInventoryBooster("glove");
      const paid = usedInventory ? true : spendCoins(ECONOMY.boosterCosts.glove);
      if (!paid) {
        resolvingRef.current = false;
        return;
      }
      setTargetingMode(null);
      triggerHaptic("medium", settings.isHapticsEnabled);
      const resolution = useGloveBooster(blocks, tappedTile.row, nextId);
      if (!resolution.didResolveBlast) {
        resolvingRef.current = false;
        return;
      }
      setBoosterUseFx({ kind: "glove", y: topForRow(tappedTile.row) + CELL_SIZE / 2 });
      window.setTimeout(() => setBoosterUseFx(null), 150);
      applyResolution(resolution, event, { consumeMove: false });
      return;
    }

    if (tappedTile.kind === "booster") {
      const adjacent = getAdjacentBooster(blocks, tappedTile.col, tappedTile.row);
      if (adjacent) {
        setPhase("combo_anticipation");
        setComboAnticipation({
          c1: tappedTile.col,
          r1: tappedTile.row,
          c2: adjacent.col,
          r2: adjacent.row,
          type: [tappedTile.booster, adjacent.booster].sort().join("_"),
        });
        playSfx("boosterSpawn");
        
        window.setTimeout(() => {
          setComboAnticipation(null);
          const comboResolution = resolveCombo(blocks, tappedTile, adjacent, nextId);

          if (comboResolution.impact === "mega" || comboResolution.impact === "grand_slam") {
            // we will play a deep explosion if audio manager had it, but bombExplode + haptic works too
            triggerHaptic("heavy", settings.isHapticsEnabled);
            playSfx("bombExplode");
          }
          applyResolution(comboResolution, event, { consumeMove: true });
        }, 180);
        return;
      }
    }

    const resolution = resolveTap(blocks, tappedTile, nextId);
    if (!resolution.didConsumeMove && !resolution.didResolveBlast) {
      // Show wobble for blocks that were touched but could not resolve.
      if (tappedTile.kind !== "booster") {
        triggerInvalidTap(tappedTile.id);
      }
      resolvingRef.current = false;
      return;
    }
    if (tappedTile.kind === "booster" && tappedTile.booster === "rocket") {
      playSfx("rocketSwoosh");
      triggerHaptic("medium", settings.isHapticsEnabled);
    }
    if (tappedTile.kind === "booster" && tappedTile.booster === "bomb") {
      triggerHaptic("medium", settings.isHapticsEnabled);
    }
    applyResolution(resolution, event, { consumeMove: true });
  };

  const handleSelectBooster = (booster: InGameBoosterKind) => {
    if (!canInteract || resolvingRef.current) return;
    registerInteraction();

    if (booster === "shuffle") {
      const usedInventory = useInventoryBooster("shuffle");
      const paid = usedInventory ? true : spendCoins(ECONOMY.boosterCosts.shuffle);
      if (!paid) return;
      setTargetingMode(null);
      setHoverIds(new Set());
      triggerHaptic("medium", settings.isHapticsEnabled);
      playSfx("rocketSwoosh");
      setPhase("resolving");
      resolvingRef.current = true;
      setShufflePulse((prev) => prev + 1);
      setBoosterUseFx({ kind: "shuffle" });

      settleTimeoutRef.current = window.setTimeout(() => {
        setBlocks((prev) => shuffleRegularTiles(prev));
        setBoosterUseFx(null);
        setPhase("playing");
        resolvingRef.current = false;
        settleTimeoutRef.current = null;
      }, 130);
      return;
    }

    setHoverIds(new Set());
    setTargetingMode((prev) => (prev === booster ? null : booster));
  };

  // â”€â”€ Shared internal function: actually grants +5 moves and resumes play.
  // isRescuingRef MUST already be true before this is called.
  // The 200ms timeout guarantees React has fully batched AND committed
  // BOTH setMovesLeft AND setPhase before finalizeTurn is allowed to run again.
  const _commitRescue = () => {
    // Grant the extra moves and resume play
    setMovesLeft((prev) => prev + ECONOMY.rescueMoves);
    setPhase("playing");
    resolvingRef.current = false;
    // Increment the escalation counter AFTER committing (safe â€” no render dependency)
    setRescueCount((prev) => prev + 1);
    // Release the guard AFTER React has committed the movesLeft + phase updates.
    // 200ms is enough for React to fully batch-commit both setState calls.
    window.setTimeout(() => {
      isRescuingRef.current = false;
    }, 200);
  };

  // Option B reward: inject one Disco booster on the live board after ad rescue.
  // We place it on the most central regular tile so it is easy to spot/use.
  const _grantAdDiscoBonus = () => {
    setBlocks((prev) => {
      const regularTiles = prev.filter((tile): tile is RegularTile => tile.kind === "regular");
      if (regularTiles.length === 0) return prev;

      const centerCol = (COLUMNS - 1) / 2;
      const centerRow = (ROWS - 1) / 2;
      const target = regularTiles.reduce((best, tile) => {
        const bestDist = Math.abs(best.col - centerCol) + Math.abs(best.row - centerRow);
        const tileDist = Math.abs(tile.col - centerCol) + Math.abs(tile.row - centerRow);
        return tileDist < bestDist ? tile : best;
      }, regularTiles[0]);

      return prev.map((tile) => {
        if (tile.id !== target.id) return tile;
        return {
          id: `b_${nextId.current++}`,
          kind: "booster",
          booster: "disco",
          col: tile.col,
          row: tile.row,
          spawnRow: tile.row,
        };
      });
    });
  };

  const handleRescue = () => {
    // â”€â”€ Step 1: IMMEDIATELY lock the rescue guard â€” synchronous, beats any
    // React render cycle. finalizeTurn reads this as its very first line.
    isRescuingRef.current = true;

    // â”€â”€ Step 2: Verify affordability against current snapshot of economy.coins.
    // We read economy.coins directly here (NOT via spendCoins return value)
    // because spendCoins uses setEconomy() which is async.
    const canAfford = economy.coins >= currentRescueCost;

    if (!canAfford) {
      // Release guard â€” not actually rescuing
      isRescuingRef.current = false;
      resetCascadePop();
      setMascotState("sad");
      playSfx("loseSigh");
      consumeLifeOnLoss();
      setPhase("lost");
      return;
    }

    // â”€â”€ Step 3: Deduct the dynamic cost. Balance verified above.
    spendCoins(currentRescueCost);

    // â”€â”€ Step 4: Grant +5 moves, bump rescue tier, resume play, release guard.
    _commitRescue();
  };

  const handleWatchAdReward = () => {
    // TODO: Integrate Google AdMob Rewarded Video here.
    // When the real AdMob SDK is ready:
    //   1. Replace the _commitRescue() call below with: AdMob.showRewardedAd()
    //   2. In the SDK's onRewarded callback â†’ set isRescuingRef.current = true
    //      then call _commitRescue()
    //   3. In onDismissed / onFailed â†’ do nothing (player stays on rescue screen)
    //
    // Current stub: instantly grants +5 moves, deducts ZERO coins.
    // Watching an ad ALSO escalates the next coin-rescue cost (same tier bump).
    isRescuingRef.current = true; // â† move into onRewarded callback when using real SDK
    _grantAdDiscoBonus();
    setFloatingTexts((prev) => [
      ...prev,
      { id: `ad_disco_${Date.now()}`, x: boardWidth * 0.5, y: 120, label: "DISCO BONUS!", tone: "mega" },
    ]);
    playSfx("boosterSpawn");
    triggerHaptic("medium", settings.isHapticsEnabled);
    _commitRescue();
  };

  const handleGiveUp = () => {
    // Player explicitly declined rescue â€” proper loss flow
    isRescuingRef.current = false; // No rescue in flight
    resetCascadePop();
    setMascotState("sad");
    playSfx("loseSigh");
    consumeLifeOnLoss();
    setPhase("lost");
  };

  const handleBuyLivesRefill = () => {
    const paid = spendCoins(ECONOMY.livesRefillCostCoins);
    if (!paid) return;
    setEconomy((prev) => ({ ...prev, lives: ECONOMY.maxLives, nextLifeAt: null }));
    setShowOutOfLives(false);
  };

  const handlePause = () => {
    if (screen !== "game" || phase !== "playing") return;
    setShowPauseMenu(true);
  };

  const handleResume = () => {
    setShowPauseMenu(false);
  };

  const handleQuitLevel = () => {
    resetCascadePop();
    playSfx("loseSigh");
    consumeLifeOnLoss();
    setShowPauseMenu(false);
    backToMap();
  };

  const handleToggleMusic = () => {
    setSettings((prev) => {
      const next = { ...prev, isMusicMuted: !prev.isMusicMuted };
      BGMManager.setMuted(next.isMusicMuted);
      // When un-muting, restart the correct track for the current screen
      if (!next.isMusicMuted && splashDone) {
        const track: BGMTrack = screen === "game" ? "game" : "main";
        void BGMManager.unlock().then(() => BGMManager.playMusic(track));
      }
      return next;
    });
  };

  return (
    <main
      className="mania-ui fixed inset-0 flex h-full w-full flex-col overflow-hidden bg-[#080818] select-none"
      style={{
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        background:
          screen === "map"
            ? "var(--crystal-harbor-bg)"
            : screen === "pregame"
              ? selectedEpisodeTheme.shellBackground
            : "radial-gradient(circle at 16% 10%, #8aa2ff33 0%, #8aa2ff00 24%), radial-gradient(circle at 82% 26%, #6be3ff2b 0%, #6be3ff00 30%), radial-gradient(circle at 72% 92%, #7dffbf24 0%, #7dffbf00 28%), linear-gradient(180deg, #4a4cc6 0%, #2a2f80 36%, #1b1c57 72%, #13133f 100%)",
      }}
    >
      {/* â”€â”€ Splash Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {!splashDone && (
          <SplashScreen
            isMusicMuted={settings.isMusicMuted}
            onToggleMusic={handleToggleMusic}
            onDone={() => {
              setSplashDone(true);
              // Keep BGM running seamlessly after splash.
              if (!settings.isMusicMuted) {
                void BGMManager.unlock().then(() => BGMManager.playMusic("main"));
              }
            }}
          />
        )}
      </AnimatePresence>
      {/* â”€â”€ Fever Overlay (full-screen, fixed, behind all popups) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {fever.active && (
        <FeverOverlay
          active={fever.active}
          streak={fever.streak}
          multiplier={fever.multiplier}
          timeLeft={fever.expiresAt ? Math.max(0, fever.expiresAt - Date.now()) : 0}
          totalDuration={5000}
        />
      )}

      {/* â”€â”€ Confetti (fixed overlay, triggered on win) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showConfetti && <ConfettiSystem />}

      <RewardToast
        isOpen={rewardToast !== null}
        title={rewardToast?.title ?? ""}
        reward={rewardToast?.reward ?? EMPTY_REWARD_BUNDLE}
      />

      {showDailyWheel ? (
        <DailyWheelModal canSpin={canUseDailyWheel} onClose={handleCloseDailyWheel} onSpin={handleSpinDailyWheel} />
      ) : null}

      {showTreasurePopup && activeTreasureChest ? (
        <TreasureRewardPopup chest={activeTreasureChest} onOpenChest={handleClaimTreasureChest} onContinue={closeTreasurePopup} />
      ) : null}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-20 top-24 h-56 w-56 rounded-full bg-emerald-200/10 blur-3xl" />
        <div className="absolute right-4 top-40 h-44 w-44 rounded-full bg-teal-200/10 blur-3xl" />
        <div className="absolute bottom-6 left-8 h-24 w-52 rounded-[999px] bg-emerald-300/12 blur-2xl" />
      </div>
      <section
        ref={containerRef}
        className="relative mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden px-0 pb-0 pt-0"
        style={{
          maxWidth: APP_FRAME_MAX_WIDTH,
          minHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        }}
      >
        {screen === "map" || screen === "pregame" ? (
          <ImmersiveScreen
            screenKey={screen === "pregame" ? "map-backdrop-screen" : "map-screen"}
            surfaceStyle={mapSurfaceStyle}
            entryOffset={8}
            fullBleed
          >
            <div className={screen === "pregame" ? "pointer-events-none flex-none scale-[0.996] opacity-[0.72] saturate-[0.88]" : "flex min-h-0 flex-1"}>
              <LevelMap
                sagaProgress={sagaProgress}
                activeMapLevelId={selectedLevelId}
                economy={economy}
                refillLabel={refillLabel}
                isMusicMuted={settings.isMusicMuted}
                recentlyUnlockedLevel={recentlyUnlockedLevel}
                onPlayCurrentLevel={() => openPregame(selectedLevelId)}
                onOpenSettings={openSettings}
                onToggleMusic={handleToggleMusic}
                missions={missionCards}
                pendingChestCount={metaProgress.pendingChests.length}
                nextPendingChest={nextPendingChest}
                lastOpenedChest={metaProgress.chestStats.lastOpenedChest}
                totalOpenedChests={metaProgress.chestStats.totalOpened}
                onClaimMission={handleClaimMission}
                onOpenPendingChest={handleOpenPendingChest}
                selectedCharacterIndex={metaProgress.selectedCharacterIndex}
                canUseDailyWheel={canUseDailyWheel}
                onSelectCharacter={handleSelectCharacter}
                onOpenDailyWheel={handleOpenDailyWheel}
                onSelectLevel={openPregame}
                layoutMode={layoutMode}
                interactionLocked={screen === "pregame"}
                showDock={splashDone && screen !== "pregame"}
              />
            </div>

            {screen === "map" && showSettings ? (
              <SettingsModal
                isMusicMuted={settings.isMusicMuted}
                isSfxMuted={settings.isSfxMuted}
                isHapticsEnabled={settings.isHapticsEnabled}
                onToggleMusic={handleToggleMusic}
                onToggleSfx={() => setSettings((prev) => ({ ...prev, isSfxMuted: !prev.isSfxMuted }))}
                onToggleHaptics={() => setSettings((prev) => ({ ...prev, isHapticsEnabled: !prev.isHapticsEnabled }))}
                onHowToPlay={() => {
                  window.alert("Tap groups of 2+ matching blocks to blast them. Build bigger groups to create boosters.");
                }}
                onResetProgress={resetProgress}
                onClose={closeSettings}
              />
            ) : null}
          </ImmersiveScreen>
        ) : null}

        {screen === "pregame"
          ? typeof document !== "undefined"
            ? createPortal(
                <PreGameScreen
                  level={selectedLevel}
                  bestScore={sagaProgress.bestScoreByLevel[selectedLevel.id] ?? 0}
                  stars={sagaProgress.starsByLevel[selectedLevel.id] ?? 0}
                  isCompletedBonus={selectedLevel.mode === "bonus" && sagaProgress.bonusClaimedLevels.includes(selectedLevel.id)}
                  isCompletedLevel={isLevelCompleted(selectedLevel.id)}
                  selectedCharacterIndex={metaProgress.selectedCharacterIndex}
                  economy={economy}
                  onBack={closePregame}
                  onStart={() => beginLevel(selectedLevel.id)}
                />,
                document.body,
              )
            : (
                <PreGameScreen
                  level={selectedLevel}
                  bestScore={sagaProgress.bestScoreByLevel[selectedLevel.id] ?? 0}
                  stars={sagaProgress.starsByLevel[selectedLevel.id] ?? 0}
                  isCompletedBonus={selectedLevel.mode === "bonus" && sagaProgress.bonusClaimedLevels.includes(selectedLevel.id)}
                  isCompletedLevel={isLevelCompleted(selectedLevel.id)}
                  selectedCharacterIndex={metaProgress.selectedCharacterIndex}
                  economy={economy}
                  onBack={closePregame}
                  onStart={() => beginLevel(selectedLevel.id)}
                />
              )
          : null}

        <AnimatePresence mode="wait">
          {screen === "game" ? (
            <ImmersiveScreen screenKey="game-screen" surfaceStyle={gameSurfaceStyle} entryOffset={18} fullBleed>
              <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden px-1 pb-2 pt-2">
                <motion.div
                  className="relative"
                  animate={shakeControls}
                  initial={false}
                  style={{ overflow: "visible" }}
                >
                <motion.div
                  className="relative"
                  animate={cameraControls}
                  initial={false}
                  style={{ overflow: "visible", transformOrigin: "center center" }}
                >
                <div
                  className="relative flex flex-col gap-0"
                  style={{
                    width: gamePanelBaseWidth,
                    minHeight: gamePanelBaseHeight,
                    overflow: "visible",
                    transform: `scale(${gameUIScale})`,
                    transformOrigin: "top center",
                  }}
                >
              {/* â”€â”€ HUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="w-full px-2 pt-2" style={{ overflow: "visible", flex: "0 0 auto" }}>
                <TopHUD
                  level={activeLevel}
                  movesLeft={movesLeft}
                  score={score}
                  highScore={levelHighScore}
                  progress={progress}
                  boxesDestroyed={boxesDestroyed}
                  objectivePulse={objectivePulse}
                  registerObjectiveRef={registerObjectiveRef}
                  registerScoreRef={(element) => { scoreRef.current = element; }}
                  onPause={handlePause}
                  onBackToMap={backToMap}
                  mascotState={mascotState}
                  currentLevel={activeLevel.id}
                  selectedCharacterIndex={metaProgress.selectedCharacterIndex}
                  timeLeft={activeLevel.mode === "bonus" ? bonusTimeLeft : undefined}
                  bonusLoot={activeLevel.mode === "bonus" ? bonusLoot : undefined}
                  layoutMode={layoutMode}
                />
              </div>

              {/* â”€â”€ Board â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="flex min-h-0 flex-1 w-full items-center justify-center px-2 py-2">
                <div
                  ref={boardRef}
                  className={`mania-board-shell relative overflow-hidden rounded-2xl border-[4px] p-2 transition ${isTargeting ? "border-yellow-300/80" : "border-white/20"}`}
                  style={{
                    width: boardWidth + 16,
                    height: boardHeight + 16,
                    background: "rgba(8,13,36,0.26)",
                    boxShadow: "inset 0 4px 10px rgba(255,255,255,0.05), inset 0 -10px 16px rgba(0,0,0,0.18), 0 10px 20px rgba(0,0,0,0.28)",
                  }}
                >{/* boardRef-open */}
                <div className="absolute left-2 top-2" style={{ width: boardWidth, height: boardHeight }}>{/* content-open */}
                  <AnimatePresence>
                    {activeParticles.map((particle) => (
                      <motion.div
                        key={`${particle.id}_${particle.version}`}
                        className="pointer-events-none absolute grid place-items-center"
                        style={{ left: particle.x, top: particle.y, willChange: "transform, opacity" }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1.2, rotate: 0 }}
                        animate={{ x: particle.dx, y: particle.dy, opacity: 0, scale: 0.1, rotate: particle.rotation }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.2, 0, 0.8, 1] }}
                      >
                        {particle.shape === "star" ? (
                          <span className="block text-xs leading-none" style={{ color: particle.color, textShadow: `0 0 6px ${particle.color}` }}>
                            âœ¦
                          </span>
                        ) : (
                          <span
                            className="block rounded-[2px]"
                            style={{ width: particle.size, height: particle.size, background: particle.color, boxShadow: `0 0 ${4 * particle.scaleBoost}px ${particle.color}` }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <AnimatePresence>
                    {hintPulseTarget ? (
                      <motion.div
                        key={`hint-${hintPulseTarget.id}`}
                        className="pointer-events-none absolute grid place-items-center"
                        style={{
                          left: hintPulseTarget.col * (CELL_SIZE + GRID_GAP),
                          top: topForRow(hintPulseTarget.row),
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                        }}
                        initial={{ opacity: 0, scale: 0.72 }}
                        animate={{ opacity: [0.45, 1, 0.45], scale: [0.82, 1.18, 0.82] }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.72, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="absolute inset-[2px] rounded-[12px] border-2 border-cyan-100/95 shadow-[0_0_18px_rgba(103,232,249,0.72)]" />
                        <div className="text-lg drop-shadow-[0_0_10px_rgba(255,255,255,0.82)]">âœ¦</div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                   <AnimatePresence>
                     {blocks.map((block) => {
                        const isHovered    = hoverIds.has(block.id);
                        const isFearBlock  = hoveredBlockId === block.id && block.kind === "regular";
                        const isMatchable  = matchableIds.has(block.id);
                        const left         = block.col * (CELL_SIZE + GRID_GAP);
                        const top          = topForRow(block.row);
                        const spawnTop     = topForRow(block.spawnRow);
                        const glyph        = blockGlyph(block);
                        const hasSVG       = usesSVG(block);
                        const fallDistance = Math.max(0, block.spawnRow - block.row);
                        const isInvalidTap = invalidTapFx?.id === block.id;
                        const inFever      = fever.active;
                        const isShocked    = shockedCells.has(`${block.col}:${block.row}`);
                        const allowAmbientBlockMotion = phase === "playing" && activeRocketVFX === null && activeDiscoVFX === null;

                        // Idle CSS animation params â€” wave stagger per cell
                        const idleParams = getIdleAnimParams(block.col, block.row, COLUMNS);

                        // Combo anticipation suck-in
                        const isCombo1 = comboAnticipation?.c1 === block.col && comboAnticipation?.r1 === block.row;
                        const isCombo2 = comboAnticipation?.c2 === block.col && comboAnticipation?.r2 === block.row;

                        let comboX = 0;
                        let comboY = 0;
                        let comboScale = 1;

                        if (isCombo1 && comboAnticipation) {
                          comboX = (comboAnticipation.c2 - comboAnticipation.c1) * (CELL_SIZE / 2);
                          comboY = (comboAnticipation.r2 - comboAnticipation.r1) * (CELL_SIZE / 2);
                          comboScale = 0.5;
                        } else if (isCombo2 && comboAnticipation) {
                          comboX = (comboAnticipation.c1 - comboAnticipation.c2) * (CELL_SIZE / 2);
                          comboY = (comboAnticipation.r1 - comboAnticipation.r2) * (CELL_SIZE / 2);
                          comboScale = 0.5;
                        }

                        // Which CSS idle class wins (priority order)
                        const idleClass = !allowAmbientBlockMotion
                          ? ""
                          : inFever
                          ? "fever-block-happy"                 // fever overrides all
                          : isFearBlock
                          ? "block-fear"                        // hovering THIS specific block
                          : isMatchable && !hasSVG
                          ? "block-matchable"                   // part of blastable group
                          : hasSVG
                          ? "block-svg-idle"
                          : !hasSVG
                          ? "block-idle"                        // default gentle float
                          : "";                                 // SVG tiles manage own anim

                        // Box-shadow for non-SVG tiles â€” scaled for 36px cells
                        const tileBoxShadow = hasSVG ? "none"
                          : isHovered
                          ? "0 0 0 2px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.42), inset 0 -3px 0 rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.18)"
                          : "inset 0 -3px 0 rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.18)";

                        return (
                          <motion.button
                            key={block.id}
                            type="button"
                            className="absolute border-0 p-0"
                            disabled={!canInteract}
                            style={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              left,
                              top,
                              outline: "none",
                              background: "transparent",
                              cursor: canInteract ? "pointer" : "default",
                              zIndex: (isCombo1 || isCombo2) ? 50 : 1,
                            }}
                            initial={{ top: spawnTop, scale: 0.55, opacity: 0 }}
                            animate={{
                              top,
                              scale: (isCombo1 || isCombo2) ? comboScale : 1,
                              opacity: 1,
                                x: isInvalidTap
                                  ? [0, -6, 6, -4, 4, 0]
                                  : isShocked
                                    ? [0, -2, 2, -2, 2, 0]
                                    : comboX,
                                y: isShocked ? [0, 1, -1, 1, 0] : comboY,
                              rotate: isInvalidTap ? [0, -7, 7, -4, 4, 0] : 0,
                            }}
                            exit={{ scale: 0, opacity: 0, transition: { duration: 0.07, ease: "easeIn" } }}
                            transition={{
                              top: { type: "spring", stiffness: 820, damping: 32, mass: 0.35 },
                              scale: { type: "spring", stiffness: 850, damping: 28 },
                                x: {
                                  duration: isInvalidTap ? 0.16 : isShocked ? 0.26 : 0.01,
                                  ease: isShocked ? "linear" : "easeOut",
                                  repeat: isShocked ? Infinity : 0,
                                },
                                y: { duration: isShocked ? 0.26 : 0.01, ease: "linear", repeat: isShocked ? Infinity : 0 },
                              rotate: { duration: isInvalidTap ? 0.16 : 0.01, ease: "easeOut" },
                              opacity: { duration: 0.06 },
                            }}
                            onMouseEnter={() => handleHover(block.id)}
                            onMouseLeave={handleBlockLeave}
                            onPointerUp={(event) => handleTap(block.id, event)}
                          >
                            {/* â”€â”€ Idle / Matchable / Fear / Fever CSS animation wrapper â”€â”€ */}
                            <div
                              className={`h-full w-full ${idleClass}`}
                              style={{
                                "--float-dur":   idleParams.duration,
                                "--float-delay": idleParams.delay,
                              } as React.CSSProperties}
                            >
                            <motion.div
                              key={`${block.id}-${shufflePulse}`}
                              className={`mania-block-shell ${hasSVG ? "mania-svg-block" : glyph ? "mania-reward-block" : "mania-color-block"} relative grid h-full w-full place-items-center overflow-visible`}
                              animate={{
                                scaleX: fallDistance > 0 ? [1, 1.18, 0.88, 1.06, 1] : 1,
                                scaleY: fallDistance > 0 ? [1, 0.82, 1.14, 0.96, 1] : 1,
                                rotate: shufflePulse > 0 ? [0, -8, 8, -4, 0] : 0,
                              }}
                              transition={{
                                scaleX:     { duration: fallDistance > 0 ? 0.13 : 0.01, ease: "easeOut" },
                                scaleY:     { duration: fallDistance > 0 ? 0.13 : 0.01, ease: "easeOut" },
                                rotate:     { duration: shufflePulse > 0 ? 0.12 : 0.01, ease: "easeOut" },
                              }}
                              style={{
                                borderRadius: hasSVG ? 0 : 8,
                                background:   blockBackground(block),
                                boxShadow: tileBoxShadow,
                                filter: isShocked ? "brightness(1.22) drop-shadow(0 0 5px rgba(255,255,255,0.85))" : "none",
                                willChange: fallDistance > 0 || isInvalidTap || isShocked ? "transform, filter" : "transform",
                              }}
                            >
                              {/* â”€â”€ Shine highlight (regular + reward tiles only) â”€â”€ */}
                              {!hasSVG && (
                                <div
                                  className="pointer-events-none absolute"
                                  style={{
                                    top: 4, left: 5,
                                    width: 11, height: 6,
                                    borderRadius: 8,
                                    background: "rgba(255,255,255,0.55)",
                                    transform: "rotate(-15deg)",
                                  }}
                                />
                              )}

                              {/* â”€â”€ Match-ready glow ring on non-hovered matchable blocks â”€â”€ */}
                              {isMatchable && !isFearBlock && !hasSVG && !isHovered && (
                                <div
                                  className="pointer-events-none absolute inset-0 rounded-[8px]"
                                  style={{
                                    boxShadow: "0 0 0 1.5px rgba(255,255,255,0.28)",
                                    opacity: 0.7,
                                  }}
                                />
                              )}

                              {/* â”€â”€ Hover group glow ring â”€â”€ */}
                              {isHovered && !hasSVG && (
                                <div
                                  className="pointer-events-none absolute inset-[-2px] rounded-[10px]"
                                  style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.5)" }}
                                />
                              )}

                              {/* â”€â”€ Custom SVG renderer for boosters & boxes â”€â”€ */}
                              {hasSVG ? (
                                <div className="relative z-10 flex items-center justify-center overflow-visible">
                                  <BlockIcon tile={block} isHovered={isHovered} cellSize={CELL_SIZE} />
                                  {isHovered && (
                                    <motion.div
                                      className="pointer-events-none absolute inset-[-3px] rounded-lg"
                                      animate={{ boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 12px rgba(255,255,255,0.7)", "0 0 0px rgba(255,255,255,0)"] }}
                                      transition={{ duration: 0.7, repeat: Infinity }}
                                    />
                                  )}
                                </div>
                              ) : glyph ? (
                                /* â”€â”€ Reward emoji tiles â”€â”€ */
                                <span className="relative z-10 text-base" style={{ textShadow: "0 2px 6px rgba(0,0,0,0.35), 0 0 8px rgba(255,255,255,0.3)" }}>
                                  {glyph}
                                </span>
                              ) : (
                                /* â”€â”€ Regular color block face â€” eyes + mouth â”€â”€ */
                                <div className="relative z-10 select-none">
                                  <div className="flex items-center justify-center gap-[4px]">
                                    {/* Left eye */}
                                    <span
                                      className="block rounded-full bg-black/40"
                                      style={{
                                        width: 4, height: 4,
                                        transform: isFearBlock
                                          ? "translateY(-1px) scaleY(0.6)"  // wide scared eyes
                                          : inFever
                                          ? "scale(1.2)"                     // fever â€” bright eyes
                                          : "none",
                                        transition: "transform 80ms ease-out",
                                        boxShadow: inFever ? "0 0 3px rgba(255,211,45,0.8)" : "none",
                                      }}
                                    >
                                      {/* Star pupils in fever */}
                                      {inFever && (
                                        <span className="block text-center leading-[4px]" style={{ fontSize: 3, color: "#FFD32D" }}>â˜…</span>
                                      )}
                                    </span>
                                    {/* Right eye */}
                                    <span
                                      className="block rounded-full bg-black/40"
                                      style={{
                                        width: 4, height: 4,
                                        transform: isFearBlock
                                          ? "translateY(-1px) scaleY(0.6)"
                                          : inFever
                                          ? "scale(1.2)"
                                          : "none",
                                        transition: "transform 80ms ease-out",
                                        boxShadow: inFever ? "0 0 3px rgba(255,211,45,0.8)" : "none",
                                      }}
                                    >
                                      {inFever && (
                                        <span className="block text-center leading-[4px]" style={{ fontSize: 3, color: "#FFD32D" }}>â˜…</span>
                                      )}
                                    </span>
                                  </div>
                                  {/* Mouth â€” changes with state */}
                                  <div
                                    className="mx-auto mt-[2px] rounded-full bg-black/25"
                                    style={{
                                      width:  isFearBlock ? 4  : inFever ? 7 : 7,
                                      height: isFearBlock ? 3  : inFever ? 3 : 2,
                                      borderRadius: isFearBlock ? "50% 50% 0 0 / 40% 40% 0 0"  // D-shape (open mouth)
                                                  : inFever     ? "0 0 50% 50% / 0 0 40% 40%"  // big smile
                                                  :               "50%",                         // neutral
                                      transition: "all 100ms ease-out",
                                    }}
                                  />
                                </div>
                              )}
                            </motion.div>
                            </div>{/* end idle wrapper */}
                          </motion.button>
                       );
                     })}
                  </AnimatePresence>

                  <AnimatePresence>
                    {floatingTexts.map((item) => (
                      <motion.p
                        key={item.id}
                        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-extrabold text-white"
                        style={{ left: item.x, top: item.y, textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}
                        initial={{ opacity: 0, y: 0, scale: item.tone === "mega" ? 0.8 : 0.6 }}
                        animate={{ opacity: 1, y: item.tone === "mega" ? -38 : -28, scale: item.tone === "mega" ? 1.2 : 1 }}
                        exit={{ opacity: 0, y: item.tone === "mega" ? -55 : -44, scale: item.tone === "mega" ? 1.26 : 1.05 }}
                        transition={{ duration: item.tone === "mega" ? 0.38 : 0.30, ease: "easeOut" }}
                      >
                        <span
                          className={item.tone === "mega" ? "text-2xl font-black tracking-wide text-yellow-300" : "text-lg"}
                          style={item.tone === "mega" ? { textShadow: "0 0 14px rgba(255,211,45,0.9), 0 5px 8px rgba(0,0,0,0.5)" } : undefined}
                        >
                          {item.label}
                        </span>
                      </motion.p>
                    ))}
                  </AnimatePresence>

                  <AnimatePresence>
                    {comboSweep
                      ? comboSweep.rows.map((row) => (
                          <motion.div
                            key={`sweep-row-${row}`}
                            className="pointer-events-none absolute left-0"
                            style={{
                              top: topForRow(row) + CELL_SIZE / 2 - 4,
                              width: boardWidth,
                              height: 8,
                              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,211,45,0.96) 50%, rgba(255,255,255,0) 100%)",
                              boxShadow: "0 0 18px rgba(255,211,45,0.9)",
                            }}
                            initial={{ opacity: 0, scaleX: 0.2 }}
                            animate={{ opacity: [0, 1, 0], scaleX: [0.3, 1, 1] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                          />
                        ))
                      : null}
                  </AnimatePresence>

                  <AnimatePresence>
                    {comboSweep
                      ? comboSweep.cols.map((col) => (
                          <motion.div
                            key={`sweep-col-${col}`}
                            className="pointer-events-none absolute top-0"
                            style={{
                              left: col * (CELL_SIZE + GRID_GAP) + CELL_SIZE / 2 - 4,
                              width: 8,
                              height: boardHeight,
                              background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,211,45,0.96) 50%, rgba(255,255,255,0) 100%)",
                              boxShadow: "0 0 18px rgba(255,211,45,0.9)",
                            }}
                            initial={{ opacity: 0, scaleY: 0.2 }}
                            animate={{ opacity: [0, 1, 0], scaleY: [0.3, 1, 1] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                          />
                        ))
                      : null}
                  </AnimatePresence>
                </div>

                {/* â”€â”€ Rocket Cinematic VFX Overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {activeRocketVFX && (
                  <RocketVFX
                    key={activeRocketVFX.id}
                    col={activeRocketVFX.col}
                    row={activeRocketVFX.row}
                    axis={activeRocketVFX.axis}
                    boardWidth={boardWidth}
                    boardHeight={boardHeight}
                    onComplete={handleRocketVFXComplete}
                  />
                )}

                {/* â”€â”€ Disco Lightning Cinematic VFX Overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {activeDiscoVFX && (
                  <DiscoVFX
                    key={activeDiscoVFX.id}
                    col={activeDiscoVFX.col}
                    row={activeDiscoVFX.row}
                    targets={activeDiscoVFX.targets}
                    targetColor={activeDiscoVFX.targetColor}
                    boardWidth={boardWidth}
                    boardHeight={boardHeight}
                    onShockStart={handleDiscoShockStart}
                    onShockEnd={handleDiscoShockEnd}
                    onImpact={handleDiscoImpact}
                    onComplete={handleDiscoVFXComplete}
                  />
                )}

                <AnimatePresence>
                  {isTargeting ? (
                    <motion.div
                      key="targeting-dim"
                      className="pointer-events-none absolute inset-0 z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      style={{ background: "rgba(5, 10, 30, 0.2)" }}
                    />
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {impactFlash ? (
                    <motion.div
                      key={impactFlash.id}
                      className="pointer-events-none absolute inset-0 z-20"
                      initial={{ opacity: impactFlash.intensity }}
                      animate={{ opacity: [impactFlash.intensity, impactFlash.intensity * 0.28, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18, ease: CINEMATIC_EASE, times: [0, 0.14, 1] }}
                      style={{
                        background: `radial-gradient(circle at ${impactFlash.x}px ${impactFlash.y}px, rgba(255,255,255,${impactFlash.intensity}) 0%, rgba(255,255,255,${Math.max(0, impactFlash.intensity - 0.16)}) 14%, rgba(255,255,255,0.16) 34%, rgba(255,255,255,0) 68%)`,
                        mixBlendMode: "screen",
                      }}
                    />
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {boosterUseFx?.kind === "hammer" ? (
                    <motion.div
                      key="hammer-use-fx"
                      className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 text-6xl"
                      style={{ left: boosterUseFx.x, top: boosterUseFx.y - 58, textShadow: "0 5px 14px rgba(0,0,0,0.55)" }}
                      initial={{ y: -80, rotate: -10, opacity: 0 }}
                      animate={{ y: [0, 64, 58], rotate: [0, 6, 0], opacity: [0, 1, 1] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                      ðŸ”¨
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {boosterUseFx?.kind === "glove" ? (
                    <motion.div
                      key="glove-use-fx"
                      className="pointer-events-none absolute z-30"
                      style={{ left: -80, top: boosterUseFx.y - 28 }}
                      initial={{ x: 0, opacity: 0 }}
                      animate={{ x: boardWidth + 170, opacity: [0, 1, 1, 0.75] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    >
                      <span className="text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]">ðŸ¥Š</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {boosterUseFx?.kind === "shuffle" ? (
                    <motion.div
                      key="shuffle-use-fx"
                      className="pointer-events-none absolute inset-0 z-30 grid place-items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <motion.span
                        className="text-6xl"
                        style={{ textShadow: "0 0 16px rgba(255,255,255,0.8)" }}
                        initial={{ scale: 0.7, rotate: 0 }}
                        animate={{ scale: [0.75, 1.15, 1], rotate: [0, 140, 300] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                      >
                        ðŸ”€
                      </motion.span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {phase === "won" && !showBonusLootPopup ? (
                  <EndPopup
                    mode="win"
                    score={score}
                    stars={activeLevel.mode === "bonus" ? 3 : stars}
                    coinsReward={activeLevel.mode === "bonus" ? bonusLoot.coins : coinReward}
                    hasNextLevel
                    selectedCharacterIndex={metaProgress.selectedCharacterIndex}
                    onBackToMap={backToMap}
                    onNextLevel={() => {
                      const nextLevelId = activeLevel.id >= MAP_LEVEL_CAP ? Math.max(CHAMPIONS_START_LEVEL, activeLevel.id + 1) : activeLevel.id + 1;
                      openPregame(nextLevelId);
                    }}
                  />
                ) : null}
                {showBonusLootPopup ? (
                  <BonusLootPopup
                    loot={bonusLoot}
                    levelId={activeLevel.id}
                    hasNextLevel
                    onNextLevel={() => {
                      setShowBonusLootPopup(false);
                      const nextLevelId = activeLevel.id >= MAP_LEVEL_CAP ? Math.max(CHAMPIONS_START_LEVEL, activeLevel.id + 1) : activeLevel.id + 1;
                      openPregame(nextLevelId);
                    }}
                    onContinue={() => {
                      setShowBonusLootPopup(false);
                      // Now show the win EndPopup
                      setStars(3);
                      setPhase("won");
                      playSfx("winTrumpet");
                      triggerHaptic("heavy", settings.isHapticsEnabled);
                      triggerMascot("victory", 3000);
                    }}
                  />
                ) : null}
                {phase === "rescue" ? (
                  <EndPopup
                    mode="rescue"
                    score={score}
                    rescueCostCoins={currentRescueCost}
                    canAffordRescue={canAffordRescue}
                    selectedCharacterIndex={metaProgress.selectedCharacterIndex}
                    onRescue={handleRescue}
                    onWatchAd={handleWatchAdReward}
                    onGiveUp={handleGiveUp}
                    onBackToMap={() => {
                      isRescuingRef.current = false;
                      consumeLifeOnLoss();
                      backToMap();
                    }}
                  />
                ) : null}
                {phase === "lost" ? <EndPopup mode="lost" score={score} selectedCharacterIndex={metaProgress.selectedCharacterIndex} onBackToMap={backToMap} /> : null}
                </div>{/* end boardRef */}
              </div>{/* end centering wrapper */}
              {/* â”€â”€ Booster Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="mt-auto w-full" style={{ flex: "0 0 auto" }}>
                <InGameBoosters
                  coins={economy.coins}
                  inventory={economy.inventory}
                  targetingMode={targetingMode}
                  onSelectBooster={handleSelectBooster}
                />
              </div>

              {showPauseMenu ? <PauseMenu onResume={handleResume} onSettings={openSettings} onQuitLevel={handleQuitLevel} /> : null}

              {showSettings ? (
                <SettingsModal
                  isMusicMuted={settings.isMusicMuted}
                  isSfxMuted={settings.isSfxMuted}
                  isHapticsEnabled={settings.isHapticsEnabled}
                  onToggleMusic={handleToggleMusic}
                  onToggleSfx={() => setSettings((prev) => ({ ...prev, isSfxMuted: !prev.isSfxMuted }))}
                  onToggleHaptics={() => setSettings((prev) => ({ ...prev, isHapticsEnabled: !prev.isHapticsEnabled }))}
                  onHowToPlay={() => {
                    window.alert("Tap groups of 2+ matching blocks to blast them. Build bigger groups to create boosters.");
                  }}
                  onResetProgress={resetProgress}
                  onClose={closeSettings}
                />
              ) : null}

              <div className="pointer-events-none absolute inset-0 z-40">
                <AnimatePresence>
                  {activeTargetFlies.map((item) => (
                    <motion.div
                      key={`${item.id}_${item.version}`}
                      className="absolute"
                      style={{ left: item.startX, top: item.startY, willChange: "transform, opacity" }}
                      initial={{ x: 0, y: 0, scale: 0.45, opacity: 0, rotate: 0 }}
                      animate={{
                        x: [0, (item.endX - item.startX) * 0.3, (item.endX - item.startX) * 0.82, item.endX - item.startX],
                        y: [0, item.arc * 0.56, item.arc, item.endY - item.startY],
                        scale: [0.45, 1, 0.8, 0.18],
                        opacity: [0, 1, 0.95, 0.08],
                        rotate: [0, item.spin * 0.42, item.spin],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.54, delay: item.delay, ease: CINEMATIC_EASE, times: [0, 0.26, 0.76, 1] }}
                    >
                      <span
                        className="absolute left-1/2 top-1/2 rounded-full"
                        style={{
                          width: item.size,
                          height: item.size,
                          transform: "translate(-50%, -50%)",
                          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, ${TOON_COLORS[item.color]} 38%, rgba(255,255,255,0) 100%)`,
                          boxShadow: `0 0 10px ${TOON_COLORS[item.color]}`,
                        }}
                      />
                      <span
                        className="absolute left-1/2 top-1/2 rounded-full"
                        style={{
                          width: item.size * 1.9,
                          height: item.size * 0.52,
                          transform: "translate(-92%, -50%)",
                          background: `linear-gradient(90deg, rgba(255,255,255,0), ${TOON_COLORS[item.color]}AA 72%, rgba(255,255,255,0.9) 100%)`,
                          filter: "blur(1px)",
                          opacity: 0.9,
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {activeSplinters.map((splinter) => (
                    <motion.span
                      key={`${splinter.id}_${splinter.version}`}
                      className="absolute block rounded-[2px]"
                      style={{
                        left: splinter.x,
                        top: splinter.y,
                        width: splinter.width,
                        height: splinter.height,
                        background: splinter.color,
                        boxShadow: `0 0 6px ${splinter.color}`,
                        willChange: "transform, opacity",
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                      animate={{ x: splinter.dx, y: splinter.dy, opacity: 0, rotate: splinter.rot, scale: 0.35 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.54, delay: splinter.delay, ease: CINEMATIC_EASE }}
                    />
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {rocketBombFx ? (
                    <motion.div
                      key="rocket-bomb-spectacle"
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-5xl"
                      style={{ left: rocketBombFx.x, top: rocketBombFx.y, textShadow: "0 0 18px rgba(255,211,45,0.95)" }}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: [0.75, 1.28, 1], opacity: [0, 1, 0.9] }}
                      exit={{ opacity: 0, scale: 1.15 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      ðŸš€ðŸ’£
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              </div>
              </motion.div>
              </motion.div>
              </div>
            </ImmersiveScreen>
          ) : null}
        </AnimatePresence>

        {showOutOfLives ? (
          <OutOfLivesPopup
            canAfford={canAffordLivesRefill}
            cost={ECONOMY.livesRefillCostCoins}
            onClose={() => setShowOutOfLives(false)}
            onBuy={handleBuyLivesRefill}
          />
        ) : null}
      </section>
    </main>
  );
}
```

## Global Styles

**Source File:** `src/index.css`

```css
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap");
@import "tailwindcss";

:root {
  --mania-font: "Fredoka", "Trebuchet MS", "Verdana", sans-serif;
  --mania-outline: rgba(255, 255, 255, 0.94);
  --mania-shadow: rgba(10, 19, 58, 0.42);
  --mania-glass-panel:
    linear-gradient(180deg, rgba(102, 166, 255, 0.22) 0%, rgba(29, 64, 175, 0.26) 44%, rgba(15, 23, 96, 0.34) 100%);
  --mania-glass-sheet:
    linear-gradient(180deg, rgba(86, 156, 255, 0.2) 0%, rgba(29, 78, 216, 0.24) 36%, rgba(15, 23, 96, 0.4) 100%);
  --mania-gold-button:
    linear-gradient(180deg, #fff6b6 0%, #ffe26c 36%, #ffc93b 68%, #ffb628 100%);
  --mania-cyan-button:
    linear-gradient(180deg, #9bf8ff 0%, #5fe1ff 34%, #2db4ff 68%, #1d7cff 100%);
  --mania-rose-button:
    linear-gradient(180deg, #ffb8d0 0%, #ff7fa9 36%, #ff5985 68%, #e73f73 100%);
  --mania-glass-button:
    linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%);
  --mania-amber-button:
    linear-gradient(180deg, #fff5bf 0%, #ffd96b 38%, #ffb244 70%, #f3871f 100%);
  --mania-amber-button-active:
    linear-gradient(180deg, #fff8cb 0%, #ffdf7f 34%, #ffbc52 68%, #fb9826 100%);
  --crystal-harbor-bg:
    radial-gradient(circle at 18% 14%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 22%),
    radial-gradient(circle at 80% 20%, rgba(255, 209, 209, 0.16) 0%, rgba(255, 209, 209, 0) 30%),
    radial-gradient(circle at 54% 72%, rgba(255, 88, 116, 0.18) 0%, rgba(255, 88, 116, 0) 36%),
    linear-gradient(180deg, #8b0000 0%, #e63946 100%);
  --crystal-glass: rgba(255, 255, 255, 0.15);
  --crystal-glass-strong: rgba(255, 255, 255, 0.18);
  --crystal-border: rgba(255, 255, 255, 0.5);
  --crystal-border-soft: rgba(255, 255, 255, 0.35);
  --crystal-text-primary: #ffffff;
  --crystal-text-secondary: #ffd1d1;
  --crystal-text-gold: #ffd1d1;
  --crystal-coins-bg: linear-gradient(180deg, #ffe082 0%, #ffc107 55%, #ff9800 100%);
  --crystal-lives-bg: linear-gradient(180deg, #ff79b0 0%, #ff4081 58%, #e91e63 100%);
  --crystal-play-bg: linear-gradient(45deg, #ffffff 0%, #e0e0e0 100%);
}

@keyframes mania-breathe {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes mania-glow-drift {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.04);
  }
  100% {
    filter: brightness(1);
  }
}

/* â”€â”€ Global Resets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
}

html {
  background: #8b0000;
}

/* Prevent iOS rubber-band scroll from breaking layout */
body {
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  background: var(--crystal-harbor-bg);
}

.mania-ui,
.mania-ui button,
.mania-ui input,
.mania-ui textarea {
  font-family: var(--mania-font);
}

.mania-ui :is(h1, h2, h3, h4, p, span, button) {
  letter-spacing: 0.015em;
  text-shadow: 0 5px 12px var(--mania-shadow);
  -webkit-font-smoothing: antialiased;
}

.mania-ui :is(p, span, button, label) {
  -webkit-text-stroke: 0.55px rgba(255, 255, 255, 0.6);
  paint-order: stroke fill;
}

.mania-title {
  letter-spacing: 0.015em;
  -webkit-text-stroke: 1.2px var(--mania-outline);
  paint-order: stroke fill;
  text-shadow: 0 8px 18px rgba(8, 19, 58, 0.48);
}

.mania-kicker {
  letter-spacing: 0.18em;
  -webkit-text-stroke: 0.82px rgba(255, 255, 255, 0.72);
  paint-order: stroke fill;
}

.mania-glass-card {
  background: var(--mania-glass-panel);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 10px 16px rgba(255, 255, 255, 0.04),
    0 16px 28px rgba(7, 13, 35, 0.22),
    0 0 18px rgba(125, 211, 252, 0.14);
  backdrop-filter: blur(14px) saturate(135%);
  -webkit-backdrop-filter: blur(14px) saturate(135%);
  animation: mania-breathe 5.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transform-origin: center;
}

.mania-overlay-backdrop {
  background:
    radial-gradient(circle at 50% 18%, rgba(166, 213, 255, 0.22) 0%, rgba(166, 213, 255, 0) 24%),
    linear-gradient(180deg, rgba(8, 18, 52, 0.22) 0%, rgba(8, 18, 52, 0.44) 100%);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
}

.mania-overlay-sheet {
  background: var(--mania-glass-sheet);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.26),
    0 24px 46px rgba(4, 9, 28, 0.32),
    0 0 26px rgba(125, 211, 252, 0.18);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
}

.mania-bubbly-button {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.74),
    inset 0 10px 16px rgba(255, 255, 255, 0.08),
    inset 0 -10px 0 rgba(20, 25, 62, 0.18),
    0 12px 18px rgba(9, 16, 43, 0.2);
  transition:
    transform 140ms ease,
    box-shadow 140ms ease,
    filter 140ms ease;
  animation:
    mania-breathe 3.8s cubic-bezier(0.45, 0, 0.55, 1) infinite,
    mania-glow-drift 3.8s ease-in-out infinite;
  transform-origin: center;
}

.mania-bubbly-button::before {
  content: "";
  position: absolute;
  inset: 3px 10% auto;
  height: 46%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.1) 56%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
  z-index: 0;
}

.mania-bubbly-button:hover {
  filter: brightness(1.03);
}

.mania-bubbly-button > * {
  position: relative;
  z-index: 1;
}

.mania-bubbly-button[data-tone="gold"] {
  background: var(--mania-gold-button);
  color: #111827;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.82),
    inset 0 11px 18px rgba(255, 255, 255, 0.12),
    inset 0 -10px 0 rgba(173, 109, 17, 0.22),
    0 14px 20px rgba(35, 28, 16, 0.24),
    0 0 20px rgba(255, 206, 86, 0.22);
}

.mania-bubbly-button[data-tone="cyan"] {
  background: var(--mania-cyan-button);
  color: #f8fbff;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.72),
    inset 0 12px 18px rgba(255, 255, 255, 0.08),
    inset 0 -10px 0 rgba(14, 87, 169, 0.22),
    0 14px 20px rgba(8, 21, 52, 0.24),
    0 0 18px rgba(110, 231, 255, 0.2);
}

.mania-bubbly-button[data-tone="rose"] {
  background: var(--mania-rose-button);
  color: #fff8fb;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.72),
    inset 0 12px 18px rgba(255, 255, 255, 0.08),
    inset 0 -10px 0 rgba(141, 25, 75, 0.2),
    0 14px 20px rgba(42, 10, 28, 0.24),
    0 0 18px rgba(255, 128, 168, 0.18);
}

.mania-bubbly-button[data-tone="glass"] {
  background: var(--mania-glass-button);
  color: #ffffff;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.48),
    inset 0 10px 14px rgba(255, 255, 255, 0.06),
    inset 0 -8px 0 rgba(9, 20, 58, 0.18),
    0 12px 18px rgba(8, 15, 42, 0.16);
}

.mania-bubbly-button[data-tone="amber"] {
  background: var(--mania-amber-button);
  color: #5a2f08;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.82),
    inset 0 11px 18px rgba(255, 255, 255, 0.1),
    inset 0 -10px 0 rgba(163, 91, 18, 0.24),
    0 14px 22px rgba(38, 19, 7, 0.24),
    0 0 18px rgba(255, 188, 82, 0.18);
}

.mania-fab {
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  animation-duration: 3.4s;
  aspect-ratio: 1 / 1;
}

.mania-dock-fab {
  background: var(--mania-amber-button);
  color: #5a2f08;
  border-color: rgba(255, 224, 139, 0.54);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.82),
    inset 0 10px 16px rgba(255, 255, 255, 0.1),
    inset 0 -10px 0 rgba(166, 92, 18, 0.26),
    0 15px 24px rgba(34, 18, 8, 0.24),
    0 0 18px rgba(255, 184, 71, 0.18);
}

.mania-dock-fab.is-active {
  background: var(--mania-amber-button-active);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.86),
    inset 0 -10px 0 rgba(179, 94, 18, 0.24),
    0 18px 26px rgba(36, 17, 7, 0.28),
    0 0 22px rgba(255, 208, 109, 0.32);
  filter: saturate(1.06) brightness(1.02);
}

.mania-dock-fab--center {
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.86),
    inset 0 -12px 0 rgba(179, 94, 18, 0.26),
    0 18px 28px rgba(36, 17, 7, 0.28),
    0 0 24px rgba(255, 208, 109, 0.28);
}

.mania-pregame-scrim {
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 28%),
    linear-gradient(180deg, rgba(5, 12, 34, 0.28) 0%, rgba(5, 12, 34, 0.42) 42%, rgba(5, 12, 34, 0.62) 100%);
  backdrop-filter: blur(12px) saturate(118%);
  -webkit-backdrop-filter: blur(12px) saturate(118%);
}

.mania-pregame-panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.08) 18%, rgba(14, 29, 88, 0.44) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    inset 0 14px 26px rgba(255, 255, 255, 0.04),
    0 36px 64px rgba(3, 10, 28, 0.46),
    0 0 32px rgba(125, 211, 252, 0.18);
  backdrop-filter: blur(24px) saturate(148%);
  -webkit-backdrop-filter: blur(24px) saturate(148%);
  isolation: isolate;
}

.mania-floating-hud {
  position: relative;
  filter: drop-shadow(0 10px 16px rgba(4, 10, 28, 0.18));
}

.mania-floating-hud::before {
  display: none;
}

.mania-floating-hud[data-layout="stacked"]::before {
  border-radius: 26px;
}

.mania-floating-pill {
  position: relative;
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  animation: mania-breathe 4.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transform-origin: center;
}

.mania-floating-pill--minimal {
  min-height: 42px;
}

.mania-map-stage {
  isolation: isolate;
  background-size: cover;
  background-position: center;
}

.mania-map-stage::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 20%),
    radial-gradient(circle at 84% 12%, rgba(125, 211, 252, 0.18) 0%, rgba(125, 211, 252, 0) 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 26%);
  pointer-events: none;
}

.mania-floating-icon {
  backdrop-filter: blur(16px) saturate(145%);
  -webkit-backdrop-filter: blur(16px) saturate(145%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 12px 20px rgba(7, 13, 35, 0.18);
  animation: mania-breathe 4.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  aspect-ratio: 1 / 1;
}

.mania-floating-playbar {
  background: linear-gradient(180deg, rgba(8, 35, 108, 0.46) 0%, rgba(6, 22, 67, 0.76) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 16px 28px rgba(4, 10, 28, 0.24);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  animation: mania-breathe 5.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.mania-floating-dock {
  background: linear-gradient(180deg, rgba(8, 35, 108, 0.26) 0%, rgba(6, 22, 67, 0.48) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 20px 32px rgba(4, 10, 28, 0.24);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  animation: mania-breathe 5.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.mania-floating-dock[data-layout="grid"] {
  align-items: center;
}

.mania-booster-button {
  aspect-ratio: 1 / 1;
  min-height: 104px;
}

.mania-booster-button.is-active {
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.84),
    inset 0 -10px 0 rgba(163, 91, 18, 0.24),
    0 18px 26px rgba(36, 17, 7, 0.24),
    0 0 24px rgba(255, 208, 109, 0.22);
}

.mania-node {
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.24),
    inset 0 -10px 0 rgba(8, 31, 88, 0.18),
    0 14px 20px rgba(8, 15, 42, 0.22);
}

.mania-node:not(.current-level) {
  animation: mania-breathe 4.1s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.mania-board-shell {
  background:
    radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(10, 19, 58, 0.12) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 12px 22px rgba(255, 255, 255, 0.04),
    inset 0 -18px 24px rgba(0, 0, 0, 0.24),
    0 16px 30px rgba(0, 0, 0, 0.35);
}

.mania-block-shell {
  isolation: isolate;
}

.mania-block-shell::before,
.mania-block-shell::after {
  content: "";
  position: absolute;
  pointer-events: none;
  z-index: 0;
}

.mania-color-block,
.mania-reward-block {
  border-radius: 8px;
}

.mania-color-block::before,
.mania-reward-block::before {
  inset: 3px 5px auto;
  height: 38%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.14) 52%, rgba(255, 255, 255, 0) 100%);
}

.mania-color-block::after,
.mania-reward-block::after {
  inset: auto 2px 2px;
  height: 38%;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(180deg, rgba(6, 10, 24, 0) 0%, rgba(6, 10, 24, 0.24) 100%);
}

.mania-color-block {
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.78),
    inset 0 -6px 0 rgba(20, 25, 62, 0.18),
    0 7px 12px rgba(9, 16, 43, 0.22);
}

.mania-reward-block {
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.82),
    inset 0 -6px 0 rgba(44, 24, 4, 0.16),
    0 8px 12px rgba(9, 16, 43, 0.24);
}

.mania-svg-block {
  box-shadow: 0 8px 12px rgba(9, 16, 43, 0.12);
}

.block-svg-idle {
  animation: mania-breathe var(--float-dur, 2s) ease-in-out var(--float-delay, 0s) infinite;
  will-change: transform;
}

.mania-toggle-button {
  border-radius: 999px;
  overflow: hidden;
}

.mania-toggle-track {
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 8px 14px rgba(7, 13, 35, 0.16);
}

.mania-current-pill {
  background: linear-gradient(180deg, rgba(184, 249, 255, 0.34) 0%, rgba(80, 169, 255, 0.22) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 0 12px rgba(110, 231, 255, 0.22);
}

main:has(> section > .relative.z-10.h-full.min-h-0) {
  width: 100%;
  min-height: 100dvh;
  background: var(--crystal-harbor-bg) !important;
}

.scrollable-map__viewport {
  width: 100%;
  max-width: none;
  margin-left: 0;
  margin-right: 0;
  box-sizing: border-box;
  overflow: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 26%),
    linear-gradient(180deg, rgba(18, 91, 198, 0.2) 0%, rgba(10, 48, 114, 0.28) 38%, rgba(7, 23, 69, 0.52) 100%);
}

.scrollable-map__viewport::-webkit-scrollbar {
  display: none;
}

main > section:has(> .relative.z-10.h-full.min-h-0) .relative.z-30.px-4.pb-4.pt-3 > div:has(> .scrollable-map__viewport) {
  width: 100% !important;
  max-width: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box;
}

main > section:has(> .relative.z-10.h-full.min-h-0) .episode-progress-shell,
main > section:has(> .relative.z-10.h-full.min-h-0) .scrollable-map-shell,
main > section:has(> .relative.z-10.h-full.min-h-0) .scrollable-map-shell .scrollable-map__viewport {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  box-shadow:
    0 18px 34px rgba(0, 0, 0, 0.18),
    0 0 22px rgba(255, 255, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

@keyframes current-level-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.24), 0 0 16px rgba(255, 255, 255, 0.36);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.16), 0 0 28px rgba(217, 4, 41, 0.44);
    transform: scale(1.06);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.24), 0 0 16px rgba(255, 255, 255, 0.36);
    transform: scale(1);
  }
}

.current-level {
  animation:
    current-level-pulse 1.8s ease-in-out infinite,
    play-level-breathe 2.4s ease-in-out infinite;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.52), 0 0 16px rgba(255, 255, 255, 0.38);
}

main > section:has(> .relative.z-10.h-full.min-h-0) {
  width: 100% !important;
  max-width: 480px !important;
  height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
  margin: 0 auto !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  position: relative !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) > .relative.z-10.h-full.min-h-0 {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

@keyframes play-level-breathe {
  0% {
    transform: scale(1);
    box-shadow:
      0 12px 22px rgba(0, 0, 0, 0.26),
      0 0 0 rgba(255, 255, 255, 0),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: scale(1.035);
    box-shadow:
      0 20px 34px rgba(0, 0, 0, 0.34),
      0 0 24px rgba(255, 255, 255, 0.56),
      0 0 34px rgba(255, 255, 255, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow:
      0 12px 22px rgba(0, 0, 0, 0.26),
      0 0 0 rgba(255, 255, 255, 0),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

@keyframes play-level-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

main > section:has(> .relative.z-10.h-full.min-h-0) .relative.z-30.px-4.pb-4.pt-3 > button {
  border: none !important;
  background: var(--crystal-play-bg) !important;
  background-size: 220% 220% !important;
  color: #d90429 !important;
  font-weight: 900 !important;
  font-size: 1.2rem !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase;
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.2) !important;
  box-shadow:
    0 4px 15px rgba(255, 255, 255, 0.6),
    0 0 28px rgba(255, 255, 255, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.32) !important;
  animation:
    play-level-breathe 2.2s ease-in-out infinite,
    play-level-gradient 4.5s ease-in-out infinite !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) header.mb-3.rounded-\[28px\],
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[34px\].border.text-white,
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[26px\].border.p-3,
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[20px\].border.px-3,
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-full.border.px-3.py-1\.5,
main > section:has(> .relative.z-10.h-full.min-h-0) .scrollable-map__viewport,
main > section:has(> .relative.z-10.h-full.min-h-0) .relative.z-30.px-4.pb-4.pt-3 > div:has(> .scrollable-map__viewport),
body #root [class*="z-[400]"] .rounded-\[34px\].border.text-white {
  background: var(--crystal-glass) !important;
  border-color: var(--crystal-border) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    0 18px 34px rgba(0, 0, 0, 0.22),
    0 0 22px rgba(255, 255, 255, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) header.mb-3.rounded-\[28px\] {
  border: 1px solid var(--crystal-border);
}

main > section:has(> .relative.z-10.h-full.min-h-0) header.mb-3.rounded-\[28px\] > div > div:nth-child(1) {
  background: var(--crystal-coins-bg) !important;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.72),
    inset 0 -10px 0 rgba(173, 109, 17, 0.36),
    0 8px 0 rgba(156, 95, 15, 0.45),
    0 0 22px rgba(255, 193, 7, 0.48) !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) header.mb-3.rounded-\[28px\] > div > div:nth-child(2) {
  background: var(--crystal-lives-bg) !important;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.72),
    inset 0 -10px 0 rgba(132, 18, 50, 0.35),
    0 8px 0 rgba(120, 16, 45, 0.45),
    0 0 22px rgba(255, 64, 129, 0.38) !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) h1,
main > section:has(> .relative.z-10.h-full.min-h-0) h2,
main > section:has(> .relative.z-10.h-full.min-h-0) .tabular-nums,
main > section:has(> .relative.z-10.h-full.min-h-0) .scrollable-map__viewport button span:first-child,
body #root [class*="z-[400]"] h2 {
  color: var(--crystal-text-primary) !important;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.35) !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) header.mb-3.rounded-\[28px\] p.text-\[10px\],
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[26px\].border.p-3 > div:first-child span,
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[20px\].border.px-3 p:first-child,
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-full.border.px-3.py-1\.5 p:first-child,
main > section:has(> .relative.z-10.h-full.min-h-0) p.text-\[10px\].font-black.uppercase,
body #root [class*="z-[400]"] p.text-\[10px\].font-black.uppercase {
  color: var(--crystal-text-secondary) !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
}

main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[34px\].border.text-white p.text-\[13px\],
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[34px\].border.text-white p.text-\[12px\],
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[34px\].border.text-white p.text-\[11px\],
main > section:has(> .relative.z-10.h-full.min-h-0) .rounded-\[26px\].border.p-3 p:last-child,
body #root [class*="z-[400]"] p.text-sm.font-semibold {
  color: var(--crystal-text-primary) !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) .scrollable-map__viewport button {
  background: linear-gradient(180deg, rgba(132, 10, 24, 0.92) 0%, rgba(84, 5, 17, 0.98) 100%) !important;
  border-color: rgba(255, 255, 255, 0.42) !important;
  box-shadow:
    0 10px 16px rgba(0, 0, 0, 0.28),
    0 0 16px rgba(255, 255, 255, 0.12) !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) .scrollable-map__viewport svg path:first-of-type {
  stroke: rgba(255, 255, 255, 0.18) !important;
}

main > section:has(> .relative.z-10.h-full.min-h-0) .scrollable-map__viewport svg path:last-of-type {
  stroke: rgba(255, 240, 240, 0.86) !important;
}

body #root [class*="z-[400]"] {
  background: rgba(80, 0, 10, 0.78) !important;
}

@keyframes game-shake {
  0% {
    transform: translate3d(0, 0, 0);
  }
  25% {
    transform: translate3d(-3px, 1px, 0);
  }
  50% {
    transform: translate3d(3px, -1px, 0);
  }
  75% {
    transform: translate3d(-2px, 1px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

.game-shake {
  animation: game-shake 220ms linear;
}

@keyframes game-shake-heavy {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  15% {
    transform: translate3d(-8px, 3px, 0) scale(1.005);
  }
  30% {
    transform: translate3d(9px, -4px, 0) scale(1.005);
  }
  45% {
    transform: translate3d(-10px, 2px, 0) scale(1.006);
  }
  60% {
    transform: translate3d(8px, -3px, 0) scale(1.003);
  }
  75% {
    transform: translate3d(-6px, 2px, 0) scale(1.001);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.game-shake-heavy {
  animation: game-shake-heavy 300ms linear;
}

@keyframes game-shake-mega {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  12% {
    transform: translate3d(-14px, 5px, 0) scale(1.01);
  }
  24% {
    transform: translate3d(15px, -6px, 0) scale(1.01);
  }
  36% {
    transform: translate3d(-16px, 5px, 0) scale(1.013);
  }
  48% {
    transform: translate3d(14px, -5px, 0) scale(1.01);
  }
  60% {
    transform: translate3d(-11px, 4px, 0) scale(1.008);
  }
  72% {
    transform: translate3d(9px, -3px, 0) scale(1.005);
  }
  84% {
    transform: translate3d(-6px, 2px, 0) scale(1.003);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.game-shake-mega {
  animation: game-shake-mega 380ms linear;
}

@keyframes game-shake-grand_slam {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  10% { transform: translate3d(-20px, 8px, 0) scale(1.02); }
  20% { transform: translate3d(22px, -10px, 0) scale(1.02); }
  30% { transform: translate3d(-24px, 8px, 0) scale(1.03); }
  40% { transform: translate3d(20px, -8px, 0) scale(1.02); }
  50% { transform: translate3d(-16px, 6px, 0) scale(1.015); }
  60% { transform: translate3d(14px, -5px, 0) scale(1.01); }
  70% { transform: translate3d(-10px, 4px, 0) scale(1.008); }
  80% { transform: translate3d(8px, -3px, 0) scale(1.005); }
  90% { transform: translate3d(-4px, 2px, 0) scale(1.002); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}

.game-shake-grand_slam {
  animation: game-shake-grand_slam 450ms linear;
}

/* â”€â”€ Fever Mode â€” board background pulse â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@keyframes fever-board-pulse {
  0%   { box-shadow: 0 0 0px rgba(255,211,45,0), inset 0 10px 20px rgba(255,255,255,0.08), inset 0 -18px 24px rgba(0,0,0,0.22), 0 16px 30px rgba(0,0,0,0.35); }
  30%  { box-shadow: 0 0 32px rgba(255,140,0,0.6), 0 0 64px rgba(255,211,45,0.35), inset 0 10px 20px rgba(255,211,45,0.12), inset 0 -18px 24px rgba(0,0,0,0.22), 0 16px 30px rgba(0,0,0,0.35); }
  60%  { box-shadow: 0 0 20px rgba(255,80,0,0.5), 0 0 40px rgba(255,50,0,0.25), inset 0 10px 20px rgba(255,100,0,0.1), inset 0 -18px 24px rgba(0,0,0,0.22), 0 16px 30px rgba(0,0,0,0.35); }
  100% { box-shadow: 0 0 0px rgba(255,211,45,0), inset 0 10px 20px rgba(255,255,255,0.08), inset 0 -18px 24px rgba(0,0,0,0.22), 0 16px 30px rgba(0,0,0,0.35); }
}

.fever-board-glow {
  animation: fever-board-pulse 0.8s ease-in-out infinite;
}

/* â”€â”€ Fever Mode â€” happy bouncing blocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@keyframes fever-block-jump {
  0%   { transform: translateY(0) scaleX(1) scaleY(1); }
  25%  { transform: translateY(-4px) scaleX(0.95) scaleY(1.06); }
  50%  { transform: translateY(0) scaleX(1.04) scaleY(0.97); }
  75%  { transform: translateY(-2px) scaleX(0.97) scaleY(1.03); }
  100% { transform: translateY(0) scaleX(1) scaleY(1); }
}

.fever-block-happy {
  animation: fever-block-jump 0.7s ease-in-out infinite;
}

/* â”€â”€ Fever Mode â€” game container glow border â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@keyframes fever-container-glow {
  0%   { border-color: rgba(255,255,255,0.2); }
  40%  { border-color: rgba(255,211,45,0.8); }
  70%  { border-color: rgba(255,100,0,0.7); }
  100% { border-color: rgba(255,255,255,0.2); }
}

.fever-container {
  animation: fever-container-glow 0.9s ease-in-out infinite;
}

/* â”€â”€ Fever Mode â€” main background golden shift â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@keyframes fever-bg-shift {
  0%   { opacity: 0; }
  50%  { opacity: 1; }
  100% { opacity: 0; }
}

.fever-bg-layer {
  animation: fever-bg-shift 1.2s ease-in-out infinite;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ALIVE BLOCKS â€” Idle wave animations (pure CSS, no per-block JS)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* Float: gentle scale-up/down breathing */
@keyframes block-float {
  0%   { transform: scale(1)    translateY(0px)   rotate(0deg);   }
  30%  { transform: scale(1.028) translateY(-1.5px) rotate(0.4deg); }
  60%  { transform: scale(0.984) translateY(0.8px)  rotate(-0.3deg); }
  85%  { transform: scale(1.014) translateY(-0.6px) rotate(0.2deg); }
  100% { transform: scale(1)    translateY(0px)   rotate(0deg);   }
}

/* Matchable pulse â€” slightly faster + bigger for hintable groups */
@keyframes block-matchable-pulse {
  0%   { transform: scale(1)     translateY(0px);   }
  35%  { transform: scale(1.045) translateY(-2px);  }
  65%  { transform: scale(0.978) translateY(0.5px); }
  100% { transform: scale(1)     translateY(0px);   }
}

/* Fear jitter â€” triggered on hover via a CSS class toggled in React */
@keyframes block-fear-jitter {
  0%   { transform: scale(0.91) rotate(-1.5deg); }
  20%  { transform: scale(0.89) rotate( 1.8deg); }
  40%  { transform: scale(0.90) rotate(-1.2deg); }
  60%  { transform: scale(0.89) rotate( 1.5deg); }
  80%  { transform: scale(0.91) rotate(-1deg);   }
  100% { transform: scale(0.90) rotate( 0deg);   }
}

/* Classes applied in JSX */
.block-idle {
  animation: block-float var(--float-dur, 2s) ease-in-out
             var(--float-delay, 0s) infinite;
  will-change: transform;
}

.block-matchable {
  animation: block-matchable-pulse var(--float-dur, 1.5s) ease-in-out
             var(--float-delay, 0s) infinite;
  will-change: transform;
}

.block-fear {
  animation: block-fear-jitter 0.11s linear infinite !important;
  will-change: transform;
}

/* Fever override â€” happy jump wins over idle float */
.fever-block-happy {
  animation: fever-block-jump 0.7s ease-in-out infinite !important;
}

/* â”€â”€ Eye directions (CSS-only, no extra DOM) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Pupils shift up on hover to show "surprise/fear" look.
   We use a CSS variable set by the parent .block-fear class wrapper.        */
.block-eye-fear {
  transform: translateY(-1.5px);
  transition: transform 80ms ease-out;
}

.block-eye-normal {
  transform: translateY(0);
  transition: transform 120ms ease-in;
}

/* â”€â”€ Fever star-eye â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.block-eye-star::before {
  content: "â˜…";
  font-size: 5px;
  color: rgba(0,0,0,0.45);
  line-height: 1;
}
```

## Page: Bonus Loot Popup

**Source File:** `src/components/BonusLootPopup.tsx`

```tsx
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";
import type { BonusLoot } from "../game/types";

interface BonusLootPopupProps {
  loot: BonusLoot;
  levelId: number;
  onContinue: () => void;
  hasNextLevel?: boolean;
  onNextLevel?: () => void;
}

function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(motionValue, value, {
        duration: 1.2,
        ease: "easeOut",
        onUpdate: (v) => setDisplayValue(Math.floor(v)),
      });
      return () => controls.stop();
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay, motionValue]);

  return <span>{displayValue}</span>;
}

export function BonusLootPopup({ loot, levelId, onContinue, hasNextLevel = false, onNextLevel }: BonusLootPopupProps) {
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowItems(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const hasLoot = loot.coins > 0 || loot.lives > 0 || loot.rockets > 0 || loot.hammers > 0;

  const lootItems = [
    { icon: "ðŸª™", label: "Coins", value: loot.coins, color: "#FFD700" },
    { icon: "â¤ï¸", label: "Lives", value: loot.lives, color: "#FF4848" },
    { icon: "ðŸš€", label: "Rockets", value: loot.rockets, color: "#2D9CFF" },
    { icon: "ðŸ”¨", label: "Hammers", value: loot.hammers, color: "#9D50FF" },
  ].filter((item) => item.value > 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9000,
          background: "rgba(0, 0, 0, 0.80)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
          borderRadius: "inherit",
        }}
      >
        <motion.div
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          style={{
            background: "linear-gradient(145deg, #2E1065, #4C1D95, #6D28D9)",
            borderRadius: "22px",
            padding: "14px 12px 10px",
            width: "min(86vw, 300px)",
            maxHeight: "68dvh",
            textAlign: "center",
            boxShadow: "0 0 60px rgba(147, 51, 234, 0.5), 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            border: "3px solid rgba(255, 215, 0, 0.6)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sparkle background effect */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 30% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflowY: "auto",
              padding: "2px 4px 0",
            }}
          >
            {/* Treasure chest icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              style={{
                fontSize: "36px",
                marginBottom: "6px",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              }}
            >
              ðŸŽ
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                color: "#FFD700",
                fontSize: "17px",
                fontWeight: 900,
                textShadow: "0 2px 10px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3)",
                marginBottom: "4px",
                letterSpacing: "1px",
              }}
            >
              TREASURE RUSH!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "12px",
                marginBottom: "10px",
              }}
            >
              Bonus Level {levelId} Complete!
            </motion.p>

            {hasLoot && showItems ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {lootItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ scale: 0, y: 14 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: 0.4 + index * 0.1,
                    }}
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "10px",
                      padding: "8px 6px",
                      border: `2px solid ${item.color}40`,
                      boxShadow: `0 0 18px ${item.color}20`,
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.45, delay: 0.8 + index * 0.1, ease: "easeOut" }}
                      style={{
                        fontSize: "20px",
                        marginBottom: "3px",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    <div
                      style={{
                        color: item.color,
                        fontSize: "16px",
                        fontWeight: 800,
                        textShadow: `0 0 10px ${item.color}50`,
                      }}
                    >
                      +<AnimatedCounter value={item.value} delay={700 + index * 120} />
                    </div>
                    <div
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "9px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginTop: "3px",
                      }}
                    >
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : null}

            {!hasLoot ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                color: "rgba(255, 255, 255, 0.75)",
                fontSize: "12px",
                marginBottom: "10px",
                }}
              >
                Keep playing to collect more treasures!
              </motion.p>
            ) : null}
          </div>

          {/* Always-visible CTA footer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            style={{
              marginTop: "6px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(255,255,255,0.18)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ display: "grid", gap: "6px" }}>
              {hasNextLevel && onNextLevel ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onNextLevel}
                  style={{
                    background: "linear-gradient(180deg, #38BDF8 0%, #2563EB 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 4px 0 #1D4ED8, 0 8px 18px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                  }}
                >
                  Next Level
                </motion.button>
              ) : null}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onContinue}
                style={{
                  background: "linear-gradient(180deg, #22C55E 0%, #16A34A 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 4px 0 #15803D, 0 8px 18px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                }}
              >
                Claim Rewards
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

## Component: Mobile / Capacitor Guide

**Source File:** `src/components/CapacitorGuide.tsx`

```tsx
/**
 * Capacitor.js Native Wrapper Guide
 * Complete step-by-step instructions for wrapping the web game for iOS and Android
 */

import { motion } from "framer-motion";

type CapacitorGuideProps = {
  onClose: () => void;
};

export function CapacitorGuide({ onClose }: CapacitorGuideProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">ðŸ“± Native App Deployment Guide</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 text-sm text-white/90">
          {/* Prerequisites */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">ðŸ“‹ Prerequisites</h3>
            <ul className="ml-4 list-disc space-y-1 text-white/80">
              <li>Node.js 18+ installed</li>
              <li>npm or yarn package manager</li>
              <li>For iOS: macOS with Xcode 14+ and CocoaPods</li>
              <li>For Android: Android Studio with SDK 33+</li>
              <li>Apple Developer account (for iOS App Store)</li>
              <li>Google Play Developer account (for Play Store)</li>
            </ul>
          </section>

          {/* Step 1: Install Capacitor */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">Step 1: Install Capacitor</h3>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs">
              <p className="text-green-400"># Install Capacitor core and CLI</p>
              <p>npm install @capacitor/core @capacitor/cli</p>
              <br />
              <p className="text-green-400"># Initialize Capacitor in your project</p>
              <p>npx cap init "Toon Blast Clone" "com.yourcompany.toonblast"</p>
            </div>
          </section>

          {/* Step 2: Configure capacitor.config.ts */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">Step 2: Configure capacitor.config.ts</h3>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-yellow-300">{`import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.toonblast',
  appName: 'Toon Blast Clone',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#4a4cc6',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4a4cc6',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  },
  // Lock to portrait orientation
  android: {
    allowMixedContent: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;`}</pre>
            </div>
          </section>

          {/* Step 3: Add Platforms */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">Step 3: Add Native Platforms</h3>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs">
              <p className="text-green-400"># Build your web app first</p>
              <p>npm run build</p>
              <br />
              <p className="text-green-400"># Add Android platform</p>
              <p>npm install @capacitor/android</p>
              <p>npx cap add android</p>
              <br />
              <p className="text-green-400"># Add iOS platform</p>
              <p>npm install @capacitor/ios</p>
              <p>npx cap add ios</p>
            </div>
          </section>

          {/* Step 4: Install Essential Plugins */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">Step 4: Install Essential Plugins</h3>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs">
              <p className="text-green-400"># Status bar control</p>
              <p>npm install @capacitor/status-bar</p>
              <br />
              <p className="text-green-400"># Splash screen</p>
              <p>npm install @capacitor/splash-screen</p>
              <br />
              <p className="text-green-400"># Haptic feedback (native vibration)</p>
              <p>npm install @capacitor/haptics</p>
              <br />
              <p className="text-green-400"># Local storage (persistent)</p>
              <p>npm install @capacitor/preferences</p>
              <br />
              <p className="text-green-400"># Screen orientation lock</p>
              <p>npm install @capacitor/screen-orientation</p>
            </div>
          </section>

          {/* Step 5: Lock Screen Orientation */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">Step 5: Lock Portrait Orientation</h3>
            
            <p className="mb-2 text-white/70">For Android, edit <code className="text-yellow-300">android/app/src/main/AndroidManifest.xml</code>:</p>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-yellow-300">{`<activity
  android:name=".MainActivity"
  android:screenOrientation="portrait"
  android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
  ...
/>`}</pre>
            </div>

            <p className="mb-2 mt-4 text-white/70">For iOS, edit <code className="text-yellow-300">ios/App/App/Info.plist</code>:</p>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-yellow-300">{`<key>UISupportedInterfaceOrientations</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
</array>
<key>UISupportedInterfaceOrientations~ipad</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
</array>`}</pre>
            </div>
          </section>

          {/* Step 6: Hide Status Bar */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">Step 6: Hide Status Bar (Full Screen)</h3>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-yellow-300">{`// In your App.tsx or main entry point
import { StatusBar, Style } from '@capacitor/status-bar';

// Hide status bar for immersive gameplay
async function setupStatusBar() {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.hide();
  } catch (error) {
    // Web fallback - no-op
  }
}

// Call on app mount
useEffect(() => {
  setupStatusBar();
}, []);`}</pre>
            </div>
          </section>

          {/* Step 7: Build & Run */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">Step 7: Build & Run</h3>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs">
              <p className="text-green-400"># Build web assets and sync to native</p>
              <p>npm run build</p>
              <p>npx cap sync</p>
              <br />
              <p className="text-green-400"># Open in Android Studio</p>
              <p>npx cap open android</p>
              <br />
              <p className="text-green-400"># Open in Xcode</p>
              <p>npx cap open ios</p>
              <br />
              <p className="text-green-400"># Live reload during development</p>
              <p>npx cap run android --livereload --external</p>
              <p>npx cap run ios --livereload --external</p>
            </div>
          </section>

          {/* Step 8: Production Build */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">Step 8: Production Build</h3>
            
            <p className="mb-2 font-semibold text-orange-400">For Android (APK/AAB):</p>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs">
              <p className="text-green-400"># Generate signed release bundle</p>
              <p>cd android</p>
              <p>./gradlew bundleRelease</p>
              <p># Output: android/app/build/outputs/bundle/release/app-release.aab</p>
            </div>

            <p className="mb-2 mt-4 font-semibold text-orange-400">For iOS:</p>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs">
              <p className="text-green-400"># In Xcode:</p>
              <p>1. Select "Any iOS Device" as target</p>
              <p>2. Product â†’ Archive</p>
              <p>3. Window â†’ Organizer â†’ Distribute App</p>
              <p>4. Select "App Store Connect" for submission</p>
            </div>
          </section>

          {/* App Store Checklist */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">ðŸ“ App Store Checklist</h3>
            <div className="rounded-lg bg-black/40 p-3">
              <ul className="ml-4 list-disc space-y-1 text-white/80 text-xs">
                <li>âœ… App icons (all required sizes)</li>
                <li>âœ… Splash screens (all required sizes)</li>
                <li>âœ… Privacy policy URL</li>
                <li>âœ… Screenshots (phone + tablet)</li>
                <li>âœ… App description and keywords</li>
                <li>âœ… Age rating questionnaire</li>
                <li>âœ… In-app purchase setup (if applicable)</li>
                <li>âœ… Test on real devices before submission</li>
              </ul>
            </div>
          </section>

          {/* Useful Commands */}
          <section>
            <h3 className="mb-2 text-lg font-bold text-cyan-400">ðŸ”§ Useful Commands Reference</h3>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-xs">
              <p><span className="text-cyan-400">npx cap sync</span> - Sync web build to native projects</p>
              <p><span className="text-cyan-400">npx cap copy</span> - Copy web assets only (faster)</p>
              <p><span className="text-cyan-400">npx cap update</span> - Update native plugins</p>
              <p><span className="text-cyan-400">npx cap doctor</span> - Check environment setup</p>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

## Component: Confetti System

**Source File:** `src/components/ConfettiSystem.tsx`

```tsx
/**
 * ConfettiSystem â€” Full-screen confetti explosion for Level Win
 * Self-contained, mounts on win and auto-removes after animation completes.
 * Uses pure CSS + Framer Motion for performance.
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

const CONFETTI_COUNT = 80;

const SHAPES = ["square", "rectangle", "circle", "star"] as const;
type Shape = (typeof SHAPES)[number];

const COLORS = [
  "#FF4848", "#2D9CFF", "#47D35B", "#FFD32D", "#9D50FF",
  "#FF9F43", "#FF6B9D", "#00D2D3", "#FFEAA7", "#A29BFE",
  "#FD79A8", "#55EFC4", "#FDCB6E", "#74B9FF",
];

type Piece = {
  id: number;
  x: number;       // % from left
  delay: number;   // seconds
  duration: number;
  color: string;
  shape: Shape;
  size: number;
  rotateEnd: number;
  driftX: number;  // px horizontal drift
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function ConfettiSystem() {
  const pieces = useMemo<Piece[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      delay: randomBetween(0, 0.9),
      duration: randomBetween(1.6, 3.2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: randomBetween(6, 14),
      rotateEnd: randomBetween(-360, 360),
      driftX: randomBetween(-80, 80),
    }));
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
          }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: typeof window !== "undefined" ? window.innerHeight + 40 : 900,
            x: piece.driftX,
            rotate: piece.rotateEnd,
            opacity: [1, 1, 1, 0.8, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: [0.1, 0.4, 0.7, 1.0],
          }}
        >
          <ConfettiShape shape={piece.shape} size={piece.size} color={piece.color} />
        </motion.div>
      ))}
    </div>
  );
}

function ConfettiShape({ shape, size, color }: { shape: Shape; size: number; color: string }) {
  if (shape === "circle") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 4px ${color}88`,
        }}
      />
    );
  }
  if (shape === "rectangle") {
    return (
      <div
        style={{
          width: size * 2,
          height: size * 0.6,
          borderRadius: 2,
          background: color,
        }}
      />
    );
  }
  if (shape === "star") {
    return (
      <span
        style={{
          fontSize: size + 2,
          color,
          lineHeight: 1,
          textShadow: `0 0 6px ${color}`,
          display: "block",
        }}
      >
        â˜…
      </span>
    );
  }
  // square (default)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        background: color,
        boxShadow: `0 0 4px ${color}66`,
      }}
    />
  );
}
```

## Page: Daily Lucky Spin

**Source File:** `src/components/DailyWheelModal.tsx`

```tsx
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { DAILY_WHEEL_SEGMENTS } from "../game/metaProgression";
import type { DailyWheelSegment, RewardBundle } from "../game/types";

type DailyWheelModalProps = {
  canSpin: boolean;
  onClose: () => void;
  onSpin: () => DailyWheelSegment | null;
};

const EMPTY_REWARD: RewardBundle = {
  coins: 0,
  lives: 0,
  hammer: 0,
  glove: 0,
  shuffle: 0,
  unlimitedLivesMinutes: 0,
};

const SPIN_DURATION_MS = 2500;

function buildRewardLines(reward: RewardBundle) {
  return [
    reward.coins > 0 ? { label: "Coins", value: `+${reward.coins}` } : null,
    reward.lives > 0 ? { label: "Lives", value: `+${reward.lives}` } : null,
    reward.hammer > 0 ? { label: "Hammer", value: `+${reward.hammer}` } : null,
    reward.glove > 0 ? { label: "Glove", value: `+${reward.glove}` } : null,
    reward.shuffle > 0 ? { label: "Shuffle", value: `+${reward.shuffle}` } : null,
    reward.unlimitedLivesMinutes > 0 ? { label: "Unlimited", value: `${reward.unlimitedLivesMinutes}m` } : null,
  ].filter((line): line is { label: string; value: string } => line !== null);
}

export function DailyWheelModal({ canSpin, onClose, onSpin }: DailyWheelModalProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<DailyWheelSegment | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
    },
    [],
  );

  const wheelGradient = useMemo(() => {
    const segmentAngle = 360 / DAILY_WHEEL_SEGMENTS.length;

    return `conic-gradient(${DAILY_WHEEL_SEGMENTS.map(
      (segment, index) =>
        `${segment.accent} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`,
    ).join(", ")})`;
  }, []);

  const rewardLines = useMemo(() => buildRewardLines(result?.reward ?? EMPTY_REWARD), [result]);

  const handleSpin = () => {
    if (!canSpin || spinning || result) {
      return;
    }

    const nextSegment = onSpin();
    if (!nextSegment) {
      return;
    }

    const segmentAngle = 360 / DAILY_WHEEL_SEGMENTS.length;
    const segmentIndex = DAILY_WHEEL_SEGMENTS.findIndex((segment) => segment.id === nextSegment.id);
    const targetAngle = 360 - (segmentIndex * segmentAngle + segmentAngle / 2);

    setSpinning(true);
    setRotation(2160 + targetAngle);
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }
    revealTimerRef.current = window.setTimeout(() => {
      setResult(nextSegment);
      setSpinning(false);
    }, SPIN_DURATION_MS);
  };

  return (
    <div className="fixed inset-0 z-[9100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.76, opacity: 0, y: 32 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="relative w-full max-w-[348px] overflow-hidden rounded-[32px] border border-white/18 p-5 text-white"
        style={{
          background: "linear-gradient(180deg, rgba(17,52,130,0.98) 0%, rgba(10,31,88,0.98) 52%, rgba(7,20,56,0.99) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 28px 52px rgba(0,0,0,0.3)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-5 h-28 w-28 rounded-full bg-cyan-300/18 blur-3xl" />
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-200/12 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/62">Daily Reward</p>
              <h2 className="mt-2 text-[28px] font-black leading-none">Free Spin Wheel</h2>
              <p className="mt-2 max-w-[220px] text-[12px] font-semibold leading-5 text-white/68">
                Spin once every 24 hours to pull coins, unlimited lives, or fresh boosters for the next level push.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/74"
            >
              Close
            </button>
          </div>

          <div className="relative mx-auto mt-5 flex h-[256px] w-[256px] items-center justify-center">
            <div className="absolute left-1/2 top-1 h-0 w-0 -translate-x-1/2 border-x-[12px] border-b-[20px] border-x-transparent border-b-[#fff1a6] drop-shadow-[0_6px_10px_rgba(0,0,0,0.24)]" />

            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: SPIN_DURATION_MS / 1000, ease: [0.12, 0.92, 0.24, 1] }}
              className="relative h-[228px] w-[228px] rounded-full border border-white/16"
              style={{
                background: wheelGradient,
                boxShadow: "inset 0 4px 0 rgba(255,255,255,0.18), 0 22px 28px rgba(0,0,0,0.28), 0 0 26px rgba(125,211,252,0.14)",
              }}
            >
              <div className="absolute inset-[18px] rounded-full border border-white/16 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.04)_48%,rgba(0,0,0,0.12)_100%)]" />
              <div className="absolute inset-[68px] grid place-items-center rounded-full border border-white/18 bg-[linear-gradient(180deg,rgba(12,24,56,0.96)_0%,rgba(8,16,38,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_18px_rgba(0,0,0,0.24)]">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/46">
                    {spinning ? "Rolling" : result ? "Won" : canSpin ? "Ready" : "Tomorrow"}
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {spinning ? "..." : result ? result.label : canSpin ? "SPIN" : "DONE"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {DAILY_WHEEL_SEGMENTS.map((segment) => {
              const isActive = result?.id === segment.id;

              return (
                <div
                  key={segment.id}
                  className="rounded-[18px] border px-3 py-2"
                  style={{
                    borderColor: isActive ? `${segment.accent}80` : "rgba(255,255,255,0.12)",
                    background: isActive
                      ? `linear-gradient(180deg, ${segment.accent}24 0%, rgba(255,255,255,0.06) 100%)`
                      : "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                    boxShadow: isActive ? `0 0 20px ${segment.glow}` : "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/48">Wheel Slot</p>
                  <p className="mt-1 text-sm font-black text-white">{segment.label}</p>
                </div>
              );
            })}
          </div>

          {result ? (
            <div className="mt-4 rounded-[22px] border border-white/12 bg-white/8 px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/48">Today&apos;s Drop</p>
              <p className="mt-1 text-lg font-black text-white">{result.label}</p>
              <p className="mt-1 text-[11px] font-semibold text-white/62">Reward was added to your stash right away.</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {rewardLines.map((line) => (
                  <div
                    key={line.label}
                    className="rounded-[16px] border border-white/10 bg-white/8 px-3 py-2"
                    style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
                  >
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/46">{line.label}</p>
                    <p className="mt-1 text-sm font-black text-white">{line.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!result ? (
            <button
              type="button"
              onClick={handleSpin}
              disabled={!canSpin || spinning}
              className="mt-5 w-full rounded-[22px] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 disabled:cursor-default disabled:text-slate-900/70"
              style={{
                background: canSpin
                  ? "linear-gradient(180deg, #fff1a6 0%, #ffd44f 52%, #ffb92f 100%)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.14) 100%)",
                boxShadow: canSpin
                  ? "inset 0 2px 0 rgba(255,255,255,0.7), inset 0 -10px 0 rgba(173,109,17,0.28), 0 12px 20px rgba(0,0,0,0.22)"
                  : "inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 18px rgba(0,0,0,0.18)",
              }}
            >
              {spinning ? "Spinning..." : canSpin ? "Spin Free" : "Come Back Tomorrow"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-[22px] border border-white/16 bg-white/12 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 18px rgba(0,0,0,0.18)" }}
            >
              Continue
            </button>
          )}

          {!canSpin && !result ? (
            <p className="mt-3 text-center text-[11px] font-semibold text-white/56">
              Your free wheel refreshes 24 hours after the previous spin.
            </p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
```

## Component: Floating Resource Pills

**Source File:** `src/components/EconomyTopBar.tsx`

```tsx
import { motion } from "framer-motion";
import type { ResponsiveLayoutMode } from "../game/layout";

type EconomyTopBarProps = {
  coins: number;
  lives: number;
  maxLives: number;
  refillLabel: string;
  currentLevel: number;
  totalStarsEarned: number;
  completedLevelsCount: number;
  layoutMode?: ResponsiveLayoutMode;
};

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function HeartGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M12 21.2 10.55 19.88C5.4 15.2 2 12.1 2 8.3 2 5.2 4.42 3 7.48 3c1.72 0 3.36.8 4.52 2.06C13.16 3.8 14.8 3 16.52 3 19.58 3 22 5.2 22 8.3c0 3.8-3.4 6.9-8.55 11.58L12 21.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CoinGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="rgba(17,24,39,0.28)" strokeWidth="1.5" />
    </svg>
  );
}

function GemGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M6 9 9 4h6l3 5-6 11L6 9Z"
        fill="currentColor"
        stroke="rgba(17,24,39,0.28)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResourcePill({
  accent,
  label,
  value,
  subtitle,
  children,
}: {
  accent: string;
  label: string;
  value: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mania-floating-pill mania-floating-pill--minimal flex min-w-0 items-center gap-2 rounded-full border px-3 py-2"
      style={{
        borderColor: `${accent}40`,
        background: "rgba(7, 12, 28, 0.5)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 18px rgba(5,10,22,0.16)",
      }}
    >
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${accent}2d`, color: accent }}
      >
        {children}
      </div>

      <div className="min-w-0">
        <p className="mania-title truncate text-[13px] font-black leading-none text-white">{value}</p>
        <p className="mania-kicker mt-1 truncate text-[7px] font-black uppercase tracking-[0.18em] text-white/56">
          {label} {subtitle}
        </p>
      </div>
    </div>
  );
}

export function EconomyTopBar({
  coins,
  lives,
  maxLives,
  refillLabel,
  currentLevel,
  totalStarsEarned,
  completedLevelsCount,
  layoutMode = "default",
}: EconomyTopBarProps) {
  const gems = Math.max(24, Math.round(totalStarsEarned * 2.4 + completedLevelsCount * 3 + currentLevel * 2));
  const isNarrow = layoutMode !== "default";
  const isUltraNarrow = layoutMode === "ultraNarrow";

  return (
    <header className="text-white">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={`mania-floating-hud grid gap-2 ${isUltraNarrow ? "grid-cols-1" : isNarrow ? "grid-cols-2" : "grid-cols-3"}`}
        data-layout={isNarrow ? "stacked" : "row"}
      >
        <ResourcePill
          accent="#ff7b97"
          label="Hearts"
          value={`${lives}/${maxLives}`}
          subtitle={refillLabel === "Full" ? "full" : "refill"}
        >
          <HeartGlyph />
        </ResourcePill>
        <ResourcePill accent="#ffd44f" label="Coins" value={formatCompact(coins)} subtitle="stash">
          <CoinGlyph />
        </ResourcePill>
        <ResourcePill accent="#d089ff" label="Gems" value={formatCompact(gems)} subtitle="boost">
          <GemGlyph />
        </ResourcePill>
      </motion.div>
    </header>
  );
}
```

## Page: Win / Lose Popup

**Source File:** `src/components/EndPopup.tsx`

```tsx
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import GameMascot from "./GameMascot";

type EndPopupProps = {
  mode: "win" | "rescue" | "lost";
  score: number;
  stars?: number;
  coinsReward?: number;
  /** Dynamic escalating cost for this rescue attempt */
  rescueCostCoins?: number;
  /** Whether the player can afford the current rescue cost */
  canAffordRescue?: boolean;
  onRescue?: () => void;
  onWatchAd?: () => void;
  onGiveUp?: () => void;
  onBackToMap: () => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
  selectedCharacterIndex?: number;
};

export function EndPopup({
  mode,
  score,
  stars = 0,
  coinsReward = 0,
  rescueCostCoins = 100,
  canAffordRescue = false,
  onRescue,
  onWatchAd,
  onGiveUp,
  onBackToMap,
  onNextLevel,
  hasNextLevel = false,
  selectedCharacterIndex,
}: EndPopupProps) {
  const isWin    = mode === "win";
  const isRescue = mode === "rescue";

  const scoreMotion  = useMotionValue(0);
  const coinMotion   = useMotionValue(0);
  const roundedScore = useTransform(scoreMotion, (v) => Math.round(v));
  const roundedCoins = useTransform(coinMotion,  (v) => Math.round(v));

  useEffect(() => {
    const c = animate(scoreMotion, score, { duration: 0.95, ease: "easeOut" });
    return () => c.stop();
  }, [score, scoreMotion]);

  useEffect(() => {
    if (!isWin) { coinMotion.set(coinsReward); return; }
    const c = animate(coinMotion, coinsReward, { duration: 0.9, ease: "easeOut" });
    return () => c.stop();
  }, [coinMotion, coinsReward, isWin]);

  const title = isWin ? "Level Complete!" : isRescue ? "Keep Playing?" : "Level Failed";

  // Determine escalation label shown on the coin rescue button
  const getTierLabel = (cost: number): string => {
    if (cost <= 100) return "1st rescue";
    if (cost <= 150) return "2nd rescue";
    if (cost <= 300) return "3rd rescue";
    return "4th+ rescue";
  };

  return (
    <div className="fixed inset-0 z-[9000] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 21, mass: 0.75 }}
        className="w-full max-w-[332px] rounded-3xl border border-white/30 p-5 text-white shadow-2xl"
        style={{
          background:
            "linear-gradient(170deg, rgba(88,111,255,0.94) 0%, rgba(75,51,207,0.95) 44%, rgba(35,26,111,0.97) 100%)",
        }}
      >
        {/* â”€â”€ Title â”€â”€ */}
        <h2 className="text-center text-3xl font-black tracking-tight">{title}</h2>

        <div className="mt-3 flex justify-center">
          <div className="scale-[1.25]">
            <GameMascot
              mascotState={isWin ? "victory" : isRescue ? "worried" : "sad"}
              characterIndex={selectedCharacterIndex}
            />
          </div>
        </div>

        {isRescue && (
          <p className="mt-2 text-center text-sm font-semibold text-white/80">
            Out of moves. Continue with&nbsp;
            <span className="text-yellow-300 font-black">+5 moves</span>?
          </p>
        )}

        {/* â”€â”€ Score ticker â”€â”€ */}
        <p className="mt-3 text-center text-sm font-semibold text-white/75">Score</p>
        <motion.p className="text-center text-4xl font-black tabular-nums">
          {roundedScore}
        </motion.p>

        {/* â”€â”€ Win extras â”€â”€ */}
        {isWin ? (
          <div className="mt-4 space-y-3">
            <div className="flex justify-center gap-2 text-2xl" aria-label="star-rating">
              {[0, 1, 2].map((star) => (
                <motion.span
                  key={star}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15 + star * 0.08,
                    type: "spring",
                    stiffness: 380,
                    damping: 20,
                  }}
                  className={star < stars ? "text-yellow-300" : "text-white/25"}
                >
                  â˜…
                </motion.span>
              ))}
            </div>
            <div className="rounded-xl border border-yellow-200/45 bg-yellow-300/15 px-3 py-2 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-yellow-100/85">
                Coins Earned
              </p>
              <p className="text-2xl font-black text-yellow-300 tabular-nums">
                +<motion.span>{roundedCoins}</motion.span> ðŸª™
              </p>
            </div>
          </div>
        ) : null}

        {/* â”€â”€ Action buttons â”€â”€ */}
        <div className="mt-6 grid gap-2">
          {isRescue ? (
            <>
              {/* â”€â”€ Two rescue options side-by-side â€” NEVER hidden â”€â”€ */}
              <div className="grid grid-cols-2 gap-2">

                {/* Button A â€” Buy with Coins (escalating cost) */}
                <button
                  type="button"
                  onClick={canAffordRescue ? onRescue : undefined}
                  disabled={!canAffordRescue}
                  className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-3 text-xs font-black leading-tight transition ${
                    canAffordRescue
                      ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300 active:scale-95 shadow-md"
                      : "cursor-not-allowed bg-white/15 text-white/40"
                  }`}
                >
                  {/* Tier badge â€” top-right corner */}
                  <span
                    className="absolute -top-1.5 -right-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none"
                    style={{
                      background: rescueCostCoins <= 100
                        ? "linear-gradient(135deg,#22c55e,#16a34a)"
                        : rescueCostCoins <= 150
                        ? "linear-gradient(135deg,#eab308,#ca8a04)"
                        : rescueCostCoins <= 300
                        ? "linear-gradient(135deg,#f97316,#ea580c)"
                        : "linear-gradient(135deg,#ef4444,#b91c1c)",
                      color: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
                    }}
                  >
                    {getTierLabel(rescueCostCoins)}
                  </span>

                  <span className="text-lg">ðŸª™</span>
                  <span>+5 Moves</span>
                  {/* Dynamic cost â€” updates every rescue */}
                  <span className="text-[11px] font-black">
                    {rescueCostCoins} coins
                  </span>
                  {!canAffordRescue && (
                    <span className="text-[9px] text-red-300">Not enough</span>
                  )}
                </button>

                {/* Button B â€” Watch Ad (ALWAYS VISIBLE, ALWAYS ENABLED) */}
                <button
                  type="button"
                  onClick={onWatchAd}
                  className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-amber-400 px-2 py-3 text-xs font-black leading-tight text-amber-950 shadow-md transition hover:bg-amber-300 active:scale-95"
                >
                  <span className="text-lg">ðŸŽ¬</span>
                  <span>+5 + ðŸª©</span>
                  <span className="text-[11px] font-black">Watch Ad</span>
                  <span className="text-[9px] font-black text-emerald-800">FREE</span>
                </button>
              </div>

              {/* Give Up â€” subtle text link */}
              <button
                type="button"
                onClick={onGiveUp}
                className="mt-1 text-center text-xs text-white/45 underline underline-offset-2 transition hover:text-white/70"
              >
                No thanks, give up
              </button>
            </>
          ) : null}

          {/* â”€â”€ Win navigation â”€â”€ */}
          {isWin && hasNextLevel && onNextLevel ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="rounded-xl bg-yellow-300 px-4 py-3 text-sm font-black text-slate-900 shadow-md transition hover:bg-yellow-200 active:scale-95"
            >
              Next Level â–¶
            </button>
          ) : null}

          <button
            type="button"
            onClick={onBackToMap}
            className={`rounded-xl px-4 py-3 text-sm font-black transition active:scale-95 ${
              isWin && hasNextLevel && onNextLevel
                ? "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "bg-yellow-300 text-slate-900 shadow-md hover:bg-yellow-200"
            }`}
          >
            Back To Map
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

## Component: Fever Overlay

**Source File:** `src/components/FeverOverlay.tsx`

```tsx
/**
 * FeverOverlay â€” AAA Fever Mode visual transformation layer
 *
 * Renders:
 * 1. Animated golden/neon vignette edge glow around the screen
 * 2. "FEVER!" entry banner with 3D bounce
 * 3. Pulsing neon edge that beats with the music
 * 4. Streak counter "COMBO x3" style display
 * 5. Background tint overlay for the board
 *
 * Positioned as a fixed overlay and pointer-events-none so it doesn't block input.
 */

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  active: boolean;
  streak: number;
  multiplier: number;
  timeLeft: number; // ms remaining in fever
  totalDuration: number; // ms total fever duration
};

export function FeverOverlay({ active, streak, multiplier, timeLeft, totalDuration }: Props) {
  const progress = totalDuration > 0 ? Math.max(0, timeLeft / totalDuration) : 0;

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* â”€â”€ Edge Vignette Glow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            key="fever-vignette"
            className="pointer-events-none fixed inset-0 z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.75, 0.45, 0.8, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 42%, rgba(255,211,45,0.18) 65%, rgba(255,100,0,0.38) 82%, rgba(255,50,0,0.55) 100%)",
            }}
          />

          {/* â”€â”€ Neon border pulse ring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            key="fever-border"
            className="pointer-events-none fixed inset-0 z-[201]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1.0, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              boxShadow:
                "inset 0 0 0 4px rgba(255,211,45,0.7), inset 0 0 0 8px rgba(255,140,0,0.3)",
              borderRadius: 0,
            }}
          />

          {/* â”€â”€ Top corner FEVER badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            key="fever-badge"
            className="pointer-events-none fixed left-1/2 top-4 z-[210] -translate-x-1/2"
            initial={{ y: -60, scale: 0.4, opacity: 0, rotate: -8 }}
            animate={{ y: 0, scale: 1, opacity: 1, rotate: [0, 2, -2, 1, 0] }}
            exit={{ y: -60, scale: 0.4, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 18,
              rotate: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #FFD32D 0%, #FF6B00 50%, #FF2D2D 100%)",
                borderRadius: 999,
                padding: "6px 20px",
                boxShadow:
                  "0 0 24px rgba(255,211,45,0.8), 0 0 48px rgba(255,100,0,0.5), 0 4px 12px rgba(0,0,0,0.5)",
                border: "2px solid rgba(255,255,255,0.6)",
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: 22,
                  color: "#fff",
                  letterSpacing: "0.12em",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,211,45,0.9)",
                  display: "block",
                }}
              >
                ðŸ”¥ FEVER MODE!
              </span>
            </div>
          </motion.div>

          {/* â”€â”€ Combo streak counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            key={`combo-counter-${streak}`}
            className="pointer-events-none fixed bottom-36 left-1/2 z-[210] -translate-x-1/2"
            initial={{ scale: 0.3, opacity: 0, y: 20 }}
            animate={{ scale: [1.4, 1.1, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
          >
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 900,
                fontSize: streak >= 6 ? 48 : streak >= 4 ? 42 : 36,
                color: "#FFD32D",
                textShadow:
                  "0 0 20px rgba(255,211,45,1), 0 0 40px rgba(255,100,0,0.8), 0 4px 12px rgba(0,0,0,0.7)",
                letterSpacing: "0.06em",
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              COMBO Ã—{streak}
              <br />
              <span
                style={{
                  fontSize: 16,
                  color: "#fff",
                  opacity: 0.9,
                  letterSpacing: "0.18em",
                  textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                }}
              >
                {multiplier.toFixed(1)}Ã— SCORE BOOST
              </span>
            </div>
          </motion.div>

          {/* â”€â”€ Fever timer bar at bottom â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            key="fever-timer-bar"
            className="pointer-events-none fixed bottom-0 left-0 z-[210] w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                height: 6,
                width: "100%",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  background: "linear-gradient(90deg, #FF2D2D 0%, #FFD32D 50%, #FF6B00 100%)",
                  boxShadow: "0 0 12px rgba(255,211,45,0.9)",
                  transition: "width 0.5s linear",
                }}
              />
            </div>
          </motion.div>

          {/* â”€â”€ Floating spark particles in the background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`fever-spark-${i}`}
              className="pointer-events-none fixed z-[202]"
              style={{
                left: `${10 + i * 11}%`,
                top: "60%",
                fontSize: 14,
                color: i % 2 === 0 ? "#FFD32D" : "#FF6B00",
              }}
              animate={{
                y: [0, -60 - i * 8, -100 - i * 12],
                x: [(i % 2 === 0 ? 1 : -1) * i * 4, (i % 2 === 0 ? -1 : 1) * i * 6],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.3],
              }}
              transition={{
                duration: 1.4,
                delay: i * 0.18,
                repeat: Infinity,
                repeatDelay: 0.4,
                ease: "easeOut",
              }}
            >
              âœ¦
            </motion.div>
          ))}
        </>
      )}
    </AnimatePresence>
  );
}
```

## Component: Character System

**Source File:** `src/components/GameMascot.tsx`

```tsx
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export const GAME_CHARACTERS = [
  { name: "Nova", url: "https://rainbum.github.io/nova.png" },
  { name: "Zenn", url: "https://rainbum.github.io/zenn.png" },
  { name: "Crunch", url: "https://rainbum.github.io/crunch.png" },
  { name: "Flick", url: "https://rainbum.github.io/flick.png" },
] as const;

type CharacterName = (typeof GAME_CHARACTERS)[number]["name"];

export type MascotState =
  | "idle"
  | "wave"
  | "cheer"
  | "worried"
  | "pointing"
  | "excited"
  | "sad"
  | "victory"
  | "shocked"
  | "fever";

interface GameMascotProps {
  mascotState: MascotState;
  currentLevel?: number;
  characterIndex?: number;
  size?: number;
  showNameBadge?: boolean;
  interactive?: boolean;
  enableIdleWave?: boolean;
  className?: string;
  onTap?: () => void;
}

const BASE_CIRCLE = 72;

const RING_ACCENT: Record<MascotState, { inner: string; outer: string; glow: string }> = {
  idle: { inner: "rgba(255,255,255,0.55)", outer: "rgba(180,160,255,0.30)", glow: "rgba(160,130,255,0.0)" },
  wave: { inner: "rgba(125,211,252,0.95)", outer: "rgba(56,189,248,0.42)", glow: "rgba(56,189,248,0.55)" },
  cheer: { inner: "rgba(255,220,60,0.95)", outer: "rgba(255,200,0,0.45)", glow: "rgba(255,200,0,0.55)" },
  worried: { inner: "rgba(255,80,80,0.90)", outer: "rgba(255,60,60,0.40)", glow: "rgba(255,60,60,0.50)" },
  pointing: { inner: "rgba(125,211,252,0.95)", outer: "rgba(56,189,248,0.40)", glow: "rgba(56,189,248,0.55)" },
  excited: { inner: "rgba(255,173,83,0.96)", outer: "rgba(249,115,22,0.42)", glow: "rgba(249,115,22,0.60)" },
  sad: { inner: "rgba(148,163,184,0.88)", outer: "rgba(71,85,105,0.34)", glow: "rgba(71,85,105,0.42)" },
  victory: { inner: "rgba(80,255,160,0.95)", outer: "rgba(60,220,140,0.45)", glow: "rgba(60,220,140,0.60)" },
  shocked: { inner: "rgba(200,100,255,0.95)", outer: "rgba(180,80,255,0.45)", glow: "rgba(180,80,255,0.55)" },
  fever: { inner: "rgba(255,160,0,0.95)", outer: "rgba(255,120,0,0.50)", glow: "rgba(255,120,0,0.65)" },
};

function clampCharacterIndex(index: number, fallback: number) {
  const normalized = ((Math.floor(index) % GAME_CHARACTERS.length) + GAME_CHARACTERS.length) % GAME_CHARACTERS.length;
  return Number.isFinite(normalized) ? normalized : fallback;
}

function buildIdleMotion(name: CharacterName) {
  if (name === "Nova") {
    return {
      y: [-4, 3, -4],
      rotate: [-1.4, 1.2, -1.4],
      scale: [1, 1.018, 1],
      x: [0, 1, 0],
      transition: { duration: 3.1, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Flick") {
    return {
      y: [-4, 2, -4],
      rotate: [-2, 1.6, -2],
      scale: [1, 1.012, 1],
      x: [0, 1.5, 0],
      transition: { duration: 2.35, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Crunch") {
    return {
      y: [-2, 2, -2],
      rotate: [-1.1, 1.1, -1.1],
      scale: [1, 1.025, 1],
      x: 0,
      transition: { duration: 2.85, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  return {
    y: [-2, 2, -2],
    rotate: [-0.9, 0.9, -0.9],
    scale: [1, 1.012, 1],
    x: 0,
    transition: { duration: 3.35, repeat: Infinity, ease: "easeInOut" as const },
  };
}

function buildWaveMotion(name: CharacterName) {
  if (name === "Nova") {
    return {
      x: [0, 4, 8, 4, 0],
      y: [0, -4, -7, -4, 0],
      rotate: [0, -5, -9, -5, 0],
      scale: [1, 1.03, 1.06, 1.03, 1],
      transition: { duration: 0.92, ease: "easeInOut" as const },
    };
  }

  if (name === "Flick") {
    return {
      x: [0, 7, 11, 7, 0],
      y: [0, -5, -7, -5, 0],
      rotate: [0, -8, -13, -8, 0],
      scale: [1, 1.05, 1.07, 1.05, 1],
      transition: { duration: 0.7, ease: "easeInOut" as const },
    };
  }

  if (name === "Crunch") {
    return {
      y: [0, -7, 1, -4, 0],
      scale: [1, 1.08, 0.98, 1.05, 1],
      rotate: [0, 4, -3, 2, 0],
      x: [0, 1, 0, -1, 0],
      transition: { duration: 0.88, ease: "easeOut" as const },
    };
  }

  return {
    x: [0, 3, 6, 3, 0],
    y: [0, -2, -2, -2, 0],
    rotate: [0, -6, -10, -6, 0],
    scale: [1, 1.02, 1.04, 1.02, 1],
    transition: { duration: 0.95, ease: "easeInOut" as const },
  };
}

function buildPointingMotion(name: CharacterName) {
  if (name === "Nova") {
    return {
      x: [0, 4, 10, 4, 0],
      y: [0, -4, -5, -4, 0],
      rotate: [0, -5, -8, -5, 0],
      scale: [1, 1.02, 1.05, 1.02, 1],
      transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Flick") {
    return {
      x: [0, 5, 12, 5, 0],
      y: [0, -5, -8, -5, 0],
      rotate: [0, -6, -10, -6, 0],
      scale: [1, 1.04, 1.07, 1.04, 1],
      transition: { duration: 0.68, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Crunch") {
    return {
      x: [0, 3, 7, 3, 0],
      y: [0, -3, -4, -3, 0],
      rotate: [0, -3, -6, -3, 0],
      scale: [1, 1.03, 1.06, 1.03, 1],
      transition: { duration: 1.02, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  return {
    x: [0, 4, 8, 4, 0],
    y: [0, -2, -4, -2, 0],
    rotate: [0, -4, -7, -4, 0],
    scale: [1, 1.02, 1.05, 1.02, 1],
    transition: { duration: 0.82, repeat: Infinity, ease: "easeInOut" as const },
  };
}

function buildExcitedMotion(name: CharacterName) {
  if (name === "Nova") {
    return {
      y: [0, -12, 1, -9, 0],
      x: [0, -2, 2, -1, 0],
      scale: [1, 1.11, 0.98, 1.1, 1],
      rotate: [0, 7, -6, 4, 0],
      transition: { duration: 0.64, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Flick") {
    return {
      y: [0, -15, 2, -11, 0],
      x: [0, 2, -2, 2, 0],
      scale: [1, 1.13, 0.96, 1.12, 1],
      rotate: [0, 8, -7, 5, 0],
      transition: { duration: 0.52, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Crunch") {
    return {
      y: [0, -9, 3, -6, 0],
      scale: [1, 1.12, 0.97, 1.08, 1],
      rotate: [0, 5, -4, 3, 0],
      transition: { duration: 0.72, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  return {
    y: [0, -10, 2, -8, 0],
    scale: [1, 1.1, 0.98, 1.08, 1],
    rotate: [0, 4, -3, 2, 0],
    transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" as const },
  };
}

function buildSadMotion(name: CharacterName) {
  if (name === "Nova") {
    return {
      y: [0, 5, 2],
      x: [0, -1, 0],
      rotate: [0, -4, -2],
      scale: [1, 0.96, 0.98],
      transition: { duration: 1.05, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Flick") {
    return {
      y: [0, 4, 1],
      x: [0, 1, 0],
      rotate: [0, -6, -3],
      scale: [1, 0.95, 0.97],
      transition: { duration: 0.86, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Crunch") {
    return {
      y: [0, 6, 3],
      x: 0,
      rotate: [0, -2, -1],
      scale: [1, 0.95, 0.98],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  return {
    y: [0, 4, 2],
    x: 0,
    rotate: [0, -2, -1],
    scale: [1, 0.97, 0.98],
    transition: { duration: 1.08, repeat: Infinity, ease: "easeInOut" as const },
  };
}

function buildVictoryMotion(name: CharacterName) {
  if (name === "Nova") {
    return {
      y: [-12, 0, -9, 0],
      x: [0, -2, 2, 0],
      scale: [1, 1.14, 0.98, 1.08, 1],
      rotate: [0, 9, -7, 5, 0],
      transition: { duration: 0.58, repeat: Infinity, ease: "easeOut" as const },
    };
  }

  if (name === "Flick") {
    return {
      y: [-14, 0, -11, 0],
      x: [0, 2, -2, 0],
      scale: [1, 1.17, 0.96, 1.12, 1],
      rotate: [0, 7, -6, 4, 0],
      transition: { duration: 0.46, repeat: Infinity, ease: "easeOut" as const },
    };
  }

  if (name === "Crunch") {
    return {
      y: [-9, 2, -6, 0],
      scale: [1, 1.18, 0.98, 1.1, 1],
      rotate: [0, 5, -4, 2, 0],
      transition: { duration: 0.66, repeat: Infinity, ease: "easeOut" as const },
    };
  }

  return {
    y: [-10, 1, -7, 0],
    scale: [1, 1.12, 0.98, 1.08, 1],
    rotate: [0, 6, -4, 2, 0],
    transition: { duration: 0.62, repeat: Infinity, ease: "easeOut" as const },
  };
}

function buildShockedMotion(name: CharacterName) {
  if (name === "Crunch") {
    return {
      scale: [1, 1.2, 0.92, 1.06, 1],
      rotate: [0, -7, 5, -3, 0],
      y: [0, -9, 4, -3, 0],
      transition: { duration: 0.42, ease: "easeOut" as const },
    };
  }

  if (name === "Flick") {
    return {
      scale: [1, 1.16, 0.9, 1.05, 1],
      rotate: [0, -9, 6, -3, 0],
      y: [0, -7, 3, -2, 0],
      x: [0, 2, -2, 0],
      transition: { duration: 0.36, ease: "easeOut" as const },
    };
  }

  return {
    scale: [1, 1.14, 0.92, 1.06, 1],
    rotate: [0, -6, 4, -2, 0],
    y: [0, -7, 3, -3, 0],
    transition: { duration: 0.4, ease: "easeOut" as const },
  };
}

function buildWorriedMotion(name: CharacterName) {
  if (name === "Crunch") {
    return {
      x: [-1.5, 1.5, -1.5, 1.5, 0],
      rotate: [-1, 1.5, -1, 1.5, 0],
      scale: 0.97,
      transition: { duration: 0.46, repeat: Infinity, ease: "linear" as const },
    };
  }

  if (name === "Flick") {
    return {
      x: [-2.5, 2.5, -2.5, 2.5, 0],
      rotate: [-3, 3, -3, 3, 0],
      scale: 0.96,
      transition: { duration: 0.28, repeat: Infinity, ease: "linear" as const },
    };
  }

  return {
    x: [-2, 2, -2, 2, 0],
    rotate: [-2, 2, -2, 2, 0],
    scale: 0.96,
    transition: { duration: 0.35, repeat: Infinity, ease: "linear" as const },
  };
}

function buildFeverMotion(name: CharacterName) {
  if (name === "Flick") {
    return {
      y: [-6, 6, -6],
      x: [-1, 1, -1],
      scale: [1, 1.06, 1],
      rotate: [-4, 4, -4],
      transition: { duration: 0.86, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  if (name === "Crunch") {
    return {
      y: [-4, 4, -4],
      scale: [1, 1.08, 1],
      rotate: [-2.5, 2.5, -2.5],
      transition: { duration: 1.0, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  return {
    y: [-5, 5, -5],
    scale: [1, 1.05, 1],
    rotate: [-2, 2, -2],
    transition: { duration: 1.0, repeat: Infinity, ease: "easeInOut" as const },
  };
}

export default function GameMascot({
  mascotState,
  currentLevel = 1,
  characterIndex,
  size = BASE_CIRCLE,
  showNameBadge = true,
  interactive = false,
  enableIdleWave = true,
  className,
  onTap,
}: GameMascotProps) {
  const controls = useAnimation();
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleGestureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  const fallbackIndex = ((currentLevel - 1) % GAME_CHARACTERS.length + GAME_CHARACTERS.length) % GAME_CHARACTERS.length;
  const charIndex = typeof characterIndex === "number" ? clampCharacterIndex(characterIndex, fallbackIndex) : fallbackIndex;
  const character = useMemo(() => GAME_CHARACTERS[charIndex], [charIndex]);
  const accent = RING_ACCENT[mascotState];
  const scale = size / BASE_CIRCLE;
  const px = (value: number) => value * scale;

  const clearIdle = () => {
    if (idleTimeoutRef.current !== null) {
      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  };

  const clearBlink = () => {
    if (blinkTimeoutRef.current !== null) {
      window.clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = null;
    }
    if (blinkHideTimeoutRef.current !== null) {
      window.clearTimeout(blinkHideTimeoutRef.current);
      blinkHideTimeoutRef.current = null;
    }
  };

  const clearIdleWave = () => {
    if (idleGestureIntervalRef.current !== null) {
      window.clearInterval(idleGestureIntervalRef.current);
      idleGestureIntervalRef.current = null;
    }
  };

  const startIdle = () => {
    controls.start(buildIdleMotion(character.name));
  };

  const scheduleIdle = (ms = 150) => {
    clearIdle();
    idleTimeoutRef.current = window.setTimeout(() => {
      startIdle();
      idleTimeoutRef.current = null;
    }, ms);
  };

  const runOneShot = (definition: Record<string, unknown>, resumeDelay = 140) => {
    clearIdle();
    controls.start(definition).then(() => {
      scheduleIdle(resumeDelay);
    });
  };

  const playWaveGesture = () => {
    runOneShot(buildWaveMotion(character.name), 140);
  };

  const handleTouchReact = () => {
    if (!interactive) return;
    if (mascotState !== "idle") return;
    playWaveGesture();
    onTap?.();
  };

  useEffect(() => {
    clearBlink();

    const queueBlink = () => {
      const nextDelay = 2200 + Math.random() * 2200;
      blinkTimeoutRef.current = window.setTimeout(() => {
        setIsBlinking(true);
        blinkHideTimeoutRef.current = window.setTimeout(() => {
          setIsBlinking(false);
          queueBlink();
        }, 120);
      }, nextDelay);
    };

    queueBlink();
    return () => clearBlink();
  }, [character.name]);

  useEffect(() => {
    clearIdleWave();

    if (mascotState !== "idle" || !enableIdleWave) {
      return () => clearIdleWave();
    }

    const intervalMs = 5200 + charIndex * 280;
    idleGestureIntervalRef.current = window.setInterval(() => {
      playWaveGesture();
    }, intervalMs);

    return () => clearIdleWave();
  }, [charIndex, enableIdleWave, mascotState]);

  useEffect(() => {
    clearIdle();

    switch (mascotState) {
      case "wave":
        playWaveGesture();
        break;
      case "cheer":
        runOneShot(buildWaveMotion(character.name), 150);
        break;
      case "worried":
        controls.start(buildWorriedMotion(character.name));
        break;
      case "pointing":
        controls.start(buildPointingMotion(character.name));
        break;
      case "excited":
        controls.start(buildExcitedMotion(character.name));
        break;
      case "sad":
        controls.start(buildSadMotion(character.name));
        break;
      case "victory":
        controls.start(buildVictoryMotion(character.name));
        break;
      case "shocked":
        runOneShot(buildShockedMotion(character.name), 220);
        break;
      case "fever":
        controls.start(buildFeverMotion(character.name));
        break;
      default:
        startIdle();
        break;
    }

    return () => clearIdle();
  }, [character.name, controls, mascotState]);

  useEffect(() => {
    return () => {
      clearIdle();
      clearBlink();
      clearIdleWave();
    };
  }, []);

  return (
    <div
      className={`relative flex-shrink-0 select-none ${interactive ? "cursor-pointer" : ""} ${className ?? ""}`}
      style={{ width: size, height: size }}
      onPointerDown={handleTouchReact}
    >
      <motion.div
        animate={{
          boxShadow: `0 0 0 ${px(6)}px ${accent.outer}, 0 0 ${px(18)}px ${px(5)}px ${accent.glow}`,
          opacity: mascotState === "idle" ? 0.45 : 0.95,
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: -px(3),
          borderRadius: "50%",
          border: `${px(1.5)}px dashed ${accent.inner}`,
          opacity: mascotState === "idle" ? 0.18 : 0.55,
          pointerEvents: "none",
          zIndex: 15,
          transition: "opacity 0.4s ease, border-color 0.4s ease",
        }}
      />

      <motion.div
        animate={{
          boxShadow: [
            `0 0 0 ${px(2)}px ${accent.inner}, 0 ${px(4)}px ${px(16)}px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)`,
            `0 0 0 ${px(2.5)}px ${accent.inner}, 0 ${px(6)}px ${px(22)}px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.30)`,
            `0 0 0 ${px(2)}px ${accent.inner}, 0 ${px(4)}px ${px(16)}px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)`,
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          overflow: "hidden",
          background: "linear-gradient(145deg, rgba(30,20,60,0.82) 0%, rgba(10,8,30,0.93) 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 20,
          filter: mascotState !== "idle" ? `drop-shadow(0 0 ${px(8)}px ${accent.glow})` : "drop-shadow(0 3px 10px rgba(0,0,0,0.45))",
          transition: "filter 0.4s ease",
        }}
      >
        <motion.img
          key={character.url}
          src={character.url}
          alt={character.name}
          animate={controls}
          initial={{ opacity: 0, scale: 0.7 }}
          onLoad={() => {
            controls.start({ opacity: 1, scale: 1, transition: { duration: 0.32, ease: "easeOut" } }).then(() => {
              if (mascotState === "idle") {
                startIdle();
              }
            });
          }}
          onError={(event) => {
            (event.target as HTMLImageElement).style.opacity = "1";
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            pointerEvents: "none",
            userSelect: "none",
            transform: "scale(1.15)",
            zIndex: 30,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "46%",
            borderRadius: "50% 50% 0 0 / 60% 60% 0 0",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.26), rgba(255,255,255,0.02))",
            pointerEvents: "none",
            zIndex: 40,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "35%",
            borderRadius: "0 0 50% 50% / 0 0 60% 60%",
            background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
            pointerEvents: "none",
            zIndex: 41,
          }}
        />

        <AnimatePresence>
          {isBlinking ? (
            <motion.div
              key="blink-overlay"
              initial={{ opacity: 0, scaleY: 0.4 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.4 }}
              transition={{ duration: 0.09, ease: "easeInOut" }}
              style={{
                position: "absolute",
                left: "20%",
                right: "20%",
                top: "35%",
                display: "flex",
                justifyContent: "space-between",
                pointerEvents: "none",
                zIndex: 45,
              }}
            >
              {[0, 1].map((index) => (
                <span
                  key={index}
                  style={{
                    width: px(15),
                    height: px(4),
                    borderRadius: 999,
                    background: "rgba(33,17,77,0.88)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="wait">
        {mascotState === "worried" ? (
          <motion.div
            key="sweat"
            className="absolute pointer-events-none"
            style={{ top: px(3), right: -px(2), fontSize: px(11), zIndex: 50 }}
            initial={{ opacity: 0, y: -px(8), scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -px(6), scale: 0.4 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
          >
            ðŸ’§
          </motion.div>
        ) : null}

        {mascotState === "victory" ? (
          <motion.div key="victory-sparkles" className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
            {[
              { top: -px(6), left: -px(5), delay: 0 },
              { top: -px(8), right: -px(4), delay: 0.2 },
              { bottom: 0, left: -px(6), delay: 0.38 },
            ].map((position, index) => (
              <motion.div
                key={index}
                className="absolute"
                style={{ ...position, fontSize: px(10) }}
                animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: position.delay }}
              >
                âœ¨
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {mascotState === "fever" ? (
          <motion.div
            key="flame"
            className="absolute pointer-events-none"
            style={{ bottom: -px(4), left: "50%", transform: "translateX(-50%)", fontSize: px(13), zIndex: 50 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8], y: [0, -px(2), 0] }}
            transition={{ duration: 0.42, repeat: Infinity }}
          >
            ðŸ”¥
          </motion.div>
        ) : null}

        {mascotState === "cheer" ? (
          <motion.div
            key="cheer-star"
            className="absolute pointer-events-none"
            style={{ top: 0, right: -px(3), fontSize: px(10), zIndex: 50 }}
            initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.3, 1.1, 0.3], rotate: [-30, 10, -5, 20] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            â­
          </motion.div>
        ) : null}

        {mascotState === "wave" || mascotState === "pointing" ? (
          <motion.div
            key="gesture-arrow"
            className="absolute pointer-events-none"
            style={{ right: -px(11), top: "50%", fontSize: px(12), zIndex: 50 }}
            animate={{ x: [0, px(5), 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            âžœ
          </motion.div>
        ) : null}

        {mascotState === "excited" ? (
          <motion.div key="excited-burst" className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
            {[
              { top: -px(7), left: px(2), delay: 0 },
              { top: -px(9), right: px(2), delay: 0.15 },
              { bottom: -px(2), right: 0, delay: 0.32 },
            ].map((position, index) => (
              <motion.span
                key={index}
                className="absolute"
                style={{ ...position, fontSize: px(10) }}
                animate={{ opacity: [0, 1, 0], scale: [0.45, 1.2, 0.45] }}
                transition={{ duration: 0.85, repeat: Infinity, delay: position.delay }}
              >
                âœ¦
              </motion.span>
            ))}
          </motion.div>
        ) : null}

        {mascotState === "sad" ? (
          <motion.div
            key="sad-droplet"
            className="absolute pointer-events-none"
            style={{ top: px(5), right: -px(2), fontSize: px(11), zIndex: 50 }}
            animate={{ y: [0, px(2), 0], opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          >
            ...
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showNameBadge ? (
        <motion.div
          animate={{ opacity: mascotState === "idle" ? 0.6 : 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            bottom: -px(16),
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(90deg, rgba(80,50,160,0.80), rgba(120,80,220,0.80))",
            borderRadius: 20,
            padding: `${px(1)}px ${px(6)}px`,
            fontSize: px(6.5),
            fontWeight: 800,
            color: "rgba(255,255,255,0.92)",
            whiteSpace: "nowrap",
            letterSpacing: "0.10em",
            boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.20)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          {character.name.toUpperCase()}
        </motion.div>
      ) : null}
    </div>
  );
}
```

## Component: In-Game Boosters

**Source File:** `src/components/InGameBoosters.tsx`

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { ECONOMY } from "../game/constants";
import type { InGameBoosterKind, TargetingMode } from "../game/types";

type InGameBoostersProps = {
  coins: number;
  inventory: {
    hammer: number;
    glove: number;
    shuffle: number;
  };
  targetingMode: TargetingMode | null;
  onSelectBooster: (booster: InGameBoosterKind) => void;
};

type BoosterConfig = {
  key:    InGameBoosterKind;
  icon:   string;
  label:  string;
  color:  string;
  glow:   string;
  well:   string;
  shadow: string;
};

const BOOSTERS: BoosterConfig[] = [
  {
    key:    "hammer",
    icon:   "ðŸ”¨",
    label:  "Hammer",
    color:  "linear-gradient(160deg,#52d8ff 0%,#1a8fff 55%,#0060cc 100%)",
    glow:   "rgba(50,180,255,0.75)",
    well:   "rgba(0,80,180,0.55)",
    shadow: "#0050bb",
  },
  {
    key:    "glove",
    icon:   "ðŸ¥Š",
    label:  "Glove",
    color:  "linear-gradient(160deg,#ff8fa3 0%,#ff3d60 55%,#c2003f 100%)",
    glow:   "rgba(255,70,100,0.75)",
    well:   "rgba(160,0,50,0.55)",
    shadow: "#a0003a",
  },
  {
    key:    "shuffle",
    icon:   "ðŸ”€",
    label:  "Shuffle",
    color:  "linear-gradient(160deg,#8effa3 0%,#38d458 55%,#1a9e3a 100%)",
    glow:   "rgba(56,210,88,0.75)",
    well:   "rgba(10,120,40,0.55)",
    shadow: "#0e8030",
  },
];

// â”€â”€â”€ Sizes â€” 25 % smaller than original 82 / 68 values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WELL_SIZE   = 62;   // was 82 px  (âˆ’25 %)
const BTN_SIZE    = 50;   // was 68 px  (âˆ’26 %)
const ICON_SIZE   = 22;   // was 30 px

export function InGameBoosters({
  coins,
  inventory,
  targetingMode,
  onSelectBooster,
}: InGameBoostersProps) {
  return (
    <div
      className="relative w-full rounded-t-[28px] px-4 pb-3 pt-2"
      style={{
        background:
          "linear-gradient(180deg,rgba(18,12,50,0.0) 0%,rgba(14,10,44,0.88) 18%,rgba(10,7,36,0.97) 100%)",
        backdropFilter:       "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop:  "1.5px solid rgba(140,110,255,0.22)",
        boxShadow:
          "inset 0 3px 18px rgba(120,80,255,0.12),inset 0 1px 0 rgba(255,255,255,0.07),0 -4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {/* Subtle top shine line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-[28px]"
        style={{
          background:
            "linear-gradient(90deg,transparent 0%,rgba(200,170,255,0.18) 30%,rgba(200,170,255,0.32) 50%,rgba(200,170,255,0.18) 70%,transparent 100%)",
        }}
      />

      {/* Panel label */}
      <p
        className="mb-1.5 text-center text-[9px] font-black uppercase tracking-[0.22em]"
        style={{ color: "rgba(200,180,255,0.45)" }}
      >
        Boosters
      </p>

      {/* Buttons row */}
      <div className="flex items-center justify-evenly gap-2">
        {BOOSTERS.map((booster) => {
          const cost     = ECONOMY.boosterCosts[booster.key];
          const owned = inventory[booster.key];
          const disabled = owned <= 0 && coins < cost;
          const active   = targetingMode === booster.key;

          return (
            <div key={booster.key} className="flex flex-col items-center gap-1">

              {/* â”€â”€ Beveled Well â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  background: booster.well,
                  boxShadow:  "inset 0 5px 12px rgba(0,0,0,0.55),inset 0 -3px 6px rgba(255,255,255,0.07),0 2px 8px rgba(0,0,0,0.45)",
                  width:      WELL_SIZE,
                  height:     WELL_SIZE,
                  padding:    4,
                }}
              >
                {/* Active glow ring */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      key="glow-ring"
                      className="pointer-events-none absolute inset-0 rounded-full"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: [0.6, 1, 0.6], scale: [0.88, 1.06, 0.88] }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        boxShadow: `0 0 18px 6px ${booster.glow},0 0 36px 10px ${booster.glow}55`,
                        background: `radial-gradient(circle,${booster.glow}30 0%,transparent 70%)`,
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* â”€â”€ 3D Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <motion.button
                  type="button"
                  onClick={() => !disabled && onSelectBooster(booster.key)}
                  whileTap={disabled ? {} : { scale: 0.88, y: 3 }}
                  animate={
                    active
                      ? { scale: [1, 1.07, 1], y: [0, -2, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={
                    active
                      ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
                      : { type: "spring", stiffness: 400, damping: 20 }
                  }
                  className="relative flex items-center justify-center rounded-full"
                  style={{
                    width:  BTN_SIZE,
                    height: BTN_SIZE,
                    background: disabled
                      ? "linear-gradient(160deg,#666 0%,#444 100%)"
                      : booster.color,
                    boxShadow: disabled
                      ? `0 4px 0 #333,inset 0 3px 6px rgba(255,255,255,0.12),inset 0 -5px 8px rgba(0,0,0,0.3)`
                      : `0 5px 0 ${booster.shadow},0 8px 16px rgba(0,0,0,0.4),inset 0 3px 8px rgba(255,255,255,0.22),inset 0 -6px 10px rgba(0,0,0,0.25)`,
                    opacity:  disabled ? 0.45 : 1,
                    cursor:   disabled ? "not-allowed" : "pointer",
                    border:   active
                      ? "2px solid rgba(255,255,255,0.7)"
                      : "2px solid rgba(255,255,255,0.25)",
                    transition: "box-shadow 0.15s,border 0.15s",
                  }}
                  aria-label={`${booster.label} booster`}
                  title={`${booster.label} (${owned} owned)`}
                >
                  {/* Top shine */}
                  <span
                    className="pointer-events-none absolute inset-x-1.5 top-1 h-[36%] rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg,rgba(255,255,255,0.38) 0%,rgba(255,255,255,0.04) 100%)",
                    }}
                  />
                  {/* Emoji */}
                  <span
                    className="relative z-10 select-none leading-none"
                    style={{
                      fontSize: ICON_SIZE,
                      filter:   disabled
                        ? "grayscale(0.8)"
                        : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                    }}
                  >
                    {booster.icon}
                  </span>
                </motion.button>
              </div>

              {/* â”€â”€ Inventory badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div
                className="flex items-center gap-1 rounded-full px-2.5 py-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg,rgba(130,110,255,0.24) 0%,rgba(170,140,255,0.3) 100%)",
                  border: "1px solid rgba(180,160,255,0.45)",
                  boxShadow: "0 2px 8px rgba(118,90,255,0.2),inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                <span className="text-[10px] leading-none">ðŸ“¦</span>
                <span
                  className="text-[10px] font-black leading-none"
                  style={{
                    color:      "#E9E0FF",
                    textShadow: "0 1px 4px rgba(84,62,186,0.55)",
                  }}
                >
                  x{owned}
                </span>
              </div>

              <span className="text-[9px] font-bold text-white/55">or {cost} ðŸª™</span>

              {/* Label */}
              <span
                className="text-[9px] font-bold uppercase tracking-wide"
                style={{
                  color: active
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(200,180,255,0.4)",
                }}
              >
                {booster.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Targeting hint */}
      <AnimatePresence>
        {targetingMode && (
          <motion.p
            key="targeting-hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="mt-2 text-center text-[10px] font-bold"
            style={{
              color:      "rgba(255,230,80,0.85)",
              textShadow: "0 0 10px rgba(255,200,0,0.4)",
            }}
          >
            ðŸ‘† Tap a block to use Â· Tap again to cancel
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Layout: Immersive Screen Shell

**Source File:** `src/components/layout/ImmersiveScreen.tsx`

```tsx
import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

const SCREEN_EASE = [0.22, 1, 0.36, 1] as const;

type ImmersiveScreenProps = {
  screenKey: string;
  children: ReactNode;
  surfaceStyle?: CSSProperties;
  className?: string;
  entryOffset?: number;
  overlay?: ReactNode;
  fullBleed?: boolean;
};

export function ImmersiveScreen({
  screenKey,
  children,
  surfaceStyle,
  className,
  entryOffset = 18,
  overlay,
  fullBleed = false,
}: ImmersiveScreenProps) {
  const containerClassName = fullBleed
    ? "relative flex h-full min-h-0 flex-col overflow-hidden"
    : "relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-[34px] border border-white/14";

  return (
    <motion.div
      key={screenKey}
      initial={{ opacity: 0, y: entryOffset, scale: 0.985, filter: "brightness(0.94) saturate(0.96)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "brightness(1) saturate(1)" }}
      exit={{ opacity: 0, y: -Math.max(12, Math.round(entryOffset * 0.8)), scale: 0.992, filter: "brightness(0.96) saturate(0.96)" }}
      transition={{ duration: 0.42, ease: SCREEN_EASE }}
      className={`${containerClassName} ${className ?? ""}`.trim()}
      style={surfaceStyle}
    >
      {fullBleed ? null : (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_100%)] opacity-40" />
          <div className="absolute inset-x-6 bottom-0 h-px bg-white/12" />
          <div className="absolute inset-y-0 left-0 w-px bg-white/6" />
          <div className="absolute inset-y-0 right-0 w-px bg-white/6" />
        </div>
      )}
      {overlay}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </motion.div>
  );
}
```

## Page: Level Info Popup

**Source File:** `src/components/LevelInfoPopup.tsx`

```tsx
import { motion } from "framer-motion";
import type { BlockColor, LevelDefinition } from "../game/types";

type LevelInfoPopupProps = {
  level: LevelDefinition;
  bestScore: number;
  stars: number;
  isCompletedBonus?: boolean;
  isCompletedLevel?: boolean;
  onClose: () => void;
  onPlay: () => void;
};

export function LevelInfoPopup({
  level,
  bestScore,
  stars,
  isCompletedBonus = false,
  isCompletedLevel = false,
  onClose,
  onPlay,
}: LevelInfoPopupProps) {
  const colorGoals = Object.entries(level.targets.colors) as Array<[BlockColor, number]>;
  const isBonus = level.mode === "bonus";
  // Only bonus levels that are already claimed are blocked
  const canPlay = !(isBonus && isCompletedBonus);

  return (
    <div className="fixed inset-0 z-[9000] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.76, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        className="w-full max-w-[340px] rounded-3xl border border-white/25 bg-slate-900/90 p-5 text-white shadow-2xl"
      >
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-white/70">Level {level.id}</p>
        <h2 className="mt-1 text-center text-3xl font-black">Objectives</h2>
        <div className="mt-4 space-y-2 rounded-2xl bg-black/25 p-3">
          {colorGoals.map(([color, count]) => (
            <p key={color} className="flex items-center justify-between text-sm font-semibold capitalize">
              <span>{color} blocks</span>
              <span>{count}</span>
            </p>
          ))}
          {level.targets.boxes > 0 ? (
            <p className="flex items-center justify-between text-sm font-semibold">
              <span>Wooden boxes</span>
              <span>{level.targets.boxes}</span>
            </p>
          ) : null}
          <p className="flex items-center justify-between text-sm font-semibold text-yellow-200">
            <span>{isBonus ? "Timer" : "Moves"}</span>
            <span>{isBonus ? `${level.timeLimit ?? 30}s` : level.moves}</span>
          </p>
          {isCompletedLevel ? (
            <p className="rounded-lg border border-emerald-300/40 bg-emerald-500/20 px-2 py-1 text-center text-xs font-bold uppercase tracking-wide text-emerald-100">
              {isBonus && isCompletedBonus ? "Bonus Already Claimed" : "Level Already Completed"}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold">
          <span>Best Score: {bestScore}</span>
          <span className="text-yellow-300">{"â˜…".repeat(Math.max(0, stars))}{"â˜†".repeat(Math.max(0, 3 - stars))}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/25 bg-white/10 px-3 py-3 text-sm font-bold transition hover:bg-white/20"
          >
            Close
          </button>
          <button
            type="button"
            onClick={canPlay ? onPlay : undefined}
            disabled={!canPlay}
            className="rounded-xl bg-yellow-300 px-3 py-3 text-sm font-black text-slate-900 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
            style={{ pointerEvents: canPlay ? "auto" : "none" }}
          >
            {canPlay
              ? stars > 0
                ? "PLAY AGAIN â­"
                : "PLAY"
              : "CLAIMED âœ“"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

## Page: Main Menu / Adventure Path

**Source File:** `src/components/LevelMap.tsx`

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ECONOMY } from "../game/constants";
import { getEpisodeRange, getEpisodeThemeForLevel, LEVELS_PER_EPISODE } from "../game/content/episodeThemes";
import { MAP_LEVEL_CAP } from "../game/engine";
import type { ResponsiveLayoutMode } from "../game/layout";
import type { ChestReward, EconomyState, MissionCard, MissionId, SagaProgress } from "../game/types";
import { EconomyTopBar } from "./EconomyTopBar";
import GameMascot, { GAME_CHARACTERS } from "./GameMascot";
import { MissionBoard } from "./MissionBoard";
import { WorldMapModal } from "./WorldMapModal";

const ECONOMY_MAX_LIVES = ECONOMY.maxLives;
const CHARACTER_ROLE_BY_NAME: Record<string, string> = {
  Zenn: "Balanced tactician",
  Flick: "Speed burst runner",
  Crunch: "Heavy smash bruiser",
  Nova: "Blast wave ace",
};

type DockPanel = "menu" | "shop" | "collection" | "social" | "ranks" | null;

interface LevelMapProps {
  sagaProgress: SagaProgress;
  activeMapLevelId: number;
  economy: EconomyState;
  refillLabel: string;
  isMusicMuted: boolean;
  recentlyUnlockedLevel: number | null;
  onSelectLevel: (id: number) => void;
  onPlayCurrentLevel: () => void;
  onOpenSettings: () => void;
  onToggleMusic: () => void;
  missions: MissionCard[];
  pendingChestCount: number;
  nextPendingChest: ChestReward | null;
  lastOpenedChest: ChestReward | null;
  totalOpenedChests: number;
  onClaimMission: (missionId: MissionId) => void;
  onOpenPendingChest: () => void;
  selectedCharacterIndex: number;
  canUseDailyWheel: boolean;
  onSelectCharacter: (index: number) => void;
  onOpenDailyWheel: () => void;
  layoutMode?: ResponsiveLayoutMode;
  interactionLocked?: boolean;
  showDock?: boolean;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getEpisodeClearedCount(clearedThroughLevel: number, episodeStartLevel: number, episodeEndLevel: number) {
  return Math.max(0, Math.min(episodeEndLevel - episodeStartLevel + 1, clearedThroughLevel - episodeStartLevel + 1));
}

function getRewardLabel(levelId: number) {
  if (levelId % LEVELS_PER_EPISODE === 0) return "Episode Gate";
  if (levelId % 10 === 0) return "Royal Vault";
  return "Treasure Gate";
}

function QuickBadge({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="mania-glass-card rounded-[18px] border px-3 py-2.5"
      style={{
        borderColor: `${accent}38`,
        background: `linear-gradient(180deg, ${accent}18 0%, rgba(255,255,255,0.05) 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.18em] text-white/52">{label}</p>
      <p className="mania-title mt-1 text-[13px] font-black text-white">{value}</p>
    </div>
  );
}

function DockSheet({
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="mania-overlay-sheet mania-ui w-full max-w-[420px] overflow-hidden rounded-[30px] border text-white"
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-4">
        <div className="min-w-0">
          <p className="mania-kicker text-[9px] font-black uppercase tracking-[0.24em] text-cyan-100/72">{eyebrow}</p>
          <h3 className="mania-title mt-1 text-[24px] font-black leading-none text-white">{title}</h3>
          <p className="mt-2 text-[12px] font-semibold leading-5 text-white/74">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mania-bubbly-button shrink-0 rounded-full border px-3 py-2 text-[8px] font-black uppercase tracking-[0.18em]"
          data-tone="glass"
        >
          Close
        </button>
      </div>
      <div className="max-h-[58vh] overflow-y-auto px-4 pb-4 pt-4">{children}</div>
    </motion.div>
  );
}

function MiniIcon({ kind }: { kind: "shop" | "collection" | "social" | "ranks" | "play" | "map" | "menu" }) {
  if (kind === "play") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "map") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path
          d="M4.5 6.5 9.5 4l5 2.5L19.5 4v13.5L14.5 20l-5-2.5L4.5 20V6.5Zm5 10.9 5 2.5V6.6l-5-2.5v13.3Zm-4-10.1v11.1l3-1.5V5.8l-3 1.5Zm13 10.1V5.3l-3 1.5v11.1l3-1.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (kind === "menu") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "shop") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M5 8h14l-1 11H6L5 8Zm2-3h10l1 3H6l1-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "collection") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M7 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm10 1a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4 18c0-2.5 2.3-4 5.2-4 2.9 0 5.3 1.5 5.3 4M14 18c.2-1.5 1.7-2.8 3.8-2.8 1 0 1.8.2 2.6.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "social") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M7 17h10M6 6h12v8H9l-3 3V6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M7 5h10v4a5 5 0 0 1-10 0V5Zm5 9v5m-3 0h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Fab({
  label,
  kind,
  active,
  center = false,
  onClick,
}: {
  label: string;
  kind: "shop" | "collection" | "social" | "ranks" | "play" | "map";
  active: boolean;
  center?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={`mania-bubbly-button mania-fab mania-dock-fab flex shrink-0 flex-col items-center justify-center rounded-full border ${center ? "mania-dock-fab--center h-[74px] w-[74px]" : "h-[58px] w-[58px]"} ${active ? "is-active" : ""}`}
      data-tone={center ? "gold" : "amber"}
    >
      <MiniIcon kind={kind} />
      <span className={`mt-1 text-center font-black uppercase leading-[1.05] tracking-[0.12em] ${center ? "text-[8px]" : "text-[7px]"}`}>{label}</span>
    </motion.button>
  );
}

export default function LevelMap({
  sagaProgress,
  activeMapLevelId,
  economy,
  refillLabel,
  isMusicMuted,
  recentlyUnlockedLevel: _recentlyUnlockedLevel,
  onSelectLevel,
  onPlayCurrentLevel,
  onOpenSettings,
  onToggleMusic,
  missions,
  pendingChestCount,
  nextPendingChest,
  lastOpenedChest,
  totalOpenedChests,
  onClaimMission,
  onOpenPendingChest,
  selectedCharacterIndex,
  canUseDailyWheel,
  onSelectCharacter,
  onOpenDailyWheel,
  layoutMode = "default",
  interactionLocked = false,
  showDock = true,
}: LevelMapProps) {
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [activePanel, setActivePanel] = useState<DockPanel>(null);
  const isNarrowLayout = layoutMode !== "default";
  const isUltraNarrowLayout = layoutMode === "ultraNarrow";

  const { unlockedLevel, starsByLevel, bonusClaimedLevels = [] } = sagaProgress;
  const unlockedProgressLevel = Math.min(Math.max(1, unlockedLevel), MAP_LEVEL_CAP);
  const activeRouteLevel = Math.min(Math.max(1, activeMapLevelId), unlockedProgressLevel);
  const clearedThroughLevel = Math.min(Math.max(0, unlockedLevel - 1), MAP_LEVEL_CAP);
  const isChampionsMode = unlockedLevel > MAP_LEVEL_CAP;
  const episodeTheme = getEpisodeThemeForLevel(activeRouteLevel);
  const currentEpisode = episodeTheme.episodeNumber;
  const episodeTitle = episodeTheme.title;
  const { startLevel: episodeStartLevel, endLevel: episodeEndLevel } = getEpisodeRange(activeRouteLevel, MAP_LEVEL_CAP);
  const clearedInEpisode = getEpisodeClearedCount(clearedThroughLevel, episodeStartLevel, episodeEndLevel);
  const episodeProgressPercent = Math.min(100, (clearedInEpisode / LEVELS_PER_EPISODE) * 100);
  const completedNormalLevels = useMemo(() => Object.values(starsByLevel).filter((count) => count > 0).length, [starsByLevel]);
  const totalStarsEarned = useMemo(() => Object.values(starsByLevel).reduce((sum, count) => sum + count, 0), [starsByLevel]);
  const completedLevelsCount = completedNormalLevels + bonusClaimedLevels.length;
  const nextMilestoneLevel = Math.min(episodeEndLevel, Math.max(activeRouteLevel, Math.ceil(activeRouteLevel / 5) * 5));
  const nextRewardLabel = isChampionsMode ? "Crown Vault" : getRewardLabel(nextMilestoneLevel);
  const gems = Math.max(24, Math.round(totalStarsEarned * 2.4 + completedLevelsCount * 3 + activeRouteLevel * 2));
  const trophyCount = activeRouteLevel * 130 + totalStarsEarned * 22 + completedLevelsCount * 18;
  const leagueProgress = Math.max(0.18, Math.min(0.96, (((activeRouteLevel - 1) % 20) + 1) / 20));
  const activeCharacter = GAME_CHARACTERS[((selectedCharacterIndex % GAME_CHARACTERS.length) + GAME_CHARACTERS.length) % GAME_CHARACTERS.length];
  const rankLabel = isChampionsMode ? "Champions League" : "Ultra Diamond";
  const routeStatusLabel = isChampionsMode ? "Champions route unlocked." : `${completedLevelsCount} cleared | ${totalStarsEarned} stars`;
  const closePanel = () => setActivePanel(null);
  const togglePanel = (panel: Exclude<DockPanel, null>) => setActivePanel((current) => (current === panel ? null : panel));
  const canUseDock = !interactionLocked;
  const dock = (
    <div className={`pointer-events-none fixed left-1/2 bottom-0 z-50 w-full max-w-[430px] -translate-x-1/2 px-2.5 sm:px-3 ${isUltraNarrowLayout ? "pb-[calc(env(safe-area-inset-bottom)+10px)]" : "pb-[calc(env(safe-area-inset-bottom)+12px)]"}`}>
      <div className={`mania-floating-dock ${canUseDock ? "pointer-events-auto" : "pointer-events-none opacity-90"} w-full rounded-[32px] px-3 py-2 ${isNarrowLayout ? "grid grid-cols-3 justify-items-center gap-2" : "flex items-end justify-between gap-2"}`} data-layout={isNarrowLayout ? "grid" : "row"}>
        <Fab label="Shop" kind="shop" active={activePanel === "shop"} onClick={() => canUseDock && togglePanel("shop")} />
        <Fab label={isUltraNarrowLayout ? "Crew" : "Collection"} kind="collection" active={activePanel === "collection"} onClick={() => canUseDock && togglePanel("collection")} />
        <Fab label="Maps" kind="map" active={false} center onClick={() => { if (!canUseDock) return; closePanel(); setShowWorldMap(true); }} />
        <Fab label={isUltraNarrowLayout ? "Chat" : "Social"} kind="social" active={activePanel === "social"} onClick={() => canUseDock && togglePanel("social")} />
        <Fab label="Ranks" kind="ranks" active={activePanel === "ranks"} onClick={() => canUseDock && togglePanel("ranks")} />
      </div>
    </div>
  );

  return (
    <div className={`mania-ui relative w-full flex-col ${interactionLocked ? "flex-none overflow-visible" : "flex h-full min-h-0 overflow-hidden"}`}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: "easeOut" }}
        className="mania-map-stage absolute inset-0 overflow-hidden text-white"
        style={{
          background: episodeTheme.surface,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -24px 42px rgba(0,0,0,0.18), 0 0 0 1px ${episodeTheme.glow}`,
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -left-10 top-10 h-36 w-36 rounded-full bg-cyan-300/18 blur-3xl"
            animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute right-[-8%] top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/4 h-28 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(6,22,67,0.34)_0%,rgba(6,22,67,0.12)_56%,rgba(6,22,67,0)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(6,22,67,0)_0%,rgba(6,22,67,0.16)_48%,rgba(6,22,67,0.42)_100%)]" />
        </div>
      </motion.div>

      <div className={`relative z-30 px-2.5 sm:px-3 ${isUltraNarrowLayout ? "pt-[calc(env(safe-area-inset-top)+8px)]" : "pt-[calc(env(safe-area-inset-top)+10px)]"}`}>
        <div className={`pointer-events-none flex flex-col ${interactionLocked ? "gap-2" : "gap-2.5"}`}>
          <div className="pointer-events-auto">
            <EconomyTopBar
              coins={economy.coins}
              lives={economy.lives}
              maxLives={ECONOMY_MAX_LIVES}
              refillLabel={refillLabel}
              currentLevel={activeRouteLevel}
              totalStarsEarned={totalStarsEarned}
              completedLevelsCount={completedLevelsCount}
              layoutMode={layoutMode}
            />
          </div>

          <div
            className={`pointer-events-auto ${isUltraNarrowLayout ? "flex flex-col gap-2" : "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"}`}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <div className="mania-glass-card mania-kicker rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em]" style={{ borderColor: `${episodeTheme.accent}40`, color: episodeTheme.accent }}>
                Episode {String(currentEpisode).padStart(2, "0")}
              </div>
              <div className="mania-glass-card mania-kicker rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/78">
                {episodeTheme.routeLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={() => togglePanel("menu")}
              className={`mania-bubbly-button mania-floating-icon flex shrink-0 items-center justify-center rounded-full border text-white ${isUltraNarrowLayout ? "h-11 w-11 self-start" : "h-10 w-10"}`}
              data-tone="glass"
              aria-label="Open captain menu"
            >
              <MiniIcon kind="menu" />
            </button>
          </div>

          <div
            className={`pointer-events-auto ${isUltraNarrowLayout ? "flex flex-col gap-2" : "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"}`}
          >
            <div className="min-w-0">
              <h1 className={`mania-title font-black leading-none text-white ${isNarrowLayout ? "text-[26px]" : "text-[28px]"}`}>Adventure Path</h1>
              <p className={`mt-1 font-semibold text-white/78 ${isNarrowLayout ? "text-[12px] leading-5" : "text-[11px] leading-5"}`}>
                Selected Level {activeRouteLevel}. Use the center Maps button below to browse the full route and choose your next level.
              </p>
            </div>

            <div className={`mania-glass-card shrink-0 rounded-[20px] border border-white/12 bg-white/8 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ${isUltraNarrowLayout ? "self-start px-3.5 py-2.5" : "px-3 py-2"}`}>
              <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.18em] text-white/52">Episode Fill</p>
              <p className={`mania-title mt-1 font-black text-white ${isNarrowLayout ? "text-[16px]" : "text-[15px]"}`}>{Math.round(episodeProgressPercent)}%</p>
            </div>
          </div>
        </div>
      </div>

      {!interactionLocked ? <div className="relative z-10 flex min-h-0 flex-1" /> : null}

      <AnimatePresence>
        {activePanel ? (
          <div
            className={`mania-overlay-backdrop absolute inset-0 z-40 flex items-end justify-center px-2.5 pt-[88px] sm:px-3 ${isNarrowLayout ? "pb-[calc(env(safe-area-inset-bottom)+136px)]" : "pb-[calc(env(safe-area-inset-bottom)+92px)]"}`}
            onClick={closePanel}
          >
            <div onClick={(event) => event.stopPropagation()}>
              {activePanel === "menu" ? (
                <DockSheet eyebrow="Captain Menu" title="Harbor Control" subtitle="The HUD stays lean while rank, crew, and settings live here." onClose={closePanel}>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickBadge label="Rank" value={rankLabel} accent="#a78bfa" />
                    <QuickBadge label="Trophies" value={formatCompact(trophyCount)} accent="#facc15" />
                    <QuickBadge label="Route" value={episodeTitle} accent="#7dd3fc" />
                    <QuickBadge label="Stars" value={`${totalStarsEarned}`} accent="#34d399" />
                  </div>
                  <div className="mania-glass-card mt-3 rounded-[20px] border border-white/10 bg-white/6 px-3 py-3">
                    <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.18em] text-white/52">Active Captain</p>
                    <p className="mania-title mt-1 text-[15px] font-black text-white">{activeCharacter.name}</p>
                    <p className="mt-1 text-[11px] font-semibold text-white/74">{CHARACTER_ROLE_BY_NAME[activeCharacter.name]}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <motion.button
                      type="button"
                      onClick={() => { closePanel(); onOpenDailyWheel(); }}
                      animate={canUseDailyWheel ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0 rgba(250,204,21,0)", "0 0 18px rgba(250,204,21,0.42)", "0 0 0 rgba(250,204,21,0)"] } : { scale: 1, boxShadow: "none" }}
                      transition={canUseDailyWheel ? { duration: 1.15, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                      className="mania-bubbly-button rounded-[18px] border px-2 py-3 text-[8px] font-black uppercase tracking-[0.16em]"
                      data-tone="gold"
                    >
                      {canUseDailyWheel ? "Daily Spin" : "Spin Used"}
                    </motion.button>
                    <button type="button" onClick={onToggleMusic} className="mania-bubbly-button rounded-[18px] border px-2 py-3 text-[8px] font-black uppercase tracking-[0.16em]" data-tone="cyan">
                      {isMusicMuted ? "Sound Off" : "Sound On"}
                    </button>
                    <button type="button" onClick={() => { closePanel(); onOpenSettings(); }} className="mania-bubbly-button rounded-[18px] border px-2 py-3 text-[8px] font-black uppercase tracking-[0.16em]" data-tone="glass">
                      Settings
                    </button>
                  </div>
                </DockSheet>
              ) : null}

              {activePanel === "shop" ? (
                <DockSheet eyebrow="Supply Shop" title="Treasure Dock" subtitle="Mission rewards, treasure boxes, and extra route goodies live here." onClose={closePanel}>
                  <div className="grid grid-cols-3 gap-2">
                    <QuickBadge label="Coins" value={formatCompact(economy.coins)} accent="#facc15" />
                    <QuickBadge label="Gems" value={formatCompact(gems)} accent="#d089ff" />
                    <QuickBadge label="Boxes" value={`${pendingChestCount}`} accent="#fb7185" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (pendingChestCount > 0) {
                          closePanel();
                          onOpenPendingChest();
                        } else {
                          closePanel();
                          onOpenDailyWheel();
                        }
                      }}
                      className="mania-bubbly-button rounded-[18px] border px-3 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-white"
                      data-tone="gold"
                    >
                      {pendingChestCount > 0 ? "Open Pending Box" : canUseDailyWheel ? "Spin Free Wheel" : "View Missions"}
                    </button>
                    <button type="button" onClick={() => { closePanel(); setShowWorldMap(true); }} className="mania-bubbly-button rounded-[18px] border px-3 py-3 text-[9px] font-black uppercase tracking-[0.16em]" data-tone="glass">
                      Inspect Route
                    </button>
                  </div>
                  <MissionBoard
                    compact
                    missions={missions}
                    pendingChestCount={pendingChestCount}
                    nextPendingChest={nextPendingChest}
                    lastOpenedChest={lastOpenedChest}
                    totalOpenedChests={totalOpenedChests}
                    onClaimMission={onClaimMission}
                    onOpenPendingChest={() => { closePanel(); onOpenPendingChest(); }}
                  />
                </DockSheet>
              ) : null}

              {activePanel === "collection" ? (
                <DockSheet eyebrow="Collection" title="Crew Roster" subtitle="Tap a hero to select who walks the map, appears in gameplay, and celebrates your wins." onClose={closePanel}>
                  <div className="grid grid-cols-2 gap-2">
                    {GAME_CHARACTERS.map((character, index) => {
                      const isActive = index === ((selectedCharacterIndex % GAME_CHARACTERS.length) + GAME_CHARACTERS.length) % GAME_CHARACTERS.length;
                      return (
                        <button
                          key={character.name}
                          type="button"
                          onClick={() => onSelectCharacter(index)}
                          className="mania-glass-card rounded-[22px] border px-3 py-3 text-left"
                          style={{
                            borderColor: isActive ? "rgba(125,211,252,0.56)" : "rgba(255,255,255,0.14)",
                            background: isActive ? "linear-gradient(180deg, rgba(125,211,252,0.24) 0%, rgba(255,255,255,0.06) 100%)" : "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center overflow-visible rounded-[18px] border border-white/14 bg-white/6">
                              <GameMascot
                                mascotState={isActive ? "excited" : "idle"}
                                characterIndex={index}
                                size={56}
                                showNameBadge={false}
                                interactive
                                enableIdleWave={isActive}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.16em] text-white/52">{isActive ? "Active" : "Ready"}</p>
                              <p className="mania-title mt-1 text-[15px] font-black text-white">{character.name}</p>
                              <p className="mt-1 text-[10px] font-semibold leading-4 text-white/74">{CHARACTER_ROLE_BY_NAME[character.name]}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </DockSheet>
              ) : null}

              {activePanel === "social" ? (
                <DockSheet eyebrow="Social" title="Crew Channel" subtitle="A simple social dock for now so the floating button has a real destination." onClose={closePanel}>
                  <div className="mania-glass-card rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                    <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.2em] text-white/52">Route Sync</p>
                    <p className="mania-title mt-2 text-[18px] font-black text-white">{routeStatusLabel}</p>
                    <p className="mt-2 text-[12px] font-semibold leading-5 text-white/74">Episode {String(currentEpisode).padStart(2, "0")} is on the board. This dock is reserved for friends, crews, and shared events next.</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <QuickBadge label="Episode Fill" value={`${Math.round(episodeProgressPercent)}%`} accent="#7dd3fc" />
                    <QuickBadge label="Current Route" value={episodeTitle} accent="#34d399" />
                  </div>
                </DockSheet>
              ) : null}

              {activePanel === "ranks" ? (
                <DockSheet eyebrow="Ranks" title={rankLabel} subtitle="Detailed stats are parked here so the top HUD can stay thin and fast." onClose={closePanel}>
                  <div className="mania-glass-card rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.18em] text-white/52">Arena Progress</p>
                        <p className="mania-title mt-2 text-[20px] font-black text-white">{episodeTitle}</p>
                        <p className="mt-1 text-[12px] font-semibold text-white/74">{formatCompact(trophyCount)} trophies</p>
                      </div>
                      <div className="mania-glass-card mania-kicker rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-white/80">
                        {completedLevelsCount} cleared
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${leagueProgress * 100}%` }}
                        transition={{ duration: 0.42, ease: "easeOut" }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(107,227,255,0.98)_0%,rgba(125,211,252,0.98)_55%,rgba(186,230,253,0.98)_100%)] shadow-[0_0_14px_rgba(103,232,249,0.34)]"
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <QuickBadge label="Current Level" value={`${activeRouteLevel}`} accent="#7dd3fc" />
                    <QuickBadge label="Episode Fill" value={`${Math.round(episodeProgressPercent)}%`} accent="#34d399" />
                    <QuickBadge label="Stars" value={`${totalStarsEarned}`} accent="#facc15" />
                    <QuickBadge label="Next Reward" value={nextRewardLabel} accent="#fb7185" />
                  </div>
                </DockSheet>
              ) : null}
            </div>
          </div>
        ) : null}
      </AnimatePresence>

      <WorldMapModal
        isOpen={showWorldMap}
        onClose={() => setShowWorldMap(false)}
        currentLevel={activeRouteLevel}
        unlockedLevel={unlockedProgressLevel}
        totalLevels={MAP_LEVEL_CAP}
        starsByLevel={starsByLevel}
        selectedCharacterIndex={selectedCharacterIndex}
        onSelectLevel={onSelectLevel}
        theme={episodeTheme}
        layoutMode={layoutMode}
      />
      {showDock && typeof document !== "undefined" ? createPortal(dock, document.body) : null}
    </div>
  );
}
```

## Page: Missions Board

**Source File:** `src/components/MissionBoard.tsx`

```tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { formatRewardSummary } from "../game/metaProgression";
import type { ChestReward, MissionCard, MissionId } from "../game/types";

type MissionBoardProps = {
  missions: MissionCard[];
  pendingChestCount: number;
  nextPendingChest: ChestReward | null;
  lastOpenedChest: ChestReward | null;
  totalOpenedChests: number;
  onClaimMission: (missionId: MissionId) => void;
  onOpenPendingChest: () => void;
  compact?: boolean;
};

function MissionAction({
  mission,
  onClaim,
}: {
  mission: MissionCard;
  onClaim: (missionId: MissionId) => void;
}) {
  const canClaim = !mission.claimed && mission.progress >= mission.target;
  const statusLabel = mission.claimed ? "Claimed" : canClaim ? "Claim" : `${mission.target - mission.progress} Left`;

  return (
    <button
      type="button"
      onClick={() => {
        if (canClaim) {
          onClaim(mission.id);
        }
      }}
      disabled={!canClaim}
      className="mania-bubbly-button mt-2 w-full rounded-full border px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] transition"
      data-tone={canClaim ? "cyan" : mission.claimed ? "gold" : "glass"}
      style={{
        borderColor: canClaim ? `${mission.accent}66` : "rgba(255,255,255,0.12)",
        background: canClaim
          ? `linear-gradient(180deg, ${mission.accent}38 0%, rgba(255,255,255,0.08) 100%)`
          : mission.claimed
            ? "linear-gradient(180deg, rgba(74,222,128,0.22) 0%, rgba(255,255,255,0.06) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        color: canClaim ? "#ffffff" : mission.claimed ? "#bbf7d0" : "rgba(255,255,255,0.56)",
        cursor: canClaim ? "pointer" : "default",
        boxShadow: canClaim ? `0 0 16px ${mission.accent}24` : "none",
      }}
    >
      {statusLabel}
    </button>
  );
}

export function MissionBoard({
  missions,
  pendingChestCount,
  nextPendingChest,
  lastOpenedChest,
  totalOpenedChests,
  onClaimMission,
  onOpenPendingChest,
  compact = false,
}: MissionBoardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const readyClaims = missions.filter((mission) => !mission.claimed && mission.progress >= mission.target).length;
  const headerSummary =
    pendingChestCount > 0
      ? `${pendingChestCount} treasure ${pendingChestCount === 1 ? "box" : "boxes"} waiting.`
      : readyClaims > 0
        ? `${readyClaims} mission ${readyClaims === 1 ? "reward" : "rewards"} ready.`
        : compact
          ? "Tap to review objectives and rewards."
          : "Clear objectives to stack extra rewards.";

  return (
    <div
      className="mania-glass-card mt-3 rounded-[22px] border border-white/10 px-3 pb-3 pt-3"
      style={{
        background: "linear-gradient(180deg, rgba(6,23,69,0.46) 0%, rgba(6,23,69,0.18) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 20px rgba(0,0,0,0.16)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="mania-kicker text-[9px] font-black uppercase tracking-[0.22em] text-white/58">Mission Deck</p>
          <p className="mt-1 text-[11px] font-semibold leading-5 text-white/76">{headerSummary}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {pendingChestCount > 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onOpenPendingChest}
              className="mania-bubbly-button rounded-full border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-white"
              data-tone="gold"
              style={{
                borderColor: "rgba(253,224,71,0.34)",
                background: "linear-gradient(180deg, rgba(253,224,71,0.22) 0%, rgba(255,255,255,0.08) 100%)",
                boxShadow: "0 0 18px rgba(253,224,71,0.16)",
              }}
            >
              {nextPendingChest ? "Open Box" : "Open"}
            </motion.button>
          ) : null}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="mania-bubbly-button rounded-full border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-white"
            data-tone="glass"
          >
            {isExpanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <>
          {pendingChestCount === 0 ? (
            <div className="mt-3 rounded-[18px] border border-white/10 bg-white/6 px-3 py-2.5">
              <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.16em] text-white/52">Treasure Log</p>
              <p className="mania-title mt-1 text-[12px] font-black text-white/88">
                {lastOpenedChest ? lastOpenedChest.label : `${totalOpenedChests} opened`}
              </p>
            </div>
          ) : null}

          <div className={`mt-3 grid ${compact ? "grid-cols-1" : "grid-cols-3"} gap-2`}>
            {missions.map((mission) => {
              const progressPercent = mission.target > 0 ? Math.min(100, (mission.progress / mission.target) * 100) : 0;

              return (
                <div
                  key={mission.id}
                  className="mania-glass-card rounded-[20px] border px-3 py-3"
                  style={{
                    borderColor: `${mission.accent}2f`,
                    background: `linear-gradient(180deg, ${mission.accent}14 0%, rgba(255,255,255,0.04) 100%)`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.16em] text-white/52">{mission.laneLabel}</p>
                      <p className="mania-title mt-1 text-[12px] font-black leading-4 text-white">{mission.title}</p>
                    </div>
                    <p className="mania-title shrink-0 text-[10px] font-black text-white">{mission.progress}/{mission.target}</p>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: mission.accent, boxShadow: `0 0 10px ${mission.accent}` }}
                    />
                  </div>

                  <p className="mt-2 text-[10px] font-semibold leading-4 text-white/74">
                    {formatRewardSummary(mission.reward)}
                  </p>

                  <MissionAction mission={mission} onClaim={onClaimMission} />
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
```

## Page: Out Of Lives Popup

**Source File:** `src/components/OutOfLivesPopup.tsx`

```tsx
import { motion } from "framer-motion";

type OutOfLivesPopupProps = {
  canAfford: boolean;
  cost: number;
  onClose: () => void;
  onBuy: () => void;
};

export function OutOfLivesPopup({ canAfford, cost, onClose, onBuy }: OutOfLivesPopupProps) {
  return (
    <div className="fixed inset-0 z-[9000] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.76, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        className="w-full max-w-[330px] rounded-3xl border border-white/25 bg-slate-900/92 p-5 text-white shadow-2xl"
      >
        <h2 className="text-center text-3xl font-black">Out of Lives!</h2>
        <p className="mt-2 text-center text-sm font-semibold text-white/80">Wait for refill or buy a full refill for {cost} coins.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/25 bg-white/10 px-3 py-3 text-sm font-bold transition hover:bg-white/20"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onBuy}
            className={`rounded-xl px-3 py-3 text-sm font-black transition ${canAfford ? "bg-yellow-300 text-slate-900 hover:bg-yellow-200" : "bg-white/20 text-white/50"}`}
          >
            Buy {cost} ðŸª™
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

## Page: Pause Menu

**Source File:** `src/components/PauseMenu.tsx`

```tsx
import { motion } from "framer-motion";

type PauseMenuProps = {
  onResume: () => void;
  onSettings: () => void;
  onQuitLevel: () => void;
};

export function PauseMenu({ onResume, onSettings, onQuitLevel }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-[9000] grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 26 }}
        className="mania-overlay-sheet mania-ui w-full max-w-[300px] rounded-3xl border border-white/30 p-5 text-white shadow-2xl"
      >
        <h2 className="mania-title text-center text-2xl font-black">Paused</h2>
        <div className="mt-5 grid gap-2.5">
          <button type="button" onClick={onResume} className="mania-bubbly-button rounded-xl px-4 py-3 text-sm font-black text-emerald-950" data-tone="gold">
            Resume
          </button>
          <button type="button" onClick={onSettings} className="mania-bubbly-button rounded-xl px-4 py-3 text-sm font-black text-slate-900" data-tone="cyan">
            Settings
          </button>
          <button type="button" onClick={onQuitLevel} className="mania-bubbly-button rounded-xl border px-4 py-3 text-sm font-bold text-white" data-tone="glass">
            Quit Level (-1 Life)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

## Page: Launch Window

**Source File:** `src/components/pregame/PreGameScreen.tsx`

```tsx
import { motion } from "framer-motion";
import { useState } from "react";
import GameMascot, { GAME_CHARACTERS } from "../GameMascot";
import { getEpisodeThemeForLevel } from "../../game/content/episodeThemes";
import type { BlockColor, EconomyState, LevelDefinition } from "../../game/types";

const PANEL_EASE = [0.22, 1, 0.36, 1] as const;

const COLOR_SWATCH: Record<BlockColor, string> = {
  red: "#ff6a8c",
  blue: "#5dc9ff",
  green: "#56dd79",
  yellow: "#ffd95d",
  purple: "#bf7cff",
};

const CHARACTER_ROLE_BY_NAME: Record<string, string> = {
  Zenn: "Balanced tactician",
  Flick: "Speed runner",
  Crunch: "Heavy breaker",
  Nova: "Blast wave ace",
};

type PreGameScreenProps = {
  level: LevelDefinition;
  bestScore: number;
  stars: number;
  isCompletedBonus?: boolean;
  isCompletedLevel?: boolean;
  selectedCharacterIndex: number;
  economy: EconomyState;
  onBack: () => void;
  onStart: () => void;
};

type ObjectiveChip = {
  label: string;
  value: string;
  accent: string;
  icon: "block" | "crate" | "moves" | "timer";
};

type LaunchBoosterId = "disco" | "rocket" | "hammer";

function buildObjectiveChips(level: LevelDefinition) {
  const chips: ObjectiveChip[] = [];

  for (const [color, count] of Object.entries(level.targets.colors) as Array<[BlockColor, number]>) {
    if (count <= 0) continue;
    chips.push({
      label: `${color} blocks`,
      value: `${count}`,
      accent: COLOR_SWATCH[color],
      icon: "block",
    });
  }

  if (level.targets.boxes > 0) {
    chips.push({
      label: "wood crates",
      value: `${level.targets.boxes}`,
      accent: "#f59e0b",
      icon: "crate",
    });
  }

  chips.push({
    label: level.mode === "bonus" ? "timer" : "moves",
    value: level.mode === "bonus" ? `${level.timeLimit ?? 30}s` : `${level.moves}`,
    accent: "#f472b6",
    icon: level.mode === "bonus" ? "timer" : "moves",
  });

  return chips;
}

function formatScore(score: number) {
  return new Intl.NumberFormat("en-US").format(score);
}

function ObjectiveIcon({ icon, accent }: { icon: ObjectiveChip["icon"]; accent: string }) {
  if (icon === "crate") {
    return (
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[14px] border"
        style={{ borderColor: `${accent}55`, background: `linear-gradient(180deg, ${accent}28 0%, rgba(255,255,255,0.04) 100%)`, color: accent }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M5 7h14v10H5V7Zm0 0 7 5 7-5M12 12v5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (icon === "moves") {
    return (
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[14px] border"
        style={{ borderColor: `${accent}55`, background: `linear-gradient(180deg, ${accent}28 0%, rgba(255,255,255,0.04) 100%)`, color: accent }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (icon === "timer") {
    return (
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[14px] border"
        style={{ borderColor: `${accent}55`, background: `linear-gradient(180deg, ${accent}28 0%, rgba(255,255,255,0.04) 100%)`, color: accent }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="13" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 13V9m0-5h0M9 3h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-[14px] border"
      style={{ borderColor: `${accent}55`, background: `linear-gradient(180deg, ${accent}28 0%, rgba(255,255,255,0.04) 100%)`, color: accent }}
    >
      <div className="h-5 w-5 rounded-[7px]" style={{ background: accent, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.18)" }} />
    </div>
  );
}

function BoosterGlyph({ booster }: { booster: LaunchBoosterId }) {
  if (booster === "disco") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="7.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        <path d="M12 4.6v2.4M12 17v2.4M4.6 12H7M17 12h2.4M6.7 6.7l1.7 1.7M15.6 15.6l1.7 1.7M17.3 6.7l-1.7 1.7M8.4 15.6l-1.7 1.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (booster === "rocket") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M12 4c3.2 1.8 5.1 5 5.1 8.9L12 20l-5.1-7.1C6.9 9 8.8 5.8 12 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 8.5v6.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m8.7 15.6-1.5 2.6m8.6-2.6 1.5 2.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M15 4c3.6 3.4 4.6 7.8 1.8 10.6l-2.4 2.4-7.8-7.8 2.4-2.4C11.8 4 16.2.4 19.6 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4.6 18.8 4.2-4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BoosterButton({
  booster,
  label,
  accent,
  isSelected,
  subtitle,
  onClick,
}: {
  booster: LaunchBoosterId;
  label: string;
  accent: string;
  isSelected: boolean;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mania-bubbly-button mania-booster-button flex flex-col items-center justify-center rounded-[22px] border px-2 py-2 text-center ${isSelected ? "is-active" : ""}`}
      data-tone={isSelected ? "gold" : "glass"}
      aria-pressed={isSelected}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[16px]"
        style={{ background: `${accent}1f`, color: accent, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)" }}
      >
        <BoosterGlyph booster={booster} />
      </div>
      <span className="mania-kicker mt-2 text-[8px] font-black uppercase tracking-[0.16em] text-white/86">{label}</span>
      <span className="mt-1 text-[9px] font-semibold leading-none text-white/58">{subtitle}</span>
    </button>
  );
}

export function PreGameScreen({
  level,
  bestScore,
  stars,
  isCompletedBonus = false,
  isCompletedLevel = false,
  selectedCharacterIndex,
  economy,
  onBack,
  onStart,
}: PreGameScreenProps) {
  const [selectedBooster, setSelectedBooster] = useState<LaunchBoosterId | null>(null);
  const episodeTheme = getEpisodeThemeForLevel(level.id);
  const playable = !(level.mode === "bonus" && isCompletedBonus);
  const currentCharacterIndex = ((selectedCharacterIndex % GAME_CHARACTERS.length) + GAME_CHARACTERS.length) % GAME_CHARACTERS.length;
  const activeCharacter = GAME_CHARACTERS[currentCharacterIndex];
  const objectiveChips = buildObjectiveChips(level);
  const starLine = `${"\u2605".repeat(Math.max(0, stars))}${"\u2606".repeat(Math.max(0, 3 - stars))}`;
  const launchTitle = `Level ${level.id}: ${episodeTheme.title}`;
  const boosterSubtitle = {
    disco: "burst",
    rocket: "line clear",
    hammer: `${economy.inventory.hammer} owned`,
  } satisfies Record<LaunchBoosterId, string>;

  return (
    <div className="mania-ui fixed inset-0 z-[220] flex flex-col items-center justify-start px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-[calc(env(safe-area-inset-top)+56px)] text-white">
      <div className="mania-pregame-scrim absolute inset-0" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: PANEL_EASE }}
        className="mania-pregame-panel pointer-events-auto relative z-20 flex w-full max-w-[350px] max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-92px)] flex-col overflow-y-auto rounded-[32px] px-4 pb-4 pt-4"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28" style={{ background: episodeTheme.sceneGradient, opacity: 0.92 }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_22%,rgba(7,12,32,0.2)_100%)]" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.26em]" style={{ color: episodeTheme.accentSoft }}>
              Launch Window
            </p>
            <h1 className="mania-title mt-2 text-[24px] font-black leading-[1.02] text-white">{launchTitle}</h1>
            <p className="mt-2 text-[10px] font-semibold leading-4 text-white/72">{CHARACTER_ROLE_BY_NAME[activeCharacter.name]}</p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mania-bubbly-button mania-floating-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-white"
            data-tone="glass"
            aria-label="Close level launch window"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="relative z-10 mt-4 flex items-center gap-3 rounded-[24px] border border-white/14 bg-white/8 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] border border-white/12 bg-white/8">
            <GameMascot
              mascotState={playable ? "wave" : "sad"}
              characterIndex={currentCharacterIndex}
              size={68}
              showNameBadge={false}
              interactive
              enableIdleWave={playable}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.2em] text-white/56">Route Status</p>
            <p className="mania-title mt-2 text-[18px] font-black leading-none text-white">{activeCharacter.name}</p>
            <p className="mt-2 text-[11px] font-semibold text-white/70">
              Best {bestScore > 0 ? formatScore(bestScore) : "New"} Â· Stars {starLine}
            </p>
            {isCompletedLevel ? (
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200/84">
                {playable ? "Replay ready" : "Already claimed"}
              </p>
            ) : null}
          </div>
        </div>

        <section className="relative z-10 mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.22em] text-white/56">Objectives</p>
            <div className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/70">
              {level.mode === "bonus" ? "Bonus" : "Main Route"}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {objectiveChips.map((chip) => (
              <div
                key={`${chip.label}-${chip.value}`}
                className="flex items-center gap-2 rounded-[20px] border px-3 py-3"
                style={{
                  borderColor: `${chip.accent}48`,
                  background: `linear-gradient(180deg, ${chip.accent}18 0%, rgba(255,255,255,0.04) 100%)`,
                }}
              >
                <ObjectiveIcon icon={chip.icon} accent={chip.accent} />
                <div className="min-w-0">
                  <p className="mania-title text-[16px] font-black leading-none text-white">{chip.value}</p>
                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/68">{chip.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="mania-kicker text-[8px] font-black uppercase tracking-[0.22em] text-white/56">Booster Selection</p>
            <div className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/70">
              Optional
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <BoosterButton booster="disco" label="Disco" accent="#c084fc" subtitle={boosterSubtitle.disco} isSelected={selectedBooster === "disco"} onClick={() => setSelectedBooster((current) => current === "disco" ? null : "disco")} />
            <BoosterButton booster="rocket" label="Rocket" accent="#f59e0b" subtitle={boosterSubtitle.rocket} isSelected={selectedBooster === "rocket"} onClick={() => setSelectedBooster((current) => current === "rocket" ? null : "rocket")} />
            <BoosterButton booster="hammer" label="Hammer" accent="#7dd3fc" subtitle={boosterSubtitle.hammer} isSelected={selectedBooster === "hammer"} onClick={() => setSelectedBooster((current) => current === "hammer" ? null : "hammer")} />
          </div>
        </section>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={playable ? onStart : undefined}
          disabled={!playable}
          className="mania-bubbly-button relative z-10 mt-5 rounded-[24px] px-5 py-4 text-[13px] font-black uppercase tracking-[0.22em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-55"
          data-tone="gold"
        >
          {playable ? "Start" : "Claimed"}
        </motion.button>
      </motion.div>
    </div>
  );
}
```

## Component: Reward Toast

**Source File:** `src/components/RewardToast.tsx`

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { formatRewardSummary } from "../game/metaProgression";
import type { RewardBundle } from "../game/types";

type RewardToastProps = {
  isOpen: boolean;
  title: string;
  reward: RewardBundle;
};

export function RewardToast({ isOpen, title, reward }: RewardToastProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-none fixed inset-x-0 top-4 z-[9200] flex justify-center px-4"
        >
          <div
            className="w-full max-w-[320px] rounded-[22px] border border-white/16 px-4 py-3 text-white"
            style={{
              background: "linear-gradient(165deg, rgba(14,56,160,0.95) 0%, rgba(37,99,235,0.94) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 18px 28px rgba(0,0,0,0.2)",
            }}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-100/78">Rewards Claimed</p>
            <p className="mt-1 text-sm font-black text-white">{title}</p>
            <p className="mt-1 text-[11px] font-semibold text-white/70">{formatRewardSummary(reward)}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

## Component: Winding Map Trail

**Source File:** `src/components/ScrollableMap.tsx`

```tsx
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ResponsiveLayoutMode } from "../game/layout";
import GameMascot from "./GameMascot";

const LEVELS_PER_BACKGROUND = 20;
const MAX_BACKGROUND_INDEX = 20;
const BACKGROUND_URL_BASE =
  "https://raw.githubusercontent.com/rainbum/Rainbum.github.io/main/map-bg";
const PATH_ANCHORS = [15, 80, 24, 82, 20, 76];
const SKY_LAYER_RATE = 0.1;
const FAR_LAYER_RATE = 0.2;
const MID_LAYER_RATE = 0.38;
const NEAR_LAYER_RATE = 0.58;

type ScrollableMapProps = {
  currentLevel: number;
  totalLevels: number;
  unlockedLevel: number;
  starsByLevel: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  selectedCharacterIndex?: number;
  variant?: "panel" | "hub" | "fullscreen";
  showHeader?: boolean;
  layoutMode?: ResponsiveLayoutMode;
};

type MapPoint = {
  level: number;
  top: number;
  centerY: number;
  x: number;
  stars: number;
  isCurrent: boolean;
  isUnlocked: boolean;
};

function getBackgroundIndex(level: number) {
  const episodeIndex = Math.ceil(level / LEVELS_PER_BACKGROUND);
  return ((episodeIndex - 1) % MAX_BACKGROUND_INDEX) + 1;
}

function getNodeX(index: number) {
  const anchor = PATH_ANCHORS[index % PATH_ANCHORS.length];
  const wave = Math.sin(index * 0.84) * 6.5 + Math.cos(index * 0.33) * 3.4;
  return Math.max(16, Math.min(84, anchor + wave));
}

function buildPath(points: MapPoint[]) {
  if (points.length === 0) {
    return "";
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.centerY}`;
    }

    const previousPoint = points[index - 1];
    const gap = point.centerY - previousPoint.centerY;
    const controlOffset = Math.min(54, gap * 0.48);
    const travel = point.x - previousPoint.x;
    const controlX1 = previousPoint.x + travel * 0.32;
    const controlX2 = previousPoint.x + travel * 0.76;

    return `${path} C ${controlX1} ${previousPoint.centerY + controlOffset}, ${controlX2} ${point.centerY - controlOffset}, ${point.x} ${point.centerY}`;
  }, "");
}

export function ScrollableMap({
  currentLevel,
  totalLevels,
  unlockedLevel,
  starsByLevel,
  onSelectLevel,
  selectedCharacterIndex,
  variant = "panel",
  showHeader = true,
  layoutMode = "default",
}: ScrollableMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const svgIdBase = useId().replace(/:/g, "");
  const trailGradientId = `${svgIdBase}-trail-gradient`;
  const trailGlowId = `${svgIdBase}-trail-glow`;
  const isNarrowLayout = layoutMode !== "default";
  const isUltraNarrowLayout = layoutMode === "ultraNarrow";
  const nodeSize = isUltraNarrowLayout ? 52 : isNarrowLayout ? 54 : 58;
  const levelSpacing = isUltraNarrowLayout ? 82 : isNarrowLayout ? 88 : 94;
  const mapPaddingTop = isUltraNarrowLayout ? 36 : isNarrowLayout ? 40 : 44;
  const mapPaddingBottom = isUltraNarrowLayout ? 52 : isNarrowLayout ? 56 : 64;

  const points = useMemo<MapPoint[]>(
    () =>
      Array.from({ length: totalLevels }, (_, index) => {
        const level = index + 1;
        const top = mapPaddingTop + index * levelSpacing;
        const designWidth =
          variant === "fullscreen"
            ? isUltraNarrowLayout
              ? 324
              : isNarrowLayout
              ? 352
              : 388
            : variant === "hub"
            ? isUltraNarrowLayout
              ? 310
              : isNarrowLayout
              ? 336
              : 364
            : isUltraNarrowLayout
            ? 294
            : isNarrowLayout
            ? 316
            : 340;

        return {
          level,
          top,
          centerY: top + nodeSize / 2,
          x: (getNodeX(index) / 100) * designWidth,
          stars: Math.max(0, Math.min(3, starsByLevel[level] ?? 0)),
          isCurrent: level === currentLevel,
          isUnlocked: level <= unlockedLevel,
        };
      }),
    [currentLevel, isNarrowLayout, isUltraNarrowLayout, levelSpacing, mapPaddingTop, nodeSize, starsByLevel, totalLevels, unlockedLevel, variant],
  );

  const designWidth = useMemo(
    () =>
      variant === "fullscreen"
        ? isUltraNarrowLayout
          ? 324
          : isNarrowLayout
          ? 352
          : 388
        : variant === "hub"
        ? isUltraNarrowLayout
          ? 310
          : isNarrowLayout
          ? 336
          : 364
        : isUltraNarrowLayout
        ? 294
        : isNarrowLayout
        ? 316
        : 340,
    [isNarrowLayout, isUltraNarrowLayout, variant],
  );

  const totalHeight = useMemo(
    () => mapPaddingTop + mapPaddingBottom + Math.max(0, totalLevels - 1) * levelSpacing + nodeSize,
    [levelSpacing, mapPaddingBottom, mapPaddingTop, nodeSize, totalLevels],
  );

  const backgroundSlices = useMemo(
    () =>
      Array.from({ length: Math.ceil(totalLevels / LEVELS_PER_BACKGROUND) }, (_, index) => {
        const startLevel = index * LEVELS_PER_BACKGROUND + 1;
        const endLevel = Math.min(startLevel + LEVELS_PER_BACKGROUND - 1, totalLevels);

        return {
          id: startLevel,
          top: Math.max(0, mapPaddingTop - levelSpacing / 2 + index * LEVELS_PER_BACKGROUND * levelSpacing),
          height: (endLevel - startLevel + 1) * levelSpacing + levelSpacing,
          url: `${BACKGROUND_URL_BASE}${getBackgroundIndex(startLevel)}.png`,
        };
      }),
    [levelSpacing, mapPaddingTop, totalLevels],
  );

  const pathData = useMemo(() => buildPath(points), [points]);
  const isHub = variant === "hub";
  const isFullscreen = variant === "fullscreen";
  const isScrollable = isHub || isFullscreen;
  const usesImmersiveShell = isHub;
  const mapScale = useMemo(() => {
    if (viewportWidth <= 0) {
      return 1;
    }
    return Math.min(1, viewportWidth / designWidth);
  }, [designWidth, viewportWidth]);
  const scaledHeight = totalHeight * mapScale;
  const currentPoint = points[Math.max(0, Math.min(points.length - 1, currentLevel - 1))];

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const updateWidth = () => {
      setViewportWidth(viewport.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || !isScrollable || !currentPoint) {
      return;
    }

    const targetTop = Math.max(0, currentPoint.centerY * mapScale - viewport.clientHeight * 0.42);
    viewport.scrollTo({ top: targetTop, behavior: "auto" });
    setScrollOffset(targetTop);
  }, [currentLevel, currentPoint, isScrollable, mapScale]);

  return (
    <div
      className={`mania-ui scrollable-map-shell w-full text-white ${
        isScrollable
          ? usesImmersiveShell
            ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0"
            : "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 p-0"
          : "mx-auto mt-2 flex w-full max-w-[360px] flex-col rounded-[24px] border border-white/10 px-3 py-3"
      }`}
      style={{
        background: isScrollable
          ? usesImmersiveShell
            ? "transparent"
            : "linear-gradient(180deg, rgba(5,28,83,0.72) 0%, rgba(7,27,73,0.42) 100%)"
          : "linear-gradient(180deg, rgba(5,28,83,0.42) 0%, rgba(7,27,73,0.24) 100%)",
        boxShadow: usesImmersiveShell ? "none" : "inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 28px rgba(0,0,0,0.18)",
      }}
    >
      {showHeader ? (
        <div className={`flex items-start justify-between gap-3 ${isScrollable ? "px-4 pb-3 pt-4" : ""}`}>
          <div>
            <p className="mania-kicker text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/82">
              {isFullscreen ? "World Map" : isHub ? "Winding Route" : "Map Preview"}
            </p>
            <p className="mania-title mt-1 text-sm font-black text-white">
              {isFullscreen ? "Full Harbor Trail" : isHub ? "Adventure Spine" : "Current Route Slice"}
            </p>
            <p className={`mt-1 font-semibold text-white/76 ${isNarrowLayout ? "text-[11px] leading-4" : "text-[10px] leading-4"}`}>
              {isFullscreen || isHub
                ? "Scroll the S-curve trail and tap any unlocked level node."
                : "Open fullscreen to browse the full route."}
            </p>
          </div>
          <div className="mania-glass-card mania-kicker rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/84">
            Lvl {currentLevel}
          </div>
        </div>
      ) : null}

      <div
        ref={viewportRef}
        onScroll={(event) => setScrollOffset(event.currentTarget.scrollTop)}
        className={`scrollable-map__viewport relative border border-white/10 ${
          isScrollable
            ? usesImmersiveShell
              ? "mt-0 h-full min-h-0 flex-1 overflow-y-auto rounded-none border-0"
              : "mt-0 h-full min-h-0 flex-1 overflow-y-auto rounded-[28px] border-x-0 border-b-0"
            : "mt-2 h-[164px] overflow-hidden rounded-[22px] sm:h-[188px]"
        }`}
        style={{
          background: usesImmersiveShell
            ? "linear-gradient(180deg, rgba(16,86,196,0.12) 0%, rgba(10,48,114,0.22) 42%, rgba(7,23,69,0.38) 100%)"
            : "linear-gradient(180deg, rgba(16,86,196,0.18) 0%, rgba(10,48,114,0.26) 38%, rgba(7,23,69,0.46) 100%)",
          overflowX: "hidden",
          overflowY: isScrollable ? "auto" : "hidden",
          overscrollBehavior: isScrollable ? "contain" : "none",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] h-16 bg-gradient-to-b from-[rgba(5,22,62,0.92)] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-20 bg-gradient-to-t from-[rgba(5,22,62,0.94)] to-transparent" />

        <div className="relative" style={{ height: `${scaledHeight}px` }}>
          <div
            className="absolute left-1/2 top-0"
            style={{
              width: `${designWidth}px`,
              height: `${totalHeight}px`,
              transform: `translateX(-50%) scale(${mapScale})`,
              transformOrigin: "top center",
            }}
          >
          {backgroundSlices.map((slice) => (
            <div
              key={`${slice.id}-sky`}
              className="pointer-events-none absolute inset-x-0 overflow-hidden"
              style={{
                top: `${slice.top}px`,
                height: `${slice.height}px`,
                transform: `translateY(${scrollOffset * SKY_LAYER_RATE}px)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 18% 16%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 16%), radial-gradient(circle at 74% 18%, rgba(255,214,244,0.18) 0%, rgba(255,214,244,0) 18%), radial-gradient(circle at 50% 10%, rgba(125,211,252,0.18) 0%, rgba(125,211,252,0) 20%), repeating-radial-gradient(circle at 18% 24%, rgba(255,255,255,0.1) 0 1px, rgba(255,255,255,0) 1px 18px)",
                }}
              />
              <div className="absolute left-[10%] top-10 h-10 w-28 rounded-full bg-white/16 blur-xl" />
              <div className="absolute right-[12%] top-16 h-12 w-36 rounded-full bg-sky-100/12 blur-xl" />
              <div className="absolute left-[18%] top-24 h-14 w-14 rounded-full bg-white/12 blur-2xl" />
            </div>
          ))}

          {backgroundSlices.map((slice) => (
            <div
              key={`${slice.id}-far`}
              className="pointer-events-none absolute inset-x-0 overflow-hidden"
              style={{
                top: `${slice.top}px`,
                height: `${slice.height}px`,
                transform: `translateY(${scrollOffset * FAR_LAYER_RATE}px)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 20%), radial-gradient(circle at 78% 16%, rgba(249,168,212,0.18) 0%, rgba(249,168,212,0) 18%), linear-gradient(180deg, rgba(191,219,254,0.18) 0%, rgba(59,130,246,0.08) 40%, rgba(7,25,74,0) 100%)",
                }}
              />
              <div className="absolute -bottom-4 left-[-8%] h-24 w-[62%] rounded-[50%] bg-sky-300/16 blur-xl" />
              <div className="absolute bottom-2 right-[-6%] h-20 w-[54%] rounded-[50%] bg-cyan-200/12 blur-xl" />
              <div className="absolute top-8 left-[14%] h-12 w-12 rounded-full bg-white/12 blur-2xl" />
            </div>
          ))}

          {backgroundSlices.map((slice) => (
            <div
              key={`${slice.id}-mid`}
              className="pointer-events-none absolute inset-x-0 overflow-hidden"
              style={{
                top: `${slice.top}px`,
                height: `${slice.height}px`,
                transform: `translateY(${scrollOffset * MID_LAYER_RATE}px)`,
                backgroundImage: `linear-gradient(180deg, rgba(8,28,74,0.16) 0%, rgba(8,28,74,0.42) 100%), url(${slice.url})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                opacity: 0.72,
              }}
            />
          ))}

          {backgroundSlices.map((slice) => (
            <div
              key={`${slice.id}-near`}
              className="pointer-events-none absolute inset-x-0 overflow-hidden"
              style={{
                top: `${slice.top}px`,
                height: `${slice.height}px`,
                transform: `translateY(${scrollOffset * NEAR_LAYER_RATE}px)`,
              }}
            >
              <div className="absolute inset-x-[-10%] bottom-[-28px] h-36 rounded-[50%] bg-cyan-300/14 blur-[26px]" />
              <div className="absolute inset-x-[-8%] bottom-[-56px] h-32 rounded-[50%] bg-blue-950/72" />
              <div className="absolute bottom-8 left-[-6%] h-24 w-[46%] rounded-[50%] bg-emerald-300/14 blur-xl" />
              <div className="absolute bottom-10 right-[-6%] h-28 w-[50%] rounded-[50%] bg-sky-200/14 blur-xl" />
              <div className="absolute bottom-6 left-[18%] h-14 w-14 rounded-full bg-white/10 blur-2xl" />
            </div>
          ))}

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(1,12,28,0.08) 0%, rgba(1,12,28,0.22) 44%, rgba(1,12,28,0.56) 100%)",
            }}
          />

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[3] h-full w-full"
            viewBox={`0 0 ${designWidth} ${totalHeight}`}
            preserveAspectRatio="xMidYMin meet"
          >
            <defs>
              <linearGradient id={trailGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(245,253,255,0.96)" />
                <stop offset="38%" stopColor="rgba(141,242,255,0.94)" />
                <stop offset="100%" stopColor="rgba(255,230,120,0.88)" />
              </linearGradient>
              <filter id={trailGlowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={pathData}
              fill="none"
              stroke="rgba(125,211,252,0.18)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${trailGlowId})`}
            />
            <path
              d={pathData}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="5.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pathData}
              fill="none"
              stroke={`url(#${trailGradientId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {points.map((point) => (
            <div
              key={point.level}
              className="absolute z-[4]"
              style={{
                left: `${point.x}px`,
                top: `${point.top}px`,
                transform: "translateX(-50%)",
              }}
            >
              {point.isCurrent ? (
                <>
                  <div className={`pointer-events-none absolute left-1/2 z-[6] -translate-x-1/2 origin-bottom ${isNarrowLayout ? "top-[-48px]" : "top-[-54px]"} scale-[0.74]`}>
                    <GameMascot
                      mascotState="idle"
                      characterIndex={selectedCharacterIndex}
                      currentLevel={currentLevel}
                      size={isUltraNarrowLayout ? 48 : isNarrowLayout ? 50 : 54}
                      showNameBadge={false}
                      enableIdleWave
                    />
                  </div>
                  <div className={`mania-current-pill mania-kicker pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full border border-cyan-200/38 px-2 py-1 font-black uppercase tracking-[0.16em] text-cyan-50 shadow-[0_0_12px_rgba(125,211,252,0.24)] ${isNarrowLayout ? "top-[-74px] text-[7px]" : "top-[-82px] text-[8px]"}`}>
                    Selected
                  </div>
                </>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  if (point.isUnlocked) {
                    onSelectLevel(point.level);
                  }
                }}
                disabled={!point.isUnlocked}
                className={`mania-node ${point.isCurrent ? "current-level" : ""} flex h-[58px] w-[58px] flex-col items-center justify-center rounded-[20px] border text-white transition-transform`}
                style={{
                  width: `${nodeSize}px`,
                  height: `${nodeSize}px`,
                  borderColor: point.isUnlocked ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.12)",
                  background: point.isUnlocked
                    ? "linear-gradient(180deg, rgba(31,117,236,0.98) 0%, rgba(15,61,161,0.98) 55%, rgba(8,35,113,0.98) 100%)"
                    : "linear-gradient(180deg, rgba(14,34,70,0.86) 0%, rgba(8,21,46,0.94) 100%)",
                  boxShadow: point.isCurrent ? undefined : "0 12px 18px rgba(0,0,0,0.24)",
                  cursor: point.isUnlocked ? "pointer" : "default",
                  opacity: point.isUnlocked ? 1 : 0.42,
                }}
              >
                <span className={`mania-title font-black leading-none ${isNarrowLayout ? "text-[13px]" : "text-[14px]"}`}>{point.level}</span>
                <span className="mt-1 flex items-center gap-0.5">
                  {[0, 1, 2].map((starIndex) => (
                    <span
                      key={starIndex}
                      className={`leading-none ${isNarrowLayout ? "text-[8px]" : "text-[9px]"}`}
                      style={{ color: starIndex < point.stars ? "#ffe17b" : "rgba(255,255,255,0.28)" }}
                    >
                      {"\u2605"}
                    </span>
                  ))}
                </span>
              </button>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Page: Settings

**Source File:** `src/components/SettingsModal.tsx`

```tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { CapacitorGuide } from "./CapacitorGuide";

type SettingsModalProps = {
  isMusicMuted: boolean;
  isSfxMuted: boolean;
  isHapticsEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onToggleHaptics: () => void;
  onHowToPlay: () => void;
  onResetProgress: () => void;
  onClose: () => void;
};

type ToggleRowProps = {
  icon: string;
  label: string;
  enabled: boolean;
  onToggle: () => void;
};

function ToggleRow({ icon, label, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="mania-glass-card flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <p className="mania-title text-sm font-bold text-white">{label}</p>
      </div>
      <button type="button" onClick={onToggle} className="mania-toggle-button rounded-full p-0" aria-label={`Toggle ${label}`}>
        <motion.span
          className="mania-toggle-track relative block h-7 w-14 rounded-full"
          animate={{ backgroundColor: enabled ? "#47D35B" : "#6b7280" }}
          transition={{ duration: 0.18 }}
        >
          <motion.span
            className="absolute left-1 top-1 block h-5 w-5 rounded-full bg-white"
            animate={{ x: enabled ? 28 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          />
        </motion.span>
      </button>
    </div>
  );
}

export function SettingsModal({
  isMusicMuted,
  isSfxMuted,
  isHapticsEnabled,
  onToggleMusic,
  onToggleSfx,
  onToggleHaptics,
  onHowToPlay,
  onResetProgress,
  onClose,
}: SettingsModalProps) {
  const [showCapacitorGuide, setShowCapacitorGuide] = useState(false);

  if (showCapacitorGuide) {
    return <CapacitorGuide onClose={() => setShowCapacitorGuide(false)} />;
  }

  return (
    <div className="mania-overlay-backdrop fixed inset-0 z-[9100] overflow-hidden p-4">
      <div className="flex h-full items-center justify-center">
        <motion.div
          initial={{ scale: 0.78, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          className="mania-overlay-sheet mania-ui flex w-full max-w-[360px] flex-col overflow-hidden rounded-3xl border border-white/35 text-white shadow-2xl"
          style={{ maxHeight: "min(560px, calc(100dvh - 32px))" }}
        >
          <div className="flex items-center justify-between border-b border-white/12 px-5 pb-4 pt-5">
            <h2 className="mania-title text-2xl font-black">Settings</h2>
            <button type="button" onClick={onClose} className="mania-bubbly-button rounded-lg px-2.5 py-1.5 text-xs font-bold" data-tone="glass">
              Close
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto px-5 pb-5 pt-4" style={{ overscrollBehavior: "contain" }}>
            <div className="space-y-2.5">
              <ToggleRow icon="ðŸŽµ" label="Music" enabled={!isMusicMuted} onToggle={onToggleMusic} />
              <ToggleRow icon="ðŸ”Š" label="Sound Effects" enabled={!isSfxMuted} onToggle={onToggleSfx} />
              <ToggleRow icon="ðŸ“³" label="Haptic Vibration" enabled={isHapticsEnabled} onToggle={onToggleHaptics} />
            </div>

            <button
              type="button"
              onClick={onHowToPlay}
              className="mania-bubbly-button mt-4 w-full rounded-xl px-4 py-3 text-sm font-black text-slate-900 transition"
              data-tone="cyan"
            >
              How To Play
            </button>

            <button
              type="button"
              onClick={() => setShowCapacitorGuide(true)}
              className="mania-bubbly-button mt-3 w-full rounded-xl px-4 py-3 text-sm font-black text-white shadow-lg transition"
              data-tone="rose"
            >
              Native App Guide
            </button>

            <button
              type="button"
              onClick={onResetProgress}
              className="mania-bubbly-button mt-7 w-full rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition"
              data-tone="glass"
            >
              Reset Progress
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

## Page: Loading Screen

**Source File:** `src/components/SplashScreen.tsx`

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BGMManager } from "../utils/BGMManager";

type SplashScreenProps = {
  onDone: () => void;
  isMusicMuted: boolean;
  onToggleMusic: () => void;
};

const LOAD_DURATION_MS = 3000;

export function SplashScreen({ onDone, isMusicMuted }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const hasInteractedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const startProgress = () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const pct = Math.min(elapsed / LOAD_DURATION_MS, 1);
      setProgress(pct);

      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      window.setTimeout(() => {
        setIsDone(true);
        window.setTimeout(onDone, 420);
      }, 180);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const timer = window.setTimeout(startProgress, 200);
    return () => {
      window.clearTimeout(timer);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isMusicMuted) return;
    void BGMManager.unlock().then(() => {
      BGMManager.playMusic("main");
    });
  }, [isMusicMuted]);

  const handleFirstInteraction = async () => {
    if (hasInteractedRef.current) return;
    hasInteractedRef.current = true;
    await BGMManager.unlock();
    if (!isMusicMuted) {
      BGMManager.playMusic("main");
    }
  };

  const pct = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {!isDone ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            width: "100vw",
            height: "100dvh",
            background:
              "radial-gradient(circle at 50% 12%, rgba(255,220,120,0.18) 0%, rgba(255,220,120,0) 22%), radial-gradient(circle at 18% 22%, rgba(94,234,212,0.16) 0%, rgba(94,234,212,0) 20%), linear-gradient(180deg, #2938a8 0%, #16246f 44%, #0a1237 100%)",
          }}
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] },
          }}
          onClick={handleFirstInteraction}
          onPointerDown={handleFirstInteraction}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_34%)]" />

          <div className="relative z-10 flex w-full max-w-[320px] flex-col items-center px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              className="select-none"
            >
              <p className="mania-title text-[14px] font-black uppercase tracking-[0.38em] text-cyan-100/86">
                Blast
              </p>
              <h1
                className="mania-title mt-2 text-[48px] font-black uppercase leading-none text-white"
                style={{
                  textShadow:
                    "0 3px 0 rgba(33,58,151,0.95), 0 12px 24px rgba(5,10,28,0.42), 0 0 18px rgba(255,207,92,0.18)",
                  WebkitTextStroke: "1.6px rgba(255,255,255,0.24)",
                }}
              >
                Mania
              </h1>
            </motion.div>

            <motion.div
              className="mt-9 w-full"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="relative h-[18px] overflow-hidden rounded-full border border-white/18"
                style={{
                  background: "rgba(4,10,26,0.44)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -6px 14px rgba(0,0,0,0.18)",
                }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(180deg, #ffe87b 0%, #ffb627 100%)",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.78), inset 0 -5px 0 rgba(166,92,18,0.28), 0 0 18px rgba(255,203,94,0.34)",
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[7px] rounded-t-full bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_100%)]" />
              </div>
            </motion.div>

            <motion.p
              className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/44"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.32 }}
            >
              v1.0 Â· Blast Mania
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

## SVG: Block Icon

**Source File:** `src/components/svg/BlockIcon.tsx`

```tsx
import { BombSVG } from "./BombSVG";
import { DiscoBallSVG } from "./DiscoBallSVG";
import { RocketSVG } from "./RocketSVG";
import { WoodenBoxSVG } from "./WoodenBoxSVG";
import type { BlockTile } from "../../game/types";

interface Props {
  tile: BlockTile;
  isHovered?: boolean;
  cellSize: number;
}

/**
 * Returns the custom SVG component for boosters and obstacles.
 * Returns null for regular/reward blocks (those use emoji or inline JSX).
 */
export function BlockIcon({ tile, isHovered = false, cellSize }: Props) {
  const svgSize = Math.round(cellSize * 0.82);

  if (tile.kind === "booster") {
    if (tile.booster === "rocket") {
      const axis = tile.rocketAxis ?? "col";
      return (
        <RocketSVG
          size={svgSize}
          isHovered={isHovered}
          axis={axis}
          /* flip=false â†’ horizontal points RIGHT, vertical points UP.
             The idle grid rocket always fires "upward / rightward" as its
             ready-to-launch pose. Direction arrows come from VFX only. */
          flip={false}
        />
      );
    }
    if (tile.booster === "bomb") {
      return <BombSVG size={svgSize} isHovered={isHovered} />;
    }
    if (tile.booster === "disco") {
      return <DiscoBallSVG size={svgSize} isHovered={isHovered} />;
    }
  }

  if (tile.kind === "box") {
    return (
      <WoodenBoxSVG
        size={Math.round(cellSize * 0.88)}
        isCracked={tile.hitsRemaining < tile.maxHits}
        isNearMatch={false}
      />
    );
  }

  if (tile.kind === "ice") {
    return (
      <div
        className="relative grid place-items-center rounded-[11px]"
        style={{
          width: Math.round(cellSize * 0.86),
          height: Math.round(cellSize * 0.86),
          background: "linear-gradient(180deg, rgba(202,244,255,0.95) 0%, rgba(132,213,255,0.92) 54%, rgba(81,171,255,0.95) 100%)",
          border: "2px solid rgba(255,255,255,0.72)",
          boxShadow: isHovered ? "0 0 14px rgba(186,230,253,0.85)" : "0 8px 16px rgba(11,72,137,0.28), inset 0 1px 0 rgba(255,255,255,0.85)",
        }}
      >
        <div className="absolute inset-[4px] rounded-[8px] border border-white/55 bg-white/10" />
        <div
          className="absolute inset-0"
          style={{
            opacity: tile.hitsRemaining < tile.maxHits ? 0.95 : 0.45,
            background:
              tile.hitsRemaining < tile.maxHits
                ? "linear-gradient(135deg, transparent 0%, transparent 36%, rgba(255,255,255,0.92) 37%, transparent 44%, transparent 56%, rgba(255,255,255,0.9) 57%, transparent 64%, transparent 100%)"
                : "linear-gradient(135deg, transparent 0%, transparent 44%, rgba(255,255,255,0.65) 45%, transparent 52%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  if (tile.kind === "honey") {
    return (
      <div
        className="relative grid place-items-center rounded-[12px]"
        style={{
          width: Math.round(cellSize * 0.86),
          height: Math.round(cellSize * 0.86),
          background: "radial-gradient(circle at 40% 30%, rgba(255,243,179,0.96) 0%, rgba(255,207,86,0.98) 38%, rgba(229,150,24,0.98) 100%)",
          border: "2px solid rgba(255,243,181,0.72)",
          boxShadow: isHovered ? "0 0 14px rgba(251,191,36,0.8)" : "0 10px 18px rgba(176,101,11,0.24), inset 0 1px 0 rgba(255,255,255,0.58)",
        }}
      >
        <div className="absolute inset-x-[7px] bottom-[6px] h-[9px] rounded-b-[10px] bg-[linear-gradient(180deg,rgba(255,202,56,0.95)_0%,rgba(210,122,19,0.98)_100%)]" />
        <div className="absolute left-[7px] top-[7px] h-[9px] w-[9px] rounded-full bg-white/45 blur-[1px]" />
      </div>
    );
  }

  if (tile.kind === "safe") {
    return (
      <div
        className="relative grid place-items-center rounded-[10px]"
        style={{
          width: Math.round(cellSize * 0.86),
          height: Math.round(cellSize * 0.86),
          background: "linear-gradient(180deg, rgba(255,214,83,0.98) 0%, rgba(224,160,23,0.98) 52%, rgba(163,100,16,0.98) 100%)",
          border: "2px solid rgba(255,247,195,0.72)",
          boxShadow: isHovered ? "0 0 14px rgba(250,204,21,0.8)" : "0 10px 18px rgba(120,74,7,0.22), inset 0 1px 0 rgba(255,255,255,0.62)",
        }}
      >
        <div className="absolute inset-[5px] rounded-[7px] border border-black/18 bg-[linear-gradient(180deg,rgba(255,241,179,0.54)_0%,rgba(255,255,255,0.06)_100%)]" />
        <div
          className="absolute left-1/2 top-[5px] h-[5px] w-[14px] -translate-x-1/2 rounded-t-full border-[2px] border-b-0"
          style={{ borderColor: tile.color === "red" ? "#ff5a5a" : tile.color === "blue" ? "#4db8ff" : tile.color === "green" ? "#5ce46d" : tile.color === "yellow" ? "#ffe066" : "#bf85ff" }}
        />
        <div className="relative z-10 h-[12px] w-[12px] rounded-[4px] bg-slate-800/72">
          <div className="absolute left-1/2 top-[2px] h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-yellow-100/90" />
          <div className="absolute left-1/2 top-[5px] h-[5px] w-[2px] -translate-x-1/2 rounded-full bg-yellow-100/90" />
        </div>
      </div>
    );
  }

  if (tile.kind === "cloud") {
    return (
      <div className="relative" style={{ width: Math.round(cellSize * 0.9), height: Math.round(cellSize * 0.72) }}>
        <div className="absolute left-[6px] top-[11px] h-[14px] w-[28px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(214,236,255,0.95)_100%)] shadow-[0_8px_18px_rgba(99,102,241,0.14)]" />
        <div className="absolute left-[2px] top-[8px] h-[16px] w-[16px] rounded-full bg-white/95" />
        <div className="absolute left-[15px] top-[3px] h-[18px] w-[18px] rounded-full bg-white" />
        <div className="absolute right-[5px] top-[9px] h-[14px] w-[14px] rounded-full bg-[#eef7ff]" />
      </div>
    );
  }

  return null;
}
```

## SVG: Bomb

**Source File:** `src/components/svg/BombSVG.tsx`

```tsx
import { motion } from "framer-motion";

interface Props {
  size?: number;
  isHovered?: boolean;
}

export function BombSVG({ size = 44, isHovered = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id="bomb-body" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#6b6b7a" />
          <stop offset="45%" stopColor="#2e2e3a" />
          <stop offset="100%" stopColor="#111118" />
        </radialGradient>
        <radialGradient id="bomb-shine" cx="30%" cy="25%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="bomb-rim" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
        </radialGradient>
        <filter id="bomb-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="spark-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Fuse base metal band */}
      <rect x="20" y="6" width="4" height="4" rx="1.5" fill="#8a8a9a" />

      {/* Fuse rope */}
      <motion.path
        d="M 22 6 Q 26 3 24 0 Q 22 -3 26 -5"
        stroke="#c8a042"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        animate={{ pathLength: [0.8, 1, 0.8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Spark at tip of fuse */}
      <motion.g
        animate={{
          x: [0, 1, -1, 0.5, -0.5, 0],
          y: [0, -1, 0.5, -0.5, 1, 0],
          scale: [1, 1.3, 0.9, 1.2, 1],
        }}
        transition={{ duration: 0.18, repeat: Infinity, ease: "linear" }}
        style={{ originX: "26px", originY: "-5px" }}
      >
        {/* Spark core */}
        <circle cx="26" cy="-5" r="2.2" fill="#FFD700" filter="url(#spark-glow)" />
        {/* Spark rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.line
            key={i}
            x1="26"
            y1="-5"
            x2={26 + Math.cos((angle * Math.PI) / 180) * 4.5}
            y2={-5 + Math.sin((angle * Math.PI) / 180) * 4.5}
            stroke={i % 2 === 0 ? "#FF8C00" : "#FFD700"}
            strokeWidth="1.2"
            strokeLinecap="round"
            animate={{ opacity: [1, 0.3, 1], scaleX: [1, 0.6, 1] }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              delay: i * 0.025,
              ease: "linear",
            }}
          />
        ))}
        {/* Orange ember */}
        <circle cx="26" cy="-5" r="1" fill="#FF4500" />
      </motion.g>

      {/* Bomb body shadow */}
      <ellipse cx="22" cy="36" rx="11" ry="3" fill="rgba(0,0,0,0.28)" />

      {/* Bomb body */}
      <circle cx="22" cy="26" r="16" fill="url(#bomb-body)" />

      {/* Rim highlight */}
      <circle cx="22" cy="26" r="16" fill="url(#bomb-rim)" />

      {/* Shine highlight */}
      <ellipse
        cx="16"
        cy="19"
        rx="5"
        ry="3.5"
        fill="url(#bomb-shine)"
        transform="rotate(-30 16 19)"
      />

      {/* Secondary shine dot */}
      <circle cx="14" cy="17" r="2" fill="rgba(255,255,255,0.22)" />

      {/* Subtle texture lines */}
      <path
        d="M 11 28 Q 14 24 18 26"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 25 31 Q 29 28 30 32"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Hover pulse ring */}
      {isHovered && (
        <motion.circle
          cx="22"
          cy="26"
          r="17"
          fill="none"
          stroke="rgba(255,140,0,0.7)"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0.7, 0], scale: [0.95, 1.15] }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />
      )}
    </svg>
  );
}
```

## SVG: Disco Ball

**Source File:** `src/components/svg/DiscoBallSVG.tsx`

```tsx
import { motion } from "framer-motion";

interface Props {
  size?: number;
  isHovered?: boolean;
}

const SPARKLE_POSITIONS = [
  { x: 6,  y: 10, delay: 0 },
  { x: 34, y: 8,  delay: 0.22 },
  { x: 2,  y: 26, delay: 0.44 },
  { x: 38, y: 28, delay: 0.11 },
  { x: 18, y: 4,  delay: 0.33 },
  { x: 28, y: 38, delay: 0.55 },
  { x: 8,  y: 38, delay: 0.66 },
  { x: 36, y: 18, delay: 0.18 },
];

function Sparkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.g
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4] }}
      transition={{ duration: 1.1, repeat: Infinity, delay, ease: "easeInOut" }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* 4-point star */}
      <path
        d={`M ${x} ${y - 4} L ${x + 1} ${y - 1} L ${x + 4} ${y} L ${x + 1} ${y + 1} L ${x} ${y + 4} L ${x - 1} ${y + 1} L ${x - 4} ${y} L ${x - 1} ${y - 1} Z`}
        fill="white"
        opacity={0.9}
      />
      <circle cx={x} cy={y} r="0.8" fill="white" />
    </motion.g>
  );
}

export function DiscoBallSVG({ size = 44, isHovered = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {/* Main metallic sphere */}
        <radialGradient id="disco-base" cx="36%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#D8E8F0" />
          <stop offset="55%" stopColor="#8AABBF" />
          <stop offset="80%" stopColor="#4A7A96" />
          <stop offset="100%" stopColor="#1E4A62" />
        </radialGradient>

        {/* Tile colors for facets */}
        <linearGradient id="facet-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8F4F8" />
          <stop offset="100%" stopColor="#90B8CC" />
        </linearGradient>
        <linearGradient id="facet-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8D8F0" />
          <stop offset="100%" stopColor="#3A8CB4" />
        </linearGradient>
        <linearGradient id="facet-pink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8C8E0" />
          <stop offset="100%" stopColor="#D468A0" />
        </linearGradient>
        <linearGradient id="facet-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0A0" />
          <stop offset="100%" stopColor="#D4A020" />
        </linearGradient>
        <linearGradient id="facet-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8F0C8" />
          <stop offset="100%" stopColor="#38A870" />
        </linearGradient>

        {/* Clip to circle */}
        <clipPath id="disco-clip">
          <circle cx="22" cy="24" r="17" />
        </clipPath>

        <radialGradient id="disco-rim" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
        </radialGradient>

        <filter id="disco-glow-filter">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hanging string */}
      <line x1="22" y1="0" x2="22" y2="7" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22" cy="7" r="1.5" fill="#AAAAAA" />

      {/* Glow behind ball */}
      <motion.circle
        cx="22"
        cy="24"
        r="18"
        fill="rgba(160,220,255,0.18)"
        animate={{ r: [17, 20, 17], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Drop shadow */}
      <ellipse cx="22" cy="43" rx="13" ry="2.5" fill="rgba(0,0,0,0.22)" />

      {/* Base sphere */}
      <circle cx="22" cy="24" r="17" fill="url(#disco-base)" />

      {/* â”€â”€ Disco facet tiles (clipped to circle) â”€â”€ */}
      <motion.g
        clipPath="url(#disco-clip)"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "22px 24px" }}
      >
        {/* Row 1 */}
        {[
          { x: 8,  y: 10, w: 6, h: 5, grad: "facet-blue" },
          { x: 15, y: 10, w: 6, h: 5, grad: "facet-silver" },
          { x: 22, y: 10, w: 6, h: 5, grad: "facet-pink" },
          { x: 29, y: 10, w: 6, h: 5, grad: "facet-gold" },

          // Row 2
          { x: 6,  y: 16, w: 6, h: 5, grad: "facet-silver" },
          { x: 13, y: 16, w: 6, h: 5, grad: "facet-pink" },
          { x: 20, y: 16, w: 6, h: 5, grad: "facet-gold" },
          { x: 27, y: 16, w: 6, h: 5, grad: "facet-blue" },
          { x: 34, y: 16, w: 6, h: 5, grad: "facet-green" },

          // Row 3
          { x: 5,  y: 22, w: 6, h: 5, grad: "facet-gold" },
          { x: 12, y: 22, w: 6, h: 5, grad: "facet-blue" },
          { x: 19, y: 22, w: 6, h: 5, grad: "facet-silver" },
          { x: 26, y: 22, w: 6, h: 5, grad: "facet-green" },
          { x: 33, y: 22, w: 6, h: 5, grad: "facet-pink" },

          // Row 4
          { x: 7,  y: 28, w: 6, h: 5, grad: "facet-pink" },
          { x: 14, y: 28, w: 6, h: 5, grad: "facet-green" },
          { x: 21, y: 28, w: 6, h: 5, grad: "facet-blue" },
          { x: 28, y: 28, w: 6, h: 5, grad: "facet-silver" },
          { x: 35, y: 28, w: 6, h: 5, grad: "facet-gold" },

          // Row 5
          { x: 9,  y: 34, w: 6, h: 5, grad: "facet-green" },
          { x: 16, y: 34, w: 6, h: 5, grad: "facet-gold" },
          { x: 23, y: 34, w: 6, h: 5, grad: "facet-pink" },
          { x: 30, y: 34, w: 6, h: 5, grad: "facet-silver" },
        ].map((f, i) => (
          <rect
            key={i}
            x={f.x}
            y={f.y}
            width={f.w}
            height={f.h}
            fill={`url(#${f.grad})`}
            stroke="rgba(30,74,98,0.25)"
            strokeWidth="0.5"
            rx="0.5"
          />
        ))}
      </motion.g>

      {/* Rim highlight overlay */}
      <circle cx="22" cy="24" r="17" fill="url(#disco-rim)" />

      {/* Top shine */}
      <motion.ellipse
        cx="16"
        cy="16"
        rx="5"
        ry="3.5"
        fill="rgba(255,255,255,0.55)"
        transform="rotate(-30 16 16)"
        animate={{ opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="14" cy="14" r="2" fill="rgba(255,255,255,0.35)" />

      {/* â”€â”€ Sparkles around ball â”€â”€ */}
      {SPARKLE_POSITIONS.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} delay={s.delay} />
      ))}

      {/* â”€â”€ Color light beams (spinning) â”€â”€ */}
      <motion.g
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "22px 24px" }}
      >
        {[
          { angle: 30,  color: "rgba(255,150,150,0.28)", len: 20 },
          { angle: 90,  color: "rgba(150,220,255,0.28)", len: 18 },
          { angle: 150, color: "rgba(200,255,150,0.28)", len: 20 },
          { angle: 210, color: "rgba(255,220,100,0.28)", len: 18 },
          { angle: 270, color: "rgba(200,150,255,0.28)", len: 20 },
          { angle: 330, color: "rgba(150,255,220,0.28)", len: 18 },
        ].map((beam, i) => {
          const rad = (beam.angle * Math.PI) / 180;
          const x2 = 22 + Math.cos(rad) * (17 + beam.len);
          const y2 = 24 + Math.sin(rad) * (17 + beam.len);
          return (
            <line
              key={i}
              x1={22}
              y1={24}
              x2={x2}
              y2={y2}
              stroke={beam.color}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </motion.g>

      {/* Border ring */}
      <circle
        cx="22"
        cy="24"
        r="17"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />

      {/* Hover ring */}
      {isHovered && (
        <motion.circle
          cx="22"
          cy="24"
          r="19"
          fill="none"
          stroke="rgba(180,120,255,0.8)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.8, 0], scale: [0.95, 1.15] }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />
      )}
    </svg>
  );
}
```

## SVG: Rocket

**Source File:** `src/components/svg/RocketSVG.tsx`

```tsx
import { motion } from "framer-motion";

export type RocketAxis = "row" | "col";

interface Props {
  size?: number;
  isHovered?: boolean;
  /**
   * "col" â†’ vertical launch (default, points UP)
   * "row" â†’ horizontal (points RIGHT)
   */
  axis?: RocketAxis;
  /**
   * Flip direction within an axis.
   * "col" + flip=true  â†’ points DOWN
   * "row" + flip=true  â†’ points LEFT
   */
  flip?: boolean;
}

/**
 * Returns the CSS transform that orients the rocket.
 *
 * SVG is drawn pointing UP (vertical, fire at bottom).
 * - col / no-flip  â†’ rotate(0)   pointing up
 * - col / flip     â†’ rotate(180) pointing down
 * - row / no-flip  â†’ rotate(90)  pointing right
 * - row / flip     â†’ rotate(270) pointing left  (equiv: -90deg)
 */
function axisRotation(axis: RocketAxis, flip: boolean): string {
  if (axis === "col") return flip ? "rotate(180deg)" : "rotate(0deg)";
  return flip ? "rotate(270deg)" : "rotate(90deg)";
}

/** Glow colour: blue for vertical, red/orange for horizontal */
function glowColor(axis: RocketAxis): string {
  return axis === "col"
    ? "rgba(45,156,255,0.75)"   // blue â€“ vertical
    : "rgba(255,90,30,0.75)";   // red  â€“ horizontal
}

export function RocketSVG({
  size = 44,
  isHovered = false,
  axis = "col",
  flip = false,
}: Props) {
  const rotation = axisRotation(axis, flip);
  const glow = glowColor(axis);

  /* unique gradient ids per axis to avoid SVG id collisions when both
     orientations are on screen simultaneously */
  const suffix = axis === "col" ? "v" : "h";

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: rotation,
        /* hardware-accelerated rotation â€” no layout shift */
        willChange: "transform",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`rocket-body-${suffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="40%"  stopColor="#F5F5F5" />
            <stop offset="100%" stopColor="#D0D8E8" />
          </linearGradient>
          <linearGradient id={`rocket-nose-${suffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#CC0000" />
          </linearGradient>
          <linearGradient id={`rocket-fin-l-${suffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#E53E3E" />
            <stop offset="100%" stopColor="#9B2C2C" />
          </linearGradient>
          <linearGradient id={`rocket-fin-r-${suffix}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#E53E3E" />
            <stop offset="100%" stopColor="#9B2C2C" />
          </linearGradient>
          <linearGradient id={`rocket-stripe-${suffix}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#FF4848" />
            <stop offset="100%" stopColor="#CC0000" />
          </linearGradient>
          <radialGradient id={`window-glass-${suffix}`} cx="35%" cy="30%" r="60%">
            <stop offset="0%"   stopColor="#B3E8FF" />
            <stop offset="60%"  stopColor="#5BC8F5" />
            <stop offset="100%" stopColor="#2196F3" />
          </radialGradient>
          <radialGradient id={`fire-core-${suffix}`} cx="50%" cy="20%" r="60%">
            <stop offset="0%"   stopColor="#FFF176" />
            <stop offset="40%"  stopColor="#FF9800" />
            <stop offset="100%" stopColor="#FF5722" />
          </radialGradient>
          {/* Axis-specific glow gradient */}
          <radialGradient id={`rocket-glow-${suffix}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={glow} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id={`fire-blur-${suffix}`}>
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        {/* â”€â”€ Axis glow ring (always visible, stronger on hover) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <motion.ellipse
          cx="22" cy="26" rx="18" ry="22"
          fill={`url(#rocket-glow-${suffix})`}
          animate={{ opacity: isHovered ? [0.5, 0.9, 0.5] : [0.18, 0.32, 0.18] }}
          transition={{ duration: isHovered ? 0.6 : 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* â”€â”€ Left fin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <path d="M 13 34 L 6 42 L 14 38 Z" fill={`url(#rocket-fin-l-${suffix})`} />
        <path d="M 13 34 L 6 42 L 14 38 Z" fill="rgba(255,255,255,0.12)" />

        {/* â”€â”€ Right fin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <path d="M 31 34 L 38 42 L 30 38 Z" fill={`url(#rocket-fin-r-${suffix})`} />

        {/* â”€â”€ Rocket body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <rect x="13" y="16" width="18" height="24" rx="3" fill={`url(#rocket-body-${suffix})`} />

        {/* â”€â”€ Red stripe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <rect x="13" y="28" width="18" height="5" rx="0" fill={`url(#rocket-stripe-${suffix})`} />

        {/* â”€â”€ Nose cone â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <path d="M 13 16 Q 13 4 22 2 Q 31 4 31 16 Z" fill={`url(#rocket-nose-${suffix})`} />
        {/* Nose shine */}
        <path
          d="M 16 10 Q 18 5 22 4"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* â”€â”€ Porthole window â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <circle cx="22" cy="22" r="5" fill={`url(#window-glass-${suffix})`} />
        <circle cx="22" cy="22" r="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
        <ellipse
          cx="20.5" cy="20.5" rx="2" ry="1.2"
          fill="rgba(255,255,255,0.6)"
          transform="rotate(-30 20.5 20.5)"
        />

        {/* â”€â”€ Body highlight â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <rect x="15" y="17" width="4" height="16" rx="2" fill="rgba(255,255,255,0.32)" />

        {/* â”€â”€ Engine nozzle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <path d="M 16 40 Q 22 43 28 40 L 26 38 L 18 38 Z" fill="#888EA8" />
        <path d="M 17 38 L 27 38" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* â”€â”€ Engine Fire (always at tail = bottom of un-rotated SVG) â”€â”€â”€â”€ */}
        <motion.g
          animate={{
            scaleY: [1, 1.18, 0.9, 1.12, 1],
            scaleX: [1, 0.88, 1.06, 0.94, 1],
          }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "22px 44px" }}
        >
          {/* Outer flame */}
          <motion.path
            d="M 17 42 Q 18 50 22 52 Q 26 50 27 42 Z"
            fill="#FF5722"
            animate={{ opacity: [0.85, 1, 0.75, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
          {/* Mid flame */}
          <motion.path
            d="M 18.5 42 Q 19.5 48 22 50 Q 24.5 48 25.5 42 Z"
            fill="#FF9800"
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 0.18, repeat: Infinity, delay: 0.05 }}
          />
          {/* Inner flame core */}
          <motion.path
            d="M 19.5 42 Q 20.5 46 22 47.5 Q 23.5 46 24.5 42 Z"
            fill={`url(#fire-core-${suffix})`}
            animate={{ scaleY: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 0.14, repeat: Infinity, delay: 0.02 }}
            style={{ transformOrigin: "22px 42px" }}
          />
          {/* Bright tip */}
          <circle cx="22" cy="44" r="1.5" fill="#FFF9C4" />
        </motion.g>

        {/* Side exhaust sparks */}
        {(
          [
            [-3, 0],
            [3, 0],
            [-2, 1],
            [2, 1],
          ] as [number, number][]
        ).map(([dx, dy], i) => (
          <motion.circle
            key={i}
            cx={22 + dx}
            cy={46 + dy}
            r={0.7}
            fill={i % 2 === 0 ? "#FFD700" : "#FF9800"}
            animate={{ opacity: [0, 1, 0], y: [0, 4 + i], scale: [1, 0.4] }}
            transition={{
              duration: 0.3 + i * 0.08,
              repeat: Infinity,
              delay: i * 0.07,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Hover glow ring â€” axis-coloured */}
        {isHovered && (
          <motion.ellipse
            cx="22" cy="26" rx="16" ry="22"
            fill="none"
            stroke={glow}
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 0], scale: [0.95, 1.1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
        )}
      </svg>
    </div>
  );
}
```

## SVG: Wooden Box

**Source File:** `src/components/svg/WoodenBoxSVG.tsx`

```tsx
import { motion } from "framer-motion";

interface Props {
  size?: number;
  isCracked?: boolean;
  isNearMatch?: boolean;
}

export function WoodenBoxSVG({ size = 40, isCracked = false, isNearMatch = false }: Props) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
      animate={
        isNearMatch
          ? { rotate: [-1.5, 1.5, -1, 1, 0], x: [-1, 1, -0.5, 0.5, 0] }
          : { rotate: 0, x: 0 }
      }
      transition={
        isNearMatch
          ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.2 }
      }
    >
      <defs>
        <linearGradient id="wood-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4933A" />
          <stop offset="40%" stopColor="#C07C28" />
          <stop offset="100%" stopColor="#8B5514" />
        </linearGradient>
        <linearGradient id="wood-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8A84A" />
          <stop offset="100%" stopColor="#C07C28" />
        </linearGradient>
        <linearGradient id="wood-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A06020" />
          <stop offset="100%" stopColor="#7A4812" />
        </linearGradient>
        <linearGradient id="metal-band-h" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9BAABF" />
          <stop offset="50%" stopColor="#6B7A8F" />
          <stop offset="100%" stopColor="#4A5568" />
        </linearGradient>
        <linearGradient id="metal-band-v" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9BAABF" />
          <stop offset="50%" stopColor="#6B7A8F" />
          <stop offset="100%" stopColor="#4A5568" />
        </linearGradient>
        <filter id="box-shadow-inner">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="20" cy="39" rx="14" ry="2.5" fill="rgba(0,0,0,0.25)" />

      {/* â”€â”€ Isometric box body (front face) â”€â”€ */}
      <rect x="4" y="8" width="28" height="28" rx="2" fill="url(#wood-face)" />

      {/* Wood grain lines - horizontal */}
      <line x1="4" y1="16" x2="32" y2="16" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <line x1="4" y1="22" x2="32" y2="22" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <line x1="4" y1="28" x2="32" y2="28" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

      {/* Wood grain - subtle knots */}
      <ellipse cx="10" cy="19" rx="2" ry="1.2" fill="rgba(0,0,0,0.07)" />
      <ellipse cx="27" cy="25" rx="2.5" ry="1.4" fill="rgba(0,0,0,0.06)" />

      {/* â”€â”€ Metal reinforcement bands â”€â”€ */}
      {/* Horizontal band top */}
      <rect x="4" y="10" width="28" height="3.5" rx="1" fill="url(#metal-band-h)" />
      {/* Horizontal band bottom */}
      <rect x="4" y="30" width="28" height="3.5" rx="1" fill="url(#metal-band-h)" />
      {/* Vertical band center */}
      <rect x="17" y="8" width="3.5" height="28" rx="1" fill="url(#metal-band-v)" />

      {/* â”€â”€ Metal screws/rivets â”€â”€ */}
      {[
        [6.5, 11.75], [29.5, 11.75],
        [6.5, 31.75], [29.5, 31.75],
        [18.75, 10], [18.75, 34],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="1.4" fill="#4A5568" />
          <circle cx={cx - 0.4} cy={cy - 0.4} r="0.5" fill="rgba(255,255,255,0.4)" />
        </g>
      ))}

      {/* â”€â”€ Top face (isometric illusion) â”€â”€ */}
      <rect x="4" y="6" width="28" height="4" rx="2" fill="url(#wood-top)" />
      <line x1="8" y1="6" x2="8" y2="10" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <line x1="20" y1="6" x2="20" y2="10" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />

      {/* â”€â”€ Face highlight â”€â”€ */}
      <rect x="5" y="9" width="6" height="26" rx="1" fill="rgba(255,255,255,0.07)" />

      {/* â”€â”€ Crack overlays when damaged â”€â”€ */}
      {isCracked && (
        <g className="pointer-events-none">
          {/* Main crack */}
          <path
            d="M 14 12 L 11 18 L 15 20 L 10 30"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Secondary crack */}
          <path
            d="M 24 14 L 27 22 L 23 26"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Splinter chip */}
          <path
            d="M 12 16 L 14 13 L 16 16"
            fill="rgba(0,0,0,0.18)"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="0.5"
          />
          {/* Damage tint */}
          <rect x="4" y="8" width="28" height="28" rx="2" fill="rgba(0,0,0,0.08)" />
        </g>
      )}

      {/* â”€â”€ Outer border â”€â”€ */}
      <rect
        x="4"
        y="8"
        width="28"
        height="28"
        rx="2"
        fill="none"
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="1.2"
      />
    </motion.svg>
  );
}
```

## Page: Gameplay Header

**Source File:** `src/components/TopHUD.tsx`

```tsx
import { motion } from "framer-motion";
import { TOON_COLORS } from "../game/constants";
import type { ResponsiveLayoutMode } from "../game/layout";
import type { BlockColor, BonusLoot, LevelDefinition } from "../game/types";
import GameMascot, { type MascotState } from "./GameMascot";

type TopHUDProps = {
  level: LevelDefinition;
  movesLeft: number;
  score: number;
  highScore: number;
  progress: Record<BlockColor, number>;
  boxesDestroyed: number;
  objectivePulse: Record<BlockColor, number>;
  registerObjectiveRef: (color: BlockColor, el: HTMLDivElement | null) => void;
  registerScoreRef?: (el: HTMLDivElement | null) => void;
  onBackToMap?: () => void;
  onPause?: () => void;
  mascotState?: MascotState;
  currentLevel?: number;
  selectedCharacterIndex?: number;
  timeLeft?: number;
  bonusLoot?: BonusLoot;
  layoutMode?: ResponsiveLayoutMode;
};

export function TopHUD({
  level,
  movesLeft,
  score,
  highScore,
  progress,
  boxesDestroyed,
  objectivePulse,
  registerObjectiveRef,
  registerScoreRef,
  onBackToMap,
  onPause,
  mascotState = "idle",
  currentLevel = 1,
  selectedCharacterIndex,
  timeLeft,
  bonusLoot,
  layoutMode = "default",
}: TopHUDProps) {
  const isBonusLevel = level.mode === "bonus";
  const targets = Object.entries(level.targets.colors) as Array<[BlockColor, number]>;
  const boxTarget = level.targets.boxes;
  const boxProgress = Math.min(boxesDestroyed, boxTarget);
  const movesUrgent = movesLeft <= 5 && !isBonusLevel;
  const timeUrgent = isBonusLevel && timeLeft !== undefined && timeLeft <= 10;
  const isNarrowLayout = layoutMode !== "default";
  const isUltraNarrowLayout = layoutMode === "ultraNarrow";
  const avatarSize = isUltraNarrowLayout ? 54 : isNarrowLayout ? 60 : 72;

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="relative w-full select-none">
      <div
        className={`mania-glass-card w-full text-white ${isUltraNarrowLayout ? "rounded-[22px] px-3 py-3" : "rounded-[24px] px-3 py-3.5"}`}
        style={{
          background: isBonusLevel
            ? "linear-gradient(135deg,rgba(100,30,180,0.72) 0%,rgba(40,30,120,0.88) 100%)"
            : "linear-gradient(135deg,rgba(22,13,55,0.88) 0%,rgba(12,8,40,0.96) 100%)",
          border: "1.5px solid rgba(255,255,255,0.13)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: [
            "0 10px 36px rgba(0,0,0,0.60)",
            "inset 0 1px 0 rgba(255,255,255,0.13)",
            "inset 0 -1px 0 rgba(0,0,0,0.30)",
          ].join(", "),
        }}
      >
        <div className={`flex ${isUltraNarrowLayout ? "flex-col gap-3" : "items-start gap-3"}`}>
          <div className={`flex min-w-0 flex-1 ${isUltraNarrowLayout ? "items-center gap-3" : "items-start gap-3"}`}>
            <div className="shrink-0 rounded-[20px] border border-white/12 bg-white/8 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <GameMascot
                mascotState={mascotState}
                currentLevel={currentLevel}
                characterIndex={selectedCharacterIndex}
                size={avatarSize}
                showNameBadge={false}
                interactive
                enableIdleWave
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className={`flex flex-wrap items-center gap-1.5 ${isUltraNarrowLayout ? "justify-start" : ""}`}>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/45">
                  {isBonusLevel ? "Bonus" : "Level"}
                </span>
                <span className={`font-black leading-none tracking-wide text-white ${isNarrowLayout ? "text-[14px]" : "text-[15px]"}`}>
                  {level.id}
                </span>
                {isBonusLevel ? (
                  <motion.span
                    animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase"
                    style={{
                      background: "linear-gradient(90deg,rgba(250,180,0,0.28),rgba(255,120,0,0.28))",
                      border: "1px solid rgba(255,180,0,0.45)",
                      color: "#fbbf24",
                    }}
                  >
                    Rush
                  </motion.span>
                ) : null}
              </div>

              <div className="mt-1">
                {isBonusLevel && timeLeft !== undefined ? (
                  <motion.div
                    className="flex flex-wrap items-center gap-1"
                    animate={timeUrgent ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.45, repeat: timeUrgent ? Infinity : 0 }}
                  >
                    <span className="text-[10px] text-white/50">Time</span>
                    <span
                      className={`font-black tabular-nums ${isNarrowLayout ? "text-[14px]" : "text-[15px]"}`}
                      style={{ color: timeUrgent ? "#ef4444" : "#fbbf24" }}
                    >
                      {formatTime(timeLeft)}
                    </span>
                    {timeUrgent ? (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-[8px] font-bold text-red-400"
                      >
                        !!
                      </motion.span>
                    ) : null}
                  </motion.div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-white/45">Moves</span>
                    <motion.span
                      key={movesLeft}
                      initial={{ scale: 1.35, color: "#ffffff" }}
                      animate={{ scale: 1, color: movesUrgent ? "#ef4444" : "#ffffff" }}
                      transition={{ duration: 0.18 }}
                      className={`font-black tabular-nums leading-none ${isNarrowLayout ? "text-[14px]" : "text-[15px]"}`}
                    >
                      {movesLeft}
                    </motion.span>
                    {movesUrgent ? (
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.55, repeat: Infinity }}
                        className="text-[8px] font-bold text-red-400"
                      >
                        LOW!
                      </motion.span>
                    ) : null}
                  </div>
                )}
              </div>

              {isBonusLevel && bonusLoot ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {bonusLoot.coins > 0 ? <LootBadge emoji="\uD83E\uDE99" value={bonusLoot.coins} color="#fbbf24" /> : null}
                  {bonusLoot.lives > 0 ? <LootBadge emoji="\u2764\uFE0F" value={bonusLoot.lives} color="#f87171" /> : null}
                  {bonusLoot.rockets > 0 ? <LootBadge emoji="\uD83D\uDE80" value={bonusLoot.rockets} color="#60a5fa" /> : null}
                  {bonusLoot.hammers > 0 ? <LootBadge emoji="\uD83D\uDD28" value={bonusLoot.hammers} color="#c084fc" /> : null}
                  {bonusLoot.coins === 0 && bonusLoot.lives === 0 && bonusLoot.rockets === 0 && bonusLoot.hammers === 0 ? (
                    <span className="text-[9px] text-white/35">Collect!</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div
            className={`flex shrink-0 ${isUltraNarrowLayout ? "w-full items-center justify-between gap-3" : "min-w-[78px] flex-col items-end gap-2"}`}
          >
            <div className="flex items-center gap-1">
              {onPause ? (
                <button
                  type="button"
                  onClick={onPause}
                  className="mania-bubbly-button rounded-lg border px-2.5 py-1.5 text-[10px] font-bold text-white"
                  data-tone="glass"
                >
                  \u23F8
                </button>
              ) : null}
              {onBackToMap ? (
                <button
                  type="button"
                  onClick={onBackToMap}
                  className="mania-bubbly-button rounded-lg border px-2.5 py-1.5 text-[10px] font-bold text-white"
                  data-tone="glass"
                >
                  Map
                </button>
              ) : null}
            </div>

            <div
              ref={registerScoreRef}
              className={`flex ${isUltraNarrowLayout ? "items-baseline gap-2" : "flex-col items-end gap-0.5"}`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-white/35">Best</span>
                <span className="text-[9px] font-bold text-white/50">{highScore}</span>
              </div>
              <span className={`font-extrabold tabular-nums text-white ${isNarrowLayout ? "text-[13px]" : "text-[14px]"}`}>
                {score}
              </span>
            </div>
          </div>
        </div>

        <div
          className="my-2"
          style={{
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)",
          }}
        />

        <div className="space-y-1.5">
          {targets.map(([color, target]) => {
            const current = Math.min(progress[color], target);
            const ratio = target <= 0 ? 1 : current / target;
            const done = current >= target;

            return (
              <motion.div
                key={`${color}-${objectivePulse[color]}`}
                ref={(element) => registerObjectiveRef(color, element as HTMLDivElement | null)}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <span
                    className={`font-extrabold uppercase tracking-widest ${isNarrowLayout ? "text-[9px]" : "text-[8px]"}`}
                    style={{ color: done ? "#86efac" : "rgba(255,255,255,0.70)" }}
                  >
                    {done ? "\u2713 " : ""}
                    {color}
                  </span>
                  <span className={`font-bold text-white/55 ${isNarrowLayout ? "text-[9px]" : "text-[8px]"}`}>
                    {current}
                    <span className="text-white/28">/{target}</span>
                  </span>
                </div>
                <div className={`overflow-hidden rounded-full bg-white/10 ${isNarrowLayout ? "h-1.5" : "h-1"}`}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.floor(ratio * 100)}%` }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    style={{
                      background: done ? "linear-gradient(90deg,#4ade80,#22c55e)" : TOON_COLORS[color],
                      boxShadow: done ? "0 0 6px rgba(74,222,128,0.65)" : `0 0 4px ${TOON_COLORS[color]}`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}

          {boxTarget > 0 ? (
            <div>
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <span
                  className={`font-extrabold uppercase tracking-widest ${isNarrowLayout ? "text-[9px]" : "text-[8px]"}`}
                  style={{ color: boxProgress >= boxTarget ? "#86efac" : "rgba(255,255,255,0.70)" }}
                >
                  {boxProgress >= boxTarget ? "\u2713 " : ""}
                  Boxes
                </span>
                <span className={`font-bold text-white/55 ${isNarrowLayout ? "text-[9px]" : "text-[8px]"}`}>
                  {boxProgress}
                  <span className="text-white/28">/{boxTarget}</span>
                </span>
              </div>
              <div className={`overflow-hidden rounded-full bg-white/10 ${isNarrowLayout ? "h-1.5" : "h-1"}`}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${Math.floor((boxTarget <= 0 ? 1 : boxProgress / boxTarget) * 100)}%` }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{
                    background:
                      boxProgress >= boxTarget
                        ? "linear-gradient(90deg,#4ade80,#22c55e)"
                        : "linear-gradient(90deg,#B77A3D,#8B5A1A)",
                    boxShadow:
                      boxProgress >= boxTarget
                        ? "0 0 6px rgba(74,222,128,0.65)"
                        : "0 0 4px rgba(183,122,61,0.70)",
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LootBadge({
  emoji,
  value,
  color,
}: {
  emoji: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.35, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-0.5"
      style={{ color }}
    >
      <span className="text-xs">{emoji}</span>
      <span className="text-[10px] font-black">{value}</span>
    </motion.div>
  );
}
```

## Page: Treasure Reward Popup

**Source File:** `src/components/TreasureRewardPopup.tsx`

```tsx
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ChestRarity, ChestReward } from "../game/types";

type TreasureRewardPopupProps = {
  chest: ChestReward;
  onOpenChest: () => void;
  onContinue: () => void;
};

const RARITY_STYLES: Record<ChestRarity, { accent: string; glow: string; surface: string }> = {
  common: {
    accent: "#7dd3fc",
    glow: "rgba(125,211,252,0.22)",
    surface: "linear-gradient(165deg, rgba(17,85,157,0.95) 0%, rgba(10,43,109,0.98) 100%)",
  },
  rare: {
    accent: "#60a5fa",
    glow: "rgba(96,165,250,0.24)",
    surface: "linear-gradient(165deg, rgba(20,74,173,0.95) 0%, rgba(14,43,103,0.98) 100%)",
  },
  epic: {
    accent: "#c084fc",
    glow: "rgba(192,132,252,0.24)",
    surface: "linear-gradient(165deg, rgba(101,33,184,0.95) 0%, rgba(59,20,113,0.98) 100%)",
  },
  platinum: {
    accent: "#f8fafc",
    glow: "rgba(248,250,252,0.24)",
    surface: "linear-gradient(165deg, rgba(71,85,105,0.95) 0%, rgba(30,41,59,0.98) 100%)",
  },
  crown: {
    accent: "#fcd34d",
    glow: "rgba(252,211,77,0.28)",
    surface: "linear-gradient(165deg, rgba(146,64,14,0.95) 0%, rgba(120,53,15,0.98) 42%, rgba(69,26,3,0.99) 100%)",
  },
};

export function TreasureRewardPopup({ chest, onOpenChest, onContinue }: TreasureRewardPopupProps) {
  const [revealed, setRevealed] = useState(false);
  const rarityStyle = RARITY_STYLES[chest.rarity];

  const rewardLines = useMemo(
    () =>
      [
        chest.coins > 0 ? { label: "Coins", value: `+${chest.coins}` } : null,
        chest.lives > 0 ? { label: "Lives", value: `+${chest.lives}` } : null,
        chest.hammer > 0 ? { label: "Hammer", value: `+${chest.hammer}` } : null,
        chest.glove > 0 ? { label: "Glove", value: `+${chest.glove}` } : null,
        chest.shuffle > 0 ? { label: "Shuffle", value: `+${chest.shuffle}` } : null,
      ].filter((item): item is { label: string; value: string } => item !== null),
    [chest],
  );

  return (
    <div className="fixed inset-0 z-[9050] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.72, opacity: 0, y: 36 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 24 }}
        className="relative w-full max-w-[336px] overflow-hidden rounded-[30px] border border-white/18 p-5 text-white"
        style={{
          background: rarityStyle.surface,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 28px 50px rgba(0,0,0,0.28), 0 0 36px ${rarityStyle.glow}`,
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-4 h-28 w-28 rounded-full blur-3xl" style={{ background: rarityStyle.glow }} />
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full blur-3xl" style={{ background: `${rarityStyle.accent}22` }} />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
        </div>

        <div className="relative text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/58">Treasure Revealed</p>
          <h2 className="mt-2 text-[28px] font-black leading-none">{chest.label}</h2>
          <p className="mt-2 text-[12px] font-semibold text-white/68">
            Level {chest.levelId} reward chest with {chest.starsEarned} star{chest.starsEarned === 1 ? "" : "s"}.
          </p>

          <div
            className="relative mx-auto mt-5 flex h-[122px] w-[122px] items-center justify-center rounded-[34px] border border-white/14"
            style={{
              background: `linear-gradient(180deg, ${rarityStyle.accent}26 0%, rgba(255,255,255,0.08) 100%)`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 0 24px ${rarityStyle.glow}`,
            }}
          >
            <motion.div
              animate={revealed ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] } : { y: [0, -8, 0] }}
              transition={{ duration: revealed ? 0.6 : 2.4, repeat: revealed ? 0 : Infinity, ease: "easeInOut" }}
              className="relative h-[78px] w-[88px]"
            >
              <div className="absolute inset-x-0 bottom-0 h-[44px] rounded-[18px] border border-white/16 bg-[linear-gradient(180deg,rgba(161,98,7,0.98)_0%,rgba(120,53,15,0.98)_100%)] shadow-[0_16px_22px_rgba(0,0,0,0.26)]" />
              <div className="absolute inset-x-[10px] top-[6px] h-[28px] rounded-[14px] bg-[linear-gradient(180deg,rgba(253,224,71,0.98)_0%,rgba(245,158,11,0.98)_100%)]" />
              <div className="absolute left-1/2 top-[27px] h-[18px] w-[18px] -translate-x-1/2 rounded-full border border-white/18 bg-[linear-gradient(180deg,rgba(250,204,21,0.98)_0%,rgba(202,138,4,0.98)_100%)]" />
              <div className="absolute left-1/2 top-[33px] h-[8px] w-[3px] -translate-x-1/2 rounded-full bg-white/75" />
            </motion.div>
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={() => {
                onOpenChest();
                setRevealed(true);
              }}
              className="mt-5 w-full rounded-[20px] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950"
              style={{
                background: "linear-gradient(180deg, #fff1a6 0%, #ffd44f 52%, #ffb92f 100%)",
                boxShadow: "inset 0 2px 0 rgba(255,255,255,0.7), inset 0 -10px 0 rgba(173,109,17,0.28), 0 12px 20px rgba(0,0,0,0.22)",
              }}
            >
              Open Treasure
            </button>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {rewardLines.map((line) => (
                  <div
                    key={line.label}
                    className="rounded-[18px] border border-white/12 bg-white/8 px-3 py-3 text-left"
                    style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/48">{line.label}</p>
                    <p className="mt-1 text-lg font-black text-white">{line.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[20px] border border-white/10 bg-white/8 px-3 py-3 text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/48">Chest Quality</p>
                <p className="mt-1 text-sm font-black text-white">{chest.rarity.toUpperCase()}</p>
                <p className="mt-1 text-[11px] font-semibold text-white/62">Score snapshot: {chest.score}</p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="mt-5 w-full rounded-[20px] border border-white/16 bg-white/12 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 18px rgba(0,0,0,0.18)" }}
              >
                Continue
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
```

## VFX: Disco Effects

**Source File:** `src/components/vfx/DiscoVFX.tsx`

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CELL_SIZE, GRID_GAP, ROWS, TOON_COLORS } from "../../game/constants";
import type { BlockColor } from "../../game/types";
import { DiscoBallSVG } from "../svg/DiscoBallSVG";

const MAX_VISUAL_TARGETS = 16;

type Cell = { col: number; row: number };

type DiscoVFXProps = {
  col: number;
  row: number;
  targets: Cell[];
  targetColor: BlockColor;
  boardWidth: number;
  boardHeight: number;
  onShockStart: () => void;
  onShockEnd: () => void;
  onImpact: () => void;
  onComplete: () => void;
};

const INNER_PAD = 8;

function centerForCell(cell: Cell) {
  const x = INNER_PAD + cell.col * (CELL_SIZE + GRID_GAP) + CELL_SIZE / 2;
  const y = INNER_PAD + (ROWS - 1 - cell.row) * (CELL_SIZE + GRID_GAP) + CELL_SIZE / 2;
  return { x, y };
}

function sampleTargets<T>(items: T[], limit: number) {
  if (items.length <= limit) return items;
  return Array.from({ length: limit }, (_, index) => {
    const sampleIndex = Math.min(items.length - 1, Math.floor(((index + 0.5) / limit) * items.length));
    return items[sampleIndex];
  });
}

export function DiscoVFX({
  col,
  row,
  targets,
  targetColor,
  boardWidth,
  boardHeight,
  onShockStart,
  onShockEnd,
  onImpact,
  onComplete,
}: DiscoVFXProps) {
  const [phase, setPhase] = useState<"charge" | "beams" | "explode">("charge");
  const completedRef = useRef(false);
  const callbacksRef = useRef({ onShockStart, onShockEnd, onImpact, onComplete });
  const beamColor = TOON_COLORS[targetColor] ?? "#7ED3FF";

  const origin = useMemo(() => centerForCell({ col, row }), [col, row]);
  const targetCenters = useMemo(
    () => sampleTargets(targets.map((cell) => centerForCell(cell)), MAX_VISUAL_TARGETS),
    [targets],
  );

  useEffect(() => {
    callbacksRef.current = { onShockStart, onShockEnd, onImpact, onComplete };
  }, [onShockStart, onShockEnd, onImpact, onComplete]);

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) => new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

    const runSequence = async () => {
      // Phase 1: anticipation
      setPhase("charge");
      await sleep(200);
      if (cancelled) return;

      // Phase 2: beams + target shock hold
      setPhase("beams");
      callbacksRef.current.onShockStart();
      await sleep(320);
      if (cancelled) return;

      // Phase 3: impact/explosion trigger
      callbacksRef.current.onShockEnd();
      setPhase("explode");
      callbacksRef.current.onImpact();
      await sleep(180);
      if (cancelled) return;

      // Phase 4: guaranteed finalize callback
      if (!completedRef.current) {
        completedRef.current = true;
        callbacksRef.current.onComplete();
      }
    };

    runSequence();

    return () => {
      cancelled = true;
      callbacksRef.current.onShockEnd();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[120]">
      <svg width={boardWidth + INNER_PAD * 2} height={boardHeight + INNER_PAD * 2} className="absolute left-0 top-0 overflow-visible">
        <defs>
          <filter id="disco-beam-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <AnimatePresence>
          {phase !== "charge" &&
            targetCenters.map((target, index) => (
              <motion.line
                key={`beam-${index}`}
                x1={origin.x}
                y1={origin.y}
                x2={target.x}
                y2={target.y}
                stroke={beamColor}
                strokeWidth={2.4}
                strokeLinecap="round"
                filter="url(#disco-beam-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.008 }}
              />
            ))}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "explode" &&
            targetCenters.map((target, index) => (
              <motion.circle
                key={`burst-${index}`}
                cx={target.x}
                cy={target.y}
                r={2}
                fill="rgba(255,255,255,0.95)"
                initial={{ r: 2, opacity: 1 }}
                animate={{ r: 24, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: "easeOut", delay: index * 0.003 }}
              />
            ))}
        </AnimatePresence>
      </svg>

      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: origin.x, top: origin.y, perspective: 900, transformStyle: "preserve-3d" }}
        animate={
          phase === "charge"
            ? {
                y: [-2, -8, -2],
                scale: [1, 1.3, 1.15],
                rotateY: [0, 360, 720],
                rotateZ: [0, -4, 4, 0],
              }
            : phase === "beams"
              ? {
                  scale: [1.15, 1.08, 1.15],
                  rotateY: [720, 1080, 1440],
                }
              : { scale: [1.2, 0.85], opacity: [1, 0] }
        }
        transition={
          phase === "charge"
            ? { duration: 0.2, ease: "easeOut" }
            : phase === "beams"
              ? { duration: 0.32, ease: "linear", repeat: Infinity }
              : { duration: 0.18, ease: "easeIn" }
        }
      >
        <DiscoBallSVG size={Math.round(CELL_SIZE * 1.15)} />
      </motion.div>
    </div>
  );
}
```

## VFX: Rocket Effects

**Source File:** `src/components/vfx/RocketVFX.tsx`

```tsx
/**
 * RocketVFX.tsx
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Full cinematic rocket launch + split-dash + impact VFX.
 *
 * Axis semantics:
 *   "row"  â†’ rocket clears a full horizontal row â†’ rockets fly LEFT and RIGHT
 *   "col"  â†’ rocket clears a full vertical column â†’ rockets fly UP and DOWN
 *
 * Visual language:
 *   "row" rockets   â†’ RED/orange glow  (horizontal danger stripe)
 *   "col" rockets   â†’ BLUE glow        (vertical laser beam)
 *
 * Animation phases:
 *   0  Charge     100ms â€” shrink + vibrate in place
 *   1  Split+Dash 170ms â€” two halves fly to opposite ends
 *   2  Done       â€”       component unmounts, onComplete fires
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CELL_SIZE, COLUMNS, GRID_GAP, ROWS } from "../../game/constants";

export type RocketAxis = "row" | "col";

export type RocketVFXProps = {
  col: number;
  row: number;
  axis: RocketAxis;
  boardWidth: number;
  boardHeight: number;
  onComplete: () => void;
};

// â”€â”€â”€ Particle types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type SmokeParticle = { id: string; x: number; y: number; delay: number; size: number };
type Sparkle      = { id: string; dx: number; dy: number; delay: number };
type ShockWave    = { id: string; x: number; y: number };

// â”€â”€â”€ Grid coordinate helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const INNER_PAD = 8; // matches the board's p-2 = 8px inner padding
function cellLeft(col: number)    { return INNER_PAD + col * (CELL_SIZE + GRID_GAP); }
function cellTop(row: number)     { return INNER_PAD + (ROWS - 1 - row) * (CELL_SIZE + GRID_GAP); }
function cellCenterX(col: number) { return cellLeft(col) + CELL_SIZE / 2; }
function cellCenterY(row: number) { return cellTop(row)  + CELL_SIZE / 2; }

// â”€â”€â”€ Axis-based colour palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function trailGradient(axis: RocketAxis): string {
  return axis === "row"
    ? "linear-gradient(90deg, transparent 0%, rgba(255,80,20,0.0) 5%, rgba(255,140,30,0.9) 50%, rgba(255,80,20,0.0) 95%, transparent 100%)"
    : "linear-gradient(180deg, transparent 0%, rgba(45,120,255,0.0) 5%, rgba(60,160,255,0.9) 50%, rgba(45,120,255,0.0) 95%, transparent 100%)";
}
function beamGradient(axis: RocketAxis): string {
  return axis === "row"
    ? "linear-gradient(90deg, transparent, rgba(255,120,30,0.38), transparent)"
    : "linear-gradient(180deg, transparent, rgba(60,160,255,0.38), transparent)";
}
function shockwaveColor(axis: RocketAxis): string {
  return axis === "row" ? "rgba(255,160,60,0.85)" : "rgba(80,180,255,0.85)";
}
function sparkColor(axis: RocketAxis, i: number): string {
  if (axis === "row") return i % 2 === 0 ? "#FFD32D" : "#FF8C00";
  return i % 2 === 0 ? "#5CF3FF" : "#2D9CFF";
}
function glowRingColor(axis: RocketAxis): string {
  return axis === "row" ? "rgba(255,100,30,0.7)" : "rgba(45,156,255,0.7)";
}

// â”€â”€â”€ Inline rocket SVG (self-contained, no external component dependency) â”€â”€â”€â”€â”€
// The SVG is always drawn pointing UP. CSS rotation then orients it correctly.
// rotationDeg:
//   0   â†’ points UP    (col, going up)
//   180 â†’ points DOWN  (col, going down)
//   90  â†’ points RIGHT (row, going right)
//   270 â†’ points LEFT  (row, going left)
interface InlineRocketProps {
  phase: 0 | 1 | 2;
  axis: RocketAxis;
  rotationDeg: number;
}
function InlineRocket({ phase, axis, rotationDeg }: InlineRocketProps) {
  const sfx = axis === "col" ? "v" : "h";
  const glowFill = axis === "col"
    ? "rgba(45,156,255,0.55)"
    : "rgba(255,100,30,0.55)";

  return (
    <div
      style={{
        width: 44,
        height: 48,
        transform: `rotate(${rotationDeg}deg)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}
    >
      <svg width="44" height="48" viewBox="0 0 44 48" fill="none" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`rvfx-body-${sfx}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D0D8E8" />
          </linearGradient>
          <linearGradient id={`rvfx-nose-${sfx}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#CC0000" />
          </linearGradient>
          <radialGradient id={`rvfx-glow-${sfx}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={glowFill} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Glow ring behind rocket */}
        <ellipse cx="22" cy="26" rx="18" ry="22" fill={`url(#rvfx-glow-${sfx})`} />

        {/* Fins */}
        <path d="M 13 34 L 6 42 L 14 38 Z" fill="#E53E3E" />
        <path d="M 31 34 L 38 42 L 30 38 Z" fill="#9B2C2C" />

        {/* Body */}
        <rect x="13" y="16" width="18" height="24" rx="3" fill={`url(#rvfx-body-${sfx})`} />
        <rect x="13" y="28" width="18" height="5"  fill="#FF4848" />

        {/* Nose */}
        <path d="M 13 16 Q 13 4 22 2 Q 31 4 31 16 Z" fill={`url(#rvfx-nose-${sfx})`} />
        {/* Nose shine */}
        <path
          d="M 16 10 Q 18 5 22 4"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Window */}
        <circle cx="22" cy="22" r="5" fill="#5BC8F5" />
        <circle cx="22" cy="22" r="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
        <ellipse cx="20.5" cy="20.5" rx="2" ry="1.2" fill="rgba(255,255,255,0.6)" transform="rotate(-30 20.5 20.5)" />

        {/* Body highlight */}
        <rect x="15" y="17" width="4" height="16" rx="2" fill="rgba(255,255,255,0.32)" />

        {/* Nozzle */}
        <path d="M 16 40 Q 22 43 28 40 L 26 38 L 18 38 Z" fill="#888EA8" />

        {/* Engine fire â€” bigger during dash */}
        <path
          d={phase === 1
            ? "M 15 42 Q 18 60 22 64 Q 26 60 29 42 Z"
            : "M 17 42 Q 19 52 22 54 Q 25 52 27 42 Z"}
          fill="#FF5722"
          opacity={phase === 1 ? 0.95 : 0.75}
        />
        <path
          d={phase === 1
            ? "M 17.5 42 Q 19.5 55 22 58 Q 24.5 55 26.5 42 Z"
            : "M 18.5 42 Q 20 48 22 50 Q 24 48 25.5 42 Z"}
          fill="#FF9800"
        />
        <path
          d={phase === 1
            ? "M 19 42 Q 20.5 50 22 53 Q 23.5 50 25 42 Z"
            : "M 19.5 42 Q 20.5 46 22 47.5 Q 23.5 46 24.5 42 Z"}
          fill="#FFF176"
        />
        {/* Bright tip */}
        <circle cx="22" cy="43.5" r="1.8" fill="#FFFDE7" />
      </svg>
    </div>
  );
}

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function RocketVFX({
  col,
  row,
  axis,
  boardWidth,
  boardHeight,
  onComplete,
}: RocketVFXProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);
  const [sparklesA, setSparklesA] = useState<Sparkle[]>([]); // rocket A (up / right)
  const [sparklesB, setSparklesB] = useState<Sparkle[]>([]); // rocket B (down / left)
  const [shockwaves, setShockwaves] = useState<ShockWave[]>([]);
  const completedRef = useRef(false);
  const timersRef    = useRef<number[]>([]);

  const originX = cellCenterX(col);
  const originY = cellCenterY(row);

  // â”€â”€ Rotation angles for the two split rockets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // axis="row" â†’ one goes RIGHT (90Â°), one goes LEFT (270Â°)
  // axis="col" â†’ one goes UP   (0Â°),  one goes DOWN (180Â°)
  const rotA = axis === "row" ? 90  : 0;   // right / up
  const rotB = axis === "row" ? 270 : 180; // left  / down

  // â”€â”€ How far each rocket half travels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const halfW = boardWidth  / 2;
  const halfH = boardHeight / 2;

  // translate A (right or up)
  const dashAX = axis === "row" ?  halfW : 0;
  const dashAY = axis === "col" ? -halfH : 0;
  // translate B (left or down)
  const dashBX = axis === "row" ? -halfW : 0;
  const dashBY = axis === "col" ?  halfH : 0;

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const buildSparkles = (): Sparkle[] =>
    Array.from({ length: 12 }, (_, i) => ({
      id: `sp_${i}_${Date.now()}`,
      dx: (Math.random() - 0.5) * 24,
      dy: (Math.random() - 0.5) * 24,
      delay: i * 0.016,
    }));

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const spawnShockwaves = () => {
    const count = axis === "row" ? COLUMNS : ROWS;
    for (let i = 0; i < count; i++) {
      const delay = i * (260 / count);
      addTimer(() => {
        const x = axis === "row" ? cellLeft(i) + CELL_SIZE / 2 : originX;
        const y = axis === "col" ? cellTop(i)  + CELL_SIZE / 2 : originY;
        const id = `sw_${i}_${Date.now()}`;
        setShockwaves(prev => [...prev, { id, x, y }]);
        addTimer(() => setShockwaves(prev => prev.filter(sw => sw.id !== id)), 280);
      }, delay);
    }
  };

  const spawnSmoke = () => {
    const count = Math.min(axis === "row" ? COLUMNS : ROWS, 7);
    const particles: SmokeParticle[] = [];
    for (let i = 0; i < count; i++) {
      const trackRatio = count <= 1 ? 0 : i / (count - 1);
      const x = axis === "row" ? trackRatio * boardWidth + INNER_PAD : originX;
      const y = axis === "col" ? trackRatio * boardHeight + INNER_PAD : originY;
      particles.push({
        id: `smoke_${i}_${Date.now()}`,
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        delay: i * (260 / count),
        size: 16 + Math.random() * 16,
      });
    }
    setSmokeParticles(particles);
    addTimer(() => setSmokeParticles([]), 640);
  };

  // â”€â”€ Phase sequencer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    setSparklesA(buildSparkles());
    setSparklesB(buildSparkles());

    addTimer(() => {
      // Phase 0 â†’ 1: start the dash
      setPhase(1);
      spawnShockwaves();
      spawnSmoke();

      addTimer(() => {
        setPhase(2);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }, 320);
    }, 220);

    return () => {
      timersRef.current.forEach(id => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 2) return null;

  // Rocket icon starts centred on the origin cell
  const rocketLeft = originX - 22;
  const rocketTop  = originY - 24;

  const swColor   = shockwaveColor(axis);
  const glowRing  = glowRingColor(axis);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 80 }}
    >
      {/* â”€â”€ Glowing axis trail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            key="trail"
            className="absolute"
              style={{
              left:   axis === "row" ? INNER_PAD : originX - 3,
              top:    axis === "col" ? INNER_PAD : originY - 3,
              width:  axis === "row" ? boardWidth  : 6,
              height: axis === "col" ? boardHeight : 6,
              background: trailGradient(axis),
              borderRadius: 3,
              filter: "blur(2.5px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 0] }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* â”€â”€ Smoke poof particles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {smokeParticles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left:   p.x - p.size / 2,
              top:    p.y - p.size / 2,
              width:  p.size,
              height: p.size,
              background:
                "radial-gradient(circle, rgba(220,220,220,0.9) 0%, rgba(180,180,180,0.4) 60%, transparent 100%)",
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 1.4, 1.8], opacity: [0, 0.85, 0] }}
            transition={{ duration: 0.42, delay: p.delay / 1000, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* â”€â”€ Shockwave rings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {shockwaves.map(sw => (
          <motion.div
            key={sw.id}
            className="absolute rounded-full"
            style={{
              left:      sw.x - CELL_SIZE / 2,
              top:       sw.y - CELL_SIZE / 2,
              width:     CELL_SIZE,
              height:    CELL_SIZE,
              border:    `2px solid ${swColor}`,
              boxShadow: `0 0 14px ${swColor}`,
            }}
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: [0.3, 2.0], opacity: [0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* â”€â”€ Sweep beam along the entire axis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            key="beam"
            className="absolute pointer-events-none"
            style={{
              left:       axis === "row" ? INNER_PAD : originX - CELL_SIZE / 2,
              top:        axis === "col" ? INNER_PAD : originY - CELL_SIZE / 2,
              width:      axis === "row" ? boardWidth  : CELL_SIZE,
              height:     axis === "col" ? boardHeight : CELL_SIZE,
              background: beamGradient(axis),
              borderRadius: CELL_SIZE / 2,
            }}
            initial={{ opacity: 0, scaleX: axis === "row" ? 0 : 1, scaleY: axis === "col" ? 0 : 1 }}
            animate={{ opacity: [0, 0.9, 0], scaleX: 1, scaleY: 1 }}
            transition={{ duration: 0.30, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* â”€â”€ Rocket A: flies RIGHT (row) or UP (col) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        className="absolute"
        style={{ left: rocketLeft, top: rocketTop, width: 44, height: 48, zIndex: 90 }}
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={
          phase === 0
            ? {
                scale: [1, 0.82, 0.88, 0.80, 0.85],
                x: [0, -3,  3, -2,  2, 0],
                y: [0, -2,  2, -1,  1, 0],
              }
            : {
                scale: 1,
                scaleX: axis === "row" ? [1, 1.65, 1.55] : 1,
                scaleY: axis === "col" ? [1, 1.65, 1.55] : 1,
                x: dashAX,
                y: dashAY,
              }
        }
        transition={
          phase === 0
            ? { duration: 0.22, ease: "easeInOut" }
            : { duration: 0.29, ease: [0.2, 0, 0.2, 1] }
        }
      >
        <InlineRocket phase={phase} axis={axis} rotationDeg={rotA} />

        {/* Trailing sparkles for rocket A */}
        <AnimatePresence>
          {phase === 1 &&
            sparklesA.map((sp, i) => (
              <motion.div
                key={sp.id}
                className="absolute rounded-full"
                style={{
                  left: 22,
                  top:  44,
                  width: 4,
                  height: 4,
                  background: sparkColor(axis, i),
                  boxShadow: `0 0 6px ${sparkColor(axis, i)}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x:       axis === "row" ? sp.dx * -1 : sp.dx,
                  y:       axis === "col" ? sp.dy * -1 : sp.dy,
                  opacity: 0,
                  scale:   0.2,
                }}
                transition={{ duration: 0.28, delay: sp.delay, ease: "easeOut" }}
              />
            ))}
        </AnimatePresence>

        {/* Glow ring visible during charge */}
        {phase === 0 && (
          <motion.div
            style={{
              position:     "absolute",
              inset:        -6,
              borderRadius: "50%",
              border:       `2px solid ${glowRing}`,
              boxShadow:    `0 0 12px ${glowRing}`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.18, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* â”€â”€ Rocket B: flies LEFT (row) or DOWN (col) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        className="absolute"
        style={{ left: rocketLeft, top: rocketTop, width: 44, height: 48, zIndex: 90 }}
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={
          phase === 0
            ? {
                scale: [1, 0.82, 0.88, 0.80, 0.85],
                x: [0,  3, -3,  2, -2, 0],
                y: [0,  2, -2,  1, -1, 0],
              }
            : {
                scale: 1,
                scaleX: axis === "row" ? [1, 1.65, 1.55] : 1,
                scaleY: axis === "col" ? [1, 1.65, 1.55] : 1,
                x: dashBX,
                y: dashBY,
              }
        }
        transition={
          phase === 0
            ? { duration: 0.22, ease: "easeInOut" }
            : { duration: 0.29, ease: [0.2, 0, 0.2, 1] }
        }
      >
        <InlineRocket phase={phase} axis={axis} rotationDeg={rotB} />

        {/* Trailing sparkles for rocket B */}
        <AnimatePresence>
          {phase === 1 &&
            sparklesB.map((sp, i) => (
              <motion.div
                key={sp.id}
                className="absolute rounded-full"
                style={{
                  left: 22,
                  top:  44,
                  width: 4,
                  height: 4,
                  background: sparkColor(axis, i),
                  boxShadow: `0 0 6px ${sparkColor(axis, i)}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x:       axis === "row" ? sp.dx : sp.dx,
                  y:       axis === "col" ? sp.dy : sp.dy,
                  opacity: 0,
                  scale:   0.2,
                }}
                transition={{ duration: 0.28, delay: sp.delay, ease: "easeOut" }}
              />
            ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
```

## Page: Full Route / Maps

**Source File:** `src/components/WorldMapModal.tsx`

```tsx
import { motion } from "framer-motion";
import type { ResponsiveLayoutMode } from "../game/layout";
import { ScrollableMap } from "./ScrollableMap";

type WorldMapTheme = {
  accent: string;
  glow: string;
};

type WorldMapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  unlockedLevel: number;
  totalLevels: number;
  starsByLevel: Record<number, number>;
  selectedCharacterIndex?: number;
  onSelectLevel: (levelId: number) => void;
  theme: WorldMapTheme;
  layoutMode?: ResponsiveLayoutMode;
};

export function WorldMapModal({
  isOpen,
  onClose,
  currentLevel,
  unlockedLevel,
  totalLevels,
  starsByLevel,
  selectedCharacterIndex,
  onSelectLevel,
  theme,
  layoutMode = "default",
}: WorldMapModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="mania-overlay-backdrop fixed inset-0 z-[400] overflow-hidden p-2 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="mania-overlay-sheet mania-ui mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden rounded-[34px] border text-white"
        style={{ borderColor: `${theme.accent}30`, boxShadow: `0 24px 54px rgba(0,0,0,0.38), 0 0 34px ${theme.glow}` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-white/10 px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mania-kicker text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: theme.accent }}>
                World Map
              </p>
              <h2 className="mania-title mt-2 text-2xl font-black">Full Route View</h2>
              <p className="mt-1 text-sm font-semibold text-white/76">
                Explore the full saga trail in fullscreen, then close when you are ready.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mania-bubbly-button rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white"
              data-tone="glass"
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-3 pb-3 pt-3">
          <ScrollableMap
            currentLevel={currentLevel}
            totalLevels={totalLevels}
            unlockedLevel={unlockedLevel}
            starsByLevel={starsByLevel}
            selectedCharacterIndex={selectedCharacterIndex}
            onSelectLevel={(levelId) => {
              onClose();
              onSelectLevel(levelId);
            }}
            variant="fullscreen"
            showHeader={false}
            layoutMode={layoutMode}
          />
        </div>
      </motion.div>
    </div>
  );
}
```

## Game Data: Constants

**Source File:** `src/game/constants.ts`

```ts
import type { BlockColor } from "./types";
import { LEVELS_DATA } from "./levelsData";

export const COLUMNS = 9;
export const ROWS = 11;
export const CELL_SIZE = 36;
export const GRID_GAP = 3;

export const TOON_COLORS: Record<BlockColor, string> = {
  red: "#FF4848",
  blue: "#2D9CFF",
  green: "#47D35B",
  yellow: "#FFD32D",
  purple: "#9D50FF",
};

export const BLOCK_COLORS = Object.keys(TOON_COLORS) as BlockColor[];

// Export all 50 levels from the data module
export const LEVELS = LEVELS_DATA;

export const BIG_BLAST_LABELS = ["Nice!", "Blast!", "Great!", "Awesome!", "Super!"];

export const STORAGE_KEYS = {
  sagaProgress: "toonblast.web.sagaProgress",
  economy: "toonblast.web.economy",
  settings: "toonblast.web.settings",
  metaProgress: "toonblast.web.metaProgress",
};

export const ECONOMY = {
  startCoins: 500,
  startLives: 5,
  maxLives: 5,
  lifeRefillMs: 30 * 60 * 1000,
  rescueMoves: 5,
  rescueCostCoins: 100,
  livesRefillCostCoins: 100,
  winBaseCoins: 20,
  winUnusedMoveCoinBonus: 5,
  boosterCosts: {
    hammer: 50,
    glove: 100,
    shuffle: 50,
  },
};
```

## Game Content: Episode Themes

**Source File:** `src/game/content/episodeThemes.ts`

```ts
export const LEVELS_PER_EPISODE = 20;

export type EpisodeTheme = {
  episodeNumber: number;
  title: string;
  routeLabel: string;
  summary: string;
  skylineLabel: string;
  accent: string;
  accentSoft: string;
  glow: string;
  shellBackground: string;
  surface: string;
  sceneGradient: string;
};

const EPISODE_THEME_LIBRARY = [
  {
    title: "Moonlit Run",
    routeLabel: "Harbor Route",
    summary: "Neon currents, cargo piers, and crystal water set the tone for the opening climb.",
    skylineLabel: "Crystal Harbor",
    accent: "#7dd3fc",
    accentSoft: "#bae6fd",
    glow: "rgba(125,211,252,0.24)",
    shellBackground:
      "radial-gradient(circle at 18% 14%, rgba(125, 211, 252, 0.24) 0%, rgba(125, 211, 252, 0) 28%), radial-gradient(circle at 82% 18%, rgba(244, 114, 182, 0.22) 0%, rgba(244, 114, 182, 0) 34%), radial-gradient(circle at 52% 92%, rgba(110, 231, 255, 0.16) 0%, rgba(110, 231, 255, 0) 28%), linear-gradient(180deg, #2037a9 0%, #172773 38%, #10184c 72%, #090f2f 100%)",
    surface:
      "linear-gradient(180deg, rgba(9,36,106,0.84) 0%, rgba(9,29,88,0.64) 52%, rgba(7,21,61,0.88) 100%)",
    sceneGradient:
      "linear-gradient(180deg, rgba(125,211,252,0.34) 0%, rgba(125,211,252,0.08) 24%, rgba(15,23,42,0) 68%), linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0) 100%)",
  },
  {
    title: "Aurora Dunes",
    routeLabel: "Sunflare Trail",
    summary: "Glowing sand ribbons and warm aurora bands turn every climb into a sunset sprint.",
    skylineLabel: "Aurora Basin",
    accent: "#fbbf24",
    accentSoft: "#fde68a",
    glow: "rgba(251,191,36,0.24)",
    shellBackground:
      "radial-gradient(circle at 16% 20%, rgba(251, 191, 36, 0.26) 0%, rgba(251, 191, 36, 0) 30%), radial-gradient(circle at 80% 18%, rgba(248, 113, 113, 0.2) 0%, rgba(248, 113, 113, 0) 30%), radial-gradient(circle at 52% 88%, rgba(252, 211, 77, 0.14) 0%, rgba(252, 211, 77, 0) 26%), linear-gradient(180deg, #66320f 0%, #8f3b12 26%, #5d2158 66%, #271454 100%)",
    surface:
      "linear-gradient(180deg, rgba(109,52,19,0.84) 0%, rgba(120,55,22,0.7) 40%, rgba(59,22,78,0.9) 100%)",
    sceneGradient:
      "linear-gradient(180deg, rgba(255,236,179,0.24) 0%, rgba(255,236,179,0.06) 24%, rgba(255,255,255,0) 70%), linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 48%, rgba(255,255,255,0) 100%)",
  },
  {
    title: "Crystal Harbor",
    routeLabel: "Tideglass Route",
    summary: "The route curves through mirror water, prism cliffs, and humming sea towers.",
    skylineLabel: "Prism Marina",
    accent: "#67e8f9",
    accentSoft: "#cffafe",
    glow: "rgba(103,232,249,0.24)",
    shellBackground:
      "radial-gradient(circle at 18% 15%, rgba(103, 232, 249, 0.24) 0%, rgba(103, 232, 249, 0) 30%), radial-gradient(circle at 82% 20%, rgba(147, 197, 253, 0.22) 0%, rgba(147, 197, 253, 0) 30%), radial-gradient(circle at 50% 86%, rgba(34, 211, 238, 0.16) 0%, rgba(34, 211, 238, 0) 26%), linear-gradient(180deg, #0e7490 0%, #0f3f78 40%, #10214f 100%)",
    surface:
      "linear-gradient(180deg, rgba(11,86,118,0.84) 0%, rgba(14,71,128,0.72) 42%, rgba(14,31,76,0.9) 100%)",
    sceneGradient:
      "linear-gradient(180deg, rgba(207,250,254,0.22) 0%, rgba(207,250,254,0.05) 26%, rgba(255,255,255,0) 70%), linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 46%, rgba(255,255,255,0) 100%)",
  },
  {
    title: "Golden Canopy",
    routeLabel: "Sunleaf Trek",
    summary: "Lantern vines, bright treetops, and hidden ruins make this arc feel richer and denser.",
    skylineLabel: "Canopy Verge",
    accent: "#34d399",
    accentSoft: "#a7f3d0",
    glow: "rgba(52,211,153,0.24)",
    shellBackground:
      "radial-gradient(circle at 14% 18%, rgba(52, 211, 153, 0.22) 0%, rgba(52, 211, 153, 0) 28%), radial-gradient(circle at 80% 18%, rgba(250, 204, 21, 0.22) 0%, rgba(250, 204, 21, 0) 28%), radial-gradient(circle at 48% 88%, rgba(134, 239, 172, 0.14) 0%, rgba(134, 239, 172, 0) 24%), linear-gradient(180deg, #14532d 0%, #1f6b3b 34%, #3b2f12 66%, #1f172a 100%)",
    surface:
      "linear-gradient(180deg, rgba(18,89,54,0.84) 0%, rgba(29,112,70,0.72) 42%, rgba(44,36,16,0.9) 100%)",
    sceneGradient:
      "linear-gradient(180deg, rgba(220,252,231,0.22) 0%, rgba(220,252,231,0.04) 26%, rgba(255,255,255,0) 70%), linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 44%, rgba(255,255,255,0) 100%)",
  },
  {
    title: "Sky Bazaar",
    routeLabel: "Starwind Circuit",
    summary: "Floating stalls, comet lanterns, and bright sky bridges push the route into spectacle.",
    skylineLabel: "Skyline Market",
    accent: "#c084fc",
    accentSoft: "#e9d5ff",
    glow: "rgba(192,132,252,0.24)",
    shellBackground:
      "radial-gradient(circle at 18% 14%, rgba(192, 132, 252, 0.24) 0%, rgba(192, 132, 252, 0) 30%), radial-gradient(circle at 82% 18%, rgba(96, 165, 250, 0.2) 0%, rgba(96, 165, 250, 0) 30%), radial-gradient(circle at 52% 90%, rgba(244, 114, 182, 0.16) 0%, rgba(244, 114, 182, 0) 26%), linear-gradient(180deg, #4c1d95 0%, #3b2f8f 32%, #1e1b4b 100%)",
    surface:
      "linear-gradient(180deg, rgba(76,29,149,0.84) 0%, rgba(71,47,143,0.72) 42%, rgba(27,24,73,0.92) 100%)",
    sceneGradient:
      "linear-gradient(180deg, rgba(233,213,255,0.22) 0%, rgba(233,213,255,0.05) 24%, rgba(255,255,255,0) 70%), linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 46%, rgba(255,255,255,0) 100%)",
  },
] as const;

export function getEpisodeNumberForLevel(levelId: number) {
  return Math.max(1, Math.ceil(Math.max(1, levelId) / LEVELS_PER_EPISODE));
}

export function getEpisodeThemeForLevel(levelId: number): EpisodeTheme {
  const episodeNumber = getEpisodeNumberForLevel(levelId);
  const theme = EPISODE_THEME_LIBRARY[(episodeNumber - 1) % EPISODE_THEME_LIBRARY.length];

  return {
    episodeNumber,
    ...theme,
  };
}

export function getEpisodeRange(levelId: number, levelCap: number) {
  const episodeNumber = getEpisodeNumberForLevel(levelId);
  const startLevel = (episodeNumber - 1) * LEVELS_PER_EPISODE + 1;
  const endLevel = Math.min(episodeNumber * LEVELS_PER_EPISODE, levelCap);

  return {
    episodeNumber,
    startLevel,
    endLevel,
  };
}
```

## Game Logic: Core Engine

**Source File:** `src/game/engine.ts`

```ts
import type { MutableRefObject } from "react";
import { BLOCK_COLORS, COLUMNS, ROWS } from "./constants";
import { BONUS_LEVEL_CONFIG } from "./levelsData";
import type {
  BlockColor,
  BlockTile,
  BoosterKind,
  BoosterTile,
  CloudTile,
  DestroyedBox,
  DestroyedRegular,
  DestroyedSummary,
  HoneyTile,
  IceTile,
  LevelDefinition,
  RegularTile,
  RewardKind,
  RewardBundle,
  RewardTile,
  SafeTile,
  TapResolution,
} from "./types";

type Grid = (BlockTile | null)[][];

type Cell = { col: number; row: number };

type BoosterMeta = {
  chainedBoosters: number;
  heavyImpact: boolean;
  rocketBombCombo: boolean;
  comboCenter?: { col: number; row: number };
};

const EMPTY_REWARD: RewardBundle = {
  coins: 0,
  lives: 0,
  hammer: 0,
  glove: 0,
  shuffle: 0,
  unlimitedLivesMinutes: 0,
};

export const MAP_LEVEL_CAP = 500;
export const CHAMPIONS_START_LEVEL = 501;

function seeded(levelNumber: number, salt: number) {
  const x = Math.sin(levelNumber * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function generateProceduralBoxPositions(levelNumber: number, count: number): Array<{ col: number; row: number }> {
  const out: Array<{ col: number; row: number }> = [];
  const used = new Set<string>();
  const maxCount = clamp(count, 0, Math.floor((COLUMNS * ROWS) * 0.35));
  let attempts = 0;

  while (out.length < maxCount && attempts < maxCount * 30) {
    attempts += 1;
    const col = Math.floor(seeded(levelNumber, attempts) * COLUMNS);
    const row = Math.floor(seeded(levelNumber, attempts + 17) * ROWS);
    const key = `${col}:${row}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push({ col, row });
  }

  return out;
}

function generateStarThresholds(levelNumber: number): [number, number, number] {
  const base = 450 + levelNumber * 36;
  return [base, Math.floor(base * 1.55), Math.floor(base * 2.25)];
}

export function generateLevelData(levelNumber: number): LevelDefinition {
  const safeLevel = Math.max(1, Math.floor(levelNumber));

  // Season Finale every 50th level (up to map cap): strict 30s Treasure Bonus.
  if (safeLevel <= MAP_LEVEL_CAP && safeLevel % 50 === 0) {
    return {
      id: safeLevel,
      mode: "bonus",
      moves: 0,
      timeLimit: 30,
      targets: { colors: {}, boxes: 0 },
      starThresholds: generateStarThresholds(safeLevel),
      rewardSpawnRate: 0.08,
    };
  }

  // Champions League: infinite high-difficulty randomization (level > 500).
  if (safeLevel > MAP_LEVEL_CAP) {
    const depth = safeLevel - MAP_LEVEL_CAP;
    const colorPool: BlockColor[] = ["red", "blue", "green", "yellow", "purple"];
    const colorA = colorPool[Math.floor(seeded(safeLevel, 1) * colorPool.length)];
    const colorB = colorPool[Math.floor(seeded(safeLevel, 2) * colorPool.length)];
    const colorC = colorPool[Math.floor(seeded(safeLevel, 3) * colorPool.length)];
    const boxCount = clamp(16 + Math.floor(depth * 1.6), 16, 32);
    const moves = clamp(16 - Math.floor(depth / 12), 9, 16);

    return {
      id: safeLevel,
      mode: "normal",
      moves,
      targets: {
        colors: {
          [colorA]: 22 + Math.floor(depth * 1.25),
          [colorB]: 20 + Math.floor(depth * 1.25),
          [colorC]: 18 + Math.floor(depth * 1.15),
        },
        boxes: boxCount,
      },
      boxPositions: generateProceduralBoxPositions(safeLevel, boxCount),
      starThresholds: generateStarThresholds(safeLevel),
    };
  }

  // Normal progression (1..500): scalable mathematical curve.
  const tier = Math.floor((safeLevel - 1) / 20);
  const phase = (safeLevel - 1) % 20;
  const colorPool: BlockColor[] = ["red", "blue", "green", "yellow", "purple"];
  const colorCount = tier < 3 ? 1 : tier < 8 ? 2 : 3;
  const moves = clamp(25 - Math.floor(tier * 0.7) - (phase >= 14 ? 1 : 0), 11, 25);
  const baseTarget = 14 + tier * 2 + Math.floor(phase * 0.6);
  const boxes = clamp(Math.floor((safeLevel - 1) / 6), 0, 30);
  const colors: Partial<Record<BlockColor, number>> = {};

  for (let i = 0; i < colorCount; i += 1) {
    const c = colorPool[(safeLevel + i * 2) % colorPool.length];
    colors[c] = baseTarget + Math.floor(i * 2.5);
  }

  return {
    id: safeLevel,
    mode: "normal",
    moves,
    targets: {
      colors,
      boxes,
    },
    boxPositions: boxes > 0 ? generateProceduralBoxPositions(safeLevel, boxes) : undefined,
    starThresholds: generateStarThresholds(safeLevel),
  };
}

const ORTHOGONAL: Cell[] = [
  { col: 1, row: 0 },
  { col: -1, row: 0 },
  { col: 0, row: 1 },
  { col: 0, row: -1 },
];

function inBounds(col: number, row: number) {
  return col >= 0 && col < COLUMNS && row >= 0 && row < ROWS;
}

function createDestroyedSummary(): DestroyedSummary {
  return {
    colors: { red: 0, blue: 0, green: 0, yellow: 0, purple: 0 },
    boxes: 0,
    specials: 0,
  };
}

function cloneRewardBundle(bundle: RewardBundle): RewardBundle {
  return {
    coins: bundle.coins,
    lives: bundle.lives,
    hammer: bundle.hammer,
    glove: bundle.glove,
    shuffle: bundle.shuffle,
    unlimitedLivesMinutes: bundle.unlimitedLivesMinutes,
  };
}

function mergeRewardBundle(target: RewardBundle, addition: Partial<RewardBundle> | null | undefined) {
  if (!addition) return;
  target.coins += addition.coins ?? 0;
  target.lives += addition.lives ?? 0;
  target.hammer += addition.hammer ?? 0;
  target.glove += addition.glove ?? 0;
  target.shuffle += addition.shuffle ?? 0;
  target.unlimitedLivesMinutes += addition.unlimitedLivesMinutes ?? 0;
}

function hasReward(bundle: RewardBundle) {
  return (
    bundle.coins > 0 ||
    bundle.lives > 0 ||
    bundle.hammer > 0 ||
    bundle.glove > 0 ||
    bundle.shuffle > 0 ||
    bundle.unlimitedLivesMinutes > 0
  );
}

function pickDiscoTargets(grid: Grid): { color: BlockColor; targets: Cell[] } | null {
  const colorsOnBoard = new Set<BlockColor>();
  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const tile = grid[col][row];
      if (tile?.kind === "regular") {
        colorsOnBoard.add(tile.color);
      }
    }
  }

  const palette = Array.from(colorsOnBoard);
  if (palette.length === 0) return null;

  const selected = palette[Math.floor(Math.random() * palette.length)];
  const targets: Cell[] = [];
  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const tile = grid[col][row];
      if (tile?.kind === "regular" && tile.color === selected) {
        targets.push({ col, row });
      }
    }
  }

  return { color: selected, targets };
}

function randomColor(): BlockColor {
  return BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
}

function isStaticObstacle(tile: BlockTile): tile is Extract<BlockTile, { kind: "box" | "honey" | "ice" | "safe" | "cloud" }> {
  return tile.kind === "box" || tile.kind === "honey" || tile.kind === "ice" || tile.kind === "safe" || tile.kind === "cloud";
}

function isMovableTile(tile: BlockTile): tile is Extract<BlockTile, { kind: "regular" | "booster" | "reward" }> {
  return tile.kind === "regular" || tile.kind === "booster" || tile.kind === "reward";
}

function createHoneyTile(nextId: MutableRefObject<number>, col: number, row: number): HoneyTile {
  return {
    id: `b_${nextId.current++}`,
    kind: "honey",
    col,
    row,
    spawnRow: row,
  };
}

function createIceTile(nextId: MutableRefObject<number>, col: number, row: number): IceTile {
  return {
    id: `b_${nextId.current++}`,
    kind: "ice",
    col,
    row,
    spawnRow: row,
    hitsRemaining: 2,
    maxHits: 2,
  };
}

function createSafeTile(nextId: MutableRefObject<number>, col: number, row: number, levelId: number, index: number): SafeTile {
  const color = BLOCK_COLORS[(levelId + index) % BLOCK_COLORS.length];
  const reward: RewardBundle = {
    ...EMPTY_REWARD,
    coins: 70 + Math.floor(levelId / 4) * 5,
    hammer: seeded(levelId, 91 + index * 3) > 0.72 ? 1 : 0,
    shuffle: seeded(levelId, 127 + index * 5) > 0.84 ? 1 : 0,
  };

  return {
    id: `b_${nextId.current++}`,
    kind: "safe",
    col,
    row,
    spawnRow: row,
    color,
    reward,
  };
}

function createCloudTile(nextId: MutableRefObject<number>, col: number, row: number): CloudTile {
  return {
    id: `b_${nextId.current++}`,
    kind: "cloud",
    col,
    row,
    spawnRow: row,
  };
}

function pickObstacleCells(levelNumber: number, salt: number, count: number, occupied: Set<string>) {
  const cells: Cell[] = [];
  let attempts = 0;

  while (cells.length < count && attempts < count * 40) {
    attempts += 1;
    const col = Math.floor(seeded(levelNumber, salt + attempts * 7) * COLUMNS);
    const row = Math.floor(seeded(levelNumber, salt + attempts * 13) * ROWS);
    const key = `${col}:${row}`;
    if (occupied.has(key)) continue;
    occupied.add(key);
    cells.push({ col, row });
  }

  return cells;
}

function buildSpecialTileMap(nextId: MutableRefObject<number>, level: LevelDefinition, boxSet: Set<string>) {
  const specialTiles = new Map<string, BlockTile>();
  if (level.mode !== "normal") {
    return specialTiles;
  }

  const occupied = new Set<string>(boxSet);
  const depth = Math.max(0, level.id - 1);
  const iceCount = level.id >= 1 ? Math.min(4, 1 + Math.floor(depth / 55)) : 0;
  const honeyCount = level.id >= 4 ? Math.min(3, 1 + Math.floor(depth / 75)) : 0;
  const safeCount = level.id >= 8 ? Math.min(2, 1 + Math.floor(depth / 120)) : 0;
  const cloudCount = level.id >= 12 ? Math.min(2, 1 + Math.floor(depth / 150)) : 0;

  pickObstacleCells(level.id, 101, iceCount, occupied).forEach((cell) => {
    specialTiles.set(`${cell.col}:${cell.row}`, createIceTile(nextId, cell.col, cell.row));
  });
  pickObstacleCells(level.id, 211, honeyCount, occupied).forEach((cell) => {
    specialTiles.set(`${cell.col}:${cell.row}`, createHoneyTile(nextId, cell.col, cell.row));
  });
  pickObstacleCells(level.id, 307, safeCount, occupied).forEach((cell, index) => {
    specialTiles.set(`${cell.col}:${cell.row}`, createSafeTile(nextId, cell.col, cell.row, level.id, index));
  });
  pickObstacleCells(level.id, 401, cloudCount, occupied).forEach((cell) => {
    specialTiles.set(`${cell.col}:${cell.row}`, createCloudTile(nextId, cell.col, cell.row));
  });

  return specialTiles;
}

function isAdjacentToHoney(grid: Grid, col: number, row: number) {
  return ORTHOGONAL.some((dir) => {
    const nc = col + dir.col;
    const nr = row + dir.row;
    return inBounds(nc, nr) && grid[nc][nr]?.kind === "honey";
  });
}

export function buildGrid(blocks: BlockTile[]): Grid {
  const grid: Grid = Array.from({ length: COLUMNS }, () => Array.from({ length: ROWS }, () => null));

  for (const block of blocks) {
    if (inBounds(block.col, block.row)) {
      grid[block.col][block.row] = block;
    }
  }

  return grid;
}

export function findConnectedColorGroup(start: RegularTile, grid: Grid): RegularTile[] {
  if (isAdjacentToHoney(grid, start.col, start.row)) {
    return [start];
  }

  const visited = Array.from({ length: COLUMNS }, () => Array.from({ length: ROWS }, () => false));
  const queue: Cell[] = [{ col: start.col, row: start.row }];
  const result: RegularTile[] = [];
  visited[start.col][start.row] = true;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const tile = grid[current.col][current.row];
    if (!tile || tile.kind !== "regular" || tile.color !== start.color) {
      continue;
    }

    result.push(tile);

    for (const dir of ORTHOGONAL) {
      const nc = current.col + dir.col;
      const nr = current.row + dir.row;
      if (!inBounds(nc, nr) || visited[nc][nr]) {
        continue;
      }

      const neighbor = grid[nc][nr];
      if (neighbor?.kind === "regular" && neighbor.color === start.color && isAdjacentToHoney(grid, nc, nr)) {
        visited[nc][nr] = true;
        continue;
      }

      visited[nc][nr] = true;
      queue.push({ col: nc, row: nr });
    }
  }

  return result;
}

// Find connected reward tiles (for Bonus levels)
export function findConnectedRewardGroup(start: RewardTile, grid: Grid): RewardTile[] {
  const visited = Array.from({ length: COLUMNS }, () => Array.from({ length: ROWS }, () => false));
  const queue: Cell[] = [{ col: start.col, row: start.row }];
  const result: RewardTile[] = [];
  visited[start.col][start.row] = true;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const tile = grid[current.col][current.row];
    if (!tile || tile.kind !== "reward") {
      continue;
    }

    result.push(tile);

    for (const dir of ORTHOGONAL) {
      const nc = current.col + dir.col;
      const nr = current.row + dir.row;
      if (!inBounds(nc, nr) || visited[nc][nr]) {
        continue;
      }

      visited[nc][nr] = true;
      queue.push({ col: nc, row: nr });
    }
  }

  return result;
}

function createRegularTile(nextId: MutableRefObject<number>, col: number, row: number, spawnRow: number): RegularTile {
  return {
    id: `b_${nextId.current++}`,
    kind: "regular",
    col,
    row,
    spawnRow,
    color: randomColor(),
  };
}

function createBoosterTile(nextId: MutableRefObject<number>, col: number, row: number, booster: BoosterKind): BoosterTile {
  return {
    id: `b_${nextId.current++}`,
    kind: "booster",
    col,
    row,
    spawnRow: row,
    booster,
    rocketAxis: booster === "rocket" ? (Math.random() < 0.5 ? "row" : "col") : undefined,
  };
}

// Create a reward tile for bonus levels
function createRewardTile(
  nextId: MutableRefObject<number>,
  col: number,
  row: number,
  spawnRow: number
): RewardTile {
  // Determine reward type based on weighted random
  const weights = BONUS_LEVEL_CONFIG.rewardWeights;
  const totalWeight = weights.coin + weights.life + weights.rocket_reward + weights.hammer_reward;
  const roll = Math.random() * totalWeight;
  
  let reward: RewardKind;
  let value: number;
  
  if (roll < weights.coin) {
    reward = "coin";
    const coinConfig = BONUS_LEVEL_CONFIG.rewardValues.coin;
    value = Math.floor(Math.random() * (coinConfig.max - coinConfig.min + 1)) + coinConfig.min;
  } else if (roll < weights.coin + weights.life) {
    reward = "life";
    value = BONUS_LEVEL_CONFIG.rewardValues.life.value;
  } else if (roll < weights.coin + weights.life + weights.rocket_reward) {
    reward = "rocket_reward";
    value = BONUS_LEVEL_CONFIG.rewardValues.rocket_reward.value;
  } else {
    reward = "hammer_reward";
    value = BONUS_LEVEL_CONFIG.rewardValues.hammer_reward.value;
  }
  
  return {
    id: `b_${nextId.current++}`,
    kind: "reward",
    col,
    row,
    spawnRow,
    reward,
    value,
  };
}

export function createInitialTiles(nextId: MutableRefObject<number>, level: LevelDefinition): BlockTile[] {
  const boxSet = new Set((level.boxPositions ?? []).map((cell) => `${cell.col}:${cell.row}`));
  const specialTiles = buildSpecialTileMap(nextId, level, boxSet);
  const tiles: BlockTile[] = [];
  const isBonusLevel = level.mode === "bonus";
  const rewardSpawnRate = level.rewardSpawnRate ?? BONUS_LEVEL_CONFIG.rewardSpawnRate;

  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const key = `${col}:${row}`;
      const specialTile = specialTiles.get(key);
      if (specialTile) {
        tiles.push(specialTile);
        continue;
      }

      if (boxSet.has(key)) {
        tiles.push({
          id: `b_${nextId.current++}`,
          kind: "box",
          col,
          row,
          spawnRow: row,
          hitsRemaining: 1,
          maxHits: 1,
        });
        continue;
      }

      // For bonus levels, mix in reward tiles
      if (isBonusLevel && Math.random() < rewardSpawnRate) {
        tiles.push(createRewardTile(nextId, col, row, row + 2));
      } else {
        tiles.push(createRegularTile(nextId, col, row, row + 2));
      }
    }
  }

  return tiles;
}

// Game mode context for settle/refill
let currentGameMode: "normal" | "bonus" = "normal";
let currentRewardSpawnRate = 0.1;

export function setGameMode(mode: "normal" | "bonus", rewardRate = 0.1) {
  currentGameMode = mode;
  currentRewardSpawnRate = rewardRate;
}

function advanceMovingClouds(tiles: BlockTile[]) {
  const grid = buildGrid(tiles.map((tile) => ({ ...tile })));
  const clouds = tiles.filter((tile): tile is CloudTile => tile.kind === "cloud");

  for (const cloud of clouds) {
    const current = grid[cloud.col][cloud.row];
    if (!current || current.kind !== "cloud") continue;

    const options = ORTHOGONAL
      .map((dir) => ({ col: cloud.col + dir.col, row: cloud.row + dir.row }))
      .filter((cell) => inBounds(cell.col, cell.row))
      .filter((cell) => {
        const neighbor = grid[cell.col][cell.row];
        return neighbor === null || (neighbor !== null && !isStaticObstacle(neighbor));
      });

    if (options.length === 0) continue;

    const chosen = options[Math.floor(Math.random() * options.length)];
    const target = grid[chosen.col][chosen.row];

    if (target) {
      grid[cloud.col][cloud.row] = { ...target, col: cloud.col, row: cloud.row, spawnRow: target.row };
    } else {
      grid[cloud.col][cloud.row] = null;
    }

    grid[chosen.col][chosen.row] = { ...current, col: chosen.col, row: chosen.row, spawnRow: current.row };
  }

  const nextTiles: BlockTile[] = [];
  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const tile = grid[col][row];
      if (tile) nextTiles.push(tile);
    }
  }
  return nextTiles;
}

function settleAndRefill(tiles: BlockTile[], nextId: MutableRefObject<number>): BlockTile[] {
  const grid = buildGrid(tiles);
  const nextTiles: BlockTile[] = [];

  for (let col = 0; col < COLUMNS; col++) {
    const obstacleRows: number[] = [];
    for (let row = 0; row < ROWS; row++) {
      const tile = grid[col][row];
      if (tile && isStaticObstacle(tile)) {
        obstacleRows.push(row);
        nextTiles.push({ ...tile, spawnRow: tile.row });
      }
    }

    const segmentBreaks = [-1, ...obstacleRows, ROWS];
    for (let i = 0; i < segmentBreaks.length - 1; i++) {
      const segmentStart = segmentBreaks[i] + 1;
      const segmentEnd = segmentBreaks[i + 1] - 1;
      if (segmentStart > segmentEnd) continue;

      const movable: BlockTile[] = [];
      for (let row = segmentStart; row <= segmentEnd; row++) {
        const tile = grid[col][row];
        if (tile && isMovableTile(tile)) {
          movable.push(tile);
        }
      }

      movable.sort((a, b) => a.row - b.row);

      for (let offset = 0; offset < movable.length; offset++) {
        const tile = movable[offset];
        const targetRow = segmentStart + offset;
        nextTiles.push({ ...tile, row: targetRow, spawnRow: tile.row });
      }

      const missing = segmentEnd - segmentStart + 1 - movable.length;
      for (let m = 0; m < missing; m++) {
        const targetRow = segmentStart + movable.length + m;
        // In bonus mode, spawn mix of regular and reward tiles
        if (currentGameMode === "bonus" && Math.random() < currentRewardSpawnRate) {
          nextTiles.push(createRewardTile(nextId, col, targetRow, segmentEnd + 1 + m));
        } else {
          nextTiles.push(createRegularTile(nextId, col, targetRow, segmentEnd + 1 + m));
        }
      }
    }
  }

  return advanceMovingClouds(nextTiles);
}

function totalDestroyed(summary: DestroyedSummary) {
  return summary.specials + summary.boxes + summary.colors.red + summary.colors.blue + summary.colors.green + summary.colors.yellow + summary.colors.purple;
}

function removeTile(
  grid: Grid,
  tile: BlockTile,
  summary: DestroyedSummary,
  destroyedRegulars: DestroyedRegular[],
  destroyedBoxes: DestroyedBox[],
) {
  if (tile.kind === "regular") {
    summary.colors[tile.color] += 1;
    destroyedRegulars.push({ col: tile.col, row: tile.row, color: tile.color });
  }
  if (tile.kind === "box") {
    summary.boxes += 1;
    destroyedBoxes.push({ col: tile.col, row: tile.row });
  }
  if (tile.kind === "honey" || tile.kind === "ice" || tile.kind === "safe" || tile.kind === "cloud") {
    summary.specials += 1;
  }
  grid[tile.col][tile.row] = null;
}

function hitTile(
  grid: Grid,
  tile: BlockTile,
  summary: DestroyedSummary,
  destroyedRegulars: DestroyedRegular[],
  destroyedBoxes: DestroyedBox[],
) {
  if (tile.kind === "safe") {
    return;
  }

  if (tile.kind === "box" || tile.kind === "ice") {
    if (tile.hitsRemaining <= 1) {
      removeTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
    } else {
      grid[tile.col][tile.row] = { ...tile, hitsRemaining: tile.hitsRemaining - 1 };
    }
    return;
  }

  removeTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
}

function isRocketBombPair(a: BoosterTile, b: BoosterTile) {
  return (a.booster === "rocket" && b.booster === "bomb") || (a.booster === "bomb" && b.booster === "rocket");
}

function clearRocketBombCombo(
  grid: Grid,
  summary: DestroyedSummary,
  center: BoosterTile,
  activatedBoosters: Set<string>,
  meta: BoosterMeta,
  destroyedRegulars: DestroyedRegular[],
  destroyedBoxes: DestroyedBox[],
) {
  if (activatedBoosters.has(center.id)) return;
  activatedBoosters.add(center.id);
  grid[center.col][center.row] = null;

  meta.heavyImpact = true;
  meta.rocketBombCombo = true;
  meta.comboCenter = { col: center.col, row: center.row };

  const targets = new Set<string>();
  for (let row = Math.max(0, center.row - 1); row <= Math.min(ROWS - 1, center.row + 1); row++) {
    for (let col = 0; col < COLUMNS; col++) {
      targets.add(`${col}:${row}`);
    }
  }
  for (let col = Math.max(0, center.col - 1); col <= Math.min(COLUMNS - 1, center.col + 1); col++) {
    for (let row = 0; row < ROWS; row++) {
      targets.add(`${col}:${row}`);
    }
  }

  for (const key of targets) {
    const [colRaw, rowRaw] = key.split(":");
    const col = Number.parseInt(colRaw, 10);
    const row = Number.parseInt(rowRaw, 10);
    const tile = grid[col][row];
    if (!tile) continue;

    if (tile.kind === "booster") {
      meta.chainedBoosters += 1;
      clearByBooster(grid, summary, tile, activatedBoosters, meta, destroyedRegulars, destroyedBoxes);
      continue;
    }

    hitTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
  }
}

function clearByBooster(
  grid: Grid,
  summary: DestroyedSummary,
  booster: BoosterTile,
  activatedBoosters: Set<string>,
  meta: BoosterMeta,
  destroyedRegulars: DestroyedRegular[],
  destroyedBoxes: DestroyedBox[],
  forcedDiscoColor?: BlockColor,
): void {
  if (activatedBoosters.has(booster.id)) {
    return;
  }

  if (booster.booster === "bomb" || booster.booster === "disco") {
    meta.heavyImpact = true;
  }

  activatedBoosters.add(booster.id);
  grid[booster.col][booster.row] = null;

  const targets: Cell[] = [];
  if (booster.booster === "rocket") {
    if (booster.rocketAxis === "row") {
      for (let col = 0; col < COLUMNS; col++) targets.push({ col, row: booster.row });
    } else {
      for (let row = 0; row < ROWS; row++) targets.push({ col: booster.col, row });
    }
  }

  if (booster.booster === "bomb") {
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const nc = booster.col + dc;
        const nr = booster.row + dr;
        if (inBounds(nc, nr)) targets.push({ col: nc, row: nr });
      }
    }
  }

  if (booster.booster === "disco") {
    const selectedTargets = forcedDiscoColor
      ? {
          color: forcedDiscoColor,
          targets: (() => {
            const cells: Cell[] = [];
            for (let col = 0; col < COLUMNS; col++) {
              for (let row = 0; row < ROWS; row++) {
                const tile = grid[col][row];
                if (tile?.kind === "regular" && tile.color === forcedDiscoColor) {
                  cells.push({ col, row });
                }
              }
            }
            return cells;
          })(),
        }
      : pickDiscoTargets(grid);

    if (selectedTargets) {
      targets.push(...selectedTargets.targets);
    }
  }

  for (const cell of targets) {
    const tile = grid[cell.col][cell.row];
    if (!tile) continue;

    if (tile.kind === "booster") {
      meta.chainedBoosters += 1;
      if (isRocketBombPair(booster, tile)) {
        clearRocketBombCombo(grid, summary, tile, activatedBoosters, meta, destroyedRegulars, destroyedBoxes);
        continue;
      }

      clearByBooster(grid, summary, tile, activatedBoosters, meta, destroyedRegulars, destroyedBoxes);
      continue;
    }

    hitTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
  }
}

function spawnBoosterForGroupSize(size: number): BoosterKind | null {
  if (size >= 9) return "disco";
  if (size >= 7) return "bomb";
  if (size >= 5) return "rocket";
  return null;
}

function resolveAdjacentObstacleEffects(
  grid: Grid,
  cells: Cell[],
  blastedColors: Set<BlockColor>,
  summary: DestroyedSummary,
  destroyedRegulars: DestroyedRegular[],
  destroyedBoxes: DestroyedBox[],
  rewardBundle: RewardBundle,
) {
  const visited = new Set<string>();

  for (const cell of cells) {
    for (const dir of ORTHOGONAL) {
      const nc = cell.col + dir.col;
      const nr = cell.row + dir.row;
      if (!inBounds(nc, nr)) continue;

      const key = `${nc}:${nr}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const tile = grid[nc][nr];
      if (!tile) continue;

      if (tile.kind === "box" || tile.kind === "ice") {
        hitTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
        continue;
      }

      if (tile.kind === "honey" || tile.kind === "cloud") {
        removeTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
        continue;
      }

      if (tile.kind === "safe" && blastedColors.has(tile.color)) {
        mergeRewardBundle(rewardBundle, tile.reward);
        removeTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
      }
    }
  }
}

function resolveManualClear(
  tiles: BlockTile[],
  nextId: MutableRefObject<number>,
  clearCells: Cell[],
  options?: { alsoHitAdjacentBoxes?: boolean; impact?: "none" | "normal" | "heavy" },
): TapResolution {
  const grid = buildGrid(tiles);
  const summary = createDestroyedSummary();
  const destroyedRegulars: DestroyedRegular[] = [];
  const destroyedBoxes: DestroyedBox[] = [];
  const rewardBundle = cloneRewardBundle(EMPTY_REWARD);

  for (const cell of clearCells) {
    if (!inBounds(cell.col, cell.row)) continue;
    const tile = grid[cell.col][cell.row];
    if (!tile) continue;
    hitTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
  }

  if (options?.alsoHitAdjacentBoxes) {
    resolveAdjacentObstacleEffects(
      grid,
      clearCells,
      new Set(destroyedRegulars.map((tile) => tile.color)),
      summary,
      destroyedRegulars,
      destroyedBoxes,
      rewardBundle,
    );
  }

  const destroyedCount = totalDestroyed(summary);
  if (destroyedCount <= 0) {
    return {
      didConsumeMove: false,
      didResolveBlast: false,
      blastSize: 0,
      tiles,
      destroyed: summary,
      destroyedRegulars,
      destroyedBoxes,
      impact: "none",
      megaCombo: false,
      comboKind: "none",
      comboCenter: undefined,
      rewardBundle: hasReward(rewardBundle) ? rewardBundle : undefined,
    };
  }

  const settled = settleAndRefill(grid.flat().filter((tile): tile is BlockTile => tile !== null), nextId);
  return {
    didConsumeMove: false,
    didResolveBlast: true,
    blastSize: destroyedCount,
    tiles: settled,
    destroyed: summary,
    destroyedRegulars,
    destroyedBoxes,
    impact: options?.impact ?? "normal",
    megaCombo: false,
    comboKind: "none",
    comboCenter: undefined,
    rewardBundle: hasReward(rewardBundle) ? rewardBundle : undefined,
  };
}

export function useHammerBooster(tiles: BlockTile[], target: BlockTile, nextId: MutableRefObject<number>): TapResolution {
  return resolveManualClear(tiles, nextId, [{ col: target.col, row: target.row }], { impact: "normal" });
}

export function useGloveBooster(tiles: BlockTile[], row: number, nextId: MutableRefObject<number>): TapResolution {
  const clearCells: Cell[] = [];
  for (let col = 0; col < COLUMNS; col++) {
    clearCells.push({ col, row });
  }
  return resolveManualClear(tiles, nextId, clearCells, { impact: "normal" });
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function shuffleRegularTiles(tiles: BlockTile[]): BlockTile[] {
  const regularTiles = tiles.filter((tile): tile is RegularTile => tile.kind === "regular");
  const regularCells = regularTiles.map((tile) => ({ col: tile.col, row: tile.row }));
  const shuffledCells = shuffleArray(regularCells);

  const assigned = new Set<string>();
  const shuffledRegulars = regularTiles.map((tile, index) => {
    const cell = shuffledCells[index] ?? { col: tile.col, row: tile.row };
    assigned.add(tile.id);
    return {
      ...tile,
      col: cell.col,
      row: cell.row,
      spawnRow: tile.row,
    };
  });

  const staticTiles = tiles.filter((tile) => !assigned.has(tile.id));
  return [...staticTiles, ...shuffledRegulars];
}

export function resolveTap(
  tiles: BlockTile[],
  tappedTile: BlockTile,
  nextId: MutableRefObject<number>,
): TapResolution {
  const grid = buildGrid(tiles);
  const summary = createDestroyedSummary();
  const destroyedRegulars: DestroyedRegular[] = [];
  const destroyedBoxes: DestroyedBox[] = [];
  const rewardBundle = cloneRewardBundle(EMPTY_REWARD);

  if (
    tappedTile.kind === "box" ||
    tappedTile.kind === "honey" ||
    tappedTile.kind === "ice" ||
    tappedTile.kind === "safe" ||
    tappedTile.kind === "cloud"
  ) {
    return {
      didConsumeMove: false,
      didResolveBlast: false,
      blastSize: 0,
      tiles,
      destroyed: summary,
      destroyedRegulars,
      destroyedBoxes,
      impact: "none",
      megaCombo: false,
      comboKind: "none",
      comboCenter: undefined,
      rewardBundle: undefined,
    };
  }

  if (tappedTile.kind === "booster") {
    const boosterMeta: BoosterMeta = { chainedBoosters: 0, heavyImpact: false, rocketBombCombo: false, comboCenter: undefined };
    // Capture rocket origin before clearing
    const isRocket = tappedTile.booster === "rocket";
    const isDisco = tappedTile.booster === "disco";
    const rocketOrigin = isRocket
      ? { col: tappedTile.col, row: tappedTile.row, axis: tappedTile.rocketAxis ?? "row" }
      : undefined;
    const discoTargets = isDisco ? pickDiscoTargets(grid) : null;

    clearByBooster(
      grid,
      summary,
      tappedTile,
      new Set(),
      boosterMeta,
      destroyedRegulars,
      destroyedBoxes,
      discoTargets?.color,
    );
    resolveAdjacentObstacleEffects(
      grid,
      [{ col: tappedTile.col, row: tappedTile.row }, ...destroyedRegulars.map((tile) => ({ col: tile.col, row: tile.row }))],
      new Set(destroyedRegulars.map((tile) => tile.color)),
      summary,
      destroyedRegulars,
      destroyedBoxes,
      rewardBundle,
    );
    const settled = settleAndRefill(grid.flat().filter((tile): tile is BlockTile => tile !== null), nextId);
    return {
      didConsumeMove: true,
      didResolveBlast: true,
      blastSize: Math.max(2, totalDestroyed(summary)),
      tiles: settled,
      destroyed: summary,
      destroyedRegulars,
      destroyedBoxes,
      impact: boosterMeta.heavyImpact ? "heavy" : "normal",
      megaCombo: boosterMeta.chainedBoosters > 0,
      comboKind: boosterMeta.rocketBombCombo ? "rocket_bomb" : "none",
      comboCenter: boosterMeta.comboCenter,
      rocketOrigin,
      discoCinematic:
        isDisco && discoTargets
          ? {
              origin: { col: tappedTile.col, row: tappedTile.row },
              targetColor: discoTargets.color,
              targets: discoTargets.targets,
            }
          : undefined,
      rewardBundle: hasReward(rewardBundle) ? rewardBundle : undefined,
    };
  }

  // Handle reward tiles (Bonus Level)
  if (tappedTile.kind === "reward") {
    // Bonus rewards are collected instantly on tap to keep tempo high.
    const collectedRewards: RewardTile[] = [tappedTile];
    grid[tappedTile.col][tappedTile.row] = null;
    
    const settled = settleAndRefill(grid.flat().filter((tile): tile is BlockTile => tile !== null), nextId);
    return {
      didConsumeMove: false, // Bonus levels don't use moves
      didResolveBlast: true,
      blastSize: 1,
      tiles: settled,
      destroyed: summary,
      destroyedRegulars,
      destroyedBoxes,
      impact: "normal",
      megaCombo: false,
      comboKind: "none",
      comboCenter: undefined,
      collectedRewards,
    };
  }

  const group = findConnectedColorGroup(tappedTile, grid);
  if (group.length < 2) {
    return {
      didConsumeMove: false,
      didResolveBlast: false,
      blastSize: 0,
      tiles,
      destroyed: summary,
      destroyedRegulars,
      destroyedBoxes,
      impact: "none",
      megaCombo: false,
      comboKind: "none",
      comboCenter: undefined,
      rewardBundle: undefined,
    };
  }

  const tappedCol = tappedTile.col;
  const tappedRow = tappedTile.row;
  const blastedCells: Cell[] = [];
  for (const tile of group) {
    blastedCells.push({ col: tile.col, row: tile.row });
    removeTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
  }

  resolveAdjacentObstacleEffects(
    grid,
    blastedCells,
    new Set(group.map((tile) => tile.color)),
    summary,
    destroyedRegulars,
    destroyedBoxes,
    rewardBundle,
  );

  const booster = spawnBoosterForGroupSize(group.length);
  if (booster && grid[tappedCol][tappedRow] === null) {
    grid[tappedCol][tappedRow] = createBoosterTile(nextId, tappedCol, tappedRow, booster);
  }

  const settled = settleAndRefill(grid.flat().filter((tile): tile is BlockTile => tile !== null), nextId);
  return {
    didConsumeMove: true,
    didResolveBlast: true,
    blastSize: totalDestroyed(summary),
    tiles: settled,
    destroyed: summary,
    destroyedRegulars,
    destroyedBoxes,
    impact: "none",
    megaCombo: false,
    comboKind: "none",
    comboCenter: undefined,
    rewardBundle: hasReward(rewardBundle) ? rewardBundle : undefined,
  };
}

export function getAdjacentBooster(tiles: BlockTile[], col: number, row: number): BoosterTile | null {
  const grid = buildGrid(tiles);
  const cell = grid[col][row];
  if (!cell || cell.kind !== "booster") return null;

  const neighbors: BoosterTile[] = [];
  for (const dir of ORTHOGONAL) {
    const nc = col + dir.col;
    const nr = row + dir.row;
    if (inBounds(nc, nr)) {
      const nCell = grid[nc][nr];
      if (nCell?.kind === "booster") {
        neighbors.push(nCell);
      }
    }
  }

  if (neighbors.length === 0) return null;

  // Prioritize Disco > Bomb > Rocket
  const weight = (b: BoosterKind) => (b === "disco" ? 3 : b === "bomb" ? 2 : 1);
  neighbors.sort((a, b) => weight(b.booster) - weight(a.booster));
  return neighbors[0];
}

export function resolveCombo(
  tiles: BlockTile[],
  tappedBooster: BoosterTile,
  adjacentBooster: BoosterTile,
  nextId: MutableRefObject<number>
): TapResolution {
  const grid = buildGrid(tiles);
  const summary = createDestroyedSummary();
  const destroyedRegulars: DestroyedRegular[] = [];
  const destroyedBoxes: DestroyedBox[] = [];
  const rewardBundle = cloneRewardBundle(EMPTY_REWARD);

  const types = [tappedBooster.booster, adjacentBooster.booster].sort();
  const comboName = types.join("_");

  // Remove the two boosters immediately
  grid[tappedBooster.col][tappedBooster.row] = null;
  grid[adjacentBooster.col][adjacentBooster.row] = null;

  const targets = new Set<string>();
  let impact: TapResolution["impact"] = "mega";
  let finalComboKind: TapResolution["comboKind"] = "none";

  const addCell = (c: number, r: number) => {
    if (inBounds(c, r)) targets.add(`${c}:${r}`);
  };

  const addRow = (r: number) => {
    for (let c = 0; c < COLUMNS; c++) addCell(c, r);
  };

  const addCol = (c: number) => {
    for (let r = 0; r < ROWS; r++) addCell(c, r);
  };

  const addArea = (c: number, r: number, radius: number) => {
    for (let ic = c - radius; ic <= c + radius; ic++) {
      for (let ir = r - radius; ir <= r + radius; ir++) {
        addCell(ic, ir);
      }
    }
  };

  const tc = tappedBooster.col;
  const tr = tappedBooster.row;

  if (comboName === "rocket_rocket") {
    addRow(tr);
    addCol(tc);
    impact = "heavy";
    finalComboKind = "rocket_rocket";
  } else if (comboName === "bomb_rocket") {
    for (let r = tr - 1; r <= tr + 1; r++) addRow(r);
    for (let c = tc - 1; c <= tc + 1; c++) addCol(c);
    impact = "mega";
    finalComboKind = "rocket_bomb";
  } else if (comboName === "bomb_bomb") {
    addArea(tc, tr, 2);
    impact = "mega";
    finalComboKind = "bomb_bomb";
  } else if (comboName === "disco_rocket" || comboName === "bomb_disco") {
    // Note: sorted order makes it bomb_disco or disco_rocket
    const isRocket = comboName === "disco_rocket";
    
    // Find most abundant color
    const counts: Record<string, number> = {};
    for (let c = 0; c < COLUMNS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const cell = grid[c][r];
        if (cell?.kind === "regular") {
          counts[cell.color] = (counts[cell.color] || 0) + 1;
        }
      }
    }

    let bestColor = "";
    let maxCount = -1;
    for (const [color, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestColor = color;
      }
    }

    for (let c = 0; c < COLUMNS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const cell = grid[c][r];
        if (cell?.kind === "regular" && cell.color === bestColor) {
          targets.add(`${c}:${r}`);
          if (isRocket) {
            Math.random() > 0.5 ? addRow(r) : addCol(c);
          } else {
            addArea(c, r, 1);
          }
        }
      }
    }
    impact = "mega";
    finalComboKind = isRocket ? "disco_rocket" : "disco_bomb";
  } else if (comboName === "disco_disco") {
    for (let c = 0; c < COLUMNS; c++) {
      for (let r = 0; r < ROWS; r++) {
        targets.add(`${c}:${r}`);
      }
    }
    impact = "grand_slam";
    finalComboKind = "disco_disco";
  }

  // Execute destruction
  for (const key of targets) {
    const [c, r] = key.split(":").map(Number);
    const tile = grid[c][r];
    if (!tile) continue;

    if (comboName === "disco_disco" && tile.kind === "box") {
       // Insta-destroy boxes for Grand Slam
       tile.hitsRemaining = 1;
    }

    // Treat hitting boosters as immediate removal for simplicity in combo
    if (tile.kind === "booster") {
       grid[c][r] = null;
    } else {
       hitTile(grid, tile, summary, destroyedRegulars, destroyedBoxes);
    }
  }

  resolveAdjacentObstacleEffects(
    grid,
    [
      { col: tappedBooster.col, row: tappedBooster.row },
      { col: adjacentBooster.col, row: adjacentBooster.row },
      ...destroyedRegulars.map((tile) => ({ col: tile.col, row: tile.row })),
    ],
    new Set(destroyedRegulars.map((tile) => tile.color)),
    summary,
    destroyedRegulars,
    destroyedBoxes,
    rewardBundle,
  );

  const settled = settleAndRefill(grid.flat().filter((tile): tile is BlockTile => tile !== null), nextId);

  return {
    didConsumeMove: true, // Only 1 move for combo
    didResolveBlast: true,
    blastSize: totalDestroyed(summary) + 2, // +2 for the boosters themselves
    tiles: settled,
    destroyed: summary,
    destroyedRegulars,
    destroyedBoxes,
    impact,
    megaCombo: true,
    comboKind: finalComboKind,
    comboCenter: { col: tc, row: tr },
    rewardBundle: hasReward(rewardBundle) ? rewardBundle : undefined,
  };
}
```

## Game Logic: Haptics

**Source File:** `src/game/haptics.ts`

```ts
/**
 * Robust Haptic Feedback Manager
 * Supports navigator.vibrate with graceful fallbacks for iOS/unsupported browsers
 */

export type HapticPattern = 
  | "light"      // Normal block taps (10ms)
  | "medium"     // Booster spawns, small combos (30-50ms pattern)
  | "heavy"      // Bomb/Disco explosions (50-100ms pattern)
  | "grand_slam" // Double Disco, massive combos
  | "success"    // Level win celebration
  | "error";     // Invalid action feedback

// Vibration patterns in milliseconds
// Single number = single vibration duration
// Array = [vibrate, pause, vibrate, pause, ...] pattern
const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: [30, 50, 30],
  heavy: [50, 100, 50],
  grand_slam: [100, 50, 100, 50, 200],
  success: [50, 30, 100, 30, 150],
  error: [20, 40, 20],
};

// Check if vibration API is supported
function isVibrationSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.vibrate !== "function") return false;
  
  // iOS Safari doesn't support vibration API
  // Check for iOS specifically
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) return false;
  
  return true;
}

// Cache the support check result
let vibrationSupportedCache: boolean | null = null;

function checkVibrationSupport(): boolean {
  if (vibrationSupportedCache === null) {
    vibrationSupportedCache = isVibrationSupported();
  }
  return vibrationSupportedCache;
}

/**
 * Trigger haptic feedback with the specified pattern
 * @param pattern - The vibration pattern to use
 * @param enabled - Whether haptics are enabled in settings
 */
export function triggerHaptic(pattern: HapticPattern, enabled: boolean): void {
  if (!enabled) return;
  if (!checkVibrationSupport()) return;
  
  try {
    const vibrationPattern = PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail - vibration is non-critical
    // Could happen due to permissions or browser restrictions
    console.debug("[Haptics] Vibration failed:", error);
  }
}

/**
 * Cancel any ongoing vibration
 */
export function cancelHaptic(): void {
  if (!checkVibrationSupport()) return;
  
  try {
    navigator.vibrate(0);
  } catch {
    // Silently ignore
  }
}

/**
 * Test if haptics are available on this device
 * Returns true if the device supports vibration
 */
export function isHapticsAvailable(): boolean {
  return checkVibrationSupport();
}

/**
 * Trigger a custom vibration pattern
 * @param pattern - Array of [vibrate, pause, vibrate, ...] in milliseconds
 * @param enabled - Whether haptics are enabled
 */
export function triggerCustomHaptic(pattern: number[], enabled: boolean): void {
  if (!enabled) return;
  if (!checkVibrationSupport()) return;
  
  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently fail
  }
}
```

## Game Layout: Responsive Modes

**Source File:** `src/game/layout.ts`

```ts
export type ResponsiveLayoutMode = "default" | "narrow" | "ultraNarrow";

export function deriveResponsiveLayoutMode(width: number, height: number): ResponsiveLayoutMode {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(1, height);
  const aspectRatio = safeWidth / safeHeight;

  if (safeWidth <= 320 || aspectRatio <= 0.46) {
    return "ultraNarrow";
  }

  if (safeWidth <= 370 || aspectRatio <= 0.54) {
    return "narrow";
  }

  return "default";
}

export function isNarrowLayout(layoutMode: ResponsiveLayoutMode) {
  return layoutMode !== "default";
}
```

## Game Data: Levels

**Source File:** `src/game/levelsData.ts`

```ts
import type { BlockColor, LevelDefinition } from "./types";

// Helper to generate box positions in various patterns
// Grid constants mirrored here to avoid circular import
const COLS = 9;
const ROWS_COUNT = 11;

function generateBoxPattern(
  pattern: "scattered" | "border" | "diagonal" | "center" | "rows",
  count: number
): Array<{ col: number; row: number }> {
  const positions: Array<{ col: number; row: number }> = [];
  const seen = new Set<string>();

  function add(col: number, row: number) {
    if (
      col < 0 || col >= COLS ||
      row < 0 || row >= ROWS_COUNT ||
      positions.length >= count
    ) return;
    const key = `${col}:${row}`;
    if (seen.has(key)) return;
    seen.add(key);
    positions.push({ col, row });
  }

  switch (pattern) {

    case "scattered":
      // Evenly spread across all 9 columns using prime step
      for (let i = 0; i < count * 3 && positions.length < count; i++) {
        const col = (i * 4) % COLS;               // step 4 across 9 cols = good spread
        const row = 1 + Math.floor(i / COLS) * 2; // every other row, skip row 0
        add(col, row);
      }
      break;

    case "border":
      // Top row first
      for (let c = 0; c < COLS && positions.length < count; c++) {
        add(c, 0);
      }
      // Bottom row second
      for (let c = 0; c < COLS && positions.length < count; c++) {
        add(c, ROWS_COUNT - 1);
      }
      // Left column third
      for (let r = 1; r < ROWS_COUNT - 1 && positions.length < count; r++) {
        add(0, r);
      }
      // Right column fourth
      for (let r = 1; r < ROWS_COUNT - 1 && positions.length < count; r++) {
        add(COLS - 1, r);
      }
      break;

    case "diagonal":
      // Main diagonal (top-left â†’ bottom-right)
      for (let i = 0; i < Math.min(COLS, ROWS_COUNT) && positions.length < count; i++) {
        add(i, i);
      }
      // Anti-diagonal if more needed
      for (let i = 0; i < Math.min(COLS, ROWS_COUNT) && positions.length < count; i++) {
        add(COLS - 1 - i, i);
      }
      break;

    case "center": {
      // Expand from center outward in rings until count is reached
      const cCenterCol = Math.floor(COLS / 2);       // col 4
      const cCenterRow = Math.floor(ROWS_COUNT / 2); // row 5
      const maxRadius = Math.max(COLS, ROWS_COUNT);
      for (let radius = 0; radius <= maxRadius && positions.length < count; radius++) {
        for (let dc = -radius; dc <= radius && positions.length < count; dc++) {
          for (let dr = -radius; dr <= radius && positions.length < count; dr++) {
            if (Math.abs(dc) === radius || Math.abs(dr) === radius) {
              add(cCenterCol + dc, cCenterRow + dr);
            }
          }
        }
      }
      break;
    }

    case "rows":
      // Fill every other row across ALL 9 columns
      for (let r = 1; r < ROWS_COUNT && positions.length < count; r += 2) {
        for (let c = 0; c < COLS && positions.length < count; c++) {
          add(c, r);
        }
      }
      break;
  }

  return positions; // already sliced by add()
}

// Color targets generator
function colorTargets(
  targets: Partial<Record<BlockColor, number>>
): { colors: Partial<Record<BlockColor, number>>; boxes: number } {
  return { colors: targets, boxes: 0 };
}

function colorAndBoxTargets(
  colors: Partial<Record<BlockColor, number>>,
  boxes: number
): { colors: Partial<Record<BlockColor, number>>; boxes: number } {
  return { colors, boxes };
}

/**
 * After building a level, sync targets.boxes to match the actual
 * number of boxPositions so the HUD objective is always accurate.
 */
function syncBoxTarget(level: LevelDefinition): LevelDefinition {
  const actual = level.boxPositions?.length ?? 0;
  if (actual === 0) return level;
  return {
    ...level,
    targets: { ...level.targets, boxes: actual },
  };
}

// Difficulty scaling helpers
function calculateStarThresholds(level: number): [number, number, number] {
  // Scores scale up with level
  const base = 200 + level * 80;
  return [base, Math.floor(base * 1.6), Math.floor(base * 2.2)];
}

// Generate all 500 map levels
export function generateLevels(): LevelDefinition[] {
  const levels: LevelDefinition[] = [];
  const colors: BlockColor[] = ["red", "blue", "green", "yellow", "purple"];

  for (let id = 1; id <= 500; id++) {
    const isBonusLevel = id % 50 === 0;
    
    if (isBonusLevel) {
      // BONUS LEVEL: Treasure Rush (every 50th level)
      levels.push({
        id,
        mode: "bonus",
        moves: 0, // Not used in bonus mode
        timeLimit: 30, // 30 seconds
        targets: { colors: {}, boxes: 0 }, // No targets in bonus
        starThresholds: calculateStarThresholds(id),
        rewardSpawnRate: 0.08, // Rare rewards so regular matching stays strategic
      });
    } else {
      // NORMAL LEVEL: Move-based with targets
      const normalizedId = id - Math.floor(id / 50); // Skip season finales in counting
      const difficulty = Math.floor(normalizedId / 20);
      const levelInSet = normalizedId % 10 || 10;
      
      let level: LevelDefinition;
      
      // Create varied level configurations
      switch (levelInSet) {
        case 1:
          // Easy intro level - single color, no boxes
          level = {
            id,
            mode: "normal",
            moves: 25 - difficulty * 2,
            targets: colorTargets({ [colors[(id - 1) % 5]]: 15 + difficulty * 5 }),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        case 2:
          // Introduce boxes
          level = {
            id,
            mode: "normal",
            moves: 22 - difficulty * 2,
            targets: colorAndBoxTargets(
              { [colors[id % 5]]: 20 + difficulty * 3 },
              5 + difficulty * 2
            ),
            boxPositions: generateBoxPattern("scattered", 5 + difficulty * 2),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        case 3:
          // Two colors
          level = {
            id,
            mode: "normal",
            moves: 20 - difficulty,
            targets: colorAndBoxTargets(
              { 
                [colors[id % 5]]: 18 + difficulty * 4, 
                [colors[(id + 1) % 5]]: 18 + difficulty * 4 
              },
              8 + difficulty * 2
            ),
            boxPositions: generateBoxPattern("rows", 8 + difficulty * 2),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        case 4:
          // Heavy boxes - center pattern
          level = {
            id,
            mode: "normal",
            moves: 18 - difficulty,
            targets: colorAndBoxTargets(
              { [colors[(id + 2) % 5]]: 25 + difficulty * 5 },
              12 + difficulty * 3
            ),
            boxPositions: generateBoxPattern("center", 12 + difficulty * 3),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        case 5:
          // Three colors challenge
          level = {
            id,
            mode: "normal",
            moves: 17 - difficulty,
            targets: colorAndBoxTargets(
              {
                [colors[id % 5]]: 15 + difficulty * 3,
                [colors[(id + 1) % 5]]: 15 + difficulty * 3,
                [colors[(id + 2) % 5]]: 15 + difficulty * 3,
              },
              6 + difficulty * 2
            ),
            boxPositions: generateBoxPattern("diagonal", 6 + difficulty * 2),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        case 6:
          // Heavy color focus
          level = {
            id,
            mode: "normal",
            moves: 16 - difficulty,
            targets: colorAndBoxTargets(
              { [colors[(id + 3) % 5]]: 35 + difficulty * 6 },
              10 + difficulty * 2
            ),
            boxPositions: generateBoxPattern("border", 10 + difficulty * 2),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        case 7:
          // Two colors, more boxes
          level = {
            id,
            mode: "normal",
            moves: 15 - difficulty,
            targets: colorAndBoxTargets(
              {
                [colors[(id + 1) % 5]]: 22 + difficulty * 4,
                [colors[(id + 4) % 5]]: 22 + difficulty * 4,
              },
              14 + difficulty * 3
            ),
            boxPositions: generateBoxPattern("scattered", 14 + difficulty * 3),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        case 8:
          // Extreme box challenge
          level = {
            id,
            mode: "normal",
            moves: 14 - difficulty,
            targets: colorAndBoxTargets(
              { [colors[id % 5]]: 20 + difficulty * 3 },
              18 + difficulty * 4
            ),
            boxPositions: generateBoxPattern("rows", 18 + difficulty * 4),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        case 9:
          // Pre-boss challenge - all mechanics
          level = {
            id,
            mode: "normal",
            moves: 12 - Math.floor(difficulty / 2),
            targets: colorAndBoxTargets(
              {
                [colors[(id + 2) % 5]]: 28 + difficulty * 5,
                [colors[(id + 3) % 5]]: 28 + difficulty * 5,
              },
              16 + difficulty * 3
            ),
            boxPositions: generateBoxPattern("center", 16 + difficulty * 3),
            starThresholds: calculateStarThresholds(id),
          };
          break;
          
        default:
          // Fallback
          level = {
            id,
            mode: "normal",
            moves: 20,
            targets: colorTargets({ red: 20 }),
            starThresholds: calculateStarThresholds(id),
          };
      }
      
      // Ensure minimum moves (never below 8)
      level.moves = Math.max(8, level.moves);

      // Clamp box positions to at most 32 (â‰ˆ33% of 99 cells)
      // Always leave enough room for colorful blocks to form matches
      const MAX_BOXES = 32;
      if (level.boxPositions && level.boxPositions.length > MAX_BOXES) {
        level.boxPositions = level.boxPositions.slice(0, MAX_BOXES);
      }

      // CRITICAL: sync targets.boxes to the ACTUAL number of spawned boxes
      // so the HUD objective counter is always accurate and winnable
      level = syncBoxTarget(level);

      levels.push(level);
    }
  }

  return levels;
}

// Export the pre-generated levels
export const LEVELS_DATA: LevelDefinition[] = generateLevels();

// Helper to get a specific level
export function getLevel(id: number): LevelDefinition | undefined {
  return LEVELS_DATA.find(l => l.id === id);
}

// Helper to check if level is a bonus level
export function isBonusLevel(id: number): boolean {
  return id % 50 === 0;
}

// Bonus level constants
export const BONUS_LEVEL_CONFIG = {
  timeLimit: 30,
  rewardSpawnRate: 0.1,
  gravitySpeedMultiplier: 1.5, // Faster gravity in bonus mode
  rewardValues: {
    coin: { min: 5, max: 25 },
    life: { value: 1 },
    rocket_reward: { value: 1 },
    hammer_reward: { value: 1 },
  },
  rewardWeights: {
    coin: 60,      // 60% chance
    life: 15,      // 15% chance
    rocket_reward: 15, // 15% chance
    hammer_reward: 10, // 10% chance
  },
};
```

## Game Logic: Meta Progression

**Source File:** `src/game/metaProgression.ts`

```ts
import type {
  ChestRarity,
  ChestReward,
  DailyWheelSegment,
  DailyWheelSegmentId,
  MetaProgress,
  MissionCard,
  MissionId,
  RewardBundle,
  SagaProgress,
} from "./types";

const LEVELS_PER_EPISODE = 20;
const EMPTY_REWARD: RewardBundle = {
  coins: 0,
  lives: 0,
  hammer: 0,
  glove: 0,
  shuffle: 0,
  unlimitedLivesMinutes: 0,
};
const DAILY_WHEEL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const EMPTY_RARITY_COUNTS: Record<ChestRarity, number> = {
  common: 0,
  rare: 0,
  epic: 0,
  platinum: 0,
  crown: 0,
};

const RARITY_LABELS: Record<ChestRarity, string> = {
  common: "Common Box",
  rare: "Rare Box",
  epic: "Epic Box",
  platinum: "Platinum Box",
  crown: "Crown Vault",
};
const CHARACTER_COUNT = 4;

export const DAILY_WHEEL_SEGMENTS: DailyWheelSegment[] = [
  {
    id: "unlimited_lives",
    label: "15m Unlimited Lives",
    accent: "#fb7185",
    glow: "rgba(251,113,133,0.24)",
    reward: { ...EMPTY_REWARD, unlimitedLivesMinutes: 15 },
  },
  {
    id: "coin_50",
    label: "50 Coins",
    accent: "#fbbf24",
    glow: "rgba(251,191,36,0.24)",
    reward: { ...EMPTY_REWARD, coins: 50 },
  },
  {
    id: "hammer_drop",
    label: "Hammer",
    accent: "#60a5fa",
    glow: "rgba(96,165,250,0.24)",
    reward: { ...EMPTY_REWARD, hammer: 1 },
  },
  {
    id: "shuffle_boost",
    label: "Rocket Shuffle",
    accent: "#c084fc",
    glow: "rgba(192,132,252,0.24)",
    reward: { ...EMPTY_REWARD, shuffle: 1 },
  },
  {
    id: "coin_120",
    label: "120 Coins",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.24)",
    reward: { ...EMPTY_REWARD, coins: 120 },
  },
  {
    id: "tool_bundle",
    label: "Hammer + Shuffle",
    accent: "#7dd3fc",
    glow: "rgba(125,211,252,0.24)",
    reward: { ...EMPTY_REWARD, hammer: 1, shuffle: 1 },
  },
  {
    id: "life_spark",
    label: "+1 Life",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.24)",
    reward: { ...EMPTY_REWARD, lives: 1 },
  },
  {
    id: "coin_mix",
    label: "90 Coins + Hammer",
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.24)",
    reward: { ...EMPTY_REWARD, coins: 90, hammer: 1 },
  },
];

function toSafeInt(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

function toDateKey(now: number) {
  const date = new Date(now);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentEpisode(sagaProgress: SagaProgress) {
  return Math.max(1, Math.ceil(Math.max(1, sagaProgress.unlockedLevel) / LEVELS_PER_EPISODE));
}

function getEpisodeMissionTarget(episode: number) {
  return Math.min(18, 9 + Math.max(0, episode - 1) * 2);
}

function getProgressionTarget(tier: number) {
  return Math.min(8, 2 + Math.max(0, tier - 1));
}

function clampRewardBundle(bundle: Partial<RewardBundle> | null | undefined): RewardBundle {
  return {
    coins: toSafeInt(bundle?.coins),
    lives: toSafeInt(bundle?.lives),
    hammer: toSafeInt(bundle?.hammer),
    glove: toSafeInt(bundle?.glove),
    shuffle: toSafeInt(bundle?.shuffle),
  };
}

function sumEpisodeStars(sagaProgress: SagaProgress, episode: number) {
  const startLevel = (episode - 1) * LEVELS_PER_EPISODE + 1;
  const endLevel = episode * LEVELS_PER_EPISODE;
  let total = 0;

  for (let level = startLevel; level <= endLevel; level += 1) {
    total += toSafeInt(sagaProgress.starsByLevel[level]);
  }

  return total;
}

function clampCharacterIndex(value: unknown, fallback = 0) {
  return Math.max(0, Math.min(CHARACTER_COUNT - 1, toSafeInt(value, fallback)));
}

function normalizeDailyWheelSegmentId(value: unknown): DailyWheelSegmentId | null {
  return DAILY_WHEEL_SEGMENTS.some((segment) => segment.id === value)
    ? (value as DailyWheelSegmentId)
    : null;
}

function normalizeChestReward(value: unknown): ChestReward | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const chest = value as Partial<ChestReward>;
  const rarity = chest.rarity;

  if (
    rarity !== "common" &&
    rarity !== "rare" &&
    rarity !== "epic" &&
    rarity !== "platinum" &&
    rarity !== "crown"
  ) {
    return null;
  }

  const reward = clampRewardBundle(chest);
  return {
    id: typeof chest.id === "string" ? chest.id : `chest_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    rarity,
    label: typeof chest.label === "string" ? chest.label : RARITY_LABELS[rarity],
    levelId: toSafeInt(chest.levelId, 1),
    starsEarned: Math.min(3, toSafeInt(chest.starsEarned)),
    score: toSafeInt(chest.score),
    createdAt: toSafeInt(chest.createdAt, Date.now()),
    ...reward,
  };
}

export function createDefaultMetaProgress(now = Date.now()): MetaProgress {
  return {
    dailyMission: {
      key: toDateKey(now),
      progress: 0,
      target: 3,
      claimed: false,
    },
    episodeMission: {
      episode: 1,
      target: getEpisodeMissionTarget(1),
      claimedEpisodes: [],
    },
    progressionMission: {
      tier: 1,
      progress: 0,
      target: getProgressionTarget(1),
      claimed: false,
    },
    dailyWheel: {
      lastSpinAt: null,
      nextSpinAt: null,
      lastSegmentId: null,
    },
    selectedCharacterIndex: 0,
    pendingChests: [],
    chestStats: {
      totalOpened: 0,
      byRarity: { ...EMPTY_RARITY_COUNTS },
      lastOpenedChest: null,
    },
  };
}

export function hydrateMetaProgress(raw: unknown, sagaProgress: SagaProgress, now = Date.now()): MetaProgress {
  const defaults = createDefaultMetaProgress(now);

  if (typeof raw !== "object" || raw === null) {
    return ensureMetaProgress(defaults, sagaProgress, now);
  }

  const meta = raw as Partial<MetaProgress>;
  const pendingChests = Array.isArray(meta.pendingChests)
    ? meta.pendingChests.map((item) => normalizeChestReward(item)).filter((item): item is ChestReward => item !== null)
    : [];

  const byRarity = meta.chestStats?.byRarity ?? EMPTY_RARITY_COUNTS;
  const hydrated: MetaProgress = {
    dailyMission: {
      key: typeof meta.dailyMission?.key === "string" ? meta.dailyMission.key : defaults.dailyMission.key,
      progress: toSafeInt(meta.dailyMission?.progress),
      target: Math.max(1, toSafeInt(meta.dailyMission?.target, defaults.dailyMission.target)),
      claimed: Boolean(meta.dailyMission?.claimed),
    },
    episodeMission: {
      episode: Math.max(1, toSafeInt(meta.episodeMission?.episode, 1)),
      target: Math.max(1, toSafeInt(meta.episodeMission?.target, defaults.episodeMission.target)),
      claimedEpisodes: Array.isArray(meta.episodeMission?.claimedEpisodes)
        ? meta.episodeMission.claimedEpisodes
            .map((episode) => toSafeInt(episode))
            .filter((episode) => episode > 0)
        : [],
    },
    progressionMission: {
      tier: Math.max(1, toSafeInt(meta.progressionMission?.tier, 1)),
      progress: toSafeInt(meta.progressionMission?.progress),
      target: Math.max(1, toSafeInt(meta.progressionMission?.target, defaults.progressionMission.target)),
      claimed: Boolean(meta.progressionMission?.claimed),
    },
    dailyWheel: {
      lastSpinAt: typeof meta.dailyWheel?.lastSpinAt === "number" ? meta.dailyWheel.lastSpinAt : null,
      nextSpinAt: typeof meta.dailyWheel?.nextSpinAt === "number" ? meta.dailyWheel.nextSpinAt : null,
      lastSegmentId: normalizeDailyWheelSegmentId(meta.dailyWheel?.lastSegmentId),
    },
    selectedCharacterIndex: clampCharacterIndex(meta.selectedCharacterIndex, defaults.selectedCharacterIndex),
    pendingChests,
    chestStats: {
      totalOpened: toSafeInt(meta.chestStats?.totalOpened),
      byRarity: {
        common: toSafeInt(byRarity.common),
        rare: toSafeInt(byRarity.rare),
        epic: toSafeInt(byRarity.epic),
        platinum: toSafeInt(byRarity.platinum),
        crown: toSafeInt(byRarity.crown),
      },
      lastOpenedChest: normalizeChestReward(meta.chestStats?.lastOpenedChest ?? null),
    },
  };

  return ensureMetaProgress(hydrated, sagaProgress, now);
}

export function ensureMetaProgress(metaProgress: MetaProgress, sagaProgress: SagaProgress, now = Date.now()): MetaProgress {
  const currentEpisode = getCurrentEpisode(sagaProgress);
  const nextEpisodeTarget = getEpisodeMissionTarget(currentEpisode);
  const nextProgressionTarget = getProgressionTarget(metaProgress.progressionMission.tier);

  let changed = false;
  let nextMeta = metaProgress;

  if (metaProgress.dailyMission.key !== toDateKey(now)) {
    nextMeta = {
      ...nextMeta,
      dailyMission: {
        key: toDateKey(now),
        progress: 0,
        target: 3,
        claimed: false,
      },
    };
    changed = true;
  }

  if (
    metaProgress.episodeMission.episode !== currentEpisode ||
    metaProgress.episodeMission.target !== nextEpisodeTarget
  ) {
    nextMeta = {
      ...nextMeta,
      episodeMission: {
        ...nextMeta.episodeMission,
        episode: currentEpisode,
        target: nextEpisodeTarget,
      },
    };
    changed = true;
  }

  if (metaProgress.dailyWheel.nextSpinAt !== null && now >= metaProgress.dailyWheel.nextSpinAt) {
    nextMeta = {
      ...nextMeta,
      dailyWheel: {
        lastSpinAt: metaProgress.dailyWheel.lastSpinAt,
        nextSpinAt: null,
        lastSegmentId: metaProgress.dailyWheel.lastSegmentId,
      },
    };
    changed = true;
  }

  const nextCharacterIndex = clampCharacterIndex(metaProgress.selectedCharacterIndex);
  if (metaProgress.selectedCharacterIndex !== nextCharacterIndex) {
    nextMeta = {
      ...nextMeta,
      selectedCharacterIndex: nextCharacterIndex,
    };
    changed = true;
  }

  if (metaProgress.progressionMission.target !== nextProgressionTarget) {
    nextMeta = {
      ...nextMeta,
      progressionMission: {
        ...nextMeta.progressionMission,
        target: nextProgressionTarget,
        progress: Math.min(nextMeta.progressionMission.progress, nextProgressionTarget),
      },
    };
    changed = true;
  }

  return changed ? nextMeta : metaProgress;
}

export function getMissionReward(metaProgress: MetaProgress, missionId: MissionId): RewardBundle {
  if (missionId === "daily") {
    return {
      ...EMPTY_REWARD,
      coins: 120,
      lives: 1,
    };
  }

  if (missionId === "episode") {
    const episode = metaProgress.episodeMission.episode;
    return {
      ...EMPTY_REWARD,
      coins: 150 + episode * 20,
      hammer: 1,
      glove: episode >= 3 ? 1 : 0,
    };
  }

  const tier = metaProgress.progressionMission.tier;
  return {
    ...EMPTY_REWARD,
    coins: 110 + tier * 45,
    glove: tier >= 2 ? 1 : 0,
    shuffle: 1,
    hammer: tier >= 4 ? 1 : 0,
  };
}

export function buildMissionCards(metaProgress: MetaProgress, sagaProgress: SagaProgress): MissionCard[] {
  const episodeStars = Math.min(
    metaProgress.episodeMission.target,
    sumEpisodeStars(sagaProgress, metaProgress.episodeMission.episode),
  );

  return [
    {
      id: "daily",
      laneLabel: "Daily",
      title: `Win ${metaProgress.dailyMission.target} Levels`,
      progress: Math.min(metaProgress.dailyMission.target, metaProgress.dailyMission.progress),
      target: metaProgress.dailyMission.target,
      claimed: metaProgress.dailyMission.claimed,
      reward: getMissionReward(metaProgress, "daily"),
      accent: "#38bdf8",
    },
    {
      id: "episode",
      laneLabel: `Episode ${String(metaProgress.episodeMission.episode).padStart(2, "0")}`,
      title: `Collect ${metaProgress.episodeMission.target} Stars`,
      progress: episodeStars,
      target: metaProgress.episodeMission.target,
      claimed: metaProgress.episodeMission.claimedEpisodes.includes(metaProgress.episodeMission.episode),
      reward: getMissionReward(metaProgress, "episode"),
      accent: "#f59e0b",
    },
    {
      id: "progression",
      laneLabel: `Tier ${metaProgress.progressionMission.tier}`,
      title: `Open ${metaProgress.progressionMission.target} Boxes`,
      progress: Math.min(metaProgress.progressionMission.target, metaProgress.progressionMission.progress),
      target: metaProgress.progressionMission.target,
      claimed: metaProgress.progressionMission.claimed,
      reward: getMissionReward(metaProgress, "progression"),
      accent: "#c084fc",
    },
  ];
}

export function registerLevelWin(metaProgress: MetaProgress): MetaProgress {
  if (metaProgress.dailyMission.claimed && metaProgress.dailyMission.progress >= metaProgress.dailyMission.target) {
    return metaProgress;
  }

  const nextProgress = Math.min(metaProgress.dailyMission.target, metaProgress.dailyMission.progress + 1);
  if (nextProgress === metaProgress.dailyMission.progress) {
    return metaProgress;
  }

  return {
    ...metaProgress,
    dailyMission: {
      ...metaProgress.dailyMission,
      progress: nextProgress,
    },
  };
}

export function claimMission(
  metaProgress: MetaProgress,
  sagaProgress: SagaProgress,
  missionId: MissionId,
): { meta: MetaProgress; reward: RewardBundle | null } {
  if (missionId === "daily") {
    const canClaim =
      !metaProgress.dailyMission.claimed && metaProgress.dailyMission.progress >= metaProgress.dailyMission.target;
    if (!canClaim) {
      return { meta: metaProgress, reward: null };
    }

    return {
      meta: {
        ...metaProgress,
        dailyMission: {
          ...metaProgress.dailyMission,
          claimed: true,
        },
      },
      reward: getMissionReward(metaProgress, "daily"),
    };
  }

  if (missionId === "episode") {
    const episode = metaProgress.episodeMission.episode;
    const stars = sumEpisodeStars(sagaProgress, episode);
    const alreadyClaimed = metaProgress.episodeMission.claimedEpisodes.includes(episode);
    const canClaim = !alreadyClaimed && stars >= metaProgress.episodeMission.target;
    if (!canClaim) {
      return { meta: metaProgress, reward: null };
    }

    return {
      meta: {
        ...metaProgress,
        episodeMission: {
          ...metaProgress.episodeMission,
          claimedEpisodes: [...metaProgress.episodeMission.claimedEpisodes, episode],
        },
      },
      reward: getMissionReward(metaProgress, "episode"),
    };
  }

  const canClaim =
    !metaProgress.progressionMission.claimed &&
    metaProgress.progressionMission.progress >= metaProgress.progressionMission.target;
  if (!canClaim) {
    return { meta: metaProgress, reward: null };
  }

  const nextTier = metaProgress.progressionMission.tier + 1;
  return {
    meta: {
      ...metaProgress,
      progressionMission: {
        tier: nextTier,
        progress: 0,
        target: getProgressionTarget(nextTier),
        claimed: false,
      },
    },
    reward: getMissionReward(metaProgress, "progression"),
  };
}

export function queueTreasureChest(metaProgress: MetaProgress, chestReward: ChestReward): MetaProgress {
  return {
    ...metaProgress,
    pendingChests: [...metaProgress.pendingChests, chestReward],
  };
}

export function setSelectedCharacter(metaProgress: MetaProgress, characterIndex: number): MetaProgress {
  const nextIndex = clampCharacterIndex(characterIndex, metaProgress.selectedCharacterIndex);
  if (nextIndex === metaProgress.selectedCharacterIndex) {
    return metaProgress;
  }

  return {
    ...metaProgress,
    selectedCharacterIndex: nextIndex,
  };
}

export function canSpinDailyWheel(metaProgress: MetaProgress, now = Date.now()) {
  return metaProgress.dailyWheel.nextSpinAt === null || now >= metaProgress.dailyWheel.nextSpinAt;
}

export function spinDailyWheel(
  metaProgress: MetaProgress,
  now = Date.now(),
  randomValue = Math.random(),
): { meta: MetaProgress; segment: DailyWheelSegment | null } {
  const normalizedMeta =
    metaProgress.dailyWheel.nextSpinAt !== null && now >= metaProgress.dailyWheel.nextSpinAt
      ? {
          ...metaProgress,
          dailyWheel: {
            lastSpinAt: metaProgress.dailyWheel.lastSpinAt,
            nextSpinAt: null,
            lastSegmentId: metaProgress.dailyWheel.lastSegmentId,
          },
        }
      : metaProgress;

  if (!canSpinDailyWheel(normalizedMeta, now)) {
    return { meta: normalizedMeta, segment: null };
  }

  const segmentIndex = Math.min(
    DAILY_WHEEL_SEGMENTS.length - 1,
    Math.max(0, Math.floor(randomValue * DAILY_WHEEL_SEGMENTS.length)),
  );
  const segment = DAILY_WHEEL_SEGMENTS[segmentIndex];

  return {
    meta: {
      ...normalizedMeta,
      dailyWheel: {
        lastSpinAt: now,
        nextSpinAt: now + DAILY_WHEEL_COOLDOWN_MS,
        lastSegmentId: segment.id,
      },
    },
    segment,
  };
}

export function openTreasureChest(
  metaProgress: MetaProgress,
  chestId: string,
): { meta: MetaProgress; chest: ChestReward | null } {
  const chest = metaProgress.pendingChests.find((item) => item.id === chestId) ?? null;
  if (!chest) {
    return { meta: metaProgress, chest: null };
  }

  const nextProgress = Math.min(
    metaProgress.progressionMission.target,
    metaProgress.progressionMission.progress + 1,
  );

  return {
    meta: {
      ...metaProgress,
      pendingChests: metaProgress.pendingChests.filter((item) => item.id !== chestId),
      progressionMission: {
        ...metaProgress.progressionMission,
        progress: nextProgress,
      },
      chestStats: {
        totalOpened: metaProgress.chestStats.totalOpened + 1,
        byRarity: {
          ...metaProgress.chestStats.byRarity,
          [chest.rarity]: metaProgress.chestStats.byRarity[chest.rarity] + 1,
        },
        lastOpenedChest: chest,
      },
    },
    chest,
  };
}

function chooseWeightedRarity(levelId: number, starsEarned: number, randomValue: number): ChestRarity {
  const weights: Record<ChestRarity, number> = {
    common: 46,
    rare: 29,
    epic: 15,
    platinum: 7,
    crown: 3,
  };

  weights.common = Math.max(8, weights.common - starsEarned * 4 - Math.floor(levelId / 30));
  weights.rare += starsEarned * 2 + Math.floor(levelId / 50);
  weights.epic += starsEarned + Math.floor(levelId / 40);
  weights.platinum += (levelId % 10 === 0 ? 3 : 0) + (starsEarned === 3 ? 2 : 0) + Math.floor(levelId / 90);
  weights.crown += (levelId % 20 === 0 ? 3 : 0) + (levelId >= 120 ? 1 : 0);

  const entries = Object.entries(weights) as Array<[ChestRarity, number]>;
  const totalWeight = entries.reduce((sum, [, value]) => sum + value, 0);
  let cursor = randomValue * totalWeight;

  for (const [rarity, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) {
      return rarity;
    }
  }

  return "common";
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollTreasureBundle(rarity: ChestRarity, levelId: number, starsEarned: number): RewardBundle {
  const scale = Math.max(1, 1 + Math.floor(levelId / 25));

  if (rarity === "common") {
    return {
      ...EMPTY_REWARD,
      coins: randomInt(35, 60) + scale * 10 + starsEarned * 8,
      hammer: Math.random() < 0.25 ? 1 : 0,
    };
  }

  if (rarity === "rare") {
    return {
      ...EMPTY_REWARD,
      coins: randomInt(70, 110) + scale * 14 + starsEarned * 10,
      hammer: 1,
      glove: Math.random() < 0.45 ? 1 : 0,
      lives: starsEarned >= 2 && Math.random() < 0.25 ? 1 : 0,
    };
  }

  if (rarity === "epic") {
    return {
      ...EMPTY_REWARD,
      coins: randomInt(120, 165) + scale * 18 + starsEarned * 12,
      hammer: 1,
      glove: 1,
      shuffle: Math.random() < 0.4 ? 1 : 0,
      lives: starsEarned >= 2 ? 1 : 0,
    };
  }

  if (rarity === "platinum") {
    return {
      ...EMPTY_REWARD,
      coins: randomInt(175, 230) + scale * 22 + starsEarned * 14,
      lives: 1,
      hammer: 1,
      glove: 1,
      shuffle: 1,
    };
  }

  return {
    ...EMPTY_REWARD,
    coins: randomInt(240, 320) + scale * 28 + starsEarned * 16,
    lives: 2,
    hammer: 2,
    glove: 1,
    shuffle: 1,
  };
}

export function createTreasureChest(levelId: number, starsEarned: number, score: number, now = Date.now()): ChestReward {
  const rarity = chooseWeightedRarity(levelId, starsEarned, Math.random());
  const reward = rollTreasureBundle(rarity, levelId, starsEarned);

  return {
    id: `treasure_${levelId}_${now}_${Math.floor(Math.random() * 10000)}`,
    rarity,
    label: RARITY_LABELS[rarity],
    levelId,
    starsEarned,
    score,
    createdAt: now,
    ...reward,
  };
}

export function formatRewardSummary(bundle: RewardBundle) {
  const parts: string[] = [];

  if (bundle.coins > 0) parts.push(`+${bundle.coins} Coins`);
  if (bundle.lives > 0) parts.push(`+${bundle.lives} Life${bundle.lives === 1 ? "" : "s"}`);
  if (bundle.hammer > 0) parts.push(`+${bundle.hammer} Hammer`);
  if (bundle.glove > 0) parts.push(`+${bundle.glove} Glove`);
  if (bundle.shuffle > 0) parts.push(`+${bundle.shuffle} Shuffle`);
  if (bundle.unlimitedLivesMinutes > 0) parts.push(`${bundle.unlimitedLivesMinutes}m Unlimited Lives`);

  return parts.length > 0 ? parts.join(" / ") : "No rewards";
}
```

## Game Logic: Save / Load

**Source File:** `src/game/persistence.ts`

```ts
/**
 * Persistence Manager
 * Handles localStorage save/load with validation, versioning, and migration support
 * Prepared for future Firebase/backend integration
 */

import { ECONOMY, LEVELS, STORAGE_KEYS } from "./constants";
import type { EconomyState, SagaProgress, SettingsState } from "./types";

// Schema version for future migrations
const SCHEMA_VERSION = 1;

// Default states
export const DEFAULT_PROGRESS: SagaProgress = {
  unlockedLevel: 1,
  selectedLevel: 1,
  starsByLevel: {},
  bestScoreByLevel: {},
  bonusClaimedLevels: [],
};

export const DEFAULT_ECONOMY: EconomyState = {
  coins: ECONOMY.startCoins,
  lives: ECONOMY.startLives,
  nextLifeAt: null,
  inventory: {
    hammer: 0,
    glove: 0,
    shuffle: 0,
  },
};

export const DEFAULT_SETTINGS: SettingsState = {
  isMusicMuted: false,
  isSfxMuted: false,
  isHapticsEnabled: true,
};

// Type guard utilities
function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}

function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Clamp level to valid range
function clampLevel(levelId: number): number {
  return Math.max(1, Math.min(LEVELS.length, levelId));
}

/**
 * Read saga progress from localStorage
 */
export function readSagaProgress(): SagaProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.sagaProgress);
    if (!raw) return DEFAULT_PROGRESS;
    
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidObject(parsed)) return DEFAULT_PROGRESS;
    
    const unlockedLevel = isValidNumber(parsed.unlockedLevel) 
      ? clampLevel(parsed.unlockedLevel) 
      : 1;
    
    const selectedLevel = isValidNumber(parsed.selectedLevel) 
      ? clampLevel(parsed.selectedLevel) 
      : 1;
    
    // Validate stars object
    const starsByLevel: Record<number, number> = {};
    if (isValidObject(parsed.starsByLevel)) {
      for (const [key, value] of Object.entries(parsed.starsByLevel)) {
        const levelId = parseInt(key, 10);
        if (isValidNumber(levelId) && isValidNumber(value) && value >= 0 && value <= 3) {
          starsByLevel[levelId] = Math.floor(value);
        }
      }
    }
    
    // Validate scores object
    const bestScoreByLevel: Record<number, number> = {};
    if (isValidObject(parsed.bestScoreByLevel)) {
      for (const [key, value] of Object.entries(parsed.bestScoreByLevel)) {
        const levelId = parseInt(key, 10);
        if (isValidNumber(levelId) && isValidNumber(value) && value >= 0) {
          bestScoreByLevel[levelId] = Math.floor(value);
        }
      }
    }

    const bonusClaimedLevels = Array.isArray(parsed.bonusClaimedLevels)
      ? parsed.bonusClaimedLevels
          .filter((levelId): levelId is number => isValidNumber(levelId))
          .map((levelId) => clampLevel(levelId))
          .filter((levelId) => levelId % 10 === 0)
      : [];
    
    return {
      unlockedLevel,
      selectedLevel,
      starsByLevel,
      bestScoreByLevel,
      bonusClaimedLevels,
    };
  } catch (error) {
    console.warn("[Persistence] Failed to read saga progress:", error);
    return DEFAULT_PROGRESS;
  }
}

/**
 * Save saga progress to localStorage
 */
export function saveSagaProgress(progress: SagaProgress): void {
  if (typeof window === "undefined") return;
  
  try {
    const data = {
      version: SCHEMA_VERSION,
      ...progress,
    };
    window.localStorage.setItem(STORAGE_KEYS.sagaProgress, JSON.stringify(data));
  } catch (error) {
    console.warn("[Persistence] Failed to save saga progress:", error);
  }
}

/**
 * Read economy state from localStorage
 */
export function readEconomyState(): EconomyState {
  if (typeof window === "undefined") return DEFAULT_ECONOMY;
  
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.economy);
    if (!raw) return DEFAULT_ECONOMY;
    
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidObject(parsed)) return DEFAULT_ECONOMY;
    
    const coins = isValidNumber(parsed.coins) 
      ? Math.max(0, Math.floor(parsed.coins)) 
      : ECONOMY.startCoins;
    
    const lives = isValidNumber(parsed.lives) 
      ? Math.max(0, Math.min(ECONOMY.maxLives, Math.floor(parsed.lives))) 
      : ECONOMY.startLives;
    
    const nextLifeAt = isValidNumber(parsed.nextLifeAt) 
      ? parsed.nextLifeAt 
      : null;

    const inventoryRaw = isValidObject(parsed.inventory) ? parsed.inventory : {};
    const inventory = {
      hammer: isValidNumber(inventoryRaw.hammer) ? Math.max(0, Math.floor(inventoryRaw.hammer)) : 0,
      glove: isValidNumber(inventoryRaw.glove) ? Math.max(0, Math.floor(inventoryRaw.glove)) : 0,
      shuffle: isValidNumber(inventoryRaw.shuffle) ? Math.max(0, Math.floor(inventoryRaw.shuffle)) : 0,
    };
    
    return {
      coins,
      lives,
      nextLifeAt: lives >= ECONOMY.maxLives ? null : nextLifeAt,
      inventory,
    };
  } catch (error) {
    console.warn("[Persistence] Failed to read economy state:", error);
    return DEFAULT_ECONOMY;
  }
}

/**
 * Save economy state to localStorage
 */
export function saveEconomyState(economy: EconomyState): void {
  if (typeof window === "undefined") return;
  
  try {
    const data = {
      version: SCHEMA_VERSION,
      ...economy,
    };
    window.localStorage.setItem(STORAGE_KEYS.economy, JSON.stringify(data));
  } catch (error) {
    console.warn("[Persistence] Failed to save economy state:", error);
  }
}

/**
 * Read settings from localStorage
 */
export function readSettingsState(): SettingsState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidObject(parsed)) return DEFAULT_SETTINGS;
    
    return {
      isMusicMuted: Boolean(parsed.isMusicMuted),
      isSfxMuted: Boolean(parsed.isSfxMuted),
      isHapticsEnabled: parsed.isHapticsEnabled !== false, // Default true
    };
  } catch (error) {
    console.warn("[Persistence] Failed to read settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettingsState(settings: SettingsState): void {
  if (typeof window === "undefined") return;
  
  try {
    const data = {
      version: SCHEMA_VERSION,
      ...settings,
    };
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data));
  } catch (error) {
    console.warn("[Persistence] Failed to save settings:", error);
  }
}

/**
 * Apply life refill based on elapsed time
 */
export function applyLifeRefill(economy: EconomyState, now: number): EconomyState {
  if (economy.lives >= ECONOMY.maxLives) {
    if (economy.nextLifeAt !== null) {
      return { ...economy, nextLifeAt: null };
    }
    return economy;
  }
  
  let lives = economy.lives;
  let nextLifeAt = economy.nextLifeAt ?? now + ECONOMY.lifeRefillMs;
  
  // Calculate how many lives should have been refilled
  while (lives < ECONOMY.maxLives && now >= nextLifeAt) {
    lives += 1;
    nextLifeAt += ECONOMY.lifeRefillMs;
  }
  
  if (lives >= ECONOMY.maxLives) {
    return { ...economy, lives: ECONOMY.maxLives, nextLifeAt: null };
  }
  
  return { ...economy, lives, nextLifeAt };
}

/**
 * Clear all saved data (for reset progress)
 */
export function clearAllProgress(): void {
  if (typeof window === "undefined") return;
  
  try {
    window.localStorage.removeItem(STORAGE_KEYS.sagaProgress);
    window.localStorage.removeItem(STORAGE_KEYS.economy);
    // Note: We intentionally keep settings (mute preferences, etc.)
  } catch (error) {
    console.warn("[Persistence] Failed to clear progress:", error);
  }
}

/**
 * Export all game data as JSON string (for backup/sync)
 */
export function exportGameData(): string {
  return JSON.stringify({
    version: SCHEMA_VERSION,
    timestamp: Date.now(),
    progress: readSagaProgress(),
    economy: readEconomyState(),
    settings: readSettingsState(),
  });
}

/**
 * Import game data from JSON string
 * Returns true if successful
 */
export function importGameData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as unknown;
    if (!isValidObject(data)) return false;
    
    // Validate and save progress
    if (isValidObject(data.progress)) {
      const progress = data.progress as Partial<SagaProgress>;
      saveSagaProgress({
        unlockedLevel: isValidNumber(progress.unlockedLevel) ? clampLevel(progress.unlockedLevel) : 1,
        selectedLevel: isValidNumber(progress.selectedLevel) ? clampLevel(progress.selectedLevel) : 1,
        starsByLevel: progress.starsByLevel ?? {},
        bestScoreByLevel: progress.bestScoreByLevel ?? {},
        bonusClaimedLevels: Array.isArray(progress.bonusClaimedLevels)
          ? progress.bonusClaimedLevels
              .filter((levelId): levelId is number => isValidNumber(levelId))
              .map((levelId) => clampLevel(levelId))
              .filter((levelId) => levelId % 10 === 0)
          : [],
      });
    }
    
    // Validate and save economy
    if (isValidObject(data.economy)) {
      const economy = data.economy as Partial<EconomyState>;
      saveEconomyState({
        coins: isValidNumber(economy.coins) ? Math.max(0, economy.coins) : ECONOMY.startCoins,
        lives: isValidNumber(economy.lives) ? Math.min(ECONOMY.maxLives, Math.max(0, economy.lives)) : ECONOMY.startLives,
        nextLifeAt: isValidNumber(economy.nextLifeAt) ? economy.nextLifeAt : null,
        inventory: {
          hammer: isValidNumber(economy.inventory?.hammer) ? Math.max(0, Math.floor(economy.inventory.hammer)) : 0,
          glove: isValidNumber(economy.inventory?.glove) ? Math.max(0, Math.floor(economy.inventory.glove)) : 0,
          shuffle: isValidNumber(economy.inventory?.shuffle) ? Math.max(0, Math.floor(economy.inventory.shuffle)) : 0,
        },
      });
    }
    
    // Validate and save settings
    if (isValidObject(data.settings)) {
      const settings = data.settings as Partial<SettingsState>;
      saveSettingsState({
        isMusicMuted: Boolean(settings.isMusicMuted),
        isSfxMuted: Boolean(settings.isSfxMuted),
        isHapticsEnabled: settings.isHapticsEnabled !== false,
      });
    }
    
    return true;
  } catch (error) {
    console.warn("[Persistence] Failed to import game data:", error);
    return false;
  }
}

// Firebase/Backend integration hooks (placeholders for future)
export interface CloudSaveProvider {
  save(key: string, data: string): Promise<void>;
  load(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

let cloudProvider: CloudSaveProvider | null = null;

/**
 * Set the cloud save provider (Firebase, custom backend, etc.)
 */
export function setCloudSaveProvider(provider: CloudSaveProvider): void {
  cloudProvider = provider;
}

/**
 * Sync local data to cloud (if provider is set)
 */
export async function syncToCloud(): Promise<boolean> {
  if (!cloudProvider) return false;
  
  try {
    const data = exportGameData();
    await cloudProvider.save("game_save", data);
    return true;
  } catch (error) {
    console.warn("[Persistence] Cloud sync failed:", error);
    return false;
  }
}

/**
 * Load data from cloud (if provider is set)
 */
export async function loadFromCloud(): Promise<boolean> {
  if (!cloudProvider) return false;
  
  try {
    const data = await cloudProvider.load("game_save");
    if (!data) return false;
    return importGameData(data);
  } catch (error) {
    console.warn("[Persistence] Cloud load failed:", error);
    return false;
  }
}
```

## Game Types

**Source File:** `src/game/types.ts`

```ts
export type BlockColor = "red" | "blue" | "green" | "yellow" | "purple";

export type BoosterKind = "rocket" | "bomb" | "disco";
export type RocketAxis = "row" | "col";

// === Bonus Level Reward Types ===
export type RewardKind = "coin" | "life" | "rocket_reward" | "hammer_reward";

type BaseTile = {
  id: string;
  col: number;
  row: number;
  spawnRow: number;
};

export type RegularTile = BaseTile & {
  kind: "regular";
  color: BlockColor;
};

export type BoosterTile = BaseTile & {
  kind: "booster";
  booster: BoosterKind;
  rocketAxis?: RocketAxis;
};

export type BoxTile = BaseTile & {
  kind: "box";
  hitsRemaining: number;
  maxHits: number;
};

export type HoneyTile = BaseTile & {
  kind: "honey";
};

export type IceTile = BaseTile & {
  kind: "ice";
  hitsRemaining: number;
  maxHits: number;
};

export type SafeTile = BaseTile & {
  kind: "safe";
  color: BlockColor;
  reward: RewardBundle;
};

export type CloudTile = BaseTile & {
  kind: "cloud";
};

// Reward tiles for bonus levels
export type RewardTile = BaseTile & {
  kind: "reward";
  reward: RewardKind;
  value: number; // how much to give (e.g., 10 coins, 1 life)
};

export type BlockTile = RegularTile | BoosterTile | BoxTile | HoneyTile | IceTile | SafeTile | CloudTile | RewardTile;

// === Level Mode System ===
export type LevelMode = "normal" | "bonus";

export type LevelTargets = {
  colors: Partial<Record<BlockColor, number>>;
  boxes: number;
};

export type LevelDefinition = {
  id: number;
  mode: LevelMode;
  // Normal mode uses moves
  moves: number;
  // Bonus mode uses timer (seconds)
  timeLimit?: number;
  targets: LevelTargets;
  boxPositions?: Array<{ col: number; row: number }>;
  starThresholds: [number, number, number];
  // Bonus level reward spawn rate (0-1)
  rewardSpawnRate?: number;
};

// Loot collected during bonus level
export type BonusLoot = {
  coins: number;
  lives: number;
  rockets: number;
  hammers: number;
};

export type GamePhase = "playing" | "resolving" | "rescue" | "won" | "lost" | "combo_anticipation";

// â”€â”€ Fever Mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type FeverState = {
  active: boolean;
  streak: number;           // consecutive big blasts (5+ blocks)
  blocksThisStreak: number; // total blocks destroyed in current streak
  multiplier: number;       // score multiplier during fever (1.5x)
  expiresAt: number | null; // Date.now() timestamp when fever ends
};

export type AppScreen = "map" | "pregame" | "game";

export type SagaProgress = {
  unlockedLevel: number;
  selectedLevel: number;
  starsByLevel: Record<number, number>;
  bestScoreByLevel: Record<number, number>;
  bonusClaimedLevels: number[];
};

export type EconomyState = {
  coins: number;
  lives: number;
  nextLifeAt: number | null;
  unlimitedLivesUntil: number | null;
  inventory: {
    hammer: number;
    glove: number;
    shuffle: number;
  };
};

export type RewardBundle = {
  coins: number;
  lives: number;
  hammer: number;
  glove: number;
  shuffle: number;
  unlimitedLivesMinutes: number;
};

export type DailyWheelSegmentId =
  | "unlimited_lives"
  | "coin_50"
  | "hammer_drop"
  | "shuffle_boost"
  | "coin_120"
  | "tool_bundle"
  | "life_spark"
  | "coin_mix";

export type DailyWheelSegment = {
  id: DailyWheelSegmentId;
  label: string;
  accent: string;
  glow: string;
  reward: RewardBundle;
};

export type ChestRarity = "common" | "rare" | "epic" | "platinum" | "crown";

export type ChestReward = RewardBundle & {
  id: string;
  rarity: ChestRarity;
  label: string;
  levelId: number;
  starsEarned: number;
  score: number;
  createdAt: number;
};

export type MissionId = "daily" | "episode" | "progression";

export type MissionCard = {
  id: MissionId;
  laneLabel: string;
  title: string;
  progress: number;
  target: number;
  claimed: boolean;
  reward: RewardBundle;
  accent: string;
};

export type MetaProgress = {
  dailyMission: {
    key: string;
    progress: number;
    target: number;
    claimed: boolean;
  };
  episodeMission: {
    episode: number;
    target: number;
    claimedEpisodes: number[];
  };
  progressionMission: {
    tier: number;
    progress: number;
    target: number;
    claimed: boolean;
  };
  dailyWheel: {
    lastSpinAt: number | null;
    nextSpinAt: number | null;
    lastSegmentId: DailyWheelSegmentId | null;
  };
  selectedCharacterIndex: number;
  pendingChests: ChestReward[];
  chestStats: {
    totalOpened: number;
    byRarity: Record<ChestRarity, number>;
    lastOpenedChest: ChestReward | null;
  };
};

export type SettingsState = {
  isMusicMuted: boolean;
  isSfxMuted: boolean;
  isHapticsEnabled: boolean;
};

export type InGameBoosterKind = "hammer" | "glove" | "shuffle";
export type TargetingMode = Extract<InGameBoosterKind, "hammer" | "glove">;

export type FloatingText = {
  id: string;
  x: number;
  y: number;
  label: string;
  tone?: "normal" | "mega";
};

export type DestroyedSummary = {
  colors: Record<BlockColor, number>;
  boxes: number;
  specials: number;
};

export type DestroyedRegular = {
  col: number;
  row: number;
  color: BlockColor;
};

export type DestroyedBox = {
  col: number;
  row: number;
};

// Rocket VFX cinematic overlay state
export type RocketVFXState = {
  id: string;
  col: number;
  row: number;
  axis: "row" | "col";
  /** tiles to remove once the dash animation completes */
  pendingTiles: BlockTile[];
};

export type DiscoVFXState = {
  id: string;
  col: number;
  row: number;
  targetColor: BlockColor;
  targets: Array<{ col: number; row: number }>;
  /** tiles to remove once the cinematic completes */
  pendingTiles: BlockTile[];
};

export type TapResolution = {
  didConsumeMove: boolean;
  didResolveBlast: boolean;
  blastSize: number;
  tiles: BlockTile[];
  destroyed: DestroyedSummary;
  destroyedRegulars: DestroyedRegular[];
  destroyedBoxes: DestroyedBox[];
  impact: "none" | "normal" | "heavy" | "mega" | "grand_slam";
  megaCombo: boolean;
  comboKind: "none" | "rocket_rocket" | "rocket_bomb" | "bomb_bomb" | "disco_rocket" | "disco_bomb" | "disco_disco";
  comboCenter?: { col: number; row: number };
  /** Set when a rocket booster was activated â€” drives the cinematic VFX overlay */
  rocketOrigin?: { col: number; row: number; axis: "row" | "col" };
  /** Set when a tapped disco booster should run lightning-beam cinematic before commit */
  discoCinematic?: {
    origin: { col: number; row: number };
    targetColor: BlockColor;
    targets: Array<{ col: number; row: number }>;
  };
  // Bonus level reward collection
  collectedRewards?: RewardTile[];
  rewardBundle?: RewardBundle;
};
```

## Game Logic: Audio Manager Hook

**Source File:** `src/game/useAudioManager.ts`

```ts
/**
 * Professional Audio Manager using Web Audio API
 * Handles BGM with fade-in, multiple SFX channels, and mobile-friendly initialization
 */

import { useCallback, useEffect, useRef } from "react";

// Sound effect types
export type AudioSfx = 
  | "pop"           // Block tap / small match
  | "bombExplode"   // Bomb booster activation
  | "rocketSwoosh"  // Rocket booster activation
  | "winTrumpet"    // Level victory
  | "loseSigh"      // Level failure
  | "boosterSpawn"  // When a booster is created
  | "comboBlast"    // Large combo explosion
  | "coinCollect"   // Collecting coins
  | "buttonClick";  // UI button press

type UseAudioManagerArgs = {
  isMusicMuted: boolean;
  isSfxMuted: boolean;
};

type PlaySfxOptions = {
  detuneCents?: number;
  volumeScale?: number;
};

// Audio file paths (placeholders - replace with real assets)
const AUDIO_PATHS: Record<AudioSfx | "bgm", string> = {
  bgm: "/assets/sfx/bgm.mp3",
  pop: "/assets/sfx/pop.mp3",
  bombExplode: "/assets/sfx/explosion.mp3",
  rocketSwoosh: "/assets/sfx/swoosh.mp3",
  winTrumpet: "/assets/sfx/win.mp3",
  loseSigh: "/assets/sfx/lose.mp3",
  boosterSpawn: "/assets/sfx/magic.mp3",
  comboBlast: "/assets/sfx/combo.mp3",
  coinCollect: "/assets/sfx/coin.mp3",
  buttonClick: "/assets/sfx/click.mp3",
};

// Volume levels for each sound type
const VOLUME_LEVELS: Record<AudioSfx | "bgm", number> = {
  bgm: 0.3,
  pop: 0.4,
  bombExplode: 0.6,
  rocketSwoosh: 0.5,
  winTrumpet: 0.7,
  loseSigh: 0.5,
  boosterSpawn: 0.45,
  comboBlast: 0.65,
  coinCollect: 0.4,
  buttonClick: 0.3,
};

// Frequency presets for synthesized sounds
const SYNTH_PRESETS: Record<AudioSfx, { type: OscillatorType; freq: number; duration: number; freqEnd?: number }> = {
  pop: { type: "sine", freq: 880, duration: 0.08, freqEnd: 440 },
  bombExplode: { type: "sawtooth", freq: 120, duration: 0.25, freqEnd: 40 },
  rocketSwoosh: { type: "sine", freq: 600, duration: 0.15, freqEnd: 1200 },
  winTrumpet: { type: "square", freq: 523, duration: 0.4, freqEnd: 784 },
  loseSigh: { type: "sine", freq: 440, duration: 0.3, freqEnd: 220 },
  boosterSpawn: { type: "sine", freq: 1200, duration: 0.12, freqEnd: 1800 },
  comboBlast: { type: "sawtooth", freq: 200, duration: 0.3, freqEnd: 80 },
  coinCollect: { type: "sine", freq: 1047, duration: 0.1, freqEnd: 1568 },
  buttonClick: { type: "sine", freq: 1000, duration: 0.05, freqEnd: 800 },
};

export function useAudioManager({ isMusicMuted, isSfxMuted }: UseAudioManagerArgs) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);
  const bgmSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bgmBufferRef = useRef<AudioBuffer | null>(null);
  const sfxCacheRef = useRef<Map<AudioSfx, AudioBuffer>>(new Map());
  const isInitializedRef = useRef(false);
  const wasUnlockedRef = useRef(false);

  // Initialize audio context on first user interaction
  const initializeAudio = useCallback(() => {
    if (isInitializedRef.current) return audioContextRef.current;

    try {
      // @ts-expect-error - webkitAudioContext for Safari
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("[Audio] Web Audio API not supported");
        return null;
      }

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Create BGM gain node for volume control and fade-in
      const bgmGain = ctx.createGain();
      bgmGain.gain.value = 0;
      bgmGain.connect(ctx.destination);
      bgmGainRef.current = bgmGain;

      isInitializedRef.current = true;
      return ctx;
    } catch (error) {
      console.warn("[Audio] Failed to initialize:", error);
      return null;
    }
  }, []);

  // Resume suspended audio context (required for mobile browsers)
  const unlockAudio = useCallback(async () => {
    if (wasUnlockedRef.current) return;
    
    const ctx = audioContextRef.current || initializeAudio();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
        wasUnlockedRef.current = true;
      } catch (error) {
        console.debug("[Audio] Failed to resume context:", error);
      }
    } else {
      wasUnlockedRef.current = true;
    }
  }, [initializeAudio]);

  // Load an audio file into a buffer
  const loadAudioBuffer = useCallback(async (url: string): Promise<AudioBuffer | null> => {
    const ctx = audioContextRef.current;
    if (!ctx) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      // Audio file not found - this is expected for placeholders
      console.debug(`[Audio] Could not load ${url}:`, error);
      return null;
    }
  }, []);

  // Play synthesized sound effect (fallback when no audio file)
  const playSynthSfx = useCallback((name: AudioSfx, options?: PlaySfxOptions) => {
    const ctx = audioContextRef.current;
    if (!ctx || isSfxMuted) return;

    try {
      const preset = SYNTH_PRESETS[name];
      if (!preset) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const detuneRatio = Math.pow(2, (options?.detuneCents ?? 0) / 1200);

      oscillator.type = preset.type;
      oscillator.frequency.setValueAtTime(preset.freq * detuneRatio, ctx.currentTime);
      if (preset.freqEnd) {
        oscillator.frequency.exponentialRampToValueAtTime(
          preset.freqEnd * detuneRatio,
          ctx.currentTime + preset.duration
        );
      }

      gainNode.gain.setValueAtTime(VOLUME_LEVELS[name] * 0.15 * (options?.volumeScale ?? 1), ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + preset.duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + preset.duration);
    } catch (error) {
      console.debug("[Audio] Synth SFX failed:", error);
    }
  }, [isSfxMuted]);

  // Play a sound effect
  const playSfx = useCallback(async (name: AudioSfx, options?: PlaySfxOptions) => {
    if (isSfxMuted) return;

    // Try to unlock audio on first play
    await unlockAudio();

    const ctx = audioContextRef.current;
    if (!ctx) {
      console.debug(`[SFX] ${name} - no audio context`);
      return;
    }

    // Check cache first
    let buffer = sfxCacheRef.current.get(name);

    // Try to load from file if not cached
    if (!buffer) {
      buffer = await loadAudioBuffer(AUDIO_PATHS[name]) || undefined;
      if (buffer) {
        sfxCacheRef.current.set(name, buffer);
      }
    }

    // If we have a buffer, play it
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();

        source.buffer = buffer;
        source.detune.value = options?.detuneCents ?? 0;
        gainNode.gain.value = VOLUME_LEVELS[name] * (options?.volumeScale ?? 1);

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
      } catch (error) {
        console.debug("[Audio] Buffer playback failed:", error);
        playSynthSfx(name, options);
      }
    } else {
      // Fallback to synthesized sound
      playSynthSfx(name, options);
    }
  }, [isSfxMuted, unlockAudio, loadAudioBuffer, playSynthSfx]);

  // Start background music with fade-in
  const startBgm = useCallback(async () => {
    if (isMusicMuted) return;

    await unlockAudio();

    const ctx = audioContextRef.current;
    const gainNode = bgmGainRef.current;
    if (!ctx || !gainNode) return;

    // Stop existing BGM
    if (bgmSourceRef.current) {
      try {
        bgmSourceRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      bgmSourceRef.current = null;
    }

    // Load BGM if not cached
    if (!bgmBufferRef.current) {
      bgmBufferRef.current = await loadAudioBuffer(AUDIO_PATHS.bgm);
    }

    // If we have BGM, play it
    if (bgmBufferRef.current) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = bgmBufferRef.current;
        source.loop = true;
        source.connect(gainNode);
        
        // Fade in over 2 seconds
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(VOLUME_LEVELS.bgm, ctx.currentTime + 2);

        source.start(0);
        bgmSourceRef.current = source;
      } catch (error) {
        console.debug("[Audio] BGM playback failed:", error);
      }
    } else {
      console.debug("[Audio] No BGM file available - running silent");
    }
  }, [isMusicMuted, unlockAudio, loadAudioBuffer]);

  // Stop background music
  const stopBgm = useCallback(() => {
    if (bgmSourceRef.current) {
      try {
        const ctx = audioContextRef.current;
        const gainNode = bgmGainRef.current;
        
        if (ctx && gainNode) {
          // Fade out over 0.5 seconds
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          setTimeout(() => {
            try {
              bgmSourceRef.current?.stop();
              bgmSourceRef.current = null;
            } catch {
              // Ignore
            }
          }, 500);
        } else {
          bgmSourceRef.current.stop();
          bgmSourceRef.current = null;
        }
      } catch {
        bgmSourceRef.current = null;
      }
    }
  }, []);

  // Update BGM based on mute state
  useEffect(() => {
    if (isMusicMuted) {
      stopBgm();
    }
  }, [isMusicMuted, stopBgm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBgm();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopBgm]);

  // Add click handler to unlock audio on mobile
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
    };

    document.addEventListener("touchstart", handleInteraction, { once: true });
    document.addEventListener("click", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("click", handleInteraction);
    };
  }, [unlockAudio]);

  return {
    playSfx,
    startBgm,
    stopBgm,
    unlockAudio,
  };
}
```

## Hook: Block Idle Animation

**Source File:** `src/hooks/useBlockIdleAnim.ts`

```ts
/**
 * useBlockIdleAnim
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Returns stable idle animation parameters for a single block cell.
 * Derived purely from (col, row) â€” no runtime state, no re-renders.
 *
 * The "wave" effect is achieved by offsetting the phase of each block's
 * animation based on its grid position. We use CSS custom properties
 * so that a single @keyframes handles ALL 99 blocks with no per-block
 * Framer Motion `animate` loop.
 */

export type IdleAnimParams = {
  /** CSS animation-delay in seconds (negative = already mid-animation) */
  delay: string;
  /** CSS animation-duration in seconds (slightly randomized per-block) */
  duration: string;
  /** CSS animation-delay for the rotation sub-animation */
  rotDelay: string;
  /** CSS animation-duration for the rotation sub-animation */
  rotDuration: string;
};

/**
 * @param col  0-based column index
 * @param row  0-based row index
 * @param cols total columns (used for wave offset)
 */
export function getIdleAnimParams(col: number, row: number, cols: number): IdleAnimParams {
  // Wave phase: each cell is offset by its diagonal position
  const diagIndex = col + row;           // 0 â€¦ (COLS-1 + ROWS-1)
  const maxDiag   = (cols - 1) + 10;    // COLS-1 + ROWS-1 = 8 + 10 = 18  (9Ã—11 grid)

  // Float: 1.8s base + up to 0.6s variation, negative delay = already running
  const floatPhase    = -(diagIndex / maxDiag) * 1.8;
  const floatDuration = 1.8 + ((col * 3 + row * 7) % 7) * 0.08; // 1.80â€“2.36s

  // Rotation: slightly different period so it doesn't sync with float
  const rotPhase    = -(diagIndex / maxDiag) * 2.4;
  const rotDuration = 2.4 + ((col * 5 + row * 11) % 9) * 0.07; // 2.40â€“3.00s

  return {
    delay:       `${floatPhase.toFixed(3)}s`,
    duration:    `${floatDuration.toFixed(3)}s`,
    rotDelay:    `${rotPhase.toFixed(3)}s`,
    rotDuration: `${rotDuration.toFixed(3)}s`,
  };
}
```

## Hook: Matchable IDs

**Source File:** `src/hooks/useMatchableIds.ts`

```ts
/**
 * useMatchableIds
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Returns a Set of block IDs that belong to a matchable group (size >= 2).
 * Computed once per blocks change â€” not per-render.
 * Uses a flood-fill pass over all regular tiles on the grid.
 */
import { useMemo } from "react";
import type { BlockTile, RegularTile } from "../game/types";
import { buildGrid, findConnectedColorGroup } from "../game/engine";

export function useMatchableIds(blocks: BlockTile[]): Set<string> {
  return useMemo(() => {
    const grid = buildGrid(blocks);
    const visited = new Set<string>();
    const matchable = new Set<string>();

    for (const tile of blocks) {
      if (tile.kind !== "regular") continue;
      if (visited.has(tile.id)) continue;

      const group = findConnectedColorGroup(tile as RegularTile, grid);
      for (const t of group) visited.add(t.id);

      if (group.length >= 2) {
        for (const t of group) matchable.add(t.id);
      }
    }

    return matchable;
  }, [blocks]);
}
```

## Utility: Background Music Manager

**Source File:** `src/utils/BGMManager.ts`

```ts
/**
 * BGMManager â€” Dynamic BGM System
 * Uses standard HTML5 Audio for two tracks:
 *   "main"  â†’ Saga Map theme (calm, ambient)
 *   "game"  â†’ In-level theme (upbeat, energetic)
 *
 * Architecture:
 * - Singleton pattern â€” ONE instance for the entire app lifecycle
 * - Only TWO HTMLAudioElement objects ever created (one per track)
 * - Hard-pause on track switch to GUARANTEE no overlap
 * - Optional fade-in on the incoming track only
 * - First-interaction unlock compliant with browser autoplay policy
 * - setFeverMode: ramps playbackRate for fever hype feel
 */

const MAIN_BGM_URL =
  "https://raw.githubusercontent.com/rainbum/Rainbum.github.io/main/blast-mania-main.mp3";
const GAME_BGM_URL =
  "https://raw.githubusercontent.com/rainbum/Rainbum.github.io/main/blast-mania-inside-game.mp3";

const MASTER_VOLUME  = 0.30;   // comfortable listening level
const FADE_IN_MS     = 800;    // ms to fade in the incoming track
const FADE_STEP_MS   = 20;     // interval tick for fade-in

export type BGMTrack = "main" | "game";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class BGMManagerSingleton {
  // â”€â”€ The only two Audio elements that will ever exist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private readonly tracks: Record<BGMTrack, HTMLAudioElement> = {
    main: this.createAudio(MAIN_BGM_URL),
    game: this.createAudio(GAME_BGM_URL),
  };

  private currentTrack: BGMTrack | null = null;
  private isMuted       = false;
  private isUnlocked    = false;
  private pendingPlay: BGMTrack | null = null;   // queued before unlock
  private fadeInTimer:  ReturnType<typeof setInterval> | null = null;
  private feverTimer:   ReturnType<typeof setInterval> | null = null;

  // â”€â”€ Internal helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private createAudio(url: string): HTMLAudioElement {
    const a    = new Audio(url);
    a.loop     = true;
    a.preload  = "auto";
    a.volume   = 0;
    return a;
  }

  /** Cancel any running fade-in interval. */
  private clearFadeIn(): void {
    if (this.fadeInTimer !== null) {
      clearInterval(this.fadeInTimer);
      this.fadeInTimer = null;
    }
  }

  /**
   * HARD-STOP a track: pause it immediately and reset volume to 0.
   * This is the only correct way to guarantee it is silent.
   */
  private hardStop(track: BGMTrack): void {
    const a = this.tracks[track];
    try { a.pause(); } catch { /* ignore DOMException */ }
    a.volume      = 0;
    a.currentTime = 0;
  }

  /** Fade the incoming audio from 0 â†’ MASTER_VOLUME over FADE_IN_MS. */
  private fadeIn(audio: HTMLAudioElement): void {
    this.clearFadeIn();
    if (this.isMuted) {
      audio.volume = 0;
      return;
    }
    const steps     = Math.ceil(FADE_IN_MS / FADE_STEP_MS);
    const increment = MASTER_VOLUME / steps;
    audio.volume    = 0;

    this.fadeInTimer = setInterval(() => {
      const next = Math.min(MASTER_VOLUME, audio.volume + increment);
      audio.volume = next;
      if (next >= MASTER_VOLUME) {
        this.clearFadeIn();
      }
    }, FADE_STEP_MS);
  }

  // â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Call this inside a user-gesture handler (tap / click).
   * Satisfies browser autoplay policy. Safe to call multiple times.
   */
  async unlock(): Promise<void> {
    if (this.isUnlocked) return;
    this.isUnlocked = true;
    if (this.pendingPlay !== null) {
      const t = this.pendingPlay;
      this.pendingPlay = null;
      this.playMusic(t);
    }
  }

  /**
   * Switch BGM to `track`.
   *
   * Switching guarantees:
   *  1. The currently-playing track is HARD-PAUSED first (no lingering audio).
   *  2. The new track starts from the beginning with a fade-in.
   *  3. If the requested track is already playing, this is a no-op.
   *  4. If called before unlock(), the request is queued and honoured on unlock.
   */
  playMusic(track: BGMTrack): void {
    // â”€â”€ Not unlocked yet: queue and return â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!this.isUnlocked) {
      this.pendingPlay = track;
      return;
    }

    // â”€â”€ Already on this track and playing: no-op â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (this.currentTrack === track && !this.tracks[track].paused) {
      return;
    }

    // â”€â”€ STEP 1: Hard-stop ALL tracks (guarantees silence) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // We stop every track, not just the "previous" one, because stale
    // intervals or rapid switching can leave any track in a playing state.
    for (const t of (["main", "game"] as BGMTrack[])) {
      this.hardStop(t);
    }
    this.clearFadeIn();           // cancel any in-progress fade-in
    this.currentTrack = track;

    // â”€â”€ STEP 2: If muted, just record the track but stay silent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (this.isMuted) return;

    // â”€â”€ STEP 3: Start the new track and fade it in â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const next = this.tracks[track];
    next.currentTime  = 0;
    next.playbackRate = 1.0;
    next.volume       = 0;

    next.play().then(() => {
      this.fadeIn(next);
    }).catch(() => {
      // Autoplay still blocked â€” queue again for next interaction
      this.pendingPlay = track;
    });
  }

  /**
   * Immediately stop all BGM (no fade).
   */
  stopAll(): void {
    this.clearFadeIn();
    for (const t of (["main", "game"] as BGMTrack[])) {
      this.hardStop(t);
    }
    this.currentTrack = null;
  }

  /**
   * Mute / un-mute. Persisted across track switches.
   */
  setMuted(muted: boolean): void {
    if (this.isMuted === muted) return;
    this.isMuted = muted;

    if (muted) {
      // Hard-stop everything immediately â€” no fade, no ambiguity
      this.clearFadeIn();
      for (const t of (["main", "game"] as BGMTrack[])) {
        try { this.tracks[t].pause(); } catch { /* ignore */ }
        this.tracks[t].volume = 0;
      }
    } else {
      // Un-mute: restart the logical current track
      if (this.currentTrack) {
        this.playMusic(this.currentTrack);
      }
    }
  }

  getMuted(): boolean       { return this.isMuted; }
  getCurrentTrack(): BGMTrack | null { return this.currentTrack; }

  getIsPlaying(): boolean {
    if (!this.currentTrack) return false;
    return !this.tracks[this.currentTrack].paused;
  }

  /**
   * Fever Mode â€” ramps playbackRate of the current track for hype feel.
   * Safely returns to 1.0Ã— when deactivated.
   */
  setFeverMode(active: boolean): void {
    if (this.feverTimer !== null) {
      clearInterval(this.feverTimer);
      this.feverTimer = null;
    }
    if (!this.currentTrack) return;

    const audio      = this.tracks[this.currentTrack];
    const targetRate = active ? 1.35 : 1.0;
    const delta      = (targetRate - audio.playbackRate) / 20;
    let   steps      = 20;

    this.feverTimer = setInterval(() => {
      audio.playbackRate = Math.max(0.5, Math.min(2.0,
        audio.playbackRate + delta
      ));
      steps--;
      if (steps <= 0) {
        clearInterval(this.feverTimer!);
        this.feverTimer       = null;
        audio.playbackRate    = targetRate;
      }
    }, 30);
  }

  /**
   * Legacy shim â€” used by SplashScreen which calls BGMManager.play().
   * Routes to playMusic("main").
   */
  play(): void {
    this.playMusic("main");
  }
}

// â”€â”€ Export singleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Only ONE instance is ever created for the entire application lifetime.
export const BGMManager = new BGMManagerSingleton();
```

## Utility: Class Name Helper

**Source File:** `src/utils/cn.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```


