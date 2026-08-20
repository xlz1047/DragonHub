document.addEventListener('DOMContentLoaded', function () {
    loadPage();
});

function loadPage() {
    renderLayout();
    bindModalTriggers();
    bindHeaderSearch();
    bindNotificationsMarkRead();
    loadHeaderUser();
    loadWeather();
    loadNotifications();

    if (document.getElementById('posts-container')) {
        loadFeed();
        bindPostEvents();
    }

    if (document.getElementById('polls-list')) {
        renderPollsList();
        bindPollEvents();
    }

    if (document.getElementById('trucks-grid')) {
        loadVendors();
        bindEatsEvents();
    }

    if (document.getElementById('marketplace-grid')) {
        loadMarketplace();
        bindMarketplaceEvents();
    }

    if (document.getElementById('campus-map')) {
        initLeafletMap();
        loadLandmarks();
        bindMapEvents();
    }

    if (document.getElementById('badges-grid')) {
        loadBadges();
    }

    if (document.getElementById('profile-name')) {
        loadProfile();
        bindProfileForm();
        bindSwitchAccountButtons();
    }
}
