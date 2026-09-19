export const Difficulty = {
  Beginner: "Beginner",
  Vertical: "Vertical",
  Rescue: "Rescue",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

/** Self-declared experience. "Verified expert" is a separate, admin-granted role. */
export type SkillLevel = "beginner" | "intermediate" | "vertical" | "rescue";
export type Role = "member" | "expert" | "admin";

export interface Photo {
  readonly src: string;
  readonly alt: string;
}

/** Who wrote something: enough to render a name and a badge. */
export interface Author {
  readonly authorName: string;
  readonly authorLevel: SkillLevel;
  readonly authorRole: Role;
}

export interface Grotto {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly description: string;
  readonly meets: string;
  readonly memberCount: number;
  readonly ratingAverage: number | null;
  readonly ratingCount: number;
  readonly image: Photo;
}

export interface CavingEvent {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly caveName: string;
  readonly region: string | null;
  readonly eventDate: string; // ISO 8601, UTC
  readonly durationHours: number;
  readonly hostedBy: string;
  readonly hostId: string | null;
  readonly difficulty: Difficulty;
  readonly rsvpCount: number; // everyone going, including the viewer if they RSVP'd
  readonly capacity: number;
  readonly reviewCount: number;
  readonly ratingAverage: number | null;
  readonly status: "published" | "cancelled";
  readonly image: Photo;
}

/** A star rating with text, used for expeditions, grottos and gear. */
export interface Review extends Author {
  readonly id: string;
  readonly userId: string;
  readonly rating: number;
  readonly body: string;
  readonly createdAt: string;
}

export interface RecentReview extends Review {
  readonly eventId: string;
  readonly eventTitle: string;
}

export interface Question extends Author {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly tags: readonly string[];
  readonly authorId: string;
  readonly createdAt: string;
  readonly answerCount: number;
  readonly score: number;
  readonly acceptedAnswerId: string | null;
}

export interface Answer extends Author {
  readonly id: string;
  readonly questionId: string;
  readonly authorId: string;
  readonly body: string;
  readonly createdAt: string;
  readonly score: number;
}

export interface ContactMessage {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly createdAt: string;
}

export interface SessionUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly skillLevel: SkillLevel;
  readonly grottoId: string | null;
}

export interface Viewer {
  readonly user: { readonly id: string; readonly name: string } | null;
  readonly rsvpIds: readonly string[];
  readonly hostedIds: readonly string[];
  readonly grottoId: string | null;
  /** "question:<id>" / "answer:<id>" for everything the viewer has marked helpful. */
  readonly voteKeys: readonly string[];
}

export type ActionResult<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };
