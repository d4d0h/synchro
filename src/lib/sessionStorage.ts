import { CalendarEvent } from './calendar';

export interface SavedSession {
    id: string;
    role: 'INITIATOR' | 'JOINER';
    date: string; // ISO string
    matches: CalendarEvent[];
    notes: Record<string, string>; // decrypted peer notes keyed by event UID
}

const STORAGE_KEY = 'synchro_saved_sessions';
const KEY_STORAGE = 'synchro_sessions_key';
const ENC_PREFIX = 'enc:';

// Device-bound AES-GCM key — protects against storage file exfiltration
async function getStorageKey(): Promise<CryptoKey> {
    const stored = localStorage.getItem(KEY_STORAGE);
    if (stored) {
        const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
        return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
    }
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const exported = await crypto.subtle.exportKey('raw', key);
    localStorage.setItem(KEY_STORAGE, btoa(Array.from(new Uint8Array(exported), c => String.fromCharCode(c)).join('')));
    return key;
}

async function encrypt(plaintext: string): Promise<string> {
    const key = await getStorageKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return ENC_PREFIX + btoa(Array.from(combined, c => String.fromCharCode(c)).join(''));
}

async function decrypt(stored: string): Promise<string> {
    if (!stored.startsWith(ENC_PREFIX)) {
        // Legacy plaintext — return as-is for migration
        return stored;
    }
    const key = await getStorageKey();
    const combined = Uint8Array.from(atob(stored.slice(ENC_PREFIX.length)), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
}

export async function getSavedSessions(): Promise<SavedSession[]> {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const decrypted = await decrypt(stored);
        return JSON.parse(decrypted) as SavedSession[];
    } catch {
        return [];
    }
}

export async function saveSession(session: SavedSession): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        const current = await getSavedSessions();
        const existingIndex = current.findIndex(s => s.id === session.id);
        if (existingIndex >= 0) {
            current[existingIndex] = session;
        } else {
            current.unshift(session);
        }
        const encrypted = await encrypt(JSON.stringify(current));
        localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (e) {
        console.error('Failed to save session', e);
    }
}

export async function deleteSession(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        const current = await getSavedSessions();
        const filtered = current.filter(s => s.id !== id);
        const encrypted = await encrypt(JSON.stringify(filtered));
        localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (e) {
        console.error('Failed to delete session', e);
    }
}
