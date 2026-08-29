function formatTimestamp(isoString) {
    if (!isoString) {
        return 'Just now';
    }

    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let date = new Date(isoString);

    if (isNaN(date.getTime())) {
        return isoString;
    }

    let month = months[date.getMonth()];
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    let displayHours = hours % 12;
    if (displayHours === 0) {
        displayHours = 12;
    }

    let displayMinutes = minutes < 10 ? '0' + minutes : minutes;

    return month + ' ' + day + ', ' + displayHours + ':' + displayMinutes + ' ' + ampm;
}
