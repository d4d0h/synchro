import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

interface Session {
    id: string;
    createdAt: number;
    messages: unknown[];
}

// In-memory store (resets on server restart — use Redis in production)
const sessions: Record<string, Session> = {};

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_SESSIONS = 100;

function cleanupSessions() {
    const now = Date.now();
    for (const id of Object.keys(sessions)) {
        if (now - sessions[id].createdAt > SESSION_TTL_MS) {
            delete sessions[id];
        }
    }
}

function checkOrigin(request: NextRequest): NextResponse | null {
    const origin = request.headers.get('origin');
    if (origin === null) return null; // same-origin or server-to-server — allow
    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        `${request.headers.get('x-forwarded-proto') ?? 'https'}://${request.headers.get('host')}`;
    if (origin !== appUrl) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null;
}

export async function POST(request: NextRequest) {
    const corsError = checkOrigin(request);
    if (corsError) return corsError;

    cleanupSessions();

    const body = await request.json();
    const { action, sessionId, payload } = body;

    if (action === 'create') {
        if (Object.keys(sessions).length >= MAX_SESSIONS) {
            return NextResponse.json({ error: 'Too many active sessions' }, { status: 429 });
        }
        const newSessionId = randomBytes(16).toString('hex');
        sessions[newSessionId] = {
            id: newSessionId,
            createdAt: Date.now(),
            messages: [],
        };
        return NextResponse.json({ sessionId: newSessionId });
    }

    if (action === 'join') {
        if (!sessions[sessionId]) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    }

    if (action === 'send') {
        if (!sessions[sessionId]) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        sessions[sessionId].messages.push(payload);
        return NextResponse.json({ success: true });
    }

    if (action === 'poll') {
        if (!sessions[sessionId]) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        return NextResponse.json({ messages: sessions[sessionId].messages });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
