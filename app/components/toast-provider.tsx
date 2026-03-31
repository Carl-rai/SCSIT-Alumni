"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const typeStyles: Record<ToastType, string> = {
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  error: "border-red-400/40 bg-red-500/10 text-red-100",
  info: "border-blue-400/40 bg-blue-500/10 text-blue-100",
};

function inferToastType(message: string): ToastType {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("error") ||
    normalized.includes("failed") ||
    normalized.includes("invalid") ||
    normalized.includes("denied") ||
    normalized.includes("reject") ||
    normalized.includes("required") ||
    normalized.includes("not found")
  ) {
    return "error";
  }

  if (
    normalized.includes("success") ||
    normalized.includes("approved") ||
    normalized.includes("created") ||
    normalized.includes("updated") ||
    normalized.includes("deleted") ||
    normalized.includes("registered") ||
    normalized.includes("sent")
  ) {
    return "success";
  }

  return "info";
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") return <CheckCircle2 size={18} className="text-emerald-300" />;
  if (type === "error") return <CircleAlert size={18} className="text-red-300" />;
  return <Info size={18} className="text-blue-300" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type?: ToastType) => {
    if (!message?.trim()) return;

    const id = Date.now() + Math.floor(Math.random() * 1000);
    const toastType = type ?? inferToastType(message);

    setToasts((current) => [...current, { id, message, type: toastType }]);

    const timeout = setTimeout(() => removeToast(id), 4500);
    timeoutsRef.current.set(id, timeout);
  }, [removeToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousAlert = window.alert;
    window.alert = (message?: string) => {
      showToast(String(message ?? ""), inferToastType(String(message ?? "")));
    };

    return () => {
      window.alert = previousAlert;
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,420px)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${typeStyles[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <ToastIcon type={toast.type} />
              </div>
              <p className="flex-1 text-sm leading-5">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-white/60 transition-colors hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
