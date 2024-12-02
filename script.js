document.addEventListener("DOMContentLoaded", function () {

    // Get all the modals
    var modals = document.querySelectorAll('.modal');

    // Get all the buttons that open the modal
    var buttons = document.querySelectorAll('.book-session');

    // Loop through the buttons and add click event listeners
    buttons.forEach(function (button) {
        button.onclick = function (event) {
            event.preventDefault(); // Prevent the default anchor behavior
            var modalId = button.getAttribute('data-modal');
            document.getElementById(modalId).style.display = "block";
        };
    });

    // Get all the <span> elements that close the modal
    var spans = document.querySelectorAll('.close');

    // Loop through the spans and add click event listeners
    spans.forEach(function (span) {
        span.onclick = function () {
            var modalId = span.getAttribute('data-modal');
            document.getElementById(modalId).style.display = "none";
        };
    });

    // Close the modal if the user clicks anywhere outside of the modal content
    window.onclick = function (event) {
        modals.forEach(function (modal) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    };

    /*#region ARTICLE*/
    //----------------------------------------------------------------ARTICLE JS-------------------------
    let currentSlide = 0;
    const slides = document.querySelectorAll('.article-slide');
    const totalSlides = slides.length;
    const articleContainer = document.querySelector('.article-container');
    const slideInterval = 30000;
    let autoSlide;

    function changeSlide(direction) {
        currentSlide += direction;

        if (currentSlide < 0) {
            currentSlide = totalSlides - 1;
        } else if (currentSlide >= totalSlides) {
            currentSlide = 0;
        }

        articleContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        resetAutoSlide();
    }

    function resetAutoSlide() {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => {
            changeSlide(1);
        }, slideInterval);
    }

    function stopAutoSlide() {
        clearInterval(autoSlide);
    }

    const iframes = document.querySelectorAll('.article-box iframe');
    iframes.forEach(iframe => {
        iframe.addEventListener('load', () => {
            const iframeWindow = iframe.contentWindow;
            iframeWindow.addEventListener('play', stopAutoSlide);
        });
    });

    slides.forEach((slide, index) => {
        slide.style.transform = `translateX(${index * 100}%)`;
    });

    document.querySelector('.prev').addEventListener('click', () => changeSlide(-1));
    document.querySelector('.next').addEventListener('click', () => changeSlide(1));
    

    resetAutoSlide();
    /*#endregion*/

    /*#region CHECK*/
    const moodSliders = document.querySelectorAll('.moodSlider');
    const moodValues = document.querySelectorAll('.moodValue');
    const moodBars = document.querySelectorAll('.moodBar');
    const recommendations = document.querySelectorAll('.recommendation');

    function updateMood(slider, valueIndex) {
        const value = slider.value;
        const conditionKey = `slider${valueIndex}_condition`; // Unique key for each slider
        const responseKey = `slider${valueIndex}_response`; // Track response cycle

        // Mood and bar updates
        moodValues[valueIndex].textContent = value;
        moodBars[valueIndex].style.width = `${(value / 10) * 100}%`;

        // Retrieve the current response cycle
        const responseIndex = parseInt(localStorage.getItem(responseKey)) || 0;

        // Define responses for each range
        const responses = {
            low: [
                "You're doing just great, nothing to worry about.",
                "Great work champ, you are perfect!",
                "Healthy as a horse, keep going bravo!",
            ],
            medium: [
                "Take a break and focus on relaxing.",
                "You might need a short vacation.",
                "Why not meditate today?",
            ],
            high: [
                "Consider seeking help or talking to someone you trust.",
                "Try reaching out to a loved one.",
                "It's okay to seek professional guidance.",
            ],
        };

        let selectedResponses;
        if (value >= 1 && value <= 3) {
            moodBars[valueIndex].style.backgroundColor = 'green';
            selectedResponses = responses.low;
        } else if (value >= 4 && value <= 7) {
            moodBars[valueIndex].style.backgroundColor = 'yellow';
            selectedResponses = responses.medium;
        } else if (value >= 8 && value <= 10) {
            moodBars[valueIndex].style.backgroundColor = 'red';
            selectedResponses = responses.high;
        } else {
            moodBars[valueIndex].style.backgroundColor = 'grey';
            recommendations[valueIndex].textContent = "";
            recommendations[valueIndex].style.display = "none";
            return; // Exit if no valid value range
        }

        // Cycle through responses
        const newResponseIndex = (responseIndex + 1) % selectedResponses.length;
        recommendations[valueIndex].textContent = selectedResponses[responseIndex];
        recommendations[valueIndex].style.display = "block";

        // Store the updated response cycle
        localStorage.setItem(responseKey, newResponseIndex);
    }

    moodSliders.forEach((slider, index) => {
        updateMood(slider, index);
        slider.addEventListener('input', () => updateMood(slider, index));
    });
    /*#endregion*/

    /*#region CHAT FEATURE*/



    // Get the chat input, chat box, and send button elements
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const sendButton = document.getElementById('send-btn');

    if (!chatInput || !chatBox || !sendButton) {
        console.error("One or more elements (chat-input, chat-box, send-btn) are missing in the DOM.");
        return;
    }


    document.getElementById('send-btn').addEventListener('click', async () => {
        const chatInput = document.getElementById('chat-input');
        const chatBox = document.getElementById('chat-box');
        const userMessage = chatInput.value.trim();
    
        if (userMessage === '') return;
    
        // Display user's message in the chatbox
        chatBox.innerHTML += `<div class="user-message">${userMessage}</div>`;
    
        // Clear the input
        chatInput.value = '';
    
        try {
            // Send the query to the backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: userMessage }),
            });
    
            const data = await response.json();
    
            if (data.error) {
                chatBox.innerHTML += `<div class="bot-message">Sorry, I couldn't process your request.</div>`;
            } else {
                // Display Gemini API's response
                const apiResponse = data.response || 'Here is the information you requested!';
                chatBox.innerHTML += `<div class="bot-message">${apiResponse}</div>`;
            }
    
            // Scroll to the bottom of the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (error) {
            console.error('Error communicating with the backend:', error);
            chatBox.innerHTML += `<div class="bot-message">An error occurred. Please try again later.</div>`;
        }
    });
document.getElementById('send-btn').addEventListener('click', async () => {
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const userMessage = chatInput.value.trim();

    if (userMessage === '') return;

    // Display user's message in the chatbox
    chatBox.innerHTML += `<div class="user-message">${userMessage}</div>`;

    // Clear the input
    chatInput.value = '';

    try {
        // Send the query to the backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userMessage }),
        });

        const data = await response.json();

        if (data.error) {
            chatBox.innerHTML += `<div class="bot-message">Sorry, I couldn't process your request.</div>`;
        } else {
            // Display Gemini API's response
            const apiResponse = data.response || 'Here is the information you requested!';
            chatBox.innerHTML += `<div class="bot-message">${apiResponse}</div>`;
        }

        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error communicating with the backend:', error);
        chatBox.innerHTML += `<div class="bot-message">An error occurred. Please try again later.</div>`;
    }
});
    
    



   

    document.getElementById("chat-icon").addEventListener("click", function () {
        const chatContainer = document.getElementById("chat-container");
        chatContainer.style.display = chatContainer.style.display === "block" ? "none" : "block";
    });

    document.getElementById("close-chat").addEventListener("click", function () {
        document.getElementById("chat-container").style.display = "none";
    });


    /*#endregion*/


    // Add event listener for answer buttons
    const answerButtons = document.querySelectorAll('.answer-btn');

    answerButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Find the trivia container for the current question
            const triviaContainer = this.closest('.trivia-container');
    
            // Select the result container
            const resultContainer = triviaContainer.querySelector('.trivia-result');
    
            // Check if the clicked button is correct
            if (this.dataset.correct === "true") {
                resultContainer.textContent = "Correct! You are in Contol Champ";  // Display "Correct!" if the answer is right
                resultContainer.style.color = 'green';  // Style it green for correct answer
            } else {
                resultContainer.textContent = "Oops Wrong! Try again Champ";  // Display "Wrong! Try again" if the answer is wrong
                resultContainer.style.color = 'red';  // Style it red for wrong answer
            }
        });
    });
    
    
    // Array of all the questions and answers
    const allQuestions = [
        {
            question: "What is the most common mental health disorder?",
            answers: [
                "😞 Bipolar Disorder",
                "😊 Anxiety Disorder", // Correct Answer
                "❓ Schizophrenia",
                "🔄 Obsessive Compulsive Disorder (OCD)"
            ],
            correctAnswer: "😊 Anxiety Disorder"
        },
        
        {
            question: "What is the treatment for anxiety disorder?",
            answers: [
                "💊 Medication",
                "🧠 Therapy", // Correct Answer
                "😴 Rest",
                "🔪 Surgery"
            ],
            correctAnswer: "🧠 Therapy"
        },
        {
            question: "What is PTSD?",
            answers: [
                "🛡️ Post Traumatic Stress Disorder", // Correct Answer
                "📋 Post Terminated Stress Disorder",
                "🏥 Public Trauma Stress Disorder",
                "🧪 Psychological Trauma Disorder"
            ],
            correctAnswer: "🛡️ Post Traumatic Stress Disorder"
        },
        {
            question: "What are common symptoms of depression?",
            answers: [
                "💤 Fatigue",
                "😢 Sadness",
                "😞 Hopelessness",
                "🛑 All of the Above" // Correct Answer
            ],
            correctAnswer: "🛑 All of the Above"
        },
        {
            question: "Which of the following is a common anxiety disorder?",
            answers: [
                "🤝 Social Anxiety Disorder",
                "🔄 OCD",
                "⚖️ Generalized Anxiety Disorder",
                "🌟 All of the Above" // Correct Answer
            ],
            correctAnswer: "🌟 All of the Above"
        },
        {
            question: "What is the main goal of Cognitive Behavioral Therapy (CBT)?",
            answers: [
                "💡 Change negative thought patterns", // Correct Answer
                "💬 Help manage emotions",
                "🤝 Improve social skills",
                "🏃 Increase exercise"
            ],
            correctAnswer: "💡 Change negative thought patterns"
        },
        {
            question: "What is the best approach to manage panic attacks?",
            answers: [
                "🌬️ Breathing exercises",
                "💊 Medication",
                "🧠 Therapy",
                "🌟 All of the Above" // Correct Answer
            ],
            correctAnswer: "🌟 All of the Above"
        },
        {
            question: "Which disorder is characterized by excessive worry?",
            answers: [
                "😔 Depression",
                "😟 Anxiety Disorder", // Correct Answer
                "⚖️ Bipolar Disorder",
                "🔄 OCD"
            ],
            correctAnswer: "😟 Anxiety Disorder"
        },
        {
            question: "What is the most common symptom of schizophrenia?",
            answers: [
                "👁️ Hallucinations", // Correct Answer
                "🧠 Memory loss",
                "🤕 Headaches",
                "🚶 Lack of motivation"
            ],
            correctAnswer: "👁️ Hallucinations"
        },
        {
            question: "What is a common treatment for OCD?",
            answers: [
                "🔄 Exposure Therapy",
                "💊 Medication",
                "🧠 Behavioral Therapy",
                "🌟 All of the Above" // Correct Answer
            ],
            correctAnswer: "🌟 All of the Above"
        },
        {
            question: "If you feel overwhelmed, what should you do?",
            answers: [
                "❌ Ignore it",
                "💬 Speak to someone you trust", // Correct Answer
                "💻 Work harder to distract yourself",
                "😴 Sleep it off"
            ],
            correctAnswer: "💬 Speak to someone you trust"
        },
        {
            question: "What should you do if you feel constantly sad and unmotivated?",
            answers: [
                "🤐 Keep to yourself",
                "🩺 Seek professional help", // Correct Answer
                "⏳ Wait for it to pass",
                "🚫 Avoid your feelings"
            ],
            correctAnswer: "🩺 Seek professional help"
        },
        {
            question: "If you feel out of breath during a panic attack, what should you do?",
            answers: [
                "🌬️ Breathe slowly and deeply", // Correct Answer
                "🏃‍♂️ Run away from the situation",
                "💨 Take rapid breaths",
                "❌ Ignore the feeling"
            ],
            correctAnswer: "🌬️ Breathe slowly and deeply"
        },
        {
            question: "If you are feeling tired all the time, what should you check first?",
            answers: [
                "📊 Your workload",
                "🛏️ Your sleep patterns",
                "🍔 Your diet",
                "🛑 All of the above" // Correct Answer
            ],
            correctAnswer: "🛑 All of the above"
        },
        {
            question: "If you feel confused about your emotions, what is a good first step?",
            answers: [
                "📖 Journal your thoughts",
                "🚫 Ignore it",
                "🗣️ Talk to a professional",
                "🅰️ A and C" // Correct Answer
            ],
            correctAnswer: "🅰️ A and C"
        },
        {
            question: "What should you do if you face domestic abuse?",
            answers: [
                "⚔️ Confront the abuser",
                "🆘 Seek immediate help from authorities or a trusted individual", // Correct Answer
                "🤐 Stay silent to avoid conflict",
                "💪 Try to handle it alone"
            ],
            correctAnswer: "🆘 Seek immediate help from authorities or a trusted individual"
        },
        {
            question: "How should you respond to violence in your environment?",
            answers: [
                "🙉 Avoid reporting it",
                "🆘 Seek help and report to the proper authorities", // Correct Answer
                "👊 Engage in the violence",
                "🚶‍♂️ Ignore the situation"
            ],
            correctAnswer: "🆘 Seek help and report to the proper authorities"
        },
        {
            question: "What should you do if you experience a toxic work environment?",
            answers: [
                "📢 Report to HR or management", // Correct Answer
                "🚪 Quit immediately",
                "😡 Confront coworkers aggressively",
                "🚫 Ignore the toxicity"
            ],
            correctAnswer: "📢 Report to HR or management"
        },
        {
            question: "What is the best way to deal with chronic stress?",
            answers: [
                "🧘‍♂️ Practice relaxation techniques", // Correct Answer
                "🚫 Avoid talking about it",
                "❌ Ignore the stressors",
                "💪 Work harder"
            ],
            correctAnswer: "🧘‍♂️ Practice relaxation techniques"
        },
        {
            question: "If you feel isolated, what should you do?",
            answers: [
                "🤝 Connect with friends or family", // Correct Answer
                "🚶‍♂️ Stay alone",
                "❌ Delete social media",
                "🚫 Avoid interaction altogether"
            ],
            correctAnswer: "🤝 Connect with friends or family"
        },
        {
            question: "What is a healthy way to cope with depression?",
            answers: [
                "🏃‍♂️ Exercise regularly", // Correct Answer
                "🤐 Keep feelings bottled up",
                "❌ Avoid seeking help",
                "🚫 Ignore it"
            ],
            correctAnswer: "🏃‍♂️ Exercise regularly"
        },
        {
            question: "If you feel like harming yourself, what should you do?",
            answers: [
                "🗣️ Talk to a trusted person immediately", // Correct Answer
                "❌ Ignore the feeling",
                "🚫 Act on it",
                "🚪 Isolate yourself"
            ],
            correctAnswer: "🗣️ Talk to a trusted person immediately"
        },
        {
            question: "What is a good way to handle feeling mentally exhausted?",
            answers: [
                "🛋️ Take a break and practice self-care", // Correct Answer
                "💪 Push through it",
                "💤 Sleep for long hours",
                "🚫 Ignore the feeling"
            ],
            correctAnswer: "🛋️ Take a break and practice self-care"
        },
        {
            question: "What should you do if you’re experiencing sleep problems?",
            answers: [
                "⏰ Maintain a consistent sleep schedule", // Correct Answer
                "☕ Drink coffee to stay awake",
                "📱 Keep your phone close",
                "🌙 Sleep irregularly"
            ],
            correctAnswer: "⏰ Maintain a consistent sleep schedule"
        },
        {
            question: "If you’re feeling angry frequently, what is a healthy coping mechanism?",
            answers: [
                "🌬️ Practice breathing exercises", // Correct Answer
                "🤐 Suppress your anger",
                "👊 Take it out on others",
                "🚫 Ignore it"
            ],
            correctAnswer: "🌬️ Practice breathing exercises"
        },
        {
            question: "What should you do if you feel anxious in social settings?",
            answers: [
                "🚫 Avoid social interactions entirely",
                "🪜 Take small steps and practice exposure", // Correct Answer
                "🤯 Overthink your actions",
                "🎭 Pretend to be okay"
            ],
            correctAnswer: "🪜 Take small steps and practice exposure"
        },
        {
            question: "What is a helpful response to a friend expressing suicidal thoughts?",
            answers: [
                "🆘 Take them seriously and seek professional help", // Correct Answer
                "🚫 Tell them to get over it",
                "❌ Ignore their concerns",
                "❓ Change the topic"
            ],
            correctAnswer: "🆘 Take them seriously and seek professional help"
        },
        {
            question: "What is the first thing you should do if you experience a sudden trauma?",
            answers: [
                "🆘 Seek immediate support", // Correct Answer
                "🤐 Keep it to yourself",
                "💻 Distract yourself with work",
                "🚫 Avoid the topic"
            ],
            correctAnswer: "🆘 Seek immediate support"
        },
        {
            question: "What should you do if you constantly worry about the future?",
            answers: [
                "🧘‍♂️ Practice mindfulness and grounding techniques", // Correct Answer
                "⚠️ Focus only on the negative outcomes",
                "🚫 Avoid thinking about it",
                "👨‍⚕️ Seek professional advice"
            ],
            correctAnswer: "🧘‍♂️ Practice mindfulness and grounding techniques"
        },
        {
            question: "How should you handle a friend going through a tough time?",
            answers: [
                "👂 Listen without judgment", // Correct Answer
                "⛔ Give them space",
                "🚫 Ignore them",
                "🛑 All of the above"
            ],
            correctAnswer: "👂 Listen without judgment"
        }
    ];

    // Function to load 5 random questions
    function loadQuestions() {
        const triviaContainer = document.querySelector('.trivia-container');

        // Clear previous questions
        triviaContainer.innerHTML = '';

        // Randomly select 5 questions from the pool
        const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5);

        // Loop through and display the new set of questions
        shuffledQuestions.forEach((q, index) => {
            const questionContainer = document.createElement('div');
            questionContainer.classList.add('question-container');
            questionContainer.setAttribute('data-question-id', index + 1);

            const questionHTML = `
            <p class="trivia-question">${index + 1}) ${q.question}</p>
            <div class="trivia-answers">
                ${q.answers.map(answer => `<button class="answer-btn" data-correct="${answer === q.correctAnswer}">${answer}</button>`).join('')}
            </div>
            <div class="trivia-result"></div>
            <div class="correct" style="display: none;">${q.correctAnswer}</div>
        `;

            questionContainer.innerHTML = questionHTML;
            triviaContainer.appendChild(questionContainer);
        });

        // Reattach event listeners to new buttons (if necessary)
        attachAnswerButtonListeners();
    }

    // Attach event listeners to the answer buttons
    function attachAnswerButtonListeners() {
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(button => {
            button.addEventListener('click', function () {
                const triviaContainer = this.closest('.question-container');
                const resultContainer = triviaContainer.querySelector('.trivia-result');
                const correctAnswer = triviaContainer.querySelector('.correct').textContent;

                if (this.dataset.correct === "true") {
                    resultContainer.textContent = "There you Go Champ";
                    resultContainer.style.color = 'green';
                    resultContainer.innerHTML += `<br>Correct Answer: ${correctAnswer}`;
                } else {
                    resultContainer.textContent = "Oops Wrong! Try again";
                    resultContainer.style.color = 'red';
                }
               
            });
        });
    }

    // Set up the refresh button
    document.getElementById('refresh-questions-btn').addEventListener('click', loadQuestions);

    // Load initial set of questions on page load
    loadQuestions();



})




document.addEventListener("DOMContentLoaded", () => {

    console.log("DOM is loaded");

    const briefSection = document.querySelector("#brief-section");
    const visionBoxes = document.querySelectorAll(".vision-box");

    const observeBriefSection = () => {
        const briefObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                    } else {
                        entry.target.classList.remove("show");
                    }
                });
            },
            { threshold: 0.1 }
        );

        briefObserver.observe(briefSection);
    };

    const observeVisionBoxes = () => {
        const visionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                    } else {
                        entry.target.classList.remove("show");
                    }
                });
            },
            { threshold: 0.1 }
        );

        visionBoxes.forEach((box) => visionObserver.observe(box));
    };

    observeBriefSection();
    observeVisionBoxes();

    const aboutImage = document.querySelector('.about-image');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show');
            }
        });
    }, {
        threshold: 0.7,
    });
    observer.observe(aboutImage);

    const messages = document.querySelectorAll('.motivational-messages p');
    // Reset animation after 36 seconds (total duration of all six messages)
    setInterval(() => {
        messages.forEach((message) => {
            // Reset the animation
            message.style.animation = 'none';  // Remove the animation
            message.offsetHeight;  // Trigger a reflow to force the reset
            message.style.animation = '';  // Reapply the animation
        });
    }, 36000);  // 36 seconds = 6 messages * 6 seconds each
});


//ADVERT SLIDES*****************************************************************
document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".advert-slide");
    let currentSlide = 0;

    function showNextSlide() {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }

    // Initialize first slide
    slides[currentSlide].classList.add("active");

    // Automatically change slides every 3 seconds
    setInterval(showNextSlide, 3000);
});


















