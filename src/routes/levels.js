const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.app.locals.db;
    db.all("SELECT * FROM levels", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    })
})

router.post('/', (req, res) => {
    const db = req.app.locals.db;
    const { name } = req.body;
    db.run("INSERT INTO levels (name) VALUES (?)", [name], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    })
})

router.delete('/:id', (req, res) => {
    const db = req.app.locals.db;
    db.run("DELETE FROM levels WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    })
})

module.exports = router;