// src/db/index.ts
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../../.env') });

console.log('🔌 Initializing database connection...');

// Gunakan process.env untuk semua environment (Node.js & Astro)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL tidak ditemukan di .env!');
  console.error('📝 Pastikan file .env ada dengan isi:');
  console.error('   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/waruturi_db');
  process.exit(1);
}

console.log('📝 DATABASE_URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test koneksi
(async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Database connected successfully!');
    const result = await client.query('SELECT NOW() as time, current_user as user');
    console.log('📝 Server time:', result.rows[0].time);
    console.log('📝 Current user:', result.rows[0].user);
    client.release();
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    if (client) client.release();
  }
})();

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

export const db = drizzle(pool, { schema });
export { pool };

// ===== EKSPOR SEMUA SCHEMA =====
export * from './schema.js';