require('dotenv').config();
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

const createTablesSQL = `
    DROP TABLE IF EXISTS posts, subscriptions;

    CREATE TABLE posts (
        post_id SERIAL PRIMARY KEY,
        image BYTEA NOT NULL,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE subscriptions (
        sub_id SERIAL PRIMARY KEY,
        sub_json TEXT NOT NULL
    );

`;

function createTables() {
    db.none(createTablesSQL)
        .then((r) => console.log('Tables created successfully.'))
        .catch((e) => console.error('Error creating tables:', e))
        .finally(()=>{
            pgp.end();
        })
}

createTables()