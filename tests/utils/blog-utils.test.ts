import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

// Mock fs module using vi.hoisted
const { readFileMock, readdirMock, statMock } = vi.hoisted(() => ({
    readFileMock: vi.fn(),
    readdirMock: vi.fn(),
    statMock: vi.fn(),
}));

vi.mock('fs', () => {
    const mockFs = {
        promises: {
            readFile: readFileMock,
            readdir: readdirMock,
            stat: statMock,
        },
    };
    return {
        default: mockFs,
        ...mockFs,
    };
});

// Import after mocking
import {
    getBlogPost,
    getAllBlogPosts,
    getBlogPostsByCategory,
    getBlogCategories,
} from '@/utils/blog-utils';

describe('blog-utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getBlogPost', () => {
        test('should return a blog post with parsed frontmatter', async () => {
            const mockContent = `---
title: "Test Post"
date: "2025-12-31"
category: "releases"
description: "Test description"
---

# Test Content

This is the post content.`;

            readFileMock.mockResolvedValue(mockContent);

            const post = await getBlogPost('en', 'releases', 'test-post');

            expect(post).toEqual({
                slug: 'test-post',
                title: 'Test Post',
                date: '2025-12-31',
                category: 'releases',
                description: 'Test description',
                content: '# Test Content\n\nThis is the post content.',
            });

            expect(readFileMock).toHaveBeenCalledWith(
                path.join(
                    process.cwd(),
                    '_blog',
                    'en',
                    'releases',
                    'test-post.md'
                ),
                'utf-8'
            );
        });

        test('should return null if file does not exist', async () => {
            readFileMock.mockRejectedValue(new Error('File not found'));

            const post = await getBlogPost('en', 'releases', 'nonexistent');

            expect(post).toBeNull();
        });

        test('should handle markdown without frontmatter', async () => {
            const mockContent = `# Test Content

This is content without frontmatter.`;

            readFileMock.mockResolvedValue(mockContent);

            const post = await getBlogPost('en', 'releases', 'no-frontmatter');

            expect(post).toEqual({
                slug: 'no-frontmatter',
                title: 'Untitled',
                date: '',
                category: 'releases',
                description: '',
                content: mockContent,
            });
        });

        test('should remove quotes from frontmatter values', async () => {
            const mockContent = `---
title: "Quoted Title"
date: '2025-12-31'
category: releases
description: "Quoted description"
---

Content`;

            readFileMock.mockResolvedValue(mockContent);

            const post = await getBlogPost('en', 'releases', 'quoted');

            expect(post?.title).toBe('Quoted Title');
            expect(post?.date).toBe('2025-12-31');
            expect(post?.description).toBe('Quoted description');
        });
    });

    describe('getAllBlogPosts', () => {
        test('should return all blog posts sorted by date', async () => {
            const mockPost1 = `---
title: "Post 1"
date: "2025-12-31"
category: "releases"
description: "First post"
---

Content 1`;

            const mockPost2 = `---
title: "Post 2"
date: "2025-12-30"
category: "films"
description: "Second post"
---

Content 2`;

            readdirMock
                .mockResolvedValueOnce(['releases', 'films'] as any)
                .mockResolvedValueOnce(['post-1.md'] as any)
                .mockResolvedValueOnce(['post-2.md'] as any);

            statMock.mockResolvedValue({
                isDirectory: () => true,
            } as any);

            readFileMock
                .mockResolvedValueOnce(mockPost1)
                .mockResolvedValueOnce(mockPost2);

            const posts = await getAllBlogPosts('en');

            expect(posts).toHaveLength(2);
            expect(posts[0].title).toBe('Post 1'); // Newer first
            expect(posts[1].title).toBe('Post 2');
            expect(posts[0].slug).toBe('releases/post-1');
            expect(posts[1].slug).toBe('films/post-2');
        });

        test('should return empty array if blog directory does not exist', async () => {
            readdirMock.mockRejectedValue(new Error('Directory not found'));

            const posts = await getAllBlogPosts('en');

            expect(posts).toEqual([]);
        });

        test('should filter out non-markdown files', async () => {
            readdirMock
                .mockResolvedValueOnce(['releases'] as any)
                .mockResolvedValueOnce([
                    'post-1.md',
                    'image.png',
                    'readme.txt',
                ] as any);

            statMock.mockResolvedValue({
                isDirectory: () => true,
            } as any);

            readFileMock.mockResolvedValue(`---
title: "Valid Post"
date: "2025-12-31"
category: "releases"
description: "Description"
---

Content`);

            const posts = await getAllBlogPosts('en');

            expect(posts).toHaveLength(1);
            expect(posts[0].title).toBe('Valid Post');
        });

        test('should skip non-directory items in blog root', async () => {
            readdirMock.mockResolvedValueOnce(['releases', 'readme.md'] as any);

            statMock.mockImplementation((async (filePath: any) => {
                const pathStr = String(filePath);
                if (pathStr.includes('releases')) {
                    return { isDirectory: () => true } as any;
                }
                return { isDirectory: () => false } as any;
            }) as any);

            readdirMock
                .mockResolvedValueOnce(['releases', 'readme.md'] as any)
                .mockResolvedValueOnce(['post-1.md'] as any);

            readFileMock.mockResolvedValue(`---
title: "Post"
date: "2025-12-31"
category: "releases"
description: "Description"
---

Content`);

            const posts = await getAllBlogPosts('en');

            expect(posts).toHaveLength(1);
        });
    });

    describe('getBlogPostsByCategory', () => {
        test('should return all posts when category is "all"', async () => {
            const mockPost1 = `---
title: "Post 1"
date: "2025-12-31"
category: "releases"
description: "First post"
---

Content 1`;

            const mockPost2 = `---
title: "Post 2"
date: "2025-12-30"
category: "films"
description: "Second post"
---

Content 2`;

            readdirMock
                .mockResolvedValueOnce(['releases', 'films'] as any)
                .mockResolvedValueOnce(['post-1.md'] as any)
                .mockResolvedValueOnce(['post-2.md'] as any);

            statMock.mockResolvedValue({
                isDirectory: () => true,
            } as any);

            readFileMock
                .mockResolvedValueOnce(mockPost1)
                .mockResolvedValueOnce(mockPost2);

            const posts = await getBlogPostsByCategory('en', 'all');

            expect(posts).toHaveLength(2);
        });

        test('should filter posts by category', async () => {
            const mockPost1 = `---
title: "Release Post"
date: "2025-12-31"
category: "releases"
description: "Release description"
---

Content`;

            const mockPost2 = `---
title: "Film Post"
date: "2025-12-30"
category: "films"
description: "Film description"
---

Content`;

            readdirMock
                .mockResolvedValueOnce(['releases', 'films'] as any)
                .mockResolvedValueOnce(['post-1.md'] as any)
                .mockResolvedValueOnce(['post-2.md'] as any);

            statMock.mockResolvedValue({
                isDirectory: () => true,
            } as any);

            readFileMock
                .mockResolvedValueOnce(mockPost1)
                .mockResolvedValueOnce(mockPost2);

            const posts = await getBlogPostsByCategory('en', 'releases');

            expect(posts).toHaveLength(1);
            expect(posts[0].title).toBe('Release Post');
            expect(posts[0].category).toBe('releases');
        });
    });

    describe('getBlogCategories', () => {
        test('should return list of category directories', async () => {
            readdirMock.mockResolvedValue(['releases', 'films', 'games'] as any);

            statMock.mockResolvedValue({
                isDirectory: () => true,
            } as any);

            const categories = await getBlogCategories('en');

            expect(categories).toEqual(['releases', 'films', 'games']);
        });

        test('should filter out non-directories', async () => {
            readdirMock.mockResolvedValue([
                'releases',
                'readme.md',
                'films',
            ] as any);

            statMock.mockImplementation((async (filePath: any) => {
                const pathStr = String(filePath);
                if (pathStr.includes('readme.md')) {
                    return { isDirectory: () => false } as any;
                }
                return { isDirectory: () => true } as any;
            }) as any);

            const categories = await getBlogCategories('en');

            expect(categories).toEqual(['releases', 'films']);
        });

        test('should return empty array if directory does not exist', async () => {
            readdirMock.mockRejectedValue(new Error('Directory not found'));

            const categories = await getBlogCategories('en');

            expect(categories).toEqual([]);
        });
    });
});
