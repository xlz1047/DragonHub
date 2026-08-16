// DragonHub Campus Map & Check-ins UI Module
//study spots = Navy Blue 
//Food and Cafes = Gold
//Misc. = White
let map = L.map('map').setView([39.9566, -75.1899], 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//study spots: Hagerty Library, CCI, Rush Building, Korman Center, Creese Student Building
let Hlibrary = L.circleMarker ([39.955502796036434, -75.1898660394992], {
    radius: 10,          
    fillColor: "#07294D", 
    color: "#ffffff",     
    weight: 2,           
    opacity: 1,
    fillOpacity: 0.8     
}).addTo(map).bindPopup("<b>Hagerty Library</b>")

let SCIS = L.circleMarker ([39.95706043254176, -75.19523485219506], {
    radius: 10,          
    fillColor: "#07294D", 
    color: "#ffffff",     
    weight: 2,           
    opacity: 1,
    fillOpacity: 0.8     
}).addTo(map).bindPopup("<b>Drexel SCIS</b>")

let Korman = L.circleMarker ([39.95500720368072, -75.18885577700131], {
    radius: 10,          
    fillColor: "#07294D", 
    color: "#ffffff",     
    weight: 2,           
    opacity: 1,
    fillOpacity: 0.8     
}).addTo(map).bindPopup("<b>Korman Center</b>")

let Creese = L.circleMarker ([39.953772677409155, -75.18853130583709], {
    radius: 10,          
    fillColor: "#07294D", 
    color: "#ffffff",     
    weight: 2,           
    opacity: 1,
    fillOpacity: 0.8     
}).addTo(map).bindPopup("<b>Creese Student Center</b>")


//food and cafes: Board and Brew, KFT, Madi's coffee Roasters, Paris Baguette
let BnB = L.circleMarker ([39.9525, -75.1893], {
    radius: 10,          
    fillColor: "#FFC600", 
    color: "#ffffff",     
    weight: 2,           
    opacity: 1,
    fillOpacity: 0.8     
}).addTo(map).bindPopup("<b>The Board & Brew</b>");

let Madis = L.circleMarker ([39.95862688308151, -75.19316252574336], {
    radius: 10,          
    fillColor: "#FFC600", 
    color: "#ffffff",     
    weight: 2,           
    opacity: 1,
    fillOpacity: 0.8     
}).addTo(map).bindPopup("<b>Madi's Coffee Roasters</b>");

let KFT = L.circleMarker ([39.95733747318607, -75.18818153417656], {
    radius: 10,          
    fillColor: "#FFC600", 
    color: "#ffffff",     
    weight: 2,           
    opacity: 1,
    fillOpacity: 0.8     
}).addTo(map).bindPopup("<b>Kung Fu Tea</b>");

let PB = L.circleMarker ([39.95781998106294, -75.20029826332778], {
    radius: 10,          
    fillColor: "#FFC600", 
    color: "#ffffff",     
    weight: 2,           
    opacity: 1,
    fillOpacity: 0.8     
}).addTo(map).bindPopup("<b>Paris Baguette</b>");

document.getElementById("userLoc").addEventListener("click", function(){
    console.log("button clicked");
navigator.geolocation.getCurrentPosition(function (position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    map.setView([latitude, longitude], 15);
    L.circleMarker([latitude, longitude],{
        radius: 8,
        fillColor: "#4285F4",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1
    }).addTo(map).bindPopup("You are here!").openPopup();

})});
