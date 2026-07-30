import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/authContext';
import { useLikesStore } from '@/store/likesStore';
import { useToastStore } from '@/store/toastStore';

export function useTrackLike(trackId: string) {
  const { user, openAuthModal } = useAuth();
  const likeCount = useLikesStore((s) => s.counts[trackId] ?? 0);
  const isLiked = useLikesStore((s) => s.likedByUser[trackId] ?? false);
  const fetchCounts = useLikesStore((s) => s.fetchCounts);
  const fetchUserLikes = useLikesStore((s) => s.fetchUserLikes);
  const toggleLike = useLikesStore((s) => s.toggleLike);
  const showToast = useToastStore((s) => s.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (trackId) {
      void fetchCounts([trackId]);
    }
  }, [trackId, fetchCounts]);

  useEffect(() => {
    if (trackId && user) {
      void fetchUserLikes([trackId]);
    }
  }, [trackId, user, fetchUserLikes]);

  const handleLike = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!trackId || isSubmitting) return;

      if (!user) {
        openAuthModal('sign-in');
        showToast('Sign in to like tracks');
        return;
      }

      setIsSubmitting(true);
      try {
        await toggleLike(trackId);
      } catch {
        showToast(isLiked ? 'Failed to unlike track' : 'Failed to like track');
      } finally {
        setIsSubmitting(false);
      }
    },
    [trackId, isSubmitting, user, openAuthModal, isLiked, toggleLike, showToast]
  );

  return { likeCount, isLiked, isSubmitting, handleLike };
}
