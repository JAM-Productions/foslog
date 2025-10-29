import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handler = toNextJsHandler(auth);

const allowedOrigins = ['http://localhost:3000', 'https://foslog.vercel.app'];

function getCorsHeaders(origin: string | null): Record<string, string> {
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    return {
        'Access-Control-Allow-Origin': isAllowedOrigin
            ? origin
            : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };
}

async function addCorsHeaders(
    request: NextRequest,
    handler: (req: NextRequest | Request) => Promise<Response | NextResponse>
) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    const response = await handler(request);
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
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}
