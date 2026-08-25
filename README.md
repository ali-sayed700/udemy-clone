# Udemy Clone

A full-stack online learning platform inspired by Udemy, built as a production-style
portfolio project. It covers course creation and consumption, video lectures, a
shopping cart and checkout flow, payments, and instructor/student dashboards — backed
by a secured NestJS API and a Next.js App Router frontend.

## Tech Stack

**Monorepo**
- [Turborepo](https://turbo.build/) with [pnpm](https://pnpm.io/) workspaces

**Backend** (`apps/server`)
- [NestJS](https://nestjs.com/) (Express)
- REST + [GraphQL](https://graphql.org/) (Apollo Server) APIs
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- JWT authentication with refresh token rotation, Google OAuth ([Passport](https://www.passportjs.org/))
- [Stripe](https://stripe.com/) and [PayPal](https://developer.paypal.com/) payments
- [Cloudinary](https://cloudinary.com/) for video/image storage
- [Redis](https://redis.io/) / [ioredis](https://github.com/redis/ioredis) backed rate limiting ([@nestjs/throttler](https://github.com/nestjs/throttler))
- [Helmet](https://helmetjs.github.io/) security headers, class-validator/class-transformer input validation

**Frontend** (`apps/client`)
- [Next.js](https://nextjs.org/) (App Router) + React 19
- [TanStack Query](https://tanstack.com/query) for data fetching/caching
- [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) / shadcn-style components
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation
- [Stripe.js](https://stripe.com/docs/js) / [PayPal React SDK](https://github.com/paypal/react-paypal-js) for checkout
- [dnd-kit](https://dndkit.com/) for drag-and-drop course/section reordering
- Cookie-based sessions via [jose](https://github.com/panva/jose), route protection via Next.js middleware

## Features

- **Auth** — email/password and Google OAuth sign-in, JWT access/refresh token rotation, httpOnly cookie sessions, protected routes via middleware
- **Courses** — course, section, and lecture authoring with drag-and-drop ordering, video upload/streaming through Cloudinary
- **Cart & Checkout** — cart management, coupon support, Stripe and PayPal payment flows, order history
- **Enrollment & Progress** — course enrollment, per-lecture progress tracking, favorites/wishlist
- **Dashboards** — instructor dashboard for managing courses/orders, student dashboard for enrolled courses and progress
- **API layer** — REST endpoints alongside a GraphQL schema (Apollo Server) for flexible data fetching

## Project Structure

```
udemy-clone/
├── apps/
│   ├── client/            # Next.js frontend (App Router)
│   │   ├── app/            # Routes: auth, course, cart, dashboard, orders, favorites...
│   │   ├── components/     # UI components (auth, cart, course, dashboard, video-player...)
│   │   ├── hooks/          # React hooks (checkout, cart, video progress/upload...)
│   │   ├── lib/            # API clients, GraphQL queries, Zod schemas, session helpers
│   │   ├── service/        # Feature-oriented API service modules
│   │   └── types/          # Shared TypeScript types
│   └── server/             # NestJS backend
│       └── src/
│           ├── auth/            # JWT/refresh/Google OAuth strategies & guards
│           ├── course/          # Courses
│           ├── section/         # Course sections
│           ├── lecture/         # Lectures / video content
│           ├── cart/            # Shopping cart
│           ├── order/           # Orders
│           ├── payment/         # Stripe & PayPal integration
│           ├── enrollment/      # Course enrollment
│           ├── course-progress/ # Lecture/course progress tracking
│           ├── favorite/        # Wishlist/favorites
│           ├── cloudinary/      # Media upload/storage
│           ├── graphql/         # GraphQL schema
│           └── user/            # User accounts
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- [pnpm](https://pnpm.io/) 9+
- A MongoDB instance
- A Redis instance
- Cloudinary, Stripe, PayPal, and Google OAuth credentials (for the respective features)

### Install

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in `apps/server` and `apps/client` with the values your setup
requires — at minimum:

**`apps/server/.env`**
```
PORT=3001
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
REDIS_URL=
CORS_ORIGIN=http://localhost:3000
```

**`apps/client/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
```

### Run in development

```bash
# from the repo root — runs client + server together via Turborepo
pnpm dev
```

The client runs on `http://localhost:3000` and the server on `http://localhost:3001`
by default.

### Build

```bash
pnpm build
```

### Lint & type-check

```bash
pnpm lint
pnpm check-types
```

## Scripts (per app)

**Server** (`apps/server`): `pnpm dev`, `pnpm build`, `pnpm start:prod`, `pnpm test`, `pnpm test:e2e`, `pnpm lint`

**Client** (`apps/client`): `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`

## License

This project is currently unlicensed / for portfolio purposes.
