# SalonBook — Backend API

Backend REST API for **SalonBook**, a full-stack salon appointment booking platform.

Built with Node.js, Express.js, TypeScript, MongoDB, Mongoose, Better Auth, and Stripe.

## Live Links

- **Live Website:** https://a9-salonbook-client.vercel.app
- **Backend API:** https://a9-salonbook-server.vercel.app
- **Frontend Repository:** https://github.com/ArifsCreative/a9-salonbook-client
- **Backend Repository:** https://github.com/ArifsCreative/a9-salonbook-server

## Features

### Authentication and Authorization
- Email and password authentication using Better Auth.
- Google OAuth integration.
- JWT-based API authorization.
- Customer and admin roles.
- Protected API endpoints.
- Blocked-user access restrictions.

### Service Management
- Retrieve salon services.
- View individual service details.
- Search and filter services.
- Create, update, and delete services with administrator authorization.
- Image upload integration.

### Appointment Management
- Customers can book salon appointments.
- Customers can view their appointments.
- Appointment cancellation.
- Administrator appointment management.
- Appointment confirmation and status updates.

### Payment Processing
- Stripe Checkout session creation.
- Stripe webhook signature verification.
- Payment status updates.
- Transaction recording.
- Customer payment history.
- Administrator transaction monitoring.

### Dashboard Statistics
- Customer appointment statistics.
- Administrator statistics for customers, services, appointments, payments, and revenue.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | REST API framework |
| TypeScript | Type-safe backend development |
| MongoDB Atlas | Cloud database |
| Mongoose | Database models and queries |
| Better Auth | Authentication and Google OAuth |
| JWT | Protected API authorization |
| Stripe | Online payment processing |
| Vercel | Backend deployment |

## Project Setup

### Prerequisites

- Node.js and npm
- MongoDB Atlas connection
- Stripe test account
- Google OAuth credentials for Google sign-in

### Installation

Clone the repository:

```bash
git clone https://github.com/ArifsCreative/a9-salonbook-server.git
cd a9-salonbook-server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string

CLIENT_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_better_auth_secret
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

STRIPE_SECRET_KEY=your_stripe_test_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
STRIPE_CURRENCY=usd
```

Replace the placeholder values with your own development credentials.

Never commit `.env` files or secret keys to GitHub.

### Run Locally

Start the development server:

```bash
npm run dev
```

Backend API:

http://localhost:5000

Health check:

http://localhost:5000/api/health

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with automatic reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run the compiled backend |
| `npm run typecheck` | Check TypeScript types |

## API Overview

### Authentication

Better Auth handles authentication endpoints under:

`/api/auth/*`

Authentication includes email/password sign-in, sign-up, session handling, and Google OAuth.

### Services

Base route: `/api/services`

Supports service listing, service details, and administrator service management.

### Appointments

Base route: `/api/appointments`

Supports appointment booking, customer appointment retrieval, and appointment management.

### Payments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/checkout/:id` | Create Stripe Checkout session |
| GET | `/api/payments/status/:sessionId` | Retrieve recorded payment status |
| POST | `/api/payments/webhook` | Receive verified Stripe webhook events |

### Additional API Routes

| Base Route | Purpose |
|---|---|
| `/api/dashboard` | Customer and administrator dashboard statistics |
| `/api/profile` | Authenticated user profile |
| `/api/users` | User and customer management |
| `/api/transactions` | Payment transaction history and monitoring |
| `/api/images` | Image upload handling |

Some endpoints require a valid JWT and the appropriate user role.

## Stripe Webhook Setup

SalonBook uses Stripe webhooks to update appointment payment status and record transactions after successful payment.

### Local Development

Use the Stripe CLI to forward webhook events:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Use the signing secret provided by the CLI in your local `.env` file.

### Production

Configure a Stripe webhook destination pointing to:

`https://a9-salonbook-server.vercel.app/api/payments/webhook`

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_failed`

Set the production destination's signing secret as `STRIPE_WEBHOOK_SECRET` in Vercel.

Use Stripe test mode for assignment demonstrations.

## Security

- Role-based access control for customer and admin routes.
- JWT verification for protected API operations.
- Blocked-user checks.
- Stripe webhook signature verification.
- Payment amount and currency validation.
- Environment-based secret management.

## Deployment

The backend is deployed on Vercel.

**Production API:** https://a9-salonbook-server.vercel.app

Set the required environment variables in the Vercel project settings.

The backend uses a shared MongoDB connection helper for database-backed API routes in the serverless environment.

## Related Frontend

**Repository:** https://github.com/ArifsCreative/a9-salonbook-client

**Live Application:** https://a9-salonbook-client.vercel.app

## Project Purpose

Developed as a full-stack web development assignment demonstrating REST API development, authentication, authorization, MongoDB database integration, appointment management, Stripe payments, and production deployment.