export const Difficulty = {
  Beginner: "Beginner",
  Vertical: "Vertical",
  Rescue: "Rescue",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export interface Photo {
  readonly src: string;
  readonly alt: string;
}

export interface Grotto {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly description: string;
  readonly meets: string;
  readonly memberCount: number;
  readonly image: Photo;
}

export interface CavingEvent {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly caveName: string;
  readonly eventDate: string; // ISO 8601, UTC
  readonly durationHours: number;
  readonly hostedBy: string;
  readonly hostId: string | null;
  readonly difficulty: Difficulty;
  readonly rsvpCount: number; // everyone going, including the viewer if they RSVP'd
  readonly capacity: number;
  readonly status: "published" | "cancelled";
  readonly image: Photo;
}

export interface Review {
  readonly id: string;
  readonly eventId: string;
  readonly userId: string;
  readonly authorName: string;
  readonly rating: number;
  readonly body: string;
  readonly createdAt: string;
}

export interface SessionUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: "member" | "admin";
}

export interface Viewer {
  readonly user: Pick<SessionUser, "id" | "name"> | null;
  readonly rsvpIds: readonly string[];
  readonly hostedIds: readonly string[];
}

export type ActionResult<T = object> = ({ success: true } & T) | { success: false; error: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };
