import type { APIRoute } from 'astro';
import { db, sponsors } from '../../../db';

export const GET: APIRoute = async () => {
  const data = await db.select().from(sponsors);
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = await db.insert(sponsors).values(body).returning();
    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};