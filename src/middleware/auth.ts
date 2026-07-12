// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { getUserById } from '../lib/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await getUserById(decoded.id);
    return user;
  } catch (error) {
    console.error('Verify token error:', error);
    return null;
  }
}

export async function verifyAdmin(cookies: any) {
  try {
    const token = cookies.get('token');
    if (!token) return null;

    const tokenValue = typeof token === 'string' ? token : token.value;
    if (!tokenValue) return null;

    const user = await verifyToken(tokenValue);
    if (!user) return null;

    const adminRoles = ['admin', 'super_admin'];
    if (!user.role || !adminRoles.includes(user.role)) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Verify admin error:', error);
    return null;
  }
}

export async function verifyUser(cookies: any) {
  try {
    const token = cookies.get('token');
    if (!token) return null;

    const tokenValue = typeof token === 'string' ? token : token.value;
    if (!tokenValue) return null;

    const user = await verifyToken(tokenValue);
    if (!user) return null;
    
    if (!user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Verify user error:', error);
    return null;
  }
}

export async function verifyAdminOrUser(cookies: any) {
  try {
    const token = cookies.get('token');
    if (!token) return null;

    const tokenValue = typeof token === 'string' ? token : token.value;
    if (!tokenValue) return null;

    const user = await verifyToken(tokenValue);
    if (!user) return null;
    
    if (!user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Verify admin or user error:', error);
    return null;
  }
}