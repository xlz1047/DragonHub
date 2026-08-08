// DragonHub Central Application State Store

window.AppState = {
  currentUser: null,
  posts: [],
  vendors: [],
  marketplaceItems: [],
  polls: [],
  landmarks: [],
  badges: [],
  notifications: [],
  activeTab: 'feed',
  activeFeedCat: 'All',
  activeEatsCat: 'All',
  globalSearchQuery: '',

  setUser(user) {
    this.currentUser = user;
    if (window.HeaderUI) window.HeaderUI.updateHeader();
    if (window.AchievementsUI) window.AchievementsUI.render();
  },

  setPosts(posts) {
    this.posts = posts;
  },

  setVendors(vendors) {
    this.vendors = vendors;
  },

  setMarketplaceItems(items) {
    this.marketplaceItems = items;
  },

  setPolls(polls) {
    this.polls = polls;
  },

  setLandmarks(landmarks) {
    this.landmarks = landmarks;
  },

  setBadges(badges) {
    this.badges = badges;
  },

  setNotifications(notifications) {
    this.notifications = notifications;
  }
};
