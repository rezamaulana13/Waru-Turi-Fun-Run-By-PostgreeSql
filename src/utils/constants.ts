// ===== APP INFO =====
export const APP_NAME = 'Waru Turi Fun Run 2027';
export const APP_DESCRIPTION = 'Lari Sehat, Lestarikan Alam';
export const APP_URL = 'https://waruturi-2027.com';
export const APP_VERSION = '1.0.0';

// ===== EVENT INFO =====
export const EVENT_DATE = '2027-02-14T05:30:00';
export const EVENT_DATE_FORMATTED = '14 Februari 2027';
export const EVENT_LOCATION = 'Bendung Waru Turi, Kediri';
export const EVENT_ORGANIZER = 'WaruTuri Team';

// ===== CATEGORIES =====
export const CATEGORIES = {
  '5K': { 
    label: '5K Fun Run', 
    price: 99000, 
    maxParticipants: 1000,
    description: 'Rekreasi lari santai',
    icon: '🏃'
  },
  '10K': { 
    label: '10K Challenge', 
    price: 149000, 
    maxParticipants: 500,
    description: 'Untuk pelari berpengalaman',
    icon: '🏃‍♂️'
  },
  'Pelajar': { 
    label: 'Pelajar', 
    price: 59000, 
    maxParticipants: 500,
    description: 'Khusus pelajar',
    icon: '🧑‍🎓'
  }
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

// ===== JERSEY SIZES =====
export const JERSEY_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
export type JerseySize = typeof JERSEY_SIZES[number];

// ===== PAYMENT METHODS =====
export const PAYMENT_METHODS = ['transfer', 'qris', 'cash'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const PAYMENT_METHOD_LABELS = {
  transfer: 'Transfer Bank',
  qris: 'QRIS',
  cash: 'Cash'
} as const;

export const PAYMENT_INSTRUCTIONS = {
  transfer: {
    bank: 'Bank Jatim',
    account: '1234567890',
    name: 'Waru Turi Fun Run'
  },
  qris: {
    image: '/images/qris.png'
  },
  cash: {
    location: 'Kantor Jawa Pos Radar Kediri'
  }
} as const;

// ===== GENDER =====
export const GENDERS = ['Pria', 'Wanita'] as const;
export type Gender = typeof GENDERS[number];

// ===== STATUS =====
export const PARTICIPANT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
} as const;

export const SPONSOR_TIERS = {
  PLATINUM: 'platinum',
  GOLD: 'gold',
  SILVER: 'silver',
  BRONZE: 'bronze'
} as const;

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
  PARTICIPANTS: '/api/participants',
  PARTICIPANTS_STATS: '/api/participants/stats',
  ORDERS: '/api/orders',
  SPONSORS: '/api/sponsors',
  FAQS: '/api/faqs',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  EXPORT_EXCEL: '/api/export/excel'
} as const;

// ===== ROUTES =====
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PARTICIPANTS: '/peserta',
  ROUTE: '/rute',
  REGISTER: '/daftar',
  CONTACT: '/kontak',
  GALLERY: '/gallery',
  SPONSORS: '/sponsor',
  FAQ: '/faq',
  SUCCESS: '/success',
  ADMIN: '/admin',
  ADMIN_PARTICIPANTS: '/admin/participants',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_SPONSORS: '/admin/sponsors',
  ADMIN_FAQ: '/admin/faq',
  LOGIN: '/auth/login',
  REGISTER_PAGE: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password'
} as const;

// ===== SOCIAL MEDIA =====
export const SOCIAL_MEDIA = {
  INSTAGRAM: 'https://instagram.com/waruturirun',
  FACEBOOK: 'https://facebook.com/waruturirun',
  YOUTUBE: 'https://youtube.com/@waruturirun',
  TWITTER: 'https://twitter.com/waruturirun',
  TIKTOK: 'https://tiktok.com/@waruturirun'
} as const;

// ===== CONTACT =====
export const CONTACT = {
  PHONE: '+62 815-5257-733',
  EMAIL: 'official@waruturirun.com',
  ADDRESS: 'Bendung Waru Turi, Kediri, Jawa Timur',
  MAPS_URL: 'https://maps.google.com/maps?q=Bendung+Waru+Turi+Kediri'
} as const;

// ===== FILE UPLOAD =====
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// ===== PAGINATION =====
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const PAGE_SIZES = [10, 25, 50, 100] as const;

// ===== DATE FORMATS =====
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'dddd, DD MMMM YYYY',
  FULL: 'dddd, DD MMMM YYYY HH:mm',
  TIME: 'HH:mm'
} as const;

// ===== VALIDATION =====
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  AGE_MIN: 5,
  AGE_MAX: 100
} as const;

// ===== MESSAGES =====
export const MESSAGES = {
  SUCCESS: {
    REGISTER: 'Pendaftaran berhasil! Silahkan cek email untuk konfirmasi.',
    PAYMENT: 'Pembayaran berhasil dikonfirmasi!',
    UPDATE: 'Data berhasil diupdate!',
    DELETE: 'Data berhasil dihapus!'
  },
  ERROR: {
    REGISTER: 'Pendaftaran gagal, silahkan coba lagi.',
    PAYMENT: 'Pembayaran gagal, silahkan coba lagi.',
    UPDATE: 'Update data gagal, silahkan coba lagi.',
    DELETE: 'Hapus data gagal, silahkan coba lagi.',
    NETWORK: 'Koneksi bermasalah, silahkan cek internet Anda.'
  }
} as const;

// ===== THEME =====
export const THEME = {
  COLORS: {
    primary: '#0088cc',
    secondary: '#001f3f',
    accent: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  },
  GRADIENTS: {
    hero: 'from-primary-500/90 via-secondary-500/90 to-accent-500/90',
    ticket: 'from-primary-500 to-secondary-500',
    text: 'from-primary-500 to-accent-500'
  }
} as const;