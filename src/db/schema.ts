// src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
  unique,
  decimal,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================================
// ENUMS - PASTIKAN SESUAI DENGAN DATABASE
// ============================================================

export const userRoleEnum = pgEnum('user_role_enum', ['admin', 'user', 'super_admin']);
export const genderEnum = pgEnum('gender_enum', ['Pria', 'Wanita']);
export const categoryEnum = pgEnum('category_enum', ['5K', '10K', 'Pelajar']);  // ← Ubah 'Pelajar' menjadi 'pelajar'
export const jerseySizeEnum = pgEnum('jersey_size_enum', ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL']);
export const paymentMethodEnum = pgEnum('payment_method_enum', ['bank_transfer', 'qris', 'cash', 'e_wallet']);
export const paymentStatusEnum = pgEnum('payment_status_enum', ['pending', 'paid', 'failed', 'refunded', 'expired']);
export const participantStatusEnum = pgEnum('participant_status_enum', ['registered', 'confirmed', 'checked_in', 'finished', 'cancelled', 'dnf']);
export const articleStatusEnum = pgEnum('article_status_enum', ['draft', 'published', 'archived']);

// ============================================================
// TABLE: users
// ============================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').default('user'),
  phone: text('phone'),
  birthDate: text('birth_date'),
  gender: genderEnum('gender'),
  address: text('address'),
  institution: text('institution'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  isActiveIdx: index('users_is_active_idx').on(table.isActive),
  roleIdx: index('users_role_idx').on(table.role),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ============================================================
// TABLE: participants
// ============================================================

// src/db/schema.ts - Pastikan field participants lengkap

export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  gender: genderEnum('gender'),
  birthDate: text('birth_date'),
  category: categoryEnum('category').notNull(),
  jerseySize: jerseySizeEnum('jersey_size'),
  institution: text('institution'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  paymentMethod: paymentMethodEnum('payment_method'),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  paymentProof: text('payment_proof'),
  paymentAmount: integer('payment_amount'),
  paymentDate: timestamp('payment_date'),
  bibNumber: integer('bib_number').unique(),
  status: participantStatusEnum('status').default('registered'),
  checkInTime: timestamp('check_in_time'),
  finishTime: text('finish_time'),
  ranking: integer('ranking'),
  categoryRank: integer('category_rank'),
  note: text('note'),
  registerDate: timestamp('register_date').default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index('participants_user_id_idx').on(table.userId),
  emailIdx: index('participants_email_idx').on(table.email),
  categoryIdx: index('participants_category_idx').on(table.category),
  statusIdx: index('participants_status_idx').on(table.status),
  bibNumberIdx: index('participants_bib_number_idx').on(table.bibNumber),
  registerDateIdx: index('participants_register_date_idx').on(table.registerDate),
}));

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;

// ============================================================
// TABLE: payments
// ============================================================

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  participantId: integer('participant_id').references(() => participants.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum('method'),
  status: paymentStatusEnum('status').default('pending'),
  proofImage: text('proof_image'),
  note: text('note'),
  paidAt: timestamp('paid_at'),
  expiredAt: timestamp('expired_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  participantIdIdx: index('payments_participant_id_idx').on(table.participantId),
  invoiceNumberIdx: index('payments_invoice_number_idx').on(table.invoiceNumber),
  statusIdx: index('payments_status_idx').on(table.status),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// ============================================================
// TABLE: races
// ============================================================

export const races = pgTable('races', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: categoryEnum('category').notNull(),
  description: text('description'),
  distance: text('distance'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  registrationFee: integer('registration_fee').notNull().default(0),
  maxParticipants: integer('max_participants').default(0),
  currentParticipants: integer('current_participants').default(0),
  isActive: boolean('is_active').default(true),
  startLocation: text('start_location'),
  route: jsonb('route'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  categoryIdx: index('races_category_idx').on(table.category),
  isActiveIdx: index('races_is_active_idx').on(table.isActive),
}));

export type Race = typeof races.$inferSelect;
export type NewRace = typeof races.$inferInsert;

// ============================================================
// TABLE: articles
// ============================================================

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: text('author_name'),
  featuredImage: text('featured_image'),
  status: articleStatusEnum('status').default('draft'),
  viewCount: integer('view_count').default(0),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  slugIdx: index('articles_slug_idx').on(table.slug),
  statusIdx: index('articles_status_idx').on(table.status),
  publishedAtIdx: index('articles_published_at_idx').on(table.publishedAt),
}));

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

// ============================================================
// TABLE: galleries
// ============================================================

export const galleries = pgTable('galleries', {
  id: serial('id').primaryKey(),
  title: text('title'),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  isFeatured: boolean('is_featured').default(false),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  isFeaturedIdx: index('galleries_is_featured_idx').on(table.isFeatured),
}));

export type Gallery = typeof galleries.$inferSelect;
export type NewGallery = typeof galleries.$inferInsert;

// ============================================================
// TABLE: certificates
// ============================================================

export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  participantId: integer('participant_id').references(() => participants.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  certificateNumber: text('certificate_number').notNull().unique(),
  template: text('template').default('default'),
  data: jsonb('data'),
  fileUrl: text('file_url'),
  status: text('status').default('draft'),  // ← HARUS ADA!
  issuedAt: timestamp('issued_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  participantIdIdx: index('certificates_participant_id_idx').on(table.participantId),
  certificateNumberIdx: index('certificates_certificate_number_idx').on(table.certificateNumber),
  statusIdx: index('certificates_status_idx').on(table.status), // ← TAMBAHKAN
}));

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

// ============================================================
// TABLE: settings
// ============================================================

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value'),
  groupName: text('group_name').default('general'),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  keyIdx: index('settings_key_idx').on(table.key),
  groupNameIdx: index('settings_group_name_idx').on(table.groupName),
}));

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
// ============================================================
// TABLE: password_resets
// ============================================================

export const passwordResets = pgTable('password_resets', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  emailIdx: index('password_resets_email_idx').on(table.email),
  tokenIdx: index('password_resets_token_idx').on(table.token),
}));

export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;


// ============================================================
// TABLE: about_content
// ============================================================

export const aboutContent = pgTable('about_content', {
  id: serial('id').primaryKey(),
  section: text('section').notNull(),
  key: text('key').notNull(),
  value: text('value'),
  imageUrl: text('image_url'),
  order: integer('order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  sectionIdx: index('about_content_section_idx').on(table.section),
  keyIdx: index('about_content_key_idx').on(table.key),
  uniqueSectionKey: unique('about_content_section_key_unique').on(table.section, table.key),
}));

export type AboutContent = typeof aboutContent.$inferSelect;
export type NewAboutContent = typeof aboutContent.$inferInsert;
