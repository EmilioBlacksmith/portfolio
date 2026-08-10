import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-5 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        error 404
      </p>
      <h1 className="mt-4 font-display text-6xl font-bold tracking-tight text-bone">
        LOST IN THE FORGE
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ash">
        This page was consumed by the fire. It never made it past the anvil.
      </p>
      <Link
        href="/"
        className="mt-8 border border-white/10 px-6 py-3 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:border-steel/50 hover:text-bone"
      >
        return home<span className="text-steel">&gt;</span>
      </Link>
    </main>
  );
}
