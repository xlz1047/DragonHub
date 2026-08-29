let { Pool } = require('pg');

let pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function getUserById(id) {
    let result = await pool.query(
        'SELECT id, email, password_hash AS "passwordHash", name, major, class_year AS "classYear", student_id AS "studentId", total_points AS "totalPoints", streak, avatar_url AS "avatarUrl", bio, coop FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
}

async function getUserByEmail(email) {
    let result = await pool.query(
        'SELECT id, email, password_hash AS "passwordHash", name, major, class_year AS "classYear", student_id AS "studentId", total_points AS "totalPoints", streak, avatar_url AS "avatarUrl", bio, coop FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
}

async function createUser(newUser) {
    let id = 'usr_' + Date.now();
    let result = await pool.query(
        'INSERT INTO users (id, name, email, password_hash, major, student_id, class_year, total_points, streak, avatar_url, bio, coop) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 1, $8, $9, $10) RETURNING id, email, name, major, class_year AS "classYear", student_id AS "studentId", total_points AS "totalPoints", streak, avatar_url AS "avatarUrl", bio, coop',
        [id, newUser.name, newUser.email, newUser.passwordHash, newUser.major, newUser.studentId, newUser.classYear, newUser.avatarUrl, newUser.bio, newUser.coop]
    );
    return result.rows[0];
}

async function getFirstUser() {
    let result = await pool.query(
        'SELECT id, email, password_hash AS "passwordHash", name, major, class_year AS "classYear", student_id AS "studentId", total_points AS "totalPoints", streak, avatar_url AS "avatarUrl", bio, coop FROM users ORDER BY created_at ASC LIMIT 1'
    );
    return result.rows[0] || null;
}

async function getUserBadgeIds(userId) {
    let result = await pool.query(
        'SELECT achievement_id FROM user_achievements WHERE user_id = $1',
        [userId]
    );
    let ids = [];
    for (let i = 0; i < result.rows.length; i++) {
        ids.push(result.rows[i].achievement_id);
    }
    return ids;
}

async function updateUserProfile(id, fields) {
    let result = await pool.query(
        'UPDATE users SET name = $1, major = $2, class_year = $3, bio = $4, coop = $5, avatar_url = $6 WHERE id = $7 RETURNING id, email, name, major, class_year AS "classYear", student_id AS "studentId", total_points AS "totalPoints", streak, avatar_url AS "avatarUrl", bio, coop',
        [fields.name, fields.major, fields.classYear, fields.bio, fields.coop, fields.avatarUrl, id]
    );
    return result.rows[0];
}

async function addUserPoints(id, amount) {
    await pool.query('UPDATE users SET total_points = total_points + $1 WHERE id = $2', [amount, id]);
}

async function getPosts(category, search, userId) {
    let query = 'SELECT id, author_id AS "authorId", author_name AS "authorName", author_major AS "authorMajor", author_avatar AS "authorAvatar", content, category, image_url AS "imageUrl", likes_count AS "likesCount", comments_count AS "commentsCount", created_at AS "createdAt" FROM posts';
    let conditions = [];
    let values = [];

    if (category && category !== 'All') {
        values.push('%' + category + '%');
        conditions.push('category ILIKE $' + values.length);
    }

    if (search) {
        values.push('%' + search + '%');
        conditions.push('(content ILIKE $' + values.length + ' OR author_name ILIKE $' + values.length + ')');
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    let result = await pool.query(query, values);
    let posts = result.rows;

    for (let i = 0; i < posts.length; i++) {
        posts[i].comments = await getCommentsForPost(posts[i].id);
        posts[i].isLiked = await hasUserLikedPost(posts[i].id, userId);
    }

    return posts;
}

async function hasUserLikedPost(postId, userId) {
    if (!userId) {
        return false;
    }
    let result = await pool.query(
        'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
    );
    return result.rows.length > 0;
}

async function createPost(post) {
    let id = 'post_' + Date.now();
    let result = await pool.query(
        'INSERT INTO posts (id, author_id, author_name, author_major, author_avatar, content, category, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, author_id AS "authorId", author_name AS "authorName", author_major AS "authorMajor", author_avatar AS "authorAvatar", content, category, image_url AS "imageUrl", likes_count AS "likesCount", comments_count AS "commentsCount", created_at AS "createdAt"',
        [id, post.authorId, post.authorName, post.authorMajor, post.authorAvatar, post.content, post.category, post.imageUrl]
    );
    let newPost = result.rows[0];
    newPost.comments = [];
    return newPost;
}

async function updatePost(postId, userId, content, category) {
    let result = await pool.query(
        'UPDATE posts SET content = $1, category = $2 WHERE id = $3 AND author_id = $4 RETURNING id, author_id AS "authorId", author_name AS "authorName", author_major AS "authorMajor", author_avatar AS "authorAvatar", content, category, image_url AS "imageUrl", likes_count AS "likesCount", comments_count AS "commentsCount", created_at AS "createdAt"',
        [content, category, postId, userId]
    );
    return result.rows[0] || null;
}

async function deletePost(postId, userId) {
    let ownerCheck = await pool.query(
        'SELECT id FROM posts WHERE id = $1 AND author_id = $2',
        [postId, userId]
    );

    if (ownerCheck.rows.length === 0) {
        return false;
    }

    await pool.query('DELETE FROM comments WHERE post_id = $1', [postId]);
    await pool.query('DELETE FROM post_likes WHERE post_id = $1', [postId]);
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    return true;
}

async function deleteComment(commentId, userId) {
    let result = await pool.query(
        'DELETE FROM comments WHERE id = $1 AND author_id = $2 RETURNING id, post_id',
        [commentId, userId]
    );

    if (result.rows.length === 0) {
        return false;
    }

    let postId = result.rows[0].post_id;
    await pool.query('UPDATE posts SET comments_count = comments_count - 1 WHERE id = $1', [postId]);
    return true;
}

async function toggleLikePost(postId, userId) {
    let existing = await pool.query(
        'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
    );

    if (existing.rows.length > 0) {
        await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        let result = await pool.query(
            'UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1 RETURNING likes_count AS "likesCount"',
            [postId]
        );
        return { likesCount: result.rows[0].likesCount, isLiked: false };
    }

    await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
    let result = await pool.query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count AS "likesCount"',
        [postId]
    );
    return { likesCount: result.rows[0].likesCount, isLiked: true };
}

async function getCommentsForPost(postId) {
    let result = await pool.query(
        'SELECT id, author_id AS "authorId", author_name AS "authorName", author_avatar AS "authorAvatar", text, created_at AS "createdAt" FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
        [postId]
    );
    return result.rows;
}

async function addComment(postId, comment) {
    let id = 'comment_' + Date.now();
    let result = await pool.query(
        'INSERT INTO comments (id, post_id, author_id, author_name, author_avatar, text) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, author_id AS "authorId", author_name AS "authorName", author_avatar AS "authorAvatar", text, created_at AS "createdAt"',
        [id, postId, comment.authorId, comment.authorName, comment.authorAvatar, comment.text]
    );
    await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);
    return result.rows[0];
}

async function getFoodTrucks(cuisine) {
    let query = 'SELECT id, name, cuisine, location, rating, reviews_count AS "reviewsCount", price_range AS "priceRange", famous_item AS "famousItem", wait_estimate AS "waitEstimate", image_url AS "imageUrl" FROM food_trucks';
    let values = [];

    if (cuisine && cuisine !== 'All') {
        values.push('%' + cuisine + '%');
        query += ' WHERE cuisine ILIKE $1';
    }

    let result = await pool.query(query, values);
    return result.rows;
}

async function getTruckReviews(truckId) {
    let result = await pool.query(
        'SELECT id, user_id AS "userId", author_name AS "authorName", rating, comment, created_at AS "createdAt" FROM food_truck_reviews WHERE truck_id = $1 ORDER BY created_at DESC',
        [truckId]
    );
    return result.rows;
}

async function addTruckReview(truckId, userId, authorName, rating, comment) {
    let result = await pool.query(
        'INSERT INTO food_truck_reviews (truck_id, user_id, author_name, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id AS "userId", author_name AS "authorName", rating, comment, created_at AS "createdAt"',
        [truckId, userId, authorName, rating, comment]
    );
    return result.rows[0];
}

async function deleteTruckReview(reviewId, userId) {
    let result = await pool.query(
        'DELETE FROM food_truck_reviews WHERE id = $1 AND user_id = $2 RETURNING id',
        [reviewId, userId]
    );
    return result.rows.length > 0;
}

async function getMarketplaceItems(category) {
    let query = 'SELECT id, seller_id AS "sellerId", seller_name AS "sellerName", seller_email AS "sellerEmail", title, price, category, condition, location, description, image_url AS "imageUrl", is_sold AS "isSold", created_at AS "createdAt" FROM marketplace_items';
    let values = [];

    if (category && category !== 'All') {
        values.push('%' + category + '%');
        query += ' WHERE category ILIKE $1';
    }

    query += ' ORDER BY created_at DESC';

    let result = await pool.query(query, values);
    return result.rows;
}

async function createMarketplaceItem(item) {
    let id = 'item_' + Date.now();
    let result = await pool.query(
        'INSERT INTO marketplace_items (id, seller_id, seller_name, seller_email, title, price, category, condition, location, description, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, seller_id AS "sellerId", seller_name AS "sellerName", seller_email AS "sellerEmail", title, price, category, condition, location, description, image_url AS "imageUrl", is_sold AS "isSold", created_at AS "createdAt"',
        [id, item.sellerId, item.sellerName, item.sellerEmail, item.title, item.price, item.category, item.condition, item.location, item.description, item.imageUrl]
    );
    return result.rows[0];
}

async function updateMarketplaceItem(itemId, userId, fields) {
    let result = await pool.query(
        'UPDATE marketplace_items SET price = $1, description = $2, is_sold = $3 WHERE id = $4 AND seller_id = $5 RETURNING id, seller_id AS "sellerId", seller_name AS "sellerName", seller_email AS "sellerEmail", title, price, category, condition, location, description, image_url AS "imageUrl", is_sold AS "isSold", created_at AS "createdAt"',
        [fields.price, fields.description, fields.isSold, itemId, userId]
    );
    return result.rows[0] || null;
}

async function deleteMarketplaceItem(itemId, userId) {
    let result = await pool.query(
        'DELETE FROM marketplace_items WHERE id = $1 AND seller_id = $2 RETURNING id',
        [itemId, userId]
    );
    return result.rows.length > 0;
}

async function getLandmarks() {
    let result = await pool.query(
        'SELECT id, name, category, address, description, image_url AS "imageUrl", latitude, longitude, points_reward AS "pointsReward" FROM landmarks'
    );
    return result.rows;
}

async function addLandmark(name, description, lat, lng, imageUrl) {
    let id = 'user_' + Date.now();
    let result = await pool.query(
        'INSERT INTO landmarks (id, name, description, address, image_url, latitude, longitude, category, points_reward) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, category, address, description, image_url AS "imageUrl", latitude, longitude, points_reward AS "pointsReward"',
        [id, name, description, 'User Added', imageUrl || '/assets/place.png', lat, lng, 'User Pin', 0]
    );
    return result.rows[0];
}

async function deleteLandmark(id) {
    await pool.query('DELETE FROM landmarks WHERE id = $1', [id]);
}

async function getPolls(userId) {
    let result = await pool.query(
        'SELECT id, creator_id AS "creatorId", author_name AS "authorName", question, category, total_votes AS "totalVotes", created_at AS "createdAt" FROM polls ORDER BY created_at DESC'
    );
    let polls = result.rows;

    for (let i = 0; i < polls.length; i++) {
        polls[i].options = await getPollOptions(polls[i].id);
        polls[i].userVotedOptionId = await getUserVoteForPoll(polls[i].id, userId);
    }

    return polls;
}

async function getUserVoteForPoll(pollId, userId) {
    if (!userId) {
        return null;
    }
    let result = await pool.query(
        'SELECT option_id AS "optionId" FROM poll_votes WHERE poll_id = $1 AND user_id = $2',
        [pollId, userId]
    );
    return result.rows.length > 0 ? result.rows[0].optionId : null;
}

async function getPollOptions(pollId) {
    let result = await pool.query(
        'SELECT id, text, votes FROM poll_options WHERE poll_id = $1',
        [pollId]
    );
    return result.rows;
}

async function createPoll(poll) {
    let id = 'poll_' + Date.now();
    await pool.query(
        'INSERT INTO polls (id, creator_id, author_name, question, category) VALUES ($1, $2, $3, $4, $5)',
        [id, poll.creatorId, poll.authorName, poll.question, poll.category]
    );

    let options = [];
    for (let i = 0; i < poll.options.length; i++) {
        let optionId = 'opt_' + Date.now() + '_' + i;
        let result = await pool.query(
            'INSERT INTO poll_options (id, poll_id, text) VALUES ($1, $2, $3) RETURNING id, text, votes',
            [optionId, id, poll.options[i]]
        );
        options.push(result.rows[0]);
    }

    let pollResult = await pool.query(
        'SELECT id, creator_id AS "creatorId", author_name AS "authorName", question, category, total_votes AS "totalVotes", created_at AS "createdAt" FROM polls WHERE id = $1',
        [id]
    );
    let newPoll = pollResult.rows[0];
    newPoll.options = options;
    return newPoll;
}

async function votePoll(pollId, optionId, userId) {
    let existing = await pool.query(
        'SELECT id FROM poll_votes WHERE poll_id = $1 AND user_id = $2',
        [pollId, userId]
    );

    if (existing.rows.length > 0) {
        return 'ALREADY_VOTED';
    }

    await pool.query('INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES ($1, $2, $3)', [pollId, optionId, userId]);
    await pool.query('UPDATE poll_options SET votes = votes + 1 WHERE id = $1', [optionId]);
    await pool.query('UPDATE polls SET total_votes = total_votes + 1 WHERE id = $1', [pollId]);

    let pollResult = await pool.query(
        'SELECT id, creator_id AS "creatorId", author_name AS "authorName", question, category, total_votes AS "totalVotes", created_at AS "createdAt" FROM polls WHERE id = $1',
        [pollId]
    );
    let poll = pollResult.rows[0];
    if (poll) {
        poll.options = await getPollOptions(pollId);
        poll.userVotedOptionId = optionId;
    }
    return poll;
}

async function deletePoll(pollId, userId) {
    let ownerCheck = await pool.query(
        'SELECT id FROM polls WHERE id = $1 AND creator_id = $2',
        [pollId, userId]
    );

    if (ownerCheck.rows.length === 0) {
        return false;
    }

    await pool.query('DELETE FROM poll_votes WHERE poll_id = $1', [pollId]);
    await pool.query('DELETE FROM poll_options WHERE poll_id = $1', [pollId]);
    await pool.query('DELETE FROM polls WHERE id = $1', [pollId]);
    return true;
}

async function getAchievements() {
    let result = await pool.query('SELECT id, title, description, points, icon FROM achievements');
    return result.rows;
}

async function getNotifications(userId) {
    let result = await pool.query(
        "SELECT id, user_id AS \"userId\", title, message, is_read AS \"isRead\", created_at AS \"createdAt\" FROM notifications WHERE user_id = $1 OR user_id = 'all' ORDER BY created_at DESC",
        [userId]
    );
    return result.rows;
}

async function markNotificationsRead(userId) {
    await pool.query(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 OR user_id = 'all'",
        [userId]
    );
}

module.exports = {
    pool: pool,
    getUserById: getUserById,
    getUserByEmail: getUserByEmail,
    createUser: createUser,
    getFirstUser: getFirstUser,
    getUserBadgeIds: getUserBadgeIds,
    updateUserProfile: updateUserProfile,
    addUserPoints: addUserPoints,
    getPosts: getPosts,
    createPost: createPost,
    updatePost: updatePost,
    deletePost: deletePost,
    toggleLikePost: toggleLikePost,
    getCommentsForPost: getCommentsForPost,
    addComment: addComment,
    deleteComment: deleteComment,
    getFoodTrucks: getFoodTrucks,
    getTruckReviews: getTruckReviews,
    addTruckReview: addTruckReview,
    deleteTruckReview: deleteTruckReview,
    getMarketplaceItems: getMarketplaceItems,
    createMarketplaceItem: createMarketplaceItem,
    updateMarketplaceItem: updateMarketplaceItem,
    deleteMarketplaceItem: deleteMarketplaceItem,
    getLandmarks: getLandmarks,
    addLandmark: addLandmark,
    deleteLandmark: deleteLandmark,
    getPolls: getPolls,
    createPoll: createPoll,
    votePoll: votePoll,
    deletePoll: deletePoll,
    getAchievements: getAchievements,
    getNotifications: getNotifications,
    markNotificationsRead: markNotificationsRead
};
