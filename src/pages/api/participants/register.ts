// src/pages/api/participants/register.ts
import type { APIRoute } from 'astro';
import { db, pool } from '../../../db/index.js';
import { users, participants } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('🔵 [API] Register Participant called');
    
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
    console.log('📝 Data pendaftaran:', JSON.stringify(data, null, 2));

    // 4. Validasi
    const requiredFields = ['fullName', 'email', 'phone', 'category', 'jerseySize', 'paymentMethod'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field] === '');
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Field wajib diisi: ${missingFields.join(', ')}` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ===== KONVERSI CATEGORY =====
    // Pastikan category sesuai dengan enum di database: ['5K', '10K', 'Pelajar']
    let category = data.category;
    if (category === 'pelajar') {
      category = 'Pelajar'; // ← Ubah ke huruf besar P
    }
    console.log('📝 Category after conversion:', category);

    // 5. Cek apakah sudah terdaftar
    const existing = await db.select().from(participants).where(eq(participants.email, data.email));
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email sudah terdaftar sebagai peserta' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Generate BIB Number
    const countResult = await db.select().from(participants);
    const totalParticipants = countResult.length || 0;
    const bibNumber = totalParticipants + 1;
    console.log('📋 BIB Number:', bibNumber);

    // 7. GUNAKAN SQL RAW UNTUK INSERT - dengan category yang sudah dikonversi
    const insertQuery = `
      INSERT INTO participants (
        user_id, full_name, email, phone, gender, birth_date, 
        category, jersey_size, institution, address, 
        emergency_contact, emergency_phone, payment_method, 
        payment_status, bib_number, status, register_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9, $10, 
        $11, $12, $13, 
        $14, $15, $16, $17
      ) RETURNING id, full_name, email, category, bib_number, status;
    `;

    const insertValues = [
      user.id,
      data.fullName.trim(),
      data.email.trim(),
      data.phone.trim(),
      data.gender || null,
      data.birthDate || null,
      category, // ← Gunakan category yang sudah dikonversi
      data.jerseySize,
      data.institution || null,
      data.address || null,
      data.emergencyContact || null,
      data.emergencyPhone || null,
      data.paymentMethod,
      'pending',
      bibNumber,
      'registered',
      new Date(),
    ];

    console.log('📝 Insert values:', insertValues);

    // 8. Execute raw SQL
    const result = await pool.query(insertQuery, insertValues);
    console.log('📊 Result rows:', result.rows);

    if (!result.rows || result.rows.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Gagal menyimpan data peserta' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const newParticipant = result.rows[0];
    console.log('✅ Peserta berhasil mendaftar:', newParticipant.email);
    console.log('📋 BIB Number:', newParticipant.bib_number);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pendaftaran berhasil!',
        data: {
          id: newParticipant.id,
          fullName: newParticipant.full_name,
          email: newParticipant.email,
          category: newParticipant.category,
          bibNumber: newParticipant.bib_number,
          status: newParticipant.status,
        }
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Error registrasi peserta:', error);
    console.error('❌ Stack:', error.stack);
    
    // Kirim error detail
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Terjadi kesalahan: ' + error.message,
        detail: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};