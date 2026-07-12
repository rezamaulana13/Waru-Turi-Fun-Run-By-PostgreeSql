// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';
import { getUserById as getUserByIdFromDB } from './users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ===== VERIFY TOKEN =====
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// ===== GET USER BY TOKEN =====
export async function getUserByToken(token: string) {
  try {
    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      console.log('❌ Invalid token or decoded is string');
      return null;
    }
    
    const user = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || user.length === 0) {
      console.log('❌ User not found for token');
      return null;
    }
    
    const { password, ...safeUser } = user[0];
    return safeUser;
  } catch (error) {
    console.error('Error getting user by token:', error);
    return null;
  }
}

// ===== GENERATE TOKEN =====
export function generateToken(user: any) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ===== VERIFY ADMIN =====
export async function verifyAdmin(cookies: any) {
  try {
    const token = cookies.get('token')?.value;
    
    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      console.log('❌ Invalid token');
      return null;
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || user.length === 0) {
      console.log('❌ User not found');
      return null;
    }

    const userData = user[0];
    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      console.log('❌ User is not admin:', userData.role);
      return null;
    }

    console.log('✅ Admin verified:', userData.email);
    return userData;
  } catch (error) {
    console.error('❌ Auth error:', error);
    return null;
  }
}

// ===== VERIFY USER =====
export async function verifyUser(cookies: any) {
  try {
    const token = cookies.get('token')?.value;
    
    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      console.log('❌ Invalid token');
      return null;
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || user.length === 0) {
      console.log('❌ User not found');
      return null;
    }

    const { password, ...safeUser } = user[0];
    console.log('✅ User verified:', safeUser.email);
    return safeUser;
  } catch (error) {
    console.error('❌ Auth error:', error);
    return null;
  }
}

// ===== GET CURRENT USER FROM REQUEST =====
export async function getCurrentUser(request: Request, cookies: any) {
  try {
    let token = cookies.get('token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return null;
    }

    const user = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || user.length === 0) {
      return null;
    }

    const { password, ...safeUser } = user[0];
    return safeUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// ===== GET USER BY ID =====
export async function getUserById(id: number) {
  try {
    const user = await getUserByIdFromDB(id);
    if (!user) {
      return null;
    }
    const { password, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}