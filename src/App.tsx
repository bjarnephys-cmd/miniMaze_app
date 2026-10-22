/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LevelData,
  PlayerState,
  Position,
  Direction,
  LevelProgress,
  TabletElement,
} from './types/game';
import { LEVELS, getLevelById } from './data/levels';
import { DungeonCanvas } from './components/DungeonCanvas';
import { GameHUD } from './components/GameHUD';
import { VirtualControls } from './components/VirtualControls';
import { StartMenu } from './components/StartMenu';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { GuideModal } from './components/GuideModal';
import { TabletModal } from './components/TabletModal';
import { InspectorBar } from './components/InspectorBar';
import { sounds } from './utils/audio';
import { findPath } from './utils/pathfinding';
import { inspectTile, TileExplanation } from './utils/tileInspector';

interface FloatingNotification {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
  alpha: number;
}

const INITIAL_PROGRESS: Record<number, LevelProgress> = {
  1: { unlocked: true, completed: false, stars: 0, bestTime: 0, bestSteps: 0, highScore: 0 },
  2: { unlocked: false, completed: false, stars: 0, bestTime: 0, bestSteps: 0, highScore: 0 },
  3: { unlocked: false, completed: false, stars: 0, bestTime: 0, bestSteps: 0, highScore: 0 },
};

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<'START_MENU' | 'PLAYING'>('START_MENU');

  // Modals state
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTablet, setActiveTablet] = useState<TabletElement | null>(null);

  // Sound state
  const [soundMuted, setSoundMuted] = useState<boolean>(() => sounds.getMuted());

  // Bright / Classic ambiance mode (default to true for well-lit, crisp visibility)
  const [brightMode, setBrightMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mazequest_bright_mode');
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return true; // Default to brighter theme as requested!
  });

  // Hovered tile inspection state
  const [hoveredPos, setHoveredPos] = useState<Position | null>(null);

  // Player & Level State
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<LevelData>(() => getLevelById(1)!);

  const [player, setPlayer] = useState<PlayerState>({
    x: 1,
    y: 1,
    direction: 'down',
    health: 3,
    maxHealth: 3,
    keys: { bronze: 0, silver: 0, gold: 0 },
    gems: 0,
    score: 0,
    steps: 0,
    hasRelic: false,
    isInvulnerable: false,
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [floatingNotes, setFloatingNotes] = useState<FloatingNotification[]>([]);
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem('mazequest_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PROGRESS;
  });

  // Automated path queue for click-to-move
  const pathQueueRef = useRef<Position[]>([]);
  const isMovingPathRef = useRef<boolean>(false);

  // Notification helper
  const addFloatingNote = useCallback((text: string, x: number, y: number, color: string = '#f59e0b') => {
    const id = Date.now() + Math.random();
    setFloatingNotes((prev) => [...prev, { id, text, color, x, y, alpha: 1.0 }]);

    setTimeout(() => {
      setFloatingNotes((prev) => prev.filter((n) => n.id !== id));
    }, 1200);
  }, []);

  // Save progress helper
  const saveProgress = useCallback((newProgress: Record<number, LevelProgress>) => {
    setProgress(newProgress);
    try {
      localStorage.setItem('mazequest_progress', JSON.stringify(newProgress));
    } catch {
      // ignore
    }
  }, []);

  // Toggle audio
  const handleToggleSound = useCallback(() => {
    const next = sounds.toggleMute();
    setSoundMuted(next);
  }, []);

  // Toggle brightness mode
  const handleToggleBrightMode = useCallback(() => {
    setBrightMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mazequest_bright_mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Initialize / Reset Level
  const initLevel = useCallback((levelId: number) => {
    const freshLevel = getLevelById(levelId);
    if (!freshLevel) return;

    setCurrentLevelId(levelId);
    setCurrentLevel(freshLevel);

    setPlayer({
      x: freshLevel.startPos.x,
      y: freshLevel.startPos.y,
      direction: 'down',
      health: 3,
      maxHealth: 3,
      keys: { bronze: 0, silver: 0, gold: 0 },
      gems: 0,
      score: 0,
      steps: 0,
      hasRelic: false,
      isInvulnerable: false,
    });

    setElapsedSeconds(0);
    setIsPaused(false);
    setIsVictoryOpen(false);
    setIsGameOverOpen(false);
    setActiveTablet(null);
    pathQueueRef.current = [];
    isMovingPathRef.current = false;
  }, []);

  // Start quest from title
  const handleStartQuest = () => {
    initLevel(1);
    setScreen('PLAYING');
  };

  // Select specific level
  const handleSelectLevel = (levelId: number) => {
    initLevel(levelId);
    setIsLevelSelectOpen(false);
    setScreen('PLAYING');
  };

  // Timer loop
  useEffect(() => {
    if (screen !== 'PLAYING' || isPaused || isVictoryOpen || isGameOverOpen) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, isPaused, isVictoryOpen, isGameOverOpen]);

  // Periodic spikes toggler & Patrol Sentries
  useEffect(() => {
    if (screen !== 'PLAYING' || isPaused || isVictoryOpen || isGameOverOpen) return;

    const spikeTimer = setInterval(() => {
      setCurrentLevel((prev) => {
        let changed = false;
        const newSpikes = prev.spikes.map((spike) => {
          if (spike.periodMs) {
            changed = true;
            return { ...spike, isActive: !spike.isActive };
          }
          return spike;
        });

        if (!changed) return prev;
        return { ...prev, spikes: newSpikes };
      });
    }, 2400);

    // Sentry hazard mover
    const sentryTimer = setInterval(() => {
      setCurrentLevel((prev) => {
        if (!prev.sentries || prev.sentries.length === 0) return prev;

        const updatedSentries = prev.sentries.map((sentry) => {
          let nextIdx = sentry.pathIndex + sentry.direction;
          let nextDir = sentry.direction;

          if (nextIdx >= sentry.path.length) {
            nextDir = -1;
            nextIdx = sentry.path.length - 2;
          } else if (nextIdx < 0) {
            nextDir = 1;
            nextIdx = 1;
          }

          const targetPos = sentry.path[nextIdx] || sentry.path[0];
          return {
            ...sentry,
            x: targetPos.x,
            y: targetPos.y,
            pathIndex: nextIdx,
            direction: nextDir as 1 | -1,
          };
        });

        return { ...prev, sentries: updatedSentries };
      });
    }, 650);

    return () => {
      clearInterval(spikeTimer);
      clearInterval(sentryTimer);
    };
  }, [screen, isPaused, isVictoryOpen, isGameOverOpen]);

  // Check sentry collision with player
  useEffect(() => {
    if (screen !== 'PLAYING' || isVictoryOpen || isGameOverOpen) return;
    if (!currentLevel.sentries) return;

    const hitSentry = currentLevel.sentries.find(
      (s) => s.x === player.x && s.y === player.y
    );

    if (hitSentry && !player.isInvulnerable) {
      sounds.playHurt();
      addFloatingNote('Watcher Hit! -1 HP', player.x, player.y, '#ef4444');

      setPlayer((prev) => {
        const nextHealth = prev.health - 1;
        if (nextHealth <= 0) {
          sounds.playDefeat();
          setIsGameOverOpen(true);
        }
        return {
          ...prev,
          health: Math.max(0, nextHealth),
          isInvulnerable: true,
        };
      });

      setTimeout(() => {
        setPlayer((prev) => ({ ...prev, isInvulnerable: false }));
      }, 1200);
    }
  }, [currentLevel.sentries, player.x, player.y, player.isInvulnerable, screen, isVictoryOpen, isGameOverOpen, addFloatingNote]);

  // Check spike collision on step or when spike emerges under player
  useEffect(() => {
    if (screen !== 'PLAYING' || isVictoryOpen || isGameOverOpen) return;

    const standingSpike = currentLevel.spikes.find(
      (sp) => sp.x === player.x && sp.y === player.y && sp.isActive
    );

    if (standingSpike && !player.isInvulnerable) {
      sounds.playSpikeTrap();
      sounds.playHurt();
      addFloatingNote('Spikes! -1 HP', player.x, player.y, '#ef4444');

      setPlayer((prev) => {
        const nextHealth = prev.health - 1;
        if (nextHealth <= 0) {
          sounds.playDefeat();
          setIsGameOverOpen(true);
        }
        return {
          ...prev,
          health: Math.max(0, nextHealth),
          isInvulnerable: true,
        };
      });

      setTimeout(() => {
        setPlayer((prev) => ({ ...prev, isInvulnerable: false }));
      }, 1200);
    }
  }, [currentLevel.spikes, player.x, player.y, player.isInvulnerable, screen, isVictoryOpen, isGameOverOpen, addFloatingNote]);

  // Recalculate pressure plates (triggered by player or blocks)
  const updatePressurePlates = useCallback((
    lvl: LevelData,
    plX: number,
    plY: number,
    blocksList: { x: number; y: number }[]
  ): LevelData => {
    if (lvl.plates.length === 0) return lvl;

    let platesChanged = false;
    const newPlates = lvl.plates.map((plate) => {
      const isPlayerOn = plate.x === plX && plate.y === plY;
      const isBlockOn = blocksList.some((b) => b.x === plate.x && b.y === plate.y);
      const isPressed = isPlayerOn || isBlockOn;

      if (isPressed !== plate.isPressed) {
        platesChanged = true;
        sounds.playPressurePlate(isPressed);
        return { ...plate, isPressed };
      }
      return plate;
    });

    if (!platesChanged) return lvl;

    // Update targeted barriers
    const updatedBarriers = lvl.barriers.map((bar) => {
      // Find all plates that target this barrier
      const controllingPlates = newPlates.filter((p) => p.targetIds.includes(bar.id));
      if (controllingPlates.length > 0) {
        // If all controlling plates are pressed, barrier opens!
        const allPressed = controllingPlates.every((p) => p.isPressed);
        return { ...bar, isOpen: allPressed };
      }
      return bar;
    });

    return {
      ...lvl,
      plates: newPlates,
      barriers: updatedBarriers,
    };
  }, []);

  // Level Clear Handler
  const handleLevelClear = useCallback(() => {
    sounds.playVictory();

    // Calculate stars
    // 1 Star: finished
    // 2 Stars: got all gems
    // 3 Stars: par steps or par time
    const uncollectedGems = currentLevel.collectibles.filter(
      (c) => (c.type.startsWith('GEM_') || c.type === 'CHEST') && !c.collected
    ).length;

    let earnedStars = 1;
    if (uncollectedGems === 0) earnedStars++;
    if (player.steps <= currentLevel.parSteps || elapsedSeconds <= currentLevel.parTimeSeconds) {
      earnedStars++;
    }

    // Update progress state
    const currentProg = progress[currentLevelId] || {
      unlocked: true,
      completed: true,
      stars: 0,
      bestTime: 9999,
      bestSteps: 9999,
      highScore: 0,
    };

    const nextLevelId = currentLevelId + 1;
    const nextProg = progress[nextLevelId] || {
      unlocked: true,
      completed: false,
      stars: 0,
      bestTime: 0,
      bestSteps: 0,
      highScore: 0,
    };

    const updatedProgress = {
      ...progress,
      [currentLevelId]: {
        unlocked: true,
        completed: true,
        stars: Math.max(currentProg.stars, earnedStars),
        bestTime: currentProg.bestTime > 0 ? Math.min(currentProg.bestTime, elapsedSeconds) : elapsedSeconds,
        bestSteps: currentProg.bestSteps > 0 ? Math.min(currentProg.bestSteps, player.steps) : player.steps,
        highScore: Math.max(currentProg.highScore, player.score),
      },
      ...(nextLevelId <= LEVELS.length
        ? {
            [nextLevelId]: {
              ...nextProg,
              unlocked: true,
            },
          }
        : {}),
    };

    saveProgress(updatedProgress);
    setIsVictoryOpen(true);
  }, [currentLevel, currentLevelId, elapsedSeconds, player.score, player.steps, progress, saveProgress]);

  // Primary Movement & Interaction Logic
  const handleMove = useCallback((dir: Direction) => {
    if (screen !== 'PLAYING' || isPaused || isVictoryOpen || isGameOverOpen) return;

    let dx = 0;
    let dy = 0;
    if (dir === 'up') dy = -1;
    if (dir === 'down') dy = 1;
    if (dir === 'left') dx = -1;
    if (dir === 'right') dx = 1;

    const targetX = player.x + dx;
    const targetY = player.y + dy;

    // Check bounds
    if (
      targetX < 0 ||
      targetX >= currentLevel.width ||
      targetY < 0 ||
      targetY >= currentLevel.height
    ) {
      return;
    }

    const tile = currentLevel.map[targetY][targetX];

    // Check Wall or Chasm
    if (tile === 'WALL' || tile === 'CHASM' || tile === 'EMPTY') {
      setPlayer((prev) => ({ ...prev, direction: dir }));
      return;
    }

    // Check Barriers (forcefield/gates)
    const barrier = currentLevel.barriers.find((b) => b.x === targetX && b.y === targetY);
    if (barrier && !barrier.isOpen) {
      addFloatingNote('Barrier Active!', targetX, targetY, '#ef4444');
      setPlayer((prev) => ({ ...prev, direction: dir }));
      return;
    }

    // Check Locked Doors
    if (tile === 'DOOR_BRONZE') {
      if (player.keys.bronze > 0) {
        sounds.playDoorOpen();
        addFloatingNote('Bronze Gate Unlocked!', targetX, targetY, '#d97706');

        // Transform door tile to FLOOR
        const newMap = currentLevel.map.map((row, rIdx) =>
          row.map((cell, cIdx) => (rIdx === targetY && cIdx === targetX ? 'FLOOR' : cell))
        );
        setCurrentLevel((prev) => ({ ...prev, map: newMap }));

        setPlayer((prev) => ({
          ...prev,
          x: targetX,
          y: targetY,
          direction: dir,
          steps: prev.steps + 1,
          score: prev.score + 50,
          keys: { ...prev.keys, bronze: prev.keys.bronze - 1 },
        }));
        return;
      } else {
        addFloatingNote('Needs Bronze Key!', targetX, targetY, '#f59e0b');
        setPlayer((prev) => ({ ...prev, direction: dir }));
        return;
      }
    }

    if (tile === 'DOOR_SILVER') {
      if (player.keys.silver > 0) {
        sounds.playDoorOpen();
        addFloatingNote('Silver Gate Unlocked!', targetX, targetY, '#cbd5e1');

        const newMap = currentLevel.map.map((row, rIdx) =>
          row.map((cell, cIdx) => (rIdx === targetY && cIdx === targetX ? 'FLOOR' : cell))
        );
        setCurrentLevel((prev) => ({ ...prev, map: newMap }));

        setPlayer((prev) => ({
          ...prev,
          x: targetX,
          y: targetY,
          direction: dir,
          steps: prev.steps + 1,
          score: prev.score + 100,
          keys: { ...prev.keys, silver: prev.keys.silver - 1 },
        }));
        return;
      } else {
        addFloatingNote('Needs Silver Key!', targetX, targetY, '#cbd5e1');
        setPlayer((prev) => ({ ...prev, direction: dir }));
        return;
      }
    }

    if (tile === 'DOOR_GOLD') {
      if (player.keys.gold > 0) {
        sounds.playDoorOpen();
        addFloatingNote('Vault Gate Unlocked!', targetX, targetY, '#eab308');

        const newMap = currentLevel.map.map((row, rIdx) =>
          row.map((cell, cIdx) => (rIdx === targetY && cIdx === targetX ? 'FLOOR' : cell))
        );
        setCurrentLevel((prev) => ({ ...prev, map: newMap }));

        setPlayer((prev) => ({
          ...prev,
          x: targetX,
          y: targetY,
          direction: dir,
          steps: prev.steps + 1,
          score: prev.score + 250,
          keys: { ...prev.keys, gold: prev.keys.gold - 1 },
        }));
        return;
      } else {
        addFloatingNote('Needs Gold Key!', targetX, targetY, '#eab308');
        setPlayer((prev) => ({ ...prev, direction: dir }));
        return;
      }
    }

    // Check Pushable Blocks
    const blockIndex = currentLevel.blocks.findIndex((b) => b.x === targetX && b.y === targetY);
    if (blockIndex !== -1) {
      // Trying to push block!
      const blockTargetX = targetX + dx;
      const blockTargetY = targetY + dy;

      // Check if block landing cell is valid
      const targetTile = currentLevel.map[blockTargetY]?.[blockTargetX];
      const isTargetWall = !targetTile || targetTile === 'WALL' || targetTile === 'CHASM' || targetTile.startsWith('DOOR_');
      const isTargetBarrier = currentLevel.barriers.some((b) => b.x === blockTargetX && b.y === blockTargetY && !b.isOpen);
      const isTargetAnotherBlock = currentLevel.blocks.some((b) => b.x === blockTargetX && b.y === blockTargetY);

      if (isTargetWall || isTargetBarrier || isTargetAnotherBlock) {
        // Block cannot be pushed there
        setPlayer((prev) => ({ ...prev, direction: dir }));
        return;
      }

      // Successful push!
      sounds.playBlockPush();
      const updatedBlocks = currentLevel.blocks.map((b, idx) =>
        idx === blockIndex ? { ...b, x: blockTargetX, y: blockTargetY } : b
      );

      // Advance player into block's former spot
      sounds.playStep();

      let nextLevelState: LevelData = {
        ...currentLevel,
        blocks: updatedBlocks,
      };

      // Update pressure plates
      nextLevelState = updatePressurePlates(nextLevelState, targetX, targetY, updatedBlocks);
      setCurrentLevel(nextLevelState);

      setPlayer((prev) => ({
        ...prev,
        x: targetX,
        y: targetY,
        direction: dir,
        steps: prev.steps + 1,
      }));
      return;
    }

    // Clear step!
    sounds.playStep();

    // Check Collectibles
    const colIndex = currentLevel.collectibles.findIndex(
      (c) => c.x === targetX && c.y === targetY && !c.collected
    );

    let nextPlayer = {
      ...player,
      x: targetX,
      y: targetY,
      direction: dir,
      steps: player.steps + 1,
    };

    if (colIndex !== -1) {
      const col = currentLevel.collectibles[colIndex];
      const updatedCollectibles = currentLevel.collectibles.map((c, idx) =>
        idx === colIndex ? { ...c, collected: true } : c
      );

      if (col.type === 'GEM_RUBY' || col.type === 'GEM_EMERALD' || col.type === 'GEM_SAPPHIRE') {
        sounds.playGem();
        const pts = col.value || 100;
        addFloatingNote(`+${pts} 💎`, targetX, targetY, '#38bdf8');
        nextPlayer.score += pts;
        nextPlayer.gems += 1;
      } else if (col.type === 'KEY_BRONZE') {
        sounds.playKey();
        addFloatingNote('+1 Bronze Key', targetX, targetY, '#d97706');
        nextPlayer.keys.bronze += 1;
        nextPlayer.score += 50;
      } else if (col.type === 'KEY_SILVER') {
        sounds.playKey();
        addFloatingNote('+1 Silver Key', targetX, targetY, '#cbd5e1');
        nextPlayer.keys.silver += 1;
        nextPlayer.score += 100;
      } else if (col.type === 'KEY_GOLD') {
        sounds.playKey();
        addFloatingNote('+1 Gold Key', targetX, targetY, '#eab308');
        nextPlayer.keys.gold += 1;
        nextPlayer.score += 200;
      } else if (col.type === 'POTION') {
        sounds.playPotion();
        addFloatingNote('+1 Heart Restored', targetX, targetY, '#ec4899');
        nextPlayer.health = Math.min(nextPlayer.maxHealth, nextPlayer.health + 1);
        nextPlayer.score += 75;
      } else if (col.type === 'CHEST') {
        sounds.playChestOpen();
        const chestBonus = col.value || 300;
        addFloatingNote(`Secret Vault! +${chestBonus}`, targetX, targetY, '#f59e0b');
        nextPlayer.score += chestBonus;
      } else if (col.type === 'RELIC') {
        sounds.playVictory();
        addFloatingNote('Ancient Relic Secured!', targetX, targetY, '#38bdf8');
        nextPlayer.hasRelic = true;
        nextPlayer.score += 1000;
      }

      setCurrentLevel((prev) => ({
        ...prev,
        collectibles: updatedCollectibles,
      }));
    }

    // Check Tablet
    if (tile === 'TABLET') {
      const tablet = currentLevel.tablets.find((t) => t.x === targetX && t.y === targetY);
      if (tablet) {
        sounds.playTabletRead();
        setActiveTablet(tablet);
      }
    }

    // Check Pressure plates
    const nextLevelState = updatePressurePlates(
      currentLevel,
      targetX,
      targetY,
      currentLevel.blocks
    );
    setCurrentLevel(nextLevelState);

    // Apply player state
    setPlayer(nextPlayer);

    // Check Exit Tile
    if (tile === 'EXIT') {
      handleLevelClear();
    }
  }, [
    currentLevel,
    player,
    screen,
    isPaused,
    isVictoryOpen,
    isGameOverOpen,
    updatePressurePlates,
    addFloatingNote,
    handleLevelClear,
  ]);

  // Click on tile -> A* pathfinding
  const handleTileClick = useCallback((target: Position) => {
    if (screen !== 'PLAYING' || isPaused || isVictoryOpen || isGameOverOpen) return;

    const path = findPath(
      { x: player.x, y: player.y },
      target,
      currentLevel.map,
      currentLevel.barriers,
      currentLevel.blocks,
      player.keys
    );

    if (path.length > 0) {
      pathQueueRef.current = path;
    }
  }, [currentLevel, player, screen, isPaused, isVictoryOpen, isGameOverOpen]);

  // Path execution runner
  useEffect(() => {
    if (screen !== 'PLAYING' || isPaused || isVictoryOpen || isGameOverOpen) return;

    const interval = setInterval(() => {
      if (pathQueueRef.current.length > 0) {
        const nextStep = pathQueueRef.current.shift()!;
        let dir: Direction = 'down';
        if (nextStep.x > player.x) dir = 'right';
        else if (nextStep.x < player.x) dir = 'left';
        else if (nextStep.y < player.y) dir = 'up';
        else if (nextStep.y > player.y) dir = 'down';

        handleMove(dir);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [player, handleMove, screen, isPaused, isVictoryOpen, isGameOverOpen]);

  // Handle adjacent interaction (Levers, Tablets, Chests)
  const handleInteract = useCallback(() => {
    if (screen !== 'PLAYING' || isPaused || isVictoryOpen || isGameOverOpen) return;

    const adjacent = [
      { x: player.x, y: player.y - 1 },
      { x: player.x, y: player.y + 1 },
      { x: player.x - 1, y: player.y },
      { x: player.x + 1, y: player.y },
    ];

    // Check switches
    const targetSwitch = currentLevel.switches.find((s) =>
      adjacent.some((a) => a.x === s.x && a.y === s.y)
    );

    if (targetSwitch) {
      sounds.playLever();
      const newIsOn = !targetSwitch.isOn;

      // Update spikes or barriers controlled by switch
      const updatedSpikes = currentLevel.spikes.map((spike) => {
        if (targetSwitch.targetIds.includes(spike.id)) {
          return { ...spike, isActive: !newIsOn };
        }
        return spike;
      });

      const updatedBarriers = currentLevel.barriers.map((bar) => {
        if (targetSwitch.targetIds.includes(bar.id)) {
          return { ...bar, isOpen: newIsOn };
        }
        return bar;
      });

      const updatedSwitches = currentLevel.switches.map((s) =>
        s.id === targetSwitch.id ? { ...s, isOn: newIsOn } : s
      );

      setCurrentLevel((prev) => ({
        ...prev,
        switches: updatedSwitches,
        spikes: updatedSpikes,
        barriers: updatedBarriers,
      }));

      addFloatingNote(newIsOn ? 'Mechanism Activated!' : 'Mechanism Reset', targetSwitch.x, targetSwitch.y, '#10b981');
      return;
    }

    // Check tablets
    const targetTablet = currentLevel.tablets.find((t) =>
      adjacent.some((a) => a.x === t.x && a.y === t.y)
    );

    if (targetTablet) {
      sounds.playTabletRead();
      setActiveTablet(targetTablet);
      return;
    }

    // Check unopened chests
    const targetChest = currentLevel.collectibles.find(
      (c) => c.type === 'CHEST' && !c.collected && adjacent.some((a) => a.x === c.x && a.y === c.y)
    );

    if (targetChest) {
      sounds.playChestOpen();
      const bonus = targetChest.value || 300;
      addFloatingNote(`Secret Chest! +${bonus}`, targetChest.x, targetChest.y, '#f59e0b');

      setCurrentLevel((prev) => ({
        ...prev,
        collectibles: prev.collectibles.map((c) =>
          c.id === targetChest.id ? { ...c, collected: true } : c
        ),
      }));

      setPlayer((prev) => ({
        ...prev,
        score: prev.score + bonus,
      }));
      return;
    }
  }, [currentLevel, player, screen, isPaused, isVictoryOpen, isGameOverOpen, addFloatingNote]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        pathQueueRef.current = [];
        handleMove('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        pathQueueRef.current = [];
        handleMove('down');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        pathQueueRef.current = [];
        handleMove('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        pathQueueRef.current = [];
        handleMove('right');
      } else if (e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleInteract();
      } else if (e.key === 'Escape') {
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, handleInteract]);

  // Can player interact with anything nearby?
  const isAdjacentToInteractable = () => {
    const adjacent = [
      { x: player.x, y: player.y - 1 },
      { x: player.x, y: player.y + 1 },
      { x: player.x - 1, y: player.y },
      { x: player.x + 1, y: player.y },
    ];

    const hasSwitch = currentLevel.switches.some((s) => adjacent.some((a) => a.x === s.x && a.y === s.y));
    const hasTablet = currentLevel.tablets.some((t) => adjacent.some((a) => a.x === t.x && a.y === t.y));
    const hasChest = currentLevel.collectibles.some((c) => c.type === 'CHEST' && !c.collected && adjacent.some((a) => a.x === c.x && a.y === c.y));

    return hasSwitch || hasTablet || hasChest;
  };

  // Calculate current stars for victory modal
  const calculateStars = () => {
    const uncollected = currentLevel.collectibles.filter(
      (c) => (c.type.startsWith('GEM_') || c.type === 'CHEST') && !c.collected
    ).length;
    let s = 1;
    if (uncollected === 0) s++;
    if (player.steps <= currentLevel.parSteps || elapsedSeconds <= currentLevel.parTimeSeconds) s++;
    return s;
  };

  // Calculate hover explanation for InspectorBar
  const hoverExplanation = hoveredPos ? inspectTile(hoveredPos, currentLevel, player) : null;

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans p-2 sm:p-4">
      {/* Top Bar Contract (Clean single row: Brand wordmark, nav links, sound action) */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3 border-b border-slate-700/80 bg-slate-900/90 backdrop-blur-md rounded-xl max-w-6xl w-full mx-auto mb-3">
        <button
          onClick={() => setScreen('START_MENU')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-amber-400 transition"
        >
          MazeQuest Mini
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setScreen('START_MENU')}
            className={`transition whitespace-nowrap shrink-0 hover:text-white ${
              screen === 'START_MENU' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Quest Home
          </button>
          <button
            onClick={() => setIsLevelSelectOpen(true)}
            className="transition whitespace-nowrap shrink-0 hover:text-white"
          >
            Dungeon Levels
          </button>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="transition whitespace-nowrap shrink-0 hover:text-white"
          >
            Explorer Guide
          </button>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          {screen === 'PLAYING' && (
            <button
              onClick={() => initLevel(currentLevelId)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700 whitespace-nowrap shrink-0 shadow-sm"
            >
              Reset Floor
            </button>
          )}

          <button
            onClick={handleToggleSound}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition whitespace-nowrap shrink-0 shadow-sm"
          >
            {soundMuted ? 'Audio Off' : 'Audio On'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto py-2">
        {screen === 'START_MENU' ? (
          <StartMenu
            onStartQuest={handleStartQuest}
            onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
          />
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            {/* Game HUD */}
            <GameHUD
              level={currentLevel}
              player={player}
              elapsedSeconds={elapsedSeconds}
              soundMuted={soundMuted}
              onToggleSound={handleToggleSound}
              onResetLevel={() => initLevel(currentLevelId)}
              onOpenHelp={() => setIsGuideOpen(true)}
              onTogglePause={() => setIsPaused((p) => !p)}
              isPaused={isPaused}
              onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
              brightMode={brightMode}
              onToggleBrightMode={handleToggleBrightMode}
            />

            {/* Interactive Dungeon Viewport */}
            <div className="relative w-full flex justify-center">
              <DungeonCanvas
                level={currentLevel}
                player={player}
                onTileClick={handleTileClick}
                onInteractAdjacent={handleInteract}
                floatingNotes={floatingNotes}
                isPaused={isPaused}
                onHoverTile={(pos) => setHoveredPos(pos)}
                brightMode={brightMode}
              />

              {/* Pause Overlay */}
              {isPaused && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm rounded-xl">
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center max-w-xs shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">Expedition Paused</h3>
                    <p className="text-xs text-slate-400 mb-4">Take a breath, study the layout, or resume when ready.</p>
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow"
                    >
                      Resume Quest
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hover-over Item/Obstacle Inspector Bar */}
            <InspectorBar
              explanation={hoverExplanation}
              hoveredPos={hoveredPos}
            />

            {/* Virtual Controls for On-Screen / Touch / Click interaction */}
            <VirtualControls
              onMove={handleMove}
              onInteract={handleInteract}
              canInteract={isAdjacentToInteractable()}
              interactLabel={isAdjacentToInteractable() ? 'Use / Read' : 'Interact'}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-4 pt-3 pb-2 border-t border-slate-900 text-center text-xs text-slate-500">
        <span>MazeQuest Mini · 2D Dungeon Puzzle Adventure · High-School+ First Release</span>
      </footer>

      {/* Modals */}
      {isVictoryOpen && (
        <VictoryModal
          levelId={currentLevelId}
          levelTitle={currentLevel.title}
          steps={player.steps}
          parSteps={currentLevel.parSteps}
          elapsedSeconds={elapsedSeconds}
          parTimeSeconds={currentLevel.parTimeSeconds}
          gemsCollected={player.gems}
          totalGems={
            currentLevel.collectibles.filter((c) => c.type.startsWith('GEM_')).length
          }
          score={player.score}
          stars={calculateStars()}
          hasNextLevel={currentLevelId < LEVELS.length}
          onNextLevel={() => handleSelectLevel(currentLevelId + 1)}
          onReplay={() => initLevel(currentLevelId)}
          onLevelSelect={() => {
            setIsVictoryOpen(false);
            setIsLevelSelectOpen(true);
          }}
        />
      )}

      {isGameOverOpen && (
        <GameOverModal
          onRetry={() => initLevel(currentLevelId)}
          onLevelSelect={() => {
            setIsGameOverOpen(false);
            setIsLevelSelectOpen(true);
          }}
        />
      )}

      {isLevelSelectOpen && (
        <LevelSelectModal
          levels={LEVELS}
          currentLevelId={currentLevelId}
          progress={progress}
          onSelectLevel={handleSelectLevel}
          onClose={() => setIsLevelSelectOpen(false)}
        />
      )}

      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}

      {activeTablet && (
        <TabletModal tablet={activeTablet} onClose={() => setActiveTablet(null)} />
      )}
    </div>
  );
}
