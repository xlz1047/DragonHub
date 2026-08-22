function loadHeaderUser() {
    return apiGetCurrentUser().then(function (user) {
        if (user && user.id) {
            currentUser = user;
            updateHeaderDisplay();
        }
    }).catch(function (e) {
        console.error('Failed to load user:', e);
    });
}

function loadWeather() {
    return apiGetWeather().then(function (weather) {
        if (weather && weather.temp) {
            let weatherEls = document.querySelectorAll('.weather-temp');
            for (let i = 0; i < weatherEls.length; i++) {
                weatherEls[i].textContent = weather.temp;
            }
        }
    }).catch(function (e) {
        console.error('Failed to load weather:', e);
    });
}

function updateHeaderDisplay() {
    if (!currentUser) {
        return;
    }

    let pointsEls = document.querySelectorAll('.header-user-points');
    for (let i = 0; i < pointsEls.length; i++) {
        pointsEls[i].textContent = currentUser.totalPoints + ' pts';
    }

    let streakEls = document.querySelectorAll('.header-user-streak');
    for (let i = 0; i < streakEls.length; i++) {
        streakEls[i].textContent = (currentUser.streak || 5) + 'd';
    }

    let nameEls = document.querySelectorAll('.header-user-name');
    for (let i = 0; i < nameEls.length; i++) {
        nameEls[i].textContent = currentUser.name;
    }

    let majorEls = document.querySelectorAll('.header-user-major');
    for (let i = 0; i < majorEls.length; i++) {
        if (currentUser.classYear) {
            majorEls[i].textContent = currentUser.major + " '" + currentUser.classYear.slice(-2);
        } else {
            majorEls[i].textContent = currentUser.major || 'CS (CCI)';
        }
    }

    let avatarEls = document.querySelectorAll('.header-user-avatar');
    for (let i = 0; i < avatarEls.length; i++) {
        avatarEls[i].src = currentUser.avatarUrl;
    }
}

function handleGlobalSearch(query) {
    globalSearchQuery = query.toLowerCase().trim();
    if (document.getElementById('posts-container')) {
        renderPosts();
    }
    if (document.getElementById('trucks-grid')) {
        renderVendors();
    }
    if (document.getElementById('marketplace-grid')) {
        renderMarketplace();
    }
}

function bindHeaderSearch() {
    let searchInput = document.getElementById('global-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            handleGlobalSearch(searchInput.value);
        });
    }
}
