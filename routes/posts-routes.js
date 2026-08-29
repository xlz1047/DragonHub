let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app, tokenStorage) {
    app.get('/api/posts', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            let userId = user ? user.id : null;
            let posts = await db.getPosts(req.query.category, req.query.search, userId);
            res.json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load posts' });
        }
    });

    app.post('/api/posts', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to post', requiresAuth: true });
            }

            let content = req.body.content || req.body.title;

            if (!content || !content.trim()) {
                return res.status(400).json({ error: 'Content is required' });
            }

            let newPost = await db.createPost({
                authorId: user.id,
                authorName: user.name,
                authorMajor: user.major,
                authorAvatar: user.avatarUrl,
                content: content.trim(),
                category: req.body.category || 'Campus Life',
                imageUrl: req.body.imageUrl || req.body.mediaUrl || ''
            });

            await db.addUserPoints(user.id, 15);
            res.json(newPost);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to create post' });
        }
    });

    app.post('/api/posts/:id/like', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to like posts', requiresAuth: true });
            }

            let result = await db.toggleLikePost(req.params.id, user.id);
            res.json({ likes: result.likesCount, likesCount: result.likesCount, isLiked: result.isLiked });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to like post' });
        }
    });

    app.post('/api/posts/:id/comment', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to comment', requiresAuth: true });
            }

            let text = req.body.text || req.body.content;

            if (!text || !text.trim()) {
                return res.status(400).json({ error: 'Comment text is required' });
            }

            let newComment = await db.addComment(req.params.id, {
                authorId: user.id,
                authorName: user.name,
                authorAvatar: user.avatarUrl,
                text: text.trim()
            });

            await db.addUserPoints(user.id, 5);
            res.json(newComment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to add comment' });
        }
    });

    app.put('/api/posts/:id', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required', requiresAuth: true });
            }

            let content = req.body.content;
            if (!content || !content.trim()) {
                return res.status(400).json({ error: 'Content is required' });
            }

            let updated = await db.updatePost(req.params.id, user.id, content.trim(), req.body.category);
            if (!updated) {
                return res.status(403).json({ error: 'You can only edit your own posts' });
            }
            res.json(updated);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to update post' });
        }
    });

    app.delete('/api/posts/:id', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required', requiresAuth: true });
            }

            let deleted = await db.deletePost(req.params.id, user.id);
            if (!deleted) {
                return res.status(403).json({ error: 'You can only delete your own posts' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to delete post' });
        }
    });

    app.delete('/api/posts/comment/:commentId', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required', requiresAuth: true });
            }

            let deleted = await db.deleteComment(req.params.commentId, user.id);
            if (!deleted) {
                return res.status(403).json({ error: 'You can only delete your own comments' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to delete comment' });
        }
    });
};
