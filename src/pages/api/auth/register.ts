// src/pages/api/auth/register.ts
import type { APIRoute } from 'astro';
import { db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request }) => {
  console.log('🔵 [API] Register called');
  
  try {
    const body = await request.json();
    console.log('📝 Register attempt for:', body.email);

    // Validasi wajib
    if (!body.name || !body.email || !body.password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nama, email, dan password wajib diisi' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Format email tidak valid' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validasi password
    if (body.password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Password minimal 6 karakter' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Cek email sudah terdaftar
    const existingUser = await db.select().from(users).where(eq(users.email, body.email));
    if (existingUser.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email sudah terdaftar' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    console.log('✅ Password hashed');

    // Insert user
    const result = await db.insert(users).values({
      email: body.email,
      password: hashedPassword,
      name: body.name,
      phone: body.phone || null,
      gender: body.gender || null,
      role: 'user',
      isActive: true,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      phone: users.phone,
      gender: users.gender,
      createdAt: users.createdAt
    });

    console.log('✅ User registered:', result[0].email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registrasi berhasil! Silakan login.',
        data: {
          user: result[0]
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Register error:', error);
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