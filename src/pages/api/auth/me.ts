// src/pages/api/auth/me.ts
import { getUserById } from '@/lib/users';
import { verifyToken } from '@/lib/auth'; // Sesuaikan dengan auth kamu

export default async function handler(req: any, res: any) {
  try {
    // Ambil token dari cookie atau header
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Verify token dan dapatkan user ID
    const decoded = verifyToken(token);
    if (typeof decoded !== 'object' || decoded === null || !('userId' in decoded) || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // ✅ Line 30 - Gunakan getUserById
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hapus password sebelum dikirim
    const { password, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      data: safeUser
    });

  } catch (error) {
    console.error('❌ Error in me API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}