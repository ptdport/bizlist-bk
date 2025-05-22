"use client";
import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

interface ToastContextType {
  showToast: (opts: { title: string; description?: string; }) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<{ title: string; description?: string } | null>(null);

  const showToast = (opts: { title: string; description?: string }) => {
    setToast(opts);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastPrimitive.Provider swipeDirection="right">
        <ToastPrimitive.Root open={open} onOpenChange={setOpen} className="fixed bottom-4 right-4 z-[100] bg-white border rounded shadow-lg p-4 min-w-[280px]">
          <ToastPrimitive.Title className="font-semibold text-slate-900">{toast?.title}</ToastPrimitive.Title>
          {toast?.description && <ToastPrimitive.Description className="text-slate-600 mt-1">{toast.description}</ToastPrimitive.Description>}
          <ToastPrimitive.Action asChild altText="Close">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700">&times;</button>
          </ToastPrimitive.Action>
        </ToastPrimitive.Root>
        <ToastPrimitive.Viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
} 