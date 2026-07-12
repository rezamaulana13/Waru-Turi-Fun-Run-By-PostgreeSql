// src/pages/api/auth/reset-password.ts
import type { APIRoute } from 'astro';
import { db } from '../../../db/index.js';
import { passwordResets, users } from '../../../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    console.log('🔐 Reset password request received');

    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token dan password wajib diisi' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password minimal 6 karakter' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Cek token valid
    const resetData = await db.select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.token, token),
          eq(passwordResets.isUsed, false),
          gt(passwordResets.expiresAt, new Date())
        )
      );

    console.log('🔍 Token found:', resetData.length > 0);

    if (resetData.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token tidak valid atau sudah kadaluarsa' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { email } = resetData[0];
    console.log('📧 Resetting password for:', email);

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, email));

    // Tandai token sudah digunakan
    await db.update(passwordResets)
      .set({ isUsed: true })
      .where(eq(passwordResets.token, token));

    console.log('✅ Password reset successful for:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password berhasil direset! Silakan login.'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('❌ Error in reset-password:', error);
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