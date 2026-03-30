const Utils = {
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: 'bi-check-circle', danger: 'bi-exclamation-circle', info: 'bi-info-circle' };
        toast.innerHTML = `<i class="bi ${icons[type] ?? 'bi-info-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    Modal: {
        show(opts = {}) {
            const existing = document.getElementById('md-modal-overlay');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'md-modal-overlay';
            overlay.innerHTML = `
            <div id="md-modal">
                <div id="md-modal-title">${opts.title ?? 'Notice'}</div>
                <div id="md-modal-body">${opts.body ?? ''}</div>
                <div id="md-modal-footer">
                    ${opts.link ? `<a href="${opts.link.url}" target="_blank" class="btn btn-primary">${opts.link.label}</a>` : ''}
                    <button class="btn btn-ghost" onclick="Utils.Modal.hide()">Dismiss</button>
                </div>
            </div>
        `;
            overlay.addEventListener('click', e => { if (e.target === overlay) Utils.Modal.hide(); });
            document.body.appendChild(overlay);
        },

        hide() {
            document.getElementById('md-modal-overlay')?.remove();
        }
    }
}
