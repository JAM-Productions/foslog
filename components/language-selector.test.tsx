import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSelector from './language-selector';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

vi.mock('next-intl', () => ({
    useLocale: vi.fn(),
    useTranslations: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
}));

const mockReplace = vi.fn();
const mockUseRouter = vi.mocked(useRouter);
const mockUsePathname = vi.mocked(usePathname);
const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

describe('LanguageSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseRouter.mockReturnValue({
            replace: mockReplace,
        } as unknown as ReturnType<typeof useRouter>);

        mockUsePathname.mockReturnValue('/test-path');

        mockUseTranslations.mockReturnValue(((key: string) => {
            const translations = {
                selectLanguage: 'Select language',
                languageOptions: 'Language options',
            };
            return translations[key as keyof typeof translations] || key;
        }) as unknown as ReturnType<typeof useTranslations>);
    });

    it('renders with English locale', () => {
        mockUseLocale.mockReturnValue('en');

        render(<LanguageSelector />);

        expect(
            screen.getByRole('button', { name: 'Select language' })
        ).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('renders with Spanish locale', () => {
        mockUseLocale.mockReturnValue('es');

        render(<LanguageSelector />);

        expect(screen.getByText('Español')).toBeInTheDocument();
    });

    it('renders with Catalan locale', () => {
        mockUseLocale.mockReturnValue('ca');

        render(<LanguageSelector />);

        expect(screen.getByText('Català')).toBeInTheDocument();
    });

    it('defaults to English for unknown locale', () => {
        mockUseLocale.mockReturnValue('unknown');

        render(<LanguageSelector />);

        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
        mockUseLocale.mockReturnValue('en');

        render(<LanguageSelector />);

        const button = screen.getByRole('button', { name: 'Select language' });
        fireEvent.click(button);

        await waitFor(() => {
            expect(
                screen.getByRole('listbox', { name: 'Language options' })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /English/ })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /Español/ })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /Català/ })
            ).toBeInTheDocument();
        });
    });

    it('changes locale when option is selected', async () => {
        mockUseLocale.mockReturnValue('en');

        render(<LanguageSelector />);

        const button = screen.getByRole('button', { name: 'Select language' });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        const spanishOption = screen.getByRole('option', { name: /Español/ });
        fireEvent.click(spanishOption);

        expect(mockReplace).toHaveBeenCalledWith('/test-path', {
            locale: 'es',
        });
    });

    it('shows current locale as selected', async () => {
        mockUseLocale.mockReturnValue('es');

        render(<LanguageSelector />);

        const button = screen.getByRole('button', { name: 'Select language' });
        fireEvent.click(button);

        await waitFor(() => {
            const spanishOption = screen.getByRole('option', {
                name: /Español/,
            });
            expect(spanishOption).toHaveAttribute('aria-selected', 'true');
        });
    });

    it('closes dropdown after selecting an option', async () => {
        mockUseLocale.mockReturnValue('en');

        render(<LanguageSelector />);

        const button = screen.getByRole('button', { name: 'Select language' });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        const spanishOption = screen.getByRole('option', { name: /Español/ });
        fireEvent.click(spanishOption);

        await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
    });

    it('has proper accessibility attributes', () => {
        mockUseLocale.mockReturnValue('en');

        render(<LanguageSelector />);

        const button = screen.getByRole('button', { name: 'Select language' });

        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('updates aria-expanded when dropdown opens', async () => {
        mockUseLocale.mockReturnValue('en');

        render(<LanguageSelector />);

        const button = screen.getByRole('button', { name: 'Select language' });
        fireEvent.click(button);

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-expanded', 'true');
        });
    });

    it('displays country code on small screens', () => {
        mockUseLocale.mockReturnValue('en');
        render(<LanguageSelector />);
        expect(screen.getByText('English')).toHaveClass('hidden', 'sm:inline');
        expect(screen.getByText('EN')).toHaveClass('sm:hidden');
    });
});
