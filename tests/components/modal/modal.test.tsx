import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Modal from '@/components/modal/modal';

describe('Modal', () => {
    const mockChildren = <div data-testid="modal-content">Modal Content</div>;

    describe('when modal is closed', () => {
        it('does not render when isModalOpen is false', () => {
            render(<Modal isModalOpen={false}>{mockChildren}</Modal>);

            expect(
                screen.queryByTestId('modal-content')
            ).not.toBeInTheDocument();
        });

        it('does not render overlay when isModalOpen is false', () => {
            const { container } = render(
                <Modal isModalOpen={false}>{mockChildren}</Modal>
            );

            const overlay = container.querySelector('.fixed.inset-0');
            expect(overlay).not.toBeInTheDocument();
        });

        it('returns null when closed', () => {
            const { container } = render(
                <Modal isModalOpen={false}>{mockChildren}</Modal>
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe('when modal is open', () => {
        it('renders modal content when isModalOpen is true', () => {
            render(<Modal isModalOpen={true}>{mockChildren}</Modal>);

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });

        it('renders children inside modal', () => {
            render(
                <Modal isModalOpen={true}>
                    <p>Test content</p>
                </Modal>
            );

            expect(screen.getByText('Test content')).toBeInTheDocument();
        });

        it('renders overlay with correct classes', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const overlay = container.querySelector('.fixed.inset-0');
            expect(overlay).toBeInTheDocument();
            expect(overlay).toHaveClass(
                'fixed',
                'inset-0',
                'z-50',
                'flex',
                'items-center',
                'justify-center',
                'bg-black/60',
                'sm:p-5'
            );
        });

        it('renders modal container with correct classes', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toBeInTheDocument();
            expect(modalContainer).toHaveClass(
                'bg-muted',
                'flex',
                'h-screen',
                'w-full',
                'max-w-4xl',
                'flex-col',
                'p-5',
                'sm:h-auto',
                'sm:max-h-[90vh]',
                'sm:rounded-lg',
                'sm:border'
            );
        });

        it('has correct aria attributes for accessibility', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveAttribute('aria-modal', 'true');
            expect(modalContainer).toHaveAttribute(
                'aria-labelledby',
                'modal-title'
            );
        });

        it('renders multiple children correctly', () => {
            render(
                <Modal isModalOpen={true}>
                    <h1>Title</h1>
                    <p>Content</p>
                    <button>Action</button>
                </Modal>
            );

            expect(
                screen.getByRole('heading', { name: /title/i })
            ).toBeInTheDocument();
            expect(screen.getByText('Content')).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /action/i })
            ).toBeInTheDocument();
        });

        it('has backdrop overlay with correct z-index', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const overlay = container.querySelector('.fixed.inset-0');
            expect(overlay).toHaveClass('z-50');
        });

        it('modal container is centered in overlay', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const overlay = container.querySelector('.fixed.inset-0');
            expect(overlay).toHaveClass(
                'flex',
                'items-center',
                'justify-center'
            );
        });

        it('has responsive height classes', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveClass('h-screen', 'sm:h-auto');
        });

        it('has responsive rounded corners', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveClass('sm:rounded-lg');
        });

        it('has responsive border', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveClass('sm:border');
        });

        it('has responsive max height', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveClass('sm:max-h-[90vh]');
        });

        it('has max width constraint', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveClass('max-w-4xl');
        });

        it('has flex column layout', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveClass('flex', 'flex-col');
        });

        it('has padding applied', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveClass('p-5');
        });

        it('overlay has responsive padding', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const overlay = container.querySelector('.fixed.inset-0');
            expect(overlay).toHaveClass('sm:p-5');
        });
    });

    describe('state changes', () => {
        it('shows modal when state changes from closed to open', () => {
            const { rerender } = render(
                <Modal isModalOpen={false}>{mockChildren}</Modal>
            );

            expect(
                screen.queryByTestId('modal-content')
            ).not.toBeInTheDocument();

            rerender(<Modal isModalOpen={true}>{mockChildren}</Modal>);

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });

        it('hides modal when state changes from open to closed', () => {
            const { rerender } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            expect(screen.getByTestId('modal-content')).toBeInTheDocument();

            rerender(<Modal isModalOpen={false}>{mockChildren}</Modal>);

            expect(
                screen.queryByTestId('modal-content')
            ).not.toBeInTheDocument();
        });

        it('updates children when modal is open', () => {
            const { rerender } = render(
                <Modal isModalOpen={true}>
                    <p>Original content</p>
                </Modal>
            );

            expect(screen.getByText('Original content')).toBeInTheDocument();

            rerender(
                <Modal isModalOpen={true}>
                    <p>Updated content</p>
                </Modal>
            );

            expect(
                screen.queryByText('Original content')
            ).not.toBeInTheDocument();
            expect(screen.getByText('Updated content')).toBeInTheDocument();
        });
    });

    describe('structure', () => {
        it('has correct DOM hierarchy', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const overlay = container.querySelector('.fixed.inset-0');
            const modalContainer = overlay?.querySelector(
                '[aria-modal="true"]'
            );
            const content = modalContainer?.querySelector(
                '[data-testid="modal-content"]'
            );

            expect(overlay).toBeInTheDocument();
            expect(modalContainer).toBeInTheDocument();
            expect(content).toBeInTheDocument();
        });

        it('backdrop is full screen', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const overlay = container.querySelector('.fixed.inset-0');
            expect(overlay).toHaveClass('fixed', 'inset-0');
        });

        it('modal container is full width', () => {
            const { container } = render(
                <Modal isModalOpen={true}>{mockChildren}</Modal>
            );

            const modalContainer = container.querySelector(
                '[aria-modal="true"]'
            );
            expect(modalContainer).toHaveClass('w-full');
        });
    });
});
