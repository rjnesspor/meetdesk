const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.app.locals.db;
    const bibNumber = req.query.bib_number;
    let query = "SELECT a.*, t.name AS team_name FROM athletes a LEFT JOIN teams t ON a.team_id = t.id";
    let params = [];

    if (bibNumber) {
        query += " WHERE a.bib_number = ?";
        params.push(bibNumber);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    })
})

router.post('/', (req, res) => {
    const db = req.app.locals.db;
    const { bib_number, first_name, last_name, team_id, level_id, division, session } = req.body;
    db.run("INSERT INTO athletes (bib_number, first_name, last_name, team_id, level_id, division, session) VALUES (?, ?, ?, ?, ?, ?, ?)", [bib_number, first_name, last_name, team_id, level_id, division, session], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    })
})

router.delete('/:id', (req, res) => {
    const db = req.app.locals.db;
    db.run("DELETE FROM athletes WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    })
})

router.get('/next-bib', (req, res) => {
    const db = req.app.locals.db;
    db.get('SELECT MAX(bib_number) AS max_bib FROM athletes', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        const nextBib = (row.max_bib || 100) + 1;
        res.json({ next_bib: nextBib });
    });
})

module.exports = router;