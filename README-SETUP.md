# Database Setup Instructions

## Option 1: Using the Setup Script (Recommended)

Run the database setup script:

```bash
npm run setup-db
```

This will create all necessary tables, indexes, and insert the default admin user.

## Option 2: Using psql Command Line

If you have `psql` installed, you can run:

```bash
psql $DATABASE_URL -f database/schema.sql
```

Or if your DATABASE_URL is in `.env`:

```bash
source .env
psql $DATABASE_URL -f database/schema.sql
```

## Option 3: Using Neon Console

1. Go to your Neon dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Execute the SQL

## Option 4: Using a Database Client

Use any PostgreSQL client (like DBeaver, pgAdmin, TablePlus, etc.):

1. Connect to your database using the connection string from `.env`
2. Open and execute `database/schema.sql`

## Verify Setup

After running the schema, verify the tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- vendors
- users
- categories
- products
- orders
- order_items

## Default Admin Account

After setup, you can login with:
- Email: `admin@mmagency.com`
- Password: `admin123` (⚠️ **CHANGE THIS IN PRODUCTION!**)

The password hash in the schema file is a placeholder. You should:
1. Register/login as admin
2. Change the password immediately
3. Or update the hash in the database with a proper bcrypt hash

## Troubleshooting

### "relation does not exist" error
- Make sure you've run the schema.sql file
- Check that you're connected to the correct database
- Verify the DATABASE_URL in your `.env` file

### Connection errors
- Verify your DATABASE_URL is correct
- Check if your database allows connections from your IP
- For Neon, ensure SSL mode is set correctly (`sslmode=require`)
