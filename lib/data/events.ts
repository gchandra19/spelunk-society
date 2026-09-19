import type { Difficulty, Photo } from "@/types/domain";

export const PHOTOS = {
  squeeze: { src: "/images/hero-squeeze.jpg", alt: "A caver in a red helmet squeezing through a narrow, mineral-coated passage" },
  passage: { src: "/images/beginner-passage.jpg", alt: "A caver in a yellow helmet crawling through a low cave passage" },
  rescue: { src: "/images/rescue-jewel.jpg", alt: "Two rescue team members in helmets and respirators checking gas monitors underground" },
  rope: { src: "/images/vertical-rope.jpg", alt: "A caver descending a single rope through a dark shaft, lit by their headlamp" },
  group: { src: "/images/grotto-members.jpg", alt: "Eight grotto members in caving gear posing at a lava-rock cave entrance" },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;
export const PHOTO_KEYS = Object.keys(PHOTOS) as [PhotoKey, ...PhotoKey[]];

export interface SeedEvent {
  id: string;
  title: string;
  description: string;
  caveName: string;
  eventDate: string;
  durationHours: number;
  hostedBy: string; // grotto name
  difficulty: Difficulty;
  capacity: number;
  photo: PhotoKey;
}

/** Starter calendar inserted by `npm run db:seed`. Live data is read from the database. */
export const SEED_EVENTS: SeedEvent[] = [
  { id: "evt-1", title: "Vertical Progression Workshop", description: "Multi-pitch rope practice and changeovers.", caveName: "Mammoth Dome", eventDate: "2026-10-15T09:00:00Z", durationHours: 6, hostedBy: "Central Grotto", difficulty: "Vertical", capacity: 16, photo: "rope" },
  { id: "evt-2", title: "Intro to Wild Caving", description: "Horizontal tracking for beginners.", caveName: "Crystal Passage", eventDate: "2026-10-22T10:00:00Z", durationHours: 4, hostedBy: "Central Grotto", difficulty: "Beginner", capacity: 30, photo: "passage" },
  { id: "evt-3", title: "Mock SRT Rescue Evacuation", description: "Joint training with regional wilderness rescue teams.", caveName: "Titan Pit", eventDate: "2026-11-05T07:00:00Z", durationHours: 8, hostedBy: "Cave Rescue Group", difficulty: "Rescue", capacity: 12, photo: "rescue" },
  { id: "evt-4", title: "Survey & Mapping Night", description: "Learn compass-and-clinometer survey while adding new passage to the club map.", caveName: "Crystal Passage", eventDate: "2026-11-12T18:00:00Z", durationHours: 5, hostedBy: "Central Grotto", difficulty: "Beginner", capacity: 10, photo: "squeeze" },
  { id: "evt-5", title: "Rigging Clinic: Anchors & Deviations", description: "Build safe rope systems from bolts, naturals and rebelays before you need them.", caveName: "Mammoth Dome", eventDate: "2026-11-19T08:30:00Z", durationHours: 6, hostedBy: "Cave Rescue Group", difficulty: "Vertical", capacity: 12, photo: "rope" },
  { id: "evt-6", title: "Entrance Cleanup & Conservation Day", description: "Trash haul, trail repair and a short guided walk. Open to anyone with sturdy boots.", caveName: "Lava Tube Entrance", eventDate: "2026-12-03T10:00:00Z", durationHours: 4, hostedBy: "Central Grotto", difficulty: "Beginner", capacity: 40, photo: "group" },
];
