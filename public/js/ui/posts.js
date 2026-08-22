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
    majorEl.textContent = (post.authorMajor || 'Drexel Dragon') + ' • ' + (post.createdAt || 'Just now');

    authorInfo.append(nameEl);
    authorInfo.append(majorEl);
    authorLeft.append(avatarImg);
    authorLeft.append(authorInfo);

    let categoryTag = document.createElement('span');
    categoryTag.classList.add('post-category-tag');
    categoryTag.textContent = post.category || 'Campus Life';

    authorRow.append(authorLeft);
    authorRow.append(categoryTag);

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

            commentLine.append(commentAuthor);
            commentLine.append(commentText);
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
    apiLikePost(postId).then(function (data) {
        for (let i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id === postId) {
                allPosts[i].likes = data.likes || (allPosts[i].likes || 0) + 1;
                allPosts[i].likesCount = allPosts[i].likes;
                allPosts[i].isLiked = true;
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
