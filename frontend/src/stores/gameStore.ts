import { create } from 'zustand';

interface XPNotification {
  id: string;
  amount: number;
  source: string;
  timestamp: number;
}

interface GameState {
  xpNotifications: XPNotification[];
  showLevelUp: boolean;
  newLevel: number;

  addXPNotification: (amount: number, source: string) => void;
  removeXPNotification: (id: string) => void;
  triggerLevelUp: (level: number) => void;
  dismissLevelUp: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  xpNotifications: [],
  showLevelUp: false,
  newLevel: 0,

  addXPNotification: (amount: number, source: string) => {
    const id = `xp-${Date.now()}-${Math.random()}`;
    const notification: XPNotification = {
      id,
      amount,
      source,
      timestamp: Date.now(),
    };

    set((state) => ({
      xpNotifications: [...state.xpNotifications, notification],
    }));

    // Auto-remove after animation
    setTimeout(() => {
      get().removeXPNotification(id);
    }, 2000);
  },

  removeXPNotification: (id: string) => {
    set((state) => ({
      xpNotifications: state.xpNotifications.filter((n) => n.id !== id),
    }));
  },

  triggerLevelUp: (level: number) => {
    set({ showLevelUp: true, newLevel: level });
    setTimeout(() => {
      set({ showLevelUp: false });
    }, 3500);
  },

  dismissLevelUp: () => {
    set({ showLevelUp: false });
  },
}));
