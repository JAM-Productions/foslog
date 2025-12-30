import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useToast } from '@/hooks/useToast';

describe('useToast', () => {
    describe('Initial state', () => {
        it('starts with toast not visible', () => {
            const { result } = renderHook(() => useToast());

            expect(result.current.toast.isVisible).toBe(false);
        });

        it('starts with empty message', () => {
            const { result } = renderHook(() => useToast());

            expect(result.current.toast.message).toBe('');
        });

        it('starts with success type', () => {
            const { result } = renderHook(() => useToast());

            expect(result.current.toast.type).toBe('success');
        });
    });

    describe('showToast', () => {
        it('shows toast with message and default type', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('Test message');
            });

            expect(result.current.toast.isVisible).toBe(true);
            expect(result.current.toast.message).toBe('Test message');
            expect(result.current.toast.type).toBe('success');
        });

        it('shows toast with custom type', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('Error message', 'error');
            });

            expect(result.current.toast.isVisible).toBe(true);
            expect(result.current.toast.message).toBe('Error message');
            expect(result.current.toast.type).toBe('error');
        });

        it('shows toast with info type', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('Info message', 'info');
            });

            expect(result.current.toast.isVisible).toBe(true);
            expect(result.current.toast.message).toBe('Info message');
            expect(result.current.toast.type).toBe('info');
        });

        it('updates message when called multiple times', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('First message');
            });

            expect(result.current.toast.message).toBe('First message');

            act(() => {
                result.current.showToast('Second message');
            });

            expect(result.current.toast.message).toBe('Second message');
            expect(result.current.toast.isVisible).toBe(true);
        });

        it('can change type when called multiple times', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('Success message', 'success');
            });

            expect(result.current.toast.type).toBe('success');

            act(() => {
                result.current.showToast('Error message', 'error');
            });

            expect(result.current.toast.type).toBe('error');
        });
    });

    describe('hideToast', () => {
        it('hides visible toast', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('Test message');
            });

            expect(result.current.toast.isVisible).toBe(true);

            act(() => {
                result.current.hideToast();
            });

            expect(result.current.toast.isVisible).toBe(false);
        });

        it('preserves message and type when hiding', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('Test message', 'error');
            });

            act(() => {
                result.current.hideToast();
            });

            expect(result.current.toast.isVisible).toBe(false);
            expect(result.current.toast.message).toBe('Test message');
            expect(result.current.toast.type).toBe('error');
        });

        it('can be called when toast is already hidden', () => {
            const { result } = renderHook(() => useToast());

            expect(result.current.toast.isVisible).toBe(false);

            act(() => {
                result.current.hideToast();
            });

            expect(result.current.toast.isVisible).toBe(false);
        });
    });

    describe('Function stability', () => {
        it('showToast maintains reference across renders', () => {
            const { result, rerender } = renderHook(() => useToast());

            const firstShowToast = result.current.showToast;
            rerender();
            const secondShowToast = result.current.showToast;

            expect(firstShowToast).toBe(secondShowToast);
        });

        it('hideToast maintains reference across renders', () => {
            const { result, rerender } = renderHook(() => useToast());

            const firstHideToast = result.current.hideToast;
            rerender();
            const secondHideToast = result.current.hideToast;

            expect(firstHideToast).toBe(secondHideToast);
        });
    });

    describe('Complex scenarios', () => {
        it('handles rapid show/hide cycles', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('Message 1');
                result.current.hideToast();
                result.current.showToast('Message 2');
            });

            expect(result.current.toast.isVisible).toBe(true);
            expect(result.current.toast.message).toBe('Message 2');
        });

        it('handles showing new toast while one is visible', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.showToast('First message', 'success');
            });

            act(() => {
                result.current.showToast('Second message', 'error');
            });

            expect(result.current.toast.isVisible).toBe(true);
            expect(result.current.toast.message).toBe('Second message');
            expect(result.current.toast.type).toBe('error');
        });
    });
});
