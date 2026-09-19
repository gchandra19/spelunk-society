export type GearCategory = "head" | "body" | "hands-feet" | "vertical" | "carry-safety" | "survey";

export const GEAR_CATEGORIES: Record<GearCategory, { label: string; blurb: string }> = {
  head: { label: "Head and light", blurb: "Protect your skull and never be without light." },
  body: { label: "Body and warmth", blurb: "Caves are cold, wet and abrasive. Dress for it." },
  "hands-feet": { label: "Hands and feet", blurb: "Grip, protection and mobility on rough ground." },
  vertical: { label: "Vertical (rope) gear", blurb: "Life-safety equipment. Buy new, learn from an instructor." },
  "carry-safety": { label: "Carrying and emergency", blurb: "Kit for hauling gear and handling an emergency." },
  survey: { label: "Survey and navigation", blurb: "Recording what you find." },
};

export interface GearItem {
  readonly slug: string;
  readonly name: string;
  readonly category: GearCategory;
  readonly summary: string;
  readonly lookFor: readonly string[];
  /** Standards to look for. Always confirm the current standard with the manufacturer. */
  readonly standards?: string;
  readonly avoid: string;
  readonly budget: string;
  /** True for equipment your life depends on: never buy used, never improvise. */
  readonly lifeSafety: boolean;
  /**
   * Set once a qualified caving instructor has checked the guide, for example:
   *   review: { by: "Jane Smith, cave instructor (BCA)", on: "2026-11-02" }
   * Until then the site shows "Awaiting expert review".
   */
  readonly review?: { readonly by: string; readonly on: string };
}

/** Same advice worldwide: buy where local cavers buy. */
export const WHERE_TO_BUY =
  "Specialist caving suppliers (search for caving gear in your country), climbing and mountaineering shops, and industrial rope-access suppliers. Your local club knows the trusted shops and often runs group buys. Check that products carry the marking required in your region (for example CE in Europe or UKCA in the UK).";

export const GEAR: readonly GearItem[] = [
  {
    slug: "helmet", name: "Helmet", category: "head", lifeSafety: true,
    summary: "Protects against falling rock and low ceilings, and carries your lights. Non-negotiable on every trip.",
    lookFor: ["A retention chin strap that cannot slip off", "Good ventilation is less important than impact protection and a secure fit", "Mounts or slots for a headlamp", "Adjustable fit over a warm hat"],
    standards: "Mountaineering or climbing helmet standards such as EN 12492 or UIAA 106.",
    avoid: "Cycling helmets, and any helmet that has taken a heavy impact. Replace it after a serious knock even if it looks fine.",
    budget: "Mid-range helmets are fine. Do not economise on fit.",
  },
  {
    slug: "headlamp", name: "Primary headlamp", category: "head", lifeSafety: true,
    summary: "Your main light, worn on the helmet so both hands stay free.",
    lookFor: ["Rechargeable or easily swapped batteries, with a spare set", "Waterproof rating suitable for mud and drips", "A wide flood beam plus a focused spot", "A lock or safeguard against switching on in your bag"],
    avoid: "Relying on brightness figures alone. Battery life at usable output matters more than the maximum number.",
    budget: "A reliable mid-priced lamp beats an expensive one you don't understand.",
  },
  {
    slug: "backup-lights", name: "Backup lights", category: "head", lifeSafety: true,
    summary: "Cavers carry three independent light sources so a single failure never leaves them in the dark.",
    lookFor: ["Two more lights that do not share batteries with the primary", "One that works when the helmet is lost", "Simple, rugged, waterproof designs", "Spare batteries kept dry"],
    avoid: "Backups that use the same cells as your main lamp.",
    budget: "Inexpensive lights are fine as backups provided they are reliable and waterproof.",
  },
  {
    slug: "cave-suit", name: "Cave suit (oversuit)", category: "body", lifeSafety: false,
    summary: "A tough outer layer that survives abrasion and mud, worn over warm layers.",
    lookFor: ["Hard-wearing fabric, ideally with reinforced knees and seat", "Enough room to bend and squeeze in", "A full-length zip and pockets you can reach", "Cuffs that seal against grit"],
    avoid: "Cotton coveralls that soak up water and chill you.",
    budget: "Cheaper industrial coveralls are a fair start for beginners; upgrade once you know your trips.",
  },
  {
    slug: "base-layers", name: "Base and mid layers", category: "body", lifeSafety: false,
    summary: "Warm insulation that keeps working when wet. Cold is the most common reason trips end badly.",
    lookFor: ["Wool or synthetic fabrics", "Layers you can add or remove", "A warm hat that fits under the helmet", "A dry spare set left at the entrance"],
    avoid: "Cotton, which holds water and pulls heat from your body.",
    budget: "Ordinary outdoor base layers work well. No special caving brand is needed.",
  },
  {
    slug: "boots", name: "Boots", category: "hands-feet", lifeSafety: false,
    summary: "Grip on wet limestone and mud, and ankle support over uneven ground.",
    lookFor: ["Deep, soft-compound sole for wet rock", "Ankle support", "Rubber boots suit wet, muddy caves; leather or synthetic boots suit dry ones", "A snug fit so your foot doesn't slide"],
    avoid: "Smooth-soled shoes and heavy hiking boots you cannot flex.",
    budget: "Good secondhand boots are fine. Prioritise grip and fit.",
  },
  {
    slug: "gloves", name: "Gloves", category: "hands-feet", lifeSafety: false,
    summary: "Protect your hands from cold and sharp rock.",
    lookFor: ["Tough palms with a good grip when wet", "Enough dexterity to work a knot or a buckle", "Cheap pairs you can replace often"],
    avoid: "Very thick gloves when doing rope work, where dexterity matters.",
    budget: "Inexpensive work gloves are standard. Carry a spare pair.",
  },
  {
    slug: "knee-pads", name: "Knee and elbow pads", category: "hands-feet", lifeSafety: false,
    summary: "Crawling is hard on joints. Pads make long passages far more comfortable.",
    lookFor: ["Hard-wearing shells that don't slip", "Comfortable straps that don't cut off circulation", "Pads that fit under or over your suit consistently"],
    avoid: "Bulky pads that catch in tight squeezes.",
    budget: "Basic pads are enough. Comfort matters more than features.",
  },
  {
    slug: "harness", name: "Harness", category: "vertical", lifeSafety: true,
    summary: "The connection between you and the rope. Caving harnesses are built for hanging, sliding and abrasion.",
    lookFor: ["Designed for caving or rope access, not only for climbing", "Comfortable to hang in for a long time", "Durable webbing and easy adjustment", "Fits with your suit and layers on"],
    standards: "Harness standards such as EN 12277, plus any caving-specific certification the maker states.",
    avoid: "Buying secondhand. You cannot know its history. Do not modify it.",
    budget: "Spend here. Get fitted with an instructor or a specialist shop.",
  },
  {
    slug: "descender", name: "Descender", category: "vertical", lifeSafety: true,
    summary: "Controls your speed down a rope. Different designs suit different rope and situations.",
    lookFor: ["A design your club or instructor teaches and uses", "Compatible with your rope diameter", "Smooth friction control that you can adjust", "Ability to lock off"],
    standards: "Many descenders are certified under different standards. Check the manufacturer's stated standard and instructions for your use.",
    avoid: "Using a device with a rope it wasn't tested for, or without training.",
    budget: "Buy new from a reputable maker. Do not economise.",
  },
  {
    slug: "ascenders", name: "Ascenders and rope clamps", category: "vertical", lifeSafety: true,
    summary: "Grip the rope so you can climb it. Usually a hand ascender plus a chest or foot device.",
    lookFor: ["Teeth that release smoothly and don't damage the rope", "Comfortable handle for gloved hands", "Compatibility with your rope diameter", "Safety catch that prevents accidental release"],
    standards: "Rope clamp standards such as EN 567, plus the manufacturer's rope-diameter range.",
    avoid: "Used or damaged devices, or those that have been dropped hard.",
    budget: "Buy new. Learn changeovers on the ground first.",
  },
  {
    slug: "rope", name: "Rope", category: "vertical", lifeSafety: true,
    summary: "Low-stretch (static) rope is used for vertical caving. It is not the same as dynamic climbing rope.",
    lookFor: ["Low-stretch kernmantle designed for caving or rope access", "Diameter suited to your descender and ascenders", "A clear maker's label and batch information", "A record of its use so you can retire it on time"],
    standards: "Low-stretch kernmantle rope standards such as EN 1891.",
    avoid: "Secondhand rope with unknown history, and rope that has been in acid, heat or heavy shock loads.",
    budget: "Buy from a reputable supplier and keep a rope log. Retire it on the maker's advice.",
  },
  {
    slug: "connectors", name: "Karabiners, slings and cow's tails", category: "vertical", lifeSafety: true,
    summary: "The small pieces of hardware that hold a rope system together.",
    lookFor: ["Locking karabiners that are easy to close with gloves", "Slings and cow's tails made from suitable webbing or rope", "Matching, well-maintained sets", "Correct gate orientation and locking every time"],
    standards: "Connector and sling standards such as EN 12275 (connectors) and EN 566 (slings).",
    avoid: "Improvised lanyards, damaged gates, or anything that has taken a hard shock or corroded.",
    budget: "Buy new and inspect before every trip.",
  },
  {
    slug: "pack", name: "Pack or tackle bag", category: "carry-safety", lifeSafety: false,
    summary: "Carries food, spare layers and gear, and gets dragged through the cave.",
    lookFor: ["Very tough fabric that resists abrasion", "Simple design with no loose straps to snag", "Drainage holes so it doesn't fill with water", "A size that suits your trips"],
    avoid: "Fashionable hiking packs, which catch and tear.",
    budget: "A cheap heavy-duty bag is often better than an expensive light one.",
  },
  {
    slug: "emergency-kit", name: "Emergency and first aid kit", category: "carry-safety", lifeSafety: true,
    summary: "For when things go wrong: warmth, light, a whistle and basic first aid.",
    lookFor: ["A foil or bivvy bag for each person or group", "A whistle, spare light and spare batteries", "Basic first aid, including blister care and wound dressings", "High-energy food and water"],
    avoid: "Leaving the kit behind because the trip is short.",
    budget: "Cheap and effective. Add training in first aid if you can.",
  },
  {
    slug: "survey-kit", name: "Survey kit", category: "survey", lifeSafety: false,
    summary: "Compass, clinometer, tape and waterproof notes to map a cave accurately.",
    lookFor: ["A compass and clinometer suited to caving (or a sensible digital option)", "A measuring tape or laser distance meter", "Waterproof paper and a pencil", "A survey protocol your club follows"],
    avoid: "Recording only in your head. Write it down at the station.",
    budget: "Simple tools and good habits beat expensive gadgets.",
  },
];

export const gearBySlug = (slug: string): GearItem | undefined => GEAR.find((g) => g.slug === slug);
export const GEAR_SLUGS = GEAR.map((g) => g.slug) as [string, ...string[]];
