export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

// Persist sessions across Next.js hot-module reloading in dev mode.
// Without this, every file save wipes the in-memory session store.
const globalStore = globalThis as any;
if (!globalStore.__synchro_sessions) {
    globalStore.__synchro_sessions = {} as Record<string, any>;
}
const sessions: Record<string, any> = globalStore.__synchro_sessions;

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Cleanup expired sessions on each request
function cleanupSessions() {
    const now = Date.now();
    for (const id of Object.keys(sessions)) {
        if (now - sessions[id].created > SESSION_TTL_MS) {
            delete sessions[id];
        }
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { action, sessionId, payload } = body;

    // Garbage-collect stale sessions
    cleanupSessions();

    if (action === 'create') {
        const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
        sessions[newSessionId] = {
            id: newSessionId,
            created: Date.now(),
            messages: [],
        };
        return NextResponse.json({ sessionId: newSessionId });
    }

    if (action === 'join') {
        if (!sessions[sessionId]) {
            return NextResponse.json({ error: 'Session not found or expired. Ask your peer to create a new one.' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    }

    if (action === 'send') {
        if (!sessions[sessionId]) {
            return NextResponse.json({ error: 'Session expired. Please start a new session.' }, { status: 404 });
        }
        sessions[sessionId].messages.push(payload);
        return NextResponse.json({ success: true });
    }

    if (action === 'poll') {
        if (!sessions[sessionId]) {
            return NextResponse.json({ error: 'Session expired.' }, { status: 404 });
        }
        // Return all messages for now. Client filters what it has seen.
        return NextResponse.json({ messages: sessions[sessionId].messages });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
