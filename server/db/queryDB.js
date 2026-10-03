import pool from './db.js'

async function queryDB() {
  await pool.query(`
            ALTER TABLE projects 
            ADD COLUMN updated_on TIMESTAMPTZ;

        `)
}

queryDB()
