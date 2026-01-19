export class IgdbTokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'IgdbTokenError';
    }
}
