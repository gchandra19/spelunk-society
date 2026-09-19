// Fictional demo content: members at every skill level, worldwide clubs, expeditions, Q&A and gear reviews.
// Everything here is invented for demonstration. Remove it with `npm run db:unseed:demo`.
import type { PhotoKey } from "../lib/data/photos";
import type { Role, SkillLevel } from "../types/domain";

// ---- members -----------------------------------------------------------------------------------
// [name, club id or null, self-declared level, role]. Numbering is 1-based everywhere below.
export const USERS: readonly (readonly [string, string | null, SkillLevel, Role])[] = [
  ["Maya Okafor", "central", "beginner", "member"],
  ["Liam Hendricks", "central", "intermediate", "member"],
  ["Priya Nair", "rescue", "vertical", "member"],
  ["Tomás Herrera", "rescue", "rescue", "member"],
  ["Grace Whitfield", "central", "beginner", "member"],
  ["Jonas Berg", "central", "intermediate", "member"],
  ["Aiko Tanaka", "rescue", "rescue", "member"],
  ["Daniel Reyes", "central", "intermediate", "member"],
  ["Sofia Marchetti", null, "beginner", "member"],
  ["Ethan Brooks", "rescue", "vertical", "member"],
  ["Nadia Petrova", "central", "rescue", "expert"],
  ["Owen Gallagher", null, "beginner", "member"],
  ["Hana Kim", "central", "intermediate", "member"],
  ["Marcus Bell", "rescue", "vertical", "member"],
  ["Callum MacLeod", "highland", "rescue", "expert"],
  ["Marta Kovač", "karst", "rescue", "expert"],
  ["Jack Thompson", "southern-cross", "vertical", "member"],
  ["Camila Reyes-Ortega", "sierra", "intermediate", "member"],
  ["Anders Lindqvist", null, "beginner", "member"],
  ["Zainab Hussain", "highland", "beginner", "member"],
  ["Pieter van Dijk", "karst", "vertical", "member"],
  ["Li Wei", null, "beginner", "member"],
];

// ---- clubs ---------------------------------------------------------------------------------------
export const NEW_CLUBS: readonly { id: string; name: string; region: string; description: string; meets: string; photo: PhotoKey }[] = [
  { id: "highland", name: "Highland Cave Club", region: "Scottish Highlands, UK", description: "A friendly club exploring limestone and marble caves. New members welcome; we lend helmets and lights and run monthly beginner trips.", meets: "Second Thursday of each month, 7:30pm", photo: "passage" },
  { id: "karst", name: "Karst Explorers", region: "Slovenia", description: "Survey-focused club working on the karst plateau. We run mapping weekends, welcome visitors, and teach compass-and-tape survey.", meets: "Last Friday of each month, 6pm", photo: "mammothBroadway" },
  { id: "southern-cross", name: "Southern Cross Cavers", region: "New South Wales, Australia", description: "Vertical caving and conservation club. Regular skills days, careful access agreements with landowners, and a gear library.", meets: "First Wednesday of each month, 7pm", photo: "rope" },
  { id: "sierra", name: "Sierra Espeleo Club", region: "Yucatán, Mexico", description: "Community club combining cave exploration with clean-up and conservation days. Trips are in Spanish and English.", meets: "Third Saturday of each month, 9am", photo: "lavaBeds" },
];

/** Regions for the two original clubs, so the directory reads worldwide. */
export const CLUB_REGIONS: Record<string, string> = { central: "Kentucky, USA", rescue: "USA (national)" };

// ---- expeditions ---------------------------------------------------------------------------------
export interface DemoEvent {
  id: string; title: string; description: string; cave: string; region: string; date: string; hours: number;
  difficulty: "Beginner" | "Vertical" | "Rescue"; capacity: number; club: string; host: number; photo: PhotoKey;
  /** users who attended / are going, besides the host; reviewers are added automatically */
  going: number[];
}

/** Upcoming expeditions at clubs around the world. */
export const UPCOMING: readonly DemoEvent[] = [
  { id: "demo-up1", title: "Introduction to Wild Caving", description: "A relaxed first trip into a limestone cave: how to move, how to keep warm, and how to look after the cave. All kit provided.", cave: "Assynt limestone caves", region: "Scottish Highlands, UK", date: "2026-10-10T09:30:00Z", hours: 4, difficulty: "Beginner", capacity: 14, club: "highland", host: 15, photo: "passage", going: [20, 19, 22, 1] },
  { id: "demo-up2", title: "Cave Survey Weekend", description: "Learn compass, clinometer and tape survey and help extend the club map on the karst plateau.", cave: "Karst plateau caves", region: "Slovenia", date: "2026-10-24T08:00:00Z", hours: 8, difficulty: "Beginner", capacity: 12, club: "karst", host: 16, photo: "mammothBroadway", going: [21, 13, 6] },
  { id: "demo-up3", title: "Vertical Skills Day", description: "Rope skills on a rigged practice site: descending, ascending, changeovers and rebelays, in small groups with every rig checked.", cave: "Limestone ranges", region: "New South Wales, Australia", date: "2026-11-14T22:00:00Z", hours: 7, difficulty: "Vertical", capacity: 8, club: "southern-cross", host: 17, photo: "rope", going: [3, 10, 14] },
  { id: "demo-up4", title: "Cave and Cenote Clean-up Day", description: "Help remove litter from cave entrances and learn how visitors can protect fragile formations. Everyone welcome.", cave: "Cave entrances near the coast", region: "Yucatán, Mexico", date: "2026-11-28T15:00:00Z", hours: 4, difficulty: "Beginner", capacity: 30, club: "sierra", host: 18, photo: "lavaBeds", going: [12, 9, 1] },
];

/** RSVPs for the starter calendar (ids evt-1 to evt-6 from `npm run db:seed`). */
export const STARTER_GOING: Record<string, number[]> = {
  "evt-1": [3, 10, 14, 17], "evt-2": [1, 5, 9, 12, 19, 20, 22], "evt-3": [4, 7, 11, 15], "evt-4": [2, 6, 8, 13],
  "evt-5": [3, 10, 21], "evt-6": [1, 2, 5, 6, 8, 9, 11, 12, 13, 18],
};
export const STARTER_REGION = "Kentucky, USA";

// ---- Q&A -----------------------------------------------------------------------------------------
export interface DemoAnswer { by: number; body: string; votes: number[] }
export interface DemoQuestion {
  by: number; title: string; body: string; tags: string[]; daysAgo: number; votes: number[];
  /** index into answers of the answer the asker accepted */
  accepted?: number; answers: DemoAnswer[];
}

export const QUESTIONS: readonly DemoQuestion[] = [
  {
    by: 1, daysAgo: 30, title: "What should I actually buy before my first caving trip?", tags: ["gear", "beginner", "first-trip"], votes: [2, 5, 9, 12, 19, 20],
    body: "I've signed up for a beginner trip with a club next month and I'm not sure what I need. The gear shops are overwhelming. What's genuinely necessary, and what can wait?",
    accepted: 0,
    answers: [
      { by: 15, votes: [1, 2, 5, 9, 12, 19], body: "Very little. Most clubs lend helmets and lights for a first trip, so ask the trip leader for their kit list.\n\nWear warm layers that keep insulating when wet (wool or synthetic, no cotton), old clothes you can ruin, sturdy boots with good grip, and old gloves. Bring water, a snack and a dry set of clothes for afterwards.\n\nIf you carry on, buy in this order: boots, gloves, then your own helmet and light once you've borrowed a few. Rope gear can wait until you've been trained by an instructor." },
      { by: 2, votes: [1, 5], body: "Agree. I'd add knee pads early, they make crawling far more pleasant." },
      { by: 5, votes: [1], body: "I bought a headlamp too early and it wasn't right for caving. Wait until you've tried a few borrowed ones." },
    ],
  },
  {
    by: 12, daysAgo: 27, title: "Can I use a cycling helmet for caving?", tags: ["gear", "helmet", "safety"], votes: [1, 9, 19, 22],
    body: "I already own a good cycling helmet and would like to avoid buying another one. Is it okay underground?",
    accepted: 0,
    answers: [
      { by: 16, votes: [12, 1, 9, 19], body: "I'd avoid it. Cycling helmets are designed for one impact at speed on flat ground, not repeated knocks against rock, and many don't have a secure mount for a light or a chin strap that stays put.\n\nUse a helmet designed for climbing or caving (look for a mountaineering standard such as EN 12492) with a proper retention system. Most clubs will lend you one for your first trips." },
      { by: 4, votes: [12], body: "Also check the chin strap. A helmet that comes off when you slip is worse than none." },
    ],
  },
  {
    by: 19, daysAgo: 24, title: "How many lights should I carry, and how bright?", tags: ["gear", "lights", "safety"], votes: [1, 12, 20, 22],
    body: "I keep reading that you should carry several lights. Is that really necessary, and does brighter always mean better?",
    accepted: 0,
    answers: [
      { by: 11, votes: [19, 1, 12, 20], body: "Yes, carry three independent light sources so one failure never leaves you in the dark. Independent means they don't share batteries.\n\nBrightness matters less than reliability and battery life at the output you actually use. A wide, even beam is more useful in a passage than a tight spot. Keep spare batteries in a waterproof pot." },
      { by: 7, votes: [19], body: "Test them all before the trip, and again at the entrance." },
    ],
  },
  {
    by: 10, daysAgo: 22, title: "Choosing a descender for 10 mm rope: what should I consider?", tags: ["srt", "gear", "descender"], votes: [3, 14, 17, 21],
    body: "I'm moving from top-rope climbing devices to vertical caving. My club uses 10 mm rope. What should I think about when choosing a descender?",
    accepted: 0,
    answers: [
      { by: 15, votes: [10, 3, 14, 17], body: "Match the device to your rope diameter and to what your club teaches, since everyone in the team should be able to help each other.\n\nWhichever you choose, practise locking off and changing over close to the ground first, and get hands-on instruction. Buy new from a reputable maker and follow the manufacturer's instructions." },
      { by: 14, votes: [10], body: "Ask what the more experienced members use and try theirs. Just don't skip the instruction." },
    ],
  },
  {
    by: 3, daysAgo: 20, title: "How often should I retire a caving rope?", tags: ["srt", "rope", "maintenance"], votes: [10, 14, 17, 21],
    body: "We've had the same rope for a few seasons. There's no fixed date on it. How do people decide when it's time to replace it?",
    accepted: 0,
    answers: [
      { by: 16, votes: [3, 10, 14, 17, 21], body: "Follow the manufacturer's guidance, and keep a rope log: date bought, trips, any shock loads, and exposure to chemicals.\n\nRetire it after a severe shock load, visible core damage, stiff or flat spots, contamination, or when its history is unknown. If in doubt, retire it. Never buy a secondhand rope with unknown history." },
      { by: 17, votes: [3], body: "Wash it gently in cool water, dry it away from heat and sunlight, and store it loosely. Check it by feel along its whole length before each trip." },
    ],
  },
  {
    by: 5, daysAgo: 18, title: "I get really cold underground. How do I stay warm?", tags: ["clothing", "hypothermia", "beginner"], votes: [1, 9, 12, 20],
    body: "Twenty minutes in, my hands and feet are numb and I can't concentrate. What are people wearing?",
    accepted: 0,
    answers: [
      { by: 11, votes: [5, 1, 9, 12, 20], body: "Wet plus cold is the problem, so dress for it: a wool or synthetic base layer and mid layer, a tough oversuit, a warm hat under the helmet, and gloves. Avoid cotton.\n\nEat regularly, keep moving, avoid long stops, and carry a foil bag. If someone is shivering uncontrollably, confused or clumsy, treat it as an emergency and start heading out." },
      { by: 13, votes: [5], body: "A hot drink in a flask for the exit is wonderful." },
    ],
  },
  {
    by: 18, daysAgo: 16, title: "How do I check flood risk before a trip?", tags: ["safety", "flooding", "planning"], votes: [2, 6, 15, 21],
    body: "Our local cave is fine most of the time, but I'm nervous about rain. What should we check before going in?",
    accepted: 0,
    answers: [
      { by: 15, votes: [18, 2, 6, 21], body: "Check the forecast for the whole catchment, not just the entrance, and look at rain in the previous days too. Ask your club how this particular cave responds to rain: some flood hours after rain that fell far away.\n\nAgree a turn-around plan, never go in if in doubt, and leave your plan and expected return time with someone reliable." },
      { by: 21, votes: [18], body: "Local knowledge is gold. Talk to people who've been caving there for years." },
    ],
  },
  {
    by: 9, daysAgo: 14, title: "Is it normal to be scared of tight squeezes?", tags: ["beginner", "squeezes", "mental"], votes: [1, 12, 19, 20, 22],
    body: "I froze on a small crawl last weekend and had to turn back. Does it get easier?",
    accepted: 1,
    answers: [
      { by: 1, votes: [9, 12], body: "Completely normal. It got easier for me with practice on easy passages." },
      { by: 16, votes: [9, 1, 12, 19, 20, 22], body: "Yes. Go with an experienced, patient group, never force a squeeze, and breathe out to slim your chest. Turning back is always a valid decision.\n\nMany clubs run squeeze-practice sessions on a training tube above ground. It builds confidence in a low-stakes way." },
      { by: 8, votes: [9], body: "Slow, calm breathing helped me more than anything." },
    ],
  },
  {
    by: 22, daysAgo: 12, title: "What do Beginner, Vertical and Rescue mean on expeditions?", tags: ["beginner", "skills"], votes: [1, 9, 19],
    body: "The events use these three labels. What experience do I need for each?",
    accepted: 0,
    answers: [
      { by: 4, votes: [22, 1, 9, 19], body: "Beginner: walking and crawling passage, no experience or technical gear needed. Vertical: rope work on pits and drops, so you should be trained and comfortable with a harness and basic rope skills. Rescue: team drills, and vertical competence is expected." },
      { by: 2, votes: [22], body: "If in doubt, ask the trip leader. They'd much rather you ask." },
    ],
  },
  {
    by: 13, daysAgo: 10, title: "Bats and white-nose syndrome: what should I do about my gear?", tags: ["conservation", "bats", "gear"], votes: [11, 16, 20, 21],
    body: "I travel between regions to cave. Do I need to worry about spreading anything on my boots and suit?",
    accepted: 0,
    answers: [
      { by: 16, votes: [13, 11, 20, 21], body: "Yes, take it seriously. Clean and decontaminate gear between caves, especially when travelling between regions, and follow the guidance from your local wildlife or caving authority.\n\nNever take gear from an affected area into an unaffected one without decontamination, avoid disturbing hibernating bats, and stay on marked routes." },
      { by: 11, votes: [13], body: "Keep a dedicated set of gear for caves that bats use, and wash it after each trip." },
    ],
  },
  {
    by: 6, daysAgo: 9, title: "Paper or digital for cave survey?", tags: ["survey", "mapping", "tools"], votes: [8, 11, 13],
    body: "Our club is debating whether to move survey notes onto tablets. What's worked for other groups?",
    accepted: 0,
    answers: [
      { by: 8, votes: [6, 11, 13], body: "Paper. It survives water and cold and never runs out of battery. We transcribe it the same evening." },
      { by: 11, votes: [6, 8], body: "Whichever you choose, record at the station and back it up the same day. Consistent protocol matters more than the tool." },
    ],
  },
  {
    by: 14, daysAgo: 7, title: "Rebelay vs deviation: when do I use which?", tags: ["srt", "rigging"], votes: [3, 10, 17],
    body: "I'm confused about when to rig a rebelay and when a deviation is enough. Is there a simple rule?",
    accepted: 0,
    answers: [
      { by: 3, votes: [14, 10], body: "A deviation redirects the rope a little to keep it off the rock. A rebelay is a new anchor point that breaks the rope into shorter, separate hangs. It takes a lot of practice to choose well." },
      { by: 15, votes: [14, 3, 10, 17], body: "This really needs to be seen, not read. Get taught on a practice site by an instructor, and have your rigging checked by someone experienced before you rely on it." },
    ],
  },
  {
    by: 20, daysAgo: 5, title: "Is caving safe if I'm not very fit?", tags: ["beginner", "fitness"], votes: [1, 9, 12, 19],
    body: "I'm keen but I don't do much exercise. Will I hold everyone back?",
    accepted: 1,
    answers: [
      { by: 1, votes: [20], body: "I wasn't fit either. Pick an easy trip and tell the leader." },
      { by: 16, votes: [20, 1, 9, 12, 19], body: "Choose a beginner trip and be honest with the leader about your fitness. Good leaders plan around the slowest person, take breaks, and can turn back. Fitness builds quickly, and technique matters more than strength." },
      { by: 2, votes: [20], body: "Take snacks and water. Most people run out of energy before they run out of strength." },
    ],
  },
  {
    by: 21, daysAgo: 3, title: "Group size and call-out plans: what's a good standard?", tags: ["safety", "planning", "rescue"], votes: [4, 7, 15, 17],
    body: "We've been a bit casual about telling people where we're going. What should a proper call-out plan include?",
    accepted: 2,
    answers: [
      { by: 7, votes: [21, 4], body: "Keep groups small enough to stay together and communicate, and make sure everyone knows the plan." },
      { by: 4, votes: [21, 7], body: "Leave the plan with someone who will actually raise the alarm and knows who to call." },
      { by: 15, votes: [21, 4, 7, 17], body: "Include the cave name and entrance location, the number of people and their names, your gear and vehicles, your expected exit time, and when to call for help. Agree a check-in after you exit, and cancel the alert once everyone is out." },
    ],
  },
];

// ---- gear reviews --------------------------------------------------------------------------------
// [gear slug, user, rating, text]
export const GEAR_REVIEWS: readonly [string, number, number, string][] = [
  ["helmet", 2, 5, "Comfortable, and the chin strap stays put through squeezes and slips."],
  ["helmet", 8, 4, "Solid and easy to adjust. Wish it were a bit lighter on long trips."],
  ["helmet", 1, 4, "Good fit over a warm hat. The light mount works well."],
  ["headlamp", 6, 5, "Rugged and the battery lasts the whole day. Flood beam is great for passages."],
  ["headlamp", 12, 3, "Bright, but the switch is fiddly with wet gloves."],
  ["headlamp", 3, 4, "Reliable. I always carry spare batteries in a waterproof pot."],
  ["headlamp", 18, 5, "Very happy. Wide beam and a lock stops it turning on in my bag."],
  ["backup-lights", 10, 5, "Two cheap waterproof lights saved a trip when my main lamp failed."],
  ["cave-suit", 1, 4, "Tougher than it looks, though it gets warm on long crawls."],
  ["cave-suit", 5, 3, "Survived a rough season but the zip is stiff. Fine for a first suit."],
  ["base-layers", 9, 5, "Merino stays warm even when soaked. Worth every penny."],
  ["base-layers", 13, 4, "Synthetic dries faster; wool feels nicer. Either beats cotton."],
  ["base-layers", 19, 5, "Made the difference between miserable and comfortable."],
  ["boots", 14, 4, "Great grip on wet rock. Sole wears down faster than I expected."],
  ["boots", 17, 5, "Rubber boots are perfect for our muddy caves."],
  ["gloves", 20, 3, "Cheap and cheerful. They wear out quickly, so buy a few pairs."],
  ["knee-pads", 1, 5, "I wouldn't crawl without them. Straps stay put."],
  ["knee-pads", 12, 4, "Comfortable, but they snag in the tightest squeezes."],
  ["harness", 3, 5, "Comfortable to hang in, and fitting with an instructor was worth it."],
  ["harness", 10, 4, "Durable. Adjustment takes a little practice."],
  ["harness", 21, 5, "Bought new and fitted in a shop. Would do it the same way again."],
  ["descender", 10, 4, "Smooth control once I'd practised. Learn it on the ground first."],
  ["descender", 14, 5, "Reliable and simple. My instructor recommended it."],
  ["ascenders", 17, 4, "Bite the rope securely and release smoothly. Handles are comfortable in gloves."],
  ["rope", 16, 5, "Handles well and holds up. Keep a rope log and retire it on time."],
  ["rope", 15, 5, "Buy from a reputable supplier, and inspect the whole length before each trip."],
  ["connectors", 21, 4, "Locking gates close easily with gloves. Inspect before every trip."],
  ["pack", 2, 4, "Tough and drains well. Very plain, which is exactly right."],
  ["pack", 8, 5, "A cheap heavy-duty bag beat my expensive hiking pack in a week."],
  ["emergency-kit", 11, 5, "The foil bag and whistle live in my pack permanently. Cheap insurance."],
  ["emergency-kit", 7, 5, "Add a first-aid course. Kit only helps if you know how to use it."],
  ["survey-kit", 6, 5, "Simple tools and good habits. Write it down at the station."],
  ["survey-kit", 13, 4, "Waterproof paper is a game-changer."],
];

// ---- club ratings for the new clubs (the original two are in seed-demo.ts) ---------------------
export const NEW_CLUB_RATINGS: readonly [string, number, number, string][] = [
  ["highland", 15, 5, "A warm, well-organised club with excellent trip leaders."],
  ["highland", 20, 4, "Very welcoming to a complete beginner. Lends kit for first trips."],
  ["karst", 16, 5, "Thoughtful survey work and a great community."],
  ["karst", 21, 4, "Rigorous about safety and conservation. Good instruction."],
  ["southern-cross", 17, 5, "Well-run skills days and great respect for landowners."],
  ["sierra", 18, 4, "Friendly, bilingual and passionate about conservation."],
];
