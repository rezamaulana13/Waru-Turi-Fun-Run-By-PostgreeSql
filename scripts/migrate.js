import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'waruturi_db',
  ssl: false,
});

const db = drizzle(pool);

async function main() {
  console.log('🔄 Running migrations...');
  console.log(`📁 Database: ${process.env.DB_NAME || 'waruturi_db'}`);
  
  try {
    await migrate(db, { 
      migrationsFolder: path.resolve(__dirname, '../drizzle'),
    });
    console.log('✅ Migrations complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();