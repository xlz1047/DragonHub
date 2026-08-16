// DragonHub Header & Notifications UI Module

window.HeaderUI = {
  updateHeader() {
    const user = window.AppState.currentUser;
    if (!user) return;

    const avatarEl = document.getElementById('header-avatar');
    const nameEl = document.getElementById('header-name');
    const majorEl = document.getElementById('header-major');
    const createAvatarEl = document.getElementById('create-post-avatar');
    const navPtsEl = document.getElementById('nav-points-badge');

    if (avatarEl) avatarEl.src = user.avatarUrl;
    if (createAvatarEl) createAvatarEl.src = user.avatarUrl;
    if (nameEl) nameEl.innerText = user.name;
    if (majorEl) majorEl.innerText = `${user.major || 'Drexel Dragon'}`;
    if (navPtsEl) navPtsEl.innerText = `${user.totalPoints} Pts`;
  },

  renderNotifications() {
    const notifications = window.AppState.notifications;
    const container = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    if (!container) return;

    const unreadCount = notifications.filter((n) => !n.read).length;
    if (badge) {
      if (unreadCount === 0) badge.classList.add('hidden');
      else badge.classList.remove('hidden');
    }

    container.innerHTML = notifications
      .map(
        (n) => `
      <div class="p-2.5 rounded-xl ${n.read ? 'bg-slate-50' : 'bg-amber-50 border border-amber-200'}">
        <div class="font-bold text-slate-900 text-xs">${n.title}</div>
        <div class="text-[11px] text-slate-600">${n.message}</div>
        <div class="text-[9px] text-slate-400 mt-1">${n.timestamp}</div>
      </div>
    `
      )
      .join('');
  },

  toggleNotifDropdown() {
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
  },

  async markNotifsRead() {
    await window.AppAPI.markNotificationsRead();
    window.AppState.notifications.forEach((n) => (n.read = true));
    this.renderNotifications();
  },

  handleSearch(query) {
    window.AppState.globalSearchQuery = query.toLowerCase().trim();
    if (window.FeedUI) window.FeedUI.render();
    if (window.EatsUI) window.EatsUI.render();
    if (window.MarketplaceUI) window.MarketplaceUI.render();
    if (window.MapUI) window.MapUI.render();
  }
};
