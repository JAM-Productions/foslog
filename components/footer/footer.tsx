import pkg from '@/../package.json';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-muted text-muted-foreground py-6 mt-auto">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm gap-4 md:gap-8">
                <p>
                    &copy; {new Date().getFullYear()} Foslog
                </p>
                <div className="flex gap-4">
                    <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
                    <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
                </div>
                <p>
                    v{pkg.version}
                </p>
            </div>
        </footer>
    );
}

export default Footer;
