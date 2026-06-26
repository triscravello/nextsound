import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { useToastStore } from '@/store/toastStore';
import { cn } from '@/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <m.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full',
              'bg-gray-900 dark:bg-gray-800 text-white shadow-lg',
              'border border-gray-700/50'
            )}
            onClick={() => dismissToast(toast.id)}
          >
            <FiCheck className="w-4 h-4 text-accent-orange shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
