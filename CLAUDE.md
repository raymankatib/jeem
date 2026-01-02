# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jeem** is a bilingual (English/Arabic) talent matching platform built with Next.js that connects companies with pre-vetted developers and designers. The platform includes:

- Public landing pages for talent applications and company hiring requests
- Admin dashboard for managing applications, statuses, and matching
- Automated email notifications in both languages

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Technology Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS 4 + Radix UI components
- **i18n**: i18next with react-i18next (English/Arabic with RTL support)
- **Email**: Resend API with bilingual HTML templates
- **Animations**: Framer Motion

## Project Architecture

### App Router Structure

```
src/app/
├── page.tsx                    # Landing page (talent applications)
├── hire/page.tsx               # Company hiring request page
├── login/page.tsx              # Public talent/company login
├── dashboard/                  # Talent dashboard (future)
├── admin/
│   ├── login/page.tsx         # Admin login
│   └── dashboard/             # Admin management dashboard
│       ├── page.tsx           # Server component (auth + data)
│       └── DashboardClient.tsx # Client component (UI)
└── api/                        # API routes
    ├── talents/               # Talent CRUD & status updates
    ├── companies/             # Company CRUD & status updates
    ├── hiring-requests/       # Hiring request management
    └── upload-cv/             # CV file upload to Supabase Storage
```

### Database Schema

Three main tables in Supabase:

1. **`talents`**: Developer/designer applications

   - Links to auth.users via `user_id`
   - Fields: name, email, role, portfolio, CV, status tracking, UTM params
   - Status flow: under_review → interviewing → training → pending_matching → matched → rejected

2. **`companies`**: Company profiles (created from hiring request forms)

   - Links to auth.users via `user_id`
   - Fields: company_name, contact info, industry, size, website

3. **`hiring_requests`**: Job/project requests from companies
   - Foreign key to `companies(company_id)`
   - Foreign key to `talents(matched_talent_id)` - one-to-one matching
   - Fields: project details, budget, timeline, required skills
   - Status flows:
     - `application_status`: under_review → reviewing_candidates → interviewing_candidates → negotiating → matched → rejected
     - `request_status`: open → filled → closed

### Supabase Client Patterns

**Three different clients for different contexts:**

1. **Browser Client** (`src/lib/supabase/client.ts`):

   - Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - For client components
   - Row-Level Security (RLS) applies

2. **Server Client** (`src/lib/supabase/server.ts`):

   - Uses cookies for session management
   - For Server Components and API routes with user context
   - RLS applies based on authenticated user

3. **Admin Client** (`src/lib/supabaseServer.ts`):
   - Uses `SUPABASE_SERVICE_ROLE_KEY`
   - **Server-only** (has `"server-only"` import)
   - Bypasses RLS - full database access
   - Only use in API routes and server components
   - Used in admin dashboard for cross-user data access

**When to use which:**

- Use admin client (`getSupabaseAdmin()`) for admin operations that need to bypass RLS
- Use server client (`createServerSupabaseClient()`) for user-scoped operations
- Use browser client (`createClient()`) in client components

### Authentication Flow

**Admin Authentication:**

- Admins log in via `/admin/login` using Supabase Auth
- Admin role is set via `auth.users.user_metadata.role = "admin"`
- Must be manually set in database (not via registration)
- Middleware checks session on every request
- Dashboard redirects non-admins to home page

**User Authentication:**

- Talents/companies create accounts during application
- Auto-confirmed email (no verification flow yet)
- Password stored via Supabase Auth

### Internationalization (i18n)

**Structure:**

- Translation files: `/public/locales/{en,ar}/translation.json`
- Loaded via HTTP backend (i18next-http-backend)
- Language detection: localStorage → browser navigator
- Client-side only (no SSR translations yet)

**Usage Pattern:**

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
<p>{t("dashboard.talents.title")}</p>
```

**RTL Support:**

- Arabic pages use `dir="rtl"` automatically
- Email templates have separate HTML for RTL

### Email System

**Provider**: Resend API

**Email types:**

1. Talent confirmation (on application)
2. Company confirmation (on hiring request)
3. Talent status updates (when admin changes status)
4. Company status updates (when admin changes status)

**Pattern:**

- All emails support English/Arabic
- Templates in `src/lib/email.ts`
- Idempotency keys prevent duplicate sends
- Errors logged but don't fail requests
- Email status tracked in database (`email_status`, `email_sent_at`, `email_error`)

### API Route Patterns

**Common patterns across API routes:**

1. **Rate Limiting** (in-memory, see `/api/talents/route.ts`):

   - IP-based hashing with salt
   - Simple in-memory map (not distributed)
   - Should use Redis/Upstash for production multi-instance deployments

2. **Validation**:

   - Zod schemas for all inputs
   - Return `400` with detailed field errors on validation failure

3. **Honeypot Protection**:

   - `honey` field in forms - should remain empty
   - If filled, return success without processing (don't reveal honeypot)

4. **Error Handling**:

   - Console.error for debugging
   - Generic user-facing messages (don't leak internals)
   - `500` for server errors, `400` for client errors, `429` for rate limits

5. **Admin-only Routes**:
   - Check `user?.user_metadata?.role === "admin"`
   - Return `401` for unauthorized, `403` for forbidden

### Component Organization

```
src/components/
├── ui/              # Radix UI components (shadcn-style)
├── landing/         # Landing page sections
├── dashboard/       # Dashboard-specific components
├── hire/            # Hire page components
├── language-switcher.tsx
├── auth-nav.tsx
├── auth-provider.tsx
└── i18n-provider.tsx
```

**UI Components** (`src/components/ui/`):

- Built on Radix UI primitives
- Styled with Tailwind + `class-variance-authority`
- Follow shadcn/ui patterns

### File Upload (CV)

**Storage**: Supabase Storage bucket `talent-cvs`

- Bucket is **private** (not publicly accessible)
- Upload endpoint: `/api/upload-cv`
- Signed URLs generated on-demand (expires in 1 hour)
- Pattern in `/admin/dashboard/page.tsx` lines 81-106

**Upload Flow:**

1. Client uploads to `/api/upload-cv` with file blob
2. API validates, uploads to Supabase Storage
3. Returns public URL (for storage path reference)
4. Admin dashboard generates signed URLs when displaying

### Middleware

**File**: `middleware.ts`

- Runs on all routes except static files, images, and `/locales`
- Updates Supabase session via `updateSession()` helper
- Refreshes auth tokens automatically

### Environment Variables

Required in `.env.development.local` or `.env.production.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Admin operations only

# Email
RESEND_API_KEY=

# Security
IP_HASH_SALT=                    # For rate limiting IP hashing
```

## Common Development Patterns

### Adding a New Status to Talents or Companies

1. Update the type in `src/lib/email.ts` (`TalentStatus` or `CompanyStatus`)
2. Add email template content to `talentStatusEmailContent` or `companyStatusEmailContent`
3. Add translation strings in `/public/locales/{en,ar}/translation.json`
4. Update status badge variants in `DashboardClient.tsx`
5. Add the status option to status update dropdowns

### Creating a New API Route

1. Create file in `src/app/api/[name]/route.ts`
2. Export async functions: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
3. Use `NextRequest` and return `NextResponse.json()`
4. For admin-only: check `user.user_metadata.role === "admin"`
5. Use `getSupabaseAdmin()` for admin operations, `createServerSupabaseClient()` for user-scoped
6. Add Zod validation schema
7. Include proper error handling and logging

### Adding a New Translation

1. Add key to `/public/locales/en/translation.json`
2. Add Arabic translation to `/public/locales/ar/translation.json`
3. Use nested objects for organization (e.g., `dashboard.talents.title`)
4. Access with `t("dashboard.talents.title")`

### Working with Dates/Times

- Database stores UTC timestamps
- Display in user's timezone (browser handles conversion)
- Use `new Date().toISOString()` for insertion
- Format with `toLocaleDateString()` for display

## Key Implementation Notes

1. **Server-Only Modules**: Files with `import "server-only"` at the top cannot be imported in client components

2. **Client Component Markers**: Use `"use client"` directive for components with hooks, event handlers, or browser APIs

3. **Path Alias**: `@/*` maps to `src/*` (configured in `tsconfig.json`)

4. **Admin Dashboard Pattern**:

   - Server component (`page.tsx`) fetches data, checks auth
   - Passes data to Client component (`DashboardClient.tsx`)
   - Client component handles all interactivity

5. **Pagination**: Admin dashboard uses URL params (`?talentPage=1&companyPage=2&requestPage=1`)

6. **Styling Direction**:
   - Use logical properties: `ms-4` (margin-inline-start), `me-4` (margin-inline-end)
   - These automatically flip for RTL languages
   - Avoid `ml-4` / `mr-4` in bilingual components

## Testing Checklist for New Features

- Test in both English and Arabic
- Test with RTL layout (Arabic)
- Test admin vs non-admin access
- Test email sending (check both languages)
- Test with empty/invalid inputs
- Test pagination if applicable
- Check mobile responsiveness
- Verify Supabase RLS doesn't block legitimate operations
