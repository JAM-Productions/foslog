import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handler = toNextJsHandler(auth);

function getCorsHeaders(origin?: string) {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };

    if (
        origin &&
        (origin === 'http://localhost:3000' ||
            origin === 'https://foslog.vercel.app' ||
            /^https:\/\/foslog-[a-z0-9-]+-jams-projects-766fb62b\.vercel\.app$/.test(
                origin
            ))
    ) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
}

async function addCorsHeaders(
    request: NextRequest,
    handler: (req: NextRequest | Request) => Promise<Response | NextResponse>
) {
    const origin = request.headers.get('origin') || '';
    const corsHeaders = getCorsHeaders(origin);

    const response = await handler(request);

    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export async function GET(request: NextRequest) {
    return addCorsHeaders(request, handler.GET);
}

export async function POST(request: NextRequest) {
    return addCorsHeaders(request, handler.POST);
}

export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin') || '';
    const headers = getCorsHeaders(origin);
    return new NextResponse(null, { status: 200, headers });
}
