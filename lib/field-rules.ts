// Instant, client-side checks that mirror the server rules in lib/validation.ts.
// The server stays authoritative; these only give feedback while typing.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type FieldName = "name" | "email" | "password";

export function checkField(name: string, value: string, mode: "sign-in" | "sign-up"): string | null {
  switch (name) {
    case "name":
      return value.trim().length < 2 ? "Enter your name" : null;
    case "email":
      if (!value.trim()) return "Enter your email address";
      return EMAIL.test(value.trim()) ? null : "Enter a valid email address, like name@example.com";
    case "password":
      if (!value) return "Enter a password";
      return mode === "sign-up" && value.length < 10 ? `Use at least 10 characters (${value.length}/10)` : null;
    default:
      return null;
  }
}
