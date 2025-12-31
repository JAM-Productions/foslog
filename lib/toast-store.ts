import { create } from 'zustand';

export interface ToastState {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
}

interface ToastStore {
    toast: ToastState;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toast: {
        message: '',
        type: 'success',
        isVisible: false,
    },
    showToast: (message, type = 'success') =>
        set({
            toast: {
                message,
                type,
                isVisible: true,
            },
        }),
    hideToast: () =>
        set((state) => ({
            toast: {
                ...state.toast,
                isVisible: false,
            },
        })),
}));
