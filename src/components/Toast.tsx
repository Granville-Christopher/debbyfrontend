import React, { useEffect, useState } from "react";
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="w-5 h-5" />,
    error: <FiAlertCircle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
    warning: <FiAlertTriangle className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ${
        styles[toast.type]
      } ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({
  toasts,
  onClose,
}) => {
  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full"
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Toast hook for easy usage
let toastIdCounter = 0;
const toastListeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

export const toast = {
  show: (message: string, type: ToastType = "info", duration?: number) => {
    const id = `toast-${toastIdCounter++}`;
    const newToast: Toast = { id, message, type, duration };
    toasts = [...toasts, newToast];
    toastListeners.forEach((listener) => listener([...toasts]));
  },
  success: (message: string, duration?: number) => toast.show(message, "success", duration),
  error: (message: string, duration?: number) => toast.show(message, "error", duration),
  info: (message: string, duration?: number) => toast.show(message, "info", duration),
  warning: (message: string, duration?: number) => toast.show(message, "warning", duration),
  subscribe: (listener: (toasts: Toast[]) => void): (() => void) => {
    toastListeners.add(listener);
    listener([...toasts]);
    return () => {
      toastListeners.delete(listener);
    };
  },
  remove: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    toastListeners.forEach((listener) => listener([...toasts]));
  },
};
