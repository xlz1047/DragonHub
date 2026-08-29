let db = require('./database');

async function getCurrentUser(req, tokenStorage) {
    let token = req.cookies.token;

    if (token !== undefined && tokenStorage.hasOwnProperty(token)) {
        let userId = tokenStorage[token];
        let user = await db.getUserById(userId);
        if (user) {
            return user;
        }
    }

    return null;
}

function buildGuestResponse() {
    return {
        id: null,
        email: null,
        name: 'Guest Visitor',
        major: 'Browsing DragonHub',
        classYear: '',
        studentId: '',
        role: 'Guest Visitor',
        totalPoints: 0,
        streak: 0,
        avatarUrl: '/assets/default-avatar.png',
        bio: '',
        coop: '',
        badgesEarned: [],
        isGuest: true
    };
}

async function buildUserResponse(user) {
    if (!user) {
        return buildGuestResponse();
    }

    let badgesEarned = await db.getUserBadgeIds(user.id);
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        major: user.major,
        classYear: user.classYear,
        studentId: user.studentId,
        role: 'Undergraduate ' + user.classYear,
        totalPoints: user.totalPoints,
        streak: user.streak,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        coop: user.coop,
        badgesEarned: badgesEarned,
        isGuest: false
    };
}

module.exports = {
    getCurrentUser: getCurrentUser,
    buildUserResponse: buildUserResponse
};
