import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, primaryKey, smallint, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const grottos = pgTable("grottos", {
  id: text("id").primaryKey(), // slug
  name: text("name").notNull().unique(),
  region: text("region").notNull(),
  description: text("description").notNull(),
  meets: text("meets").notNull(),
  imageSrc: text("image_src").notNull(),
  imageAlt: text("image_alt").notNull(),
});

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(), // always stored lowercase
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    grottoId: text("grotto_id").references(() => grottos.id, { onDelete: "set null" }),
    role: text("role", { enum: ["member", "expert", "admin"] }).notNull().default("member"),
    skillLevel: text("skill_level", { enum: ["beginner", "intermediate", "vertical", "rescue"] }).notNull().default("beginner"),
    recoveryCodeHash: text("recovery_code_hash"), // sha256 of a one-time recovery code; the code itself is never stored
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(), // sha256 of the cookie token; the raw token is never stored
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const events = pgTable(
  "events",
  {
    id: id(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    caveName: text("cave_name").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationHours: integer("duration_hours").notNull(),
    difficulty: text("difficulty", { enum: ["Beginner", "Vertical", "Rescue"] }).notNull(),
    capacity: integer("capacity").notNull(),
    imageSrc: text("image_src").notNull(),
    imageAlt: text("image_alt").notNull(),
    region: text("region"), // e.g. "Kentucky, USA"
    status: text("status", { enum: ["published", "cancelled"] }).notNull().default("published"),
    hostId: text("host_id").references(() => users.id, { onDelete: "set null" }),
    grottoId: text("grotto_id").references(() => grottos.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [
    index("events_starts_idx").on(t.startsAt),
    check("events_capacity_ck", sql`${t.capacity} between 1 and 500`),
    check("events_duration_ck", sql`${t.durationHours} between 1 and 72`),
  ],
);

export const rsvps = pgTable(
  "rsvps",
  {
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] }), index("rsvps_user_idx").on(t.userId)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: id(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("reviews_event_user_uq").on(t.eventId, t.userId),
    check("reviews_rating_ck", sql`${t.rating} between 1 and 5`),
  ],
);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
});

export const grottoReviews = pgTable(
  "grotto_reviews",
  {
    id: id(),
    grottoId: text("grotto_id").notNull().references(() => grottos.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("grotto_reviews_grotto_user_uq").on(t.grottoId, t.userId),
    check("grotto_reviews_rating_ck", sql`${t.rating} between 1 and 5`),
  ],
);

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const questions = pgTable(
  "questions",
  {
    id: id(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    acceptedAnswerId: text("accepted_answer_id"),
    createdAt: createdAt(),
  },
  (t) => [index("questions_created_idx").on(t.createdAt)],
);

export const answers = pgTable(
  "answers",
  {
    id: id(),
    questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("answers_question_author_uq").on(t.questionId, t.authorId)],
);

export const helpfulVotes = pgTable(
  "helpful_votes",
  {
    targetType: text("target_type", { enum: ["question", "answer"] }).notNull(),
    targetId: text("target_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.targetType, t.targetId, t.userId] })],
);

export const gearReviews = pgTable(
  "gear_reviews",
  {
    id: id(),
    gearSlug: text("gear_slug").notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("gear_reviews_slug_user_uq").on(t.gearSlug, t.userId),
    check("gear_reviews_rating_ck", sql`${t.rating} between 1 and 5`),
  ],
);
