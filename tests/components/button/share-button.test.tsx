import { render, screen, fireEvent } from '@testing-library/react';
import { ShareButton } from '@/components/button/share-button';
import { useToast } from '@/hooks/use-toast';
import { vi } from 'vitest';

// Mock the useToast hook
vi.mock('@/hooks/use-toast');

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key) => key,
}));

describe('ShareButton', () => {
    const showToast = vi.fn();

    beforeEach(() => {
        vi.mocked(useToast).mockReturnValue({
            message: null,
            showToast,
            hideToast: vi.fn(),
        });
        Object.assign(navigator, {
            share: undefined,
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render children', () => {
        render(<ShareButton><span>Share Me</span></ShareButton>);
        expect(screen.getByText('Share Me')).toBeInTheDocument();
    });

    it('should copy the URL to the clipboard on desktop', async () => {
        render(<ShareButton><span>Share Me</span></ShareButton>);
        const shareButton = screen.getByRole('button', { name: 'Share' });

        await fireEvent.click(shareButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
        expect(showToast).toHaveBeenCalledWith('urlCopied');
    });

    it('should call navigator.share on mobile', async () => {
        const share = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            share,
        });

        render(<ShareButton><span>Share Me</span></ShareButton>);
        const shareButton = screen.getByRole('button', { name: 'Share' });

        await fireEvent.click(shareButton);

        expect(share).toHaveBeenCalledWith({
            title: document.title,
            url: window.location.href,
        });
        expect(showToast).not.toHaveBeenCalled();
    });

    it('should log an error if sharing fails', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const share = vi.fn().mockRejectedValue('Error');
        Object.assign(navigator, {
            share,
        });

        render(<ShareButton><span>Share Me</span></ShareButton>);
        const shareButton = screen.getByRole('button', { name: 'Share' });

        await fireEvent.click(shareButton);

        expect(consoleError).toHaveBeenCalledWith('Error sharing', 'Error');
        consoleError.mockRestore();
    });
});
