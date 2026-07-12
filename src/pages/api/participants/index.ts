// src/pages/api/admin/participants/register.ts
import type { APIRoute } from 'astro';
import { db, participants } from '../../../lib/users';
import { eq, like, sql } from 'drizzle-orm';
import { verifyAdmin } from '../../../lib/auth';

// ============================================================
// GET - Ambil data peserta dengan filter
// ============================================================
export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    // Verifikasi admin
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

    let query: any = db.select().from(participants);

    // Filter search
    if (search) {
      query = query.where(
        sql`${participants.fullName} ILIKE ${`%${search}%`} OR ${participants.email} ILIKE ${`%${search}%`}`
      );
    }

    // Filter category
    if (category) {
      query = query.where(sql`${participants.category} = ${category}`);
    }

    // Filter status
    if (status) {
      query = query.where(sql`${participants.status} = ${status}`);
    }

    // Filter payment status
    if (paymentStatus) {
      query = query.where(sql`${participants.paymentStatus} = ${paymentStatus}`);
    }

    const data = await query.orderBy(participants.id);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// ============================================================
// POST - Tambah peserta baru
// ============================================================
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verifikasi admin
    const admin = await verifyAdmin(cookies);
    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    console.log('📝 Data peserta:', body);

    const { 
      fullName, 
      email, 
      phone, 
      gender, 
      birthDate, 
      category, 
      jerseySize, 
      institution, 
      address,
      emergencyContact,
      emergencyPhone,
      paymentMethod 
    } = body;

    // Validasi required fields
    if (!fullName || !email || !phone || !category) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Data tidak lengkap. fullName, email, phone, category wajib diisi.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cek duplikat email
    const existing = await db.select().from(participants).where(sql`${participants.email} = ${email}`);
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email sudah terdaftar sebagai peserta' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate BIB number
    const bibResult = await db.execute(sql`SELECT COALESCE(MAX(bib_number), 0) + 1 as next_bib FROM participants`);
    const bibNumber = bibResult.rows[0]?.next_bib || 1;

    // Insert ke database
    const result = await db.insert(participants).values({
      fullName: fullName,
      email: email,
      phone: phone,
      gender: gender || null,
      birthDate: birthDate || null,
      category: category,
      jerseySize: jerseySize || null,
      institution: institution || null,
      address: address || null,
      emergencyContact: emergencyContact || null,
      emergencyPhone: emergencyPhone || null,
      paymentMethod: paymentMethod || null,
      paymentStatus: 'pending',
      bibNumber: bibNumber,
      status: 'registered',
      registerDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();

    console.log('✅ Peserta berhasil ditambahkan:', result[0].email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result[0],
        message: 'Peserta berhasil ditambahkan' 
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating participant:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// ============================================================
// PUT - Update peserta
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

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID peserta diperlukan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cek apakah peserta ada
    const existing = await db.select().from(participants).where(sql`${participants.id} = ${id}`);
    if (existing.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Peserta tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db.update(participants)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(sql`${participants.id} = ${id}`)
      .returning();

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result[0],
        message: 'Data peserta berhasil diperbarui' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error updating participant:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// ============================================================
// DELETE - Hapus peserta
// ============================================================
export const DELETE: APIRoute = async ({ url, cookies }) => {
  try {
    const admin = await verifyAdmin(cookies);
    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID peserta diperlukan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cek apakah peserta ada
    const existing = await db.select().from(participants).where(sql`${participants.id} = ${id}`);
    if (existing.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Peserta tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db.delete(participants)
      .where(sql`${participants.id} = ${id}`)
      .returning();

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result[0],
        message: 'Peserta berhasil dihapus' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error deleting participant:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};