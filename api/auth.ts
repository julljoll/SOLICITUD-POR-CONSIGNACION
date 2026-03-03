import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, ensureTables } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await ensureTables();
    const sql = getDb();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;
    const rows = await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password}`;

    if (rows.length > 0) {
        res.json({ success: true, token: 'jwt-placeholder' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
}
