import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, ensureTables } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await ensureTables();
    const sql = getDb();

    // GET — list all posts
    if (req.method === 'GET') {
        const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
        return res.json(rows);
    }

    // POST — create a new post
    if (req.method === 'POST') {
        const { title, content } = req.body;
        await sql`INSERT INTO posts (title, content) VALUES (${title}, ${content})`;
        return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
