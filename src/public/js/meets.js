const Meets = {
    async load() {
        document.getElementById('import-input').click();
    },

    async save() {
        window.location.href = `${API_BASE}/api/meets/save`
    }
}

document.getElementById('import-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('db', file);

    const response = await fetch(`${API_BASE}/api/meets/load`, {
        method: 'POST',
        body: formData
    });

    e.target.value = '';

    if (response.ok) {
        window.location.reload();
    } else {
        const status = await response.json();
        Utils.showToast(`${status.error}`, "danger");
    }
})