const _BASE_URL = "localhost:3000"

const petFormElem = document.getElementById("pet-form");
const petListElem = document.getElementById("pet-list");

// Send GET reqr for pets, populate page with cards
fetch("/allPets")
  .then((resObj) => {
    return resObj.json();
  }).then((res) => {
    loadPetCards(res.pets);
  });

// Handle form submission: send pet data to server,
// add card after response is received
petFormElem.addEventListener("submit", (ev) => {
  // prevent page reload
  ev.preventDefault();

  const fd = new FormData(petFormElem);
  
  // send form data to server
  fetch("/pet", {
    method: "POST",
    body: JSON.stringify({
      name: fd.get("name"),
      picture: fd.get("picture"),
      species: fd.get("species"),
      friendly: fd.has("friendly") // unchecked -> not in data
    }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  }).then((resObj) => {
    return resObj.json();
  }).then((pet) => {
    // clear form
    petFormElem.reset();
    // add new pet card (with ID from server)
    addPetCard(pet.id, pet.name, pet.picture, pet.species, pet.friendly);
  });
});


/*
 * Adds a new pet <li> to the pet list display
 * Parameters:
 *  - petName - Name of the pet
 *  - imageURL - URL for image src
 *  - species - Pet species name
 *  - petID - Unique identifier number for pet
*/
function loadPetCards(pets) {
  for (const pet of pets) {
    addPetCard(pet.id, pet.name, pet.picture, pet.species, pet.friendly);
  }
}

/*
 * Adds a new pet <li> to the pet list display
 * Parameters:
 *  - petName - Name of the pet
 *  - imageURL - URL for image src
 *  - species - Pet species name
 *  - petID - Unique identifier number for pet
*/
function addPetCard(petID, petName, imageURL, species, friendly) {
  // Removes potential HTML elements from HTML string
  // to prevent HTML injection
  const sanitize = (str) => str.replace(/<[^>]*>/g, "");
  petName = sanitize(petName);
  imageURL = sanitize(imageURL);
  species = sanitize(species);

  // inserts <li> after last child of pet list
  petListElem.insertAdjacentHTML("beforeend",
`<li id="pet-card-${petID}">
  <h3>${petName}</h3>
  <img src="${imageURL}" alt="${petName}">
  <p>${friendly ? "Friendly!" : "Not so friendly..."}</p>
  <p>Species: ${species}</p>
  <button onclick="removePet(${petID})">Remove</button>
</li>`
  );
}

/*
 * Removes a pet card from the database and display
 * Parameters:
 *  - petID - Unique identifier number for pet
*/
function removePet(petID) {
  fetch("/pet/" + String(petID), {
    method: "DELETE"
  }).then(() => {
    document.getElementById("pet-card-" + petID).remove();
  }).catch(() => {
    console.log("Error deleting:", )
  })
}