const Levels = {
    async load() {
        try {
            const response = await fetch(`${API_BASE}/api/levels`);
            const levels = await response.json();

            const tbody = document.getElementById('levels-tbody');
            tbody.innerHTML = '';

            if (levels.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No levels entered yet</td></tr>';
                return;
            }
            levels.forEach(level => {
                const row = tbody.insertRow();
                row.innerHTML = `
                            <td>${level.name}</td>
                            <td class="table-actions">
                                <button class="btn btn-sm btn-danger" onclick="Levels.deleteLevel(${level.id}, '${level.name}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        `;
            })

        } catch (err) {
            console.error('Error loading levels:', err);
            document.getElementById('levels-tbody').innerHTML =
                '<tr><td colspan="7" class="text-center text-danger">Error loading levels</td></tr>';
        }
    },

    toggleAddLevelForm() {
        document.getElementById('add-level-form').classList.toggle('show');
        if (document.getElementById('add-level-form').classList.contains('show')) {
            document.getElementById('level-name').focus();
        } else {
            document.getElementById('level-name').value = '';
        }
    },

    async addLevel(event) {
        event.preventDefault();

        const level = {
            name: document.getElementById('level-name').value
        };

        try {
            const response = await fetch(`${API_BASE}/api/levels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(level)
            });

            if (response.ok) {
                Levels.toggleAddLevelForm();
                Levels.load();
                Utils.showToast('Level added successfully!', 'success');
            } else {
                const error = await response.text();
                Utils.showToast('Error adding level: ' + error, 'danger');
            }
        } catch (error) {
            console.error('Error adding level:', error);
            Utils.showToast('Network error', 'danger');
        }
    },


    async deleteLevel(id, name) {
        if (!confirm(`Delete level "${name}"? !! WARNING !! This will remove all athletes who are a part of this level!`)) return;

        try {
            const response = await fetch(`${API_BASE}/api/levels/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Levels.load();
                Utils.showToast('Level deleted', 'success');
            } else {
                Utils.showToast('Error deleting level', 'danger');
            }
        } catch (error) {
            console.error('Error deleting level:', error);
            Utils.showToast('Network error', 'danger');
        }
    }
}