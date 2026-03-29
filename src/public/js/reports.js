const Reports = {
    async load() {
        try {
            const response = await fetch(`${API_BASE}/api/levels`);
            const levels = await response.json();

            // Update score entry dropdown
            const teamAwardsLevelSelect = document.getElementById('reports_teamawards_level_id');
            const eventAwardsLevelSelect = document.getElementById('reports_eventawards_level_id');

            teamAwardsLevelSelect.innerHTML = '<option value="">Select Level</option>';
            eventAwardsLevelSelect.innerHTML = '<option value="">Select Level</option>';

            levels.forEach(level => {
                let option = document.createElement('option');
                option.value = level.id;
                option.textContent = `${level.name}`;
                teamAwardsLevelSelect.appendChild(option);

                option = document.createElement('option');
                option.value = level.id;
                option.textContent = `${level.name}`;
                eventAwardsLevelSelect.appendChild(option);
            });



        } catch (error) {
            console.error('Error loading reports:', error);
        }

    }
}