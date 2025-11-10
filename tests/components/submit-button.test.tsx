
import { render, screen } from '@testing-library/react';
import SubmitButton from '@/components/submit-button';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

describe('SubmitButton', () => {
    it('renders the button with the correct text', () => {
        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <SubmitButton
                    isDisabled={false}
                    isLoading={false}
                    onClick={() => {}}
                />
            </NextIntlClientProvider>
        );
        expect(screen.getByRole('button')).toHaveTextContent('Submit Review');
    });

    it('disables the button when isDisabled is true', () => {
        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <SubmitButton
                    isDisabled={true}
                    isLoading={false}
                    onClick={() => {}}
                />
            </NextIntlClientProvider>
        );
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows the loader when isLoading is true', () => {
        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <SubmitButton
                    isDisabled={false}
                    isLoading={true}
                    onClick={() => {}}
                />
            </NextIntlClientProvider>
        );
        expect(screen.getByRole('button')).toHaveClass('text-transparent');
    });
});
