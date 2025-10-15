import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handler = toNextJsHandler(auth);

async function addCorsHeaders(request: NextRequest, handler: Function) {
    const response = await handler(request);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
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
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
