import React from 'react';
import { MiniPlayer } from '@/components/ui/MiniPlayer';
import { useAudioPlayerContext } from '@/context/audioPlayerContext';
import { useQueuePlayback } from '@/hooks/useQueuePlayback';
import { useQueueStore } from '@/store/queueStore';

export const ConnectedMiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    isMinimized,
    seek,
    setVolume,
    toggleFavorite,
    toggleMinimize,
    closePlayer,
  } = useAudioPlayerContext();

  const {
    skipNext,
    skipPrevious,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    isShuffled,
    repeatMode,
  } = useQueuePlayback();

  const setSidebarOpen = useQueueStore((s) => s.setSidebarOpen);

  return (
    <MiniPlayer
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      progress={progress}
      volume={volume}
      isShuffled={isShuffled}
      repeatMode={repeatMode}
      onTogglePlay={togglePlay}
      onSkipPrevious={skipPrevious}
      onSkipNext={skipNext}
      onSeek={seek}
      onVolumeChange={setVolume}
      onToggleShuffle={toggleShuffle}
      onToggleRepeat={toggleRepeat}
      onToggleFavorite={toggleFavorite}
      onOpenQueue={() => setSidebarOpen(true)}
      onClose={closePlayer}
      isMinimized={isMinimized}
      onToggleMinimize={toggleMinimize}
    />
  );
};
