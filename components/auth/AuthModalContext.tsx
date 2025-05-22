"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

type AuthModalMode = 'signIn' | 'signUp';

type AuthModalStep = 
  | 'select-method'
  | 'name-dob'
  | 'email-password'
  | 'profile-details'
  | 'verification-pending';

interface AuthModalContextType {
  open: boolean;
  mode: AuthModalMode;
  openModal: (mode: AuthModalMode) => void;
  closeModal: () => void;
  step: AuthModalStep;
  setStep: (step: AuthModalStep) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>('signIn');
  const [step, setStep] = useState<AuthModalStep>('select-method');

  const openModal = (mode: AuthModalMode) => {
    setMode(mode);
    setStep('select-method');
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  return (
    <AuthModalContext.Provider value={{ open, mode, openModal, closeModal, step, setStep }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error('useAuthModal must be used within an AuthModalProvider');
  return context;
} 