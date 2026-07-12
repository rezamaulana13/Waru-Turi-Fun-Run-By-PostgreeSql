// src/pages/api/admin/about/index.ts
import type { APIRoute } from 'astro';
import { db, aboutContent } from '../../../../db/index.js';
import { and, eq } from 'drizzle-orm';

// ============================================================
// GET - Ambil semua data about
// ============================================================
export const GET: APIRoute = async () => {
  try {
    const result = await db.select().from(aboutContent).orderBy(aboutContent.section, aboutContent.order);
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Gagal mengambil data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================================
// POST - Single & Batch
// ============================================================
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // ===== BATCH MODE (Kirim banyak data) =====
    if (body.data && Array.isArray(body.data)) {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const item of body.data) {
        try {
          const { section, key, value, imageUrl, order } = item;

          if (!section || !key) {
            errorCount++;
            errors.push(`Missing section or key: ${JSON.stringify(item)}`);
            continue;
          }

          // Cek apakah sudah ada
          const existing = await db.select()
            .from(aboutContent)
            .where(and(eq(aboutContent.section, section), eq(aboutContent.key, key)));

          if (existing.length > 0) {
            // Update
            await db.update(aboutContent)
              .set({ 
                value: value || '',
                imageUrl: imageUrl || null,
                order: order || 0,
                updatedAt: new Date()
              })
              .where(and(eq(aboutContent.section, section), eq(aboutContent.key, key)));
          } else {
            // Insert
            await db.insert(aboutContent).values({
              section,
              key,
              value: value || '',
              imageUrl: imageUrl || null,
              order: order || 0,
              isActive: true,
            });
          }
          successCount++;
        } catch (err: any) {
          errorCount++;
          errors.push(err.message);
        }
      }

      const message = `${successCount} data berhasil disimpan${errorCount > 0 ? `, ${errorCount} gagal` : ''}`;
      
      return new Response(
        JSON.stringify({ 
          success: errorCount === 0, 
          message,
          successCount,
          errorCount,
          errors: errors.length > 0 ? errors : undefined
        }),
        { 
          status: errorCount === 0 ? 200 : 207, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // ===== SINGLE MODE =====
    const { section, key, value, imageUrl, order, isActive } = body;

    if (!section || !key) {
      return new Response(
        JSON.stringify({ success: false, error: 'Section dan Key wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cek apakah sudah ada
    const existing = await db.select()
      .from(aboutContent)
      .where(and(eq(aboutContent.section, section), eq(aboutContent.key, key)));

    if (existing.length > 0) {
      // Update
      const result = await db.update(aboutContent)
        .set({
          value: value || '',
          imageUrl: imageUrl || null,
          order: order || 0,
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date()
        })
        .where(and(eq(aboutContent.section, section), eq(aboutContent.key, key)))
        .returning();

      return new Response(
        JSON.stringify({ success: true, data: result[0], message: 'Data berhasil diupdate' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Insert
      const result = await db.insert(aboutContent).values({
        section,
        key,
        value: value || '',
        imageUrl: imageUrl || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      }).returning();

      return new Response(
        JSON.stringify({ success: true, data: result[0], message: 'Data berhasil ditambahkan' }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error saving about data:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal menyimpan data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================================
// PUT - Update data by ID
// ============================================================
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, section, key, value, imageUrl, order, isActive } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db.update(aboutContent)
      .set({
        section,
        key,
        value,
        imageUrl,
        order,
        isActive,
        updatedAt: new Date()
      })
      .where(eq(aboutContent.id, id))
      .returning();

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Data tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result[0], message: 'Data berhasil diupdate' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal mengupdate data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================================
// DELETE - Hapus data by ID
// ============================================================
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID tidak ditemukan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db.delete(aboutContent)
      .where(eq(aboutContent.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Data tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Data berhasil dihapus' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal menghapus data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};