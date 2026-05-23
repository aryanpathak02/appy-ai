import Link from "next/link";

// ─── YOUR DETAILS — update these ─────────────────────────────────────────────
const AUTHOR = {
  name: "Aryan Pathak",
  github: "https://github.com/aryanpathak02",
  linkedin: "https://www.linkedin.com/in/pathakaryan/",
};
// ─────────────────────────────────────────────────────────────────────────────

interface FooterProps {
  /** Use "dashboard" variant inside the dashboard layout (darker bg, compact) */
  variant?: "public" | "dashboard";
}

export default function Footer({ variant = "public" }: FooterProps) {
  const year = new Date().getFullYear();

  if (variant === "dashboard") {
    return (
      <footer className="border-t border-zinc-200 bg-white px-6 py-4 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left — branding */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900">
              Apply<span className="text-blue-600">AI</span>
            </span>
            <span className="text-zinc-300 text-xs">·</span>
            <span className="text-xs text-zinc-400">
              Smarter job applications, powered by AI
            </span>
          </div>

          {/* Right — author links */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">
              Built by{" "}
              <span className="font-medium text-zinc-700">{AUTHOR.name}</span>
            </span>
            <div className="flex items-center gap-3">
              <a
                href={AUTHOR.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {/* GitHub icon */}
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <a
                href={AUTHOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-600 transition-colors"
              >
                {/* LinkedIn icon */}
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
            <span className="text-xs text-zinc-400">© {year}</span>
          </div>
        </div>
      </footer>
    );
  }

  // ── Public variant (landing + auth pages) ─────────────────────────────────
  return (
    <footer className="w-full border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              Apply<span className="text-blue-600">AI</span>
            </span>
            <p className="text-xs text-zinc-400 text-center md:text-left">
              Smarter job applications, powered by AI.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-zinc-100" />

        {/* Bottom row — author info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 text-center sm:text-left">
            © {year} ApplyAI. Built as a full-stack assignment project.
          </p>

          {/* Author card */}
          <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-bold">
              {AUTHOR.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-800">{AUTHOR.name}</p>
              <p className="text-xs text-zinc-400">Full-Stack Developer</p>
            </div>
            <div className="flex items-center gap-3 ml-2">
              <a
                href={AUTHOR.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href={AUTHOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-zinc-500 hover:text-blue-600 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
