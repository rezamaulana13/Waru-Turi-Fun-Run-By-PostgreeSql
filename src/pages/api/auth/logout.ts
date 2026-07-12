// src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Hapus cookie token
    cookies.delete('token', {
      path: '/',
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Logout berhasil' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Gagal logout' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};