import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OptionsModal from '@/components/modal/options-modal';
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { useTranslations } from 'next-intl';

// Mock dependencies
vi.mock('@/lib/options-modal-store', () => ({
    useOptionsModalStore: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

vi.mock('@/components/modal/modal', () => ({
    default: ({
        children,
        isModalOpen,
    }: {
        children: React.ReactNode;
        isModalOpen: boolean;
    }) => (isModalOpen ? <div data-testid="modal">{children}</div> : null),
}));

vi.mock('@/hooks/use-body-scroll-lock', () => ({
    useBodyScrollLock: vi.fn(),
}));

describe('OptionsModal', () => {
    const mockHideModal = vi.fn();
    const mockCtaAction = vi.fn();
    const mockedUseOptionsModalStore = vi.mocked(useOptionsModalStore);
    const mockedUseTranslations = vi.mocked(useTranslations);

    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            goBack: 'Go Back',
        };
        return translations[key] || key;
    });

    const defaultModalState = {
        title: 'Delete Item',
        description: 'Are you sure you want to delete this item?',
        ctaText: 'Delete',
        ctaAction: mockCtaAction,
        isCTALoading: false,
        isOpen: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>
        );
        mockedUseOptionsModalStore.mockReturnValue({
            modal: defaultModalState,
            hideModal: mockHideModal,
        } as unknown as ReturnType<typeof useOptionsModalStore>);
    });

    describe('when modal is closed', () => {
        it('does not render modal content', () => {
            render(<OptionsModal />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('when modal is open', () => {
        beforeEach(() => {
            mockedUseOptionsModalStore.mockReturnValue({
                modal: { ...defaultModalState, isOpen: true },
                hideModal: mockHideModal,
            } as unknown as ReturnType<typeof useOptionsModalStore>);
        });

        it('renders the modal', () => {
            render(<OptionsModal />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('displays the title', () => {
            render(<OptionsModal />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveTextContent('Delete Item');
        });

        it('displays the description', () => {
            render(<OptionsModal />);

            expect(
                screen.getByText('Are you sure you want to delete this item?')
            ).toBeInTheDocument();
        });

        it('renders go back button', () => {
            render(<OptionsModal />);

            const goBackButton = screen.getByRole('button', {
                name: /go back/i,
            });
            expect(goBackButton).toBeInTheDocument();
        });

        it('renders CTA button with correct text', () => {
            render(<OptionsModal />);

            const ctaButton = screen.getByRole('button', { name: /delete/i });
            expect(ctaButton).toBeInTheDocument();
        });

        it('calls hideModal when go back button is clicked', async () => {
            const user = userEvent.setup();
            render(<OptionsModal />);

            const goBackButton = screen.getByRole('button', {
                name: /go back/i,
            });
            await user.click(goBackButton);

            expect(mockHideModal).toHaveBeenCalledWith();
            expect(mockHideModal).toHaveBeenCalledTimes(1);
        });

        it('calls ctaAction when CTA button is clicked', async () => {
            const user = userEvent.setup();
            render(<OptionsModal />);

            const ctaButton = screen.getByRole('button', { name: /delete/i });
            await user.click(ctaButton);

            expect(mockCtaAction).toHaveBeenCalledWith();
            expect(mockCtaAction).toHaveBeenCalledTimes(1);
        });

        it('title has correct styling classes', () => {
            render(<OptionsModal />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveClass('text-2xl', 'font-semibold');
        });

        it('description has muted foreground class', () => {
            render(<OptionsModal />);

            const description = screen.getByText(
                'Are you sure you want to delete this item?'
            );
            expect(description).toHaveClass('text-muted-foreground');
        });

        it('go back button has secondary variant', () => {
            render(<OptionsModal />);

            const goBackButton = screen.getByRole('button', {
                name: /go back/i,
            });
            expect(goBackButton).toHaveClass('bg-secondary');
        });

        it('CTA button has destructive variant', () => {
            render(<OptionsModal />);

            const ctaButton = screen.getByRole('button', { name: /delete/i });
            expect(ctaButton).toHaveClass('bg-destructive');
        });
    });

    describe('when CTA is loading', () => {
        beforeEach(() => {
            mockedUseOptionsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    isCTALoading: true,
                },
                hideModal: mockHideModal,
            } as unknown as ReturnType<typeof useOptionsModalStore>);
        });

        it('disables go back button', () => {
            render(<OptionsModal />);

            const goBackButton = screen.getByRole('button', {
                name: /go back/i,
            });
            expect(goBackButton).toBeDisabled();
        });

        it('disables CTA button', () => {
            render(<OptionsModal />);

            const ctaButton = screen.getByRole('button', { name: /delete/i });
            expect(ctaButton).toBeDisabled();
        });

        it('displays loading spinner', () => {
            render(<OptionsModal />);

            const spinner = screen.getByTestId('modal').querySelector('svg');
            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveClass('animate-spin');
        });

        it('makes CTA button text transparent when loading', () => {
            render(<OptionsModal />);

            const ctaButton = screen.getByRole('button', { name: /delete/i });
            expect(ctaButton).toHaveClass('text-transparent');
        });
    });

    describe('with different modal content', () => {
        it('renders custom title and description', () => {
            mockedUseOptionsModalStore.mockReturnValue({
                modal: {
                    title: 'Confirm Action',
                    description: 'This action cannot be undone.',
                    ctaText: 'Confirm',
                    ctaAction: mockCtaAction,
                    isCTALoading: false,
                    isOpen: true,
                },
                hideModal: mockHideModal,
            } as unknown as ReturnType<typeof useOptionsModalStore>);

            render(<OptionsModal />);

            expect(screen.getByText('Confirm Action')).toBeInTheDocument();
            expect(
                screen.getByText('This action cannot be undone.')
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /confirm/i })
            ).toBeInTheDocument();
        });

        it('renders different CTA text', () => {
            mockedUseOptionsModalStore.mockReturnValue({
                modal: {
                    title: 'Save Changes',
                    description: 'Do you want to save your changes?',
                    ctaText: 'Save',
                    ctaAction: mockCtaAction,
                    isCTALoading: false,
                    isOpen: true,
                },
                hideModal: mockHideModal,
            } as unknown as ReturnType<typeof useOptionsModalStore>);

            render(<OptionsModal />);

            const saveButton = screen.getByRole('button', { name: /save/i });
            expect(saveButton).toBeInTheDocument();
        });
    });

    describe('button interaction states', () => {
        beforeEach(() => {
            mockedUseOptionsModalStore.mockReturnValue({
                modal: { ...defaultModalState, isOpen: true },
                hideModal: mockHideModal,
            } as unknown as ReturnType<typeof useOptionsModalStore>);
        });

        it('go back button is enabled when not loading', () => {
            render(<OptionsModal />);

            const goBackButton = screen.getByRole('button', {
                name: /go back/i,
            });
            expect(goBackButton).not.toBeDisabled();
        });

        it('CTA button is enabled when not loading', () => {
            render(<OptionsModal />);

            const ctaButton = screen.getByRole('button', { name: /delete/i });
            expect(ctaButton).not.toBeDisabled();
        });

        it('does not call ctaAction multiple times when clicking disabled button', async () => {
            const user = userEvent.setup();
            mockedUseOptionsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    isCTALoading: true,
                },
                hideModal: mockHideModal,
            } as unknown as ReturnType<typeof useOptionsModalStore>);

            render(<OptionsModal />);

            const ctaButton = screen.getByRole('button', { name: /delete/i });
            await user.click(ctaButton);

            expect(mockCtaAction).not.toHaveBeenCalled();
        });
    });

    describe('layout and structure', () => {
        beforeEach(() => {
            mockedUseOptionsModalStore.mockReturnValue({
                modal: { ...defaultModalState, isOpen: true },
                hideModal: mockHideModal,
            } as unknown as ReturnType<typeof useOptionsModalStore>);
        });

        it('has correct modal content structure', () => {
            render(<OptionsModal />);

            const modal = screen.getByTestId('modal');
            const container = modal.firstChild as HTMLElement;
            expect(container).toHaveClass(
                'flex',
                'h-full',
                'w-full',
                'flex-col',
                'justify-between'
            );
        });

        it('has both buttons in the footer', () => {
            render(<OptionsModal />);

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(2);
        });

        it('buttons container has responsive layout classes', () => {
            render(<OptionsModal />);

            const goBackButton = screen.getByRole('button', {
                name: /go back/i,
            });
            const buttonsContainer = goBackButton.closest('div');
            expect(buttonsContainer).toHaveClass(
                'flex',
                'w-full',
                'flex-col',
                'gap-3',
                'sm:flex-row'
            );
        });
    });

    describe('accessibility', () => {
        beforeEach(() => {
            mockedUseOptionsModalStore.mockReturnValue({
                modal: { ...defaultModalState, isOpen: true },
                hideModal: mockHideModal,
            } as unknown as ReturnType<typeof useOptionsModalStore>);
        });

        it('title has correct id for accessibility', () => {
            render(<OptionsModal />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveAttribute('id', 'modal-title');
        });

        it('all interactive elements are keyboard accessible', () => {
            render(<OptionsModal />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button.tagName).toBe('BUTTON');
            });
        });
    });
});
