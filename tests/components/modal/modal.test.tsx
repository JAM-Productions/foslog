import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Modal from '@/components/modal/modal';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

// Mock the useBodyScrollLock hook
vi.mock('@/hooks/useBodyScrollLock', () => ({
    useBodyScrollLock: vi.fn(),
}));

describe('Modal', () => {
    const mockedUseBodyScrollLock = vi.mocked(useBodyScrollLock);
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseBodyScrollLock.mockImplementation(() => {});
    });

    it('does not render when isOpen is false', () => {
        render(
            <Modal
                isOpen={false}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
        expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('displays the description when provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
                description="This is a test description"
            >
                <div>Modal Content</div>
            </Modal>
        );

        expect(
            screen.getByText('This is a test description')
        ).toBeInTheDocument();
    });

    it('does not display description when not provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Modal Content</div>
            </Modal>
        );

        const descriptions = screen.queryAllByText(/description/i);
        expect(descriptions.length).toBe(0);
    });

    it('calls onClose when close button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Modal Content</div>
            </Modal>
        );

        const closeButton = screen.getByLabelText('Close modal');
        await user.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('shows close button by default', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
                showCloseButton={false}
            >
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('renders footer when provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
                footer={<button>Footer Button</button>}
            >
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    it('does not render footer section when not provided', () => {
        const { container } = render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Modal Content</div>
            </Modal>
        );

        // Check that there are exactly 2 divs with shrink-0 class (header + content container, but no footer)
        const shrinkDivs = container.querySelectorAll('.shrink-0');
        expect(shrinkDivs.length).toBe(1); // Only header has shrink-0 when footer is not provided
    });

    it('calls useBodyScrollLock with isOpen state', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Modal Content</div>
            </Modal>
        );

        expect(mockedUseBodyScrollLock).toHaveBeenCalledWith(true);
    });

    it('has proper aria attributes', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Modal Content</div>
            </Modal>
        );

        const modalContainer = screen
            .getByText('Test Modal')
            .closest('[aria-modal="true"]');
        expect(modalContainer).toHaveAttribute('aria-modal', 'true');
        expect(modalContainer).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('uses custom ariaLabelledBy when provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
                ariaLabelledBy="custom-id"
            >
                <div>Modal Content</div>
            </Modal>
        );

        const modalContainer = screen
            .getByText('Test Modal')
            .closest('[aria-modal="true"]');
        expect(modalContainer).toHaveAttribute('aria-labelledby', 'custom-id');
    });

    it('applies correct maxWidth class', () => {
        const { rerender } = render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
                maxWidth="sm"
            >
                <div>Modal Content</div>
            </Modal>
        );

        let modalContainer = screen
            .getByText('Test Modal')
            .closest('[aria-modal="true"]');
        expect(modalContainer).toHaveClass('max-w-sm');

        rerender(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
                maxWidth="lg"
            >
                <div>Modal Content</div>
            </Modal>
        );

        modalContainer = screen
            .getByText('Test Modal')
            .closest('[aria-modal="true"]');
        expect(modalContainer).toHaveClass('max-w-lg');
    });

    it('renders children correctly', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <div>Child 1</div>
                <div>Child 2</div>
                <span>Child 3</span>
            </Modal>
        );

        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
        expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
});
