function openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function bindModalTriggers() {
    let openButtons = document.querySelectorAll('[data-open-modal]');
    for (let i = 0; i < openButtons.length; i++) {
        openButtons[i].addEventListener('click', function () {
            let needsAuth = this.getAttribute('data-requires-auth') === 'true';
            if (needsAuth && !requireAuth()) {
                return;
            }
            let modalId = this.getAttribute('data-open-modal');
            openModal(modalId);
        });
    }

    let closeButtons = document.querySelectorAll('[data-close-modal]');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', function () {
            let modalId = this.getAttribute('data-close-modal');
            closeModal(modalId);
        });
    }
}
