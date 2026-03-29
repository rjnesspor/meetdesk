const Teams = {
    toggleAddTeamForm() {
        document.getElementById('add-team-form').classList.toggle('show');
        if (document.getElementById('add-team-form').classList.contains('show')) {
            document.getElementById('team-name').focus();
        } else {
            document.getElementById('team-name').value = '';
            document.getElementById('team-code').value = '';
        }
    },

    async load() {
        try {
            const response = await fetch(`${API_BASE}/api/teams`);
            const teams = await response.json();

            const tbody = document.getElementById('teams-tbody');
            tbody.innerHTML = '';

            if (teams.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No teams added yet</td></tr>';
                return;
            }

            teams.forEach(team => {
                const row = tbody.insertRow();
                row.innerHTML = `
                        <td>${team.id}</td>
                        <td><strong>${team.name}</strong></td>
                        <td>${team.code || '<span class="text-muted">-</span>'}</td>
                        <td class="table-actions">
                            <button class="btn btn-sm btn-danger" onclick="Teams.deleteTeam(${team.id}, '${team.name}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </td>
                    `;
            });

            // Also update filter dropdowns
            Athletes.updateTeamFilters(teams);
        } catch (error) {
            console.error('Error loading teams:', error);
            document.getElementById('teams-tbody').innerHTML =
                '<tr><td colspan="4" class="text-center text-danger">Error loading teams</td></tr>';
        }
    },

    async addTeam(event) {
        event.preventDefault();

        const name = document.getElementById('team-name').value;
        const code = document.getElementById('team-code').value;

        try {
            const response = await fetch(`${API_BASE}/api/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, code })
            });

            if (response.ok) {
                Teams.toggleAddTeamForm();
                Teams.load();
                Utils.showToast('Team added successfully!', 'success');
            } else {
                const error = await response.text();
                Utils.showToast('Error adding team: ' + error, 'danger');
            }
        } catch (error) {
            console.error('Error adding team:', error);
            Utils.showToast('Network error', 'danger');
        }
    },

    async deleteTeam(id, name) {
        if (!confirm(`Delete team "${name}"? !! WARNING !! This will remove all athletes who are a part of this team!`)) return;

        try {
            const response = await fetch(`${API_BASE}/api/teams/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Teams.load();
                Utils.showToast('Team deleted', 'success');
            } else {
                Utils.showToast('Error deleting team', 'danger');
            }
        } catch (error) {
            console.error('Error deleting team:', error);
            Utils.showToast('Network error', 'danger');
        }
    }
}