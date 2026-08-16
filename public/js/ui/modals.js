// DragonHub Modals & Forms UI Module

window.ModalsUI = {
  // Profile Modal
  openProfile() {
    const user = window.AppState.currentUser;
    if (user) {
      document.getElementById('edit-name').value = user.name;
      document.getElementById('edit-major').value = user.major;
      document.getElementById('edit-grad').value = user.gradYear;
      document.getElementById('edit-bio').value = user.bio || '';
    }
    document.getElementById('modal-profile').classList.remove('hidden');
  },

  closeProfile() {
    document.getElementById('modal-profile').classList.add('hidden');
  },

  async handleProfileSave(e) {
    e.preventDefault();
    const name = document.getElementById('edit-name').value;
    const major = document.getElementById('edit-major').value;
    const gradYear = document.getElementById('edit-grad').value;
    const bio = document.getElementById('edit-bio').value;

    const updatedUser = await window.AppAPI.updateUserProfile({ name, major, gradYear, bio });
    window.AppState.setUser(updatedUser);
    this.closeProfile();
  },

  // Create Post Modal
  openCreatePost() {
    document.getElementById('modal-create-post').classList.remove('hidden');
  },

  closeCreatePost() {
    document.getElementById('modal-create-post').classList.add('hidden');
  },

  async handlePostCreate(e) {
    e.preventDefault();
    const title = document.getElementById('post-title').value;
    const category = document.getElementById('post-category').value;
    const locationTag = document.getElementById('post-location').value;
    const content = document.getElementById('post-content').value;

    const newPost = await window.AppAPI.createPost({ title, category, locationTag, content });
    window.AppState.posts.unshift(newPost);
    window.AppState.currentUser.totalPoints += 15;
    window.HeaderUI.updateHeader();
    window.FeedUI.render();
    this.closeCreatePost();
  },

  // Create Listing Modal
  openCreateListing() {
    document.getElementById('modal-create-listing').classList.remove('hidden');
  },

  closeCreateListing() {
    document.getElementById('modal-create-listing').classList.add('hidden');
  },

  async handleListingCreate(e) {
    e.preventDefault();
    const title = document.getElementById('list-title').value;
    const price = document.getElementById('list-price').value;
    const category = document.getElementById('list-category').value;
    const condition = document.getElementById('list-condition').value;
    const description = document.getElementById('list-desc').value;

    const newItem = await window.AppAPI.createListing({ title, price, category, condition, description });
    window.AppState.marketplaceItems.unshift(newItem);
    window.AppState.currentUser.totalPoints += 25;
    window.HeaderUI.updateHeader();
    window.MarketplaceUI.render();
    this.closeCreateListing();
  }
};
