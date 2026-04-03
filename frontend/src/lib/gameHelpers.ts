export function getTitleForLevel(level: number): string {
  if (level >= 50) return 'Transcendent Being';
  if (level >= 40) return 'Shadow Monarch';
  if (level >= 30) return 'S-Rank Hunter';
  if (level >= 25) return 'A-Rank Hunter';
  if (level >= 20) return 'B-Rank Hunter';
  if (level >= 15) return 'C-Rank Hunter';
  if (level >= 10) return 'D-Rank Hunter';
  if (level >= 7) return 'E-Rank Hunter';
  if (level >= 5) return 'Awakened One';
  if (level >= 3) return 'Rising Fighter';
  return 'Novice Adventurer';
}
