import { create } from 'zustand';

type ToastState = {
  message: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
};

export const useToast = create<ToastState>(set => ({
  message: null,
  showToast: message => set({ message }),
  hideToast: () => set({ message: null }),
}));
