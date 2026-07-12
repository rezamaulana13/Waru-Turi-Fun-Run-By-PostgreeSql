// ===== Validation Functions =====

export const validateName = (name: string): string | null => {
  if (!name || name.trim().length < 2) {
    return 'Nama minimal 2 karakter';
  }
  if (name.trim().length > 100) {
    return 'Nama maksimal 100 karakter';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email wajib diisi';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email tidak valid';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Nomor WhatsApp wajib diisi';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return 'Nomor WhatsApp harus 10-15 digit';
  }
  return null;
};

export const validateKota = (kota: string): string | null => {
  if (!kota || kota.trim().length < 2) {
    return 'Kota asal wajib diisi';
  }
  return null;
};

export const validateTanggalLahir = (tgl: string): string | null => {
  if (!tgl) return 'Tanggal lahir wajib diisi';
  const date = new Date(tgl);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  if (age < 5 || age > 100) {
    return 'Usia harus antara 5-100 tahun';
  }
  return null;
};

export const validateKategori = (kategori: string): string | null => {
  if (!kategori) return 'Kategori wajib dipilih';
  const valid = ['5K', '10K', 'Pelajar'];
  if (!valid.includes(kategori)) {
    return 'Kategori tidak valid';
  }
  return null;
};

export const validateJersey = (jersey: string): string | null => {
  if (!jersey) return 'Ukuran jersey wajib dipilih';
  const valid = ['S', 'M', 'L', 'XL', 'XXL'];
  if (!valid.includes(jersey)) {
    return 'Ukuran jersey tidak valid';
  }
  return null;
};

export const validatePaymentMethod = (method: string): string | null => {
  if (!method) return 'Metode pembayaran wajib dipilih';
  const valid = ['transfer', 'qris', 'cash'];
  if (!valid.includes(method)) {
    return 'Metode pembayaran tidak valid';
  }
  return null;
};

export const validateTerms = (terms: boolean): string | null => {
  if (!terms) return 'Anda harus menyetujui syarat & ketentuan';
  return null;
};

export const validateRegistrationForm = (data: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const nameError = validateName(data.nama);
  if (nameError) errors.nama = nameError;
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  const kotaError = validateKota(data.kota);
  if (kotaError) errors.kota = kotaError;
  
  const tglError = validateTanggalLahir(data.tgl_lahir);
  if (tglError) errors.tgl_lahir = tglError;
  
  const kategoriError = validateKategori(data.kategori);
  if (kategoriError) errors.kategori = kategoriError;
  
  const jerseyError = validateJersey(data.jersey);
  if (jerseyError) errors.jersey = jerseyError;
  
  const paymentError = validatePaymentMethod(data.payment_method);
  if (paymentError) errors.payment_method = paymentError;
  
  const termsError = validateTerms(data.terms);
  if (termsError) errors.terms = termsError;
  
  return errors;
};