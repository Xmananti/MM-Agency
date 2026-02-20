import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a single postgres instance for the application
const sql = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export default sql;

// Helper function to handle database errors
export function handleDbError(error: unknown): never {
  if (error instanceof Error) {
    console.error('Database error:', error.message);
    throw new Error(`Database operation failed: ${error.message}`);
  }
  throw new Error('Unknown database error occurred');
}
