import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        const sql = getDb();
        await sql`SELECT 1`;
        res.json({ status: 'connected' });
    } catch {
        res.json({ status: 'disconnected' });
    }
}
