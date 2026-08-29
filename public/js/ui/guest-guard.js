function isGuestMode() {
    return !currentUser || currentUser.isGuest === true;
}

function requireAuth() {
    if (isGuestMode()) {
        openModal('auth-required-modal');
        return false;
    }
    return true;
}
