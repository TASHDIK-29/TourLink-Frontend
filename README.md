# TourLink — Frontend

A tour booking platform for Bangladesh. Travellers browse tours by destination,
book a trip, pay through SSLCommerz and manage everything from a dashboard;
admins run the catalogue and watch the business from an analytics dashboard.

This repository is the **Next.js frontend**. It talks to a separate Express +
MongoDB API — see [Tour-Management-Backend](https://github.com/TASHDIK-29/Tour-Management-Backend).

---

## 🔑 Try it yourself — demo Admin login

| | |
|---|---|
| **Email** | `super@gmail.com` |
| **Password** | `12345678` |

This is a **seeded Super Admin account** with full access. After logging in
you'll be taken straight to the **admin dashboard** (`/admin`), where you can:

- View the **analytics dashboard** — revenue, bookings, payments, top tours
- Create/edit/delete **tours**, **divisions** and **tour types**
- Review guide applications and **approve/reject** them
- See every **booking**, assign or reassign a guide, and confirm a completed
  guiding

You're also welcome to register your own account with **Register** to try the
traveller side (browsing, booking, becoming a guide) end to end — everything
here runs on demo data, so feel free to click around freely.

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack), **React 19** |
| Language | TypeScript (strict) |
| Styling | **Tailwind CSS v4** via CSS-first `@theme`, dark mode by `.dark` class |
| State / data | **Redux Toolkit + RTK Query** (one `baseApi`, per-feature injected endpoints) |
| Forms | **React Hook Form + Zod**, schemas mirroring the backend's validation |
| Charts | **Recharts**, on a validated accessible palette |
| Motion | Framer Motion |
| Feedback | Sonner toasts · next-themes for light/dark |

---

## Features

### Traveller
- **Browse & search** — the tour list keeps all filter state (search term,
  division, tour type, sort, page) in the **URL**, so any result set is
  shareable and the home page's search box links straight into it.
- **Destinations** — every division with a live tour count.
- **Tour details** — gallery, itinerary, inclusions/exclusions, amenities and a
  sticky price card.
- **Booking** — collects a phone number and address inline when missing (the API
  rejects a booking without both), then hands off to the payment gateway.
- **Pay later** — a booking is created immediately and can stay unpaid.
  *Pay now* on any unpaid trip reopens checkout for the **same** booking,
  reusing its original transaction id.
- **Dashboard** — bookings with payment status, invoice download, cancellation,
  and a profile page for details and password changes.
- **Accounts** — email/password with OTP verification, Google OAuth, and a
  full forgot/reset password flow.

### Admin
- **Analytics dashboard** — revenue hero figure, KPI tiles, booking/payment
  status breakdowns and ranked charts for tours, divisions, types and roles.
  Every chart has a **table view**, so no value is reachable only by hovering.
- **Catalogue management** — tours (with multi-image upload), divisions and tour
  types, all with search, pagination and delete confirmation.
- **Bookings** — all bookings with status filter, pagination, guide
  assign/reassign and guiding confirmation.
- **Guide applications** — review, approve or reject travellers applying to
  become guides; approval promotes their account to the `GUIDE` role.

### Guide
- A `GUIDE`-role user gets their own dashboard: guiding stats (completed
  guidings, tier, earnings) and the list of trips they're assigned to lead.
  Reach this role by applying from the traveller dashboard and having an admin
  approve the application.

---

## Getting started

**Prerequisites:** Node.js 20+, and the backend API running (default
`http://localhost:5000`).

```bash
git clone <this-repo>
cd frontend
npm install
cp .env.example .env.local   # defaults already point at a local backend
npm run dev
```

Open **http://localhost:5173**.

> ⚠️ **The port matters.** `npm run dev` is pinned to **5173**, not Next's
> default 3000. The backend locks CORS to a single origin (`FRONTEND_URL`), and
> its Google OAuth callback and payment redirects all point at port 5173.
> Serving anywhere else makes every API call fail CORS with an opaque
> *"Failed to fetch"*.

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_ORIGIN` | Bare origin of the API — used for full-page OAuth redirects |
| `NEXT_PUBLIC_API_BASE_URL` | API root including `/api/v1` |
| `NEXT_PUBLIC_SITE_NAME` | Brand name shown across the UI |

### Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server on port 5173 (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build on 5173 |
| `npm run lint` | ESLint |

---

## Project structure

```
app/                        # App Router — route groups keep layouts separate
├─ (main)/                  #   public site: navbar + footer chrome
│  ├─ page.tsx              #     home
│  ├─ tours/                #     list + [slug] detail
│  ├─ divisions/            #     destinations
│  └─ payment/              #     gateway outcome pages (guarded)
├─ (auth)/                  #   login, register, verify, forgot/reset password
├─ dashboard/               #   traveller area — keeps the public chrome
├─ admin/                   #   admin area — sidebar shell instead
└─ globals.css              #   design tokens + chart palette

components/
├─ ui/                      # Button, Input, Modal, Select, Textarea, Skeleton
├─ auth/                    # forms + RoleGuard / AuthGuard / GuestGuard
├─ layout/                  # Navbar, Footer, Logo
├─ home/ tours/ booking/    # feature sections
├─ divisions/ profile/
└─ admin/                   # admin shell, forms, and charts/

redux/
├─ baseApi.ts               # fetchBaseQuery + auth header + refresh handling
├─ store.ts, hooks.ts       # typed hooks
└─ features/                # auth, user, tour, division, booking, payment, stats

lib/                        # config, utils, apiError, multipart, validations
types/                      # shared API + domain types
```

---

## Architecture notes

Things a newcomer would otherwise have to rediscover.

### Authentication

The access token lives in `localStorage`; the refresh token is an httpOnly
cookie. `baseApi` attaches the access token and, on a 401/403, runs a **single**
refresh (serialised with a mutex so concurrent failures don't stampede) and
retries the original request.

> The API's `checkAuth` reads the **raw** token from the `Authorization`
> header — there is no `Bearer ` prefix anywhere in this codebase.

### Route protection

Three guards, applied at the **layout** level so a whole subtree is covered at
once:

| Guard | Meaning | Used by |
|---|---|---|
| `RoleGuard` | specific roles only | `/admin`, `/dashboard` |
| `AuthGuard` | any signed-in user | `/payment/*`, `/tours/[slug]` |
| `GuestGuard` | signed-out only | `/login`, `/register`, `/forgot-password` |

`/verify` and `/reset-password` are deliberately unguarded — both are reached
from an emailed link and must work in any session state.

**Login always returns to the home page**, with exactly one exception: a
`/tours/<slug>` target, so a visitor who followed a shared tour link lands back
on that tour. `LoginForm` re-validates the redirect parameter against that
pattern rather than trusting it, which also prevents an off-site open redirect.

*This is UX, not security.* Every protected resource is enforced server-side;
the guards exist so nobody is shown a shell that will only return 403s.

### Talking to the API

The backend's response envelope is uniform (`sendResponse`) but its **nesting is
not** — some controllers return `data`, others `data.data`. Each RTK Query
endpoint therefore carries a `transformResponse` with a comment naming the
controller it matches. Don't assume a shape; check the endpoint.

Two more quirks worth knowing:

- **Multipart writes.** Tour and division create/update send the JSON payload as
  a stringified field named `data` (the API does `JSON.parse(req.body.data)`),
  with files under `files` / `file`. `lib/multipart.ts` builds this.
- **Pagination.** The API's `meta.total` is computed without the active filters,
  so the tour list derives "is there a next page" from whether the page came
  back full rather than trusting `meta.totalPage`.

### Charts

Chart colors are **not** the brand tokens — the brand rose is a UI accent, not a
data-viz hue. `globals.css` defines a separate `--chart-*` set, validated for
colorblind separation and contrast against this app's own light and dark card
surfaces.

Two rules are load-bearing and commented at the definition:

1. Status segments stack **good → warning → critical → serious**. That ordering
   is the one that clears both the colorblind and normal-vision separation
   gates; putting warning beside serious fails.
2. Nominal bar charts use **one hue for every bar** — never darker-where-bigger,
   which would double-encode bar length as color.

### Next.js 16 notes

- `params` and `searchParams` are **Promises** — unwrap with `use()`.
- The `react-hooks/set-state-in-effect` and `immutability` lint rules are
  errors. Notably `window.location.href = url` is rejected; use
  `window.location.assign(url)` for the external gateway redirect.
- Any layout passing icon components through props must be `"use client"`.

---

## Placeholder content

The home page's **reviews** section is **fabricated** — there is no review
module in the API. It's paired by index with real tours so the catalogue stays
truthful, and uses initials avatars rather than stock photos. The file carries
a warning header.

The home page's **guides showcase** carousel is likewise cosmetic placeholder
copy — but note this is different from the **actual guide system**, which is
real and functional: applying to become a guide, admin approval, automatic
guide assignment on booking, and the guide's own dashboard all work against
live data (see the Admin/Guide feature lists above).

**Replace the reviews section before this faces real customers** — invented
testimonials read as genuine feedback.
