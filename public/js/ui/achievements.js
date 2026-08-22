function loadBadges() {
    return apiGetBadges().then(function (badges) {
        allBadges = badges;
        renderBadges();
    }).catch(function (e) {
        console.error('Failed to load achievements:', e);
    });
}

function renderBadges() {
    let container = document.getElementById('badges-grid');
    if (!container) {
        return;
    }

    container.textContent = '';

    if (allBadges.length === 0) {
        let emptyCard = document.createElement('div');
        emptyCard.classList.add('card', 'achievements-empty');
        emptyCard.textContent = 'No badges available yet.';
        container.append(emptyCard);
        return;
    }

    for (let i = 0; i < allBadges.length; i++) {
        let badgeCard = buildBadgeElement(allBadges[i]);
        container.append(badgeCard);
    }
}

function buildBadgeElement(item) {
    let unlocked = !!item.unlocked;
    let badgeIcon = item.icon || (unlocked ? '🎖️' : '🔒');
    let pts = item.points || item.pts || 20;

    let card = document.createElement('div');
    card.classList.add('card', 'badge-card');
    if (unlocked) {
        card.classList.add('unlocked');
    }

    let topRow = document.createElement('div');
    topRow.classList.add('badge-card-top');

    let iconEl = document.createElement('span');
    iconEl.classList.add('badge-icon');
    iconEl.textContent = badgeIcon;

    let ptsTag = document.createElement('span');
    ptsTag.classList.add('badge-points-tag');
    if (unlocked) {
        ptsTag.classList.add('unlocked');
    }
    ptsTag.textContent = '+' + pts + ' Pts';

    topRow.append(iconEl);
    topRow.append(ptsTag);
    card.append(topRow);

    let titleEl = document.createElement('h4');
    titleEl.classList.add('badge-title');
    titleEl.textContent = item.title;
    card.append(titleEl);

    let descEl = document.createElement('p');
    descEl.classList.add('badge-desc');
    descEl.textContent = item.description || item.desc;
    card.append(descEl);

    let statusEl = document.createElement('div');
    statusEl.classList.add('badge-status');
    if (unlocked) {
        statusEl.classList.add('unlocked');
        statusEl.textContent = 'Unlocked';
    } else {
        statusEl.textContent = 'Locked - Complete task to earn';
    }
    card.append(statusEl);

    return card;
}
