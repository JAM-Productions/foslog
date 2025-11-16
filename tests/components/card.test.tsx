import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/card';

describe('Card Components', () => {
    describe('Card', () => {
        it('renders with default props', () => {
            render(<Card data-testid="card">Card content</Card>);

            const card = screen.getByTestId('card');
            expect(card).toBeInTheDocument();
            expect(card).toHaveTextContent('Card content');
        });

        it('applies default CSS classes', () => {
            render(<Card data-testid="card">Card content</Card>);

            const card = screen.getByTestId('card');
            expect(card).toHaveClass(
                'bg-card',
                'text-card-foreground',
                'rounded-lg',
                'border',
                'shadow-sm',
                'transition-all',
                'hover:shadow-md'
            );
        });

        it('applies custom className', () => {
            render(
                <Card
                    className="custom-class"
                    data-testid="card"
                >
                    Card content
                </Card>
            );

            const card = screen.getByTestId('card');
            expect(card).toHaveClass('custom-class');
            expect(card).toHaveClass('bg-card'); // Should still have default classes
        });

        it('forwards ref correctly', () => {
            const ref = vi.fn();
            render(<Card ref={ref}>Card content</Card>);

            expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        });

        it('passes through HTML attributes', () => {
            render(
                <Card
                    id="test-card"
                    role="region"
                    aria-label="Test card"
                    data-testid="card"
                >
                    Card content
                </Card>
            );

            const card = screen.getByTestId('card');
            expect(card).toHaveAttribute('id', 'test-card');
            expect(card).toHaveAttribute('role', 'region');
            expect(card).toHaveAttribute('aria-label', 'Test card');
        });

        it('renders as a div element', () => {
            render(<Card data-testid="card">Card content</Card>);

            const card = screen.getByTestId('card');
            expect(card.tagName).toBe('DIV');
        });
    });

    describe('CardHeader', () => {
        it('renders with default props', () => {
            render(
                <CardHeader data-testid="card-header">
                    Header content
                </CardHeader>
            );

            const header = screen.getByTestId('card-header');
            expect(header).toBeInTheDocument();
            expect(header).toHaveTextContent('Header content');
        });

        it('applies default CSS classes', () => {
            render(
                <CardHeader data-testid="card-header">
                    Header content
                </CardHeader>
            );

            const header = screen.getByTestId('card-header');
            expect(header).toHaveClass(
                'flex',
                'flex-col',
                'space-y-1.5',
                'p-6'
            );
        });

        it('applies custom className', () => {
            render(
                <CardHeader
                    className="custom-header"
                    data-testid="card-header"
                >
                    Header content
                </CardHeader>
            );

            const header = screen.getByTestId('card-header');
            expect(header).toHaveClass('custom-header');
            expect(header).toHaveClass('flex'); // Should still have default classes
        });

        it('forwards ref correctly', () => {
            const ref = vi.fn();
            render(<CardHeader ref={ref}>Header content</CardHeader>);

            expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        });

        it('renders as a div element', () => {
            render(
                <CardHeader data-testid="card-header">
                    Header content
                </CardHeader>
            );

            const header = screen.getByTestId('card-header');
            expect(header.tagName).toBe('DIV');
        });
    });

    describe('CardTitle', () => {
        it('renders with default props', () => {
            render(<CardTitle data-testid="card-title">Title text</CardTitle>);

            const title = screen.getByTestId('card-title');
            expect(title).toBeInTheDocument();
            expect(title).toHaveTextContent('Title text');
        });

        it('applies default CSS classes', () => {
            render(<CardTitle data-testid="card-title">Title text</CardTitle>);

            const title = screen.getByTestId('card-title');
            expect(title).toHaveClass(
                'text-2xl',
                'leading-none',
                'font-semibold',
                'tracking-tight'
            );
        });

        it('applies custom className', () => {
            render(
                <CardTitle
                    className="custom-title"
                    data-testid="card-title"
                >
                    Title text
                </CardTitle>
            );

            const title = screen.getByTestId('card-title');
            expect(title).toHaveClass('custom-title');
            expect(title).toHaveClass('text-2xl'); // Should still have default classes
        });

        it('forwards ref correctly', () => {
            const ref = vi.fn();
            render(<CardTitle ref={ref}>Title text</CardTitle>);

            expect(ref).toHaveBeenCalledWith(expect.any(HTMLHeadingElement));
        });

        it('renders as an h3 element', () => {
            render(<CardTitle data-testid="card-title">Title text</CardTitle>);

            const title = screen.getByTestId('card-title');
            expect(title.tagName).toBe('H3');
        });

        it('has proper semantic heading role', () => {
            render(<CardTitle>Title text</CardTitle>);

            const title = screen.getByRole('heading', { level: 3 });
            expect(title).toBeInTheDocument();
            expect(title).toHaveTextContent('Title text');
        });
    });

    describe('CardDescription', () => {
        it('renders with default props', () => {
            render(
                <CardDescription data-testid="card-description">
                    Description text
                </CardDescription>
            );

            const description = screen.getByTestId('card-description');
            expect(description).toBeInTheDocument();
            expect(description).toHaveTextContent('Description text');
        });

        it('applies default CSS classes', () => {
            render(
                <CardDescription data-testid="card-description">
                    Description text
                </CardDescription>
            );

            const description = screen.getByTestId('card-description');
            expect(description).toHaveClass('text-muted-foreground', 'text-sm');
        });

        it('applies custom className', () => {
            render(
                <CardDescription
                    className="custom-description"
                    data-testid="card-description"
                >
                    Description text
                </CardDescription>
            );

            const description = screen.getByTestId('card-description');
            expect(description).toHaveClass('custom-description');
            expect(description).toHaveClass('text-muted-foreground'); // Should still have default classes
        });

        it('forwards ref correctly', () => {
            const ref = vi.fn();
            render(
                <CardDescription ref={ref}>Description text</CardDescription>
            );

            expect(ref).toHaveBeenCalledWith(expect.any(HTMLParagraphElement));
        });

        it('renders as a p element', () => {
            render(
                <CardDescription data-testid="card-description">
                    Description text
                </CardDescription>
            );

            const description = screen.getByTestId('card-description');
            expect(description.tagName).toBe('P');
        });
    });

    describe('CardContent', () => {
        it('renders with default props', () => {
            render(
                <CardContent data-testid="card-content">
                    Content text
                </CardContent>
            );

            const content = screen.getByTestId('card-content');
            expect(content).toBeInTheDocument();
            expect(content).toHaveTextContent('Content text');
        });

        it('applies default CSS classes', () => {
            render(
                <CardContent data-testid="card-content">
                    Content text
                </CardContent>
            );

            const content = screen.getByTestId('card-content');
            expect(content).toHaveClass('p-6', 'pt-0');
        });

        it('applies custom className', () => {
            render(
                <CardContent
                    className="custom-content"
                    data-testid="card-content"
                >
                    Content text
                </CardContent>
            );

            const content = screen.getByTestId('card-content');
            expect(content).toHaveClass('custom-content');
            expect(content).toHaveClass('p-6'); // Should still have default classes
        });

        it('forwards ref correctly', () => {
            const ref = vi.fn();
            render(<CardContent ref={ref}>Content text</CardContent>);

            expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        });

        it('renders as a div element', () => {
            render(
                <CardContent data-testid="card-content">
                    Content text
                </CardContent>
            );

            const content = screen.getByTestId('card-content');
            expect(content.tagName).toBe('DIV');
        });
    });

    describe('CardFooter', () => {
        it('renders with default props', () => {
            render(
                <CardFooter data-testid="card-footer">
                    Footer content
                </CardFooter>
            );

            const footer = screen.getByTestId('card-footer');
            expect(footer).toBeInTheDocument();
            expect(footer).toHaveTextContent('Footer content');
        });

        it('applies default CSS classes', () => {
            render(
                <CardFooter data-testid="card-footer">
                    Footer content
                </CardFooter>
            );

            const footer = screen.getByTestId('card-footer');
            expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
        });

        it('applies custom className', () => {
            render(
                <CardFooter
                    className="custom-footer"
                    data-testid="card-footer"
                >
                    Footer content
                </CardFooter>
            );

            const footer = screen.getByTestId('card-footer');
            expect(footer).toHaveClass('custom-footer');
            expect(footer).toHaveClass('flex'); // Should still have default classes
        });

        it('forwards ref correctly', () => {
            const ref = vi.fn();
            render(<CardFooter ref={ref}>Footer content</CardFooter>);

            expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        });

        it('renders as a div element', () => {
            render(
                <CardFooter data-testid="card-footer">
                    Footer content
                </CardFooter>
            );

            const footer = screen.getByTestId('card-footer');
            expect(footer.tagName).toBe('DIV');
        });
    });

    describe('Card Component Integration', () => {
        it('renders a complete card with all sub-components', () => {
            render(
                <Card data-testid="complete-card">
                    <CardHeader>
                        <CardTitle>Sample Title</CardTitle>
                        <CardDescription>
                            Sample description text
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This is the main content of the card.</p>
                    </CardContent>
                    <CardFooter>
                        <button>Action Button</button>
                    </CardFooter>
                </Card>
            );

            // Verify all components are rendered
            expect(screen.getByTestId('complete-card')).toBeInTheDocument();
            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
                'Sample Title'
            );
            expect(
                screen.getByText('Sample description text')
            ).toBeInTheDocument();
            expect(
                screen.getByText('This is the main content of the card.')
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Action Button' })
            ).toBeInTheDocument();
        });

        it('maintains proper DOM structure', () => {
            render(
                <Card data-testid="structured-card">
                    <CardHeader data-testid="header">
                        <CardTitle data-testid="title">Title</CardTitle>
                        <CardDescription data-testid="description">
                            Description
                        </CardDescription>
                    </CardHeader>
                    <CardContent data-testid="content">Content</CardContent>
                    <CardFooter data-testid="footer">Footer</CardFooter>
                </Card>
            );

            const card = screen.getByTestId('structured-card');
            const header = screen.getByTestId('header');
            const title = screen.getByTestId('title');
            const description = screen.getByTestId('description');
            const content = screen.getByTestId('content');
            const footer = screen.getByTestId('footer');

            // Verify structure
            expect(card).toContainElement(header);
            expect(card).toContainElement(content);
            expect(card).toContainElement(footer);
            expect(header).toContainElement(title);
            expect(header).toContainElement(description);
        });

        it('handles empty card gracefully', () => {
            render(<Card data-testid="empty-card" />);

            const card = screen.getByTestId('empty-card');
            expect(card).toBeInTheDocument();
            expect(card).toBeEmptyDOMElement();
        });

        it('accepts custom event handlers', async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();
            const handleMouseEnter = vi.fn();

            render(
                <Card
                    data-testid="interactive-card"
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    Interactive Card
                </Card>
            );

            const card = screen.getByTestId('interactive-card');

            // Simulate click event
            await user.click(card);
            expect(handleClick).toHaveBeenCalledTimes(1);

            // Simulate hover event
            await user.hover(card);
            expect(handleMouseEnter).toHaveBeenCalledTimes(1);
        });
    });
});
