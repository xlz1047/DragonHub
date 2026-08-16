// DragonHub Drexel Marketplace UI Module

window.MarketplaceUI = {
  render() {
    const container = document.getElementById('marketplace-container');
    if (!container) return;

    let items = window.AppState.marketplaceItems;
    const search = window.AppState.globalSearchQuery;

    if (search) {
      items = items.filter(
        (m) =>
          m.title.toLowerCase().includes(search) ||
          m.description.toLowerCase().includes(search) ||
          m.category.toLowerCase().includes(search)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `<div class="bg-white p-8 rounded-2xl text-center text-slate-500 text-xs col-span-3">No marketplace listings found.</div>`;
      return;
    }

    container.innerHTML = items
      .map(
        (item) => `
      <div class="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200 flex flex-col justify-between card-hover">
        <div>
          <div class="relative h-48 overflow-hidden bg-slate-100">
            <img src="${item.imageUrl}" class="w-full h-full object-cover" />
            <div class="absolute top-3 left-3 bg-[#07294D] text-[#FFC600] font-black text-xs px-3 py-1.5 rounded-full shadow-md">
              $${item.price}
            </div>
            <button onclick="window.MarketplaceUI.toggleSaveListing('${item.id}')" class="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-500 shadow-sm hover:scale-105 transition-transform">
              <i data-lucide="bookmark" class="w-4 h-4 ${item.isSaved ? 'fill-rose-500' : ''}"></i>
            </button>
          </div>

          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between text-[10px]">
              <span class="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">${item.category}</span>
              <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">${item.condition}</span>
            </div>

            <h3 class="font-bold text-sm text-slate-900 leading-snug">${item.title}</h3>
            <p class="text-xs text-slate-600 line-clamp-2">${item.description}</p>
          </div>
        </div>

        <div class="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="${item.sellerAvatar}" class="w-6 h-6 rounded-full object-cover" />
            <span class="text-xs font-bold text-slate-800">${item.sellerName}</span>
          </div>
          <a href="mailto:${item.sellerEmail}?subject=DragonHub Marketplace: ${encodeURIComponent(item.title)}" class="text-xs font-bold text-[#07294D] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
            Contact Seller
          </a>
        </div>
      </div>
    `
      )
      .join('');

    if (window.lucide) window.lucide.createIcons();
  },

  async toggleSaveListing(itemId) {
    const data = await window.AppAPI.toggleSaveListing(itemId);
    const item = window.AppState.marketplaceItems.find((i) => i.id === itemId);
    if (item) {
      item.isSaved = data.isSaved;
      this.render();
    }
  }
};
