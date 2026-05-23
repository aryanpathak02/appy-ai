import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/ui/Footer";

// ─── Static page — built once at deploy time, cached forever ─────────────────
export const revalidate = false;

// ─── Rich metadata + Open Graph tags ─────────────────────────────────────────
export const metadata: Metadata = {
  title: "ApplyAI — Smarter Job Applications, Powered by AI",
  description:
    "Track job applications, score your resume with AI, and generate tailored interview questions. The smart job search companion built with Next.js 16.",
  keywords: [
    "job tracker",
    "AI resume matching",
    "interview prep",
    "job application tracker",
    "Next.js",
    "ApplyAI",
  ],
  authors: [{ name: "Aryan Pathak", url: "https://github.com/aryanpathak02" }],
  openGraph: {
    type: "website",
    title: "ApplyAI — Smarter Job Applications, Powered by AI",
    description:
      "Track applications, score your resume with AI, and generate interview questions — all in one place.",
    siteName: "ApplyAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyAI — Smarter Job Applications, Powered by AI",
    description:
      "Track applications, score your resume with AI, and generate interview questions — all in one place.",
  },
};

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Resume Matching",
    desc: "Paste a job description and get an instant match score against your resume — with matched skills, gaps, and a tailored recommendation.",
  },
  {
    icon: "📋",
    title: "Job Application Tracker",
    desc: "Track every application in one place. Log status, dates, salary, location, and notes. Never lose track of where you applied.",
  },
  {
    icon: "🎯",
    title: "Interview Prep",
    desc: "Generate role-specific interview questions — HR, technical, or mixed — with difficulty levels and preparation hints. Export as PDF.",
  },
  {
    icon: "📄",
    title: "Resume Storage",
    desc: "Upload your PDF resume once. It's stored securely and automatically parsed so AI features work without re-uploading every time.",
  },
  {
    icon: "📊",
    title: "Application Dashboard",
    desc: "See your job search at a glance — total applications, interviews, rejections, average AI match score, and AI-powered insights.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    desc: "Your data belongs to you. JWT-based auth, httpOnly cookies, bcrypt-hashed passwords, and per-user data isolation.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up in seconds — no credit card, no noise.",
  },
  {
    step: "02",
    title: "Upload your resume",
    desc: "Drop your PDF once. AI extracts the text automatically.",
  },
  {
    step: "03",
    title: "Add your applications",
    desc: "Log jobs you've applied to with status, dates, and notes.",
  },
  {
    step: "04",
    title: "Let AI do the work",
    desc: "Get match scores, prep questions, and insights instantly.",
  },
];

const STATS = [
  { value: "AI-Powered", label: "Resume matching" },
  { value: "Instant", label: "Interview questions" },
  { value: "100%", label: "Private & secure" },
  { value: "Free", label: "To get started" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            Apply<span className="text-blue-600">AI</span>
          </span>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-500">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-6 py-24 md:py-36 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              AI-powered job application tracker
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
              Land your next job{" "}
              <span className="text-blue-600">smarter</span>,{" "}
              <br className="hidden md:block" />
              not harder
            </h1>

            <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              ApplyAI tracks your applications, scores your resume against job descriptions,
              and generates tailored interview questions — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-zinc-700 transition shadow-sm"
              >
                Start for free →
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl border border-zinc-300 px-8 py-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Sign in to your account
              </Link>
            </div>

            <p className="mt-5 text-xs text-zinc-400">No credit card required · Free to use</p>
          </div>
        </section>

        {/* ── Stats bar ───────────────────────────────────────────────────── */}
        <section className="border-y border-zinc-100 bg-zinc-50">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <section id="features" className="py-24 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            {/* Section header */}
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
                Features
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
                Everything you need to job hunt better
              </h2>
              <p className="mt-4 text-zinc-500 max-w-xl mx-auto">
                Built for job seekers who want to stay organised and use AI to get an edge.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 hover:border-zinc-300 hover:shadow-md transition-all"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-xl">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-zinc-50">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
                How it works
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
                Up and running in minutes
              </h2>
              <p className="mt-4 text-zinc-500 max-w-lg mx-auto">
                Four simple steps from sign-up to AI-powered job search.
              </p>
            </div>

            {/* Steps — vertical timeline on mobile, 2-col on md+ */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {STEPS.map((s) => (
                <div
                  key={s.step}
                  className="flex items-start gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  {/* Step number pill */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white text-sm font-bold">
                    {s.step}
                  </div>
                  {/* Text */}
                  <div className="pt-0.5">
                    <h3 className="text-base font-semibold text-zinc-900 mb-1">{s.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ──────────────────────────────────────────────────── */}
        <section className="py-24 bg-zinc-900">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to take control of your job search?
            </h2>
            <p className="text-zinc-400 mb-10 text-lg">
              Join ApplyAI and start tracking smarter today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition shadow-sm"
              >
                Create free account →
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl border border-zinc-700 px-8 py-3.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <Footer variant="public" />
    </div>
  );
}
