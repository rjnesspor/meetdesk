const Utils = {
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: 'bi-check-circle', danger: 'bi-exclamation-circle', info: 'bi-info-circle' };
        toast.innerHTML = `<i class="bi ${icons[type] ?? 'bi-info-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}