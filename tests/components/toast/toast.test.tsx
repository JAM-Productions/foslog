import { render, screen, act, waitFor } from '@testing-library/react';
import { Toast } from '@/components/toast/toast';
import { useToast } from '@/hooks/use-toast';
import { vi } from 'vitest';

// mock lucide-react
vi.mock('lucide-react', () => ({
    Check: () => <svg />,
}));

describe('Toast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Reset Zustand store before each test
        act(() => {
            useToast.setState({ message: null });
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should not render when there is no message', () => {
        render(<Toast />);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should render when there is a message', () => {
        act(() => {
            useToast.getState().showToast('Test message');
        });
        render(<Toast />);
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should hide after 3 seconds', async () => {
        act(() => {
            useToast.getState().showToast('Test message');
        });
        render(<Toast />);
        expect(screen.getByText('Test message')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
});
