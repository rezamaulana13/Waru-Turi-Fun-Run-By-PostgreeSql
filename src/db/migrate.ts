// src/db/migrate.ts
import { db, pool } from './index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Starting migration...');

  try {
    // Create enums
    console.log('📝 Creating enums...');
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE user_role_enum AS ENUM ('admin', 'user', 'super_admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE gender_enum AS ENUM ('Pria', 'Wanita');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE category_enum AS ENUM ('5K', '10K', 'Pelajar');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE jersey_size_enum AS ENUM ('S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'qris', 'cash', 'e_wallet');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE participant_status_enum AS ENUM ('registered', 'confirmed', 'checked_in', 'finished', 'cancelled', 'dnf');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE article_status_enum AS ENUM ('draft', 'published', 'archived');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    console.log('📝 Creating users table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        phone TEXT,
        birth_date TEXT,
        gender gender_enum,
        address TEXT,
        institution TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
      CREATE INDEX IF NOT EXISTS users_is_active_idx ON users(is_active);
      CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
    `);

    // Create participants table
    console.log('📝 Creating participants table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        gender gender_enum,
        birth_date TEXT,
        category category_enum NOT NULL,
        jersey_size jersey_size_enum,
        institution TEXT,
        address TEXT,
        emergency_contact TEXT,
        emergency_phone TEXT,
        payment_method payment_method_enum,
        payment_status payment_status_enum DEFAULT 'pending',
        payment_proof TEXT,
        payment_amount INTEGER,
        payment_date TIMESTAMP,
        bib_number INTEGER UNIQUE,
        status participant_status_enum DEFAULT 'registered',
        check_in_time TIMESTAMP,
        finish_time TEXT,
        ranking INTEGER,
        category_rank INTEGER,
        note TEXT,
        register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS participants_user_id_idx ON participants(user_id);
      CREATE INDEX IF NOT EXISTS participants_email_idx ON participants(email);
      CREATE INDEX IF NOT EXISTS participants_category_idx ON participants(category);
      CREATE INDEX IF NOT EXISTS participants_status_idx ON participants(status);
      CREATE INDEX IF NOT EXISTS participants_bib_number_idx ON participants(bib_number);
      CREATE INDEX IF NOT EXISTS participants_register_date_idx ON participants(register_date);
    `);

    // Create payments table
    console.log('📝 Creating payments table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        invoice_number TEXT NOT NULL UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        method payment_method_enum,
        status payment_status_enum DEFAULT 'pending',
        proof_image TEXT,
        note TEXT,
        paid_at TIMESTAMP,
        expired_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS payments_participant_id_idx ON payments(participant_id);
      CREATE INDEX IF NOT EXISTS payments_invoice_number_idx ON payments(invoice_number);
      CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
    `);

    // Create races table
    console.log('📝 Creating races table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS races (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category category_enum NOT NULL,
        description TEXT,
        distance TEXT,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        registration_fee INTEGER NOT NULL DEFAULT 0,
        max_participants INTEGER DEFAULT 0,
        current_participants INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        start_location TEXT,
        route JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS races_category_idx ON races(category);
      CREATE INDEX IF NOT EXISTS races_is_active_idx ON races(is_active);
    `);

    // Create articles table
    console.log('📝 Creating articles table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name TEXT,
        featured_image TEXT,
        status article_status_enum DEFAULT 'draft',
        view_count INTEGER DEFAULT 0,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
      CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);
      CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles(published_at);
    `);

    // Create galleries table
    console.log('📝 Creating galleries table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS galleries (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        thumbnail_url TEXT,
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS galleries_is_featured_idx ON galleries(is_featured);
    `);

    // Create certificates table
    console.log('📝 Creating certificates table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        certificate_number TEXT NOT NULL UNIQUE,
        template TEXT,
        data JSONB,
        file_url TEXT,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS certificates_participant_id_idx ON certificates(participant_id);
      CREATE INDEX IF NOT EXISTS certificates_certificate_number_idx ON certificates(certificate_number);
    `);

    // Create settings table - FIXED: ganti "group" dengan "group_name"
    console.log('📝 Creating settings table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        group_name TEXT DEFAULT 'general',
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS settings_key_idx ON settings(key);
      CREATE INDEX IF NOT EXISTS settings_group_name_idx ON settings(group_name);
    `);

    // Create about_content table
    console.log('📝 Creating about_content table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS about_content (
        id SERIAL PRIMARY KEY,
        section TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        image_url TEXT,
        "order" INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(section, key)
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS about_content_section_idx ON about_content(section);
      CREATE INDEX IF NOT EXISTS about_content_key_idx ON about_content(key);
    `);

    // Create certificates table
    console.log('📝 Creating certificates table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        certificate_number TEXT NOT NULL UNIQUE,
        template TEXT DEFAULT 'default',
        data JSONB,
        file_url TEXT,
        status TEXT DEFAULT 'draft',
        issued_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS certificates_participant_id_idx ON certificates(participant_id);
      CREATE INDEX IF NOT EXISTS certificates_certificate_number_idx ON certificates(certificate_number);
      CREATE INDEX IF NOT EXISTS certificates_status_idx ON certificates(status);
    `);

    // Create password_resets table
    console.log('📝 Creating password_resets table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS password_resets_email_idx ON password_resets(email);
      CREATE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets(token);
    `);

    console.log('✅ Migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();