#Description
FindIt is a community-driven lost & found web app. Users can post items they've lost or found, browse listings, search by keyword and location, and mark items as resolved once reunited with their owner. It's essentially a neighborhood-scale lost-and-found board with image support, categories, contact info, and an optional reward field.

#Key features:

Post lost or found items with photos, category, location, date, and contact info
Browse and filter by status (lost/found), category, location, sort order
Item detail pages with edit support (owner-only)
Auth-protected routes — only logged-in users can post or edit
Dashboard for managing your own posts
Live stats (total lost, found, resolved)
Role-based access (admin, moderator, user)
Technologies Used

#Frontend

React 19
TypeScript 5
TanStack Router (file-based routing with _authenticated layout for protected routes)
TanStack Query (data fetching / caching)
TanStack Start (SSR/full-stack framework)
Tailwind CSS v4
shadcn/ui + Radix UI primitives (full component library)
React Hook Form + Zod (form handling & validation)
Lucide React (icons)
date-fns (date formatting)
Recharts (charts, likely for stats)
Sonner (toast notifications)

#Backend / Database

Supabase (PostgreSQL database, auth, storage, Row-Level Security)
Tables: items, item_images, profiles, user_roles
Auth middleware for server-side route protection

#Build / Tooling

Vite 7 (bundler)
Bun (package manager)
ESLint + Prettier (linting/formatting)
Nitro (server runtime for SSR)
Built and scaffolded via Lovable
How to Run
Make sure you have Bun installed, then:

# Install dependencies
bun install

# Start the dev server
bun run dev
The app will be available at http://localhost:3000 (default for TanStack Start/Vite).

For a production build:

bun run build
bun run preview
The .env file is already present with the Supabase credentials, so no extra setup is needed to connect to the database.
