// ===== Participant Types =====
export interface Participant {
  id: number;
  nama: string;
  email: string;
  phone: string;
  kota: string;
  kategori: '5K' | '10K' | 'Pelajar';
  jersey: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  nomor: string;
  tgl_lahir: string;
  jenis_kelamin: 'Pria' | 'Wanita';
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface CreateParticipantInput {
  nama: string;
  email: string;
  phone: string;
  kota: string;
  kategori: '5K' | '10K' | 'Pelajar';
  jersey: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  tgl_lahir: string;
  jenis_kelamin: 'Pria' | 'Wanita';
}

// ===== Order Types =====
export interface Order {
  id: number;
  order_id: string;
  participant_id: number;
  total: number;
  payment_method: 'transfer' | 'qris' | 'cash';
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface CreateOrderInput {
  participant_id: number;
  total: number;
  payment_method: 'transfer' | 'qris' | 'cash';
}

// ===== Sponsor Types =====
export interface Sponsor {
  id: number;
  name: string;
  logo: string;
  url?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  createdAt: string;
}

// ===== FAQ Types =====
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
}

// ===== Route Types =====
export interface Route {
  id: number;
  name: string;
  distance: string;
  image: string;
  description: string;
  cot: string;
  water_stations: number;
  createdAt: string;
}

// ===== API Response Types =====
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Auth Types =====
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  confirmPassword: string;
}

// ===== Stats Types =====
export interface Stats {
  total: number;
  '5K': number;
  '10K': number;
  pelajar: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

// ===== Form Types =====
export interface RegistrationFormData {
  nama: string;
  email: string;
  phone: string;
  kota: string;
  kategori: string;
  jersey: string;
  tgl_lahir: string;
  jenis_kelamin: string;
  payment_method: string;
  terms: boolean;
}