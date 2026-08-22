let mapInstance = null;
let mapMarkers = [];

function initLeafletMap() {
    let mapEl = document.getElementById('campus-map');
    if (!mapEl || !window.L || mapInstance) {
        return;
    }

    mapInstance = window.L.map(mapEl.id).setView([39.9566, -75.1899], 16);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    let locations = [
        { name: 'Mario the Dragon Statue', lat: 39.9547, lng: -75.1890, desc: 'Iconic Drexel mascot bronze statue', type: 'spirit' },
        { name: 'W. W. Hagerty Library', lat: 39.9557, lng: -75.1887, desc: '24/7 Dragons Learning Commons', type: 'academic' },
        { name: 'CCI Building (3675 Market)', lat: 39.9572, lng: -75.1950, desc: 'Computing & Informatics hub', type: 'academic' },
        { name: 'Drexel Main Building', lat: 39.9541, lng: -75.1882, desc: 'Historic heart of Drexel University', type: 'academic' },
        { name: 'Lancaster Walk Food Trucks', lat: 39.9550, lng: -75.1905, desc: 'Cucina Zapata, Happy Sunshine & more', type: 'food' },
        { name: 'LeBow College of Business', lat: 39.9546, lng: -75.1878, desc: 'Finance & Analytics Center', type: 'academic' },
        { name: 'Daskalakis Athletic Center', lat: 39.9560, lng: -75.1908, desc: 'Recreation Center & Dragon Arena', type: 'rec' }
    ];

    mapMarkers = [];
    for (let i = 0; i < locations.length; i++) {
        let loc = locations[i];
        let popupText = '<strong>' + loc.name + '</strong><br><span>' + loc.desc + '</span>';
        let marker = window.L.marker([loc.lat, loc.lng])
            .addTo(mapInstance)
            .bindPopup(popupText);
        marker.categoryType = loc.type;
        mapMarkers.push(marker);
    }
}

function filterMapMarkers(type) {
    if (!mapInstance) {
        return;
    }
    for (let i = 0; i < mapMarkers.length; i++) {
        let m = mapMarkers[i];
        if (type === 'all' || m.categoryType === type) {
            if (!mapInstance.hasLayer(m)) {
                mapInstance.addLayer(m);
            }
        } else {
            if (mapInstance.hasLayer(m)) {
                mapInstance.removeLayer(m);
            }
        }
    }
}

function loadLandmarks() {
    return apiGetLandmarks().then(function (landmarks) {
        allLandmarks = landmarks;
        renderLandmarks();
    }).catch(function (e) {
        console.error('Failed to load landmarks:', e);
    });
}

function renderLandmarks() {
    let container = document.getElementById('landmarks-container');
    if (!container) {
        return;
    }

    let landmarks = allLandmarks;

    if (globalSearchQuery) {
        landmarks = landmarks.filter(function (l) {
            return (l.name && l.name.toLowerCase().includes(globalSearchQuery)) ||
                (l.description && l.description.toLowerCase().includes(globalSearchQuery)) ||
                (l.address && l.address.toLowerCase().includes(globalSearchQuery));
        });
    }

    container.textContent = '';

    if (landmarks.length === 0) {
        let emptyCard = document.createElement('div');
        emptyCard.classList.add('card', 'map-empty');
        emptyCard.textContent = 'No campus spots found.';
        container.append(emptyCard);
        return;
    }

    for (let i = 0; i < landmarks.length; i++) {
        let landmarkRow = buildLandmarkElement(landmarks[i]);
        container.append(landmarkRow);
    }
}

function buildLandmarkElement(lm) {
    let pts = lm.pointsForCheckIn || lm.pointsReward || 25;

    let row = document.createElement('div');
    row.classList.add('card', 'landmark-card-row');

    let info = document.createElement('div');
    info.classList.add('landmark-info');

    let thumb = document.createElement('img');
    thumb.classList.add('landmark-thumb');
    thumb.src = lm.imageUrl;
    thumb.alt = lm.name;

    let textBox = document.createElement('div');

    let nameEl = document.createElement('div');
    nameEl.classList.add('landmark-name');
    nameEl.textContent = lm.name;

    let addressEl = document.createElement('div');
    addressEl.classList.add('landmark-address');
    addressEl.textContent = lm.address || lm.description;

    textBox.append(nameEl);
    textBox.append(addressEl);
    info.append(thumb);
    info.append(textBox);

    let checkInBtn = document.createElement('button');
    checkInBtn.type = 'button';
    checkInBtn.classList.add('btn', 'btn-gold', 'landmark-checkin-btn');
    checkInBtn.textContent = 'Check In (+' + pts + ' Pts)';
    checkInBtn.addEventListener('click', function () {
        checkInLandmark(lm.id);
    });

    row.append(info);
    row.append(checkInBtn);

    return row;
}

function checkInLandmark(lmId) {
    apiCheckInLandmark(lmId).then(function (data) {
        if (data) {
            alert('Checked in at campus location! +25 DREAMER Points awarded!');
            loadHeaderUser();
        }
    }).catch(function (e) {
        console.error('Failed to check in at landmark:', e);
    });
}

function bindMapEvents() {
    let mapFilterButtons = document.querySelectorAll('[data-map-filter]');
    for (let i = 0; i < mapFilterButtons.length; i++) {
        mapFilterButtons[i].addEventListener('click', function () {
            let filterType = this.getAttribute('data-map-filter');
            filterMapMarkers(filterType);
        });
    }
}
