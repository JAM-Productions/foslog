import pkg from '../../package.json';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-muted text-muted-foreground mt-auto py-6">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm md:flex-row md:gap-8">
                <p>&copy; {new Date().getFullYear()} Foslog</p>
                <div className="flex gap-4">
                    <Link
                        href="/privacy-policy"
                        className="hover:underline"
                        prefetch={false}
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="/terms-of-service"
                        className="hover:underline"
                        prefetch={false}
                    >
                        Terms of Service
                    </Link>
                </div>
                <a
                    href={`https://github.com/JAM-Productions/foslog/releases/tag/v${pkg.version}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                >
                    v{pkg.version}
                </a>
            </div>
        </footer>
    );
};

export default Footer;
