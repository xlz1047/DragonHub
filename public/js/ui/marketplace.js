function loadMarketplace() {
    return apiGetMarketplace().then(function (items) {
        allMarketplaceItems = items;
        renderMarketplace();
    }).catch(function (e) {
        console.error('Failed to load marketplace:', e);
    });
}

function renderMarketplace() {
    let container = document.getElementById('marketplace-grid');
    if (!container) {
        return;
    }

    let items = allMarketplaceItems;

    if (globalSearchQuery) {
        items = items.filter(function (m) {
            return (m.title && m.title.toLowerCase().includes(globalSearchQuery)) ||
                (m.description && m.description.toLowerCase().includes(globalSearchQuery)) ||
                (m.category && m.category.toLowerCase().includes(globalSearchQuery));
        });
    }

    container.textContent = '';

    if (items.length === 0) {
        let emptyCard = document.createElement('div');
        emptyCard.classList.add('card', 'market-empty');
        emptyCard.textContent = 'No marketplace listings found.';
        container.append(emptyCard);
        return;
    }

    for (let i = 0; i < items.length; i++) {
        let itemCard = buildListingElement(items[i]);
        container.append(itemCard);
    }
}

function buildListingElement(item) {
    let imgSrc = item.imageUrl || '/assets/book.png';
    let desc = item.description || 'Meet at ' + (item.location || 'Hagerty Library');
    let seller = item.sellerName || 'Dragon';
    let email = item.sellerEmail || 'dragon@drexel.edu';

    let card = document.createElement('div');
    card.classList.add('market-card');
    if (item.isSold) {
        card.classList.add('market-sold');
    }

    let imgEl = document.createElement('img');
    imgEl.classList.add('market-img');
    imgEl.src = imgSrc;
    imgEl.alt = item.title;
    card.append(imgEl);

    let body = document.createElement('div');
    body.classList.add('market-body');

    let priceRow = document.createElement('div');
    priceRow.classList.add('market-price-row');

    let priceEl = document.createElement('div');
    priceEl.classList.add('market-price');
    priceEl.textContent = '$' + item.price;
    priceRow.append(priceEl);

    if (item.isSold) {
        let soldTag = document.createElement('span');
        soldTag.classList.add('market-sold-tag');
        soldTag.textContent = 'SOLD';
        priceRow.append(soldTag);
    }

    let categoryEl = document.createElement('div');
    categoryEl.classList.add('market-category');
    categoryEl.textContent = item.category;

    let titleEl = document.createElement('h3');
    titleEl.classList.add('market-title');
    titleEl.textContent = item.title;

    let descEl = document.createElement('div');
    descEl.classList.add('market-desc');
    descEl.textContent = desc;

    let timeEl = document.createElement('div');
    timeEl.classList.add('market-timestamp');
    timeEl.textContent = 'Listed ' + formatTimestamp(item.createdAt);

    body.append(priceRow);
    body.append(categoryEl);
    body.append(titleEl);
    body.append(descEl);
    body.append(timeEl);

    let isOwner = currentUser && !currentUser.isGuest && currentUser.id === item.sellerId;

    if (isOwner) {
        let ownerControls = document.createElement('div');
        ownerControls.classList.add('market-owner-controls');

        let editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.classList.add('post-owner-btn');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () {
            editListing(item);
        });

        let soldBtn = document.createElement('button');
        soldBtn.type = 'button';
        soldBtn.classList.add('post-owner-btn');
        soldBtn.textContent = item.isSold ? 'Mark Available' : 'Mark Sold';
        soldBtn.addEventListener('click', function () {
            toggleListingSold(item);
        });

        let deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('post-owner-btn', 'post-owner-btn-danger');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            deleteListing(item.id);
        });

        ownerControls.append(editBtn);
        ownerControls.append(soldBtn);
        ownerControls.append(deleteBtn);
        body.append(ownerControls);
    }

    let footer = document.createElement('div');
    footer.classList.add('market-footer');

    let sellerEl = document.createElement('span');
    sellerEl.classList.add('market-seller');
    sellerEl.textContent = 'By ' + seller;

    let contactBtn = document.createElement('a');
    contactBtn.classList.add('btn', 'btn-primary', 'market-contact-btn');
    contactBtn.href = 'mailto:' + email + '?subject=' + encodeURIComponent('DragonHub Marketplace: ' + item.title);
    contactBtn.textContent = 'Contact Seller';

    footer.append(sellerEl);
    footer.append(contactBtn);
    body.append(footer);

    card.append(body);

    return card;
}

function editListing(item) {
    let newPrice = window.prompt('Edit price:', item.price);
    if (newPrice === null || newPrice.trim() === '') {
        return;
    }

    let newDescription = window.prompt('Edit description:', item.description || '');
    if (newDescription === null) {
        return;
    }

    apiUpdateListing(item.id, {
        price: Number(newPrice),
        description: newDescription,
        isSold: item.isSold
    }).then(function (updated) {
        for (let i = 0; i < allMarketplaceItems.length; i++) {
            if (allMarketplaceItems[i].id === item.id) {
                allMarketplaceItems[i] = updated;
                break;
            }
        }
        renderMarketplace();
    }).catch(function (e) {
        console.error('Failed to update listing:', e);
    });
}

function toggleListingSold(item) {
    apiUpdateListing(item.id, {
        price: item.price,
        description: item.description,
        isSold: !item.isSold
    }).then(function (updated) {
        for (let i = 0; i < allMarketplaceItems.length; i++) {
            if (allMarketplaceItems[i].id === item.id) {
                allMarketplaceItems[i] = updated;
                break;
            }
        }
        renderMarketplace();
    }).catch(function (e) {
        console.error('Failed to update listing:', e);
    });
}

function deleteListing(itemId) {
    if (!window.confirm('Delete this listing? This cannot be undone.')) {
        return;
    }

    apiDeleteListing(itemId).then(function () {
        allMarketplaceItems = allMarketplaceItems.filter(function (m) {
            return m.id !== itemId;
        });
        renderMarketplace();
    }).catch(function (e) {
        console.error('Failed to delete listing:', e);
    });
}

function filterMarketCategory(category, btnEl) {
    let btns = document.querySelectorAll('.cat-btn');
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    if (btnEl) {
        btnEl.classList.add('active');
    }
    apiGetMarketplace(category).then(function (items) {
        allMarketplaceItems = items;
        renderMarketplace();
    }).catch(function (e) {
        console.error('Failed to filter marketplace:', e);
    });
}

function handleListingSubmit(e) {
    e.preventDefault();

    if (!requireAuth()) {
        return;
    }

    let title = document.getElementById('item-title').value;
    let price = document.getElementById('item-price').value;
    let categoryEl = document.getElementById('item-cat');
    let category = categoryEl ? categoryEl.value : 'Other';
    let condition = document.getElementById('item-condition').value;
    let locationEl = document.getElementById('item-location');
    let location = locationEl ? locationEl.value : 'Hagerty Library';
    let imageEl = document.getElementById('item-image');
    let imageUrl = imageEl ? imageEl.value : '';

    apiCreateListing({
        title: title,
        price: price,
        category: category,
        condition: condition,
        location: location,
        imageUrl: imageUrl
    }).then(function (newItem) {
        if (newItem) {
            closeModal('listing-modal');
            document.getElementById('item-title').value = '';
            document.getElementById('item-price').value = '';
            resetImageUpload('item-image-file', 'item-image-preview', 'item-image');
            loadMarketplace();
            loadHeaderUser();
        }
    }).catch(function (err) {
        console.error('Failed to create listing:', err);
    });
}

function bindMarketplaceEvents() {
    let categoryButtons = document.querySelectorAll('.category-filter .cat-btn');
    for (let i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].addEventListener('click', function () {
            let category = this.getAttribute('data-category');
            filterMarketCategory(category, this);
        });
    }

    let listingForm = document.getElementById('listing-form');
    if (listingForm) {
        listingForm.addEventListener('submit', function (e) {
            handleListingSubmit(e);
        });
    }
}
