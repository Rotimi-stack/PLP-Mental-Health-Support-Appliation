document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('contactForm');
    const loginForm = document.getElementById('loginForm');

    // EmFail Validation Regex Pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    // Handle Registration Form Submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Clear previous error messages
            clearErrors();

            // Get form field values for Registration
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm_password').value.trim();
            const age = document.getElementById('age').value.trim();
        
            const country = document.getElementById('country');
            const countryValue = country.value;

            const terms = document.getElementById('terms').checked;
            const gender = document.querySelector('input[name="gender"]:checked');
            let valid = true;


            
            // Perform validation checks for Registration
            if (name === "") {
                displayError('name', 'Name is required');
                valid = false;
            }
            if (email === "") {
                displayError('email', 'Email is required');
                valid = false;
            } else if (!emailPattern.test(email)) {
                displayError('email', 'Please enter a valid email address');
                valid = false;
            }


            if (password.length < 8) {
                displayError('password', 'Password must be at least 8 characters long');
                valid = false;
            }
            if (confirmPassword !== password) {
                displayError('confirm_password', 'Passwords do not match');
                valid = false;
            }
            if (age === "") {
                displayError('age', 'Age is required');
                valid = false;
            }

            if (countryValue === "") {
                displayError('country', 'Please select a country');
                valid = false;
            }

            if (!terms) {
                displayError('terms', 'Accept terms and conditions');
                valid = false;
            }
           
            if (!gender) {
                displayError('gender', 'Please select a gender');
                valid = false;
            }
          
            // If valid, submit the form (you can remove this preventDefault if actual form submission is desired)
            if (valid) {
                registrationForm.submit();
            }
        });
    }

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
            }

            // If valid, submit the form (you can remove this preventDefault if actual form submission is desired)
            if (valid) {
                loginForm.submit();
            }
        });
    }


    // Function to display error messages
    function displayError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error';
        errorMessage.style.color = 'red';
        errorMessage.style.marginTop = '5px';
        errorMessage.innerText = message;
        field.parentNode.insertBefore(errorMessage, field.nextSibling);
    }


    // Function to clear error messages
    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error');
        errorMessages.forEach(function (msg) {
            msg.remove();
        });
    }
});


