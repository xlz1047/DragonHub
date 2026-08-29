function handleAuthRequiredResponse(res) {
    if (res.status === 401) {
        let modal = document.getElementById('auth-required-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
}

function apiGetCurrentUser() {
    return fetch('/api/auth/me').then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load current user');
        }
        return res.json();
    }).catch(function (e) {
        console.error('Error fetching user:', e);
        return null;
    });
}

function apiLogin(email, password) {
    return fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    }).then(function (res) {
        return res.json().then(function (data) {
            return { ok: res.ok, data: data };
        });
    });
}

function apiSignup(signupData) {
    return fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
    }).then(function (res) {
        return res.json().then(function (data) {
            return { ok: res.ok, data: data };
        });
    });
}

function apiSwitchUser(userId) {
    return fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
    }).then(function (res) {
        return res.json().then(function (data) {
            return { ok: res.ok, data: data };
        });
    });
}

function apiLogout() {
    return fetch('/api/auth/logout', {
        method: 'POST'
    }).then(function (res) {
        return res.json();
    });
}

function apiUpdateProfile(profileData) {
    return fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to update profile');
        }
        return res.json();
    });
}

function apiGetPosts(category, search) {
    let url = '/api/posts';
    let params = [];
    if (category && category !== 'All') {
        params.push('category=' + encodeURIComponent(category));
    }
    if (search) {
        params.push('search=' + encodeURIComponent(search));
    }
    if (params.length > 0) {
        url = url + '?' + params.join('&');
    }
    return fetch(url).then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load posts');
        }
        return res.json();
    });
}

function apiCreatePost(postData) {
    return fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to create post');
        }
        return res.json();
    });
}

function apiLikePost(postId) {
    return fetch('/api/posts/' + postId + '/like', {
        method: 'POST'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to like post');
        }
        return res.json();
    });
}

function apiAddComment(postId, content) {
    return fetch('/api/posts/' + postId + '/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, content: content })
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to add comment');
        }
        return res.json();
    });
}

function apiUpdatePost(postId, content) {
    return fetch('/api/posts/' + postId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to update post');
        }
        return res.json();
    });
}

function apiDeletePost(postId) {
    return fetch('/api/posts/' + postId, {
        method: 'DELETE'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to delete post');
        }
        return res.json();
    });
}

function apiDeleteComment(commentId) {
    return fetch('/api/posts/comment/' + commentId, {
        method: 'DELETE'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to delete comment');
        }
        return res.json();
    });
}

function apiGetVendors(cuisine) {
    let url = '/api/eats';
    if (cuisine && cuisine !== 'All') {
        url = url + '?cuisine=' + encodeURIComponent(cuisine);
    }
    return fetch(url).then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load food trucks');
        }
        return res.json();
    });
}

function apiGetYelpData(name, location) {
    let url = '/api/yelp?name=' + encodeURIComponent(name) + '&location=' + encodeURIComponent(location);
    return fetch(url).then(function (res) {
        if (!res.ok) {
            throw new Error('Yelp data unavailable');
        }
        return res.json();
    });
}

function apiCheckInVendor(vendorId) {
    return fetch('/api/eats/' + vendorId + '/checkin', {
        method: 'POST'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to check in');
        }
        return res.json();
    });
}

function apiGetTruckReviews(truckId) {
    return fetch('/api/eats/' + truckId + '/reviews').then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load reviews');
        }
        return res.json();
    });
}

function apiAddTruckReview(truckId, rating, comment) {
    return fetch('/api/eats/' + truckId + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: rating, comment: comment })
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to submit review');
        }
        return res.json();
    });
}

function apiDeleteTruckReview(reviewId) {
    return fetch('/api/eats/reviews/' + reviewId, {
        method: 'DELETE'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to delete review');
        }
        return res.json();
    });
}

function apiGetMarketplace(category) {
    let url = '/api/marketplace';
    if (category && category !== 'All') {
        url = url + '?category=' + encodeURIComponent(category);
    }
    return fetch(url).then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load marketplace');
        }
        return res.json();
    });
}

function apiCreateListing(listingData) {
    return fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData)
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to create listing');
        }
        return res.json();
    });
}

function apiUpdateListing(itemId, fields) {
    return fetch('/api/marketplace/' + itemId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to update listing');
        }
        return res.json();
    });
}

function apiDeleteListing(itemId) {
    return fetch('/api/marketplace/' + itemId, {
        method: 'DELETE'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to delete listing');
        }
        return res.json();
    });
}

function apiGetLandmarks() {
    return fetch('/api/landmarks').then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load landmarks');
        }
        return res.json();
    });
}

function apiCheckInLandmark(landmarkId) {
    return fetch('/api/landmarks/' + landmarkId + '/checkin', {
        method: 'POST'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to check in at landmark');
        }
        return res.json();
    });
}

function apiAddLandmark(landmarkData) {
    return fetch('/api/landmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landmarkData)
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to save pin');
        }
        return res.json();
    });
}

function apiDeleteLandmark(landmarkId) {
    return fetch('/api/landmarks/' + landmarkId, {
        method: 'DELETE'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to delete pin');
        }
        return res.json();
    });
}

function apiGeocodeAddress(address) {
    let url = '/api/geocode?address=' + encodeURIComponent(address);
    return fetch(url).then(function (res) {
        if (!res.ok) {
            throw new Error('Address not found');
        }
        return res.json();
    });
}

function apiReverseGeocode(lat, lng) {
    let url = '/api/reverse-geocode?lat=' + lat + '&lng=' + lng;
    return fetch(url).then(function (res) {
        if (!res.ok) {
            throw new Error('Location not found');
        }
        return res.json();
    });
}

function apiGetPolls() {
    return fetch('/api/polls').then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load polls');
        }
        return res.json();
    });
}

function apiCreatePoll(pollData) {
    return fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData)
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to create poll');
        }
        return res.json();
    });
}

function apiVotePoll(pollId, optionId) {
    return fetch('/api/polls/' + pollId + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: optionId })
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to record vote');
        }
        return res.json();
    });
}

function apiDeletePoll(pollId) {
    return fetch('/api/polls/' + pollId, {
        method: 'DELETE'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to delete poll');
        }
        return res.json();
    });
}

function apiGetBadges() {
    return fetch('/api/achievements').then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load achievements');
        }
        return res.json();
    });
}

function apiGetNotifications() {
    return fetch('/api/notifications').then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load notifications');
        }
        return res.json();
    });
}

function apiMarkNotificationsRead() {
    return fetch('/api/notifications/read', {
        method: 'POST'
    }).then(function (res) {
        if (!res.ok) {
            handleAuthRequiredResponse(res);
            throw new Error('Failed to update notifications');
        }
        return res.json();
    });
}

function apiGetWeather() {
    return fetch('/api/weather').then(function (res) {
        if (!res.ok) {
            throw new Error('Failed to load weather');
        }
        return res.json();
    });
}
