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
        let truckCard = buildTruckElement(vendors[i], i);
        container.append(truckCard);
    }
}

function buildTruckElement(v, index) {
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
    ratingBadge.textContent = 'Loading...';

    setTimeout(function () {
        apiGetYelpData(v.name, v.location).then(function (data) {
            ratingBadge.textContent = '⭐ ' + data.rating + ' (' + data.review_count + '+)';
            if (data.image_url) {
                imgEl.src = data.image_url;
            }
        }).catch(function () {
            ratingBadge.textContent = '⭐ ' + rating + ' (' + reviewCount + '+)';
        });
    }, 500 * index);

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

    let reviewBtn = document.createElement('button');
    reviewBtn.type = 'button';
    reviewBtn.classList.add('btn', 'btn-outline', 'truck-review-btn');
    reviewBtn.textContent = '⭐ Rate & Review';
    reviewBtn.addEventListener('click', function () {
        openReviewModal(v.id, v.name);
    });

    infoRow.append(waitTag);
    infoRow.append(checkInBtn);
    body.append(infoRow);
    body.append(reviewBtn);

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
    if (!requireAuth()) {
        return;
    }

    apiCheckInVendor(truckId).then(function (res) {
        if (res) {
            alert('Checked in! +25 DREAMER points awarded to your Dragon Card!');
            loadHeaderUser();
        }
    }).catch(function (e) {
        console.error('Failed to check in:', e);
    });
}

let currentReviewTruckId = null;

function openReviewModal(truckId, truckName) {
    if (!requireAuth()) {
        return;
    }

    currentReviewTruckId = truckId;

    let titleEl = document.getElementById('review-modal-title');
    if (titleEl) {
        titleEl.textContent = '⭐ Rate ' + truckName;
    }

    loadTruckReviews(truckId);
    openModal('review-modal');
}

function loadTruckReviews(truckId) {
    let listEl = document.getElementById('review-list');
    if (!listEl) {
        return;
    }

    listEl.textContent = 'Loading reviews...';

    apiGetTruckReviews(truckId).then(function (reviews) {
        renderReviewList(reviews);
    }).catch(function (e) {
        console.error('Failed to load reviews:', e);
        listEl.textContent = 'Unable to load reviews right now.';
    });
}

function renderReviewList(reviews) {
    let listEl = document.getElementById('review-list');
    if (!listEl) {
        return;
    }

    listEl.textContent = '';

    if (reviews.length === 0) {
        let emptyEl = document.createElement('p');
        emptyEl.classList.add('review-empty');
        emptyEl.textContent = 'No reviews yet. Be the first to share your take!';
        listEl.append(emptyEl);
        return;
    }

    for (let i = 0; i < reviews.length; i++) {
        let review = reviews[i];
        let reviewEl = buildReviewElement(review);
        listEl.append(reviewEl);
    }
}

function buildReviewElement(review) {
    let stars = '';
    for (let i = 0; i < review.rating; i++) {
        stars = stars + '⭐';
    }

    let item = document.createElement('div');
    item.classList.add('review-item');

    let topRow = document.createElement('div');
    topRow.classList.add('review-item-top');

    let authorEl = document.createElement('span');
    authorEl.classList.add('review-author');
    authorEl.textContent = review.authorName;

    let starsEl = document.createElement('span');
    starsEl.classList.add('review-stars');
    starsEl.textContent = stars;

    topRow.append(authorEl);
    topRow.append(starsEl);
    item.append(topRow);

    if (review.comment) {
        let commentEl = document.createElement('p');
        commentEl.classList.add('review-comment');
        commentEl.textContent = review.comment;
        item.append(commentEl);
    }

    let timeEl = document.createElement('span');
    timeEl.classList.add('review-time');
    timeEl.textContent = formatTimestamp(review.createdAt);
    item.append(timeEl);

    let isOwner = currentUser && !currentUser.isGuest && currentUser.id === review.userId;
    if (isOwner) {
        let deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('review-delete-btn');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            deleteTruckReview(review.id);
        });
        item.append(deleteBtn);
    }

    return item;
}

function handleReviewSubmit(e) {
    e.preventDefault();

    if (!requireAuth()) {
        return;
    }

    if (!currentReviewTruckId) {
        return;
    }

    let rating = document.getElementById('review-rating').value;
    let comment = document.getElementById('review-comment').value;

    apiAddTruckReview(currentReviewTruckId, rating, comment).then(function () {
        document.getElementById('review-comment').value = '';
        loadTruckReviews(currentReviewTruckId);
        loadHeaderUser();
    }).catch(function (e) {
        console.error('Failed to submit review:', e);
    });
}

function deleteTruckReview(reviewId) {
    if (!window.confirm('Delete this review?')) {
        return;
    }

    apiDeleteTruckReview(reviewId).then(function () {
        loadTruckReviews(currentReviewTruckId);
    }).catch(function (e) {
        console.error('Failed to delete review:', e);
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

    let reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            handleReviewSubmit(e);
        });
    }
}
