// src/lib/users.ts
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq, count, like, or, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// ============================================================
// USER FUNCTIONS
// ============================================================

export async function registerUser(data: any) {
  try {
    console.log('📝 [DB] Registering user:', { email: data.email, name: data.name });

    const existingUser = await db.select().from(users).where(eq(users.email, data.email));
    if (existingUser.length > 0) {
      throw new Error('Email sudah terdaftar');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log('✅ [DB] Password hashed');

    const result = await db.insert(users).values({
      email: data.email,
      password: hashedPassword,
      name: data.name || 'User',
      phone: data.phone || null,
      gender: data.gender || null,
      birthDate: data.birth_date || null,
      address: data.address || null,
      institution: data.institution || null,
      isActive: true,
    }).returning();

    console.log('✅ [DB] User registered:', result[0].email);
    return result[0];
  } catch (error) {
    console.error('❌ [DB] Register error:', error);
    throw error;
  }
}

export async function getUserById(id: number) {
  try {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by id:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function updateUser(id: number, data: any) {
  try {
    const updateData: any = { ...data, updatedAt: sql`CURRENT_TIMESTAMP` };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Hapus field yang tidak boleh diupdate
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.email;

    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: number) {
  try {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0] || null;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getAllUsers(filters?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select().from(users) as any;

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        or(
          like(users.name, searchTerm),
          like(users.email, searchTerm)
        )
      );
    }

    query = query.orderBy(desc(users.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const result = await query;
    const totalResult = await db.select({ count: count() }).from(users);
    const total = Number(totalResult[0]?.count) || 0;

    return {
      data: result,
      total,
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return { data: [], total: 0 };
  }
}

export async function getUserStats() {
  try {
    const totalResult = await db.select({ count: count() }).from(users);
    const activeResult = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));

    return {
      total: Number(totalResult[0]?.count) || 0,
      active: Number(activeResult[0]?.count) || 0,
    };
  } catch (error) {
    return { total: 0, active: 0 };
  }
}

export async function changeUserPassword(id: number, oldPassword: string, newPassword: string) {
  try {
    const user = await getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new Error('Password lama salah');
    }

    if (newPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: sql`CURRENT_TIMESTAMP` 
      })
      .where(eq(users.id, id))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

// ============================================================
// EXPORT
// ============================================================
export default {
  registerUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserStats,
  changeUserPassword,
};