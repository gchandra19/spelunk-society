CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grotto_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"grotto_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" smallint NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grotto_reviews_rating_ck" CHECK ("grotto_reviews"."rating" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grotto_reviews" ADD CONSTRAINT "grotto_reviews_grotto_id_grottos_id_fk" FOREIGN KEY ("grotto_id") REFERENCES "public"."grottos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grotto_reviews" ADD CONSTRAINT "grotto_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "grotto_reviews_grotto_user_uq" ON "grotto_reviews" USING btree ("grotto_id","user_id");