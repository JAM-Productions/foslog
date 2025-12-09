import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from '@/components/modal/modal';

describe('Modal', () => {
    it('renders the modal when isOpen is true', () => {
        render(
            <Modal
                isOpen={true}
                onClose={() => {}}
                title="Test Modal"
                description="This is a test modal"
            >
                <p>Modal Content</p>
            </Modal>
        );

        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByTestId('modal-container')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            'Test Modal'
        );
        expect(screen.getByTestId('modal-description')).toHaveTextContent(
            'This is a test modal'
        );
        expect(screen.getByTestId('modal-body')).toHaveTextContent(
            'Modal Content'
        );
    });

    it('does not render the modal when isOpen is false', () => {
        render(
            <Modal
                isOpen={false}
                onClose={() => {}}
                title="Test Modal"
                description="This is a test modal"
            >
                <p>Modal Content</p>
            </Modal>
        );

        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('calls the onClose function when the close button is clicked', () => {
        const onClose = vi.fn();
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test Modal"
                description="This is a test modal"
            >
                <p>Modal Content</p>
            </Modal>
        );

        fireEvent.click(screen.getByTestId('modal-close-button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders the footer when it is provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={() => {}}
                title="Test Modal"
                description="This is a test modal"
                footer={<p>Modal Footer</p>}
            >
                <p>Modal Content</p>
            </Modal>
        );

        expect(screen.getByTestId('modal-footer')).toHaveTextContent(
            'Modal Footer'
        );
    });

    it('does not render the footer when it is not provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={() => {}}
                title="Test Modal"
                description="This is a test modal"
            >
                <p>Modal Content</p>
            </Modal>
        );

        expect(screen.queryByTestId('modal-footer')).not.toBeInTheDocument();
    });
});
