// All formatting is pinned to UTC + en-US so server and client render identical text.
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...o });

const MONTH = fmt({ month: "short" });
const DAY = fmt({ day: "numeric" });
const SHORT = fmt({ month: "short", day: "numeric", year: "numeric" });
const LONG = fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
const TIME = fmt({ hour: "numeric", minute: "2-digit", timeZoneName: "short" });

export const formatMonth = (iso: string) => MONTH.format(new Date(iso));
export const formatDay = (iso: string) => DAY.format(new Date(iso));
export const formatLongDate = (iso: string) => LONG.format(new Date(iso));
export const formatTime = (iso: string) => TIME.format(new Date(iso));
export const formatShortDate = (iso: string) => SHORT.format(new Date(iso));
