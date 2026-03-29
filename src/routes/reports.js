const express = require('express');
const router = express.Router();

router.get('/event_awards', (req, res) => {
    const db = req.app.locals.db;
    const { level_id, division, top = 3 } = req.query;

    if (!['mens', 'womens'].includes(division)) {
        return res.status(400).json({ error: 'division must be "mens" or "womens"' });
    }

    if (!level_id) {
        return res.status(400).json({ error: 'level_id is required' });
    }

    const topN = parseInt(top);
    if (isNaN(topN) || topN < 1) {
        return res.status(400).json({ error: 'top must be a positive number' });
    }

    // Query for individual event awards
    const eventQuery = `
        WITH ranked_scores AS (
            SELECT 
                e.name as event_name,
                e.order_num,
                a.first_name || ' ' || a.last_name as athlete_name,
                a.bib_number,
                t.name as team_name,
                AVG(s.score) as final_score,
                ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY AVG(s.score) DESC) as place
            FROM scores s
            JOIN athletes a ON s.athlete_id = a.id
            JOIN events e ON s.event_id = e.id
            LEFT JOIN teams t ON a.team_id = t.id
            WHERE a.level_id = ? 
              AND e.division = ?
              AND s.scratched = 0
            GROUP BY a.id, e.id
        )
        SELECT *
        FROM ranked_scores
        WHERE place <= ?
        ORDER BY order_num, place
    `;

    // Query for all-around scores
    const allAroundQuery = `
        WITH athlete_scores AS (
            SELECT 
                a.id as athlete_id,
                a.first_name || ' ' || a.last_name as athlete_name,
                a.bib_number,
                t.name as team_name,
                e.id as event_id,
                AVG(s.score) as event_score
            FROM scores s
            JOIN athletes a ON s.athlete_id = a.id
            JOIN events e ON s.event_id = e.id
            LEFT JOIN teams t ON a.team_id = t.id
            WHERE a.level_id = ? 
            AND e.division = ?
            AND s.scratched = 0
            GROUP BY a.id, e.id
        ),
        all_around AS (
            SELECT 
                athlete_id,
                athlete_name,
                bib_number,
                team_name,
                SUM(event_score) as all_around_score,
                COUNT(DISTINCT event_id) as events_competed
            FROM athlete_scores
            GROUP BY athlete_id
        )
        SELECT 
            *,
            ROW_NUMBER() OVER (ORDER BY all_around_score DESC) as place
        FROM all_around
        ORDER BY all_around_score DESC
        LIMIT ?
    `;


    db.all(eventQuery, [level_id, division, topN], (err, eventRows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(allAroundQuery, [level_id, division, topN], (err, allAroundRows) => {
            if (err) return res.status(500).json({ error: err.message });

            db.get('SELECT name FROM levels WHERE id = ?', [level_id], (err, levelRow) => {
                if (err) return res.status(500).json({ error: err.message });

                const level_name = levelRow.name;

                // Group event results
                const eventGroups = {};
                eventRows.forEach(row => {
                    if (!eventGroups[row.event_name]) {
                        eventGroups[row.event_name] = [];
                    }
                    eventGroups[row.event_name].push(row);
                });

                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial; padding: 40px; }
                            h1 { text-align: center; color: #333; }
                            h2 { border-bottom: 2px solid #007bff; margin-top: 30px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th { background-color: #007bff; color: white; padding: 8px; text-align: left; }
                            td { padding: 8px; border-bottom: 1px solid #ddd; }
                            tr:nth-child(even) { background-color: #f8f9fa; }
                            .place { font-weight: bold; }
                            .score { color: #28a745; }
                            @media print {
                                h2 { page-break-before: always; }
                                h2:first-of-type { page-break-before: avoid; }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Awards - ${division === 'womens' ? "Women's" : "Men's"} - ${level_name}</h1>
                        ${Object.entries(eventGroups).map(([event, athletes]) => `
                            <h2>${event}</h2>
                            <table>
                                <thead>
                                    <tr><th>Place</th><th>Name</th><th>Team</th><th>Score</th></tr>
                                </thead>
                                <tbody>
                                    ${athletes.map(a => `
                                        <tr>
                                            <td class="place">${a.place}${getOrdinal(a.place)}</td>
                                            <td>${a.athlete_name}</td>
                                            <td>${a.team_name ?? '-'}</td>
                                            <td class="score">${a.final_score.toFixed(3)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `).join('')}

                        <div class="page-break"></div>

                        ${allAroundRows.length > 0 ? `
                            <h2>All-Around</h2>
                            <table>
                                <thead>
                                    <tr><th>Place</th><th>Name</th><th>Team</th><th>Score</th></tr>
                                </thead>
                                <tbody>
                                    ${allAroundRows.map(a => `
                                        <tr>
                                            <td class="place">${a.place}${getOrdinal(a.place)}</td>
                                            <td>${a.athlete_name}</td>
                                            <td>${a.team_name ?? '-'}</td>
                                            <td class="score">${a.all_around_score.toFixed(3)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : ''}
                    </body>
                    </html>
                `;
                res.send(html);
            });
        });
    });
})

router.get('/team_awards', (req, res) => {
    const db = req.app.locals.db;
    const { level_id, division, top = 3, counting = 3 } = req.query;

    if (!['mens', 'womens'].includes(division)) {
        return res.status(400).json({ error: 'division must be "mens" or "womens"' });
    }

    if (!level_id) {
        return res.status(400).json({ error: 'level_id is required' });
    }

    const topN = parseInt(top);
    if (isNaN(topN) || topN < 1) {
        return res.status(400).json({ error: 'top must be a positive number' });
    }

    const countingN = parseInt(counting);
    if (isNaN(countingN) || countingN < 1) {
        return res.status(400).json({ error: 'counting must be a positive number' });
    }

    // Query for team scores - only top N athletes per event count
    const teamQuery = `
        WITH athlete_event_scores AS (
            SELECT 
                a.team_id,
                a.id as athlete_id,
                e.id as event_id,
                e.name as event_name,
                e.order_num,
                AVG(s.score) as athlete_event_score,
                ROW_NUMBER() OVER (PARTITION BY a.team_id, e.id ORDER BY AVG(s.score) DESC) as rank_in_team
            FROM scores s
            JOIN athletes a ON s.athlete_id = a.id
            JOIN events e ON s.event_id = e.id
            WHERE a.level_id = ? 
              AND e.division = ?
              AND a.team_id IS NOT NULL
              AND s.scratched = 0
            GROUP BY a.id, e.id
        ),
        counting_scores AS (
            SELECT 
                team_id,
                event_id,
                event_name,
                order_num,
                athlete_event_score
            FROM athlete_event_scores
            WHERE rank_in_team <= ?
        ),
        team_event_scores AS (
            SELECT 
                team_id,
                event_id,
                event_name,
                order_num,
                SUM(athlete_event_score) as team_event_total,
                COUNT(*) as athletes_counted
            FROM counting_scores
            GROUP BY team_id, event_id
        ),
        team_totals AS (
            SELECT 
                t.id as team_id,
                t.name as team_name,
                SUM(tes.team_event_total) as team_total_score,
                COUNT(DISTINCT tes.event_id) as events_competed
            FROM teams t
            JOIN team_event_scores tes ON t.id = tes.team_id
            GROUP BY t.id
        )
        SELECT 
            team_name,
            team_total_score,
            events_competed,
            ROW_NUMBER() OVER (ORDER BY team_total_score DESC) as place
        FROM team_totals
        ORDER BY team_total_score DESC
        LIMIT ?
    `;

    // Query for team breakdown - show all athletes but mark which ones count
    const teamBreakdownQuery = `
        WITH athlete_event_scores AS (
            SELECT 
                a.team_id,
                t.name as team_name,
                a.id as athlete_id,
                a.first_name || ' ' || a.last_name as athlete_name,
                e.id as event_id,
                e.name as event_name,
                e.order_num,
                AVG(s.score) as athlete_event_score,
                ROW_NUMBER() OVER (PARTITION BY a.team_id, e.id ORDER BY AVG(s.score) DESC) as rank_in_team
            FROM scores s
            JOIN athletes a ON s.athlete_id = a.id
            JOIN events e ON s.event_id = e.id
            JOIN teams t ON a.team_id = t.id
            WHERE a.level_id = ? 
              AND e.division = ?
              AND s.scratched = 0
            GROUP BY a.id, e.id
        )
        SELECT 
            team_name,
            event_name,
            order_num,
            athlete_name,
            athlete_event_score,
            rank_in_team,
            CASE WHEN rank_in_team <= ? THEN 1 ELSE 0 END as counts
        FROM athlete_event_scores
        ORDER BY team_name, order_num, athlete_event_score DESC
    `;

    db.all(teamQuery, [level_id, division, countingN, topN], (err, teamRows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(teamBreakdownQuery, [level_id, division, countingN], (err, breakdownRows) => {
            if (err) return res.status(500).json({ error: err.message });

            db.get('SELECT name FROM levels WHERE id = ?', [level_id], (err, levelRow) => {
                if (err) return res.status(500).json({ error: err.message });

                const level_name = levelRow.name;

                // Group breakdown by team and event
                const teamBreakdown = {};
                breakdownRows.forEach(row => {
                    if (!teamBreakdown[row.team_name]) {
                        teamBreakdown[row.team_name] = {};
                    }
                    if (!teamBreakdown[row.team_name][row.event_name]) {
                        teamBreakdown[row.team_name][row.event_name] = [];
                    }
                    teamBreakdown[row.team_name][row.event_name].push(row);
                });

                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial; padding: 40px; }
                            h1 { text-align: center; color: #333; }
                            h2 { border-bottom: 2px solid #007bff; margin-top: 30px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th { background-color: #007bff; color: white; padding: 8px; text-align: left; }
                            td { padding: 8px; border-bottom: 1px solid #ddd; }
                            tr:nth-child(even) { background-color: #f8f9fa; }
                            .place { font-weight: bold; }
                            .score { color: #28a745; }
                            @media print {
                                h2 { page-break-before: always; }
                                h2:first-of-type { page-break-before: avoid; }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Team Awards - ${division === 'womens' ? "Women's" : "Men's"} - ${level_name}</h1>
                        <p class="note">Top ${countingN} scores per event count toward team total</p>
                        
                        <h2>Team Standings</h2>
                        <table>
                            <thead>
                                <tr><th>Place</th><th>Team</th><th>Score</th></tr>
                            </thead>
                            <tbody>
                                ${teamRows.map(team => `
                                    <tr>
                                        <td class="place">${team.place}${getOrdinal(team.place)}</td>
                                        <td>${team.team_name}</td>
                                        <td class="score">${team.team_total_score.toFixed(3)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="page-break"></div>
                        
                        <h2 style="margin-top: 40px;">Team Score Breakdown</h2>
                        <p class="note"><strong>Bold</strong> scores count toward team total, <em>italic</em> scores do not count</p>
                        ${Object.entries(teamBreakdown).map(([teamName, events]) => `
                            <div class="team-section">
                                <h3>${teamName}</h3>
                                ${Object.entries(events).map(([eventName, athletes]) => `
                                    <div class="breakdown">
                                        <strong>${eventName}:</strong><br>
                                        ${athletes.map(a => `
                                            <span class="${a.counts ? 'counting' : 'non-counting'}">
                                                ${a.athlete_name} (${a.athlete_event_score.toFixed(3)})
                                            </span>
                                        `).join(', ')}
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </body>
                    </html>
                `;
                res.send(html);
            });
        });
    });
});

router.get('/meet_roster', (req, res) => {
    const db = req.app.locals.db;
    const { group_by, division } = req.query;

    if (!['team', 'level', 'division'].includes(group_by)) {
        return res.status(400).json({ error: 'group_by must be team, level, or division' });
    }

    if (!['mens', 'womens', 'all'].includes(division)) {
        return res.status(400).json({ error: 'division must be mens, womens, or all' });
    }

    const divisionFilter = division !== 'all' ? 'WHERE a.division = ?' : '';
    const params = division !== 'all' ? [division] : [];

    const orderCol = group_by === 'team' ? 't.name' : group_by === 'level' ? 'l.name' : 'a.division';

    const query = `
        SELECT
            a.first_name || ' ' || a.last_name as athlete_name,
            a.bib_number,
            a.division,
            t.name as team_name,
            l.name as level_name
        FROM athletes a
        LEFT JOIN teams t ON a.team_id = t.id
        LEFT JOIN levels l ON a.level_id = l.id
        ${divisionFilter}
        ORDER BY ${orderCol}, a.first_name
    `;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const groups = {};
        rows.forEach(row => {
            let key;
            if (group_by === 'team') key = row.team_name || 'No Team';
            else if (group_by === 'level') key = row.level_name || 'No Level';
            else key = row.division === 'womens' ? "Women's" : "Men's";

            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
        });

        const divisionLabel = division === 'all' ? 'All' : division === 'womens' ? "Women's" : "Men's";
        const groupLabel = group_by.charAt(0).toUpperCase() + group_by.slice(1);

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial; padding: 40px; }
                    h1 { text-align: center; color: #333; }
                    h2 { border-bottom: 2px solid #007bff; margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background-color: #007bff; color: white; padding: 8px; text-align: left; }
                    td { padding: 8px; border-bottom: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f8f9fa; }
                    @media print {
                        h2 { page-break-before: always; }
                        h2:first-of-type { page-break-before: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1>Athlete Roster - ${divisionLabel} - By ${groupLabel}</h1>
                ${Object.entries(groups).map(([groupName, athletes]) => `
                    <h2>${groupName}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Bib</th>
                                <th>Name</th>
                                <th>Level</th>
                                <th>Division</th>
                                <th>Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${athletes.map(a => `
                                <tr>
                                    <td>${a.bib_number ?? '-'}</td>
                                    <td>${a.athlete_name}</td>
                                    <td>${a.level_name ?? '-'}</td>
                                    <td>${a.division === 'womens' ? "Women's" : "Men's"}</td>
                                    <td>${a.team_name ?? '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `).join('')}
            </body>
            </html>
        `;
        res.send(html);
    });
});

function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
}

module.exports = router;