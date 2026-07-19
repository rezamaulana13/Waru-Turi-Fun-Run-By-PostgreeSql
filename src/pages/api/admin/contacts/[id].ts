import type { APIRoute } from 'astro';
import { db, contactMessages } from '../../../../db/index.js';
import { eq } from 'drizzle-orm';

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    // id di schema kamu = serial (integer), bukan uuid
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID tidak valid' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.status === 'string') {
      updates.status = body.status; // 'unread' | 'read' | 'replied'
    }

    if (typeof body.adminReply === 'string') {
      updates.adminReply = body.adminReply;
      updates.status = 'replied';
      updates.repliedBy = body.repliedBy || 'Admin'; // TODO: ganti dari session admin kalau sudah ada auth
      updates.repliedAt = new Date();
    }

    const result = await db
      .update(contactMessages)
      .set(updates)
      .where(eq(contactMessages.id, id))
      .returning();

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Pesan tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error PATCH /api/admin/contacts/[id]:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Gagal update pesan' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};