import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmM_6a3ecHKEBqJWpNOdSsU7_BhPTBJwo",
    authDomain: "search-business-b1a10.firebaseapp.com",
    projectId: "search-business-b1a10",
    storageBucket: "search-business-b1a10.appspot.com",
    messagingSenderId: "663062601854",
    appId: "1:663062601854:web:0afbd071a14f3cdedbb82f"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Function to check if the user is logged in
const checkAuthStatus = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // If not logged in, redirect to index.html (login page)
    if (!isLoggedIn && window.location.pathname !== "/index.html") {
        window.location.href = "index.html";
    } else if (isLoggedIn) {
        console.log("User is logged in.");
    }
};

// Run auth state check when page loads
checkAuthStatus();

// Google Sign-In logic
const signInButton = document.getElementById('signInButton');
signInButton.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("User logged in:", result.user);
            localStorage.setItem("isLoggedIn", "true");
            window.location.replace('profile.html');  // Redirect to profile page
        })
        .catch((error) => {
            console.error("Error during login:", error.message);
        });
});

// Auth state change listener to track user login status
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        const userRef = doc(db, "users", userId);

        // Fetch and display user profile data
        getDoc(userRef).then(docSnapshot => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                const profileFields = [
                    'nameInput', 'categoryInput', 'descriptionInput', 'emailInput', 'phoneInput', 
                    'cityInput', 'areaInput', 'mapLinkInput', 'mapEmbedInput'
                ];

                profileFields.forEach(field => {
                    document.getElementById(field).value = data[field] || '';
                });
            } else {
                console.log("No user data found, creating a new document.");
                // If no data exists, create a new document with default values
                const defaultData = {
                    name: '',
                    category: '',
                    description: '',
                    email: '',
                    phone: '',
                    city: '',
                    area: '',
                    mapLink: '',
                    mapEmbed: ''
                };

                setDoc(userRef, defaultData)
                    .then(() => {
                        console.log("New user profile document created.");
                        // Populate form with default data
                        Object.keys(defaultData).forEach(field => {
                            document.getElementById(`${field}Input`).value = defaultData[field];
                        });
                    })
                    .catch((error) => {
                        console.error("Error creating new user document:", error);
                        alert('There was an issue creating a new profile. Please try again.');
                    });
            }
        }).catch(error => {
            console.error("Error fetching user data: ", error);
            alert("An error occurred while fetching your profile data.");
        });

        // Handle profile update form submission
        const profileForm = document.getElementById('manageSection').querySelector('form');
        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Collect data from the form
            const profileData = {
                name: document.getElementById('nameInput').value,
                category: document.getElementById('categoryInput').value,
                description: document.getElementById('descriptionInput').value,
                email: document.getElementById('emailInput').value,
                phone: document.getElementById('phoneInput').value,
                city: document.getElementById('cityInput').value,
                area: document.getElementById('areaInput').value,
                mapLink: document.getElementById('mapLinkInput').value,
                mapEmbed: document.getElementById('mapEmbedInput').value
            };

            // Update user profile in Firestore
            updateDoc(userRef, profileData).then(() => {
                alert('Profile updated successfully!');

                // Dynamically update the profile page with new data
                Object.keys(profileData).forEach(key => {
                    const element = document.getElementById(`profile${key.charAt(0).toUpperCase() + key.slice(1)}`);
                    if (element) {
                        element.innerText = profileData[key];
                    }
                });
            }).catch((error) => {
                console.error("Error updating profile:", error);
                alert('There was an issue updating your profile. Please try again.');
            });
        });
    } else {
        console.log("User is not logged in.");
        // If the user is not logged in, make sure we're not redirecting again
        if (window.location.pathname !== "/index.html") {
            window.location.href = "index.html";  // Redirect to login page
        }
    }
});
