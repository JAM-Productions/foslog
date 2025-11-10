export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

export class ValidationError extends ApiError {
    constructor(message: string) {
        super(400, message);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends ApiError {
    constructor(message: string) {
        super(401, message);
        this.name = 'AuthenticationError';
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(404, message);
        this.name = 'NotFoundError';
    }
}
