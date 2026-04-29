import {ROUTE_HOME, router} from '../router.js';

export function makeArmyListDataUrl(data) {
    const jsonString = JSON.stringify(data);
    const encodedJson = encodeBase64(jsonString);

    const route = router.resolve({
        name: ROUTE_HOME,
        query: {payload: encodedJson},
    });

    const base = window.location.origin + import.meta.env.BASE_URL;
    return new URL(route.href, base).href;
}

export function urlDataStringToJson(dataString) {
    const jsonString = decodeBase64(dataString);
    return JSON.parse(jsonString);
}

// ── Share Codes ───────────────────────────────────────────────────────────────
// SR:<base64-gzip> — compact, pasteable in Discord, ~800-1200 chars for a
// typical 150T list vs. 3000+ chars for the raw data URL.

export async function makeShareCode(data) {
    const jsonString = JSON.stringify(data);
    const bytes = new TextEncoder().encode(jsonString);

    const compressed = await compressBytes(bytes);
    const base64 = bytesToBase64(compressed);

    return 'SR:' + base64;
}

export async function shareCodeToJson(code) {
    const raw = code.trim();
    const base64 = raw.startsWith('SR:') ? raw.slice(3) : raw;
    const bytes = base64ToBytes(base64);
    const decompressed = await decompressBytes(bytes);
    const jsonString = new TextDecoder().decode(decompressed);
    return JSON.parse(jsonString);
}

async function compressBytes(bytes) {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(bytes);
    writer.close();
    return readStream(stream.readable);
}

async function decompressBytes(bytes) {
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(bytes);
    writer.close();
    return readStream(stream.readable);
}

async function readStream(readable) {
    const reader = readable.getReader();
    const chunks = [];
    while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.length;
    }
    return out;
}

function bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// ─────────────────────────────────────────────────────────────────────────────

function encodeBase64(jsonData) {
    const jsonString = JSON.stringify(jsonData);
    const encoder = new TextEncoder();
    const encodedBytes = encoder.encode(jsonString);

    return btoa(String.fromCharCode(...encodedBytes));
}

export function decodeBase64(base64EncodedBinary) {
    const decodedBytes = Uint8Array.from(
        atob(base64EncodedBinary)
            .split('')
            .map(char => char.charCodeAt(0)),
    );
    const decoder = new TextDecoder();
    const decodedString = decoder.decode(decodedBytes);

    return JSON.parse(decodedString);
}