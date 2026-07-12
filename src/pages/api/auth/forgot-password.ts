// src/pages/api/auth/forgot-password.ts
import type { APIRoute } from 'astro';
import { db } from '../../../db/index.js';
import { users, passwordResets } from '../../../db/schema.js';
import { eq, and, lt } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    console.log('📧 Forgot password request for:', email);

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email wajib diisi' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Cek user exists
    const user = await db.select().from(users).where(eq(users.email, email));
    console.log('👤 User found:', user.length > 0);

    if (user.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email tidak ditemukan' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Hapus token lama yang expired
    await db.delete(passwordResets)
      .where(
        and(
          eq(passwordResets.email, email),
          lt(passwordResets.expiresAt, new Date())
        )
      );

    // Generate token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 jam

    console.log('🔑 Token generated:', token.substring(0, 10) + '...');

    // Simpan token
    await db.insert(passwordResets).values({
      email,
      token,
      expiresAt,
      isUsed: false,
    });

    console.log('💾 Token saved to database');

    // Kirim email (contoh, nanti pakai nodemailer)
    const resetLink = `http://localhost:4321/auth/reset-password?token=${token}`;
    console.log(`📧 Reset password link untuk ${email}:`);
    console.log(`🔗 ${resetLink}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Link reset password telah dikirim ke email Anda',
        resetLink: resetLink // Hanya untuk testing, hapus di production
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('❌ Error in forgot-password:', error);
    console.error('❌ Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Terjadi kesalahan pada server' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};