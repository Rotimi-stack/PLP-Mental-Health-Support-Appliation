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

    // Restart the automatic sliding
    resetAutoSlide();
}

// Function to reset automatic slide
function resetAutoSlide() {
    clearInterval(autoSlide); // Clear existing interval
    autoSlide = setInterval(() => {
        changeSlide(1); // Change slide automatically every interval
    }, slideInterval);
}

// Function to stop sliding
function stopAutoSlide() {
    clearInterval(autoSlide); // Stop automatic sliding
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
                recommendations[valueIndex].textContent = "You are doing just great, nothing to worry about."; // Updated recommendation
                recommendations[valueIndex].style.display = "block"; // Show recommendation
                break;
            case 1: // Anxiety
                recommendations[valueIndex].textContent = "Watch some cartoons and listen to some cool music; you are fine."; // Green
                recommendations[valueIndex].style.display = "block"; // Show recommendation
                break;
            case 2: // Panic Attack
                recommendations[valueIndex].textContent = "No cause for alarm, try dancing and reading some novels; you are fine."; // Green
                recommendations[valueIndex].style.display = "block"; // Show recommendation
                break;
            case 3: // Depression
                recommendations[valueIndex].textContent = "Nothing to worry about; life is full of challenges; you are handling it well."; // Green
                recommendations[valueIndex].style.display = "block"; // Show recommendation
                break;
            case 4: // Fear
                recommendations[valueIndex].textContent = "Nothing to worry about; you are the boss; you’ve got it under control."; // Green
                recommendations[valueIndex].style.display = "block"; // Show recommendation
                break;
        }
    } else if (value >= 4 && value <= 7) {
        moodBars[valueIndex].style.backgroundColor = 'yellow'; // Warning
        switch (valueIndex) {
            case 0: // Anger
                recommendations[valueIndex].textContent = "Don't think too much on the issue, engage your mind in positive things, try some exercise, and take a good nap."; // Default yellow recommendation
                break;
            case 1: // Anxiety
                recommendations[valueIndex].textContent = "Try taking a break from what you are doing, drink some water, take a deep breath, take a stroll; you will be better."; // Yellow
                break;
            case 2: // Panic Attack
                recommendations[valueIndex].textContent = "Identify the trigger, reach out to a friend; don't be isolated, drink a lot of water, be calm."; // Yellow
                break;
            case 3: // Depression
                recommendations[valueIndex].textContent = "Take an extracurricular lesson; try dancing and hanging out with some friends."; // Yellow
                break;
            case 4: // Fear
                recommendations[valueIndex].textContent = "Stand in the mirror, talk to yourself, motivate yourself, talk to a friend."; // Yellow
                break;
        }
        recommendations[valueIndex].style.display = "block"; // Show recommendation
    } else if (value >= 8 && value <= 10) {
        moodBars[valueIndex].style.backgroundColor = 'red'; // Danger
        switch (valueIndex) {
            case 0: // Anger
                recommendations[valueIndex].textContent = "Talk to a friend, reach out to a professional, don't make irrational decisions."; // Default red recommendation
                break;
            case 1: // Anxiety
                recommendations[valueIndex].textContent = "Talk to someone close, don't stay in isolated areas, take a seat, call the medical hotline."; // Red
                break;
            case 2: // Panic Attack
                recommendations[valueIndex].textContent = "Don't be isolated, call a friend or family member, be with a bottle of water, dial an emergency hotline, don't forget to keep breathing."; // Red
                break;
            case 3: // Depression
                recommendations[valueIndex].textContent = "Don't be isolated, reach out to a family member, dial an emergency hotline."; // Red
                break;
            case 4: // Fear
                recommendations[valueIndex].textContent = "Don't be isolated, contact a friend or loved one, seek help, contact emergency services."; // Red
                break;
        }
        recommendations[valueIndex].style.display = "block"; // Show recommendation
    } else {
        moodBars[valueIndex].style.backgroundColor = 'grey'; // Default color
        recommendations[valueIndex].textContent = ""; // Clear previous recommendation
        recommendations[valueIndex].style.display = "none"; // Hide recommendation
    }
}

// Initial setup for each slider
moodSliders.forEach((slider, index) => {
    updateMood(slider, index); // Set initial value
    slider.addEventListener('input', () => updateMood(slider, index)); // Update on input
});
