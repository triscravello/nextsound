import React, { useState, useCallback } from 'react';
import { Card, CardContent } from './card';
import { FaClock, FaHeart, FaPlay, FaPlus, FaShareAlt } from 'react-icons/fa';
import { ITrack } from '@/types';
import { useTrackLike } from '@/hooks/useTrackLike';
import { useQueueStore } from '@/store/queueStore';
import { useToastStore } from '@/store/toastStore';
import { getImageUrl, cn } from '@/utils';

interface TrackCardProps {
  track: ITrack;
  category: string;
  isPlaying?: boolean;
  onPlay?: (track: ITrack) => void;
  variant?: 'compact' | 'detailed' | 'featured';
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  category: _category,
  isPlaying = false,
  onPlay,
  variant = 'detailed',
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const addToQueue = useQueueStore((s) => s.addToQueue);
  const setSidebarOpen = useQueueStore((s) => s.setSidebarOpen);
  const showToast = useToastStore((s) => s.showToast);
  const trackId = track.spotify_id || track.id;
  const { likeCount, isLiked, isSubmitting, handleLike } = useTrackLike(trackId);

  const handleAddToQueueWithFeedback = useCallback(() => {
    addToQueue(track);
    showToast('Added to queue');

    const hintShown = sessionStorage.getItem('nextsound-queue-hint-shown');
    if (!hintShown) {
      setSidebarOpen(true);
      sessionStorage.setItem('nextsound-queue-hint-shown', '1');
    }
  }, [addToQueue, track, showToast, setSidebarOpen]);

  const { poster_path, original_title: title, name, artist, album, duration } = track;
  const displayTitle = title || name || 'Unknown Track';

  const formatDuration = (ms: number) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = useCallback(() => {
    onPlay?.(track);
  }, [onPlay, track]);

  const handleAddToQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleAddToQueueWithFeedback();
    },
    [handleAddToQueueWithFeedback]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleAddToQueueWithFeedback();
    },
    [handleAddToQueueWithFeedback]
  );

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const shareUrl = track.external_urls?.spotify;
      if (!shareUrl) {
        showToast('No shareable link available for this track');
        return;
      }
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => showToast('Link copied to clipboard'))
        .catch(() => showToast('Failed to copy link'));
    },
    [track, showToast]
  );

  const cardHeight = variant === 'compact' ? 'h-52' : variant === 'featured' ? 'h-84' : 'h-80';
  const imageHeight = variant === 'compact' ? 160 : variant === 'featured' ? 240 : 200;

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-300 ease-out overflow-hidden",
        "hover:scale-[1.03] hover:-translate-y-2 cursor-pointer",
        "bg-white dark:bg-card-dark border-0",
        "shadow-sm hover:shadow-card-hover",
        "rounded-xl p-4",
        cardHeight,
        "w-[180px]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
      onContextMenu={handleContextMenu}
    >
      <div className="block relative h-full">
        <div className="relative overflow-hidden rounded-lg mb-3">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-hover-gray animate-pulse rounded-lg" 
                 style={{ height: imageHeight }} />
          )}
          
          <img
            src={getImageUrl(poster_path)}
            alt={displayTitle}
            className={cn(
              "w-full object-cover transition-all duration-300 rounded-lg",
              "group-hover:scale-105",
              "dark:brightness-75 dark:contrast-110 dark:saturate-90",
              "dark:group-hover:brightness-90 dark:group-hover:contrast-105 dark:group-hover:saturate-95",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{ height: imageHeight }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 rounded-lg",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Play button overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            className={cn(
              "absolute bottom-2 right-2 flex items-center justify-center w-10 h-10 rounded-full",
              "bg-accent-orange hover:bg-accent-orange/90 text-white shadow-lg",
              "transition-all duration-200 hover:scale-105",
              isHovered || isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
            aria-label={`Play ${displayTitle}`}
          >
            <FaPlay className="w-3.5 h-3.5 ml-0.5" />
          </button>

          {/* Add to queue button */}
          <button
            onClick={handleAddToQueue}
            className={cn(
              "absolute bottom-2 left-2 flex items-center justify-center w-8 h-8 rounded-full",
              "bg-white text-black shadow-lg",
              "transition-all duration-200 hover:scale-105",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
            aria-label={`Add ${displayTitle} to queue`}
          >
            <FaPlus className="w-3 h-3" />
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className={cn(
              "absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full",
              "bg-white text-black shadow-lg",
              "transition-all duration-200 hover:scale-105",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
            aria-label={`Share ${displayTitle}`}
          >
            <FaShareAlt className="w-3 h-3" />
          </button>

          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={isSubmitting}
            className={cn(
              "absolute top-2 left-2 flex items-center gap-1 h-8 rounded-full px-2.5 shadow-lg",
              "transition-all duration-200 hover:scale-105",
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white text-black",
              isHovered || likeCount > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
            aria-label={isLiked ? `Unlike ${displayTitle}` : `Like ${displayTitle}`}
          >
            <FaHeart className={cn("w-3 h-3", isLiked && "fill-current")} />
            <span className="text-xs font-semibold tabular-nums">{likeCount}</span>
          </button>
        </div>

        <CardContent className="p-0 space-y-2">
          <h3 className={cn(
            "font-semibold text-gray-900 dark:text-text-primary truncate transition-colors duration-200",
            variant === 'compact' ? "text-sm" : "text-base",
            "group-hover:text-accent-orange dark:group-hover:text-accent-orange",
            isPlaying && "text-accent-orange"
          )}>
            {displayTitle}
          </h3>
          
          <p className={cn(
            "text-gray-600 dark:text-text-secondary truncate font-medium",
            variant === 'compact' ? "text-xs" : "text-sm"
          )}>
            {artist || 'Unknown Artist'}
          </p>

          {variant === 'detailed' && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2 flex-1 mr-2">
                {album && (
                  <span className="text-xs text-text-muted dark:text-text-secondary/70 truncate">
                    {album}
                  </span>
                )}
              </div>
              {duration && (
                <div className="flex items-center text-xs text-text-muted dark:text-text-secondary/70 shrink-0">
                  <FaClock className="w-3 h-3 mr-1 opacity-60" />
                  {formatDuration(duration)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>

      <div className={cn(
        "absolute -inset-1 bg-gradient-to-r from-spotify-green via-accent-orange to-warning-amber rounded-2xl opacity-0 transition-opacity duration-500 -z-10 blur-md",
        "dark:bg-gradient-to-r dark:from-blue-800 dark:via-slate-600 dark:to-blue-800",
        isHovered && "opacity-10"
      )} />
    </Card>
  );
};
