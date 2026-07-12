// src/lib/participants.ts
import { db, participants } from '../db';
import { eq, and, like, or, count, desc, sql } from 'drizzle-orm';

// ============================================================
// CREATE - Tambah peserta baru
// ============================================================
export async function createParticipant(data: any) {
  try {
    console.log('📝 Creating participant with data:', JSON.stringify(data, null, 2));
    
    // Validasi required fields
    const requiredFields = ['fullName', 'email', 'phone', 'category'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        throw new Error(`${field} is required`);
      }
    }
    
    // ✅ Cek duplikat email (tambahkan error handling)
    try {
      const existing = await db.select().from(participants).where(eq(participants.email, data.email));
      if (existing.length > 0) {
        throw new Error('Email sudah terdaftar sebagai peserta');
      }
    } catch (checkError: any) {
      // Jika error karena tabel tidak ada, lanjutkan saja
      if (!checkError.message?.includes('relation')) {
        throw checkError;
      }
      console.warn('⚠️ Tabel participants belum ada, melanjutkan...');
    }
    
    // Generate BIB number
    let bibNumber = 1;
    try {
      const bibResult = await db.execute(sql`SELECT COALESCE(MAX(bib_number), 0) + 1 as next_bib FROM participants`);
      bibNumber = (bibResult.rows[0]?.next_bib as number) || 1;
    } catch (bibError) {
      console.warn('⚠️ Error getting BIB, using default:', bibError);
    }
    console.log('📝 Generated BIB:', bibNumber);
    
    // Build insert data
    const insertData: any = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      category: data.category,
      bibNumber: bibNumber,
      status: data.status || 'registered',
      paymentStatus: data.paymentStatus || 'pending',
      registerDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Optional fields
    const optionalFields = [
      'userId', 'gender', 'birthDate', 'jerseySize', 'institution', 
      'address', 'emergencyContact', 'emergencyPhone', 'paymentMethod',
      'paymentProof', 'paymentAmount', 'paymentDate', 'checkInTime',
      'finishTime', 'ranking', 'categoryRank', 'note'
    ];
    
    for (const field of optionalFields) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        insertData[field] = data[field];
      }
    }
    
    console.log('📝 Insert data:', JSON.stringify(insertData, null, 2));
    
    const result = await db.insert(participants).values(insertData).returning();
    
    console.log('✅ Participant created:', result[0]);
    return result[0];
  } catch (error) {
    console.error('❌ Error creating participant:', error);
    throw error;
  }
}

// ============================================================
// READ - Ambil semua peserta dengan filter
// ============================================================
export async function getParticipants(filters?: {
  search?: string;
  category?: string;
  status?: string;
  paymentStatus?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query: any = db.select().from(participants);
    
    // Search filter
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        or(
          like(participants.fullName, searchTerm),
          like(participants.email, searchTerm),
          sql`${participants.bibNumber}::text LIKE ${searchTerm}`
        )
      );
    }
    
    // Category filter
    if (filters?.category) {
      query = query.where(eq(participants.category, filters.category as any));
    }
    
    // Status filter
    if (filters?.status) {
      query = query.where(eq(participants.status, filters.status as any));
    }
    
    // Payment status filter
    if (filters?.paymentStatus) {
      query = query.where(eq(participants.paymentStatus, filters.paymentStatus as any));
    }
    
    // Order by latest
    query = query.orderBy(desc(participants.createdAt));
    
    // Pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    const result = await query;
    
    // Get total count
    let totalQuery: any = db.select({ count: count() }).from(participants);
    
    // Apply same filters for count
    if (filters?.category) {
      totalQuery = totalQuery.where(eq(participants.category, filters.category as any));
    }
    if (filters?.status) {
      totalQuery = totalQuery.where(eq(participants.status, filters.status as any));
    }
    if (filters?.paymentStatus) {
      totalQuery = totalQuery.where(eq(participants.paymentStatus, filters.paymentStatus as any));
    }
    
    const total = await totalQuery;
    
    return {
      data: result,
      total: total[0]?.count || 0,
    };
  } catch (error) {
    console.error('❌ Error getting participants:', error);
    throw error;
  }
}

// ============================================================
// READ - Ambil satu peserta berdasarkan ID
// ============================================================
export async function getParticipantById(id: number) {
  try {
    const result = await db.select().from(participants).where(eq(participants.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('❌ Error getting participant by ID:', error);
    throw error;
  }
}

// ============================================================
// READ - Ambil peserta berdasarkan email
// ============================================================
export async function getParticipantByEmail(email: string) {
  try {
    const result = await db.select().from(participants).where(eq(participants.email, email));
    return result[0] || null;
  } catch (error) {
    console.error('❌ Error getting participant by email:', error);
    throw error;
  }
}

// ============================================================
// UPDATE - Update data peserta
// ============================================================
export async function updateParticipant(id: number, data: any) {
  try {
    console.log('📝 Updating participant ID:', id, data);
    
    // Cek apakah peserta ada
    const existing = await db.select().from(participants).where(eq(participants.id, id));
    if (existing.length === 0) {
      throw new Error('Participant not found');
    }
    
    // Remove id from update data
    const { id: _, ...updateData } = data;
    
    const result = await db.update(participants)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, id))
      .returning();
    
    console.log('✅ Participant updated:', result[0]);
    return result[0];
  } catch (error) {
    console.error('❌ Error updating participant:', error);
    throw error;
  }
}

// ============================================================
// DELETE - Hapus peserta
// ============================================================
export async function deleteParticipant(id: number) {
  try {
    console.log('📝 Deleting participant ID:', id);
    
    // Cek apakah peserta ada
    const existing = await db.select().from(participants).where(eq(participants.id, id));
    if (existing.length === 0) {
      throw new Error('Participant not found');
    }
    
    const result = await db.delete(participants)
      .where(eq(participants.id, id))
      .returning();
    
    console.log('✅ Participant deleted:', result[0]);
    return result[0];
  } catch (error) {
    console.error('❌ Error deleting participant:', error);
    throw error;
  }
}

// ============================================================
// BULK OPERATIONS
// ============================================================
export async function bulkUpdateParticipants(ids: number[], data: any) {
  try {
    const result = await db.update(participants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(sql`${participants.id} = ANY(${ids})`)
      .returning();
    
    return result;
  } catch (error) {
    console.error('❌ Error bulk updating participants:', error);
    throw error;
  }
}

export async function bulkDeleteParticipants(ids: number[]) {
  try {
    const result = await db.delete(participants)
      .where(sql`${participants.id} = ANY(${ids})`)
      .returning();
    
    return result;
  } catch (error) {
    console.error('❌ Error bulk deleting participants:', error);
    throw error;
  }
}

// ============================================================
// STATISTICS
// ============================================================
export async function getParticipantStats() {
  try {
    const total = await db.select({ count: count() }).from(participants);
    const confirmed = await db.select({ count: count() }).from(participants).where(eq(participants.status, 'confirmed'));
    const pending = await db.select({ count: count() }).from(participants).where(eq(participants.status, 'registered'));
    const paid = await db.select({ count: count() }).from(participants).where(eq(participants.paymentStatus, 'paid'));
    const unpaid = await db.select({ count: count() }).from(participants).where(eq(participants.paymentStatus, 'pending'));
    
    const category5K = await db.select({ count: count() }).from(participants).where(eq(participants.category, '5K'));
    const category10K = await db.select({ count: count() }).from(participants).where(eq(participants.category, '10K'));
    const categoryPelajar = await db.select({ count: count() }).from(participants).where(eq(participants.category, 'pelajar'));
    
    // Statistik gender
    const male = await db.select({ count: count() }).from(participants).where(eq(participants.gender, 'Pria'));
    const female = await db.select({ count: count() }).from(participants).where(eq(participants.gender, 'Wanita'));
    
    return {
      total: total[0]?.count || 0,
      confirmed: confirmed[0]?.count || 0,
      pending: pending[0]?.count || 0,
      paid: paid[0]?.count || 0,
      unpaid: unpaid[0]?.count || 0,
      categories: {
        '5K': category5K[0]?.count || 0,
        '10K': category10K[0]?.count || 0,
        'pelajar': categoryPelajar[0]?.count || 0,
      },
      gender: {
        male: male[0]?.count || 0,
        female: female[0]?.count || 0,
      }
    };
  } catch (error) {
    console.error('❌ Error getting participant stats:', error);
    throw error;
  }
}

// ============================================================
// EXPORT
// ============================================================
export {
  participants,
};