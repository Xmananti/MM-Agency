const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config({ path: join(process.cwd(), '.env') });

const postgres = require('postgres');

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL environment variable is not set. Skipping database setup.');
  process.exit(0); // Exit gracefully, don't fail build
}

const sql = postgres(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database schema...\n');
    
    // Read the schema file
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    
    if (!require('fs').existsSync(schemaPath)) {
      console.warn('⚠️  Schema file not found. Skipping database setup.');
      process.exit(0);
    }
    
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Try executing the entire schema at once first
    // PostgreSQL should handle multiple statements separated by semicolons
    try {
      await sql.unsafe(schema);
      console.log('✓ Schema executed successfully as a single transaction');
      successCount = 1;
      skipCount = 0;
      errorCount = 0;
    } catch (bulkError) {
      // If bulk execution fails, fall back to individual statements
      console.log('Bulk execution encountered issues, trying individual statements...\n');
      
      // Remove single-line comments
      const lines = schema.split('\n');
      const cleanedLines = lines.map(line => {
        const commentIdx = line.indexOf('--');
        return commentIdx >= 0 ? line.substring(0, commentIdx).trimEnd() : line;
      });
      
      const cleanedSchema = cleanedLines.join('\n');
      
      // Simple split by semicolon - PostgreSQL handles multi-line statements
      const statements = cleanedSchema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      successCount = 0;
      skipCount = 0;
      errorCount = 0;
      
      // Execute each statement individually
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await sql.unsafe(statement + ';');
            successCount++;
          } catch (error) {
            const isAlreadyExists = 
              error.code === '42P07' || // relation already exists
              error.code === '42710' || // duplicate object
              error.code === '23505' || // unique violation (INSERT ON CONFLICT)
              error.message?.includes('already exists') ||
              error.message?.includes('duplicate');
            
            const isRelationNotExist = error.code === '42P01';
            
            if (isAlreadyExists) {
              skipCount++;
            } else if (isRelationNotExist) {
              // Index referencing non-existent table - skip
              if (statement.toUpperCase().includes('CREATE INDEX') || 
                  statement.toUpperCase().includes('CREATE UNIQUE INDEX')) {
                skipCount++;
              } else {
                errorCount++;
                console.error(`✗ Table creation failed: ${error.message.substring(0, 80)}`);
              }
            } else {
              errorCount++;
              console.error(`✗ Error: ${error.message.substring(0, 80)}`);
            }
          }
        }
      }
    }
    
    console.log('\n📊 Database Setup Summary:');
    console.log(`  ✓ Created: ${successCount}`);
    console.log(`  ⚠ Already exists/Skipped: ${skipCount}`);
    if (errorCount > 0) {
      console.log(`  ✗ Errors: ${errorCount}`);
    }
    console.log('\n✅ Database setup complete!');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    // Don't fail the build if database setup fails
    console.error('⚠️  Database setup encountered an error:', error.message);
    console.log('Continuing with build...');
    try {
      await sql.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    process.exit(0); // Exit successfully so build continues
  }
}

setupDatabase();
