// src/middleware/index.ts
import { defineMiddleware } from 'astro/middleware';
import { verifyToken } from './auth';

// Daftar halaman yang hanya bisa diakses admin
const adminRoutes = ['/admin'];

// Daftar halaman yang hanya bisa diakses user (harus login)
const userRoutes = ['/dashboard', '/profile'];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.url);
  const pathname = url.pathname;
  
  // Ambil token dari cookie
  const token = context.cookies.get('token');
  let user = null;
  
  if (token) {
    try {
      const tokenValue = typeof token === 'string' ? token : token.value;
      if (tokenValue) {
        user = await verifyToken(tokenValue);
      }
    } catch (error) {
      console.error('Token verification error:', error);
    }
  }
  
  // Halaman admin - harus login sebagai admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return context.redirect('/auth/login');
    }
  }
  
  // Halaman user - harus login sebagai user
  if (userRoutes.some(route => pathname.startsWith(route))) {
    if (!user || user.role !== 'user') {
      return context.redirect('/auth/login');
    }
  }
  
  // Jika sudah login dan mengakses halaman login/register
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        return context.redirect('/admin');
      }
      return context.redirect('/dashboard');
    }
  }
  
  // Tambahkan user ke locals
  (context.locals as any).user = user;
  
  return next();
});