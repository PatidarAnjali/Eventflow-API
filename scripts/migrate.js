require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { pool} = require('../src/config/database');

// runs every migrations/*.sql in lexicographic order (prefix filenames with 001_, 002_, …)
async function runMigrations() {

  try {
    console.log('Running DB migrations...');
    
    const migrationsDir = path.join(__dirname,  '../migrations');
    const  files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    for(const file of sqlFiles) {

      // quick sanity log — helps spot wrong db host when migrations hit the wrong cluster
      console.log({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        db: process.env.DB_NAME,
      });

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
