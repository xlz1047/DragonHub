// DragonHub Main Application Entry Point & Tab Router

document.addEventListener('DOMContentLoaded', () => {
  window.DragonHubApp.init();
});

window.DragonHubApp = {
  async init() {
    try {
      await this.loadData();
    } catch (err) {
      console.error('DragonHub initialization error:', err);
    }
  },

  async loadData() {
    const userResponse = await fetch('/api/user');

    if (!userResponse.ok) {
      if (window.AuthUI) window.AuthUI.openScreen();
      return;
    }

    const user = await userResponse.json();

    const [feed, vendors, marketplace, polls, landmarks, badges, notifications] = await Promise.all([
      window.AppAPI.getFeed(),
      window.AppAPI.getVendors(),
      window.AppAPI.getMarketplace(),
      window.AppAPI.getPolls(),
      window.AppAPI.getLandmarks(),
      window.AppAPI.getBadges(),
      window.AppAPI.getNotifications(),
    ]);

    window.AppState.setUser(user);
    window.AppState.setPosts(feed);
    window.AppState.setVendors(vendors);
    window.AppState.setMarketplaceItems(marketplace);
    window.AppState.setPolls(polls);
    window.AppState.setLandmarks(landmarks);
    window.AppState.setBadges(badges);
    window.AppState.setNotifications(notifications);

    window.HeaderUI.updateHeader();
    window.HeaderUI.renderNotifications();
    window.FeedUI.render();
    window.FeedUI.renderPoll();
    window.EatsUI.render();
    window.MarketplaceUI.render();
    window.MapUI.render();
    window.AchievementsUI.render();

    if (window.lucide) window.lucide.createIcons();
  },

  switchTab(tabName) {
    window.AppState.activeTab = tabName;

    const panes = ['feed', 'eats', 'marketplace', 'map', 'achievements'];
    panes.forEach((p) => {
      const paneEl = document.getElementById(`pane-${p}`);
      const btnEl = document.getElementById(`tab-btn-${p}`);
      if (paneEl) paneEl.classList.add('hidden');
      if (btnEl) btnEl.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#07294D] border border-transparent transition-all shrink-0';
    });

    const activePane = document.getElementById(`pane-${tabName}`);
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);

    if (activePane) activePane.classList.remove('hidden');
    if (activeBtn) activeBtn.className = 'active-tab flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-transparent transition-all shrink-0';

    if (window.lucide) window.lucide.createIcons();
  }
};
