const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { MEETFILE_NAME } = require('../db/database');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: './' });

router.get('/save', (req, res) => {
    res.download(`./${MEETFILE_NAME}`, `${MEETFILE_NAME}`);
});

router.post('/load', upload.single('db'), async (req, res) => {

    fs.copyFileSync(req.file.path, './temp.meet');
    fs.unlinkSync(req.file.path);

    const tempDb = new sqlite3.Database('./temp.meet', (err) => {
        tempDb.get('PRAGMA user_version', (err, row) => {
            if (row.user_version != req.app.locals.schema_version_int) {
                tempDb.close();
                fs.unlinkSync('./temp.meet');
                const major = Math.floor(row.user_version / 100);
                const minor = row.user_version % 100;
                return res.status(400).json({
                    error: `Version mismatch: file is v${major}.${minor}, server is on v${req.app.locals.schema_version.major}.${req.app.locals.schema_version.minor}`
                });
            }

            tempDb.close(() => {
                req.app.locals.db.close(() => {
                    fs.copyFileSync('./temp.meet', `./${MEETFILE_NAME}`);
                    fs.unlinkSync('./temp.meet');
                    req.app.locals.db = new sqlite3.Database(`./${MEETFILE_NAME}`, (err) => {
                        if (err) {
                            console.error('Error opening database: ', err);
                        } else {
                            console.log('New database loaded successfully');
                        }
                    })
                })
            })
        })
    })
})

module.exports = router;