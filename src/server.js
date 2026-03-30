const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, db } = require('./db/database');

const app = express();
const PORT = 4721;

const SCHEMA_VERSION = { major: 1, minor: 0 };
const SCHEMA_VERSION_INT = SCHEMA_VERSION.major * 100 + SCHEMA_VERSION.minor;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

initDatabase(SCHEMA_VERSION_INT);

app.locals.db = db;
app.locals.clients = [];
app.locals.schema_version = SCHEMA_VERSION;
app.locals.schema_version_int = SCHEMA_VERSION_INT;

const athletesRoutes = require('./routes/athletes');
const teamsRoutes = require('./routes/teams');
const eventsRoutes = require('./routes/events');
const scoresRoutes = require('./routes/scores');
const reportsRoutes = require('./routes/reports');
const levelsRoutes = require('./routes/levels');
const meetsRoutes = require('./routes/meets');

app.use('/api/athletes', athletesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/meets', meetsRoutes);

app.get('/', (req, res) => {
    res.redirect('/control_panel.html');
})

app.get('/display', (req, res) => {
    res.redirect('/display_login.html');
})

app.get('/scoring', (req, res) => {
    res.redirect('/score_login.html');
})

app.get('/api/info', (req, res) => {
    const os = require('os');
    const nets = os.networkInterfaces();
    const ips = Object.values(nets).flat().filter(n => n.family === 'IPv4' && !n.internal).map(n => n.address);
    res.json({ ips, version: req.app.locals.schema_version_int, port: PORT });
})

const server = app.listen(PORT, () => {
    console.log(`Server started`);
})

const shutdown = () => {
    db.close(() => {
        console.log('Database connection closed.');
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        })
    })
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);