const Athletes = {
    toggleAddAthleteForm() {
        const form = document.getElementById('add-athlete-form');
        form.classList.toggle('show');
        if (form.classList.contains('show')) {
            Athletes.loadTeamsDropdown();
            Athletes.loadLevelsDropdown();
            Athletes.updateBibNumber();
            document.getElementById('athlete-first').focus();
        } else {
            document.getElementById('add-athlete-form').querySelector('form').reset();
        }
    },

    async updateBibNumber() {
        if (document.getElementById('auto-bib').checked) {
            const nextBib = await Athletes.getNextBibNumber();
            document.getElementById('athlete-bib').value = nextBib;
        }
    },

    async getNextBibNumber() {
        try {
            const response = await fetch(`${API_BASE}/api/athletes/next-bib`);
            const data = await response.json();
            return data.next_bib;
        } catch (err) {
            console.error(err);
            return 1;
        }
    },

    async loadTeamsDropdown() {
        try {
            const response = await fetch(`${API_BASE}/api/teams`);
            const teams = await response.json();

            const select = document.getElementById('athlete-team');
            select.innerHTML = '<option value="">Select Team</option>';

            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading teams dropdown:', error);
        }
    },

    async loadLevelsDropdown() {
        try {
            const response = await fetch(`${API_BASE}/api/levels`);
            const levels = await response.json();

            const select = document.getElementById('athlete-level');
            select.innerHTML = '<option value="">Select Level</option>';

            levels.forEach(level => {
                const option = document.createElement('option');
                option.value = level.id;
                option.textContent = level.name;
                select.appendChild(option);
            })
        } catch (error) {
            console.error('Error loading levels dropdown:', error);
        }
    },

    updateTeamFilters(teams) {
        const select = document.getElementById('filter-team');
        select.innerHTML = '<option value="">All Teams</option>';

        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.name;
            select.appendChild(option);
        });
    },

    async load() {
        try {
            const response = await fetch(`${API_BASE}/api/athletes`);
            let athletes = await response.json();

            const resp = await fetch(`${API_BASE}/api/levels`);
            let levels = await resp.json();

            // Apply filters
            const divisionFilter = document.getElementById('filter-division')?.value;
            const teamFilter = document.getElementById('filter-team')?.value;

            if (divisionFilter) {
                athletes = athletes.filter(a => a.division === divisionFilter);
            }
            if (teamFilter) {
                athletes = athletes.filter(a => a.team_id == teamFilter);
            }

            const tbody = document.getElementById('athletes-tbody');
            tbody.innerHTML = '';

            if (athletes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No athletes found</td></tr>';
                return;
            }

            athletes.forEach(athlete => {
                const row = tbody.insertRow();
                const divisionBadge = athlete.division === 'womens'
                    ? '<span class="badge bg-danger">W</span>'
                    : '<span class="badge bg-info">M</span>';

                row.innerHTML = `
                        <td><strong>${athlete.bib_number}</strong></td>
                        <td>${athlete.first_name} ${athlete.last_name}</td>
                        <td>${athlete.team_name || '<span class="text-muted">-</span>'}</td>
                        <td>${divisionBadge}</td>
                        <td>${levels.find(level => level.id === athlete.level_id).name}</td>
                        <td>${athlete.session || '<span class="text-muted">-</span>'}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-danger" onclick="Athletes.deleteAthlete(${athlete.id}, '${athlete.first_name} ${athlete.last_name}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    `;
            });
        } catch (error) {
            console.error('Error loading athletes:', error);
            document.getElementById('athletes-tbody').innerHTML =
                '<tr><td colspan="7" class="text-center text-danger">Error loading athletes</td></tr>';
        }
    },

    async addAthlete(event) {
        event.preventDefault();

        const athlete = {
            bib_number: parseInt(document.getElementById('athlete-bib').value),
            first_name: document.getElementById('athlete-first').value,
            last_name: document.getElementById('athlete-last').value,
            team_id: document.getElementById('athlete-team').value || null,
            division: document.getElementById('athlete-division').value,
            level_id: parseInt(document.getElementById('athlete-level').value),
            session: document.getElementById('athlete-session').value || null
        };

        try {
            const response = await fetch(`${API_BASE}/api/athletes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(athlete)
            });

            if (response.ok) {
                Athletes.toggleAddAthleteForm();
                Athletes.load();
                Utils.showToast('Athlete added successfully!', 'success');
            } else {
                const error = await response.text();
                Utils.showToast('Error adding athlete: ' + error, 'danger');
            }
        } catch (error) {
            console.error('Error adding athlete:', error);
            Utils.showToast('Network error', 'danger');
        }
    },

    async deleteAthlete(id, name) {
        if (!confirm(`Delete athlete "${name}"?`)) return;

        try {
            const response = await fetch(`${API_BASE}/api/athletes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Athletes.load();
                Utils.showToast('Athlete deleted', 'success');
            } else {
                Utils.showToast('Error deleting athlete', 'danger');
            }
        } catch (error) {
            console.error('Error deleting athlete:', error);
            Utils.showToast('Network error', 'danger');
        }
    }
}