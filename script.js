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
    const slideInterval = 18000;
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


    // Define a function to generate a response based on the user's input
    function generateResponse(userMessage) {
        // Use 'userMessage' instead of 'message'
        const normalizedMessage = userMessage.trim().toLowerCase();

        const responses = [

            // Greetings
            { keywords: ['hi', 'hello', 'hey', 'greetings', 'yo'], response: "Hello there! How can I assist you today?" },
            { keywords: ['good morning', 'good afternoon', 'good evening'], response: "Good day! Hope you're doing well!" },

            // Stress, anger, and bad moods
            { keywords: ['stress', 'stressed', 'overwhelmed', 'burnout'], response: "Take a moment to breathe deeply. Relax and focus on one thing at a time. You've got this." },
            { keywords: ['anger', 'angry', 'temper', 'bad mood'], response: "Be calm. Step away from the situation if possible. Reflect and respond thoughtfully." },
            { keywords: ['frustrated', 'irritated', 'annoyed'], response: "Frustration happens to all of us. Try taking a short walk or doing something relaxing." },

            // Anxiety and nervousness
            { keywords: ['anxious', 'nervous', 'worried', 'apprehensive'], response: "It's okay to feel this way. Focus on your breathing and consider writing down your thoughts." },
            { keywords: ['how to stop anxiety', 'heal anxiety'], response: "We have amazing resources for you in the features section to help with anxiety." },

            // Sadness and loneliness
            { keywords: ['sad', 'lonely', 'down', 'unhappy'], response: "I'm sorry to hear that. Talking to someone or engaging in an activity you enjoy can help." },
            { keywords: ['depressed', 'melancholy', 'hopeless'], response: "You are not alone. Please consider reaching out to someone you trust or a professional." },

            // Physical health and wellness
            { keywords: ['sick', 'unwell', 'ill', 'fever'], response: "Make sure to rest, drink fluids, and consider seeking medical advice if needed." },
            { keywords: ['tired', 'exhausted', 'fatigued'], response: "Fatigue can be tough. Rest well, stay hydrated, and prioritize self-care." },

            // Emergencies
            { keywords: ['emergency', 'help', 'faint', 'fainting'], response: "Don't panic. Dial 222 for emergency responders or seek immediate help." },
            { keywords: ['out of breath', 'hard to breathe', 'choking'], response: "Stay calm. If you're in danger, contact emergency services immediately." },

            // Positive emotions
            { keywords: ['happy', 'excited', 'joyful', 'thrilled'], response: "That's wonderful! Keep enjoying the positive vibes." },
            { keywords: ['grateful', 'thankful', 'blessed'], response: "Gratitude is powerful. Celebrate the good things in your life." },

            // Relationships and social life
            { keywords: ['relationship', 'partner', 'friend'], response: "Healthy relationships rely on communication and understanding. Let me know if you'd like tips." },
            { keywords: ['family issues', 'arguments', 'disagreement'], response: "Family issues can be challenging. Try to listen and express yourself calmly." },

            // Career and work
            { keywords: ['work', 'career', 'job', 'boss', 'colleague'], response: "Work stress is common. Break tasks into smaller parts and don't hesitate to ask for help." },
            { keywords: ['burnout', 'too much work', 'overworked'], response: "Take breaks, prioritize tasks, and set boundaries to avoid burnout." },

            // Self-esteem and confidence
            { keywords: ['confidence', 'self-esteem', 'self-worth'], response: "Believe in yourself. You have the potential to achieve great things." },
            { keywords: ['insecure', 'not good enough'], response: "You are valuable and capable. Focus on your strengths and what makes you unique." },

            // Sleep and rest
            { keywords: ['can’t sleep', 'insomnia', 'sleep issues'], response: "Try a bedtime routine, avoid screens before bed, and create a calm sleep environment." },
            { keywords: ['sleep', 'rest', 'nap'], response: "Sleep is essential. Ensure you're getting enough to feel refreshed." },

            // Mental health resources
            { keywords: ['mental health', 'mental tips', 'trauma tips'], response: "We have great resources in our mood slider to help with mental health." },
            { keywords: ['therapy', 'psychologist', 'counseling'], response: "Seeking therapy is a great step. I can guide you to professional resources." },

            // Gratitude and reflection
            { keywords: ['reflect', 'think', 'introspect'], response: "Taking time to reflect can provide clarity and peace. Keep exploring your thoughts." },
            { keywords: ['journal', 'write', 'diary'], response: "Journaling is a great way to process your emotions and track your growth." },

            // Fun and hobbies
            { keywords: ['hobby', 'fun', 'bored'], response: "Explore a new hobby, watch a show, or try something creative like painting or cooking." },
            { keywords: ['music', 'movies', 'games'], response: "Entertainment is a great way to relax. What are your favorite genres?" },

            // Goal setting and productivity
            { keywords: ['goals', 'planning', 'motivation'], response: "Set small, realistic goals and celebrate your progress. You can do this!" },
            { keywords: ['productivity', 'focus', 'time management'], response: "Organize your tasks, take breaks, and stay consistent to boost productivity." },

            // Life changes and transitions
            { keywords: ['change', 'transition', 'new'], response: "Change can be challenging but also rewarding. Take it one step at a time." },
            { keywords: ['move', 'relocate', 'new job'], response: "Transitions are tough but can lead to growth. Stay open to new opportunities." },

            // Definitions of Mental Health Conditions
            { keywords: ['what is anxiety', 'define anxiety'], response: "Anxiety is a feeling of worry, nervousness, or unease about something with an uncertain outcome. It can include symptoms like restlessness, increased heart rate, and excessive worry." },
            { keywords: ['what is depression', 'define depression'], response: "Depression is a mood disorder characterized by persistent feelings of sadness, hopelessness, and a lack of interest in activities that were once enjoyable." },
            { keywords: ['what is trauma', 'define trauma'], response: "Trauma is a psychological, emotional response to an event or an experience that is deeply distressing or disturbing. It can lead to emotional and physical effects long after the event." },
            { keywords: ['what is ptsd', 'define ptsd'], response: "Post-Traumatic Stress Disorder (PTSD) is a mental health condition triggered by experiencing or witnessing a traumatic event. It can cause flashbacks, nightmares, and severe anxiety." },
            { keywords: ['what is ocd', 'define ocd'], response: "Obsessive-Compulsive Disorder (OCD) is a condition where a person has uncontrollable, recurring thoughts (obsessions) and/or behaviors (compulsions) that they feel compelled to repeat." },
            { keywords: ['what is fatigue', 'define fatigue'], response: "Fatigue refers to a state of physical and/or mental exhaustion that can result from prolonged physical or mental exertion. It can also be a symptom of other conditions like sleep deprivation or stress." },

            // Diagnosing Mental Health Conditions
            { keywords: ['how do i diagnose anxiety', 'signs of anxiety', 'diagnose anxiety'], response: "Anxiety can be diagnosed by a healthcare professional through a combination of physical exams, questionnaires, and mental health evaluations. Signs may include constant worry, restlessness, muscle tension, and sleep disturbances." },
            { keywords: ['how do i diagnose depression', 'signs of depression', 'diagnose depression'], response: "Depression is typically diagnosed through interviews, questionnaires, and assessments conducted by a professional. Symptoms include feelings of hopelessness, loss of interest, changes in appetite, and difficulty concentrating." },
            { keywords: ['how do i diagnose ptsd', 'signs of ptsd', 'diagnose ptsd'], response: "PTSD can be diagnosed by a mental health provider using interviews and standardized diagnostic tools. Symptoms may include flashbacks, nightmares, and intense emotional reactions to reminders of the traumatic event." },
            { keywords: ['how do i diagnose ocd', 'signs of ocd', 'diagnose ocd'], response: "OCD can be diagnosed through a clinical interview and a psychological evaluation. Signs include persistent, intrusive thoughts (obsessions) and repetitive behaviors (compulsions) that interfere with daily life." },
            { keywords: ['how do i diagnose fatigue', 'signs of fatigue', 'diagnose fatigue'], response: "Fatigue is typically diagnosed based on a person's symptoms and medical history. A healthcare provider may look for signs of sleep disturbances, low energy, and difficulty concentrating, along with any underlying medical conditions." },

            // Symptoms and Signs of Mental Health Conditions
            { keywords: ['signs of anxiety', 'symptoms of anxiety'], response: "Signs of anxiety include excessive worry, racing heart, trouble sleeping, muscle tension, and avoiding situations that cause anxiety." },
            { keywords: ['signs of depression', 'symptoms of depression'], response: "Signs of depression include persistent sadness, changes in appetite, trouble sleeping, loss of interest in activities, and difficulty concentrating." },
            { keywords: ['signs of ptsd', 'symptoms of ptsd'], response: "Signs of PTSD include flashbacks, nightmares, emotional numbness, hypervigilance, and avoiding reminders of the traumatic event." },
            { keywords: ['signs of ocd', 'symptoms of ocd'], response: "Signs of OCD include repetitive behaviors, intrusive thoughts, and the need to perform certain rituals to alleviate anxiety." },
            { keywords: ['signs of fatigue', 'symptoms of fatigue'], response: "Signs of fatigue include persistent tiredness, lack of energy, difficulty concentrating, and an overwhelming desire to rest." },

            // Additional Related Mental Health Conditions
            { keywords: ['what is bipolar disorder', 'define bipolar disorder'], response: "Bipolar disorder is a mental health condition that causes extreme mood swings, including emotional highs (mania or hypomania) and lows (depression)." },
            { keywords: ['what is borderline personality disorder', 'define borderline personality disorder'], response: "Borderline Personality Disorder (BPD) is characterized by unstable moods, behavior, and relationships. People with BPD may experience intense episodes of anger, depression, and anxiety." },
            { keywords: ['what is schizophrenia', 'define schizophrenia'], response: "Schizophrenia is a severe mental disorder that affects how a person thinks, feels, and behaves. It may include symptoms such as hallucinations, delusions, and disorganized thinking." },

            // Mental Health Help and Resources
            { keywords: ['how to cope with anxiety', 'coping with anxiety'], response: "Some ways to cope with anxiety include practicing mindfulness, deep breathing exercises, and engaging in physical activity. Consider exploring the features section for more resources." },
            { keywords: ['how to cope with depression', 'coping with depression'], response: "Managing depression often involves therapy, medication, and self-care. Taking small steps toward positive change can be helpful." },
            { keywords: ['how to cope with trauma', 'coping with trauma'], response: "Healing from trauma often involves professional therapy, support groups, and engaging in self-care activities like meditation, art, or journaling." },
            { keywords: ['how to cope with ocd', 'coping with ocd'], response: "Coping with OCD often involves a combination of therapy (such as Cognitive Behavioral Therapy) and medication. It is important to practice gradual exposure to reduce compulsions." },

            // Mental Health Self-assessment Tools
            { keywords: ['mood slider', 'measure my mood', 'track my mood'], response: "You can use our mood slider to measure how you're feeling today. It's a great way to track your emotional state and get resources tailored to your mood." },
            { keywords: ['mental health assessment', 'mental health check', 'mental health quiz'], response: "Consider using our mental health assessment tool to evaluate your current emotional state. It can guide you in finding helpful resources." },

            // General Health Advice
            { keywords: ['healthy habits', 'wellness tips', 'self-care'], response: "Maintaining a healthy routine, staying hydrated, eating well, exercising, and getting enough sleep can greatly impact your mental and physical well-being." },
            { keywords: ['how to stay positive', 'stay positive', 'positive thinking'], response: "Positive thinking can be cultivated by focusing on gratitude, reframing negative thoughts, and surrounding yourself with supportive people." },

            // Encouragement and Support
            { keywords: ['help', 'i need support', 'need advice'], response: "I'm here to help! Feel free to share what's going on, and I'll guide you to the resources you need." },
            { keywords: ['i feel overwhelmed', 'feeling lost', 'too much to handle'], response: "When things feel overwhelming, break them into smaller tasks and focus on one thing at a time. You're stronger than you think." },

            // Miscellaneous Mental Health Topics
            { keywords: ['psychologist', 'therapist', 'counseling'], response: "Seeking professional help is a great step. A psychologist or therapist can provide you with tools to manage your mental health effectively." },
            { keywords: ['mental illness', 'mental disorder', 'mental health issues'], response: "Mental health issues are common, and it's important to take them seriously. Reach out to a professional for support if needed." },

            // Random inquiries
            { keywords: ['what to do', 'need advice', 'tips'], response: "I'm here to help. Can you tell me more about what you're looking for?" },
            { keywords: ['recommendations', 'suggestions'], response: "I'd be happy to recommend something. What are you interested in?" },

            // Definitions of Mental Health Conditions (New Conditions)
            { keywords: ['what is eating disorder', 'define eating disorder'], response: "An eating disorder is characterized by abnormal or disturbed eating habits. Common eating disorders include anorexia, bulimia, and binge eating disorder." },
            { keywords: ['what is dissociative disorder', 'define dissociative disorder'], response: "Dissociative disorders involve disruptions or breakdowns of memory, awareness, identity, or perception. Common examples include dissociative identity disorder (DID) and dissociative amnesia." },
            { keywords: ['what is somatic symptom disorder', 'define somatic symptom disorder'], response: "Somatic symptom disorder involves an intense focus on physical symptoms such as pain or fatigue, leading to distress and impairment in daily life, even if medical tests show no clear physical cause." },
            { keywords: ['what is psychosis', 'define psychosis'], response: "Psychosis is a mental health condition characterized by a disconnection from reality, which may include hallucinations or delusions." },
            { keywords: ['what is generalized anxiety disorder', 'define generalized anxiety disorder'], response: "Generalized Anxiety Disorder (GAD) is marked by excessive, uncontrollable worry about a variety of topics, leading to physical symptoms like fatigue, irritability, and muscle tension." },

            // Diagnosing Mental Health Conditions (New Conditions)
            { keywords: ['how do i diagnose eating disorder', 'signs of eating disorder'], response: "Diagnosing an eating disorder involves a thorough evaluation by a healthcare provider, often including a physical exam, psychological assessment, and behavioral questionnaires. Signs include extreme concern about weight, food, or body image." },
            { keywords: ['how do i diagnose dissociative disorder', 'signs of dissociative disorder'], response: "Dissociative disorders are diagnosed through clinical interviews and mental health evaluations. Common signs include memory loss, feeling disconnected from one's body, and identity confusion." },
            { keywords: ['how do i diagnose somatic symptom disorder', 'signs of somatic symptom disorder'], response: "Somatic symptom disorder is diagnosed based on an assessment by a healthcare provider. Symptoms include frequent physical complaints without a clear medical cause and excessive worry about those symptoms." },
            { keywords: ['how do i diagnose psychosis', 'signs of psychosis'], response: "Psychosis is diagnosed through a psychiatric evaluation, often involving interviews, mental health history, and sometimes brain scans. Symptoms include hallucinations, delusions, and severe disorganized thinking." },
            { keywords: ['how do i diagnose generalized anxiety disorder', 'signs of generalized anxiety disorder'], response: "GAD is diagnosed through a combination of interviews and questionnaires. Symptoms include chronic, excessive worry, difficulty relaxing, trouble concentrating, and physical symptoms like restlessness and fatigue." },

            // Symptoms and Signs (New Mental Health Conditions)
            { keywords: ['signs of eating disorder', 'symptoms of eating disorder'], response: "Signs of an eating disorder include extreme preoccupation with body weight, restrictive dieting, binge eating, excessive exercise, or using harmful methods like vomiting or laxatives to control weight." },
            { keywords: ['signs of dissociative disorder', 'symptoms of dissociative disorder'], response: "Signs of dissociative disorders include gaps in memory, feeling disconnected from reality, a sense of depersonalization, or experiencing multiple identities or personas." },
            { keywords: ['signs of somatic symptom disorder', 'symptoms of somatic symptom disorder'], response: "Symptoms of somatic symptom disorder include frequent physical complaints (such as pain or fatigue), excessive focus on these symptoms, and heightened concern about health, even in the absence of a clear medical diagnosis." },
            { keywords: ['signs of psychosis', 'symptoms of psychosis'], response: "Signs of psychosis include hallucinations (hearing voices or seeing things that aren't there), delusions (false beliefs), and disorganized thoughts or speech." },
            { keywords: ['signs of generalized anxiety disorder', 'symptoms of generalized anxiety disorder'], response: "Symptoms of generalized anxiety disorder (GAD) include excessive worry, muscle tension, irritability, difficulty relaxing, restlessness, and sleep disturbances." },

            // Coping with Mental Health Conditions (New Conditions)
            { keywords: ['how to cope with eating disorder', 'coping with eating disorder'], response: "Coping with an eating disorder often requires therapy, support groups, and sometimes medical treatment. Cognitive Behavioral Therapy (CBT) and family-based therapy can be helpful." },
            { keywords: ['how to cope with dissociative disorder', 'coping with dissociative disorder'], response: "Coping with dissociative disorder can involve psychotherapy, particularly techniques like grounding exercises and trauma-focused therapy. Building a strong support system is crucial." },
            { keywords: ['how to cope with somatic symptom disorder', 'coping with somatic symptom disorder'], response: "Coping strategies for somatic symptom disorder may include cognitive behavioral therapy (CBT), mindfulness techniques, and focusing on overall wellness instead of individual symptoms." },
            { keywords: ['how to cope with psychosis', 'coping with psychosis'], response: "Psychosis is best managed with professional help, including medication and therapy. Cognitive Behavioral Therapy (CBT) and antipsychotic medications are often used in treatment." },
            { keywords: ['how to cope with generalized anxiety disorder', 'coping with generalized anxiety disorder'], response: "Coping with generalized anxiety disorder involves therapy (especially CBT), practicing relaxation techniques like deep breathing, maintaining a routine, and using medication if prescribed." },

            // Additional Health Conditions and Mental Issues
            { keywords: ['what is addiction', 'define addiction'], response: "Addiction is a chronic disease characterized by the compulsive use of substances or engagement in activities, despite negative consequences. It can affect both mental and physical health." },
            { keywords: ['what is social anxiety', 'define social anxiety'], response: "Social anxiety is a fear of being judged, humiliated, or embarrassed in social situations. People with social anxiety may avoid social interactions or feel extreme discomfort when participating." },
            { keywords: ['what is burnout', 'define burnout'], response: "Burnout is a state of physical, emotional, and mental exhaustion caused by excessive and prolonged stress, typically related to work or caregiving responsibilities." },
            { keywords: ['what is schizophrenia', 'define schizophrenia'], response: "Schizophrenia is a serious mental disorder where individuals experience distorted thinking, hallucinations, and delusions. It can impair the ability to function socially and professionally." },
            { keywords: ['what is narcissistic personality disorder', 'define narcissistic personality disorder'], response: "Narcissistic Personality Disorder (NPD) involves a pattern of grandiosity, need for admiration, and lack of empathy. People with NPD often have difficulty maintaining healthy relationships." },

            // Diagnosing Mental Health Conditions (New Conditions)
            { keywords: ['how do i diagnose addiction', 'signs of addiction'], response: "Addiction is diagnosed through interviews, substance use history, and behavioral assessments. Signs include compulsive use, inability to stop, neglect of responsibilities, and physical withdrawal symptoms." },
            { keywords: ['how do i diagnose social anxiety', 'signs of social anxiety'], response: "Social anxiety is diagnosed through a clinical interview and behavioral assessments. Signs include intense fear of judgment in social situations, physical symptoms like sweating or trembling, and avoiding social interaction." },
            { keywords: ['how do i diagnose burnout', 'signs of burnout'], response: "Burnout is often diagnosed through interviews and assessing an individual's emotional and physical well-being. Symptoms include fatigue, irritability, lack of motivation, and decreased performance." },
            { keywords: ['how do i diagnose schizophrenia', 'signs of schizophrenia'], response: "Schizophrenia is diagnosed through psychiatric evaluations, interviews, and sometimes imaging tests. Signs include delusions, hallucinations, disorganized thinking, and social withdrawal." },
            { keywords: ['how do i diagnose narcissistic personality disorder', 'signs of narcissistic personality disorder'], response: "Narcissistic Personality Disorder is diagnosed based on interviews, behavioral patterns, and psychological assessments. Signs include a sense of superiority, need for admiration, and lack of empathy." },

            // Coping and Managing Other Mental Health Conditions
            { keywords: ['how to cope with addiction', 'coping with addiction'], response: "Coping with addiction typically involves professional treatment, therapy (such as CBT or motivational interviewing), support groups, and sometimes medication." },
            { keywords: ['how to cope with social anxiety', 'coping with social anxiety'], response: "Coping with social anxiety can involve therapy (such as CBT), practicing social skills, and gradually exposing oneself to social situations to build confidence." },
            { keywords: ['how to cope with burnout', 'coping with burnout'], response: "Coping with burnout involves taking breaks, setting healthy boundaries, seeking support, and engaging in activities that promote relaxation and rejuvenation." },
            { keywords: ['how to cope with schizophrenia', 'coping with schizophrenia'], response: "Coping with schizophrenia involves antipsychotic medications, therapy (including CBT), and strong social support to manage symptoms." },
            { keywords: ['how to cope with narcissistic personality disorder', 'coping with narcissistic personality disorder'], response: "Coping with narcissistic personality disorder may involve therapy to help manage grandiose behaviors and improve empathy. Individuals may benefit from learning new coping strategies for relationships." },

            // Tips to Overcome Anxiety
            {
                keywords: ['tips to overcome anxiety', 'tip to overcome anxiety', ' overcome anxiety', 'how to overcome anxiety', 'clues to overcome anxiety', 'ways to overcome anxiety', 'routines to overcome anxiety'],
                response: "To overcome anxiety, try these techniques: deep breathing exercises, practicing mindfulness, maintaining a healthy sleep routine, avoiding caffeine, setting small achievable goals, and seeking support through therapy or support groups."
            },

            // Tips to Overcome Depression
            {
                keywords: ['tips to overcome depression', 'tip to overcome depression', ' overcome depression', 'how to overcome depression', 'clues to overcome depression', 'ways to overcome depression', 'routines to overcome depression'],
                response: "Overcoming depression can involve a combination of approaches: regular physical activity, talking to a mental health professional, keeping a gratitude journal, avoiding isolation, eating a balanced diet, and ensuring adequate rest. Cognitive Behavioral Therapy (CBT) can also be effective."
            },

            // Tips to Overcome PTSD (Post-Traumatic Stress Disorder)
            {
                keywords: ['tips to overcome ptsd', 'tip to overcome PTSD', ' overcome PTSD', 'how to overcome PTSD', 'clues to overcome PTSD', 'ways to overcome PTSD', 'routines to overcome PTSD'],
                response: "To manage PTSD, engage in grounding exercises, avoid alcohol or drugs, practice mindfulness, consider EMDR (Eye Movement Desensitization and Reprocessing) therapy, create a routine, and reach out for support from loved ones or professional counselors."
            },

            // Tips to Overcome OCD (Obsessive-Compulsive Disorder)
            {
                keywords: ['tips to overcome OCD', 'tip to overcome OCD', ' overcome OCD', 'how to overcome OCD', 'clues to overcome OCD', 'ways to overcome OCD', 'routines to overcome OCD'],
                response: "To overcome OCD, try exposure and response prevention therapy (ERP), practice relaxation techniques, avoid rituals, create a consistent routine, and seek professional help to challenge obsessive thoughts. Medication can also be part of the treatment."
            },

            // Tips to Overcome Burnout
            {
                keywords: ['tips to overcome burnout', 'tip to overcome burnout', 'overcome burnout', 'how to overcome burnout', 'clues to overcome burnout', 'ways to overcome burnout', 'routines to overcome burnout'],
                response: "Overcoming burnout involves setting boundaries, taking regular breaks, prioritizing self-care, seeking social support, and possibly reducing work commitments. Try practicing mindfulness, saying no when necessary, and scheduling time for hobbies and relaxation."
            },

            // Tips to Overcome Stress
            {
                keywords: ['tips to overcome stress', 'tip to overcome stress', ' overcome stress', 'how to overcome stress', 'clues to overcome stress', 'ways to overcome stress', 'routines to overcome stress'],
                response: "To combat stress, try deep breathing, exercise, and spending time outdoors. Prioritize tasks, take breaks, practice mindfulness or yoga, engage in hobbies, and make sure to get sufficient sleep. Regular self-care and learning time management can also be helpful."
            },

            // Tips to Overcome Anger
            {
                keywords: ['tips to overcome anger', 'tip to overcome anger', ' overcome anger', 'how to overcome anger', 'clues to overcome anger', 'ways to overcome anger', 'routines to overcome anger'],
                response: "To manage anger, practice relaxation techniques like deep breathing or progressive muscle relaxation. Try to reframe negative thoughts, take time-outs when needed, exercise regularly, and express your feelings calmly. Cognitive Behavioral Therapy (CBT) can also be helpful."
            },

            // Tips to Overcome Social Anxiety
            {
                keywords: ['tips to overcome social anxiety', 'tip to overcome social anxiety', 'overcome social anxiety', 'how to overcome social anxiety', 'clues to overcome social anxiety', 'ways to overcome social anxiety', 'routines to overcome social anxiety'],
                response: "To cope with social anxiety, start with small social interactions and gradually build up to larger ones. Practice relaxation exercises, challenge negative thoughts, focus on the present moment, and use positive self-talk. Social skills training and therapy like CBT can also be beneficial."
            },

            // Tips to Overcome Insomnia
            {
                keywords: ['tips to overcome insomnia', 'tip to overcome insomnia', ' overcome insomnia', 'how to overcome insomnia', 'clues to overcome insomnia', 'ways to overcome insomnia', 'routines to overcome insomnia'],
                response: "To manage insomnia, establish a consistent sleep schedule, avoid caffeine or heavy meals before bed, create a calming bedtime routine, and reduce screen time. Practice relaxation techniques and make your sleeping environment comfortable and relaxing."
            },

            // Tips to Overcome Fatigue
            {
                keywords: ['tips to overcome fatigue', 'tip to overcome fatigue', ' overcome fatigue', 'how to overcome fatigue', 'clues to overcome fatigue', 'ways to overcome fatigue', 'routines to overcome fatigue'],
                response: "Combat fatigue by maintaining a balanced diet, staying hydrated, exercising regularly, and getting enough sleep. Avoiding stress, taking regular breaks, and addressing any underlying medical conditions can also help manage fatigue."
            },

            // Tips to Overcome Grief
            {
                keywords: ['tips to overcome grief', 'tip to overcome grief', ' overcome grief', 'how to overcome grief', 'clues to overcome grief', 'ways to overcome grief', 'routines to overcome grief'],
                response: "To cope with grief, allow yourself to feel emotions, lean on supportive friends or family, talk to a therapist, keep a journal, and focus on self-care. Engage in activities that bring comfort and healing, and remember that healing takes time."
            },

            // Tips to Overcome Addiction
            {
                keywords: ['tips to overcome addiction', 'tip to overcome addiction', ' overcome addiction', 'how to overcome addiction', 'clues to overcome addiction', 'ways to overcome addiction', 'routines to overcome addiction'],
                response: "Overcoming addiction often involves seeking professional help, participating in therapy, attending support groups like 12-step programs, and making lifestyle changes. Finding healthy coping mechanisms, setting clear goals, and building a support network are key strategies."
            },

            // Tips to Overcome Bipolar Disorder
            {
                keywords: ['tips to overcome bipolar disorder', 'tip to overcome bipolar disorder', 'overcome bipolar disorder', 'how to overcome bipolar disorder', 'clues to overcome bipolar disorder', 'ways to overcome bipolar disorder', 'routines to overcome bipolar disorder'],
                response: "To manage bipolar disorder, maintain a stable routine, take prescribed medications, engage in therapy (like CBT), avoid alcohol or drugs, get adequate sleep, and manage stress. Regular exercise and a healthy diet can also contribute to stability."
            },

            // Tips to Overcome Borderline Personality Disorder (BPD)
            {
                keywords: ['tips to overcome BPD', 'tip to overcome BPD', 'tips to overcome borderline personality disorder', 'overcome borderline personality disorder', ' overcome BPD', 'clues to overcome BPD', 'ways to overcome BPD', 'routines to overcome BPD'],
                response: "Managing BPD involves therapy, particularly Dialectical Behavior Therapy (DBT), which helps with emotion regulation, interpersonal skills, and distress tolerance. Building a strong support system, maintaining a structured routine, and practicing mindfulness are also key."
            },

            // Tips to Overcome Schizophrenia
            {
                keywords: ['tips to overcome schizophrenia', 'tip to overcome schizophrenia', ' overcome schizophrenia', 'how to overcome schizophrenia', 'clues to overcome schizophrenia', 'ways to overcome schizophrenia', 'routines to overcome schizophrenia'],
                response: "Schizophrenia management involves medication (antipsychotics), therapy, and creating a stable and supportive environment. Cognitive Behavioral Therapy (CBT), building coping skills, and maintaining social connections are important in managing the condition."
            },

            // Tips to Overcome Narcissistic Personality Disorder (NPD)
            {
                keywords: ['tips to overcome NPD', 'tips to overcome narcissistic personality disorder', 'overcome narcissistic personality disorder', 'tip to overcome NPD', 'overcome NPD', 'how to overcome NPD', 'clues to overcome NPD', 'ways to overcome NPD', 'routines to overcome NPD'],
                response: "Overcoming NPD often requires long-term therapy, particularly psychodynamic therapy or CBT. Building empathy, focusing on self-awareness, and learning to manage interpersonal relationships without excessive entitlement can be helpful."
            },

            // Tips to Overcome Social Withdrawal
            {
                keywords: ['tips to overcome social withdrawal', 'tip to overcome social withdrawal', 'overcome social withdrawal', 'how to overcome social withdrawal', 'clues to overcome social withdrawal', 'ways to overcome social withdrawal', 'routines to overcome social withdrawal'],
                response: "To overcome social withdrawal, start by setting small social goals, challenge negative thoughts, and gradually re-engage with people in a low-pressure environment. Therapy, such as CBT, can help in addressing underlying causes of social withdrawal."
            },

            // Tips to Overcome Self-Harm
            {
                keywords: ['tips to overcome self-harm', 'tip to overcome self-harm', 'overcome self-harm', 'how to overcome self-harm', 'clues to overcome self-harm', 'ways to overcome self-harm', 'routines to overcome self-harm'],
                response: "To manage self-harm, seek professional therapy such as CBT or Dialectical Behavior Therapy (DBT), build coping strategies, engage in creative activities or relaxation exercises, and establish a supportive social network to address the underlying causes."
            },

            // Tips to Overcome Seasonal Affective Disorder (SAD)
            {
                keywords: ['tips to overcome SAD', 'tip to overcome SAD', 'overcome SAD', 'tip to overcome Seasonal Affective Disorder', 'how to overcome SAD', 'clues to overcome SAD', 'ways to overcome SAD', 'routines to overcome SAD'],
                response: "Managing Seasonal Affective Disorder (SAD) includes light therapy, getting outside during daylight hours, maintaining a consistent sleep schedule, and using relaxation techniques. Antidepressants and psychotherapy can also help manage symptoms."
            },

            // Tips to Overcome Panic Attacks
            {
                keywords: ['tips to overcome panic attacks', 'tip to overcome panic attacks', 'overcome panic attacks', 'how to overcome panic attacks', 'clues to overcome panic attacks', 'ways to overcome panic attacks', 'routines to overcome panic attacks'],
                response: "To overcome panic attacks, practice deep breathing, mindfulness, and progressive muscle relaxation. Exposure therapy and Cognitive Behavioral Therapy (CBT) can help address the root cause, while grounding techniques and medication may also provide relief."
            },

            // General response for anxiety-related keywords

            {
                keywords: ['i have anxiety', 'i feel anxious', 'i look anxious', 'i am feeling anxious', 'i am nervous', 'i feel nervous', 'feeling anxious', 'having anxiety'],
                response: "It's okay to feel anxious at times. Take deep breaths and try to relax. Distracting yourself with activities you love can be helpful. Remember, it's important to reach out to a professional if you're feeling overwhelmed."
            },
            {
                keywords: ['i feel depressed', 'i have depression', 'feeling down', 'i feel hopeless', 'i am sad', 'i feel empty', 'i feel worthless', 'i am feeling hopeless'],
                response: "I'm sorry you're feeling this way, but you're not alone. It's important to talk to someone you trust or seek professional help. In the meantime, try to engage in activities that bring you comfort and focus on small steps toward self-care."
            },
            // General response for PTSD-related keywords
            {
                keywords: ['i have PTSD', 'i feel triggered', 'i am scared', 'i am stressed', 'i feel unsafe', 'i have post-traumatic stress', 'having flashbacks'],
                response: "It's okay to have reactions to traumatic experiences. Try grounding techniques or mindfulness exercises to help calm your mind. Please reach out to a mental health professional who can offer guidance and support."
            },
            {
                keywords: [
                    'how do i relax',
                    'what do i need to do to relax',
                    'what can relax me',
                    'how can i manage stress',
                    'what do i do when i am stressed',
                    'how do should i sleep in a day to relax my nerves',
                    'what can i do to sleep well',
                    'how to reduce stress',
                    'ways to relax',
                    'tips for stress relief',
                    'how to sleep better',
                    'how to manage stress and anxiety'
                ],
                response: "To relax, try deep breathing exercises, mindfulness meditation, or progressive muscle relaxation. Consider regular physical exercise, reducing caffeine intake, and engaging in hobbies you enjoy. For stress management, adequate sleep, a balanced diet, and talking to a counselor can help. Also, ensure a calming bedtime routine to improve your sleep and relax your body."
            },
            {
                keywords: [
                    'stressed', 
                    'i am stressing', 
                    'today is stressful',
                    'feeling stressed',
                    'stressful day',
                    'i feel overwhelmed',
                    'under stress'
                ],
                response: "When you're feeling stressed, it's important to relax, prioritize your activities, and take quality rest in between. Break down tasks into manageable steps, and don't hesitate to take short breaks to clear your mind. Remember, taking time to unwind is just as important as getting things done."
            },
            {
                keywords: [
                    'abuse', 
                    'domestic abuse', 
                    'sexual abuse', 
                    'assault', 
                    'rape', 
                    'molestation', 
                    'violence', 
                    'victim of abuse',
                    'I was raped',
                    'I was assaulted',
                    'I was molested',
                ],
                response: "I'm really sorry you're going through this, but you're not alone. It's important to talk to someone you trust, whether it's a friend, family member, or counselor. You can also reach out to a professional hotline for immediate support at +333. Please take care of yourself and seek the help you deserve."
            },
            {
                keywords: [
                    'how can i overcome rape', 
                    'how can i overcome domestic abuse', 
                    'how can i overcome domestic violence', 
                    'how to heal from rape', 
                    'how to heal from domestic abuse', 
                    'how to heal from domestic violence'
                ],
                response: "Overcoming trauma like rape, domestic abuse, or domestic violence can be incredibly challenging, but healing is possible. It’s important to seek professional support, such as therapy or counseling, to help you process your emotions and experiences. Connecting with support groups or talking to trusted friends and family can provide you with the strength and encouragement needed. Remember, you are not alone, and reaching out for help is a powerful first step towards healing. You deserve peace and safety."
            }
            
            
            
            



        ];

        // Search for the first matching response
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            if (response.keywords.some(keyword => normalizedMessage.includes(keyword))) {
                return response.response;
            }
        }

        // Default response if no match is found
        return "I'm sorry, I don't have a response for that. Please try rephrasing your question or ask about a mental health topic.";
    }





    // Event listener for sending a message
    sendButton.addEventListener('click', function () {
        const userMessage = chatInput.value.trim(); // Get the message and trim whitespaces

        if (userMessage !== "") {
            // Create a new div element to display the user's message
            const userMessageDiv = document.createElement('div');
            userMessageDiv.textContent = userMessage;
            userMessageDiv.className = 'user-message right';
            chatBox.appendChild(userMessageDiv);

            // Generate a bot response
            const botResponse = generateResponse(userMessage);

            // Create a new div element to display the bot's response
            const botMessageDiv = document.createElement('div');
            botMessageDiv.textContent = botResponse;
            botMessageDiv.className = 'bot-message left';
            chatBox.appendChild(botMessageDiv);

            chatInput.value = ''; // Clear input field
            chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box
        } else {
            console.warn("User input is empty. Message not sent.");
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
});



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


















