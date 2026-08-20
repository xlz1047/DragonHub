function loadVendors() {
    return apiGetVendors().then(function (vendors) {
        allVendors = vendors;
        renderVendors();
    }).catch(function (e) {
        console.error('Failed to load vendors:', e);
    });
}

function renderVendors() {
    let container = document.getElementById('trucks-grid');
    if (!container) {
        return;
    }

    let vendors = allVendors;

    if (activeEatsCategory && activeEatsCategory !== 'All') {
        vendors = vendors.filter(function (v) {
            return v.cuisine && v.cuisine.toLowerCase().includes(activeEatsCategory.toLowerCase());
        });
    }

    if (globalSearchQuery) {
        vendors = vendors.filter(function (v) {
            return (v.name && v.name.toLowerCase().includes(globalSearchQuery)) ||
                (v.cuisine && v.cuisine.toLowerCase().includes(globalSearchQuery)) ||
                (v.location && v.location.toLowerCase().includes(globalSearchQuery));
        });
    }

    container.textContent = '';

    if (vendors.length === 0) {
        let emptyCard = document.createElement('div');
        emptyCard.classList.add('card', 'discover-empty');
        emptyCard.textContent = 'No eateries found matching your search.';
        container.append(emptyCard);
        return;
    }

    for (let i = 0; i < vendors.length; i++) {
        let truckCard = buildTruckElement(vendors[i]);
        container.append(truckCard);
    }
}

function buildTruckElement(v) {
    let rating = v.rating || 4.8;
    let reviewCount = v.reviewsCount || v.reviewCount || 100;
    let famousItem = v.famousItem || v.popularItem || 'House Special';
    let waitEstimate = v.waitEstimate || v.waitTime || '5-10m wait';

    let card = document.createElement('div');
    card.classList.add('truck-card');

    let imgWrapper = document.createElement('div');
    imgWrapper.classList.add('truck-img-wrapper');

    let imgEl = document.createElement('img');
    imgEl.classList.add('truck-img');
    imgEl.src = v.imageUrl;
    imgEl.alt = v.name;

    let ratingBadge = document.createElement('span');
    ratingBadge.classList.add('truck-badge');
    ratingBadge.textContent = '⭐ ' + rating + ' (' + reviewCount + '+)';

    imgWrapper.append(imgEl);
    imgWrapper.append(ratingBadge);
    card.append(imgWrapper);

    let body = document.createElement('div');
    body.classList.add('truck-body');

    let titleEl = document.createElement('h3');
    titleEl.classList.add('truck-title');
    titleEl.textContent = v.name;

    let cuisineEl = document.createElement('div');
    cuisineEl.classList.add('truck-cuisine');
    cuisineEl.textContent = v.cuisine + ' • 📍 ' + v.location;

    let famousItemEl = document.createElement('div');
    famousItemEl.classList.add('truck-famous-item');

    let famousLabel = document.createElement('strong');
    famousLabel.textContent = 'Must Try: ';
    famousItemEl.append(famousLabel);
    famousItemEl.append(document.createTextNode(famousItem));

    body.append(titleEl);
    body.append(cuisineEl);
    body.append(famousItemEl);

    let infoRow = document.createElement('div');
    infoRow.classList.add('truck-info-row');

    let waitTag = document.createElement('span');
    waitTag.classList.add('truck-wait-tag');
    waitTag.textContent = '🕒 ' + waitEstimate;

    let checkInBtn = document.createElement('button');
    checkInBtn.type = 'button';
    checkInBtn.classList.add('btn', 'btn-gold', 'truck-checkin-btn');
    checkInBtn.textContent = 'Check In (+25 Pts)';
    checkInBtn.addEventListener('click', function () {
        checkInTruck(v.id);
    });

    infoRow.append(waitTag);
    infoRow.append(checkInBtn);
    body.append(infoRow);

    card.append(body);

    return card;
}

function filterEatsCategory(cuisine, btnEl) {
    activeEatsCategory = cuisine;
    let btns = document.querySelectorAll('.cat-btn');
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    if (btnEl) {
        btnEl.classList.add('active');
    }
    renderVendors();
}

function checkInTruck(truckId) {
    apiCheckInVendor(truckId).then(function (res) {
        if (res) {
            alert('Checked in! +25 DREAMER points awarded to your Dragon Card!');
            loadHeaderUser();
        }
    }).catch(function (e) {
        console.error('Failed to check in:', e);
    });
}

function bindEatsEvents() {
    let cuisineButtons = document.querySelectorAll('.category-filter .cat-btn');
    for (let i = 0; i < cuisineButtons.length; i++) {
        cuisineButtons[i].addEventListener('click', function () {
            let cuisine = this.getAttribute('data-cuisine');
            filterEatsCategory(cuisine, this);
        });
    }
}
