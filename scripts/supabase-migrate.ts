import { supabase } from './supabase';
import fs from 'fs/promises';
import path from 'path';

const MIGRATIONS_DIR = 'supabase/migrations';

const runMigrations = async () => {
  try {
    // Get list of migration files sorted by timestamp
    const files = await fs.readdir(MIGRATIONS_DIR);
    const sortedMigrations = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Execute each migration in order
    for (const migrationFile of sortedMigrations) {
      const filePath = path.join(MIGRATIONS_DIR, migrationFile);
      const sql = await fs.readFile(filePath, 'utf8');
      
      console.log(`Running migration: ${migrationFile}`);
      const { error } = await supabase.rpc('execute_sql', { sql });
      
      if (error) {
        console.error(`Migration failed: ${migrationFile}`, error);
        process.exit(1);
      }
    }
    
    console.log('All migrations applied successfully');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

runMigrations();
