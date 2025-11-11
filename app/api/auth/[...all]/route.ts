import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handler = toNextJsHandler(auth);

const allowedOrigins = [
    'http://localhost:3000',
    'https://foslog.vercel.app',
];
const vercelPreviewOriginRegex = /https:\/\/foslog-.*\.vercel\.app/;

const getCorsHeaders = (request: NextRequest) => {
    const origin = request.headers.get('origin');
    const headers: { [key: string]: string } = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (origin && (allowedOrigins.includes(origin) || vercelPreviewOriginRegex.test(origin))) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
};

async function addCorsHeaders(
    request: NextRequest,
    handler: (req: NextRequest | Request) => Promise<Response | NextResponse>
) {
    const response = await handler(request);
    const corsHeaders = getCorsHeaders(request);

    if (corsHeaders['Access-Control-Allow-Origin']) {
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        try {
            const data = await response.json();
            // creating a new response to make sure headers are mutable
            const newResponse = NextResponse.json(data, {
                status: response.status,
                headers: response.headers,
            });
            if (corsHeaders['Access-Control-Allow-Origin']) {
                Object.entries(corsHeaders).forEach(([key, value]) => {
                    newResponse.headers.set(key, value);
                });
            }
            return newResponse;
        } catch {
            return response;
        }
    }
    return response;
}

export async function GET(request: NextRequest) {
    return addCorsHeaders(request, handler.GET);
}

export async function POST(request: NextRequest) {
    return addCorsHeaders(request, handler.POST);
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: getCorsHeaders(request),
    });
}
