import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handler = toNextJsHandler(auth);

const getCorsHeaders = (request: NextRequest) => {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods':
            'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
        'http://localhost:3000',
        'https://foslog.vercel.app',
    ];
    if (process.env.VERCEL_URL) {
        allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
    }
    if (origin) {
        if (
            allowedOrigins.includes(origin) ||
            /https:\/\/foslog-.*\.vercel\.app/.test(origin)
        ) {
            headers['Access-Control-Allow-Origin'] = origin;
        }
    }
    return headers;
};

async function addCorsHeaders(
    request: NextRequest,
    handler: (req: NextRequest | Request) => Promise<Response | NextResponse>
) {
    const response = await handler(request);
    const corsHeaders = getCorsHeaders(request);
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        try {
            const data = await response.json();
            return NextResponse.json(data, response);
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
    const headers = getCorsHeaders(request);
    return new NextResponse(null, {
        status: 200,
        headers,
    });
}
