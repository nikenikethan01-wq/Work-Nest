import pool from './db.js'
async function createTables() {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS freelancer_profiles (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            professional_title TEXT NOT NULL,
            skills TEXT NOT NULL,
            experience INTEGER NOT NULL,
            hourly_rate INTEGER NOT NULL,
            bio TEXT,
            location TEXT
        );

        CREATE TABLE IF NOT EXISTS client_profiles (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            client_id INTEGER NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            budget INTEGER NOT NULL,
            status TEXT NOT NULL,
            created_ON TIMESTAMPTZ DEFAULT now(),
            updated_on TIMESTAMPTZ,
            completed_on TIMESTAMPTZ,
            category TEXT
        );

        CREATE TABLE IF NOT EXISTS applications (
            job_id INTEGER NOT NULL REFERENCES jobs(id),
            freelancer_id INTEGER NOT NULL REFERENCES users(id),
            proposal TEXT NOT NULL,
            proposal_price INTEGER NOT NULL,
            status TEXT NOT NULL,
            created_on TIMESTAMPTZ DEFAULT now(),
            updated_on TIMESTAMPTZ,
            PRIMARY KEY (job_id, freelancer_id)
        );

        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            job_id INTEGER NOT NULL REFERENCES jobs(id),
            freelancer_id INTEGER NOT NULL REFERENCES users(id),
            client_id INTEGER NOT NULL REFERENCES users(id),
            agreed_price INTEGER NOT NULL,
            started_on TIMESTAMPTZ DEFAULT now(),
            completed_on TIMESTAMPTZ,
            updated_on TIMESTAMPTZ,
            status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS session (
            sid TEXT PRIMARY KEY,
            sess JSON NOT NULL,
            expire TIMESTAMP(6) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            client_id INTEGER NOT NULL REFERENCES users(id),
            freelancer_id INTEGER NOT NULL REFERENCES users(id),
            started_on TIMESTAMPTZ DEFAULT now(),
            UNIQUE (client_id, freelancer_id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER NOT NULL REFERENCES conversations(id),
            sender_id INTEGER NOT NULL REFERENCES users(id),
            message TEXT NOT NULL,
            sent_on TIMESTAMPTZ DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
        ON messages(conversation_id);
    `)
  } catch (err) {
    console.log('Error creating tables : ', err)
  } finally {
    await pool.end()
  }
}

createTables()
