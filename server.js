
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const bcrypt = require('bcryptjs');//For Hashing Password
const bodyParser = require('body-parser');
const port = 3000;
const multer = require('multer');
const jwt = require('jsonwebtoken');
const session = require('express-session');//Session Management
const SECRET_KEY = process.env.JWT_SECRET; 
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mime = require('mime-types');
const PORT = process.env.PORT || 3000;
// Initialize the GoogleGenerativeAI instance with your API key
const genAI = new GoogleGenerativeAI(process.env.Gemini_API_KEY);



const redis = require('redis');
const { createClient } = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const client = createClient({
  legacyMode: true,
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.connect().catch(console.error);

app.use(session({
  store: new RedisStore({ client }),
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production'
  }
}));






// Check user session
app.get('/check-session', (req, res) => {
    // Check if the user is logged in
    if (req.session.adminId) {
        return res.json({ role: 'super_admin' }); // User is an admin
    } else if (req.session.userId) {
        return res.json({ role: 'user' }); // User is a patient
    } else {
        return res.status(401).json({ message: 'Unauthorized' }); // User not logged in
    }
});

app.use(bodyParser.urlencoded({ extended: true }));// Body parser middleware to parse form data from POST requests
app.use(bodyParser.json());


// Use CORS and JSON middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  


 
  
//authentication middleare that performs validation of the token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Setting default role to 'user' for ordinary users without a role
        req.user = { id: decoded.id, role: decoded.role || 'user' };

        next();
    });
}


//#region *********************************************************Gemini API Chat route
app.post('/api/chat', async (req, res) => {
    const { query } = req.body;

    if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Query cannot be empty' });
    }

    try {
        // Initialize the Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Fetch the Gemini model
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate content using the user's query
        const result = await model.generateContent(query);

        // Respond with the generated content
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error('Error communicating with Gemini API:', error.message);
        res.status(500).json({ error: 'Could not fetch data from Gemini API' });
    }
});

app.post('/api/mood-input', async (req, res) => {
    const { moodInput } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(
            `Analyze this mood: "${moodInput}" and provide a personalized recommendation.`
        );

        const analysisText = result.response.text(); // Get Gemini's response

        // Example processing: Convert analysis into HTML-friendly format
        const formattedAnalysis = analysisText
            .replace(/\*{2}(.*?)\*{2}/g, '<strong>$1</strong>') // Bold for **text**
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics for *text*
            .replace(/\n/g, '<p></p>'); // Paragraph breaks on newline

        // Optionally, handle lists (if Gemini returns something like bullets or numbers)
        // Replace bullets or numbers with <ul> or <ol>
        const formattedResponse = `
            <p><strong>MoodMate Analysis:</strong></p>
            <p>${formattedAnalysis}</p>
            <p><strong>Recommendation:</strong></p>
            <ul>
                <li>Take some time for self-reflection. Journaling can be helpful...</li>
                <li>Practice stress-reducing techniques, such as deep breathing...</li>
                <li>Talk to someone you trust – a friend, family member...</li>
            </ul>
        `;

        res.json({ analysis: formattedResponse });
    } catch (error) {
        console.error('Error analyzing mood:', error.message);
        res.status(500).json({ error: 'Failed to analyze mood.' });
    }
});


//#endregion


// Serve the index.html page
app.get('/index', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading index.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
});

//{JESUS IS LORD}



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

