CREATE TABLE "answers" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gear_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"gear_slug" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" smallint NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gear_reviews_rating_ck" CHECK ("gear_reviews"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "helpful_votes" (
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "helpful_votes_target_type_target_id_user_id_pk" PRIMARY KEY("target_type","target_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"author_id" text NOT NULL,
	"accepted_answer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "recovery_code_hash" text;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gear_reviews" ADD CONSTRAINT "gear_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpful_votes" ADD CONSTRAINT "helpful_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "answers_question_author_uq" ON "answers" USING btree ("question_id","author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gear_reviews_slug_user_uq" ON "gear_reviews" USING btree ("gear_slug","user_id");--> statement-breakpoint
CREATE INDEX "questions_created_idx" ON "questions" USING btree ("created_at");