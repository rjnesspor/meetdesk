const Scores = {
    async load() {
        try {
            const response = await fetch(`${API_BASE}/api/scores`);
            const scores = await response.json();

            const tbody = document.getElementById('scores-tbody');
            tbody.innerHTML = '';

            if (scores.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No scores entered yet</td></tr>';
                return;
            }

            scores.slice(0, 50).forEach(score => {
                const row = tbody.insertRow();
                const time = new Date(score.timestamp * 1000).toLocaleTimeString();

                row.innerHTML = `
                        <td><strong>${score.bib_number || '-'}</strong></td>
                        <td>${score.athlete_name || 'Unknown'}</td>
                        <td>${score.event_name || 'Unknown'}</td>
                        <td><span class="badge bg-success">${score.score.toFixed(3)}</span></td>
                        <td>J${score.judge_number}</td>
                        <td>${time}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-danger" onclick="Scores.deleteScore(${score.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    `;
            });

            Events.load();
        } catch (error) {
            console.error('Error loading scores:', error);
            document.getElementById('scores-tbody').innerHTML =
                '<tr><td colspan="7" class="text-center text-danger">Error loading scores</td></tr>';
        }
    },

    async addScore(event) {
        event.preventDefault();

        const score = {
            bib_number: parseInt(document.getElementById('score-athlete').value),
            event_id: parseInt(document.getElementById('score-event').value),
            score: parseFloat(document.getElementById('score-value').value),
            judge_number: parseInt(document.getElementById('score-judge').value)
        };

        try {
            const response = await fetch(`${API_BASE}/api/scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(score)
            });

            if (response.ok) {
                event.target.reset();
                Scores.load();
                Utils.showToast('Score added successfully!', 'success');
            } else {
                const error = await response.text();
                Utils.showToast('Error adding score: ' + error, 'danger');
            }
        } catch (error) {
            console.error('Error adding score:', error);
            Utils.showToast('Network error', 'danger');
        }
    },

    async deleteScore(id) {
        if (!confirm('Delete this score?')) return;

        try {
            const response = await fetch(`${API_BASE}/api/scores/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Scores.load();
                Utils.showToast('Score deleted', 'success');
            } else {
                Utils.showToast('Error deleting score', 'danger');
            }
        } catch (error) {
            console.error('Error deleting score:', error);
            Utils.showToast('Network error', 'danger');
        }
    }
}