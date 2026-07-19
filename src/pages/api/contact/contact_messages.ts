// src/pages/api/contact/contact_messages.ts
// ============================================================
// Endpoint buat nerima submit form kontak dari /kontak (publik).
// Dipanggil via fetch POST dari script di kontak.astro.
// ============================================================
import type { APIRoute } from 'astro';
import { db, contactMessages } from '../../../db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const subject = (body.subject || '').toString().trim();
    const message = (body.message || '').toString().trim();

    // ===== VALIDASI =====
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nama, email, subjek, dan pesan wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Format email tidak valid.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ===== SIMPAN KE DATABASE =====
    const [inserted] = await db.insert(contactMessages).values({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      status: 'unread',
    }).returning();

    // NOTE: kalau nanti mau ada notifikasi email ke admin setiap ada pesan
    // baru masuk (mis. pakai Resend/Nodemailer), panggil service-nya di sini,
    // setelah insert berhasil. Untuk sekarang, admin cek manual di /admin/kontak.

    return new Response(
      JSON.stringify({ success: true, id: inserted?.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('Error saving contact message:', e);
    return new Response(
      JSON.stringify({ success: false, error: 'Terjadi kesalahan di server. Coba lagi nanti.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};