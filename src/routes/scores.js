const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.app.locals.db;
    let query = `
        SELECT 
            s.*,
            a.bib_number,
            a.first_name || ' ' || a.last_name as athlete_name,
            e.name as event_name
        FROM scores s
        LEFT JOIN athletes a ON s.athlete_id = a.id
        LEFT JOIN events e ON s.event_id = e.id
    `;

    let conditions = [];
    let params = [];

    if (req.query.athlete_id) {
        conditions.push('s.athlete_id = ?');
        params.push(req.query.athlete_id);
    }

    if (req.query.event_id) {
        conditions.push('s.event_id = ?');
        params.push(req.query.event_id);
    }

    if (req.query.judge_number) {
        conditions.push('s.judge_number = ?');
        params.push(req.query.judge_number);
    }

    if (req.query.bib_number) {
        conditions.push('a.bib_number = ?');
        params.push(req.query.bib_number);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ' ORDER BY s.timestamp DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    })
})

router.post('/', async (req, res) => {
    const db = req.app.locals.db;
    const { bib_number, event_id, score, judge_number } = req.body;

    try {
        const fullData = await new Promise((resolve, reject) => {
            db.get(
                `SELECT 
                    a.id as athlete_id,
                    a.first_name,
                    a.last_name,
                    a.bib_number,
                    t.name as team_name,
                    l.name as level_name
                 FROM athletes a
                 LEFT JOIN teams t ON a.team_id = t.id
                 LEFT JOIN levels l ON a.level_id = l.id
                 WHERE a.bib_number = ?`,
                [bib_number],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!fullData) {
            return res.status(404).json({ error: "Athlete not found with that bib #" });
        }

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO scores (athlete_id, event_id, score, judge_number, timestamp)
                 VALUES (?, ?, ?, ?, strftime('%s', 'now'))
                 ON CONFLICT(athlete_id, event_id, judge_number) 
                 DO UPDATE SET score = excluded.score, timestamp = strftime('%s', 'now')`,
                [fullData.athlete_id, event_id, score, judge_number],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, updated: this.changes > 0 });
                }
            );
        });

        broadcastScore({ ...req.body, ...fullData }, req.app.locals.clients);

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.delete('/:id', (req, res) => {
    const db = req.app.locals.db;
    db.run("DELETE FROM scores WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    })
})

router.get('/score-stream/:eventId', (req, res) => {
    const clients = req.app.locals.clients;

    const eventId = req.params.eventId;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!clients[eventId]) {
        clients[eventId] = [];
    }

    clients[eventId].push(res);

    console.log(`Connected score display client to event ${eventId}`);

    req.on('close', () => {
        clients[eventId].splice(clients[eventId].indexOf(res), 1);
    })
})

function broadcastScore(score, clients) {
    if (!clients[score.event_id]) return; // no listening clients
    clients[score.event_id].forEach(client => {
        client.write(`data: ${JSON.stringify(score)}\n\n`);
    })
    console.log(`Sent score to display to ${clients[score.event_id].length} clients for event ${score.event_id}`);
}

module.exports = router;