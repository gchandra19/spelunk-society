import { config } from "dotenv";
config({ path: ".env.local" });

import { eq, like, or } from "drizzle-orm";
import { chromium } from "playwright-core";
import { getDb, tables } from "../lib/db";

const BASE = process.env.E2E_BASE ?? "http://localhost:3000";
const email = `e2e-${Date.now()}@example.com`;
const password = "correct-horse-battery";
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
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(`${BASE}/events/evt-2`);
  await page.getByRole("link", { name: /host an expedition/i }).first().waitFor();
  check("sign-up signs in and returns to the event", true);

  // RSVP
  const going = panel(page).getByRole("button", { name: /rsvp$/i });
  await going.click();
  await panel(page).getByRole("button", { name: /you.re going/i }).waitFor();
  check("RSVP shows 'You're going'", true);
  await panel(page).locator("button[aria-pressed=true]:not([disabled])").waitFor(); // server confirmed, not just optimistic
  await panel(page).getByText("1 going").waitFor();
  check("count is 1", true);
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
  await page.getByRole("link", { name: /host an expedition/i }).first().waitFor();
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
  await page.getByText(/\d+ ratings?/).first().waitFor();
  check("grottos show average ratings", true);
  await page.goto(`${BASE}/events/demo-e1`);
  await page.getByRole("heading", { name: "Reviews" }).waitFor();
  await page.getByText("Perfect first cave trip").waitFor();
  check("past expedition shows member reviews", true);
  check("non-attendee sees no review form", (await page.getByRole("heading", { name: /how was it/i }).count()) === 0);

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
  await page.goto(`${BASE}/sign-in`);
  await page.fill("#email", email);
  await page.fill("#password", "wrong-password-123");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.getByText("Incorrect email or password.").waitFor();
  check("wrong password shows generic error", true);
  await page.fill("#password", password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(`${BASE}/events`);
  check("sign-in with correct password works", true);
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
