import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/authContext';
import { cn } from '@/utils';

type AuthMode = 'sign-in' | 'sign-up';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
}

export function AuthModal({ open, onOpenChange, defaultMode = 'sign-in' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [open, defaultMode]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
      setMode(defaultMode);
    }
    onOpenChange(nextOpen);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'sign-in') {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError);
          return;
        }
        handleOpenChange(false);
      } else {
        const { error: signUpError } = await signUp(email, password, displayName || undefined);
        if (signUpError) {
          setError(signUpError);
          return;
        }
        setSuccessMessage('Account created! Check your email to confirm, then sign in.');
        setMode('sign-in');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card-dark border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-text-primary">
            {mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-text-secondary">
            {mode === 'sign-in'
              ? 'Sign in to save and sync your liked tracks.'
              : 'Create an account to like tracks across devices.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'sign-up' && (
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-text-secondary">
                Display name
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-text-secondary">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-text-secondary">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400" role="status">
              {successMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent-orange hover:bg-accent-orange/90 text-white"
          >
            {isSubmitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-text-secondary">
          {mode === 'sign-in' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('sign-up')}
                className={cn('font-medium text-accent-orange hover:underline')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('sign-in')}
                className={cn('font-medium text-accent-orange hover:underline')}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
