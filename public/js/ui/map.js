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
        { name: 'Lancaster Walk Food Trucks', lat: 39.95438694923685, lng: -75.18585942280245, desc: 'Cucina Zapata, Happy Sunshine & more', type: 'food' },
        { name: 'Daskalakis Athletic Center', lat: 39.956285875507675, lng: -75.19058541294427, desc: 'Recreation Center & Dragon Arena', type: 'rec' },
        { name: 'LeBow College of Business', lat: 39.95508732929374, lng: -75.18809168154772, desc: 'Home of Finance, Business, and MBA programs', type: 'academic' },
        { name: 'Nesbitt Hall', lat: 39.95590928562843, lng: -75.18901729879538, desc: 'Auditorium dedicated to Public Health and Biology lectures', type: 'academic' },
        { name: 'Papadakis Integrated Sciences Building', lat: 39.954229361116454, lng: -75.18929325117242, desc: 'Location for labs and research opportunities', type: 'academic' },
        { name: "Nanu's Hot Chicken", lat: 39.9564, lng: -75.1893, desc: 'Halal hot chicken truck featuring loaded fries and hot tenders', type: 'food' },
        { name: "KC's Smoothie Truck", lat: 39.95666515968067, lng: -75.1892863426169, desc: 'Popular fruit smoothie joint on campus', type: 'food' },
        { name: 'Kami Food Truck', lat: 39.95554469453332, lng: -75.1895888116436, desc: 'Truck that serves delicious Korean food', type: 'food' },
        { name: "Pete's Little Lunch Box", lat: 39.958125055589605, lng: -75.18927196165866, desc: 'Budget-friendly breakfast and lunch truck', type: 'food' },
        { name: 'Korman Center', lat: 39.95478102782406, lng: -75.18875181530149, desc: 'Group study rooms and tutoring services', type: 'study' },
        { name: 'Rush Building', lat: 39.95680946656349, lng: -75.18940558219164, desc: 'Study spots and themed spaces for student life', type: 'study' }
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

    bindAddPinFeature();
    loadUserPins();
}

let pendingPinLocation = null;

function bindAddPinFeature() {
    mapInstance.on('click', function (e) {
        if (!requireAuth()) {
            return;
        }
        pendingPinLocation = e.latlng;
        openAddPinPopup(e.latlng);
    });

    bindMapAddressSearch();
}

function openAddPinPopup(latlng) {
    let formBox = buildAddPinFormElement(latlng);

    let popup = window.L.popup({
        maxWidth: 240,
        minWidth: 220,
        closeButton: true,
        className: 'add-pin-popup'
    })
        .setLatLng(latlng)
        .setContent(formBox)
        .openOn(mapInstance);

    mapInstance.on('popupclose', function onClose() {
        pendingPinLocation = null;
        mapInstance.off('popupclose', onClose);
    });
}

function buildAddPinFormElement(latlng) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('add-pin-popup-box');

    let title = document.createElement('h4');
    title.classList.add('add-pin-popup-title');
    title.textContent = '📍 Add a Campus Pin';
    wrapper.append(title);

    let addressInfo = document.createElement('p');
    addressInfo.classList.add('add-pin-address-info');
    addressInfo.textContent = 'Looking up address...';
    wrapper.append(addressInfo);

    apiReverseGeocode(latlng.lat, latlng.lng).then(function (data) {
        addressInfo.textContent = data.formattedAddress;
    }).catch(function () {
        addressInfo.textContent = latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5);
    });

    let form = document.createElement('form');
    form.classList.add('add-pin-popup-form');

    let nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.classList.add('form-input', 'add-pin-input');
    nameInput.placeholder = 'Location name';
    nameInput.required = true;
    form.append(nameInput);

    let descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.classList.add('form-input', 'add-pin-input');
    descInput.placeholder = 'Short description (optional)';
    form.append(descInput);

    let photoInput = document.createElement('input');
    photoInput.type = 'file';
    photoInput.accept = 'image/*';
    photoInput.capture = 'environment';
    photoInput.classList.add('add-pin-photo-input');
    form.append(photoInput);

    let photoStatus = document.createElement('p');
    photoStatus.classList.add('upload-status');
    form.append(photoStatus);

    let uploadedImageUrl = '';

    photoInput.addEventListener('change', function () {
        if (!photoInput.files[0]) {
            return;
        }
        photoStatus.textContent = 'Uploading...';
        uploadSelectedImage(photoInput, function (imageUrl) {
            uploadedImageUrl = imageUrl;
            photoStatus.textContent = 'Photo attached';
        }, function () {
            photoStatus.textContent = 'Upload failed, try again';
        });
    });

    let actionsRow = document.createElement('div');
    actionsRow.classList.add('add-pin-actions');

    let cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.classList.add('btn', 'btn-outline', 'add-pin-btn');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', function () {
        mapInstance.closePopup();
    });

    let submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.classList.add('btn', 'btn-gold', 'add-pin-btn');
    submitBtn.textContent = 'Pin It';

    actionsRow.append(cancelBtn);
    actionsRow.append(submitBtn);
    form.append(actionsRow);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleAddMarkerSubmit(latlng, nameInput.value, descInput.value, uploadedImageUrl);
    });

    wrapper.append(form);

    return wrapper;
}

function handleAddMarkerSubmit(latlng, name, description, imageUrl) {
    if (!requireAuth()) {
        return;
    }

    if (!name || !name.trim()) {
        return;
    }

    apiAddLandmark({
        name: name.trim(),
        description: description ? description.trim() : '',
        lat: latlng.lat,
        lng: latlng.lng,
        imageUrl: imageUrl
    }).then(function (newLandmark) {
        addUserPinMarker(name.trim(), description ? description.trim() : '', latlng.lat, latlng.lng, newLandmark.id, imageUrl);
        pendingPinLocation = null;
        mapInstance.closePopup();
    }).catch(function (e) {
        console.error('Failed to save pin:', e);
    });
}

function bindMapAddressSearch() {
    let searchInput = document.getElementById('map-address-search');
    let searchBtn = document.getElementById('map-address-search-btn');
    let statusEl = document.getElementById('map-address-search-status');

    if (!searchInput || !searchBtn) {
        return;
    }

    function runSearch() {
        let address = searchInput.value;
        if (!address.trim()) {
            return;
        }

        statusEl.textContent = 'Searching...';

        apiGeocodeAddress(address).then(function (data) {
            mapInstance.setView([data.lat, data.lng], 17);

            let searchMarker = window.L.marker([data.lat, data.lng]).addTo(mapInstance);
            searchMarker.bindPopup(data.formattedAddress).openPopup();
            searchMarker.categoryType = 'search';
            mapMarkers.push(searchMarker);

            statusEl.textContent = 'Found: ' + data.formattedAddress;
        }).catch(function () {
            statusEl.textContent = 'Address not found near campus. Try a different search.';
        });
    }

    searchBtn.addEventListener('click', runSearch);

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            runSearch();
        }
    });
}

function addUserPinMarker(name, description, lat, lng, landmarkId, imageUrl) {
    let marker = window.L.marker([lat, lng]).addTo(mapInstance);

    let popupBox = document.createElement('div');

    if (imageUrl) {
        let photoEl = document.createElement('img');
        photoEl.src = imageUrl;
        photoEl.alt = name;
        photoEl.classList.add('pin-popup-photo');
        popupBox.append(photoEl);
    }

    let nameEl = document.createElement('strong');
    nameEl.textContent = name;

    let descEl = document.createElement('p');
    descEl.textContent = description;

    let deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.classList.add('pin-delete-btn');
    deleteBtn.textContent = 'Delete Pin';
    deleteBtn.addEventListener('click', function () {
        deleteUserPin(marker, landmarkId);
    });

    popupBox.append(nameEl);
    popupBox.append(descEl);
    popupBox.append(deleteBtn);

    marker.bindPopup(popupBox);
    marker.categoryType = 'user';
    mapMarkers.push(marker);
}

function deleteUserPin(marker, landmarkId) {
    apiDeleteLandmark(landmarkId).then(function () {
        mapInstance.removeLayer(marker);
        mapMarkers = mapMarkers.filter(function (m) {
            return m !== marker;
        });
    }).catch(function (e) {
        console.error('Failed to delete pin:', e);
    });
}

function loadUserPins() {
    apiGetLandmarks().then(function (landmarks) {
        for (let i = 0; i < landmarks.length; i++) {
            let lm = landmarks[i];
            if (lm.category === 'User Pin') {
                addUserPinMarker(lm.name, lm.description, lm.latitude, lm.longitude, lm.id, lm.imageUrl);
            }
        }
    }).catch(function (e) {
        console.error('Failed to load user pins:', e);
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
    if (!requireAuth()) {
        return;
    }

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
