import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compressImageToBase64 } from '@/utils/image-utils';

/**
 * jsdom does not decode images or implement canvas, so both are stubbed to
 * observe the resizing maths and the produced data URL.
 */
describe('compressImageToBase64', () => {
    let drawImage: ReturnType<typeof vi.fn>;
    let toDataURL: ReturnType<typeof vi.fn>;
    let canvas: any;
    let imageInstances: any[];

    beforeEach(() => {
        drawImage = vi.fn();
        toDataURL = vi.fn(() => 'data:image/jpeg;base64,compressed');
        canvas = {
            width: 0,
            height: 0,
            getContext: vi.fn(() => ({ drawImage })),
            toDataURL,
        };
        vi.spyOn(document, 'createElement').mockImplementation(((
            tag: string
        ) =>
            tag === 'canvas'
                ? canvas
                : ({} as HTMLElement)) as typeof document.createElement);

        imageInstances = [];
        vi.stubGlobal(
            'Image',
            class {
                onload: (() => void) | null = null;
                onerror: (() => void) | null = null;
                width = 0;
                height = 0;
                private _src = '';

                constructor() {
                    imageInstances.push(this);
                }

                set src(value: string) {
                    this._src = value;
                }

                get src() {
                    return this._src;
                }
            }
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    const runWithImage = async (width: number, height: number) => {
        const file = new File(['x'], 'cover.png', { type: 'image/png' });
        const promise = compressImageToBase64(file);

        // Wait for FileReader to emit its load event, then simulate decoding.
        await vi.waitFor(() => expect(imageInstances).toHaveLength(1));
        const img = imageInstances[0];
        img.width = width;
        img.height = height;
        img.onload?.();

        return promise;
    };

    it('returns the canvas data URL', async () => {
        await expect(runWithImage(200, 200)).resolves.toBe(
            'data:image/jpeg;base64,compressed'
        );
        expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7);
    });

    it('does not upscale images smaller than the bounds', async () => {
        await runWithImage(120, 80);

        expect(canvas.width).toBe(120);
        expect(canvas.height).toBe(80);
    });

    it('scales down landscape images keeping the aspect ratio', async () => {
        await runWithImage(1000, 500);

        expect(canvas.width).toBe(400);
        expect(canvas.height).toBe(200);
    });

    it('scales down portrait images keeping the aspect ratio', async () => {
        await runWithImage(500, 1000);

        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(400);
    });

    it('rejects when the image cannot be decoded', async () => {
        const file = new File(['x'], 'cover.png', { type: 'image/png' });
        const promise = compressImageToBase64(file);

        await vi.waitFor(() => expect(imageInstances).toHaveLength(1));
        imageInstances[0].onerror?.();

        await expect(promise).rejects.toThrow('Could not load image file');
    });
});
