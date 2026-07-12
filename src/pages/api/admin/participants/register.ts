// src/pages/api/admin/participants/register.ts
import type { APIRoute } from 'astro';
// ✅ Import dari db (bukan lib/users)
import { db, users, participants } from '../../../../db';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../../../../lib/auth';
import { createParticipant } from '../../../../lib/participants';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Cek login
    const token = cookies.get('token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Silakan login terlebih dahulu' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Token tidak valid' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Ambil data user
    const userResult = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!userResult || userResult.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'User tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = userResult[0];

    // 3. Parse data pendaftaran
    const data = await request.json();
    console.log('📝 Data pendaftaran:', data);

    // 4. Validasi
    if (!data.fullName || !data.email || !data.phone || !data.category) {
      return new Response(
        JSON.stringify({ success: false, message: 'Data tidak lengkap. fullName, email, phone, category wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Cek apakah sudah terdaftar
    const existing = await db.select().from(participants).where(eq(participants.email, data.email));
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email sudah terdaftar sebagai peserta' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Data untuk createParticipant
    const participantData = {
      userId: user.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      gender: data.gender || null,
      birthDate: data.birthDate || null,
      category: data.category,
      jerseySize: data.jerseySize || null,
      institution: data.institution || null,
      address: data.address || null,
      emergencyContact: data.emergencyContact || null,
      emergencyPhone: data.emergencyPhone || null,
      paymentMethod: data.paymentMethod || null,
      paymentStatus: 'pending',
      status: 'registered',
    };

    // 7. Create participant menggunakan fungsi dari lib/participants
    const result = await createParticipant(participantData);

    console.log('✅ Peserta berhasil mendaftar:', result.email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pendaftaran berhasil',
        data: {
          id: result.id,
          fullName: result.fullName,
          email: result.email,
          category: result.category,
          bibNumber: result.bibNumber,
          status: result.status,
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error registrasi peserta:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Terjadi kesalahan: ' + error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};