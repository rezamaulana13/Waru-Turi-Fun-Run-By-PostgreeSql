import type { APIRoute } from 'astro';
import { db, certificates } from '../../../../db/index.js';
import { eq } from 'drizzle-orm';

// ============================================================
// POST - BUAT SERTIFIKAT BARU
// ============================================================
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    console.log('🟢 [API] POST /api/admin/certificates:', data);
    
    const { participantId, template, status, fileUrl } = data;

    if (!participantId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Participant ID required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate nomor sertifikat unik
    const certNumber = 'CERT-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const insertData: any = {
      participantId: parseInt(participantId),
      certificateNumber: certNumber,
      template: template || 'default',
      status: status || 'draft',
      fileUrl: fileUrl || null,
    };

    const result = await db.insert(certificates).values(insertData).returning();
    
    console.log('🟢 [API] Certificate created:', result[0]);

    return new Response(JSON.stringify({ 
      success: true, 
      data: result[0], 
      message: 'Sertifikat berhasil dibuat' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('🔴 [API] Error creating certificate:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ============================================================
// PUT - UPDATE SERTIFIKAT
// ============================================================
export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    console.log('🟢 [API] PUT /api/admin/certificates:', data);
    
    const { id, participantId, template, status, fileUrl } = data;

    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData: any = {
      template: template || 'default',
      status: status || 'draft',
      updatedAt: new Date(),
    };

    if (participantId) updateData.participantId = parseInt(participantId);
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;

    const result = await db.update(certificates)
      .set(updateData)
      .where(eq(certificates.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Sertifikat tidak ditemukan' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('🟢 [API] Certificate updated:', result[0]);

    return new Response(JSON.stringify({ 
      success: true, 
      data: result[0], 
      message: 'Sertifikat berhasil diupdate' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('🔴 [API] Error updating certificate:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ============================================================
// DELETE - HAPUS SERTIFIKAT
// ============================================================
export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    console.log('🟢 [API] DELETE /api/admin/certificates?id=' + id);
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await db.delete(certificates).where(eq(certificates.id, parseInt(id))).returning();

    if (result.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Sertifikat tidak ditemukan' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('🟢 [API] Certificate deleted:', id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Sertifikat berhasil dihapus' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('🔴 [API] Error deleting certificate:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ============================================================
// GET - AMBIL SEMUA SERTIFIKAT (opsional)
// ============================================================
export const GET: APIRoute = async () => {
  try {
    const result = await db.select().from(certificates).orderBy(certificates.createdAt);
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: result 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('🔴 [API] Error fetching certificates:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};