const Events = {
    async load() {
        try {
            const response = await fetch(`${API_BASE}/api/events`);
            const events = await response.json();

            const womensEvents = events.filter(e => e.division === 'womens');
            const mensEvents = events.filter(e => e.division === 'mens');

            // Women's events
            const womensTbody = document.getElementById('womens-events-tbody');
            womensTbody.innerHTML = '';
            womensEvents
                .sort((a, b) => a.order_num - b.order_num)
                .forEach(event => {
                    const row = womensTbody.insertRow();
                    row.innerHTML = `
                            <td>${event.order_num}</td>
                            <td><strong>${event.name}</strong></td>
                        `;
                });

            // Men's events
            const mensTbody = document.getElementById('mens-events-tbody');
            mensTbody.innerHTML = '';
            mensEvents
                .sort((a, b) => a.order_num - b.order_num)
                .forEach(event => {
                    const row = mensTbody.insertRow();
                    row.innerHTML = `
                            <td>${event.order_num}</td>
                            <td><strong>${event.name}</strong></td>
                        `;
                });

            // Update score entry dropdown
            const scoreEventSelect = document.getElementById('score-event');
            if (scoreEventSelect) {
                scoreEventSelect.innerHTML = '<option value="">Select Event</option>';
                events.forEach(event => {
                    const option = document.createElement('option');
                    option.value = event.id;
                    option.textContent = `${event.name} (${event.division === 'womens' ? 'W' : 'M'})`;
                    scoreEventSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }
}