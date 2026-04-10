# 🛍️ Secure E-Commerce Platform

A luxury hair wig e-commerce storefront built with Next.js 16, featuring Paystack payment integration, Prisma/PostgreSQL, and custom JWT authentication. Deployed on Vercel with a `.co.za` domain.

---

## Overview

A full-stack e-commerce application targeting the South African market. It features a refined editorial aesthetic — warm neutrals, serif typography — alongside a robust and secure backend covering auth, payments, and order management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL via Prisma ORM |
| Auth | Custom JWT (HTTP-only cookies) |
| Payments | Paystack (ZAR) |
| Deployment | Vercel |
| Domain | `.co.za` via South African registrar |

---

## Features

- **Product Catalogue** — Browseable wig listings with image galleries, descriptions, and variant selection (length, colour, cap style)
- **Secure Authentication** — Registration, login, and session management using JWT stored in HTTP-only cookies
- **Checkout Flow** — Cart → address → Paystack payment → confirmation
- **Paystack Integration** — ZAR payments with webhook-based order confirmation
- **Order Management** — Users can view order history and status; admins can update fulfilment state
- **Admin Dashboard** — Product CRUD, inventory management, and order processing
- **Luxury UI** — Editorial aesthetic with warm neutral palette and serif typography

---

## Project Structure

```
/
├── app/
│   ├── (store)/
│   │   ├── page.tsx              # Homepage / hero
│   │   ├── products/             # Catalogue & product detail
│   │   ├── cart/
│   │   └── checkout/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── account/
│   │   └── orders/
│   ├── admin/
│   │   ├── products/
│   │   └── orders/
│   └── api/
│       ├── auth/
│       ├── products/
│       ├── orders/
│       └── payments/
│           ├── initialize/       # Paystack payment init
│           └── webhook/          # Paystack webhook handler
│
├── components/
│   ├── ui/
│   ├── product/
│   └── checkout/
│
├── lib/
│   ├── auth.ts                   # JWT helpers
│   ├── paystack.ts               # Paystack SDK wrapper
│   └── prisma.ts                 # Prisma client singleton
│
└── prisma/
    └── schema.prisma
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Paystack account (test keys available instantly)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/aurawig.git
cd aurawig
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aurawig

# Auth
JWT_SECRET=your_very_strong_jwt_secret_here
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
# Optional: seed demo products
npx prisma db seed
```

### 4. Run

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Payments — Paystack Flow

1. Client hits `POST /api/payments/initialize` with cart total and user email
2. Server calls Paystack Initialize Transaction API, returns an authorization URL
3. Client redirects to the Paystack-hosted checkout page
4. On success, Paystack redirects back to `/checkout/success?reference=xxx`
5. Simultaneously, Paystack fires a `charge.success` event to `POST /api/payments/webhook`
6. Webhook verifies the HMAC signature, marks the order as **PAID**, and triggers fulfilment

> ⚠️ Always verify the webhook signature using `PAYSTACK_SECRET_KEY` before trusting any webhook payload.

---

## Security Practices

- JWT stored in **HTTP-only, Secure, SameSite=Strict** cookies — not `localStorage`
- Passwords hashed with **bcrypt** (12 rounds)
- Paystack webhooks verified with **HMAC-SHA512** signature check
- All admin routes protected by **role-based middleware**
- Input validation on all API routes using **Zod**
- SQL injection prevention via **Prisma parameterised queries**

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Set all `.env.local` variables as **Environment Variables** in the Vercel project dashboard. Update `NEXT_PUBLIC_APP_URL` to your live `.co.za` domain.

For Paystack webhooks, set the webhook URL in your Paystack dashboard to:
```
https://yourdomain.co.za/api/payments/webhook
```

---

## Prisma Schema (Key Models)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(CUSTOMER)
  orders    Order[]
  createdAt DateTime @default(now())
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String
  price       Float       // in ZAR (cents stored as Float)
  images      String[]
  stock       Int
  orderItems  OrderItem[]
}

model Order {
  id         String      @id @default(cuid())
  user       User        @relation(fields: [userId], references: [id])
  userId     String
  status     OrderStatus @default(PENDING)
  total      Float
  reference  String      @unique  // Paystack reference
  items      OrderItem[]
  createdAt  DateTime    @default(now())
}
```

---

## Roadmap

- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Coupon/discount code system
- [ ] Email order confirmations (Nodemailer)
- [ ] Mobile-optimised checkout

---

## License

MIT
