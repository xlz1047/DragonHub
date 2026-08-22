function loadNotifications() {
    return apiGetNotifications().then(function (notifications) {
        if (!notifications) {
            return;
        }
        allNotifications = notifications;

        let badge = document.querySelector('.notif-badge-count');
        let unreadCount = 0;
        for (let i = 0; i < notifications.length; i++) {
            if (!notifications[i].read) {
                unreadCount++;
            }
        }

        if (badge) {
            badge.textContent = unreadCount;
            if (unreadCount === 0) {
                badge.classList.add('hidden');
            } else {
                badge.classList.remove('hidden');
            }
        }

        renderNotificationsList();
    }).catch(function (e) {
        console.error('Failed to load notifications:', e);
    });
}

function renderNotificationsList() {
    let container = document.getElementById('notifications-list');
    if (!container) {
        return;
    }

    container.textContent = '';

    for (let i = 0; i < allNotifications.length; i++) {
        let notifEl = buildNotificationElement(allNotifications[i]);
        container.append(notifEl);
    }
}

function buildNotificationElement(n) {
    let item = document.createElement('div');
    item.classList.add('card', 'notification-item');
    if (!n.read) {
        item.classList.add('unread');
    }

    let iconEl = document.createElement('div');
    iconEl.classList.add('notification-icon');
    iconEl.textContent = '🔔';

    let body = document.createElement('div');
    body.classList.add('notification-body');

    let topRow = document.createElement('div');
    topRow.classList.add('notification-top-row');

    let titleEl = document.createElement('h4');
    titleEl.classList.add('notification-title');
    titleEl.textContent = n.title;

    let timeEl = document.createElement('span');
    timeEl.classList.add('notification-time');
    timeEl.textContent = n.timestamp || n.time || 'Today';

    topRow.append(titleEl);
    topRow.append(timeEl);

    let messageEl = document.createElement('p');
    messageEl.classList.add('notification-message');
    messageEl.textContent = n.message;

    body.append(topRow);
    body.append(messageEl);

    item.append(iconEl);
    item.append(body);

    return item;
}

function markAllNotificationsRead() {
    return apiMarkNotificationsRead().then(function () {
        for (let i = 0; i < allNotifications.length; i++) {
            allNotifications[i].read = true;
        }
        loadNotifications();
    }).catch(function (e) {
        console.error('Failed to mark notifications as read:', e);
    });
}

function bindNotificationsMarkRead() {
    let markReadBtn = document.getElementById('mark-all-read-btn');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', function () {
            markAllNotificationsRead();
        });
    }
}
