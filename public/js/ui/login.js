let currentAuthMode = 'signin';

function setAuthTab(mode) {
    currentAuthMode = mode;
    let signInBtn = document.getElementById('tab-signin');
    let signUpBtn = document.getElementById('tab-signup');
    let title = document.getElementById('auth-title');
    let subtitle = document.getElementById('auth-subtitle');
    let submitLabel = document.getElementById('auth-submit-label');
    let extraFields = document.getElementById('signup-extra-fields');
    let emailInput = document.getElementById('auth-email');
    let passwordInput = document.getElementById('auth-password');
    let errorEl = document.getElementById('login-error');

    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    if (mode === 'signin') {
        signInBtn.classList.add('active');
        signUpBtn.classList.remove('active');
        title.textContent = 'Welcome Back, Dragon';
        subtitle.textContent = 'Sign in with your Drexel credentials or Quick Demo accounts.';
        submitLabel.textContent = 'Sign In to DragonHub';
        extraFields.classList.add('hidden');
        emailInput.value = 'av942@drexel.edu';
        passwordInput.value = 'dragon123';
    } else {
        signUpBtn.classList.add('active');
        signInBtn.classList.remove('active');
        title.textContent = 'Join the Dragon Network';
        subtitle.textContent = 'Create your verified Drexel student account.';
        submitLabel.textContent = 'Create Dragon Account';
        extraFields.classList.remove('hidden');
        emailInput.value = '';
        passwordInput.value = '';
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    let errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    if (currentAuthMode === 'signup') {
        handleSignupSubmit(errorEl);
    } else {
        handleSigninSubmit(errorEl);
    }
}

function handleSigninSubmit(errorEl) {
    let email = document.getElementById('auth-email').value;
    let password = document.getElementById('auth-password').value;

    apiLogin(email, password).then(function (result) {
        if (result.ok) {
            window.location.href = '/feed.html';
        } else {
            errorEl.classList.remove('hidden');
            errorEl.textContent = result.data.error || 'Invalid Drexel credentials. Please try again.';
        }
    }).catch(function (err) {
        errorEl.classList.remove('hidden');
        errorEl.textContent = 'Server connection error. Please try again.';
    });
}

function handleSignupSubmit(errorEl) {
    let name = document.getElementById('auth-name').value;
    let major = document.getElementById('auth-major').value;
    let email = document.getElementById('auth-email').value;
    let password = document.getElementById('auth-password').value;

    if (!name.trim() || !major.trim()) {
        errorEl.classList.remove('hidden');
        errorEl.textContent = 'Please fill in your name and major.';
        return;
    }

    apiSignup({
        name: name,
        major: major,
        email: email,
        password: password
    }).then(function (result) {
        if (result.ok) {
            window.location.href = '/feed.html';
        } else {
            errorEl.classList.remove('hidden');
            errorEl.textContent = result.data.error || 'Unable to create account. Please try again.';
        }
    }).catch(function (err) {
        errorEl.classList.remove('hidden');
        errorEl.textContent = 'Server connection error. Please try again.';
    });
}

function quickSwitchLogin(userId) {
    apiSwitchUser(userId).then(function (res) {
        if (res.ok) {
            window.location.href = '/feed.html';
        }
    }).catch(function (err) {
        console.error('Quick switch failed', err);
        window.location.href = '/feed.html';
    });
}

function initLoginPage() {
    let signInTab = document.getElementById('tab-signin');
    let signUpTab = document.getElementById('tab-signup');
    if (signInTab) {
        signInTab.addEventListener('click', function () {
            setAuthTab('signin');
        });
    }
    if (signUpTab) {
        signUpTab.addEventListener('click', function () {
            setAuthTab('signup');
        });
    }

    let authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', function (e) {
            handleAuthSubmit(e);
        });
    }

    let quickSwitchButtons = document.querySelectorAll('[data-quick-switch]');
    for (let i = 0; i < quickSwitchButtons.length; i++) {
        quickSwitchButtons[i].addEventListener('click', function () {
            let userId = this.getAttribute('data-quick-switch');
            quickSwitchLogin(userId);
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initLoginPage();
});
