// DragonHub Achievements & DREAMER Badges UI Module

window.AchievementsUI = {
  render() {
    const user = window.AppState.currentUser;
    const badges = window.AppState.badges;
    if (!user) return;

    const avatarEl = document.getElementById('achieve-avatar');
    const nameEl = document.getElementById('achieve-name');
    const majorEl = document.getElementById('achieve-major');
    const ptsEl = document.getElementById('achieve-points');
    const streakEl = document.getElementById('achieve-streak');
    const countEl = document.getElementById('achieve-badges-count');
    const badgesContainer = document.getElementById('badges-container');

    if (avatarEl) avatarEl.src = user.avatarUrl;
    if (nameEl) nameEl.innerText = user.name;
    if (majorEl) majorEl.innerText = `${user.major} • Class of ${user.gradYear}`;
    if (ptsEl) ptsEl.innerText = user.totalPoints;
    if (streakEl) streakEl.innerText = `${user.streak}d`;

    const unlockedCount = badges.filter((b) => user.badgesEarned && user.badgesEarned.includes(b.id)).length;
    if (countEl) countEl.innerText = `${unlockedCount}/${badges.length}`;

    if (badgesContainer) {
      badgesContainer.innerHTML = badges
        .map((b) => {
          const isUnlocked = user.badgesEarned && user.badgesEarned.includes(b.id);
          return `
          <div class="p-4 rounded-2xl border flex items-start gap-3 ${
            isUnlocked ? 'bg-white border-amber-300' : 'bg-slate-100 border-slate-200 opacity-70'
          }">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isUnlocked ? 'bg-[#FFC600] text-[#07294D] font-bold' : 'bg-slate-300 text-slate-500'
            }">
              🏆
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-xs text-slate-900">${b.title}</h4>
                <span class="text-[10px] font-bold ${isUnlocked ? 'text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded' : 'text-slate-400'}">
                  ${isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <p class="text-[11px] text-slate-600 leading-tight">${b.description}</p>
              <div class="text-[10px] font-bold text-[#07294D] pt-1">+${b.points} Pts</div>
            </div>
          </div>
        `;
        })
        .join('');
    }
  }
};
