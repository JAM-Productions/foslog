import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '@/components/footer/footer';
import pkg from '@/../package.json';

// Mock the next/link component
vi.mock('next/link', () => ({
    __esModule: true,
    default: ({ href, children }) => <a href={href}>{children}</a>,
}));

describe('Footer', () => {
    it('renders the footer with correct content', () => {
        render(<Footer />);

        // Check for copyright
        const year = new Date().getFullYear();
        expect(screen.getByText(`© ${year} Foslog`)).toBeInTheDocument();

        // Check for links
        expect(screen.getByText('Privacy Policy')).toHaveAttribute('href', '/privacy-policy');
        expect(screen.getByText('Terms of Service')).toHaveAttribute('href', '/terms-of-service');

        // Check for version link
        const versionLink = screen.getByText(`v${pkg.version}`);
        expect(versionLink).toBeInTheDocument();
        expect(versionLink).toHaveAttribute(
            'href',
            `https://github.com/JAM-Productions/foslog/releases/tag/v${pkg.version}`
        );
    });
});
