function apiGetCurrentUser() {
    return fetch('/api/auth/me').then(function (res) {
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

function apiUpdateProfile(profileData) {
    return fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    }).then(function (res) {
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
        return res.json();
    });
}

function apiCreatePost(postData) {
    return fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    }).then(function (res) {
        return res.json();
    });
}

function apiLikePost(postId) {
    return fetch('/api/posts/' + postId + '/like', {
        method: 'POST'
    }).then(function (res) {
        return res.json();
    });
}

function apiAddComment(postId, content) {
    return fetch('/api/posts/' + postId + '/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, content: content })
    }).then(function (res) {
        return res.json();
    });
}

function apiGetVendors(cuisine) {
    let url = '/api/eats';
    if (cuisine && cuisine !== 'All') {
        url = url + '?cuisine=' + encodeURIComponent(cuisine);
    }
    return fetch(url).then(function (res) {
        return res.json();
    });
}

function apiCheckInVendor(vendorId) {
    return fetch('/api/eats/' + vendorId + '/checkin', {
        method: 'POST'
    }).then(function (res) {
        return res.json();
    });
}

function apiGetMarketplace(category) {
    let url = '/api/marketplace';
    if (category && category !== 'All') {
        url = url + '?category=' + encodeURIComponent(category);
    }
    return fetch(url).then(function (res) {
        return res.json();
    });
}

function apiCreateListing(listingData) {
    return fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData)
    }).then(function (res) {
        return res.json();
    });
}

function apiGetLandmarks() {
    return fetch('/api/landmarks').then(function (res) {
        return res.json();
    });
}

function apiCheckInLandmark(landmarkId) {
    return fetch('/api/landmarks/' + landmarkId + '/checkin', {
        method: 'POST'
    }).then(function (res) {
        return res.json();
    });
}

function apiGetPolls() {
    return fetch('/api/polls').then(function (res) {
        return res.json();
    });
}

function apiCreatePoll(pollData) {
    return fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData)
    }).then(function (res) {
        return res.json();
    });
}

function apiVotePoll(pollId, optionId) {
    return fetch('/api/polls/' + pollId + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: optionId })
    }).then(function (res) {
        return res.json();
    });
}

function apiGetBadges() {
    return fetch('/api/achievements').then(function (res) {
        return res.json();
    });
}

function apiGetNotifications() {
    return fetch('/api/notifications').then(function (res) {
        return res.json();
    });
}

function apiMarkNotificationsRead() {
    return fetch('/api/notifications/read', {
        method: 'POST'
    }).then(function (res) {
        return res.json();
    });
}

function apiGetWeather() {
    return fetch('/api/weather').then(function (res) {
        return res.json();
    });
}
