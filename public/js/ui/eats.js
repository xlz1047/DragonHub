// DragonHub Discover Eats UI Module
let eatsPlaces =  [
    {
    name: "The Board and Brew",
    location: "3200 Chestnut St, Philadelphia, PA 19104",
    category: "Dine-In",
    rating: 4.8,
    tags: ["Dine-In", "All-Day", "Cafe", "Study Spot"],
    image: "Image"
},
{
    name: "Nanu's Hot Chicken",
    location: "3301 Market Street",
    category: "Food Truck",
    rating: 4.8,
    tags: ["Food Truck", "Halal", "Hot Chicken"],
    image: "Image"
},

{
    name: "Madi's Coffee Roasters",
    location: "3527 Lancaster Ave, Philadelphia, PA 19104",
    category: "Dine-In",
    rating: 4.8,
    tags: ["Dine-In", "Brunch", "Cafe", "Study Spot"],
    image: "Image"
},

{
    name: "Halal Cart",
    location: "12 S 33rd St, Philadelphia, PA 19104",
    category: "Food Truck",
    rating: 4.7,
    tags: ["Food Truck", "Halal", "Rice"],
    image: "Image"
}];

//Food Trucks to Add: Kc's Smoothie, Kami, Pete's Little Lunchbox
//Restaurants to Add: Greek from Greece, Paris Baguette, Dunkin, Pita Chip, Shake Shack, Sava's, Ed's, Mango Mango, Coco's


function listEats(vendor){
    const card = document.createElement("div");
    let eatName = document.createElement("h3");
    eatName.textContent = vendor.name;
    card.appendChild(eatName);
    let location = document.createElement("p");
    location.textContent = vendor.location;
    card.appendChild(location);
    let rating = document.createElement("p");
    rating.textContent = vendor.rating;
    card.appendChild(rating);
    let review = document.createElement("button");
    review.textContent = "View Reviews";
    card.appendChild(review);
    review.addEventListener("click", function(){
        document.getElementById("modal-reviews-title").textContent = vendor.name;
        window.ModalsUI.openReview();
    });
    document.getElementById("vendors-container").appendChild(card);


    //tailwind formatting -> how our card will be created
    card.className = "bg-white rounded-2xl shadow-md border border-slate-200 p-4 space-y-2";
    eatName.className = "font-bold text-lg text-[#07294D]";
    location.className = "text-xs text-slate-500";
    rating.className = "text-sm font-bold text-amber-500";
}
    for (let vendor of eatsPlaces){
        listEats(vendor);
    };