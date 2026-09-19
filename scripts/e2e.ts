import { config } from "dotenv";
config({ path: ".env.local" });

import { count, eq, like, or } from "drizzle-orm";
import { chromium } from "playwright-core";
import { getDb, tables } from "../lib/db";

const BASE = process.env.E2E_BASE ?? "http://localhost:3000";
const email = `e2e-${Date.now()}@example.com`;
const password = "correct-horse-battery";
const newPassword = "a-brand-new-passphrase-9";
let recoveryCode = "";
import type { Page } from "playwright-core";
const panel = (p: Page) => p.getByRole("complementary");
let failures = 0;
const check = (name: string, ok: boolean, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` (${extra})` : ""}`);
  if (!ok) failures++;
};

async function main() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // anonymous RSVP => sign-in redirect
  await page.goto(`${BASE}/events/evt-2`);
  await panel(page).getByRole("button", { name: /sign in to rsvp/i }).click();
  await page.waitForURL(/\/sign-in\?next=%2Fevents%2Fevt-2/);
  check("anonymous RSVP redirects to sign-in with next=", true);

  // sign up
  await page.goto(`${BASE}/sign-up?next=/events/evt-2`);
  await page.fill("#name", "E2E Tester");
  await page.fill("#email", email);
  await page.fill("#email", "not-an-email");
  await page.locator("#email").blur();
  await page.getByText("Enter a valid email address").waitFor();
  check("invalid email is flagged on blur, before submitting", true);
  await page.fill("#email", email);
  await page.getByText("Enter a valid email address").waitFor({ state: "hidden" });
  check("email error clears as soon as it is fixed", true);
  await page.fill("#password", "short");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.getByText("Use at least 10 characters").waitFor();
  check("weak password rejected with field error", true);
  await page.fill("#password", password);
  await page.selectOption("#skillLevel", "intermediate");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.getByTestId("recovery-code").waitFor();
  recoveryCode = (await page.getByTestId("recovery-code").innerText()).trim();
  check("sign-up shows a one-time recovery code", /^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/.test(recoveryCode), recoveryCode);
  check("cannot continue until the code is acknowledged", await page.getByRole("button", { name: /^continue$/i }).isDisabled());
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^continue$/i }).click();
  await page.waitForURL(`${BASE}/events/evt-2`);
  await page.getByRole("link", { name: /host (a trip|an expedition)/i }).first().waitFor();
  check("sign-up signs in and returns to the event", true);

  // RSVP
  const goingBefore = parseInt((await panel(page).getByText(/^\d+ going$/).innerText()).split(" ")[0], 10);
  const going = panel(page).getByRole("button", { name: /rsvp$/i });
  await going.click();
  await panel(page).getByRole("button", { name: /you.re going/i }).waitFor();
  check("RSVP shows 'You're going'", true);
  await panel(page).locator("button[aria-pressed=true]:not([disabled])").waitFor(); // server confirmed, not just optimistic
  // The page may be a cached render, so compare with the database rather than a number read from the page.
  const dbCount = Number((await getDb().select({ n: count() }).from(tables.rsvps).where(eq(tables.rsvps.eventId, "evt-2")))[0].n);
  await panel(page).getByText(`${dbCount} going`).waitFor();
  check(`the count shown matches the database (${goingBefore} before, ${dbCount} after)`, true);
  await page.reload();
  await panel(page).getByRole("button", { name: /you.re going/i }).waitFor();
  check("RSVP persists after reload (stored in Neon)", true);

  await page.screenshot({ path: "scripts/e2e-event.png" });

  // my expeditions
  await page.goto(`${BASE}/my-expeditions`);
  await page.getByRole("heading", { name: /you.re going/i }).waitFor();
  check("My Expeditions lists it", true);

  // home hero: no "Become a member" for a signed-in user
  await page.goto(`${BASE}/`);
  await page.getByRole("link", { name: /host (a trip|an expedition)/i }).first().waitFor();
  check("signed-in home page hides 'Become a member'", (await page.getByRole("link", { name: /become a member/i }).count()) === 0);

  // contact form
  await page.goto(`${BASE}/contact`);
  await page.fill("#name", "E2E Tester");
  await page.fill("#email", email);
  await page.fill("#message", "Automated test message, please ignore.");
  await page.getByRole("button", { name: /send message/i }).click();
  await page.getByText("Message sent").waitFor();
  check("contact form sends a message", true);

  // grotto ratings and past-expedition reviews (demo data)
  await page.goto(`${BASE}/grottos`);
  await page.locator("article").first().getByText(/\(\d+\)/).waitFor();
  check("clubs show average ratings", true);
  await page.goto(`${BASE}/events/demo-e1`);
  await page.getByRole("heading", { name: "Reviews" }).waitFor();
  await page.getByText("Perfect first cave trip").waitFor();
  check("past expedition shows member reviews", true);
  check("non-attendee sees no review form", (await page.getByRole("heading", { name: /how was it/i }).count()) === 0);

  // Q&A: public reading, expert badge, accepted answer
  await page.goto(`${BASE}/questions`);
  await page.getByText("What should I actually buy before my first caving trip?").first().waitFor();
  check("questions are listed", true);
  await page.getByText("What should I actually buy before my first caving trip?").first().click();
  await page.getByText("Accepted answer").first().waitFor();
  check("accepted answer is marked", true);
  await page.getByText("Expert", { exact: true }).first().waitFor();
  check("verified expert badge is shown on answers", true);

  // ask a question; you cannot mark your own post helpful
  await page.goto(`${BASE}/questions/ask`);
  await page.fill("#title", "E2E: how do I check the browser test works?");
  await page.fill("#body", "This question was created by the automated browser test.");
  await page.fill("#tags", "e2e, testing");
  await page.getByRole("button", { name: /post question/i }).click();
  await page.waitForURL(/\/questions\/[0-9a-f-]{36}$/);
  await page.getByRole("heading", { name: /E2E: how do I check/ }).waitFor();
  check("asking a question works", true);
  check("own post cannot be marked helpful", await page.getByRole("button", { name: /can.t mark your own post/i }).first().isDisabled());

  // gear guides and reviews
  await page.goto(`${BASE}/gear`);
  await page.getByRole("heading", { name: "Helmet" }).first().waitFor();
  check("gear guides are public", true);
  await page.goto(`${BASE}/gear/helmet`);
  await page.getByText("Awaiting expert review").first().waitFor();
  check("unreviewed guides are honestly labelled", true);
  await page.getByRole("radio", { name: "4 stars" }).click();
  await page.locator("#body").fill("Reviewed by the automated browser test.");
  await page.getByRole("button", { name: /post review/i }).click();
  await page.getByText("Your review is posted").waitFor();
  check("a member can review gear", true);

  // clubs: join and leave
  await page.goto(`${BASE}/grottos/highland`);
  await page.getByRole("button", { name: /join highland cave club/i }).click();
  await page.getByRole("button", { name: /member.*leave/i }).waitFor();
  check("a member can join a club", true);
  await page.getByRole("button", { name: /member.*leave/i }).click();
  await page.getByRole("button", { name: /join highland cave club/i }).waitFor();
  check("a member can leave a club", true);

  // account: level and a regenerated recovery code
  await page.goto(`${BASE}/account`);
  await page.selectOption("#skillLevel", "vertical");
  await page.getByRole("button", { name: /save level/i }).click();
  await page.getByText("Saved.").waitFor();
  check("skill level can be changed", true);
  await page.fill("#password", password);
  await page.getByRole("button", { name: /generate a new recovery code/i }).click();
  await page.getByTestId("recovery-code").waitFor();
  const regenerated = (await page.getByTestId("recovery-code").innerText()).trim();
  check("a new recovery code can be generated (needs the password)", regenerated !== recoveryCode && /^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/.test(regenerated));
  recoveryCode = regenerated;

  // host an expedition
  await page.goto(`${BASE}/events/new`);
  await page.fill("#title", "E2E hosted expedition");
  await page.fill("#description", "Created by the automated browser test.");
  await page.fill("#caveName", "Test Cave");
  await page.fill("#startsAt", "2027-03-01T10:00");
  await page.getByRole("button", { name: /publish expedition/i }).click();
  await page.waitForURL(/\/events\/[0-9a-f-]{36}$/);
  await page.getByRole("heading", { name: "E2E hosted expedition" }).waitFor();
  check("created expedition and landed on its page", true);
  await page.getByRole("button", { name: /cancel this expedition/i }).waitFor();
  check("host sees cancel button", true);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: /cancel this expedition/i }).click();
  await page.getByText("Cancelled", { exact: true }).first().waitFor();
  check("host can cancel", true);

  // sign out / bad sign-in / sign-in
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.getByRole("link", { name: /^sign in$/i }).first().waitFor();
  check("sign out works", true);

  await page.goto(`${BASE}/forgot-password`);
  await page.fill("#email", email);
  await page.fill("#code", "AAAA-AAAA-AAAA-AAAA");
  await page.fill("#password", newPassword);
  await page.getByRole("button", { name: /reset password/i }).click();
  await page.getByText("That email and recovery code don't match.").waitFor();
  check("a wrong recovery code is refused", true);
  await page.fill("#code", recoveryCode);
  await page.fill("#password", newPassword);
  await page.getByRole("button", { name: /reset password/i }).click();
  await page.getByTestId("recovery-code").waitFor();
  check("the right recovery code resets the password and issues a new code", true);

  await page.goto(`${BASE}/sign-in`);
  await page.fill("#email", email);
  await page.fill("#password", "wrong-password-123");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.getByText("Incorrect email or password.").waitFor();
  check("wrong password shows generic error", true);
  await page.fill("#password", newPassword);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(`${BASE}/events`);
  check("sign-in with the new password works", true);
  await page.screenshot({ path: "scripts/e2e-events.png" });

  check("no client-side JS errors", errors.length === 0, errors.join(" | "));
  await browser.close();

  // cleanup
  const db = getDb();
  await db.delete(tables.events).where(or(eq(tables.events.title, "E2E hosted expedition")));
  await db.delete(tables.contactMessages).where(like(tables.contactMessages.email, "e2e-%@example.com"));
  await db.delete(tables.users).where(like(tables.users.email, "e2e-%@example.com"));

  console.log(failures ? `\n${failures} FAILED` : "\nAll e2e checks passed.");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
