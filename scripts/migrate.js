require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { pool} = require('../src/config/database');

async function runMigrations() {

  console.log('DB_USER @ runtime:',process.env.DB_USER);

  try {
    console.log('Running DB migrations...');
    
    const migrationsDir = path.join(__dirname,  '../migrations');
    const  files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    for(const file of sqlFiles) {

      console.log(`Running migration: ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      
      await pool.query(sql);
      console.log(`Completed migration: ${file}`);

    }

    console.log('All migrations completed successfully' );
    process.exit(0);

  }catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
