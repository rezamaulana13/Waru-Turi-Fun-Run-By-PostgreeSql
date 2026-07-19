CREATE TYPE "public"."contact_message_status_enum" AS ENUM('unread', 'read', 'replied');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "contact_message_status_enum" DEFAULT 'unread',
	"admin_reply" text,
	"replied_by" text,
	"replied_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "races" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category_enum";--> statement-breakpoint
CREATE TYPE "public"."category_enum" AS ENUM('5K', '10K', 'pelajar');--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "category" SET DATA TYPE "public"."category_enum" USING "category"::"public"."category_enum";--> statement-breakpoint
ALTER TABLE "races" ALTER COLUMN "category" SET DATA TYPE "public"."category_enum" USING "category"::"public"."category_enum";--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "template" SET DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "issued_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "meta_keywords" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "likes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "status" text DEFAULT 'draft';--> statement-breakpoint
CREATE INDEX "contact_messages_status_idx" ON "contact_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_messages_email_idx" ON "contact_messages" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "certificates_status_idx" ON "certificates" USING btree ("status");