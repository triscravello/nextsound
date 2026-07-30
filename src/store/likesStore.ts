import { create } from 'zustand';

import {
  decrementTrackLike,
  fetchAllUserLikedTrackIds,
  fetchLikeCounts,
  fetchUserLikedTrackIds,
  incrementTrackLike,
} from '@/services/trackLikesService';

interface LikesStore {
  counts: Record<string, number>;
  likedByUser: Record<string, boolean>;
  isUserLikesLoaded: boolean;
  fetchCounts: (trackIds: string[]) => Promise<void>;
  fetchUserLikes: (trackIds: string[]) => Promise<void>;
  loadAllUserLikes: () => Promise<void>;
  resetUserLikes: () => void;
  toggleLike: (trackId: string) => Promise<void>;
}

export const useLikesStore = create<LikesStore>()((set, get) => ({
  counts: {},
  likedByUser: {},
  isUserLikesLoaded: false,

  fetchCounts: async (trackIds) => {
    const uniqueIds = [...new Set(trackIds)].filter(Boolean);
    const missing = uniqueIds.filter((id) => get().counts[id] === undefined);
    if (missing.length === 0) return;

    try {
      const fetched = await fetchLikeCounts(missing);
      set((state) => ({
        counts: { ...state.counts, ...fetched },
      }));
    } catch {
      set((state) => ({
        counts: Object.fromEntries(missing.map((id) => [id, state.counts[id] ?? 0])),
      }));
    }
  },

  fetchUserLikes: async (trackIds) => {
    const uniqueIds = [...new Set(trackIds)].filter(Boolean);
    if (uniqueIds.length === 0) return;

    try {
      const fetched = await fetchUserLikedTrackIds(uniqueIds);
      set((state) => ({
        likedByUser: { ...state.likedByUser, ...fetched },
      }));
    } catch {
      // Keep existing local state on failure
    }
  },

  loadAllUserLikes: async () => {
    try {
      const liked = await fetchAllUserLikedTrackIds();
      set({ likedByUser: liked, isUserLikesLoaded: true });
    } catch {
      set({ isUserLikesLoaded: true });
    }
  },

  resetUserLikes: () => {
    set({ likedByUser: {}, isUserLikesLoaded: false });
  },

  toggleLike: async (trackId) => {
    const wasLiked = get().likedByUser[trackId] ?? false;
    const previousCount = get().counts[trackId] ?? 0;
    const optimisticCount = wasLiked
      ? Math.max(0, previousCount - 1)
      : previousCount + 1;

    set((state) => ({
      counts: { ...state.counts, [trackId]: optimisticCount },
      likedByUser: { ...state.likedByUser, [trackId]: !wasLiked },
    }));

    try {
      const newCount = wasLiked
        ? await decrementTrackLike(trackId)
        : await incrementTrackLike(trackId);

      set((state) => ({
        counts: { ...state.counts, [trackId]: newCount },
      }));
    } catch {
      set((state) => ({
        counts: { ...state.counts, [trackId]: previousCount },
        likedByUser: { ...state.likedByUser, [trackId]: wasLiked },
      }));
      throw new Error(wasLiked ? 'Failed to unlike track' : 'Failed to like track');
    }
  },
}));
