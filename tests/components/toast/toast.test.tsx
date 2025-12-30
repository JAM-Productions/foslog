import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toast } from '@/components/toast/toast';
import userEvent from '@testing-library/user-event';

// Mock lucide-react
vi.mock('lucide-react', () => ({
    X: ({ className }: { className?: string }) => (
        <svg
            data-testid="x-icon"
            className={className}
        />
    ),
}));

describe('Toast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Rendering', () => {
        it('renders toast with message', () => {
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            expect(screen.getByText('Test message')).toBeInTheDocument();
        });

        it('renders with success type by default', () => {
            const onClose = vi.fn();
            const { container } = render(
                <Toast
                    message="Success message"
                    onClose={onClose}
                />
            );

            const toast = container.querySelector('[role="alert"]');
            expect(toast).toHaveClass('bg-green-600', 'text-white');
        });

        it('renders with error type', () => {
            const onClose = vi.fn();
            const { container } = render(
                <Toast
                    message="Error message"
                    type="error"
                    onClose={onClose}
                />
            );

            const toast = container.querySelector('[role="alert"]');
            expect(toast).toHaveClass('bg-red-600', 'text-white');
        });

        it('renders with info type', () => {
            const onClose = vi.fn();
            const { container } = render(
                <Toast
                    message="Info message"
                    type="info"
                    onClose={onClose}
                />
            );

            const toast = container.querySelector('[role="alert"]');
            expect(toast).toHaveClass('bg-blue-600', 'text-white');
        });

        it('renders close button', () => {
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            const closeButton = screen.getByRole('button', { name: /close/i });
            expect(closeButton).toBeInTheDocument();
        });

        it('renders X icon', () => {
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            const xIcon = screen.getByTestId('x-icon');
            expect(xIcon).toBeInTheDocument();
            expect(xIcon).toHaveClass('h-4', 'w-4');
        });
    });

    describe('Accessibility', () => {
        it('has role="alert"', () => {
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('has aria-live="polite"', () => {
            const onClose = vi.fn();
            const { container } = render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            const toast = container.querySelector('[role="alert"]');
            expect(toast).toHaveAttribute('aria-live', 'polite');
        });

        it('close button has aria-label', () => {
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            const closeButton = screen.getByRole('button', { name: /close/i });
            expect(closeButton).toHaveAttribute('aria-label', 'Close');
        });
    });

    describe('Interaction', () => {
        it('calls onClose when close button is clicked', async () => {
            vi.useRealTimers(); // Use real timers for user events
            const user = userEvent.setup();
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);
            vi.useFakeTimers(); // Switch back to fake timers
        });
    });

    describe('Auto-dismiss', () => {
        it('calls onClose after default duration', () => {
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            expect(onClose).not.toHaveBeenCalled();

            vi.advanceTimersByTime(3000);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose after custom duration', () => {
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    duration={5000}
                    onClose={onClose}
                />
            );

            vi.advanceTimersByTime(4999);
            expect(onClose).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('does not auto-dismiss when duration is 0', () => {
            const onClose = vi.fn();
            render(
                <Toast
                    message="Test message"
                    duration={0}
                    onClose={onClose}
                />
            );

            vi.advanceTimersByTime(10000);

            expect(onClose).not.toHaveBeenCalled();
        });

        it('cleans up timer on unmount', () => {
            const onClose = vi.fn();
            const { unmount } = render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            unmount();
            vi.advanceTimersByTime(3000);

            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('Styling', () => {
        it('applies fixed positioning', () => {
            const onClose = vi.fn();
            const { container } = render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            const toast = container.querySelector('[role="alert"]');
            expect(toast).toHaveClass('fixed', 'bottom-4', 'right-4', 'z-50');
        });

        it('applies proper spacing and sizing', () => {
            const onClose = vi.fn();
            const { container } = render(
                <Toast
                    message="Test message"
                    onClose={onClose}
                />
            );

            const toast = container.querySelector('[role="alert"]');
            expect(toast).toHaveClass(
                'min-w-[300px]',
                'max-w-md',
                'rounded-lg',
                'px-4',
                'py-3',
                'shadow-lg'
            );
        });
    });
});
