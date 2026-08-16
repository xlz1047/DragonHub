// DragonHub Campus Feed UI Module

window.FeedUI = {
  render() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    let posts = window.AppState.posts;
    const cat = window.AppState.activeFeedCat;
    const search = window.AppState.globalSearchQuery;

    if (cat !== 'All') {
      posts = posts.filter((p) => p.category === cat);
    }

    if (search) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.content.toLowerCase().includes(search) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(search)))
      );
    }

    if (posts.length === 0) {
      container.innerHTML = `<div class="bg-white p-8 rounded-2xl text-center text-slate-500 text-xs">No campus posts found matching your search.</div>`;
      return;
    }

    container.innerHTML = posts
      .map(
        (post) => `
      <div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3 card-hover">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <img src="${post.authorAvatar}" class="w-10 h-10 rounded-full object-cover border border-[#FFC600]" />
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-xs text-slate-900">${post.authorName}</span>
                ${post.isVerified ? `<span class="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">@drexel.edu</span>` : ''}
              </div>
              <p class="text-[10px] text-slate-500">${post.authorMajor} • ${post.timestamp}</p>
            </div>
          </div>
          <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md">${post.category}</span>
        </div>

        <div>
          <h4 class="font-bold text-sm text-slate-900 mb-1">${post.title}</h4>
          <p class="text-xs text-slate-700 leading-relaxed">${post.content}</p>
        </div>

        ${
          post.mediaUrl
            ? `<img src="${post.mediaUrl}" class="w-full h-48 object-cover rounded-xl border border-slate-200" />`
            : ''
        }

        ${
          post.locationTag
            ? `<div class="inline-flex items-center gap-1 text-[11px] font-bold text-[#07294D] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                <i data-lucide="map-pin" class="w-3 h-3 text-[#FFC600]"></i> ${post.locationTag}
              </div>`
            : ''
        }

        <!-- Action Footer -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button onclick="window.FeedUI.likePost('${post.id}')" class="flex items-center gap-1.5 font-bold ${post.isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'}">
            <i data-lucide="heart" class="w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}"></i> ${post.likes} Likes
          </button>
          <span class="text-slate-400 text-[11px]">${post.comments ? post.comments.length : 0} Comments</span>
        </div>

        <!-- Comments List -->
        ${
          post.comments && post.comments.length > 0
            ? `<div class="bg-slate-50 p-3 rounded-xl space-y-2 mt-2">
                ${post.comments
                  .map(
                    (c) => `
                  <div class="text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                    <span class="font-bold text-slate-900">${c.authorName}:</span>
                    <span class="text-slate-700 ml-1">${c.content}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>`
            : ''
        }

        <!-- Add Comment Input -->
        <div class="flex gap-2 pt-1">
          <input id="comment-input-${post.id}" type="text" placeholder="Write a reply..." class="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          <button onclick="window.FeedUI.submitComment('${post.id}')" class="px-4 py-2 rounded-xl bg-[#07294D] text-[#FFC600] font-bold text-xs hover:bg-[#0a3869]">Reply</button>
        </div>
      </div>
    `
      )
      .join('');

    if (window.lucide) window.lucide.createIcons();
  },

  filterCategory(category, btnEl) {
    window.AppState.activeFeedCat = category;
    document.querySelectorAll('.feed-cat-btn').forEach((b) => {
      b.className = 'feed-cat-btn px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs';
    });
    if (btnEl) {
      btnEl.className = 'feed-cat-btn px-3.5 py-1.5 rounded-full bg-[#07294D] text-[#FFC600] font-bold text-xs';
    }
    this.render();
  },

  async likePost(postId) {
    const data = await window.AppAPI.likePost(postId);
    const post = window.AppState.posts.find((p) => p.id === postId);
    if (post) {
      post.likes = data.likes;
      post.isLiked = data.isLiked;
      this.render();
    }
  },

  async submitComment(postId) {
    const inputEl = document.getElementById(`comment-input-${postId}`);
    if (!inputEl || !inputEl.value.trim()) return;

    const comment = await window.AppAPI.addComment(postId, inputEl.value.trim());
    const post = window.AppState.posts.find((p) => p.id === postId);
    if (post) {
      if (!post.comments) post.comments = [];
      post.comments.push(comment);
      window.AppState.currentUser.totalPoints += 5;
      window.HeaderUI.updateHeader();
      this.render();
    }
  },

  renderPoll() {
    const container = document.getElementById('poll-content');
    const polls = window.AppState.polls;
    if (!container || !polls || !polls.length) return;

    const poll = polls[0];

    container.innerHTML = `
      <p class="text-xs font-bold text-slate-800 mb-3">${poll.question}</p>
      <div class="space-y-2">
        ${poll.options
          .map((opt) => {
            const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
            const isVoted = poll.userVotedOptionId === opt.id;
            return `
            <button onclick="window.FeedUI.votePoll('${poll.id}', '${opt.id}')" ${poll.userVotedOptionId ? 'disabled' : ''} class="w-full text-left p-2.5 rounded-xl border ${
              isVoted ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
            } relative overflow-hidden transition-all">
              <div class="absolute left-0 top-0 bottom-0 bg-[#FFC600]/20" style="width: ${pct}%"></div>
              <div class="relative z-10 flex justify-between items-center text-xs font-medium text-slate-800">
                <span>${opt.text}</span>
                <span class="font-bold text-[11px]">${pct}%</span>
              </div>
            </button>
          `;
          })
          .join('')}
      </div>
      <div class="text-[10px] text-slate-400 pt-2 text-right">${poll.totalVotes} Drexel votes recorded</div>
    `;
  },

  async votePoll(pollId, optionId) {
    const updatedPoll = await window.AppAPI.votePoll(pollId, optionId);
    window.AppState.polls[0] = updatedPoll;
    window.AppState.currentUser.totalPoints += 10;
    window.HeaderUI.updateHeader();
    this.renderPoll();
  }
};
