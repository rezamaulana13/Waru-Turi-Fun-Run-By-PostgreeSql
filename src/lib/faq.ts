import { db, faqs } from '../db';
import { eq } from 'drizzle-orm';

export async function getAllFaqs() {
  return await db.select().from(faqs).orderBy(faqs.order);
}

export async function createFaq(data: { question: string; answer: string; order?: number }) {
  return await db.insert(faqs).values(data).returning();
}

export async function deleteFaq(id: number) {
  return await db.delete(faqs).where(eq(faqs.id, id));
}