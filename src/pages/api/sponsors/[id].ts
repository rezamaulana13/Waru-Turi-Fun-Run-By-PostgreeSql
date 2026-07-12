import type { APIRoute } from 'astro';
import { db, sponsors } from '../../../db';
import { eq } from 'drizzle-orm';

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '0');
  await db.delete(sponsors).where(eq(sponsors.id, id));
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};