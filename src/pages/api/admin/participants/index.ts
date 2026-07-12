// src/pages/api/admin/participants/index.ts
import type { APIRoute } from 'astro';
import { getParticipants, createParticipant, updateParticipant, deleteParticipant } from '../../../../lib/participants';
import { verifyAdmin } from '../../../../lib/auth';

// ============================================================
// GET - Ambil semua peserta
// ============================================================
export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    const admin = await verifyAdmin(cookies);
    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || '';
    const paymentStatus = url.searchParams.get('paymentStatus') || '';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const result = await getParticipants({
      search,
      category,
      status,
      paymentStatus,
      limit,
      offset,
    });

    return new Response(
      JSON.stringify({ success: true, data: result.data, total: result.total }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Error fetching participants:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch participants', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================================
// POST - Tambah peserta baru (dari admin)
// ============================================================
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const admin = await verifyAdmin(cookies);
    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Baca raw body untuk debug
    const rawBody = await request.text();
    console.log('📝 Raw body:', rawBody);
    
    // ✅ Parse JSON
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError: any) {
      console.error('❌ JSON Parse error:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON format', 
          message: parseError.message,
          rawBody: rawBody
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('📝 Parsed data:', data);
    console.log('📝 fullName:', data.fullName);
    
    // ✅ Validasi
    if (!data.fullName || data.fullName.trim() === '') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'fullName wajib diisi' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!data.email || data.email.trim() === '') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'email wajib diisi' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!data.phone || data.phone.trim() === '') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'phone wajib diisi' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!data.category || data.category.trim() === '') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'category wajib diisi' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Data yang akan dikirim ke createParticipant
    const participantData = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      gender: data.gender || null,
      birthDate: data.birthDate || null,
      category: data.category,
      jerseySize: data.jerseySize || null,
      institution: data.institution || null,
      address: data.address || null,
      emergencyContact: data.emergencyContact || null,
      emergencyPhone: data.emergencyPhone || null,
      paymentMethod: data.paymentMethod || null,
      userId: data.userId || null,
    };

    console.log('📝 Participant data to insert:', participantData);

    const result = await createParticipant(participantData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result, 
        message: 'Peserta berhasil ditambahkan' 
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Error creating participant:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to create participant', 
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================================
// PUT - Update status peserta
// ============================================================
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const admin = await verifyAdmin(cookies);
    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await request.text();
    console.log('📝 Raw body PUT:', rawBody);
    
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError: any) {
      console.error('❌ JSON Parse error PUT:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON format', 
          message: parseError.message 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('📝 Parsed data PUT:', data);
    
    const { id, ...updateData } = data;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID peserta diperlukan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await updateParticipant(id, updateData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result, 
        message: 'Data peserta berhasil diperbarui' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Error updating participant:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to update participant', 
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================================
// DELETE - Hapus peserta
// ============================================================
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const admin = await verifyAdmin(cookies);
    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID peserta diperlukan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await deleteParticipant(parseInt(id));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result, 
        message: 'Peserta berhasil dihapus' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Error deleting participant:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to delete participant', 
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};