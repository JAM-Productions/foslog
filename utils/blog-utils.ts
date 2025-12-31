import { promises as fs } from 'fs';
import path from 'path';

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    category: string;
    description: string;
    content: string;
}

export interface BlogPostMetadata {
    slug: string;
    title: string;
    date: string;
    category: string;
    description: string;
}

/**
 * Parses YAML frontmatter from markdown content
 * Simple regex-based parser to avoid adding dependencies
 */
function parseFrontmatter(content: string): {
    metadata: Record<string, string>;
    content: string;
} {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { metadata: {}, content };
    }

    const [, frontmatterStr, markdownContent] = match;
    const metadata: Record<string, string> = {};

    // Parse YAML-like key-value pairs
    frontmatterStr.split('\n').forEach((line) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            // Remove quotes if present
            value = value.replace(/^["']|["']$/g, '');
            metadata[key] = value;
        }
    });

    return { metadata, content: markdownContent.trim() };
}

/**
 * Reads a single blog post file and returns parsed content
 */
export async function getBlogPost(
    locale: string,
    category: string,
    slug: string
): Promise<BlogPost | null> {
    try {
        const filePath = path.join(
            process.cwd(),
            '_blog',
            locale,
            category,
            `${slug}.md`
        );
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { metadata, content } = parseFrontmatter(fileContent);

        return {
            slug,
            title: metadata.title || 'Untitled',
            date: metadata.date || '',
            category: metadata.category || category,
            description: metadata.description || '',
            content,
        };
    } catch {
        return null;
    }
}

/**
 * Lists all blog posts for a given locale
 */
export async function getAllBlogPosts(
    locale: string
): Promise<BlogPostMetadata[]> {
    const posts: BlogPostMetadata[] = [];
    const blogDir = path.join(process.cwd(), '_blog', locale);

    try {
        const categories = await fs.readdir(blogDir);

        for (const category of categories) {
            const categoryPath = path.join(blogDir, category);
            const stat = await fs.stat(categoryPath);

            if (!stat.isDirectory()) continue;

            const files = await fs.readdir(categoryPath);
            const markdownFiles = files.filter((file) => file.endsWith('.md'));

            for (const file of markdownFiles) {
                const slug = file.replace('.md', '');
                const filePath = path.join(categoryPath, file);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                const { metadata } = parseFrontmatter(fileContent);

                posts.push({
                    slug: `${category}/${slug}`,
                    title: metadata.title || 'Untitled',
                    date: metadata.date || '',
                    category: metadata.category || category,
                    description: metadata.description || '',
                });
            }
        }

        // Sort by date (newest first)
        posts.sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return posts;
    } catch {
        return [];
    }
}

/**
 * Gets blog posts filtered by category
 */
export async function getBlogPostsByCategory(
    locale: string,
    category: string
): Promise<BlogPostMetadata[]> {
    const allPosts = await getAllBlogPosts(locale);
    if (category === 'all') return allPosts;
    return allPosts.filter((post) => post.category === category);
}

/**
 * Gets all unique categories from blog posts
 */
export async function getBlogCategories(locale: string): Promise<string[]> {
    const blogDir = path.join(process.cwd(), '_blog', locale);

    try {
        const categories = await fs.readdir(blogDir);
        const validCategories: string[] = [];

        for (const category of categories) {
            const categoryPath = path.join(blogDir, category);
            const stat = await fs.stat(categoryPath);
            if (stat.isDirectory()) {
                validCategories.push(category);
            }
        }

        return validCategories;
    } catch {
        return [];
    }
}
