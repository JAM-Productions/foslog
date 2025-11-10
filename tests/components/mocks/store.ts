
import { vi } from 'vitest';
import { create } from 'zustand';

const useAppStoreMock = create(() => ({
    isReviewModalOpen: true,
    setIsReviewModalOpen: vi.fn(),
    selectedMedia: null,
}));

export default useAppStoreMock;
