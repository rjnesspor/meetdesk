const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.app.locals.db;
    db.all("SELECT * FROM teams", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    })
})

router.post('/', (req, res) => {
    const db = req.app.locals.db;
    const { name, code } = req.body;
    db.run("INSERT INTO teams (name, code) VALUES (?, ?)", [name, code], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, code });
    })
})

router.delete('/:id', (req, res) => {
    const db = req.app.locals.db;
    db.run("DELETE FROM teams WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    })
})

module.exports = router;