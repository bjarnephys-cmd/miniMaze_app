/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData, PlayerState, Position } from '../types/game';

export interface TileExplanation {
  name: string;
  category: 'obstacle' | 'item' | 'mechanism' | 'path' | 'hazard';
  whatIsIt: string;
  whatCanYouDo: string;
  icon: string;
  badgeText?: string;
  badgeStyle?: string;
}

export function inspectTile(
  pos: Position,
  level: LevelData,
  player: PlayerState
): TileExplanation | null {
  const { x, y } = pos;
  if (x < 0 || x >= level.width || y < 0 || y >= level.height) {
    return null;
  }

  // 1. Check Patrolling Sentries
  if (level.sentries) {
    const sentry = level.sentries.find((s) => s.x === x && s.y === y);
    if (sentry) {
      return {
        name: 'Spectral Warden',
        category: 'hazard',
        whatIsIt: 'A floating magical guardian that continuously patrols this corridor.',
        whatCanYouDo: 'Avoid crossing its patrol route! Touching it inflicts 1 damage and knocks you back.',
        icon: '👁️',
        badgeText: 'Active Hazard',
        badgeStyle: 'text-rose-400 bg-rose-950/60 border-rose-800',
      };
    }
  }

  // 2. Check Pushable Blocks
  const block = level.blocks.find((b) => b.x === x && b.y === y);
  if (block) {
    return {
      name: 'Runestone Block',
      category: 'mechanism',
      whatIsIt: 'A heavy cubic stone carved with ancient gravitational runes.',
      whatCanYouDo: 'Walk into it to push it forward into an open space. Push it onto pressure plates to hold gates permanently open!',
      icon: '🪨',
      badgeText: 'Pushable',
      badgeStyle: 'text-sky-300 bg-sky-950/60 border-sky-800',
    };
  }

  // 3. Check Collectibles (Gems, Keys, Chests, Relics, Potions)
  const col = level.collectibles.find((c) => c.x === x && c.y === y && !c.collected);
  if (col) {
    if (col.type === 'GEM_RUBY') {
      return {
        name: 'Ruby Gemstone',
        category: 'item',
        whatIsIt: 'A sparkling crimson gem worth 100 quest points.',
        whatCanYouDo: 'Step onto this tile to collect the gem and boost your expedition rating.',
        icon: '💎',
        badgeText: '+100 pts',
        badgeStyle: 'text-rose-400 bg-rose-950/60 border-rose-800',
      };
    }
    if (col.type === 'GEM_EMERALD') {
      return {
        name: 'Emerald Gemstone',
        category: 'item',
        whatIsIt: 'A glowing green gem worth 150 quest points.',
        whatCanYouDo: 'Step onto this tile to collect the gem and boost your score.',
        icon: '💎',
        badgeText: '+150 pts',
        badgeStyle: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      };
    }
    if (col.type === 'GEM_SAPPHIRE') {
      return {
        name: 'Sapphire Gemstone',
        category: 'item',
        whatIsIt: 'A radiant blue gem worth 200 quest points.',
        whatCanYouDo: 'Step onto this tile to collect the gem and achieve 3-star completion.',
        icon: '💎',
        badgeText: '+200 pts',
        badgeStyle: 'text-sky-400 bg-sky-950/60 border-sky-800',
      };
    }
    if (col.type === 'KEY_BRONZE') {
      return {
        name: 'Bronze Key',
        category: 'item',
        whatIsIt: 'An ancient heavy key forged from beaten bronze.',
        whatCanYouDo: 'Step here to pick it up. Consumed when opening locked Bronze Gates.',
        icon: '🗝️',
        badgeText: 'Key Item',
        badgeStyle: 'text-amber-400 bg-amber-950/60 border-amber-800',
      };
    }
    if (col.type === 'KEY_SILVER') {
      return {
        name: 'Silver Key',
        category: 'item',
        whatIsIt: 'A shimmering key forged from enchanted silver.',
        whatCanYouDo: 'Step here to add it to your key ring. Unlocks locked Silver Gates.',
        icon: '🗝️',
        badgeText: 'Key Item',
        badgeStyle: 'text-slate-200 bg-slate-800 border-slate-700',
      };
    }
    if (col.type === 'KEY_GOLD') {
      return {
        name: 'Master Gold Key',
        category: 'item',
        whatIsIt: 'A brilliant gilded key required to unlock the inner sanctum vault.',
        whatCanYouDo: 'Step here to pick it up. Grants access through the Grand Gold Gate.',
        icon: '🗝️',
        badgeText: 'Key Item',
        badgeStyle: 'text-yellow-400 bg-yellow-950/60 border-yellow-800',
      };
    }
    if (col.type === 'POTION') {
      return {
        name: 'Healing Elixir',
        category: 'item',
        whatIsIt: 'A flask of revitalizing dungeon tonic.',
        whatCanYouDo: 'Step onto this tile to recover 1 lost Heart and heal trap wounds.',
        icon: '🧪',
        badgeText: '+1 Heart',
        badgeStyle: 'text-pink-400 bg-pink-950/60 border-pink-800',
      };
    }
    if (col.type === 'CHEST') {
      return {
        name: 'Secret Treasure Chest',
        category: 'item',
        whatIsIt: 'A locked chest containing hoarded gold and ancient artifacts.',
        whatCanYouDo: 'Walk onto it or press [SPACE] when adjacent to crack it open for a big score bonus.',
        icon: '📦',
        badgeText: 'Secret +300',
        badgeStyle: 'text-amber-400 bg-amber-950/60 border-amber-800',
      };
    }
    if (col.type === 'RELIC') {
      return {
        name: 'Ancient Talisman Relic',
        category: 'item',
        whatIsIt: 'The legendary golden sapphire talisman of the ancient dungeon architects.',
        whatCanYouDo: 'Step onto this tile to claim the sacred relic and unlock the Grand Exit!',
        icon: '🏺',
        badgeText: 'Primary Quest',
        badgeStyle: 'text-sky-300 bg-sky-950/60 border-sky-800',
      };
    }
  }

  // 4. Check Wall Levers / Switches
  const sw = level.switches.find((s) => s.x === x && s.y === y);
  if (sw) {
    return {
      name: 'Iron Wall Lever',
      category: 'mechanism',
      whatIsIt: `A heavy iron toggle lever wired to dungeon mechanisms. (Currently: ${sw.isOn ? 'ACTIVATED' : 'OFF'})`,
      whatCanYouDo: 'Stand adjacent to the lever and press [SPACE], click it, or tap Interact to flip the switch and open gates or deactivate spike traps.',
      icon: '🎛️',
      badgeText: sw.isOn ? 'Activated' : 'Switched Off',
      badgeStyle: sw.isOn ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-slate-400 bg-slate-900 border-slate-700',
    };
  }

  // 5. Check Pressure Plates
  const plate = level.plates.find((p) => p.x === x && p.y === y);
  if (plate) {
    return {
      name: 'Sunken Pressure Plate',
      category: 'mechanism',
      whatIsIt: `A weighted stone floor rune linked to energy barriers. (Currently: ${plate.isPressed ? 'DEPRESSED' : 'RELEASED'})`,
      whatCanYouDo: plate.isPressed
        ? 'Weighed down by hero or runestone. Releasing weight will re-close the connected gate.'
        : 'Step onto it or push a heavy runestone block on top of it to lower and hold the connected gate open!',
      icon: '🔘',
      badgeText: plate.isPressed ? 'Active' : 'Unweighted',
      badgeStyle: plate.isPressed ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-amber-400 bg-amber-950/60 border-amber-800',
    };
  }

  // 6. Check Spike Traps
  const spike = level.spikes.find((s) => s.x === x && s.y === y);
  if (spike) {
    return {
      name: 'Steel Spike Trap',
      category: 'hazard',
      whatIsIt: `Retractable steel floor spikes. (Currently: ${spike.isActive ? 'EXTENDED & DEADLY' : 'RETRACTED & SAFE'})`,
      whatCanYouDo: spike.isActive
        ? 'DANGER! Stepping here will deal 1 damage to your health. Wait for them to retract or disarm via a wall lever.'
        : 'SAFE FOR NOW: Walk across quickly before the spikes extend again!',
      icon: '⚠️',
      badgeText: spike.isActive ? 'Lethal Spikes' : 'Safe to Cross',
      badgeStyle: spike.isActive ? 'text-rose-400 bg-rose-950/60 border-rose-800' : 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    };
  }

  // 7. Check Barriers (forcefield / portcullis)
  const barrier = level.barriers.find((b) => b.x === x && b.y === y);
  if (barrier) {
    return {
      name: 'Runic Forcefield Gate',
      category: 'obstacle',
      whatIsIt: `A magical energy barrier anchored to stone pillars. (Currently: ${barrier.isOpen ? 'OPEN' : 'LOCKED'})`,
      whatCanYouDo: barrier.isOpen
        ? 'Open: You can pass through freely.'
        : 'Closed: Find the linked lever or weigh down the connected pressure plate to lower the barrier.',
      icon: '⚡',
      badgeText: barrier.isOpen ? 'Passage Open' : 'Barred Gate',
      badgeStyle: barrier.isOpen ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-rose-400 bg-rose-950/60 border-rose-800',
    };
  }

  // 8. Check Tile Type from Map
  const tile = level.map[y][x];

  if (tile === 'DOOR_BRONZE') {
    const hasKey = player.keys.bronze > 0;
    return {
      name: 'Locked Bronze Gate',
      category: 'obstacle',
      whatIsIt: 'A heavy barred gate secured by an ancient bronze tumbler.',
      whatCanYouDo: hasKey
        ? 'You have a Bronze Key! Walk into this gate to unlock and pass through.'
        : 'Locked. You need to search the chambers and find the Bronze Key first.',
      icon: '🚪',
      badgeText: hasKey ? 'Unlockable' : 'Key Needed',
      badgeStyle: hasKey ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-amber-400 bg-amber-950/60 border-amber-800',
    };
  }

  if (tile === 'DOOR_SILVER') {
    const hasKey = player.keys.silver > 0;
    return {
      name: 'Locked Silver Gate',
      category: 'obstacle',
      whatIsIt: 'A gleaming reinforced portcullis with a silver rune plate.',
      whatCanYouDo: hasKey
        ? 'You have a Silver Key! Walk into this gate to unlock and open the passageway.'
        : 'Locked. Find the Silver Key hidden past the block puzzles to open.',
      icon: '🚪',
      badgeText: hasKey ? 'Unlockable' : 'Key Needed',
      badgeStyle: hasKey ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-slate-300 bg-slate-800 border-slate-700',
    };
  }

  if (tile === 'DOOR_GOLD') {
    const hasKey = player.keys.gold > 0;
    return {
      name: 'Grand Vault Gate',
      category: 'obstacle',
      whatIsIt: 'The colossal gold-plated archway guarding the sanctum exit.',
      whatCanYouDo: hasKey
        ? 'You have the Master Gold Key! Approach and walk through to open the way out.'
        : 'Locked by royal edict. Retrieve the Gold Key to open this final passage.',
      icon: '🚪',
      badgeText: hasKey ? 'Unlockable' : 'Key Needed',
      badgeStyle: hasKey ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-yellow-400 bg-yellow-950/60 border-yellow-800',
    };
  }

  if (tile === 'TABLET') {
    return {
      name: 'Ancient Lore Tablet',
      category: 'mechanism',
      whatIsIt: 'A carved stone monolith etched with luminous explorer runes.',
      whatCanYouDo: 'Stand adjacent to it and press [SPACE] or click to translate and read puzzle hints.',
      icon: '📜',
      badgeText: 'Readable',
      badgeStyle: 'text-sky-300 bg-sky-950/60 border-sky-800',
    };
  }

  if (tile === 'START') {
    return {
      name: 'Vault Entry Ladder',
      category: 'path',
      whatIsIt: 'The stone steps where your adventurer entered this floor of the maze.',
      whatCanYouDo: 'Your expedition spawn point. Advance into the corridors to begin solving the dungeon.',
      icon: '🪜',
      badgeText: 'Start Point',
      badgeStyle: 'text-sky-400 bg-sky-950/60 border-sky-800',
    };
  }

  if (tile === 'EXIT') {
    return {
      name: 'Ascending Exit Portal',
      category: 'path',
      whatIsIt: 'A mystical flight of illuminated stairs leading up to the next dungeon level.',
      whatCanYouDo: 'Walk onto this tile once you have completed your goals to clear the level and receive your star rating!',
      icon: '✨',
      badgeText: 'Destination',
      badgeStyle: 'text-amber-400 bg-amber-950/60 border-amber-800',
    };
  }

  if (tile === 'WALL') {
    return {
      name: 'Solid Stone Wall',
      category: 'obstacle',
      whatIsIt: 'Thick masonry brickwork forming the labyrinth structure.',
      whatCanYouDo: 'Impassable barrier. You must navigate corridors, find switches, or unlock doors to pass.',
      icon: '🧱',
      badgeText: 'Wall',
      badgeStyle: 'text-slate-400 bg-slate-900 border-slate-700',
    };
  }

  if (tile === 'CHASM') {
    return {
      name: 'Bottomless Cavern Pit',
      category: 'hazard',
      whatIsIt: 'A deep fissure descending into darkness.',
      whatCanYouDo: 'Impassable drop. You cannot walk over it; walk along the perimeter corridor.',
      icon: '🕳️',
      badgeText: 'Chasm',
      badgeStyle: 'text-slate-500 bg-slate-950 border-slate-800',
    };
  }

  if (tile === 'FLOOR') {
    // Check if player is standing here
    if (player.x === x && player.y === y) {
      return {
        name: 'Current Player Position',
        category: 'path',
        whatIsIt: 'Your brave dungeon explorer holding a torch.',
        whatCanYouDo: 'Use WASD / Arrow keys, tap the on-screen D-pad, or click another tile to move.',
        icon: '🤠',
        badgeText: 'Hero',
        badgeStyle: 'text-amber-400 bg-amber-950/60 border-amber-800',
      };
    }
    return {
      name: 'Stone Flagstone Floor',
      category: 'path',
      whatIsIt: 'A walkable dungeon corridor paved with ancient limestone pavers.',
      whatCanYouDo: 'Click or tap here to automatically pathfind to this location, or step using WASD/Arrow keys.',
      icon: '👣',
      badgeText: 'Walkable',
      badgeStyle: 'text-slate-400 bg-slate-900 border-slate-800',
    };
  }

  return null;
}
