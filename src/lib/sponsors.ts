import { db, sponsors } from '../db';
import { eq } from 'drizzle-orm';

export async function getAllSponsors() {
  return await db.select().from(sponsors).orderBy(sponsors.id);
}

export async function getSponsorsByTier(tier: string) {
  return await db.select().from(sponsors).where(eq(sponsors.tier, tier as any));
}

export async function createSponsor(data: any) {
  return await db.insert(sponsors).values(data).returning();
}

export async function deleteSponsor(id: number) {
  return await db.delete(sponsors).where(eq(sponsors.id, id));
}