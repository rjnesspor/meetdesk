const sqlite3 = require('sqlite3').verbose();

const MEETFILE_NAME = "meet.meet";
const SCHEMA_VERSION = { major: 1, minor: 0 };
const SCHEMA_VERSION_INT = SCHEMA_VERSION.major * 100 + SCHEMA_VERSION.minor;

const db = new sqlite3.Database(`./${MEETFILE_NAME}`, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connected');
    }
})

function initDatabase(version) {
    db.serialize(() => {

        db.run(`PRAGMA user_version = ${version}`);

        db.run("PRAGMA foreign_keys = ON");

        db.run(`CREATE TABLE IF NOT EXISTS teams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                code TEXT);
                `);

        db.run(`CREATE TABLE IF NOT EXISTS levels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL);
                `);

        db.run(`CREATE TABLE IF NOT EXISTS athletes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bib_number INTEGER UNIQUE,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                team_id INTEGER,
                level_id INTEGER,
                division TEXT CHECK(division IN ('mens', 'womens')),
                session INTEGER,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
                FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE);
                `);

        db.run(`CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                division TEXT CHECK(division IN ('mens', 'womens')),
                order_num INTEGER,
                UNIQUE(name, division));
                `);

        db.run(`CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                athlete_id INTEGER NOT NULL,
                event_id INTEGER NOT NULL,    
                score REAL,
                judge_number INTEGER,
                timestamp INTEGER DEFAULT (strftime('%s', 'now')),
                scratched INTEGER DEFAULT 0,
                FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
                FOREIGN KEY (event_id) REFERENCES events(id),
                UNIQUE(athlete_id, event_id, judge_number));
                `);

        db.run(`CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                label TEXT NOT NULL,
                start INTEGER,
                end INTEGER);           
                `)



        db.run(`INSERT OR IGNORE INTO events (name, division, order_num) VALUES
                ('Vault', 'womens', '1'),
                ('Bars', 'womens', '2'),
                ('Beam', 'womens', '3'),
                ('Floor', 'womens', '4'),
                ('Floor', 'mens', '1'),
                ('Pommel Horse', 'mens', '2'),
                ('Rings', 'mens', '3'),
                ('Vault', 'mens', '4'),
                ('Parallel Bars', 'mens', '5'),
                ('Horizontal Bar', 'mens', '6');`
        );
    });
}

module.exports = { db, initDatabase, SCHEMA_VERSION, SCHEMA_VERSION_INT, MEETFILE_NAME };