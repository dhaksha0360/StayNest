# StayNest — Property Booking & Management Platform

StayNest is a separated Next.js/Laravel portfolio application for discovering, booking, and operating short-stay properties. It demonstrates authenticated REST APIs, role-aware management, transactional availability protection, server-owned pricing, Stripe Payment Intents/webhooks, persisted conversations, dashboards, and responsive commercial UI.

## Architecture

```text
Browser (Next.js 16 + React Query)
        │ REST / Bearer token
Laravel 12 API ── Services ── Eloquent ── MySQL
        ├── Stripe API + signed webhooks
        ├── Mail / Notifications / Queues
        └── Laravel Reverb private-channel real-time transport
```

Money is stored as integer minor units. Booking creation locks the property row inside a database transaction, re-checks overlapping active bookings and blocked ranges, and calculates every price component on the server. The frontend never determines the payable total.

## Included modules

- Sanctum token authentication, verified-user model, profile management, password-reset foundation, throttled auth endpoints
- Customer, manager, and administrator roles with server-enforced ownership/role checks
- Indexed property search, filtering, sorting, pagination, detail galleries, amenities, policies, and manager inventory creation
- Transactional booking, guest manifests, date override pricing, cancellation, payment records, Stripe Payment Intents, and signature-verified webhook state
- Favourites, stay-gated one-review-per-booking enforcement, property rating aggregation
- Persisted participant-authorized conversations/messages and responsive two-pane inbox
- Role-specific database-powered dashboard metrics, booking table, portfolio-quality public UI, loading/error/empty states
- Database and queued email notifications, scheduled arrival/departure reminders, activity logs, Reverb private conversations, validated uploads, and PDF confirmations
- FullCalendar availability operations, per-date price/minimum-stay overrides, maintenance/blocked ranges, manager analytics with Recharts, and responsive admin/manager/customer workspaces
- Stripe Elements checkout, signed webhook settlement, cancellation-policy quotes, and administrator-issued full or partial refunds
- PHPUnit feature coverage for double booking, trusted pricing, and role authorization

## Requirements

- PHP 8.3+, Composer 2.8+
- Node.js 20.9+ and npm
- MySQL 8+
- Stripe test account (for payments)

## Local setup

```bash
git clone <repository-url> staynest
cd staynest

cd backend
cp .env.example .env
composer install
php artisan key:generate
# Create the MySQL database and update DB_* in .env
php artisan migrate --seed
php artisan storage:link
php artisan serve

cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The API defaults to `http://localhost:8000/api`.

## Demo accounts

Development seeding creates these accounts. The development-only password is `StayNest123!`.

| Role | Email |
|---|---|
| Administrator | `admin@staynest.test` |
| Property manager | `manager@staynest.test` |
| Customer | `customer@staynest.test` |

Never use demo credentials in production.

## Screenshots

The primary portfolio views are available at `/`, `/properties`, `/properties/{id}`, `/checkout`, `/dashboard`, `/dashboard/calendar`, `/dashboard/messages`, `/dashboard/analytics`, and `/dashboard/admin/users`. Capture these routes after running the seeded applications; the responsive layouts include desktop, tablet, and mobile navigation states.

## Stripe test mode

Set `STRIPE_SECRET`, `STRIPE_KEY`, and `STRIPE_WEBHOOK_SECRET` in `backend/.env`, plus `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `frontend/.env.local`. Forward events locally:

```bash
stripe listen --forward-to localhost:8000/api/payments/webhook
```

The webhook—not the browser redirect—changes a payment/booking to paid and confirmed.

## WebSockets, mail, and queues

Configure matching `REVERB_*` and `NEXT_PUBLIC_REVERB_*` values, then run `php artisan reverb:start`. For async mail/notifications run `php artisan queue:work`; for upcoming-stay reminders run `php artisan schedule:work`. Configure the desired `MAIL_*` transport in `.env`.

## Tests and quality checks

```bash
cd backend
php artisan test
./vendor/bin/pint --test

cd ../frontend
npm run lint
npm test
npm run build
```

Tests use SQLite in memory and do not require the development database.

## Principal API routes

All responses use `{ "success": boolean, "message": string, "data": ... }`; validation uses HTTP 422 and authorization uses 403.

- `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/user`, `PUT /api/profile`
- `GET /api/properties`, `GET /api/properties/{id}`, authenticated property create/update/archive
- `POST /api/bookings/quote`, `POST /api/bookings`, `GET /api/bookings`, `POST /api/bookings/{id}/cancel`
- availability and blocked-date operations under `/api/properties/{property}/availability` and `/blocked-dates`
- `POST /api/payments/create-intent`, `POST /api/payments/webhook`, administrator refunds, payment history
- favourites and reviews under `/api/favourites` and `/api/reviews`
- Reverb-backed conversations/messages and validated attachments under `/api/conversations` and `/api/messages`
- notifications, image/avatar uploads, PDF confirmations, analytics, guests, and administrator resources
- role-aware aggregate metrics at `GET /api/dashboard`

## Project structure

```text
frontend/  app/ components/ components/ui/ lib/ services/ types/
backend/   app/Http/Controllers/Api app/Http/Requests app/Http/Resources app/Models app/Policies app/Services app/Events app/Notifications database/ routes/ tests/
```

Secrets and generated artifacts are excluded from version control. Production deployments should use HTTPS, private object storage, a production queue, restricted CORS/stateful domains, rotated Stripe/Reverb credentials, and MySQL transaction isolation appropriate for the workload.
