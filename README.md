# ApplyAI — Smarter Job Applications, Powered by AI

> A full-stack, production-grade job application tracker built with Next.js 16, MongoDB, and Groq AI.

**Live Demo → [https://apply-ai.vercel.app](https://apply-ai.vercel.app)**  
**GitHub → [https://github.com/aryanpathak02](https://github.com/aryanpathak02)**  
**LinkedIn → [https://www.linkedin.com/in/pathakaryan/](https://www.linkedin.com/in/pathakaryan/)**

---

## What is ApplyAI?

ApplyAI helps job seekers stay organised and use AI to get an edge. Instead of tracking applications in spreadsheets and guessing whether your resume fits a role, ApplyAI gives you:

- A centralised tracker for every application you've sent
- An AI engine that scores your resume against any job description
- Auto-generated, role-specific interview questions with hints
- A dashboard with KPIs and AI-powered insights about your job search

---

## Features

### Core
| Feature | Description |
|---|---|
| **Authentication** | JWT-based auth with httpOnly cookies, bcrypt password hashing, 7-day sessions |
| **Job Tracker** | Full CRUD — add, view, edit, soft-delete jobs with status, salary, location, job type, notes |
| **Application Pipeline** | Track status across Saved → Applied → Interview → Offer / Rejected |
| **Search & Filter** | Search by company/role/location, filter by status and job type, paginated results |
| **Job Detail View** | Visual application timeline, interview rounds, AI match report, quick actions |

### AI (powered by Groq)
| Feature | Description |
|---|---|
| **AI Resume Matching** | Paste a job description → get a match score (0–100%), matched skills, missing skills, and a tailored recommendation |
| **Interview Prep** | Generate HR, Technical, or Mixed questions for any role/company with difficulty levels and preparation hints |
| **PDF Export** | Download generated interview questions as a formatted PDF |
| **AI Insights Dashboard** | Rule-based insights about your job search — top roles getting callbacks, resume gap analysis, most targeted companies |

### User & Profile
| Feature | Description |
|---|---|
| **Resume Upload** | Upload PDF resume to Cloudinary; text is auto-extracted for AI matching |
| **Resume Preview** | Inline PDF viewer proxied through the server (no CORS issues) |
| **Profile Management** | Update name, email, and password from the dashboard |

### Technical
| Feature | Description |
|---|---|
| **Rate Limiting** | In-memory rate limiter — 10 req/15 min on auth (IP), 20 req/hr on AI (user), 60/min writes, 120/min reads |
| **Input Validation** | Zod schemas on every API route — server-side and client-side |
| **Route Protection** | Edge-compatible proxy (`proxy.ts`) guards all `/dashboard` routes |
| **Soft Deletes** | Jobs are soft-deleted (`deletedAt`) — data is never permanently lost |
| **Mobile Responsive** | Fixed bottom tab bar on mobile, full desktop sidebar on large screens |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Database** | MongoDB + Mongoose 9 |
| **Auth** | JWT + bcryptjs + httpOnly cookies |
| **AI** | Groq SDK (llama3-70b) |
| **File Storage** | Cloudinary (resume PDFs) |
| **PDF Parsing** | pdf-parse |
| **PDF Generation** | jsPDF |
| **Validation** | Zod v4 |
| **Styling** | Tailwind CSS v4 |
| **Toasts** | react-hot-toast |
| **Deployment** | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & Register pages
│   ├── (dashboard)/         # All dashboard pages
│   │   └── dashboard/
│   │       ├── page.tsx         # KPI + AI insights
│   │       ├── jobs/            # Job list + detail
│   │       ├── add-job/         # Add job form
│   │       ├── resume/          # Resume upload & preview
│   │       ├── interview-prep/  # AI question generator
│   │       └── profile/         # Account settings
│   ├── api/                 # All API routes
│   └── page.tsx             # Public landing page
├── controllers/             # Business logic (auth, jobs, AI, resume, profile)
├── models/                  # Mongoose models (User, Job)
├── lib/
│   ├── validators/          # Zod schemas
│   ├── prompts/             # Groq prompt templates
│   ├── rate-limit.ts        # In-memory rate limiter
│   ├── env.ts               # Validated env vars
│   └── get-user.ts          # JWT extraction helper
├── services/
│   └── db.service.ts        # Generic Mongoose CRUD helpers
├── types/                   # Shared TypeScript types
└── proxy.ts                 # Edge-compatible route guard
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI
- A [Cloudinary](https://cloudinary.com) account (free tier works)
- A [Groq](https://console.groq.com) API key (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/aryanpathak02/apply-ai.git
cd apply-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/apply-ai

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq
GROQ_API_KEY=your_groq_api_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs (min 32 chars recommended) |
| `JWT_EXPIRES_IN` | ❌ | Token expiry duration (default: `7d`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `GROQ_API_KEY` | ✅ | Groq API key for AI features |

---

## API Routes

| Method | Route | Description | Rate Limit |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create account | 10 / 15 min (IP) |
| `POST` | `/api/auth/login` | Sign in | 10 / 15 min (IP) |
| `POST` | `/api/auth/logout` | Sign out | — |
| `GET` | `/api/jobs` | List jobs (paginated) | 120 / min |
| `POST` | `/api/jobs` | Create job | 60 / min |
| `GET` | `/api/jobs/:id` | Get job by ID | 120 / min |
| `PATCH` | `/api/jobs/:id` | Update job | 60 / min |
| `DELETE` | `/api/jobs/:id` | Soft-delete job | 60 / min |
| `POST` | `/api/jobs/:id/ai-match` | Run AI resume match | 20 / hr |
| `POST` | `/api/interview-prep` | Generate interview questions | 20 / hr |
| `GET` | `/api/dashboard` | Dashboard KPIs + insights | 120 / min |
| `GET` | `/api/user/profile` | Get profile | 120 / min |
| `PUT` | `/api/user/profile` | Update profile / password | 60 / min |
| `GET` | `/api/user/resume` | Get resume info | 120 / min |
| `POST` | `/api/user/resume` | Upload resume PDF | 60 / min |
| `DELETE` | `/api/user/resume` | Delete resume | 60 / min |
| `GET` | `/api/user/resume/view` | Proxy resume PDF inline | 120 / min |

---

## Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- Auth tokens stored in **httpOnly, SameSite=Lax cookies** — not accessible to JavaScript
- All API routes validate input with **Zod** before touching the database
- **Per-user data isolation** — every DB query is scoped to the authenticated `userId`
- **Rate limiting** on every endpoint to prevent brute-force and API abuse
- **Soft deletes** — no data is permanently destroyed on user action

---

## Deployment

The app is deployed on **Vercel**.

To deploy your own instance:

1. Push the repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add all environment variables from the table above in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js and configures everything

---

## Built By

**Aryan Pathak**  
[GitHub](https://github.com/aryanpathak02) · [LinkedIn](https://www.linkedin.com/in/pathakaryan/)
