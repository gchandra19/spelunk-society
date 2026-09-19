import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Contact us</h1>
      <p className="mb-8 mt-2 text-slate-400">Questions, feedback, or want your grotto listed? Send us a note.</p>
      <ContactForm />
    </main>
  );
}
