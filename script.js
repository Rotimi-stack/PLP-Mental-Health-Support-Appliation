// Get all the modals
var modals = document.querySelectorAll('.modal');

// Get all the buttons that open the modal
var buttons = document.querySelectorAll('.book-session');

// Loop through the buttons and add click event listeners
buttons.forEach(function(button) {
    button.onclick = function(event) {
        event.preventDefault(); // Prevent the default anchor behavior
        var modalId = button.getAttribute('data-modal');
        document.getElementById(modalId).style.display = "block";
    };
});

// Get all the <span> elements that close the modal
var spans = document.querySelectorAll('.close');

// Loop through the spans and add click event listeners
spans.forEach(function(span) {
    span.onclick = function() {
        var modalId = span.getAttribute('data-modal');
        document.getElementById(modalId).style.display = "none";
    };
});

// Close the modal if the user clicks anywhere outside of the modal content
window.onclick = function(event) {
    modals.forEach(function(modal) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
};

//----------------------------------------------------------------ARTICLE JS-------------------------
let currentSlide = 0;
const slides = document.querySelectorAll('.article-slide');
const totalSlides = slides.length;
const articleContainer = document.querySelector('.article-container');
const slideInterval = 18000;
let autoSlide;

// Function to change slides
function changeSlide(direction) {
    // Update the current slide index based on direction
    currentSlide += direction;

    // Loop back if we exceed the bounds
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1; // Go to last slide
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0; // Go back to first slide
    }

    // Move the container to show the next slide
    articleContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

    resetAutoSlide();
}

// Function to reset automatic slide
function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
        changeSlide(1);
    }, slideInterval);
}

// Function to stop sliding
function stopAutoSlide() {
    clearInterval(autoSlide);
}

// Attach play event listeners to each iframe
const iframes = document.querySelectorAll('.article-box iframe');
iframes.forEach(iframe => {
    iframe.addEventListener('load', () => {
        const iframeWindow = iframe.contentWindow;
        iframeWindow.addEventListener('play', stopAutoSlide);
    });
});

// Initialize the position of slides
slides.forEach((slide, index) => {
    slide.style.transform = `translateX(${index * 100}%)`;
});

// Start the automatic sliding
resetAutoSlide();

//**************************************************************CHECK SECTION**************************
// Select all sliders and bars
const moodSliders = document.querySelectorAll('.moodSlider');
const moodValues = document.querySelectorAll('.moodValue');
const moodBars = document.querySelectorAll('.moodBar');
const recommendations = document.querySelectorAll('.recommendation');

// Function to update the mood bar, label, and recommendations
function updateMood(slider, valueIndex) {
    const value = slider.value;
    moodValues[valueIndex].textContent = value;

    // Update the width of the mood bar
    moodBars[valueIndex].style.width = `${(value / 10) * 100}%`;

    // Change the mood bar color and recommendations based on the value
    if (value >= 1 && value <= 3) {
        moodBars[valueIndex].style.backgroundColor = 'green'; // Normal
        switch (valueIndex) {
            case 0: // Anger
                recommendations[valueIndex].textContent = "You're doing just great, nothing to worry about.";
                break;
            case 1: // Anxiety
                recommendations[valueIndex].textContent = "Watch some cartoons and listen to cool music; you are fine.";
                break;
            case 2: // Panic Attack
                recommendations[valueIndex].textContent = "No cause for alarm, try dancing and reading novels; you are fine.";
                break;
            case 3: // Depression
                recommendations[valueIndex].textContent = "Nothing to worry about; life is full of challenges; you are handling it well.";
                break;
            case 4: // Fear
                recommendations[valueIndex].textContent = "Nothing to worry about; you’re the boss; you’ve got it under control.";
                break;
        }
        recommendations[valueIndex].style.display = "block"; 
    } else if (value >= 4 && value <= 7) {
        moodBars[valueIndex].style.backgroundColor = 'yellow'; // Warning
        switch (valueIndex) {
            case 0: // Anger
                recommendations[valueIndex].textContent = "Don't think too much about the issue, engage in positive activities, try some exercise, and take a nap.";
                break;
            case 1: // Anxiety
                recommendations[valueIndex].textContent = "Take a break, drink water, take a deep breath, and go for a stroll; you will feel better.";
                break;
            case 2: // Panic Attack
                recommendations[valueIndex].textContent = "Identify the trigger, reach out to a friend; don’t isolate yourself, drink water, and stay calm.";
                break;
            case 3: // Depression
                recommendations[valueIndex].textContent = "Consider an extracurricular activity; try dancing or hanging out with friends.";
                break;
            case 4: // Fear
                recommendations[valueIndex].textContent = "Stand in front of a mirror, talk to yourself, motivate yourself, and connect with a friend.";
                break;
        }
        recommendations[valueIndex].style.display = "block"; // Show recommendation
    } else if (value >= 8 && value <= 10) {
        moodBars[valueIndex].style.backgroundColor = 'red'; // Danger
        switch (valueIndex) {
            case 0: // Anger
                recommendations[valueIndex].textContent = "Talk to a friend, reach out to a professional, and avoid irrational decisions.";
                break;
            case 1: // Anxiety
                recommendations[valueIndex].textContent = "Talk to someone close, avoid isolation, and seek a safe place.";
                break;
            case 2: // Panic Attack
                recommendations[valueIndex].textContent = "Stay connected, call a friend or family member, keep water close, and focus on breathing.";
                break;
            case 3: // Depression
                recommendations[valueIndex].textContent = "Don't isolate yourself, reach out to a family member, and call emergency services if needed.";
                break;
            case 4: // Fear
                recommendations[valueIndex].textContent = "Don't isolate yourself; contact a friend, seek help, and reach out to emergency services if necessary.";
                break;
        }
        recommendations[valueIndex].style.display = "block"; 
    } else {
        moodBars[valueIndex].style.backgroundColor = 'grey'; 
        recommendations[valueIndex].textContent = ""; 
        recommendations[valueIndex].style.display = "none"; // Hide recommendation
    }
}

// Initial setup for each slider
moodSliders.forEach((slider, index) => {
    updateMood(slider, index); // Set initial value
    slider.addEventListener('input', () => updateMood(slider, index)); // Update on input
});

//--------------------------------------------CHAT FEATURE------------------------------------------

// Event listener for the chat icon to toggle the chat container visibility
document.getElementById("chat-icon").addEventListener("click", function() {
    const chatContainer = document.getElementById("chat-container");
    
    // Toggle the chat container visibility
    if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
        chatContainer.style.display = "block"; // Show the chat container
    } else {
        chatContainer.style.display = "none"; // Hide the chat container
    }
});

// Event listener for the close button in the chat header
document.getElementById("close-chat").addEventListener("click", function() {
    document.getElementById("chat-container").style.display = "none"; 
});

// Event listener for sending a message
document.getElementById("send-btn").addEventListener("click", function() {
    const chatInput = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-box");

    const userMessage = chatInput.value.trim(); // Get the message and trim whitespaces

    if (userMessage !== "") {
       
        const userMessageDiv = document.createElement("div");
        userMessageDiv.textContent = userMessage;
        userMessageDiv.className = "user";
        chatBox.appendChild(userMessageDiv);

        chatInput.value = ""; // Clear input field

        // Simulate a bot response after a short delay
        setTimeout(() => {
            const botMessageDiv = document.createElement("div");
            botMessageDiv.textContent = "Bot: " + userMessage; // Simulate a bot response
            botMessageDiv.className = "bot";
            chatBox.appendChild(botMessageDiv);

            // Scroll to the bottom of the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000);
    }
});
