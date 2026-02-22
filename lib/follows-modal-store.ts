import { User } from 'better-auth';
import { create } from 'zustand';

export interface FollowsModalState {
    userId: string;
    userName: string;
    behavior: 'followers' | 'following';
    isOpen: boolean;
}

interface FollowsModalStore {
    modal: FollowsModalState;
    showModal: (
        userId: string,
        userName: string,
        behavior: 'followers' | 'following'
    ) => void;
    hideModal: () => void;
    setBehavior: (behavior: 'followers' | 'following') => void;
}

export const useFollowsModalStore = create<FollowsModalStore>((set) => ({
    modal: {
        userId: '',
        userName: '',
        behavior: 'followers',
        isOpen: false,
    },
    showModal: (userId, userName, behavior: 'followers' | 'following') =>
        set((state) => ({
            modal: {
                ...state.modal,
                userId,
                userName,
                behavior,
                isOpen: true,
            },
        })),
    hideModal: () =>
        set((state) => ({
            modal: {
                ...state.modal,
                userId: '',
                userName: '',
                behavior: 'followers',
                isOpen: false,
            },
        })),
    setBehavior: (behavior: 'followers' | 'following') =>
        set((state) => ({
            modal: {
                ...state.modal,
                behavior,
            },
        })),
}));
