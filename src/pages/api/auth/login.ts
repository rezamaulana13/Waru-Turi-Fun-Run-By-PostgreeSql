// src/pages/api/auth/login.ts
import type { APIRoute } from 'astro';
import { db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export const POST: APIRoute = async ({ request, cookies }) => {
  console.log('🔵 [API] Login called');
  
  try {
    // Parse body - gunakan json() langsung
    const data = await request.json();
    console.log('📝 Login attempt for:', data.email);

    // Validasi
    if (!data.email || !data.password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email dan password wajib diisi' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Cari user
    const result = await db.select().from(users).where(eq(users.email, data.email));
    
    if (!result || result.length === 0) {
      console.log('❌ User not found:', data.email);
      return new Response(
        JSON.stringify({ success: false, message: 'Email atau password salah' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const user = result[0];
    console.log('👤 User found:', user.email);
    console.log('🔑 User role:', user.role);

    // Verifikasi password
    const isValid = await bcrypt.compare(data.password, user.password);
    
    if (!isValid) {
      console.log('❌ Invalid password for:', user.email);
      return new Response(
        JSON.stringify({ success: false, message: 'Email atau password salah' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Password valid for:', user.email);

    // Update last login
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔑 Token generated for:', user.email);

    // ===== SET COOKIE - PASTIKAN CONFIGURASI BENAR =====
    cookies.set('token', token, {
      path: '/',
      httpOnly: true,
      secure: false, // Set ke false untuk development (localhost)
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log('🍪 Cookie set for:', user.email);

    // Response - hapus password
    const { password, ...safeUser } = user;
    
    // Tentukan redirect URL berdasarkan role
    let redirectUrl = '/';
    if (user.role === 'admin' || user.role === 'super_admin') {
      redirectUrl = '/admin';
    } else {
      redirectUrl = '/profile';
    }

    console.log('🔀 Redirect URL:', redirectUrl);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login berhasil',
        data: {
          user: safeUser,
          token: token,
          redirectUrl: redirectUrl
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('❌ Stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Terjadi kesalahan server' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};