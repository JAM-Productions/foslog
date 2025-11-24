import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default function PrivacyPolicyPage() {
    const filePath = path.join(process.cwd(), '_legal', 'privacy-policy.md');
    const markdown = fs.readFileSync(filePath, 'utf-8');

    return (
        <div className="container mx-auto py-8 prose dark:prose-invert">
            <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
    );
}
