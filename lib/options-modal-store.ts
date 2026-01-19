import { create } from 'zustand';

export interface OptionsModalState {
    title: string;
    description: string;
    ctaText: string;
    ctaAction: () => void;
    isCTALoading?: boolean;
    isOpen: boolean;
}

interface OptionsModalStore {
    modal: OptionsModalState;
    showModal: (
        title: string,
        description: string,
        ctaText: string,
        ctaAction: () => void,
        isCTALoading?: boolean
    ) => void;
    hideModal: () => void;
    setIsCTALoading: (isCTALoading: boolean) => void;
}

export const useOptionsModalStore = create<OptionsModalStore>((set) => ({
    modal: {
        title: '',
        description: '',
        ctaText: '',
        ctaAction: () => {},
        isCTALoading: false,
        isOpen: false,
    },
    showModal: (title, description, ctaText, ctaAction, isCTALoading = false) =>
        set({
            modal: {
                title,
                description,
                ctaText,
                ctaAction,
                isCTALoading,
                isOpen: true,
            },
        }),
    hideModal: () =>
        set((state) => ({
            modal: {
                ...state.modal,
                isOpen: false,
            },
        })),
    setIsCTALoading: (isCTALoading: boolean) =>
        set((state) => ({
            modal: {
                ...state.modal,
                isCTALoading,
            },
        })),
}));
