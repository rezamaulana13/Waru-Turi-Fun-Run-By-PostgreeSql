# 🏃 Waru Turi Fun Run 2027

[![Astro](https://img.shields.io/badge/Astro-4.0-FF5D01?style=flat&logo=astro)](https://astro.build/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0-003B57?style=flat&logo=sqlite)](https://sqlite.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.29-6A5ACD?style=flat&logo=drizzle)](https://orm.drizzle.team/)

Website resmi Waru Turi Fun Run 2027 - Event lomba lari di Bendung Waru Turi, Kediri.

## ✨ Features

- 📝 **Registration System** - Pendaftaran peserta dengan database
- 📊 **Participant List** - Live data peserta dengan search & filter
- 💳 **Payment Integration** - Transfer, QRIS, Cash
- 🗺️ **Route Maps** - Peta rute 5K & 10K
- 📱 **Responsive Design** - Mobile-first dengan Tailwind
- 🌙 **Dark Mode** - Auto & manual toggle
- 🗄️ **Database** - SQLite dengan Drizzle ORM
- 🔐 **Admin Panel** - Manage participants, orders, sponsors

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/waruturi-2027.git
cd waruturi-2027

# Install dependencies
npm install

# Setup database
npm run db:push
npm run seed

# Run development server
npm run dev

# Open database GUI
npm run db:studio