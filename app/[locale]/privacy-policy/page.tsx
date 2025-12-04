import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default async function PrivacyPolicyPage({
    params: paramsPromise,
}: {
    params: Promise<{ locale: string }>;
}) {
    const params = await paramsPromise;
    const filePath = path.join(
        process.cwd(),
        '_legal',
        params.locale,
        'privacy-policy.md'
    );
    try {
        const markdown = await fs.readFile(filePath, 'utf-8');
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <ReactMarkdown
                    components={{
                        a: ({ ...props }) => (
                            <a
                                {...props}
                                rel="noopener noreferrer"
                                target={
                                    props.href?.startsWith('http')
                                        ? '_blank'
                                        : undefined
                                }
                            />
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
                <h1 className="text-2xl font-bold">Privacy Policy Not Found</h1>
                <p>The privacy policy for this language is not available.</p>
            </div>
        );
    }
}
