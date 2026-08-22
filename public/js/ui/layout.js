function buildHeader() {
    let header = document.createElement('header');
    header.classList.add('header');

    let inner = document.createElement('div');
    inner.classList.add('container', 'header-inner');

    let brand = document.createElement('a');
    brand.href = '/index.html';
    brand.classList.add('brand');

    let brandIcon = document.createElement('div');
    brandIcon.classList.add('brand-icon');
    brandIcon.textContent = '🐉';

    let brandInfo = document.createElement('div');
    brandInfo.classList.add('brand-info');

    let brandTitle = document.createElement('div');
    brandTitle.classList.add('brand-title');

    let brandTitleSpan = document.createElement('span');
    brandTitleSpan.textContent = 'Hub';

    let brandPill = document.createElement('span');
    brandPill.classList.add('brand-pill');
    brandPill.textContent = 'DREXEL UNIVERSITY';

    brandTitle.append(document.createTextNode('Dragon '));
    brandTitle.append(brandTitleSpan);
    brandTitle.append(document.createTextNode(' '));
    brandTitle.append(brandPill);

    let brandSub = document.createElement('div');
    brandSub.classList.add('brand-sub');
    brandSub.textContent = 'University City Verified Campus Network';

    brandInfo.append(brandTitle);
    brandInfo.append(brandSub);
    brand.append(brandIcon);
    brand.append(brandInfo);

    let searchBox = document.createElement('div');
    searchBox.classList.add('header-search');

    let searchIcon = document.createElement('span');
    searchIcon.classList.add('header-search-icon');
    searchIcon.textContent = '🔍';

    let searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'global-search-input';
    searchInput.placeholder = 'Search posts, food trucks, marketplace...';

    searchBox.append(searchIcon);
    searchBox.append(searchInput);

    let controls = document.createElement('div');
    controls.classList.add('header-controls');

    let weatherPill = document.createElement('div');
    weatherPill.classList.add('stat-pill', 'pill-weather');
    let weatherIcon = document.createElement('span');
    weatherIcon.textContent = '☀️';
    let weatherTemp = document.createElement('span');
    weatherTemp.classList.add('weather-temp');
    weatherTemp.textContent = '74°F';
    weatherPill.append(weatherIcon);
    weatherPill.append(weatherTemp);

    let verifiedPill = document.createElement('div');
    verifiedPill.classList.add('stat-pill', 'pill-verified');
    let verifiedIcon = document.createElement('span');
    verifiedIcon.textContent = '🛡️';
    let verifiedText = document.createElement('span');
    verifiedText.textContent = 'Verified Dragon';
    verifiedPill.append(verifiedIcon);
    verifiedPill.append(verifiedText);

    let pointsPill = document.createElement('div');
    pointsPill.classList.add('stat-pill', 'pill-points');
    let pointsIcon = document.createElement('span');
    pointsIcon.textContent = '⚡';
    let pointsText = document.createElement('span');
    pointsText.classList.add('header-user-points');
    pointsText.textContent = '240 pts';
    pointsPill.append(pointsIcon);
    pointsPill.append(pointsText);

    let streakPill = document.createElement('div');
    streakPill.classList.add('stat-pill', 'pill-streak');
    let streakIcon = document.createElement('span');
    streakIcon.textContent = '🔥';
    let streakText = document.createElement('span');
    streakText.classList.add('header-user-streak');
    streakText.textContent = '5d';
    streakPill.append(streakIcon);
    streakPill.append(streakText);

    let notifLink = document.createElement('a');
    notifLink.href = '/notifications.html';
    notifLink.classList.add('btn-icon');
    notifLink.title = 'Notifications';
    let notifIcon = document.createElement('span');
    notifIcon.textContent = '🔔';
    let notifBadge = document.createElement('span');
    notifBadge.classList.add('badge-count', 'notif-badge-count');
    notifBadge.textContent = '2';
    notifLink.append(notifIcon);
    notifLink.append(notifBadge);

    let userWidget = document.createElement('div');
    userWidget.classList.add('user-badge-widget');

    let userProfileLink = document.createElement('a');
    userProfileLink.href = '/profile.html';
    userProfileLink.classList.add('user-badge-profile');
    userProfileLink.title = 'View Profile';

    let userAvatar = document.createElement('img');
    userAvatar.classList.add('avatar-sm', 'header-user-avatar');
    userAvatar.src = '/assets/test_profile1.png';
    userAvatar.alt = 'Avatar';

    let userText = document.createElement('div');
    userText.classList.add('user-badge-text');

    let userName = document.createElement('span');
    userName.classList.add('user-badge-name', 'header-user-name');
    userName.textContent = 'Alex Vance';

    let userMajor = document.createElement('span');
    userMajor.classList.add('user-badge-major', 'header-user-major');
    userMajor.textContent = "CS (CCI) '27";

    userText.append(userName);
    userText.append(userMajor);
    userProfileLink.append(userAvatar);
    userProfileLink.append(userText);

    let switchLink = document.createElement('a');
    switchLink.href = '/login.html';
    switchLink.classList.add('btn-user-switch');
    switchLink.title = 'Sign Out / Switch Dragon Account';
    let switchIcon = document.createElement('span');
    switchIcon.textContent = '🔄';
    switchLink.append(switchIcon);

    userWidget.append(userProfileLink);
    userWidget.append(switchLink);

    controls.append(weatherPill);
    controls.append(verifiedPill);
    controls.append(pointsPill);
    controls.append(streakPill);
    controls.append(notifLink);
    controls.append(userWidget);

    inner.append(brand);
    inner.append(searchBox);
    inner.append(controls);
    header.append(inner);

    return header;
}

function buildNav() {
    let nav = document.createElement('nav');
    nav.classList.add('nav-bar');

    let container = document.createElement('div');
    container.classList.add('container');

    let tabsBox = document.createElement('div');
    tabsBox.classList.add('nav-tabs');

    let tabs = [
        { href: '/feed.html', page: 'feed.html', icon: '💬', label: 'Campus Feed & Voices', badge: 'LIVE', badgeClass: 'badge-live' },
        { href: '/discover.html', page: 'discover.html', icon: '🍴', label: 'Discover Eats & Trucks', badge: 'HOT', badgeClass: 'badge-hot' },
        { href: '/marketplace.html', page: 'marketplace.html', icon: '🛍️', label: 'Dragon Marketplace' },
        { href: '/map.html', page: 'map.html', icon: '🗺️', label: 'Campus Map & Spots' },
        { href: '/polls.html', page: 'polls.html', icon: '📊', label: 'Campus Polls' },
        { href: '/achievements.html', page: 'achievements.html', icon: '🏆', label: 'DREAMER Achievements' }
    ];

    for (let i = 0; i < tabs.length; i++) {
        let tabInfo = tabs[i];

        let tab = document.createElement('a');
        tab.href = tabInfo.href;
        tab.classList.add('nav-tab');
        tab.setAttribute('data-nav-page', tabInfo.page);

        let tabIcon = document.createElement('span');
        tabIcon.textContent = tabInfo.icon;

        let tabLabel = document.createElement('span');
        tabLabel.textContent = tabInfo.label;

        tab.append(tabIcon);
        tab.append(tabLabel);

        if (tabInfo.badge) {
            let badge = document.createElement('span');
            badge.classList.add('tab-badge', tabInfo.badgeClass);
            badge.textContent = tabInfo.badge;
            tab.append(badge);
        }

        tabsBox.append(tab);
    }

    container.append(tabsBox);
    nav.append(container);

    return nav;
}

function markActiveNavTab() {
    let currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let navTabs = document.querySelectorAll('.nav-tab');
    for (let i = 0; i < navTabs.length; i++) {
        let tabPage = navTabs[i].getAttribute('data-nav-page');
        if (tabPage === currentPage) {
            navTabs[i].classList.add('active');
        }
    }
}

function renderLayout() {
    let headerTarget = document.getElementById('site-header');
    let navTarget = document.getElementById('site-nav');

    if (headerTarget) {
        headerTarget.append(buildHeader());
    }
    if (navTarget) {
        navTarget.append(buildNav());
    }

    markActiveNavTab();
}
