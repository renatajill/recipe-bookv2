const firebaseConfig = {
    apiKey: "AIzaSyDLNaqC3Zpf7K7lqhPb6yP587E8MyrhfxQ",

    authDomain: "humber-87697.firebaseapp.com",

    projectId: "humber-87697",

    storageBucket: "humber-87697.appspot.com",

    messagingSenderId: "392599396438",

    appId: "1:392599396438:web:4bae958a205bf35a129bf7",

    measurementId: "G-5G5C6QW4XP",
};

firebase.initializeApp(firebaseConfig);

const addRecipeForm = document.getElementById("addRecipeForm");
const db = firebase.firestore();
const storage = firebase.storage();

addRecipeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const recipeName = document.getElementById("recipeName").value;
    const fileInput = document.getElementById("file");
    const recipeIngredients =
        document.getElementById("recipeIngredients").value;
    const recipeInstructions =
        document.getElementById("recipeInstructions").value;
    const recipeCreator = "";
    const file = fileInput.files[0];

    console.log(
        `name ${recipeName}, pic ${file}, ingredients ${recipeIngredients}, instruction ${recipeInstructions}`
    );
    // storage location
    const storageRef = storage.ref().child(`recipeImages/${file.name}`);

    // Firebase Storage
    storageRef
        .put(file)
        .then(() => {
            // download URL of file
            return storageRef.getDownloadURL();
        })
        .then((downloadURL) => {
            console.log(
                `name ${recipeName}, pic ${downloadURL}, ingredients ${recipeIngredients}, instruction ${recipeInstructions}`
            );
            let id = db.collection("recipes").doc().id;
            firebase
                .firestore()
                .collection("recipes")
                .doc(id)
                .set({
                    name: recipeName,
                    image: downloadURL,
                    ingredients: recipeIngredients,
                    instructions: recipeInstructions,
                })
                .then(() => {
                    console.log("New pet added to the database.");
                })
                .catch((err) => {
                    console.log("db set error: ", err);
                });

            recipeName.value = "";
            fileInput.value = "";
            recipeIngredients.value = "";
            recipeInstructions.value = "";
            // location.reload();
            updateCards();
        })
        .catch((error) => {
            console.error("Error adding recipe: ", error);
        });
});

const savedRecipesDiv = document.getElementById("savedRecipesDiv");
const modal = document.getElementById("recipeModal");
const modalRecipeName = document.getElementById("modalRecipeName");
const modalIngredients = document.getElementById("modalIngredients");
const modalInstructions = document.getElementById("modalInstructions");
const closeBtn = document.getElementsByClassName("close")[0];
const deleteBtn = document.getElementById("deleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let currentRecipeId = null; // ID of displayed recipe

// recipe data from Firestore

function updateCards() {
    savedRecipesDiv.innerHTML = "";

    db.collection("recipes")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const recipeData = doc.data();
                const recipeId = doc.id;
                const recipeName = recipeData.name;
                const recipeImage = recipeData.image;
                const recipeIngredients = recipeData.ingredients;
                const recipeInstructions = recipeData.instructions;

                // recipe card HTML
                const recipeCard = document.createElement("div");
                recipeCard.className = "recipe-card";

                const recipeImageElement = document.createElement("img");
                recipeImageElement.src = recipeImage;
                recipeImageElement.alt = recipeName;

                const recipeNameElement = document.createElement("h3");
                recipeNameElement.textContent = recipeName;

                // Append the elements
                recipeCard.appendChild(recipeImageElement);
                recipeCard.appendChild(recipeNameElement);

                recipeCard.addEventListener("click", () => {
                    modalRecipeName.textContent = recipeName;
                    modalIngredients.textContent = recipeIngredients;
                    modalInstructions.textContent = recipeInstructions;

                    currentRecipeId = recipeId;
                    currentRecipeImage = recipeImage;

                    modal.style.display = "block";
                });

                // recipe card to the savedRecipesDiv
                savedRecipesDiv.appendChild(recipeCard);
            });
        })
        .catch((error) => {
            console.error("Error retrieving recipes: ", error);
        });
}

// Close the modal
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

//confirmation popup for delete button
deleteBtn.addEventListener("click", () => {
    const confirmationPopup = document.getElementById("confirmationPopup");
    confirmationPopup.style.display = "block";
});

confirmDeleteBtn.addEventListener("click", () => {
    // Hide the confirmation popup
    confirmationPopup.style.display = "none";

    // Delete the recipe from Firestore
    db.collection("recipes")
        .doc(currentRecipeId)
        .delete()
        .then(() => {
            console.log("Recipe document deleted from database");

            // Create a reference to the image in storage using its URL
            const imageRef = storage.refFromURL(currentRecipeImage);

            // Delete the image from storage
            imageRef
                .delete()
                .then(() => {
                    //location.reload();
                    console.log("Image deleted from storage");
                    // Remove the recipe card from the UI
                    const recipeCard = document.querySelector(
                        `[data-recipe-id="${currentRecipeId}"]`
                    );
                    if (recipeCard) {
                        recipeCard.remove();
                    } else {
                        console.warn("Recipe card not found in the UI");
                    }
                })
                .catch((error) => {
                    console.error("Error deleting image from storage: ", error);
                });
            updateCards();
        })
        .catch((error) => {
            console.error("Error deleting recipe document: ", error);
        });
});

// Event listener for the cancel delete button in the confirmation popup
cancelDeleteBtn.addEventListener("click", () => {
    // Hide the confirmation popup
    confirmationPopup.style.display = "none";
});

updateCards();

// const addRecipeForm = document.getElementById("addRecipeForm");
// const db = firebase.firestore();
// const storage = firebase.storage();
// updateCards();

// addRecipeForm.addEventListener("submit", (event) => {
//     event.preventDefault();
//     const recipeName = document.getElementById("recipeName").value;
//     const fileInput = document.getElementById("file");
//     const recipeIngredients =
//         document.getElementById("recipeIngredients").value;
//     const recipeInstructions =
//         document.getElementById("recipeInstructions").value;
//     const user = firebase.auth().currentUser.uid;
//     const file = fileInput.files[0];

//     console.log(
//         `name ${recipeName}, pic ${file}, ingredients ${recipeIngredients}, instruction ${recipeInstructions}, recipe creator ${user}`
//     );
//     // storage location
//     const storageRef = storage.ref().child(`recipeImages/${file.name}`);

//     // Firebase Storage
//     storageRef
//         .put(file)
//         .then(() => {
//             // download URL of file
//             return storageRef.getDownloadURL();
//         })
//         .then((downloadURL) => {
//             console.log(
//                 `name ${recipeName}, pic ${downloadURL}, ingredients ${recipeIngredients}, instruction ${recipeInstructions}, user ${user}`
//             );
//             let id = db.collection("recipes").doc().id;
//             firebase
//                 .firestore()
//                 .collection("recipes")
//                 .doc(id)
//                 .set({
//                     user: user,
//                     name: recipeName,
//                     image: downloadURL,
//                     ingredients: recipeIngredients,
//                     instructions: recipeInstructions,
//                 })
//                 .then(() => {
//                     console.log("New recipe added to the database.");
//                 })
//                 .catch((err) => {
//                     console.log("db set error: ", err);
//                 });

//             recipeName.value = "";
//             fileInput.value = "";
//             recipeIngredients.value = "";
//             recipeInstructions.value = "";
//             // location.reload();
//             updateCards();
//         })
//         .catch((error) => {
//             console.error("Error adding recipe: ", error);
//         });
// });

// const savedRecipesDiv = document.getElementById("savedRecipesDiv");
// const modal = document.getElementById("recipeModal");
// const modalRecipeName = document.getElementById("modalRecipeName");
// const modalIngredients = document.getElementById("modalIngredients");
// const modalInstructions = document.getElementById("modalInstructions");
// const closeBtn = document.getElementsByClassName("close")[0];
// const deleteBtn = document.getElementById("deleteBtn");
// const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
// const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

// let currentRecipeId = null; // ID of displayed recipe

// // recipe data from Firestore

// function updateCards() {
//     savedRecipesDiv.innerHTML = "";

//     db.collection("recipes")
//         .get()
//         .then((querySnapshot) => {
//             querySnapshot.forEach((doc) => {
//                 const recipeData = doc.data();
//                 const recipeId = doc.id;
//                 const recipeName = recipeData.name;
//                 const recipeImage = recipeData.image;
//                 const recipeIngredients = recipeData.ingredients;
//                 const recipeInstructions = recipeData.instructions;

//                 // recipe card HTML
//                 const recipeCard = document.createElement("div");
//                 recipeCard.className = "recipe-card";

//                 const recipeImageElement = document.createElement("img");
//                 recipeImageElement.src = recipeImage;
//                 recipeImageElement.alt = recipeName;

//                 const recipeNameElement = document.createElement("h3");
//                 recipeNameElement.textContent = recipeName;

//                 // Append the elements
//                 recipeCard.appendChild(recipeImageElement);
//                 recipeCard.appendChild(recipeNameElement);

//                 recipeCard.addEventListener("click", () => {
//                     modalRecipeName.textContent = recipeName;
//                     modalIngredients.textContent = recipeIngredients;
//                     modalInstructions.textContent = recipeInstructions;

//                     currentRecipeId = recipeId;
//                     currentRecipeImage = recipeImage;

//                     modal.style.display = "block";
//                 });

//                 // recipe card to the savedRecipesDiv
//                 savedRecipesDiv.appendChild(recipeCard);
//                 deleteRecipe(recipeId);
//             });
//         })
//         .catch((error) => {
//             console.error("Error retrieving recipes: ", error);
//         });
// }

// // Close the modal
// closeBtn.addEventListener("click", () => {
//     modal.style.display = "none";
// });

// window.addEventListener("click", (event) => {
//     if (event.target === modal) {
//         modal.style.display = "none";
//     }
// });

// //confirmation popup for delete button
// function deleteRecipe(recipeId) {
//     if (firebase.auth().currentUser.uid === recipeId.user) {
//         deleteBtn.addEventListener("click", () => {
//             const confirmationPopup =
//                 document.getElementById("confirmationPopup");
//             confirmationPopup.style.display = "block";
//         });

//         confirmDeleteBtn.addEventListener("click", () => {
//             // Hide the confirmation popup
//             confirmationPopup.style.display = "none";

//             // Delete the recipe from Firestore
//             db.collection("recipes")
//                 .doc(currentRecipeId)
//                 .delete()
//                 .then(() => {
//                     console.log("Recipe document deleted from database");

//                     // Create a reference to the image in storage using its URL
//                     const imageRef = storage.refFromURL(currentRecipeImage);

//                     // Delete the image from storage
//                     imageRef
//                         .delete()
//                         .then(() => {
//                             //location.reload();
//                             console.log("Image deleted from storage");
//                             // Remove the recipe card from the UI
//                             const recipeCard = document.querySelector(
//                                 `[data-recipe-id="${currentRecipeId}"]`
//                             );
//                             if (recipeCard) {
//                                 recipeCard.remove();
//                             } else {
//                                 console.warn("Recipe card not found in the UI");
//                             }
//                         })
//                         .catch((error) => {
//                             console.error(
//                                 "Error deleting image from storage: ",
//                                 error
//                             );
//                         });
//                     updateCards();
//                 })
//                 .catch((error) => {
//                     console.error("Error deleting recipe document: ", error);
//                 });
//         });

//         // Event listener for the cancel delete button in the confirmation popup
//         cancelDeleteBtn.addEventListener("click", () => {
//             // Hide the confirmation popup
//             confirmationPopup.style.display = "none";
//         });

//         updateCards();
//     } else {
//         deleteBtn.style.display = "none";
//     }
// }
