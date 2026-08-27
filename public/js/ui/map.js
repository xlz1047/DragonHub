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
        { name: 'Mario the Dragon Statue', lat: 39.955365042756405, lng: -75.18929057954269, desc: 'Iconic Drexel mascot bronze statue', type: 'spirit' },
        { name: 'W. W. Hagerty Library', lat: 39.9553003416246, lng: -75.18989048494781, desc: '24/7 Dragons Learning Commons', type: 'academic' },
        { name: 'CCI Building (3675 Market)', lat: 39.95670442264374, lng: -75.19530267272984, desc: 'Computing & Informatics hub', type: 'academic' },
        { name: 'Drexel Main Building', lat: 39.954306602678564, lng: -75.1868606039876, desc: 'Historic heart of Drexel University', type: 'academic' },
        { name: 'Lancaster Walk Food Trucks', lat: 339.95438694923685, lng: -75.18585942280245, desc: 'Cucina Zapata, Happy Sunshine & more', type: 'food' },
        { name: 'Daskalakis Athletic Center', lat: 39.956285875507675, lng: -75.19058541294427, desc: 'Recreation Center & Dragon Arena', type: 'rec' },
        { name: 'LeBow College of Business', lat: 39.95508732929374, lng: -75.18809168154772, desc: 'Home of Finance, Business, and MBA programs', type: 'academic' },
        { name: 'Nesbitt Hall', lat: 39.95590928562843, lng: -75.18901729879538, desc: 'Auditorium dedicated to Public Health and Biology lectures', type: 'academic' },
        { name: 'Papadakis Integrated Sciences Building', lat: 39.954229361116454, lng: -75.18929325117242, desc: 'Location for Labs and Research Opportunities', type: 'academic' },
        { name: 'Nanu\'s Hot Chicken', lat: 39.95666515968067, lng: -75.1892863426172, desc: 'Halal Hot Chicken Truck that Features Loaded Fries and Hot Tenders', type: 'food' },
        { name: 'KC\'s Smoothie Truck', lat: 39.95666515968067, lng: -75.1892863426169, desc: 'Popular Fruit Smoothie Joint on Campus', type: 'food' },
        { name: 'Kami Food Truck', lat: 39.95554469453332, lng: -75.1895888116436, desc: 'Truck that serves delicious Korean Food', type: 'food' },
        { name: 'Pete\'s Little Lunch Box', lat: 339.958125055589605, lng: -75.18927196165866, desc: 'Budget-friendly Breakfast and Lunch Truck', type: 'food' }
        
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

    let pendingMarker = null;
    mapInstance.on('click', function(e) {
        pendingMarker = e.latlng;
        openModal('modal-add-marker');
    });

    document.getElementById('modal-add-marker').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.getElementById('add-marker-to').addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        let locName = document.getElementById('marker-name').value;
        let locDesc = document.getElementById('marker-desc').value;
        if (pendingMarker){
            let newMarker = window.L.marker([pendingMarker.lat, pendingMarker.lng])
            .addTo(mapInstance);
            let popUpBox = document.createElement('div');
            let nameEl = document.createElement('strong');
            nameEl.textContent = locName;
            let descEl = document.createElement('p');
            descEl.textContent = locDesc;
            let deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️ Delete Pin';
            deleteBtn.style.color = 'red';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.background  = 'none';
            deleteBtn.style.border = 'none';
            deleteBtn.addEventListener('click', function(){
                mapInstance.removeLayer(newMarker);
                mapMarkers.filter(function(m){
                    return m!== newMarker;
                });
            });

            popUpBox.append(nameEl);
            popUpBox.append(descEl);
            popUpBox.append(deleteBtn);
            newMarker.bindPopup(popUpBox);
            newMarker.categoryType = 'user';
            mapMarkers.push(newMarker);
            pendingMarker = null;
            closeModal('modal-add-marker');
            this.reset();
        }
    });

    document.querySelector('[data-close-modal="modal-add-marker"]').addEventListener('click', function(e){
        e.stopPropagation();
        pendingMarker = null;
        closeModal('modal-add-marker');
    });
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
