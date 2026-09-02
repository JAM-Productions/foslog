import { create } from 'zustand';

interface AddToListModalState {
    isModalOpen: boolean;
    mediaId: string;
    mediaTitle: string;
    showModal: (mediaId: string, mediaTitle: string) => void;
    hideModal: () => void;
}

export const useAddToListModalStore = create<AddToListModalState>((set) => ({
    isModalOpen: false,
    mediaId: '',
    mediaTitle: '',
    showModal: (mediaId, mediaTitle) =>
        set({ isModalOpen: true, mediaId, mediaTitle }),
    hideModal: () => set({ isModalOpen: false, mediaId: '', mediaTitle: '' }),
}));
