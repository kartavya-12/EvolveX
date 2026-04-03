// Level thresholds: XP = 100 * level^2
export function xpForLevel(level: number): number {
  return 100 * level * level;
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (true) {
    xpNeeded += xpForLevel(level);
    if (totalXp < xpNeeded) return level;
    level++;
  }
}

export function getLevelProgress(totalXp: number) {
  const level = calculateLevel(totalXp);
  const xpForPreviousLevels = totalXpForLevel(level - 1);
  const currentXp = totalXp - xpForPreviousLevels;
  const requiredXp = xpForLevel(level);
  const percentage = Math.min((currentXp / requiredXp) * 100, 100);
  return { level, currentXp, requiredXp, percentage };
}

export const MUSCLE_COLORS: Record<string, string> = {
  chest: '#ef4444',
  arms: '#3b82f6',
  legs: '#10b981',
  back: '#f59e0b',
  shoulders: '#8b5cf6',
  core: '#06b6d4',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#64748b',
  medium: '#3b82f6',
  high: '#f59e0b',
  legendary: '#8b5cf6',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'D Rank',
  medium: 'C Rank',
  high: 'B Rank',
  legendary: 'S Rank',
};

export const RANK_COLORS: Record<string, string> = {
  'Novice Adventurer': '#64748b',
  'Rising Fighter': '#10b981',
  'Awakened One': '#3b82f6',
  'E-Rank Hunter': '#06b6d4',
  'D-Rank Hunter': '#8b5cf6',
  'C-Rank Hunter': '#f59e0b',
  'B-Rank Hunter': '#ef4444',
  'A-Rank Hunter': '#ec4899',
  'S-Rank Hunter': '#f59e0b',
  'Shadow Monarch': '#8b5cf6',
  'Transcendent Being': '#ffffff',
};
