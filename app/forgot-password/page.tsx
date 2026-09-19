import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-6 pt-16">
      <h1 className="font-display text-4xl font-semibold">Reset your password</h1>
      <p className="mb-8 mt-2 text-slate-400">Enter your email and the recovery code you saved when you joined.</p>
      <ForgotPasswordForm />
    </main>
  );
}
