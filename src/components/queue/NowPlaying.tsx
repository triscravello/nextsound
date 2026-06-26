import React from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { QueueSong } from '@/store/queueStore';
import { getImageUrl, cn } from '@/utils';

interface NowPlayingProps {
  song: QueueSong;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({
  song,
  isPlaying,
  onPlay,
  onPause,
}) => {
  const displayTitle = song.original_title || song.name || song.title || 'Unknown Track';

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-500 dark:text-text-secondary mb-2">
        Now Playing
      </p>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-lg p-4',
          'bg-gradient-to-r from-blue-500/10 to-blue-600/5',
          'border border-blue-500/20',
          'shadow-lg shadow-blue-500/10'
        )}
      >
        <div className="relative shrink-0">
          <img
            src={getImageUrl(song.poster_path)}
            alt={displayTitle}
            className="w-12 h-12 rounded-lg object-cover shadow-md"
          />
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-black/50 rounded-lg opacity-0 group-hover:opacity-100',
              'transition-opacity duration-200'
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <FaPause className="w-4 h-4 text-white" />
            ) : (
              <FaPlay className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-text-primary truncate">
            {displayTitle}
          </p>
          <p className="text-sm text-gray-500 dark:text-text-secondary truncate">
            {song.artist || 'Unknown Artist'}
          </p>
        </div>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className={cn(
            'shrink-0 flex items-center justify-center w-10 h-10 rounded-full',
            'bg-accent-orange hover:bg-accent-orange/90 text-white',
            'transition-all duration-200 hover:scale-105'
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <FaPause className="w-4 h-4" />
          ) : (
            <FaPlay className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
