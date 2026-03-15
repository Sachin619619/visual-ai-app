import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, action?: { label: string; onClick: () => void }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    type: ToastType,
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Date.now().toString();
    // Errors stay longer (7s), success shorter (4s)
    const duration = type === 'error' ? 7000 : type === 'warning' ? 5500 : 4000;
    setToasts(prev => [...prev, { id, type, message, action, duration }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-l-green-400';
      case 'error': return 'border-l-red-400';
      case 'warning': return 'border-l-yellow-400';
      case 'info':
      default: return 'border-l-blue-400';
    }
  };

  const getActionColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'text-green-400 hover:bg-green-400/10';
      case 'error': return 'text-red-400 hover:bg-red-400/10';
      case 'warning': return 'text-yellow-400 hover:bg-yellow-400/10';
      default: return 'text-blue-400 hover:bg-blue-400/10';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:right-4 z-[100] flex flex-col gap-2 sm:items-end"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 20px) + 70px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`flex items-start gap-3 px-4 py-3 bg-bg-secondary rounded-xl border border-white/10 border-l-4 ${getBorderColor(toast.type)} shadow-xl w-full sm:min-w-[300px] sm:max-w-sm`}
              role="alert"
            >
              {getIcon(toast.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary break-words leading-snug">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={() => { toast.action!.onClick(); removeToast(toast.id); }}
                    className={`mt-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-colors ${getActionColor(toast.type)}`}
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0 mt-0.5"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
