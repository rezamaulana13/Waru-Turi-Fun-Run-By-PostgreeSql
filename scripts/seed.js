// scripts/seed.js
import pg from 'pg';
import bcrypt from 'bcryptjs';
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

async function seed() {
  console.log('🌱 Seeding database...');
  console.log(`📁 Database: ${process.env.DB_NAME || 'waruturi_db'}`);
  
  try {
    // 1. Create admin user ONLY
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@waruturirun.com', adminPassword, 'Admin Waru Turi', 'admin', true]);
    console.log('✅ Admin created: admin@waruturirun.com');

    // 2. Participants table - KOSONG (belum ada peserta)
    console.log('📋 Participants table: Kosong (belum ada peserta)');
    console.log('   👉 Peserta akan mendaftar melalui halaman register');

    // 3. Sponsors - SAMPLE DATA
    console.log('🏢 Creating sample sponsors...');
    const sponsors = [
      ['Yakult', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoG8puA2xLI3PwyTvhWpVvwOHYeF3nBbBwf6Bg73TwILQVM0KYxW4iDH-zHI59a4alantzKOaYikSwuo2bzEs4S8XSePRrG3lUqBsf55yjIIUgGaxbELgBB5GY1LQ5wFOLMX9ahqXUhAdcvAW3gZLISBATTwmDm8siznhkxVJNs-n83NX3wG6zORzm5yMJ/s4999/LOGO%20YAKULT%20MERAH.png', 'platinum'],
      ['Iso Plus', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixg9Jrx3Nvi2_JHV3CwNtuyiVqag785W3-gqfk8Y5i8yuFaecPlii2YRimVgTHOhns1a_YRXd_3G0K7yigYhmqt1YGvn-L9DzchrDtMK8e95NB_zkRllyB2V0EtFMUKswUUOhclrc5ng6oFJJN3yKJNXPA1cfAdYBmK0EP2lNCQZ_SAVKTQLMLFvkoXHwB/s4735/LOGO%20ISO%20PLUS%20PUTIH.png', 'gold'],
      ['Artugo', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhnx2pRmViqTgLgnGCg3StsSqDgiYBwbgA8yCt9cNzOq7DKNjx-FK2skUyoM03UZQDAwLWxmOHGUstbdEPLVu3tRhO27mNzUD-Q737Aun0qfGAKObLcQO5oZbs2b3u-xMPc9ySz_0Mnmp1KSZf52dHpdeqlSDA5bSlJTwAruNxKMqaaOLqKfA69dzMe0jDj/s4780/LOGO%20ARTUGO%20HITAM.png', 'silver'],
      ['Nav Karaoke', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiAnHHHD0HqwvA0qSEOrSxy6zjAWVmV1kiBnBrOaUxbPDsNnPcuKy2VAmvgl6wOWXyY-AnZT3BegvOB2Keybn8Y8Vsvre3UdgJoSKLPIWPjMvoEy9B2vXGBus8QVYhuzWmU4WPE1LSjmG8QCxiTq8e1xZiCCi7Q7X1YFvQ0qbdikaN7Und628A60W6V0vNf/s6024/LOGO%20NAV%20KARAOKE%20WARNA.png', 'bronze'],
    ];

    for (const s of sponsors) {
      const check = await pool.query('SELECT name FROM sponsors WHERE name = $1', [s[0]]);
      if (check.rows.length === 0) {
        await pool.query(`
          INSERT INTO sponsors (name, logo, tier, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, s);
        console.log(`✅ Sponsor created: ${s[0]}`);
      } else {
        console.log(`⏭️ Sponsor already exists: ${s[0]}`);
      }
    }

    // 4. FAQs - SAMPLE DATA
    console.log('❓ Creating sample FAQs...');
    const faqs = [
      ['Apa itu Waru Turi Fun Run?', 'Waru Turi Fun Run adalah ajang lomba lari kategori 5K dan 10K dengan lintasan jalan raya, jalan pedesaan, dan area persawahan yang dimulai dari Bendung Gerak Waru Turi.', 'umum'],
      ['Siapa saja yang boleh ikut?', 'Acara ini terbuka untuk semua kalangan, baik pemula, pelajar, komunitas lari, keluarga, hingga pelari profesional.', 'umum'],
      ['Di mana lokasi start dan finish?', 'Lokasi start dan finish berada di area utama Bendung Gerak Waru Turi.', 'lokasi'],
      ['Bagaimana cara mendaftar?', 'Pendaftaran dilakukan secara online melalui website resmi lomba serta pendaftaran offline di kantor Jawa Pos Radar Kediri.', 'pendaftaran'],
      ['Fasilitas apa saja yang didapat peserta?', 'Peserta akan mendapatkan jersey run eksklusif, medali finisher, BIB number, snack, e-sertifikat, doorprize, dokumentasi, dan refreshment.', 'fasilitas'],
    ];

    for (const f of faqs) {
      const check = await pool.query('SELECT question FROM faqs WHERE question = $1', [f[0]]);
      if (check.rows.length === 0) {
        await pool.query(`
          INSERT INTO faqs (question, answer, category, is_active, "order", created_at, updated_at)
          VALUES ($1, $2, $3, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, f);
        console.log(`✅ FAQ created: ${f[0]}`);
      } else {
        console.log(`⏭️ FAQ already exists: ${f[0]}`);
      }
    }

    console.log('\n✅ Seeding complete!');
    console.log(`
    📊 Summary:
    - Users: 1 admin (peserta/user kosong)
    - Participants: 0 (belum ada yang mendaftar)
    - Sponsors: 4
    - FAQs: 5
    
    🔑 Login credentials:
    Admin: admin@waruturirun.com / admin123
    
    📝 Catatan:
    - Peserta/user harus mendaftar melalui halaman register
    - Setelah register, mereka bisa login dan mendaftar lomba
    `);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();