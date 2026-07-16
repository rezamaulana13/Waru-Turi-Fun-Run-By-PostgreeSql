// src/pages/api/admin/gallery/index.ts
import type { APIRoute } from 'astro';
import { db, galleries, users } from '../../../../db/index.js';
import { eq, desc } from 'drizzle-orm';
import { verifyToken } from '../../../../lib/auth';

// ===== GET - Ambil data gallery =====
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Check auth
    const token = cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const user = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || user.length === 0 || (user[0].role !== 'admin' && user[0].role !== 'super_admin')) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    // Jika ada ID, ambil satu data
    if (id) {
      const result = await db.select().from(galleries).where(eq(galleries.id, parseInt(id)));
      if (!result || result.length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'Data not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: true, data: result[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ambil semua data
    const result = await db.select().from(galleries).orderBy(desc(galleries.createdAt));
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/gallery:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ===== POST - Tambah data gallery =====
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check auth
    const token = cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || user.length === 0 || (user[0].role !== 'admin' && user[0].role !== 'super_admin')) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { imageUrl, title, description, category, type, featured, date, thumbnailUrl } = body;

    // Validasi
    if (!imageUrl || !title) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Image URL and title are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert data ke tabel galleries
    const result = await db.insert(galleries).values({
      imageUrl,
      title: title || 'Untitled',
      description: description || '',
      thumbnailUrl: thumbnailUrl || imageUrl,
      uploadedBy: user[0].id,
      isFeatured: featured || false,
      order: 0,
      createdAt: date ? new Date(date) : new Date(),
      updatedAt: new Date()
    }).returning();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Media berhasil ditambahkan',
      data: result[0]
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in POST /api/admin/gallery:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ===== PUT - Edit data gallery =====
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    // Check auth
    const token = cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || user.length === 0 || (user[0].role !== 'admin' && user[0].role !== 'super_admin')) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { id, imageUrl, title, description, featured, date, thumbnailUrl } = body;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cek apakah data ada
    const existing = await db.select().from(galleries).where(eq(galleries.id, parseInt(id)));
    if (!existing || existing.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Data not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update data
    const updateData: any = {
      imageUrl,
      title: title || 'Untitled',
      description: description || '',
      thumbnailUrl: thumbnailUrl || imageUrl,
      isFeatured: featured || false,
      updatedAt: new Date()
    };

    if (date) {
      updateData.createdAt = new Date(date);
    }

    const result = await db.update(galleries)
      .set(updateData)
      .where(eq(galleries.id, parseInt(id)))
      .returning();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Media berhasil diupdate',
      data: result[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/gallery:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ===== DELETE - Hapus data gallery =====
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Check auth
    const token = cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || user.length === 0 || (user[0].role !== 'admin' && user[0].role !== 'super_admin')) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cek apakah data ada
    const existing = await db.select().from(galleries).where(eq(galleries.id, parseInt(id)));
    if (!existing || existing.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Data not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await db.delete(galleries).where(eq(galleries.id, parseInt(id)));

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Media berhasil dihapus'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/gallery:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};