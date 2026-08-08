// DragonHub Campus Map & Check-ins UI Module
let map = L.map('map').setView([39.9566, -75.1899], 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
