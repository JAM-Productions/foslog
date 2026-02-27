import { create } from 'zustand';

interface ImportReviewsModalState {
    isModalOpen: boolean;
    showModal: () => void;
    hideModal: () => void;
}

export const useImportReviewsModalStore = create<ImportReviewsModalState>(
    (set) => ({
        isModalOpen: false,
        showModal: () => set({ isModalOpen: true }),
        hideModal: () => set({ isModalOpen: false }),
    })
);
