function loadFeed() {
    return apiGetPosts().then(function (posts) {
        allPosts = posts;
        renderPosts();
        if (document.getElementById('quick-poll-box')) {
            renderQuickPoll();
        }
    }).catch(function (e) {
        console.error('Failed to load feed:', e);
    });
}

function renderPosts() {
    let container = document.getElementById('posts-container');
    if (!container) {
        return;
    }

    let posts = allPosts;

    if (activeFeedCategory && activeFeedCategory !== 'All') {
        posts = posts.filter(function (p) {
            return p.category && p.category.toLowerCase().includes(activeFeedCategory.toLowerCase());
        });
    }

    if (globalSearchQuery) {
        posts = posts.filter(function (p) {
            return (p.content && p.content.toLowerCase().includes(globalSearchQuery)) ||
                (p.authorName && p.authorName.toLowerCase().includes(globalSearchQuery)) ||
                (p.category && p.category.toLowerCase().includes(globalSearchQuery));
        });
    }

    container.textContent = '';

    if (posts.length === 0) {
        let emptyCard = document.createElement('div');
        emptyCard.classList.add('card', 'feed-empty');
        emptyCard.textContent = 'No campus posts found matching your filter.';
        container.append(emptyCard);
        return;
    }

    for (let i = 0; i < posts.length; i++) {
        let postEl = buildPostElement(posts[i]);
        container.append(postEl);
    }
}

function buildPostElement(post) {
    let likeCount = post.likes || post.likesCount || 0;
    let commentCount = (post.comments && post.comments.length) || post.commentsCount || 0;
    let avatar = post.authorAvatar || '/assets/test_profile1.png';

    let postItem = document.createElement('div');
    postItem.classList.add('post-item');

    let authorRow = document.createElement('div');
    authorRow.classList.add('post-author-row');

    let authorLeft = document.createElement('div');
    authorLeft.classList.add('post-author');

    let avatarImg = document.createElement('img');
    avatarImg.classList.add('avatar-md');
    avatarImg.src = avatar;
    avatarImg.alt = 'Avatar';

    let authorInfo = document.createElement('div');

    let nameEl = document.createElement('div');
    nameEl.classList.add('author-name');
    nameEl.textContent = post.authorName;

    let majorEl = document.createElement('div');
    majorEl.classList.add('author-major');
    majorEl.textContent = (post.authorMajor || 'Drexel Dragon') + ' • ' + formatTimestamp(post.createdAt);

    authorInfo.append(nameEl);
    authorInfo.append(majorEl);
    authorLeft.append(avatarImg);
    authorLeft.append(authorInfo);

    let categoryTag = document.createElement('span');
    categoryTag.classList.add('post-category-tag');
    categoryTag.textContent = post.category || 'Campus Life';

    authorRow.append(authorLeft);
    authorRow.append(categoryTag);

    let isOwner = currentUser && !currentUser.isGuest && currentUser.id === post.authorId;

    if (isOwner) {
        let ownerControls = document.createElement('div');
        ownerControls.classList.add('post-owner-controls');

        let editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.classList.add('post-owner-btn');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () {
            editPost(post.id, post.content);
        });

        let deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('post-owner-btn', 'post-owner-btn-danger');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            deletePost(post.id);
        });

        ownerControls.append(editBtn);
        ownerControls.append(deleteBtn);
        authorRow.append(ownerControls);
    }

    let contentEl = document.createElement('div');
    contentEl.classList.add('post-content');
    contentEl.textContent = post.content;

    postItem.append(authorRow);
    postItem.append(contentEl);

    if (post.imageUrl) {
        let imageEl = document.createElement('img');
        imageEl.classList.add('post-image');
        imageEl.src = post.imageUrl;
        imageEl.alt = 'Post image';
        postItem.append(imageEl);
    }

    let actionsRow = document.createElement('div');
    actionsRow.classList.add('post-actions');

    let likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.classList.add('post-action-btn');
    if (post.isLiked) {
        likeBtn.classList.add('liked');
    }

    let likeIcon = document.createElement('span');
    likeIcon.textContent = post.isLiked ? '❤️' : '🤍';

    let likeText = document.createElement('span');
    likeText.textContent = likeCount + ' Likes';

    likeBtn.append(likeIcon);
    likeBtn.append(likeText);
    likeBtn.addEventListener('click', function () {
        likePost(post.id);
    });

    let commentCountEl = document.createElement('span');
    commentCountEl.classList.add('post-comment-count');
    commentCountEl.textContent = commentCount + ' Comments';

    actionsRow.append(likeBtn);
    actionsRow.append(commentCountEl);
    postItem.append(actionsRow);

    if (post.comments && post.comments.length > 0) {
        let commentsBox = document.createElement('div');
        commentsBox.classList.add('post-comments');

        for (let j = 0; j < post.comments.length; j++) {
            let c = post.comments[j];
            let commentLine = document.createElement('div');
            commentLine.classList.add('post-comment-line');

            let commentAuthor = document.createElement('span');
            commentAuthor.classList.add('post-comment-author');
            commentAuthor.textContent = c.authorName + ':';

            let commentText = document.createElement('span');
            commentText.classList.add('post-comment-text');
            commentText.textContent = c.text || c.content;

            let commentTime = document.createElement('span');
            commentTime.classList.add('post-comment-time');
            commentTime.textContent = formatTimestamp(c.createdAt);

            commentLine.append(commentAuthor);
            commentLine.append(commentText);
            commentLine.append(commentTime);

            let isCommentOwner = currentUser && !currentUser.isGuest && currentUser.id === c.authorId;
            if (isCommentOwner) {
                let deleteCommentBtn = document.createElement('button');
                deleteCommentBtn.type = 'button';
                deleteCommentBtn.classList.add('post-comment-delete-btn');
                deleteCommentBtn.textContent = 'Delete';
                deleteCommentBtn.addEventListener('click', function () {
                    deleteComment(post.id, c.id);
                });
                commentLine.append(deleteCommentBtn);
            }

            commentsBox.append(commentLine);
        }

        postItem.append(commentsBox);
    }

    let commentForm = document.createElement('div');
    commentForm.classList.add('post-comment-form');

    let commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Write a comment...';
    commentInput.classList.add('form-input', 'post-comment-input');

    let commentSubmitBtn = document.createElement('button');
    commentSubmitBtn.type = 'button';
    commentSubmitBtn.classList.add('btn', 'btn-primary', 'post-comment-submit');
    commentSubmitBtn.textContent = 'Reply';
    commentSubmitBtn.addEventListener('click', function () {
        submitComment(post.id, commentInput.value);
    });

    commentForm.append(commentInput);
    commentForm.append(commentSubmitBtn);
    postItem.append(commentForm);

    return postItem;
}

function editPost(postId, currentContent) {
    let newContent = window.prompt('Edit your post:', currentContent);
    if (newContent === null || !newContent.trim()) {
        return;
    }

    apiUpdatePost(postId, newContent.trim()).then(function (updatedPost) {
        for (let i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id === postId) {
                allPosts[i].content = updatedPost.content;
                break;
            }
        }
        renderPosts();
    }).catch(function (e) {
        console.error('Failed to edit post:', e);
    });
}

function deletePost(postId) {
    if (!window.confirm('Delete this post? This cannot be undone.')) {
        return;
    }

    apiDeletePost(postId).then(function () {
        allPosts = allPosts.filter(function (p) {
            return p.id !== postId;
        });
        renderPosts();
    }).catch(function (e) {
        console.error('Failed to delete post:', e);
    });
}

function deleteComment(postId, commentId) {
    if (!window.confirm('Delete this comment?')) {
        return;
    }

    apiDeleteComment(commentId).then(function () {
        for (let i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id === postId) {
                allPosts[i].comments = allPosts[i].comments.filter(function (c) {
                    return c.id !== commentId;
                });
                allPosts[i].commentsCount = allPosts[i].comments.length;
                break;
            }
        }
        renderPosts();
    }).catch(function (e) {
        console.error('Failed to delete comment:', e);
    });
}

function filterFeedCategory(category, btnEl) {
    activeFeedCategory = category;
    let btns = document.querySelectorAll('.cat-btn');
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    if (btnEl) {
        btnEl.classList.add('active');
    }
    renderPosts();
}

function likePost(postId) {
    if (!requireAuth()) {
        return;
    }

    apiLikePost(postId).then(function (data) {
        for (let i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id === postId) {
                allPosts[i].likes = data.likesCount;
                allPosts[i].likesCount = data.likesCount;
                allPosts[i].isLiked = data.isLiked;
                break;
            }
        }
        renderPosts();
        loadHeaderUser();
    }).catch(function (e) {
        console.error('Failed to like post:', e);
    });
}

function submitComment(postId, commentText) {
    if (!requireAuth()) {
        return;
    }

    if (!commentText || !commentText.trim()) {
        return;
    }
    commentText = commentText.trim();

    apiAddComment(postId, commentText).then(function (comment) {
        for (let i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id === postId) {
                if (!allPosts[i].comments) {
                    allPosts[i].comments = [];
                }
                allPosts[i].comments.push(comment);
                allPosts[i].commentsCount = allPosts[i].comments.length;
                break;
            }
        }
        renderPosts();
        loadHeaderUser();
    }).catch(function (e) {
        console.error('Failed to submit comment:', e);
    });
}

function handlePostSubmit(e) {
    e.preventDefault();

    if (!requireAuth()) {
        return;
    }

    let content = document.getElementById('new-post-content').value;
    let category = document.getElementById('new-post-cat').value;
    let imageUrlEl = document.getElementById('new-post-image');
    let imageUrl = imageUrlEl ? imageUrlEl.value : '';

    apiCreatePost({
        content: content,
        category: category,
        imageUrl: imageUrl
    }).then(function (newPost) {
        closeModal('post-modal');
        document.getElementById('new-post-content').value = '';
        if (imageUrlEl) imageUrlEl.value = '';
        resetImageUpload('new-post-image-file', 'new-post-image-preview', 'new-post-image');
        allPosts.unshift(newPost);
        renderPosts();
        loadHeaderUser();
    }).catch(function (e) {
        console.error('Failed to create post:', e);
    });
}

function bindPostEvents() {
    let postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', function (e) {
            handlePostSubmit(e);
        });
    }

    let categoryButtons = document.querySelectorAll('.category-filter .cat-btn');
    for (let i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].addEventListener('click', function () {
            let category = this.getAttribute('data-category');
            filterFeedCategory(category, this);
        });
    }
}
