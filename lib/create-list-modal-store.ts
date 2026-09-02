import { create } from 'zustand';

export interface EditableList {
    id: string;
    name: string;
    description?: string;
    image?: string;
}

interface CreateListModalState {
    isModalOpen: boolean;
    /** The list being edited; null puts the modal in create mode. */
    list: EditableList | null;
    showModal: () => void;
    showEditModal: (list: EditableList) => void;
    hideModal: () => void;
}

export const useCreateListModalStore = create<CreateListModalState>((set) => ({
    isModalOpen: false,
    list: null,
    showModal: () => set({ isModalOpen: true, list: null }),
    showEditModal: (list) => set({ isModalOpen: true, list }),
    hideModal: () => set({ isModalOpen: false, list: null }),
}));
