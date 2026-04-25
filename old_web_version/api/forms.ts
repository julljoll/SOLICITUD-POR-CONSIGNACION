import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, ensureTables } from './_db';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await ensureTables();
    const sql = getDb();

    // GET — list all forms
    if (req.method === 'GET') {
        const rows = await sql`SELECT * FROM forms ORDER BY created_at DESC`;
        return res.json(rows);
    }

    // POST — create a new form
    if (req.method === 'POST') {
        try {
            const form = req.body;
            const hashData = JSON.stringify({
                ...form,
                timestamp: new Date().toISOString(),
                random: Math.random()
            });
            const id = crypto.createHash('sha256').update(hashData).digest('hex');

            await sql`
        INSERT INTO forms (
          cedula, nombre, telefono, direccion, ciudad,
          marca, modelo, color, serial, imei1, imei2,
          "numTelefónico", "codigoDesbloqueo", "estadoFisico",
          "aplicacionObjeto", "contactoEspecifico", "fechaDesde",
          "fechaHasta", aislamiento, "calculoHash", sha256
        ) VALUES (
          ${form.cedula}, ${form.nombre}, ${form.telefono}, ${form.direccion}, ${form.ciudad},
          ${form.marca}, ${form.modelo}, ${form.color}, ${form.serial}, ${form.imei1}, ${form.imei2},
          ${form.numTelefónico}, ${form.codigoDesbloqueo}, ${form.estadoFisico},
          ${form.aplicacionObjeto}, ${form.contactoEspecifico}, ${form.fechaDesde},
          ${form.fechaHasta}, ${form.aislamiento ? 1 : 0}, ${form.calculoHash ? 1 : 0}, ${id}
        )
        ON CONFLICT (cedula) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          telefono = EXCLUDED.telefono,
          direccion = EXCLUDED.direccion,
          ciudad = EXCLUDED.ciudad,
          marca = EXCLUDED.marca,
          modelo = EXCLUDED.modelo,
          color = EXCLUDED.color,
          serial = EXCLUDED.serial,
          imei1 = EXCLUDED.imei1,
          imei2 = EXCLUDED.imei2,
          "numTelefónico" = EXCLUDED."numTelefónico",
          "codigoDesbloqueo" = EXCLUDED."codigoDesbloqueo",
          "estadoFisico" = EXCLUDED."estadoFisico",
          "aplicacionObjeto" = EXCLUDED."aplicacionObjeto",
          "contactoEspecifico" = EXCLUDED."contactoEspecifico",
          "fechaDesde" = EXCLUDED."fechaDesde",
          "fechaHasta" = EXCLUDED."fechaHasta",
          aislamiento = EXCLUDED.aislamiento,
          "calculoHash" = EXCLUDED."calculoHash",
          sha256 = EXCLUDED.sha256
      `;

            return res.json({ success: true, id });
        } catch (error: any) {
            console.error('Form save error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE — remove a form by sha256
    if (req.method === 'DELETE') {
        const sha256 = req.query.sha256 as string;
        if (!sha256) {
            return res.status(400).json({ error: 'sha256 query parameter required' });
        }
        try {
            await sql`DELETE FROM forms WHERE sha256 = ${sha256}`;
            return res.json({ success: true });
        } catch (error: any) {
            console.error('Delete form error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
