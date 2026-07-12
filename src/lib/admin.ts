// src/lib/admin.ts
import { db, admins } from '../db';
import { eq, sql, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ===== REGISTER ADMIN =====
export async function registerAdmin(data: any) {
  try {
    // Cek email sudah terdaftar
    const existingAdmin = await db.select().from(admins).where(eq(admins.email, data.email));
    if (existingAdmin.length > 0) {
      throw new Error('Email sudah terdaftar sebagai admin');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await db.insert(admins).values({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'admin',
      phone: data.phone || null,
      isActive: true,
    }).returning();

    return result[0];
  } catch (error) {
    console.error('Error registering admin:', error);
    throw error;
  }
}

// ===== GET ADMIN BY ID =====
export async function getAdminById(id: number) {
  try {
    const result = await db.select().from(admins).where(eq(admins.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting admin by id:', error);
    throw error;
  }
}

// ===== GET ADMIN BY EMAIL =====
export async function getAdminByEmail(email: string) {
  try {
    const result = await db.select().from(admins).where(eq(admins.email, email));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting admin by email:', error);
    throw error;
  }
}

// ===== UPDATE ADMIN =====
export async function updateAdmin(id: number, data: any) {
  try {
    const updateData: any = { ...data, updatedAt: sql`CURRENT_TIMESTAMP` };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    delete updateData.id;
    delete updateData.createdAt;

    const result = await db.update(admins)
      .set(updateData)
      .where(eq(admins.id, id))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
}

// ===== DELETE ADMIN =====
export async function deleteAdmin(id: number) {
  try {
    const result = await db.delete(admins).where(eq(admins.id, id)).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
}

// ===== GET ALL ADMINS =====
export async function getAllAdmins(filters?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query: any = db.select().from(admins);

    if (filters?.search) {
      query = query.where(
        sql`${admins.name} ILIKE ${'%' + filters.search + '%'} OR ${admins.email} ILIKE ${'%' + filters.search + '%'}`
      );
    }

    query = query.orderBy(sql`created_at DESC`);

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const result = await query;
    const total = await db.select({ count: count() }).from(admins);

    return {
      data: result,
      total: total[0]?.count || 0,
    };
  } catch (error) {
    console.error('Error getting admins:', error);
    return { data: [], total: 0 };
  }
}

// ===== GET ADMIN STATISTICS =====
export async function getAdminStats() {
  try {
    const total = await db.select({ count: count() }).from(admins);
    const active = await db.select({ count: count() }).from(admins).where(eq(admins.isActive, true));

    return {
      total: Number(total[0]?.count) || 0,
      active: Number(active[0]?.count) || 0,
    };
  } catch (error) {
    return { total: 0, active: 0 };
  }
}

// ===== CHANGE ADMIN PASSWORD =====
export async function changeAdminPassword(id: number, oldPassword: string, newPassword: string) {
  try {
    const admin = await getAdminById(id);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const isValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isValid) {
      throw new Error('Password lama salah');
    }

    if (newPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.update(admins)
      .set({ 
        password: hashedPassword,
        updatedAt: sql`CURRENT_TIMESTAMP` 
      })
      .where(eq(admins.id, id))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error changing admin password:', error);
    throw error;
  }
}

// ===== EXPORT =====
export default {
  registerAdmin,
  getAdminById,
  getAdminByEmail,
  updateAdmin,
  deleteAdmin,
  getAllAdmins,
  getAdminStats,
  changeAdminPassword,
};