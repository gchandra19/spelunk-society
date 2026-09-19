import type { Photo } from "@/types/domain";

interface Credited extends Photo {
  readonly credit: string;
}

const NPS = "U.S. National Park Service (public domain)";

/** Open-licence photos from Wikimedia Commons, served from /public/images. */
export const PHOTOS = {
  squeeze: { src: "/images/hero-squeeze.jpg", alt: "A caver in a red helmet squeezing through a narrow, mineral-coated passage", credit: NPS },
  passage: { src: "/images/beginner-passage.jpg", alt: "A caver in a yellow helmet crawling through a low cave passage", credit: NPS },
  rescue: { src: "/images/rescue-jewel.jpg", alt: "Two rescue team members in helmets and respirators checking gas monitors underground", credit: "Staff Sgt. Theanne Herrmann, SD National Guard (public domain)" },
  rope: { src: "/images/vertical-rope.jpg", alt: "A caver descending a single rope through a dark shaft, lit by their headlamp", credit: NPS },
  group: { src: "/images/grotto-members.jpg", alt: "Eight grotto members in caving gear posing at a lava-rock cave entrance", credit: "Leitmotiv (CC BY-SA 4.0)" },
  mammothAvenue: { src: "/images/mammoth-cleaveland.jpg", alt: "A wide, lit trail through Cleaveland Avenue in Mammoth Cave, Kentucky", credit: NPS },
  mammothBroadway: { src: "/images/mammoth-broadway.jpg", alt: "The large Broadway passage in Mammoth Cave, Kentucky", credit: NPS },
  carlsbad: { src: "/images/carlsbad-big-room.jpg", alt: "Formations and a stone-walled trail in the Big Room of Carlsbad Cavern, New Mexico", credit: NPS },
  windCave: { src: "/images/wind-cave-boxwork.jpg", alt: "Delicate boxwork calcite fins on the ceiling of Wind Cave, South Dakota", credit: NPS },
  lavaBeds: { src: "/images/lava-beds-merrill.jpg", alt: "Daylight through a collapsed skylight in Merrill Cave, a lava tube in Lava Beds National Monument", credit: NPS },
} as const satisfies Record<string, Credited>;

export type PhotoKey = keyof typeof PHOTOS;
export const PHOTO_KEYS = Object.keys(PHOTOS) as [PhotoKey, ...PhotoKey[]];

/** Distinct credit lines for the site footer. */
export const PHOTO_CREDITS: readonly string[] = [...new Set(Object.values(PHOTOS).map((p) => p.credit))];
