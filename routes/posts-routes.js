let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app) {
    app.get('/api/posts', async function (req, res) {
        try {
            let posts = await db.getPosts(req.query.category, req.query.search);
            res.json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load posts' });
        }
    });

    app.post('/api/posts', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req);
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
            let result = await db.likePost(req.params.id);
            if (!result) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json({ likes: result.likesCount, likesCount: result.likesCount, isLiked: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to like post' });
        }
    });

    app.post('/api/posts/:id/comment', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req);
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
};
