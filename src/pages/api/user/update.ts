// src/pages/api/user/update.ts
import type { APIRoute } from 'astro';
import { verifyToken, getCurrentUser } from '../../../lib/auth';
import { updateUser, getUserById } from '../../../lib/users';

// Type definitions
interface UpdateUserData {
  name: string;
  phone: string;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  institution?: string | null;
  new_password?: string;
}

interface UpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Ambil token dari cookie
    const token = cookies.get('token')?.value;
    
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized. Silakan login terlebih dahulu.'
        } satisfies UpdateResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Verifikasi token
    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string' || !decoded.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token tidak valid. Silakan login ulang.'
        } satisfies UpdateResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 3. Ambil data dari request body
    const body = await request.json() as UpdateUserData;
    const {
      name,
      phone,
      birth_date,
      gender,
      address,
      city,
      province,
      postal_code,
      institution,
      new_password
    } = body;

    // 4. Validasi data wajib
    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nama lengkap wajib diisi.'
        } satisfies UpdateResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!phone || !phone.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nomor telepon wajib diisi.'
        } satisfies UpdateResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 5. Validasi nomor telepon (minimal 10 digit)
    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nomor telepon harus terdiri dari 10-15 digit angka.'
        } satisfies UpdateResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 6. Validasi password jika diisi
    if (new_password && new_password.length > 0) {
      if (new_password.length < 6) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Password baru harus minimal 6 karakter.'
          } satisfies UpdateResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // 7. Cek apakah user exists
    const userId = Number(decoded.id);
    const existingUser = await getUserById(userId);
    
    if (!existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User tidak ditemukan.'
        } satisfies UpdateResponse),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 8. Siapkan data untuk update (sesuai dengan schema users)
    const updateData: any = {
      name: name.trim(),
      phone: phoneClean,
      gender: gender || null,
      address: address || null,
      institution: institution || null,
      // Field tambahan yang mungkin tidak ada di schema
      // birthDate: birth_date || null,
      // city: city || null,
      // province: province || null,
      // postal_code: postal_code || null,
    };

    // Tambahkan field yang ada di schema
    if (birth_date) {
      updateData.birthDate = birth_date;
    }

    // 9. Hash password jika ada (fungsi updateUser sudah handle hashing)
    if (new_password && new_password.length >= 6) {
      updateData.password = new_password; // Akan di-hash oleh updateUser
    }

    // 10. Update user di database
    const updatedUser = await updateUser(userId, updateData);

    if (!updatedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Gagal memperbarui profil.'
        } satisfies UpdateResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 11. Return response sukses
    return new Response(
      JSON.stringify({
        success: true,
        message: '✅ Profil berhasil diperbarui!',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone
        }
      } satisfies UpdateResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error updating profile:', error);

    // Error handling
    if (error instanceof Error) {
      // Cek error dari database
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Email atau nomor telepon sudah terdaftar.'
          } satisfies UpdateResponse),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Terjadi kesalahan. Silakan coba lagi.'
        } satisfies UpdateResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Terjadi kesalahan pada server. Silakan coba lagi.'
      } satisfies UpdateResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Support untuk method PUT juga
export const PUT: APIRoute = async (context) => {
  return POST(context);
};