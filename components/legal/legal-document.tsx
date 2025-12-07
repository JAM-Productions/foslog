import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default async function LegalDocument({
    docName,
    locale,
}: {
    docName: string;
    locale: string;
}) {
    const filePath = path.join(process.cwd(), '_legal', locale, docName);
    try {
        const markdown = await fs.readFile(filePath, 'utf-8');
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <ReactMarkdown
                    components={{
                        h1: ({ ...props }) => (
                            <h1 className="mb-4 text-4xl font-bold" {...props} />
                        ),
                        h2: ({ ...props }) => (
                            <h2 className="mb-3 mt-6 text-2xl font-semibold" {...props} />
                        ),
                        p: ({ ...props }) => (
                            <p className="mb-4 leading-relaxed" {...props} />
                        ),
                        a: ({ ...props }) => (
                            <a
                                className="text-primary hover:underline"
                                {...props}
                                rel="noopener noreferrer"
                                target={
                                    props.href?.startsWith('http')
                                        ? '_blank'
                                        : undefined
                                }
                            />
                        ),
                        ul: ({ ...props }) => (
                            <ul className="mb-4 ml-6 list-disc" {...props} />
                        ),
                        li: ({ ...props }) => (
                            <li className="mb-2" {...props} />
                        ),
                    }}
                >
                    {markdown}
                </ReactMarkdown>
            </div>
        );
    } catch {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Document Not Found</h1>
                <p>The document for this language is not available.</p>
            </div>
        );
    }
}
