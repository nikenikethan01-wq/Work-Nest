import pool from './db.js'
async function createTables() {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS profile (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            name TEXT NOT NULL,
            bio TEXT,
            hourly_rate INTEGER,
            skills TEXT,
            location TEXT
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            client_id INTEGER NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            budget INTEGER NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now(),
            category TEXT
        );

        CREATE TABLE IF NOT EXISTS applications (
            job_id INTEGER NOT NULL REFERENCES jobs(id),
            freelancer_id INTEGER NOT NULL REFERENCES users(id),
            proposal TEXT NOT NULL,
            proposal_price INTEGER NOT NULL,
            status TEXT NOT NULL,
            PRIMARY KEY (job_id, freelancer_id)
        );

        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            job_id INTEGER NOT NULL REFERENCES jobs(id),
            freelancer_id INTEGER NOT NULL REFERENCES users(id),
            client_id INTEGER NOT NULL REFERENCES users(id),
            agreed_price INTEGER NOT NULL,
            started_at TIMESTAMPTZ DEFAULT now(),
            completed_at TIMESTAMPTZ,
            status TEXT NOT NULL
        );
    `)
}

createTables()
