/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  LevelData,
  PlayerState,
  Position,
} from '../types/game';
import { inspectTile, TileExplanation } from '../utils/tileInspector';

interface FloatingNotification {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  life: number;
}

interface DungeonCanvasProps {
  level: LevelData;
  player: PlayerState;
  onTileClick: (pos: Position) => void;
  onInteractAdjacent: () => void;
  floatingNotes: FloatingNotification[];
  isPaused: boolean;
  onHoverTile?: (pos: Position | null) => void;
  brightMode?: boolean;
}

const TILE_SIZE = 48; // Base pixel size per grid cell

export const DungeonCanvas: React.FC<DungeonCanvasProps> = ({
  level,
  player,
  onTileClick,
  onInteractAdjacent,
  floatingNotes,
  isPaused,
  onHoverTile,
  brightMode = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Hover state
  const [hoverPos, setHoverPos] = useState<Position | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{
    explanation: TileExplanation;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Smooth render position of player
  const playerRenderPos = useRef<{ x: number; y: number }>({ x: player.x, y: player.y });
  const walkBob = useRef<number>(0);
  const torchTime = useRef<number>(0);

  // Keep playerRenderPos transitioning towards player.x, player.y smoothly
  useEffect(() => {
    const dx = Math.abs(playerRenderPos.current.x - player.x);
    const dy = Math.abs(playerRenderPos.current.y - player.y);
    if (dx > 2 || dy > 2) {
      playerRenderPos.current = { x: player.x, y: player.y };
    }
  }, [player.x, player.y]);

  // Mouse Move / Hover Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const gridX = Math.floor(clickX / TILE_SIZE);
    const gridY = Math.floor(clickY / TILE_SIZE);

    if (gridX >= 0 && gridX < level.width && gridY >= 0 && gridY < level.height) {
      const pos = { x: gridX, y: gridY };
      setHoverPos(pos);
      if (onHoverTile) onHoverTile(pos);

      // Compute explanation
      const explanation = inspectTile(pos, level, player);
      if (explanation) {
        setHoverTooltip({
          explanation,
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
        });
      } else {
        setHoverTooltip(null);
      }
    } else {
      setHoverPos(null);
      setHoverTooltip(null);
      if (onHoverTile) onHoverTile(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
    setHoverTooltip(null);
    if (onHoverTile) onHoverTile(null);
  };

  // Click / Pointer event handler on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const gridX = Math.floor(clickX / TILE_SIZE);
    const gridY = Math.floor(clickY / TILE_SIZE);

    if (gridX >= 0 && gridX < level.width && gridY >= 0 && gridY < level.height) {
      // Check if clicking directly adjacent interactable (e.g. switch, tablet, chest)
      const dist = Math.abs(player.x - gridX) + Math.abs(player.y - gridY);
      if (dist === 1) {
        const isSwitch = level.switches.some((s) => s.x === gridX && s.y === gridY);
        const isTablet = level.tablets.some((t) => t.x === gridX && t.y === gridY);
        const isChest = level.collectibles.some((c) => c.x === gridX && c.y === gridY && c.type === 'CHEST' && !c.collected);
        if (isSwitch || isTablet || isChest) {
          onInteractAdjacent();
          return;
        }
      }
      onTileClick({ x: gridX, y: gridY });
    }
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      torchTime.current += dt;

      // Smooth player interpolation
      const lerpSpeed = 16;
      playerRenderPos.current.x += (player.x - playerRenderPos.current.x) * Math.min(1, dt * lerpSpeed);
      playerRenderPos.current.y += (player.y - playerRenderPos.current.y) * Math.min(1, dt * lerpSpeed);

      const moving =
        Math.abs(player.x - playerRenderPos.current.x) > 0.02 ||
        Math.abs(player.y - playerRenderPos.current.y) > 0.02;

      if (moving) {
        walkBob.current += dt * 14;
      } else {
        walkBob.current = Math.sin(torchTime.current * 3) * 0.5;
      }

      // Clear Canvas with warm stone background
      ctx.fillStyle = brightMode ? '#1e293b' : '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Dungeon Floor & Wall Tiles
      for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
          const tile = level.map[y][x];
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;

          if (tile === 'WALL') {
            // Bright, textured stone masonry wall with clear 3D bevels
            ctx.fillStyle = brightMode ? '#475569' : '#334155';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // Brick highlight lines (top & middle)
            ctx.fillStyle = brightMode ? '#64748b' : '#475569';
            ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, 3);
            ctx.fillRect(px + 2, py + TILE_SIZE / 2, TILE_SIZE - 4, 2);

            // Brick base shadow
            ctx.fillStyle = brightMode ? '#334155' : '#1e293b';
            ctx.fillRect(px, py + TILE_SIZE - 5, TILE_SIZE, 5);

            // Mortar joints
            ctx.fillStyle = brightMode ? '#334155' : '#1e293b';
            ctx.fillRect(px + TILE_SIZE / 2, py + 2, 2, TILE_SIZE / 2 - 2);
            ctx.fillRect(px + TILE_SIZE / 4, py + TILE_SIZE / 2, 2, TILE_SIZE / 2 - 5);
            ctx.fillRect(px + (TILE_SIZE * 3) / 4, py + TILE_SIZE / 2, 2, TILE_SIZE / 2 - 5);

            // Top rim highlight for extra depth
            ctx.fillStyle = brightMode ? '#94a3b8' : '#64748b';
            ctx.fillRect(px + 1, py + 1, TILE_SIZE - 2, 1);

            // Ancient moss accent
            if ((x + y * 7) % 5 === 0) {
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(px + 4, py + 8, 8, 4);
            }
          } else if (tile === 'CHASM') {
            // Dark cavern pit
            ctx.fillStyle = '#090d16';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          } else {
            // Bright, clearly visible Walkable Floor Flagstone
            const isAlt = (x + y) % 2 === 0;
            ctx.fillStyle = brightMode
              ? (isAlt ? '#2d3b53' : '#33445e')
              : (isAlt ? '#1e293b' : '#243047');
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // Flagstone tile borders
            ctx.strokeStyle = brightMode ? '#475569' : '#334155';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

            // Clean stone paver fleck accents
            if ((x * 3 + y * 5) % 7 === 0) {
              ctx.fillStyle = brightMode ? '#64748b' : '#475569';
              ctx.fillRect(px + 12, py + 14, 5, 2);
            }
          }

          // START Tile
          if (tile === 'START') {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ENTRY', px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 4);
          }

          // EXIT Tile
          if (tile === 'EXIT') {
            const glow = Math.sin(torchTime.current * 4) * 0.2 + 0.8;
            ctx.fillStyle = `rgba(245, 158, 11, ${0.3 * glow})`;
            ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);

            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);

            // Golden stairs
            ctx.fillStyle = '#d97706';
            ctx.fillRect(px + 8, py + 10, TILE_SIZE - 16, 5);
            ctx.fillRect(px + 11, py + 18, TILE_SIZE - 22, 5);
            ctx.fillRect(px + 14, py + 26, TILE_SIZE - 28, 5);

            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('EXIT', px + TILE_SIZE / 2, py + TILE_SIZE - 7);
          }

          // LOCKED DOORS
          if (tile === 'DOOR_BRONZE' || tile === 'DOOR_SILVER' || tile === 'DOOR_GOLD') {
            const isBronze = tile === 'DOOR_BRONZE';
            const isSilver = tile === 'DOOR_SILVER';
            const color = isBronze ? '#f59e0b' : isSilver ? '#e2e8f0' : '#fbbf24';
            const darkColor = isBronze ? '#78350f' : isSilver ? '#475569' : '#854d0e';

            // Door frame
            ctx.fillStyle = darkColor;
            ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);

            // Door vertical bars
            ctx.fillStyle = color;
            ctx.fillRect(px + 10, py + 6, 4, TILE_SIZE - 12);
            ctx.fillRect(px + 22, py + 6, 4, TILE_SIZE - 12);
            ctx.fillRect(px + 34, py + 6, 4, TILE_SIZE - 12);

            // Keyhole
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2 - 2, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(px + TILE_SIZE / 2 - 2.5, py + TILE_SIZE / 2, 5, 6);
          }

          // TABLET (Ancient Inscribed Lore Pillar)
          if (tile === 'TABLET') {
            ctx.fillStyle = '#475569';
            ctx.fillRect(px + 8, py + 6, TILE_SIZE - 16, TILE_SIZE - 12);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 8, py + 6, TILE_SIZE - 16, TILE_SIZE - 12);

            // Glowing blue rune lines
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(px + 14, py + 14, TILE_SIZE - 28, 2.5);
            ctx.fillRect(px + 14, py + 20, TILE_SIZE - 28, 2.5);
            ctx.fillRect(px + 14, py + 26, TILE_SIZE - 28, 2.5);
          }
        }
      }

      // 2. Draw Dynamic Pressure Plates
      for (const plate of level.plates) {
        const px = plate.x * TILE_SIZE;
        const py = plate.y * TILE_SIZE;

        if (plate.isPressed) {
          // Depressed glowing rune plate
          ctx.fillStyle = '#065f46';
          ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(px + 5, py + 5, TILE_SIZE - 10, TILE_SIZE - 10);

          ctx.fillStyle = '#34d399';
          ctx.fillRect(px + 16, py + 16, TILE_SIZE - 32, TILE_SIZE - 32);
        } else {
          // Raised unpressed plate
          ctx.fillStyle = '#334155';
          ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);

          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 14, py + 14, TILE_SIZE - 28, TILE_SIZE - 28);
        }
      }

      // 3. Draw Dynamic Barriers
      for (const barrier of level.barriers) {
        const px = barrier.x * TILE_SIZE;
        const py = barrier.y * TILE_SIZE;

        if (barrier.isOpen) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = '#581c87';
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);

          ctx.fillStyle = '#e9d5ff';
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(px + 8 + i * 9, py + 8, 3, TILE_SIZE - 16);
          }
        }
      }

      // 4. Draw Switches / Levers
      for (const sw of level.switches) {
        const px = sw.x * TILE_SIZE;
        const py = sw.y * TILE_SIZE;

        // Base plate
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Lever arm
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = sw.isOn ? '#10b981' : '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        if (sw.isOn) {
          ctx.lineTo(px + TILE_SIZE / 2 + 11, py + TILE_SIZE / 2 - 13);
        } else {
          ctx.lineTo(px + TILE_SIZE / 2 - 11, py + TILE_SIZE / 2 + 13);
        }
        ctx.stroke();

        // Lever knob
        ctx.fillStyle = sw.isOn ? '#34d399' : '#fb7185';
        ctx.beginPath();
        if (sw.isOn) {
          ctx.arc(px + TILE_SIZE / 2 + 11, py + TILE_SIZE / 2 - 13, 5.5, 0, Math.PI * 2);
        } else {
          ctx.arc(px + TILE_SIZE / 2 - 11, py + TILE_SIZE / 2 + 13, 5.5, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // 5. Draw Spike Traps
      for (const spike of level.spikes) {
        const px = spike.x * TILE_SIZE;
        const py = spike.y * TILE_SIZE;

        // Trap grate
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);

        // Holes / Spikes
        for (let ix = 0; ix < 3; ix++) {
          for (let iy = 0; iy < 3; iy++) {
            const hx = px + 12 + ix * 12;
            const hy = py + 12 + iy * 12;

            if (spike.isActive) {
              ctx.fillStyle = '#cbd5e1';
              ctx.beginPath();
              ctx.moveTo(hx, hy - 9);
              ctx.lineTo(hx - 4, hy + 4);
              ctx.lineTo(hx + 4, hy + 4);
              ctx.closePath();
              ctx.fill();

              // Gleam
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(hx - 1, hy - 9, 2, 4);
            } else {
              ctx.fillStyle = '#0f172a';
              ctx.beginPath();
              ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // 6. Draw Collectibles
      for (const col of level.collectibles) {
        if (col.collected) continue;
        const px = col.x * TILE_SIZE;
        const py = col.y * TILE_SIZE;
        const bounce = Math.sin(torchTime.current * 4 + col.x + col.y) * 3;

        if (col.type === 'GEM_RUBY' || col.type === 'GEM_EMERALD' || col.type === 'GEM_SAPPHIRE') {
          const isRuby = col.type === 'GEM_RUBY';
          const isEmerald = col.type === 'GEM_EMERALD';
          const fill = isRuby ? '#f43f5e' : isEmerald ? '#10b981' : '#38bdf8';
          const highlight = isRuby ? '#fecdd3' : isEmerald ? '#a7f3d0' : '#bae6fd';

          const cx = px + TILE_SIZE / 2;
          const cy = py + TILE_SIZE / 2 + bounce;
          const r = 11;

          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.moveTo(cx, cy - r);
          ctx.lineTo(cx + r, cy);
          ctx.lineTo(cx, cy + r);
          ctx.lineTo(cx - r, cy);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Reflection
          ctx.fillStyle = highlight;
          ctx.beginPath();
          ctx.moveTo(cx - 2, cy - r + 3);
          ctx.lineTo(cx + 4, cy - 2);
          ctx.lineTo(cx - 2, cy + 2);
          ctx.closePath();
          ctx.fill();
        } else if (col.type === 'KEY_BRONZE' || col.type === 'KEY_SILVER' || col.type === 'KEY_GOLD') {
          const isBronze = col.type === 'KEY_BRONZE';
          const isSilver = col.type === 'KEY_SILVER';
          const color = isBronze ? '#f59e0b' : isSilver ? '#f1f5f9' : '#fbbf24';

          const cx = px + TILE_SIZE / 2;
          const cy = py + TILE_SIZE / 2 + bounce;

          ctx.strokeStyle = color;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(cx - 5, cy, 6.5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.fillRect(cx + 1, cy - 2, 11, 4);
          ctx.fillRect(cx + 7, cy + 2, 3, 5);
          ctx.fillRect(cx + 12, cy + 2, 3, 6);
        } else if (col.type === 'POTION') {
          const cx = px + TILE_SIZE / 2;
          const cy = py + TILE_SIZE / 2 + bounce;

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(cx, cy + 4, 8.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fca5a5';
          ctx.fillRect(cx - 3, cy - 7, 6, 6);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(cx - 4, cy - 10, 8, 3.5);
        } else if (col.type === 'CHEST') {
          const cx = px + 7;
          const cy = py + 12 + bounce;

          ctx.fillStyle = '#92400e';
          ctx.fillRect(cx, cy, 34, 25);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(cx, cy, 34, 25);

          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx, cy + 8, 34, 3.5);
          ctx.fillRect(cx + 15, cy + 7, 5, 7);
        } else if (col.type === 'RELIC') {
          const cx = px + TILE_SIZE / 2;
          const cy = py + TILE_SIZE / 2 + bounce;

          const aura = Math.sin(torchTime.current * 5) * 5 + 16;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.beginPath();
          ctx.arc(cx, cy, aura, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = cx + Math.cos(angle) * 12;
            const y = cy + Math.sin(angle) * 12;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. Draw Pushable Stone Blocks
      for (const block of level.blocks) {
        const px = block.x * TILE_SIZE;
        const py = block.y * TILE_SIZE;

        ctx.fillStyle = '#475569';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, 5);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(px + 5, py + 5, TILE_SIZE - 10, TILE_SIZE - 10);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + TILE_SIZE / 2, py + 12);
        ctx.lineTo(px + TILE_SIZE / 2, py + TILE_SIZE - 12);
        ctx.moveTo(px + 12, py + TILE_SIZE / 2);
        ctx.lineTo(px + TILE_SIZE - 12, py + TILE_SIZE / 2);
        ctx.stroke();
      }

      // 8. Draw Patrolling Sentries
      if (level.sentries) {
        for (const sentry of level.sentries) {
          const px = sentry.x * TILE_SIZE + TILE_SIZE / 2;
          const py = sentry.y * TILE_SIZE + TILE_SIZE / 2;

          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.beginPath();
          ctx.arc(px, py, 19, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 9. Draw Player Character
      const plX = playerRenderPos.current.x * TILE_SIZE + TILE_SIZE / 2;
      const plY = playerRenderPos.current.y * TILE_SIZE + TILE_SIZE / 2 + walkBob.current;

      if (!player.isInvulnerable || Math.floor(torchTime.current * 16) % 2 === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(plX, plY + 13, 11, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2563eb';
        ctx.fillRect(plX - 7, plY - 2, 14, 13);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(plX - 7, plY + 4, 14, 3);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(plX - 2, plY + 4, 4, 3);

        ctx.fillStyle = '#451a03';
        const legOffset = moving ? Math.sin(walkBob.current) * 3 : 0;
        ctx.fillRect(plX - 6, plY + 11 + legOffset, 5, 6);
        ctx.fillRect(plX + 1, plY + 11 - legOffset, 5, 6);

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(plX, plY - 7, 7.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(plX, plY - 9, 8.5, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(plX - 9, plY - 11, 18, 4);

        ctx.fillStyle = '#0f172a';
        if (player.direction === 'right') {
          ctx.fillRect(plX + 2, plY - 7, 2, 3);
        } else if (player.direction === 'left') {
          ctx.fillRect(plX - 4, plY - 7, 2, 3);
        } else if (player.direction === 'down') {
          ctx.fillRect(plX - 3, plY - 7, 2, 3);
          ctx.fillRect(plX + 1, plY - 7, 2, 3);
        }

        let torchX = plX + 10;
        let torchY = plY - 1;
        if (player.direction === 'left') torchX = plX - 11;
        if (player.direction === 'up') {
          torchX = plX + 8;
          torchY = plY - 5;
        }

        ctx.fillStyle = '#78350f';
        ctx.fillRect(torchX - 1, torchY, 3, 10);

        const flameJitter = Math.sin(torchTime.current * 18) * 1.5;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(torchX, torchY - 2 + flameJitter, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(torchX, torchY - 3 + flameJitter, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 10. Warm Ambient Lighting Glow (Bright & Clear Theme!)
      // Instead of an oppressive dark black fog, create a pleasant warm torchlight ambiance
      if (brightMode) {
        // Bright mode: Soft golden illumination radiating from player torch, entire dungeon is visible
        const lightRadius = 180 + Math.sin(torchTime.current * 6) * 8;
        const gradient = ctx.createRadialGradient(plX, plY, 15, plX, plY, lightRadius);
        gradient.addColorStop(0, 'rgba(254, 240, 138, 0.12)');
        gradient.addColorStop(0.6, 'rgba(245, 158, 11, 0.04)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Subtle dungeon atmosphere with softer vignette
        const lightRadius = 150 + Math.sin(torchTime.current * 6) * 6;
        const gradient = ctx.createRadialGradient(plX, plY, 20, plX, plY, lightRadius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.25)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.55)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 11. Render Hover Reticle (Interactive Outline on hovered tile)
      if (hoverPos && hoverPos.x >= 0 && hoverPos.x < level.width && hoverPos.y >= 0 && hoverPos.y < level.height) {
        const hx = hoverPos.x * TILE_SIZE;
        const hy = hoverPos.y * TILE_SIZE;

        // Glowing outer border
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(hx + 1.5, hy + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
        ctx.setLineDash([]);

        // Subtle tile highlight fill
        ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
        ctx.fillRect(hx + 2, hy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      }

      // 12. Render Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / 0.8);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      // Random torch spark emission
      if (Math.random() < 0.25) {
        particles.push({
          x: plX + 8 + (Math.random() - 0.5) * 4,
          y: plY - 4,
          vx: (Math.random() - 0.5) * 20,
          vy: -25 - Math.random() * 20,
          alpha: 1,
          color: Math.random() > 0.5 ? '#f59e0b' : '#fef08a',
          size: Math.random() * 2 + 1,
          life: 0.5 + Math.random() * 0.3,
        });
      }

      // 13. Floating Notifications
      for (const note of floatingNotes) {
        ctx.fillStyle = note.color;
        ctx.globalAlpha = note.alpha;
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(note.text, note.x * TILE_SIZE + TILE_SIZE / 2, note.y * TILE_SIZE - 6);
        ctx.globalAlpha = 1.0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [level, player, floatingNotes, isPaused, onInteractAdjacent, hoverPos, brightMode]);

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center select-none overflow-visible rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-2.5"
    >
      <canvas
        ref={canvasRef}
        width={level.width * TILE_SIZE}
        height={level.height * TILE_SIZE}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer max-w-full h-auto rounded-xl touch-none"
        style={{
          aspectRatio: `${level.width} / ${level.height}`,
          imageRendering: 'pixelated',
        }}
      />

      {/* Floating Hover Tooltip tracking cursor */}
      {hoverTooltip && (
        <div
          className="pointer-events-none absolute z-40 max-w-xs transition-opacity duration-150 animate-fade-in"
          style={{
            left: Math.min(Math.max(hoverTooltip.screenX + 16, 10), (canvasRef.current?.clientWidth || 300) - 240),
            top: Math.max(hoverTooltip.screenY - 80, 10),
          }}
        >
          <div className="flex flex-col gap-1 p-3 bg-slate-900/95 border border-amber-500/60 rounded-xl shadow-2xl backdrop-blur-md text-xs text-left">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className="text-base">{hoverTooltip.explanation.icon}</span>
              <span>{hoverTooltip.explanation.name}</span>
              {hoverTooltip.explanation.badgeText && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ml-auto ${
                    hoverTooltip.explanation.badgeStyle || 'text-slate-300 bg-slate-800'
                  }`}
                >
                  {hoverTooltip.explanation.badgeText}
                </span>
              )}
            </div>
            <p className="text-slate-300 text-[11px] leading-tight">
              {hoverTooltip.explanation.whatIsIt}
            </p>
            <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] text-amber-300 leading-tight">
              <strong>Action: </strong>
              <span>{hoverTooltip.explanation.whatCanYouDo}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
