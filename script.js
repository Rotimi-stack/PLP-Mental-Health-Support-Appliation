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
