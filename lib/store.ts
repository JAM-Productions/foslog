import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MediaType = 'film' | 'series' | 'game' | 'book' | 'music';

export interface MediaItem {
    id: string;
    title: string;
    type: MediaType;
    year?: number;
    director?: string;
    author?: string;
    artist?: string;
    genre: string[];
    poster?: string;
    cover?: string;
    description: string;
    averageRating: number;
    totalReviews: number;
}

export interface Review {
    id: string;
    mediaId: string;
    userId: string;
    rating: number;
    review?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    bio?: string;
    joinedAt: Date;
}

interface AppState {
    // Theme
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;

    // User
    user: User | null;
    setUser: (user: User | null) => void;

    // Media items
    mediaItems: MediaItem[];
    setMediaItems: (items: MediaItem[]) => void;
    addMediaItem: (item: MediaItem) => void;

    // Reviews
    reviews: Review[];
    setReviews: (reviews: Review[]) => void;
    addReview: (review: Review) => void;
    updateReview: (reviewId: string, updates: Partial<Review>) => void;
    deleteReview: (reviewId: string) => void;

    // UI state
    selectedMediaType: MediaType | 'all';
    setSelectedMediaType: (type: MediaType | 'all') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Add Review Modal
    isAddReviewModalOpen: boolean;
    setIsAddReviewModalOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set /* , get */) => ({
            // Theme
            theme: 'system',
            setTheme: (theme) => set({ theme }),

            // User
            user: null,
            setUser: (user) => set({ user }),

            // Media items
            mediaItems: [],
            setMediaItems: (mediaItems) => set({ mediaItems }),
            addMediaItem: (item) =>
                set((state) => ({
                    mediaItems: [...state.mediaItems, item],
                })),

            // Reviews
            reviews: [],
            setReviews: (reviews) => set({ reviews }),
            addReview: (review) =>
                set((state) => ({
                    reviews: [...state.reviews, review],
                })),
            updateReview: (reviewId, updates) =>
                set((state) => ({
                    reviews: state.reviews.map((review) =>
                        review.id === reviewId
                            ? { ...review, ...updates }
                            : review
                    ),
                })),
            deleteReview: (reviewId) =>
                set((state) => ({
                    reviews: state.reviews.filter(
                        (review) => review.id !== reviewId
                    ),
                })),

            // UI state
            selectedMediaType: 'all',
            setSelectedMediaType: (selectedMediaType) =>
                set({ selectedMediaType }),
            searchQuery: '',
            setSearchQuery: (searchQuery) => set({ searchQuery }),

            // Add Review Modal
            isAddReviewModalOpen: false,
            setIsAddReviewModalOpen: (isAddReviewModalOpen) =>
                set({ isAddReviewModalOpen }),
        }),
        {
            name: 'foslog-storage',
            partialize: (state) => ({
                theme: state.theme,
                user: state.user,
                reviews: state.reviews,
            }),
        }
    )
);
