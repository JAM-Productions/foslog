'use client';

import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import { BackButton } from '../button/back-button';

interface BlogPostProps {
    title: string;
    date: string;
    category: string;
    content: string;
}

export default function BlogPost({
    title,
    date,
    category,
    content,
}: BlogPostProps) {
    const t = useTranslations('BlogPage.categories');

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <BackButton className="mb-6" />
            <article>
                <header className="mb-8">
                    <div className="text-muted-foreground mb-2 flex items-center gap-3 text-sm">
                        <span className="bg-primary/10 text-primary rounded-full px-3 py-1">
                            {t(category)}
                        </span>
                        <time dateTime={date}>
                            {new Date(date).toLocaleDateString()}
                        </time>
                    </div>
                    <h1 className="text-4xl font-bold">{title}</h1>
                </header>

                <div className="prose prose-neutral max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: ({ ...props }) => (
                                <h1
                                    className="mt-8 mb-4 text-3xl font-bold"
                                    {...props}
                                />
                            ),
                            h2: ({ ...props }) => (
                                <h2
                                    className="mt-6 mb-3 text-2xl font-semibold"
                                    {...props}
                                />
                            ),
                            h3: ({ ...props }) => (
                                <h3
                                    className="mt-4 mb-2 text-xl font-semibold"
                                    {...props}
                                />
                            ),
                            p: ({ ...props }) => (
                                <p
                                    className="mb-4 leading-relaxed"
                                    {...props}
                                />
                            ),
                            a: ({ ...props }) => {
                                const isExternal =
                                    props.href?.startsWith('http');
                                return (
                                    <a
                                        className="text-primary hover:underline"
                                        {...props}
                                        target={
                                            isExternal ? '_blank' : undefined
                                        }
                                        rel={
                                            isExternal
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                    />
                                );
                            },
                            ul: ({ ...props }) => (
                                <ul
                                    className="mb-4 ml-6 list-disc"
                                    {...props}
                                />
                            ),
                            ol: ({ ...props }) => (
                                <ol
                                    className="mb-4 ml-6 list-decimal"
                                    {...props}
                                />
                            ),
                            li: ({ ...props }) => (
                                <li
                                    className="mb-2"
                                    {...props}
                                />
                            ),
                            blockquote: ({ ...props }) => (
                                <blockquote
                                    className="border-primary/30 text-muted-foreground border-l-4 pl-4 italic"
                                    {...props}
                                />
                            ),
                            code: ({ ...props }) => (
                                <code
                                    className="bg-muted rounded px-1 py-0.5 font-mono text-sm"
                                    {...props}
                                />
                            ),
                            pre: ({ ...props }) => (
                                <pre
                                    className="bg-muted mb-4 overflow-x-auto rounded p-4"
                                    {...props}
                                />
                            ),
                            img: ({ ...props }) => {
                                const { alt, ...rest } = props as {
                                    alt?: unknown;
                                    [key: string]: unknown;
                                };
                                return (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        className="my-4 rounded-lg"
                                        alt={typeof alt === 'string' ? alt : ''}
                                        {...rest}
                                    />
                                );
                            },
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
}
