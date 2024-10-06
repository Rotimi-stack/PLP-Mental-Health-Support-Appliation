document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    // Email Validation Regex Pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Handle Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); 

            // Clear previous error messages
            clearErrors();

            // Get form field values for Login
            const email = document.getElementById('loginemail').value.trim();
            const password = document.getElementById('loginpassword').value.trim();

            let valid = true;

            // Perform validation checks for Login
            if (email === "") {
                displayError('loginemail', 'Email is required');
                valid = false;
            } else if (!emailPattern.test(email)) {
                displayError('loginemail', 'Please enter a valid email address');
                valid = false;
            }

            if (password === "") {
                displayError('loginpassword', 'Password is required');
                valid = false;
            } else if (password.length < 6) { // Example: Password must be at least 6 characters
                displayError('loginpassword', 'Password must be at least 6 characters long');
                valid = false;
            }

            // If valid, submit the form
            if (valid) {
                // Optional: Display a success message or redirect here
                loginForm.submit(); 
            }
        });
    }

    // Function to display error messages
    function displayError(fieldId, message) {
        const errorDiv = document.getElementById(fieldId + '-error'); 
        if (errorDiv) { // Check if the errorDiv exists
            errorDiv.innerText = message; // Set the error message
            const field = document.getElementById(fieldId);
            if (field) field.classList.add('is-invalid'); // Add class to highlight the field
        }
    }

    // Function to clear error messages
    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error');
        errorMessages.forEach(function (msg) {
            msg.innerText = ''; // Clear the text of error messages
        });
        // Remove invalid field highlights
        const inputs = document.querySelectorAll('input');
        inputs.forEach(function (input) {
            input.classList.remove('is-invalid'); // Remove invalid highlight
        });
    }
});
