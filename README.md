# Mental Health Care Chat Application

## Description
This project is a web-based chat application designed to provide mental health care support through real-time communication. The application allows users to engage with mental health professionals and receive assistance promptly. Users can book therapy and consultation sessions with consultants and experts at the click of a button.

## Features
- **Real-time Chat**: Users can send and receive messages instantly.
- **User-friendly Interface**: Simple and intuitive UI for easy interaction.
- **Book Therapy and Consultation**: Schedule sessions with mental health consultants and experts easily.
- **Articles**: Access to Video Articles on mental illness and coping strategy
- **Features**: Access to categories of Mental Illness resources based on diagnosis
- **Self Check**: Acess to self check feature to enable users personally state how they feel, and recommendations are are suggested for the users based on how they are feeling.
- **Paternership**: Enable Patnerships with consultants and health professionals by subscribing to become a MoodMate In-house consultant.
- **Carousel Display**: Showcases mental health awareness content and services.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Technologies Used
- **HTML/CSS**: For structure and styling of the web pages.
- **JavaScript**: For adding interactivity and functionality to the chat feature.
- **Bootstrap**: Used for responsive design and styling components.
- **Font Awesome**: For adding scalable vector icons.
- **MySql**: Database Technology.
-**NodeJs**: For building Server side logic

## Installation
### Prerequisites
- A modern web browser (Chrome, Firefox, etc.)
- Basic knowledge of HTML, CSS, and JavaScript.

### Getting Started
1. Clone the repository:

2.Navigate to the project directory

3.Open index.html in your preferred web browser to view the application.


Usage
Click the chat icon at the bottom right of the page to open the chat interface.
Type your message in the input field and click "Send" to submit your message.
Browse through the carousel to see mental health resources and services.

Chat Functionality
Description
The chat interface allows users to communicate in real time, facilitating access to mental health support.
How It Works
The chat box is displayed by clicking the chat icon.
Users can send messages, which are displayed in the chat box.
The interface supports both user and bot messages.

Code Snippet
function sendMessage() {
    const input = document.getElementById('chat-input').value;
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<div class="user">${input}</div>`;
    document.getElementById('chat-input').value = ''; // Clear input field
}
Dependencies
jQuery: For DOM manipulation and event handling.
Bootstrap: For responsive layout and styling.

Contact
For questions or inquiries, please reach out via Facebook: https://web.facebook.com/ArowoloRotimii 
Linkedin: https://www.linkedin.com/in/victor-arowolo-bb0ba8159/
