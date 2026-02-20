import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');
    
    // Read the schema file
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql.unsafe(statement);
          console.log('✓ Executed statement');
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.code === '42P07' || error.message?.includes('already exists')) {
            console.log('⚠ Table/index already exists, skipping...');
          } else {
            console.error('✗ Error executing statement:', error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log('\n✅ Database setup complete!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    await sql.end();
    process.exit(1);
  }
}

setupDatabase();
