function loadProfile() {
    return apiGetCurrentUser().then(function (user) {
        if (!user) {
            return;
        }

        let nameInput = document.getElementById('profile-name');
        let majorInput = document.getElementById('profile-major');
        let yearSelect = document.getElementById('profile-year');
        let coopInput = document.getElementById('profile-coop');
        let bioInput = document.getElementById('profile-bio');
        let nameDisplay = document.getElementById('profile-name-display');
        let emailDisplay = document.getElementById('profile-email-display');
        let avatarEl = document.getElementById('profile-avatar');
        let cardName = document.getElementById('dragoncard-name');
        let cardId = document.getElementById('dragoncard-id');
        let cardAvatar = document.getElementById('dragoncard-avatar');

        if (nameInput) nameInput.value = user.name || '';
        if (majorInput) majorInput.value = user.major || '';
        if (yearSelect) yearSelect.value = user.classYear || 'Senior';
        if (coopInput) coopInput.value = user.coop || '';
        if (bioInput) bioInput.value = user.bio || '';
        if (nameDisplay) nameDisplay.textContent = user.name;
        if (emailDisplay) emailDisplay.textContent = user.email;
        if (avatarEl) avatarEl.src = user.avatarUrl;
        if (cardName) cardName.textContent = user.name;
        if (cardId) cardId.textContent = 'ID: ' + (user.studentId || '14892019') + ' • STUDENT';
        if (cardAvatar) cardAvatar.src = user.avatarUrl;
    }).catch(function (e) {
        console.error('Failed to load profile:', e);
    });
}

function handleProfileUpdate(e) {
    e.preventDefault();

    let name = document.getElementById('profile-name').value;
    let major = document.getElementById('profile-major').value;
    let classYear = document.getElementById('profile-year').value;
    let coopInput = document.getElementById('profile-coop');
    let bioInput = document.getElementById('profile-bio');
    let coop = coopInput ? coopInput.value : '';
    let bio = bioInput ? bioInput.value : '';

    return apiUpdateProfile({
        name: name,
        major: major,
        classYear: classYear,
        coop: coop,
        bio: bio
    }).then(function (updated) {
        if (updated) {
            alert('Profile saved successfully!');
            loadHeaderUser();
            loadProfile();
        }
    }).catch(function (err) {
        console.error('Failed to update profile:', err);
    });
}

function switchAccount(userId) {
    return apiSwitchUser(userId).then(function (res) {
        if (res.ok) {
            window.location.reload();
        }
    }).catch(function (e) {
        console.error('Failed to switch user:', e);
    });
}

function bindProfileForm() {
    let profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            handleProfileUpdate(e);
        });
    }
}

function bindSwitchAccountButtons() {
    let switchButtons = document.querySelectorAll('[data-switch-user]');
    for (let i = 0; i < switchButtons.length; i++) {
        switchButtons[i].addEventListener('click', function () {
            let userId = this.getAttribute('data-switch-user');
            switchAccount(userId);
        });
    }
}
