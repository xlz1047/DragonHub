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

    let imgEl = document.createElement('img');
    imgEl.classList.add('market-img');
    imgEl.src = imgSrc;
    imgEl.alt = item.title;
    card.append(imgEl);

    let body = document.createElement('div');
    body.classList.add('market-body');

    let priceEl = document.createElement('div');
    priceEl.classList.add('market-price');
    priceEl.textContent = '$' + item.price;

    let categoryEl = document.createElement('div');
    categoryEl.classList.add('market-category');
    categoryEl.textContent = item.category;

    let titleEl = document.createElement('h3');
    titleEl.classList.add('market-title');
    titleEl.textContent = item.title;

    let descEl = document.createElement('div');
    descEl.classList.add('market-desc');
    descEl.textContent = desc;

    body.append(priceEl);
    body.append(categoryEl);
    body.append(titleEl);
    body.append(descEl);

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
