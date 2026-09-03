import { CollapsibleCard } from '@/components/collapsible-card';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

const getBody = (toggle: HTMLElement) =>
    document.getElementById(toggle.getAttribute('aria-controls') ?? '');

describe('CollapsibleCard', () => {
    test('starts collapsed on phones and stays open from sm up', () => {
        render(
            <CollapsibleCard title="Stats">
                <p>body</p>
            </CollapsibleCard>
        );

        const toggle = screen.getByRole('button', { name: 'Stats' });

        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(getBody(toggle)).toHaveClass('hidden', 'sm:block');
    });

    test('expands and collapses when the toggle is used', async () => {
        const user = userEvent.setup();

        render(
            <CollapsibleCard title="Stats">
                <p>body</p>
            </CollapsibleCard>
        );

        const toggle = screen.getByRole('button', { name: 'Stats' });

        await user.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(getBody(toggle)).not.toHaveClass('hidden');

        await user.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(getBody(toggle)).toHaveClass('hidden', 'sm:block');
    });

    test('keeps the body content out of the toggle', () => {
        render(
            <CollapsibleCard title="Stats">
                <p>body</p>
            </CollapsibleCard>
        );

        const toggle = screen.getByRole('button', { name: 'Stats' });

        expect(toggle).not.toHaveTextContent('body');
        expect(within(getBody(toggle)!).getByText('body')).toBeInTheDocument();
    });
});
