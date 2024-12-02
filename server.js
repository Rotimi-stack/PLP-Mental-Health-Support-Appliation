
require('dotenv').config(); // Load environment variables from .env file
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // For Hashing Password
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mime = require('mime-types');
const express = require('express');
const session = require('express-session');
const { createClient } = require('redis'); // Redis client

// Initialize the GoogleGenerativeAI instance with your API key
const genAI = new GoogleGenerativeAI(process.env.Gemini_API_KEY);

const app = express();
const port = 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

// Create Redis client with URL from the environment variables
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' // Fallback to local Redis if no REDIS_URL is set
});

// Connect to Redis and configure the session
redisClient.connect().then(() => {
    app.use(session({
        store: new (require('connect-redis')(session))({ // Correctly reference RedisStore
            client: redisClient, // Pass the Redis client to the session store
        }),
        secret: process.env.SESSION_SECRET || 'mood-key', // Secret key for sessions
        resave: false,
        saveUninitialized: true,
    }));

    console.log("Connected to Redis successfully!");
}).catch(err => {
    console.log("Redis connection error: ", err);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Check user session
app.get('/check-session', (req, res) => {
    if (req.session.adminId) {
        return res.json({ role: 'super_admin' });
    } else if (req.session.userId) {
        return res.json({ role: 'user' });
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
});


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

