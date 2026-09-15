import pool from './db.js'

async function queryDB() {
  const result = await pool.query(`
        SELECT 
            *
        FROM users;
    `)

  console.table(result.rows)
}

queryDB()
