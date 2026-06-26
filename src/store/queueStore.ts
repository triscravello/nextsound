import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ITrack } from '@/types';

export interface QueueSong extends ITrack {
  addedAt: number;
  queueId: string;
}

export type RepeatMode = 'none' | 'one' | 'all';

interface QueueState {
  songs: QueueSong[];
  currentIndex: number;
  isSidebarOpen: boolean;
  shuffleMode: boolean;
  repeatMode: RepeatMode;
}

interface QueueActions {
  addToQueue: (track: ITrack) => void;
  removeFromQueue: (queueId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;
  moveToTop: (queueId: string) => void;
  removeDuplicates: () => void;
  getNextIndex: () => number | null;
  getPreviousIndex: () => number | null;
  playTrackInQueue: (track: ITrack) => { index: number; song: QueueSong };
}

type QueueStore = QueueState & QueueActions;

const createQueueSong = (track: ITrack): QueueSong => ({
  ...track,
  addedAt: Date.now(),
  queueId: `${track.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
});

export const useQueueStore = create<QueueStore>()(
  persist(
    (set, get) => ({
      songs: [],
      currentIndex: -1,
      isSidebarOpen: false,
      shuffleMode: false,
      repeatMode: 'none',

      addToQueue: (track) => {
        const song = createQueueSong(track);
        set((state) => ({
          songs: [...state.songs, song],
        }));
      },

      removeFromQueue: (queueId) => {
        set((state) => {
          const removeIndex = state.songs.findIndex((s) => s.queueId === queueId);
          if (removeIndex === -1) return state;

          const newSongs = state.songs.filter((s) => s.queueId !== queueId);
          let newCurrentIndex = state.currentIndex;

          if (removeIndex < state.currentIndex) {
            newCurrentIndex = state.currentIndex - 1;
          } else if (removeIndex === state.currentIndex) {
            newCurrentIndex = Math.min(state.currentIndex, newSongs.length - 1);
            if (newSongs.length === 0) newCurrentIndex = -1;
          }

          return { songs: newSongs, currentIndex: newCurrentIndex };
        });
      },

      reorderQueue: (fromIndex, toIndex) => {
        set((state) => {
          const newSongs = [...state.songs];
          const [moved] = newSongs.splice(fromIndex, 1);
          newSongs.splice(toIndex, 0, moved);

          let newCurrentIndex = state.currentIndex;
          if (fromIndex === state.currentIndex) {
            newCurrentIndex = toIndex;
          } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
            newCurrentIndex = state.currentIndex - 1;
          } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
            newCurrentIndex = state.currentIndex + 1;
          }

          return { songs: newSongs, currentIndex: newCurrentIndex };
        });
      },

      clearQueue: () => {
        set({ songs: [], currentIndex: -1 });
      },

      setCurrentIndex: (index) => {
        set({ currentIndex: index });
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setSidebarOpen: (isOpen) => {
        set({ isSidebarOpen: isOpen });
      },

      toggleShuffle: () => {
        set((state) => ({ shuffleMode: !state.shuffleMode }));
      },

      setRepeatMode: (mode) => {
        set({ repeatMode: mode });
      },

      cycleRepeatMode: () => {
        set((state) => {
          const modes: RepeatMode[] = ['none', 'one', 'all'];
          const currentIdx = modes.indexOf(state.repeatMode);
          return { repeatMode: modes[(currentIdx + 1) % modes.length] };
        });
      },

      moveToTop: (queueId) => {
        set((state) => {
          const idx = state.songs.findIndex((s) => s.queueId === queueId);
          if (idx <= state.currentIndex || idx === -1) return state;

          const newSongs = [...state.songs];
          const [song] = newSongs.splice(idx, 1);
          const insertAt = state.currentIndex + 1;
          newSongs.splice(insertAt, 0, song);

          return { songs: newSongs };
        });
      },

      removeDuplicates: () => {
        set((state) => {
          const seen = new Set<string>();
          const unique: QueueSong[] = [];
          let newCurrentIndex = state.currentIndex;
          const currentQueueId = state.songs[state.currentIndex]?.queueId;

          state.songs.forEach((song) => {
            if (!seen.has(song.id)) {
              seen.add(song.id);
              unique.push(song);
            }
          });

          if (currentQueueId) {
            newCurrentIndex = unique.findIndex((s) => s.queueId === currentQueueId);
          }

          return { songs: unique, currentIndex: newCurrentIndex };
        });
      },

      getNextIndex: () => {
        const { songs, currentIndex, shuffleMode, repeatMode } = get();
        if (songs.length === 0) return null;

        if (repeatMode === 'one') return currentIndex;

        if (shuffleMode) {
          const upcoming = songs
            .map((_, i) => i)
            .filter((i) => i !== currentIndex);
          if (upcoming.length === 0) {
            return repeatMode === 'all' ? 0 : null;
          }
          return upcoming[Math.floor(Math.random() * upcoming.length)];
        }

        if (currentIndex < songs.length - 1) return currentIndex + 1;
        if (repeatMode === 'all') return 0;
        return null;
      },

      getPreviousIndex: () => {
        const { songs, currentIndex, shuffleMode, repeatMode } = get();
        if (songs.length === 0 || currentIndex <= 0) {
          if (repeatMode === 'all' && songs.length > 0) return songs.length - 1;
          return null;
        }

        if (shuffleMode) {
          const previous = songs
            .map((_, i) => i)
            .filter((i) => i < currentIndex);
          if (previous.length === 0) {
            return repeatMode === 'all' ? songs.length - 1 : null;
          }
          return previous[Math.floor(Math.random() * previous.length)];
        }

        return currentIndex - 1;
      },

      playTrackInQueue: (track) => {
        const { songs } = get();
        const existingIndex = songs.findIndex((s) => s.id === track.id);

        if (existingIndex >= 0) {
          set({ currentIndex: existingIndex });
          return { index: existingIndex, song: songs[existingIndex] };
        }

        const song = createQueueSong(track);
        const newIndex = songs.length;
        set({ songs: [...songs, song], currentIndex: newIndex });
        return { index: newIndex, song };
      },
    }),
    {
      name: 'nextsound-queue',
      partialize: (state) => ({
        songs: state.songs,
        currentIndex: state.currentIndex,
        shuffleMode: state.shuffleMode,
        repeatMode: state.repeatMode,
      }),
    }
  )
);
