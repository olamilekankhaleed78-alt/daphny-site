"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="grid min-h-screen place-items-center bg-ivory p-6">
      <form action={action} className="w-full max-w-sm space-y-4">
        <h1 className="font-serif text-2xl font-black text-charcoal">Kitchen Console</h1>
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded border border-charcoal/20 bg-white px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={pending}
          className="w-full rounded bg-forest py-2 font-bold text-white disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
