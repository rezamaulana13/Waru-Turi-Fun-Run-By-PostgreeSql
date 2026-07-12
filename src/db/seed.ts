// src/db/seed.ts
import { db, pool } from './index.js';
import { users, settings, races } from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // 1. Create admin user
    console.log('📝 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.insert(users).values({
      email: 'admin@waruturi.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'super_admin',
      isActive: true,
    }).onConflictDoNothing();

    console.log('✅ Admin user created (email: admin@waruturi.com, password: admin123)');

    // 2. Clear existing races
    console.log('📝 Clearing existing races...');
    await db.delete(races);
    console.log('   ✅ All races cleared');

    // 3. Create races - PASTIKAN category sesuai enum (case-sensitive!)
    console.log('📝 Creating races...');
    const raceData: typeof races.$inferInsert[] = [
      {
        name: 'Fun Run 5K',
        category: '5K',  // ← Sesuai enum
        description: 'Kategori 5 kilometer untuk umum',
        distance: '5 km',
        registrationFee: 150000,
        maxParticipants: 500,
        isActive: true,
      },
      {
        name: 'Fun Run 10K',
        category: '10K',  // ← Sesuai enum
        description: 'Kategori 10 kilometer untuk umum',
        distance: '10 km',
        registrationFee: 200000,
        maxParticipants: 300,
        isActive: true,
      },
      {
        name: 'Pelajar 5K',
        category: 'Pelajar',  // ← Huruf besar P! (sesuai enum di database)
        description: 'Khusus pelajar 5 kilometer',
        distance: '5 km',
        registrationFee: 99000,
        maxParticipants: 200,
        isActive: true,
      },
    ];

    for (const race of raceData) {
      try {
        const result = await db.insert(races).values(race).returning();
        console.log(`   ✅ ${race.name} created (ID: ${result[0]?.id})`);
      } catch (error: any) {
        console.error(`   ❌ Error creating ${race.name}:`, error.message);
        console.error('   📝 Category value:', race.category);
      }
    }

    console.log('✅ Races created');

    // 4. Clear existing settings
    console.log('📝 Clearing existing settings...');
    await db.delete(settings);
    console.log('   ✅ All settings cleared');

    // 5. Create settings
    console.log('📝 Creating settings...');
    const settingsData = [
      {
        key: 'site_name',
        value: 'Waru Turi Fun Run 2026',
        groupName: 'general',
        description: 'Nama website',
        isPublic: true,
      },
      {
        key: 'site_description',
        value: 'Event lari tahunan Waru Turi Fun Run 2026',
        groupName: 'general',
        description: 'Deskripsi website',
        isPublic: true,
      },
      {
        key: 'registration_start',
        value: '2026-01-01T00:00:00.000Z',
        groupName: 'event',
        description: 'Tanggal mulai pendaftaran',
        isPublic: true,
      },
      {
        key: 'registration_end',
        value: '2026-06-30T23:59:59.000Z',
        groupName: 'event',
        description: 'Tanggal akhir pendaftaran',
        isPublic: true,
      },
      {
        key: 'event_date',
        value: '2026-07-12T00:00:00.000Z',
        groupName: 'event',
        description: 'Tanggal pelaksanaan event',
        isPublic: true,
      },
    ];

    for (const setting of settingsData) {
      try {
        await db.insert(settings).values(setting).onConflictDoNothing();
        console.log(`   ✅ ${setting.key} created`);
      } catch (error: any) {
        console.error(`   ❌ Error creating ${setting.key}:`, error.message);
      }
    }

    console.log('✅ Settings created');

    // 6. Verifikasi data
    console.log('\n📊 Verifikasi data:');
    const raceCount = await db.select().from(races);
    console.log(`   🏃 Races: ${raceCount.length} rows`);
    for (const r of raceCount) {
      console.log(`      - ${r.name} (${r.category}) - Rp ${r.registrationFee?.toLocaleString()}`);
    }

    const userCount = await db.select().from(users);
    console.log(`   👤 Users: ${userCount.length} rows`);

    const settingCount = await db.select().from(settings);
    console.log(`   ⚙️ Settings: ${settingCount.length} rows`);

    console.log('\n🌱 Seed completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await pool.end();
    process.exit(1);
  }
}

seed();