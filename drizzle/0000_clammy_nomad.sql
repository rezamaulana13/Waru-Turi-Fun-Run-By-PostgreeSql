CREATE TYPE "public"."article_status_enum" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."category_enum" AS ENUM('5K', '10K', 'Pelajar');--> statement-breakpoint
CREATE TYPE "public"."gender_enum" AS ENUM('Pria', 'Wanita');--> statement-breakpoint
CREATE TYPE "public"."jersey_size_enum" AS ENUM('S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL');--> statement-breakpoint
CREATE TYPE "public"."participant_status_enum" AS ENUM('registered', 'confirmed', 'checked_in', 'finished', 'cancelled', 'dnf');--> statement-breakpoint
CREATE TYPE "public"."payment_method_enum" AS ENUM('bank_transfer', 'qris', 'cash', 'e_wallet');--> statement-breakpoint
CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user', 'super_admin');--> statement-breakpoint
CREATE TABLE "about_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" text NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"image_url" text,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "about_content_section_key_unique" UNIQUE("section","key")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"author_id" integer,
	"author_name" text,
	"featured_image" text,
	"status" "article_status_enum" DEFAULT 'draft',
	"view_count" integer DEFAULT 0,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer,
	"user_id" integer,
	"certificate_number" text NOT NULL,
	"template" text,
	"data" jsonb,
	"file_url" text,
	"issued_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "galleries" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"uploaded_by" integer,
	"is_featured" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"gender" "gender_enum",
	"birth_date" text,
	"category" "category_enum" NOT NULL,
	"jersey_size" "jersey_size_enum",
	"institution" text,
	"address" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"payment_method" "payment_method_enum",
	"payment_status" "payment_status_enum" DEFAULT 'pending',
	"payment_proof" text,
	"payment_amount" integer,
	"payment_date" timestamp,
	"bib_number" integer,
	"status" "participant_status_enum" DEFAULT 'registered',
	"check_in_time" timestamp,
	"finish_time" text,
	"ranking" integer,
	"category_rank" integer,
	"note" text,
	"register_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "participants_bib_number_unique" UNIQUE("bib_number")
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "password_resets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer,
	"user_id" integer,
	"invoice_number" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" "payment_method_enum",
	"status" "payment_status_enum" DEFAULT 'pending',
	"proof_image" text,
	"note" text,
	"paid_at" timestamp,
	"expired_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "payments_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "category_enum" NOT NULL,
	"description" text,
	"distance" text,
	"start_time" timestamp,
	"end_time" timestamp,
	"registration_fee" integer DEFAULT 0 NOT NULL,
	"max_participants" integer DEFAULT 0,
	"current_participants" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"start_location" text,
	"route" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"group_name" text DEFAULT 'general',
	"description" text,
	"is_public" boolean DEFAULT false,
	"updated_by" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'user',
	"phone" text,
	"birth_date" text,
	"gender" "gender_enum",
	"address" text,
	"institution" text,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "about_content_section_idx" ON "about_content" USING btree ("section");--> statement-breakpoint
CREATE INDEX "about_content_key_idx" ON "about_content" USING btree ("key");--> statement-breakpoint
CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "certificates_participant_id_idx" ON "certificates" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "certificates_certificate_number_idx" ON "certificates" USING btree ("certificate_number");--> statement-breakpoint
CREATE INDEX "galleries_is_featured_idx" ON "galleries" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "participants_user_id_idx" ON "participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "participants_email_idx" ON "participants" USING btree ("email");--> statement-breakpoint
CREATE INDEX "participants_category_idx" ON "participants" USING btree ("category");--> statement-breakpoint
CREATE INDEX "participants_status_idx" ON "participants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "participants_bib_number_idx" ON "participants" USING btree ("bib_number");--> statement-breakpoint
CREATE INDEX "participants_register_date_idx" ON "participants" USING btree ("register_date");--> statement-breakpoint
CREATE INDEX "password_resets_email_idx" ON "password_resets" USING btree ("email");--> statement-breakpoint
CREATE INDEX "password_resets_token_idx" ON "password_resets" USING btree ("token");--> statement-breakpoint
CREATE INDEX "payments_participant_id_idx" ON "payments" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "payments_invoice_number_idx" ON "payments" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "races_category_idx" ON "races" USING btree ("category");--> statement-breakpoint
CREATE INDEX "races_is_active_idx" ON "races" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "settings_key_idx" ON "settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "settings_group_name_idx" ON "settings" USING btree ("group_name");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");