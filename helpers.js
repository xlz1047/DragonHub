let db = require('./database');

async function getCurrentUser(req) {
    if (req.session && req.session.userId) {
        let user = await db.getUserById(req.session.userId);
        if (user) {
            return user;
        }
    }
    return await db.getFirstUser();
}

async function buildUserResponse(user) {
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
        badgesEarned: badgesEarned
    };
}

module.exports = {
    getCurrentUser: getCurrentUser,
    buildUserResponse: buildUserResponse
};
