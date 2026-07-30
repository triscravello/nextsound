import React from 'react';
import { FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/authContext';
import { cn } from '@/utils';

interface AuthButtonProps {
  isNotFoundPage?: boolean;
  showBg?: boolean;
  className?: string;
  compact?: boolean;
}

export function AuthButton({ isNotFoundPage = false, showBg = false, className, compact = false }: AuthButtonProps) {
  const { user, profile, isLoading, signOut, openAuthModal } = useAuth();

  const buttonStyles = cn(
    'flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105',
    compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5',
    isNotFoundPage || showBg
      ? 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600'
      : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/20',
    className
  );

  if (isLoading) {
    return (
      <div
        className={cn(buttonStyles, 'opacity-60 pointer-events-none')}
        aria-hidden="true"
      >
        <FiUser className="w-4 h-4" />
      </div>
    );
  }

  if (user) {
    const initials = (profile?.display_name ?? user.email ?? 'U')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 border border-gray-300 dark:border-gray-600">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.display_name ?? 'User'} />}
          <AvatarFallback className="text-xs font-semibold bg-accent-orange/10 text-accent-orange">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!compact && (
          <span className="hidden lg:inline text-sm font-medium max-w-[120px] truncate">
            {profile?.display_name ?? user.email?.split('@')[0]}
          </span>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          className={buttonStyles}
          aria-label="Sign out"
        >
          <FiLogOut className="w-4 h-4" />
          {!compact && <span className="text-sm font-medium ml-1 hidden sm:inline">Sign out</span>}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openAuthModal('sign-in')}
      className={buttonStyles}
      aria-label="Sign in"
    >
      <FiLogIn className="w-4 h-4" />
      {!compact && <span className="text-sm font-medium ml-2">Sign in</span>}
    </button>
  );
}
