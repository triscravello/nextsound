import { useEffect, useCallback, useRef } from 'react';
import { useAudioPlayerContext } from '@/context/audioPlayerContext';
import { useQueueStore } from '@/store/queueStore';

export const useQueuePlayback = () => {
  const {
    playTrack,
    togglePlay,
    skipNext: _skipNext,
    skipPrevious: _skipPrevious,
    currentTrack,
    isPlaying,
    progress,
    seek,
    isShuffled,
    repeatMode: _repeatMode,
    toggleShuffle: audioToggleShuffle,
    toggleRepeat: audioToggleRepeat,
  } = useAudioPlayerContext();

  const {
    songs,
    setCurrentIndex,
    getNextIndex,
    getPreviousIndex,
    playTrackInQueue,
    shuffleMode,
    repeatMode: queueRepeatMode,
    toggleShuffle: queueToggleShuffle,
    cycleRepeatMode,
  } = useQueueStore();

  const playTrackRef = useRef(playTrack);
  playTrackRef.current = playTrack;

  const playAtIndex = useCallback(
    (index: number) => {
      const song = songs[index];
      if (song) {
        setCurrentIndex(index);
        playTrackRef.current(song);
      }
    },
    [songs, setCurrentIndex]
  );

  const skipNext = useCallback(() => {
    const nextIndex = getNextIndex();
    if (nextIndex !== null) {
      playAtIndex(nextIndex);
    }
  }, [getNextIndex, playAtIndex]);

  const skipPrevious = useCallback(() => {
    if (progress > 3) {
      seek(0);
      return;
    }
    const prevIndex = getPreviousIndex();
    if (prevIndex !== null) {
      playAtIndex(prevIndex);
    }
  }, [progress, seek, getPreviousIndex, playAtIndex]);

  const playWithQueue = useCallback(
    (track: Parameters<typeof playTrackInQueue>[0]) => {
      const { index, song } = playTrackInQueue(track);
      setCurrentIndex(index);
      playTrackRef.current(song);
    },
    [playTrackInQueue, setCurrentIndex]
  );

  useEffect(() => {
    const handleTrackEnded = () => {
      const nextIndex = getNextIndex();
      if (nextIndex !== null) {
        playAtIndex(nextIndex);
      }
    };

    window.addEventListener('nextsound:track-ended', handleTrackEnded);
    return () => window.removeEventListener('nextsound:track-ended', handleTrackEnded);
  }, [getNextIndex, playAtIndex]);

  const toggleShuffle = useCallback(() => {
    queueToggleShuffle();
    audioToggleShuffle();
  }, [queueToggleShuffle, audioToggleShuffle]);

  const toggleRepeat = useCallback(() => {
    cycleRepeatMode();
    audioToggleRepeat();
  }, [cycleRepeatMode, audioToggleRepeat]);

  return {
    playWithQueue,
    skipNext,
    skipPrevious,
    togglePlay,
    currentTrack,
    isPlaying,
    isShuffled: shuffleMode || isShuffled,
    repeatMode: queueRepeatMode === 'none' ? 'off' : queueRepeatMode === 'one' ? 'one' : 'all',
    toggleShuffle,
    toggleRepeat,
  };
};
