import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handler = toNextJsHandler(auth);
const allowedOrigins = ['http://localhost:3000', 'https://foslog.vercel.app'];

const cors = (response: NextResponse) => {
    const origin = response.headers.get('Origin');
    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    return response;
};

export async function GET(request: NextRequest) {
    const response = await handler.GET(request);
    return cors(response as NextResponse);
}

export async function POST(request: NextRequest) {
    const response = await handler.POST(request);
    return cors(response as NextResponse);
}

export async function OPTIONS() {
    return cors(new NextResponse(null, { status: 204 }));
}
