# MM Agency - Multi-Vendor Marketplace Platform

A production-ready multi-vendor SaaS marketplace platform built with Next.js, TypeScript, PostgreSQL, and Vercel.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with RBAC (Role-Based Access Control)
- 👥 **Multi-Role System**: SUPER_ADMIN, VENDOR, and CUSTOMER roles
- 🏪 **Vendor Management**: Vendor onboarding, verification, and commission tracking
- 📦 **Product Management**: Full CRUD operations with vendor isolation
- 🛒 **Order System**: Complete order processing with commission calculation
- 📊 **Analytics Dashboards**: Role-based analytics for each user type
- ☁️ **File Storage**: Vercel Blob integration for images
- 🎨 **Modern UI**: Tailwind CSS with dark mode support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Raw SQL, no ORM)
- **Storage**: Vercel Blob
- **Auth**: JWT (HTTP-only cookies)
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Vercel account (for Blob storage)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your values:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob token

4. Set up the database:
   ```bash
   psql $DATABASE_URL -f database/schema.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app                 # Next.js app directory
  /api              # API routes
  /admin            # Super admin dashboard
  /vendor           # Vendor dashboard
  /customer         # Customer dashboard
/components         # React components
  /charts           # Chart components
/lib                # Utilities
  /db              # Database connection
  /auth            # Authentication helpers
  /rbac            # Role-based access control
  /analytics       # Analytics queries
/types             # TypeScript types
/database          # SQL schema files
/middleware.ts     # Route protection middleware
```

## Roles & Permissions

### SUPER_ADMIN
- Manage platform settings
- Approve/suspend vendors
- Set commission rates
- View platform-wide analytics
- Access: `/admin/*`

### VENDOR
- Manage own products
- View own analytics
- Process orders
- Access: `/vendor/*`
- Data isolation: Can only see own data

### CUSTOMER
- Browse products
- Place orders
- View order history
- Access: `/customer/*`

## Database Schema

See `database/schema.sql` for the complete schema.

Key tables:
- `users` - User accounts with roles
- `vendors` - Vendor stores
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items

## API Routes

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/vendor/*` - Vendor endpoints (protected)
- `GET /api/admin/*` - Admin endpoints (protected)

## Development

- Run linting: `npm run lint`
- Build for production: `npm run build`
- Start production server: `npm start`

## Deployment

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Security Notes

- ⚠️ Change the default SUPER_ADMIN password hash in `database/schema.sql`
- ⚠️ Use strong `JWT_SECRET` in production
- ⚠️ Enable HTTPS in production
- ⚠️ Review and adjust CORS settings as needed

## License
ss
MIT
