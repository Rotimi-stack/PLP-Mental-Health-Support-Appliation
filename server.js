
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./database'); 
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




// Initialize the GoogleGenerativeAI instance with your API key
const genAI = new GoogleGenerativeAI(process.env.Gemini_API_KEY);


// Set up session management
app.use(session({
    secret: process.env.SESSION_SECRET, // Use the secret from .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Set to true if using HTTPS
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

//#region GENERIC FUNCTION
// Common reusable function to add data to a table
function insertIntoTable(tableName, columns, values, res) {
    const placeholders = values.map(() => '?').join(', ');
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(`Error inserting data into ${tableName}:`, err);
            return res.status(500).send(`Error inserting data into ${tableName}`);
        }
        res.send(`${tableName} data added successfully`);
    });
}
//#endregion



//#region REGISTRATION AND LOGIN
//-----------------------------------------------Serve registration.html page-------------------------------------
app.get('/registration', (req, res) => {
    const filePath = path.join(__dirname, 'registration.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading registration.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Serve the registration page
        }
    });
});

// Handle registration form submission (POST request)

app.post('/register', (req, res) => {
    console.log(req.body);
    const { fullname, email, password, phone_no, address, dob, gender } = req.body;
    console.log(password);  // Check if password is passed correctly

  
    // Hash Password using bcrypt
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({
          success: false,
          message: 'Error hashing password',
          error: err.message
        });
      }
  
      // Use the hashed password instead of the plain text password
      const sql = `INSERT INTO users (fullname, email, password_hash, phone_no, address, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(sql, [fullname, email, hash, phone_no, address, dob, gender], (err) => {
        if (err) {
          console.log(err.stack)
          return res.status(500).send('Error during registration.');
        }
        res.redirect('/login.html'); // Redirect to login page after successful registration
      });
    });
  });
  

//-----------------------------------------------------Serve login.html page------------------------------------
app.get('/login', (req, res) => {

    const filePath = path.join(__dirname, 'login.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading login.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Serve the login page
        }
    });
});

app.post('/login', (req, res) => {
    console.log('Request Body:', req.body);
    const { loginemail, loginpassword } = req.body;

    // Define SQL queries for patients and admin
    const usersQuery = `SELECT user_id FROM users WHERE email = ?`;
    const adminQuery = `SELECT admin_id, role FROM admin WHERE username = ?`;

    // Check if user exists in the patients table
    db.query(usersQuery, [loginemail], (err, usersRows) => {
        if (err) {
            console.error('Error querying users:', err);
            return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
        }

        if (usersRows.length > 0) {
            // Patient found, create JWT token and redirect to index
            const user = usersRows[0];
            const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
            console.log('JWT Token:', token);  // Log the token to the console
            req.session.userId = user.id;
            return res.json({ success: true, token, redirect: '/index' }); // Explicit redirect to /index
        }

        // If not found in users, check in the admin table
        db.query(adminQuery, [loginemail], (err, adminRows) => {
            if (err) {
                console.error('Error querying admin:', err);
                return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
            }

            if (adminRows.length === 0) {
                // No user found in either table
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // User found in admin table, check role
            const admin = adminRows[0];
            const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET_KEY, { expiresIn: '1h' });
            req.session.adminId = admin.id;
            req.session.role = admin.role;

            if (admin.role === 'super_admin' || admin.role === 'admin') {
                req.session.isAuthenticatedForDashboard = true;
                // If the role is admin, create a token and redirect to dashboard
                return res.json({ success: true, token, redirect: '/dashboard.html' });
            } else {
                // Return a response for non-admin roles
                return res.status(403).json({ success: false, message: 'Access restricted to admins.' });
            }
        });
    });
});

//#endregion









//#region USERS
// Endpoint to create Users table
app.get('/create-users-table', (req, res) => {
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS Users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            fullname VARCHAR(100) NOT NULL,
            gender VARCHAR(10) NOT NULL,
            phone_no VARCHAR(15) NOT NULL,
            email VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            address VARCHAR(200) NOT NULL,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            date_of_birth DATE NOT NULL
        );
    `;

    db.query(createUsersTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating Users table:', err);
            res.status(500).send('Error creating Users table');
        } else {
            console.log('Users table created successfully');
            res.send('Users table created successfully');
        }
    });
});

// Add user
app.post('/add-user', (req, res) => {
    const { fullname, gender, phone_no, email, password, address, date_of_birth } = req.body;
    insertIntoTable('Users', ['fullname', 'gender', 'phone_no', 'email', 'password', 'address', 'date_of_birth'], [fullname, gender, phone_no, email, password, address, date_of_birth], res);
});

// Fetch all users
app.get('/fetch-users', (req, res) => {
    db.query('SELECT * FROM Users', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users');
        }
        res.json(results);
    });
});

// Endpoint to update a User
app.put('/update-user/:id', (req, res) => {
    const userId = req.params.id;
    const { fullname, gender, phone_no, email, password, address, date_of_birth } = req.body;

    const updateUserQuery = `
        UPDATE Users
        SET fullname = ?, gender = ?, phone_no = ?, email = ?, password = ?, address = ?, date_of_birth = ?
        WHERE user_id = ?;
    `;

    db.query(updateUserQuery, [fullname, gender, phone_no, email, password, address, date_of_birth, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ success: false, message: 'Error updating user' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User updated successfully' });
    });
});

//#endregion


//#region Professionals
// Endpoint to create Professionals table
app.get('/create-professionals-table', (req, res) => {
    const createProfessionalsTableQuery = `
        CREATE TABLE IF NOT EXISTS Professionals (
            professional_id INT AUTO_INCREMENT PRIMARY KEY,
            fullname VARCHAR(100) NOT NULL,
            gender VARCHAR(10) NOT NULL,
            phone_no VARCHAR(15) NOT NULL,
            email VARCHAR(100) NOT NULL,
            speciality VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            address VARCHAR(200) NOT NULL,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            date_of_birth DATE NOT NULL
        );
    `;

    db.query(createProfessionalsTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating Professionals table:', err);
            res.status(500).send('Error creating Professionals table');
        } else {
            console.log('Professionals table created successfully');
            res.send('Professionals table created successfully');
        }
    });
});

// Add professional
app.post('/add-professional', (req, res) => {
    const { fullname, gender, phone_no, email, speciality, password, address, date_of_birth } = req.body;
    insertIntoTable('Professionals', ['fullname', 'gender', 'phone_no', 'email', 'speciality', 'password', 'address', 'date_of_birth'], [fullname, gender, phone_no, email, speciality, password, address, date_of_birth], res);
});

// Fetch all professionals
app.get('/fetch-professionals', (req, res) => {
    db.query('SELECT * FROM Professionals', (err, results) => {
        if (err) {
            console.error('Error fetching professionals:', err);
            return res.status(500).send('Error fetching professionals');
        }
        res.json(results);
    });
});

// Endpoint to update a Professional
app.put('/update-professional/:id', (req, res) => {
    const professionalId = req.params.id;
    const { fullname, gender, phone_no, email, speciality, password, address, date_of_birth } = req.body;

    const updateProfessionalQuery = `
        UPDATE Professionals
        SET fullname = ?, gender = ?, phone_no = ?, email = ?, speciality = ?, password = ?, address = ?, date_of_birth = ?
        WHERE professional_id = ?;
    `;

    db.query(updateProfessionalQuery, [fullname, gender, phone_no, email, speciality, password, address, date_of_birth, professionalId], (err, result) => {
        if (err) {
            console.error('Error updating professional:', err);
            return res.status(500).json({ success: false, message: 'Error updating professional' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Professional not found' });
        }

        res.status(200).json({ success: true, message: 'Professional updated successfully' });
    });
});
//#endregion


//#region Admin
// Endpoint to create Admin table
app.get('/create-admin-table', (req, res) => {
    const createAdminTableQuery = `
        CREATE TABLE IF NOT EXISTS Admin (
            admin_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    db.query(createAdminTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating Admin table:', err);
            res.status(500).send('Error creating Admin table');
        } else {
            console.log('Admin table created successfully');
            res.send('Admin table created successfully');
        }
    });
});

// Add admin
app.post('/add-admin', (req, res) => {
    const { username, password, role } = req.body;
    insertIntoTable('Admin', ['username', 'password', 'role'], [username, password, role], res);
});

// Fetch all admins
app.get('/fetch-admins', (req, res) => {
    db.query('SELECT * FROM Admin', (err, results) => {
        if (err) {
            console.error('Error fetching admins:', err);
            return res.status(500).send('Error fetching admins');
        }
        res.json(results);
    });
});

// Endpoint to update an Admin
app.put('/update-admin/:id', (req, res) => {
    const adminId = req.params.id;
    const { username, password, role } = req.body;

    const updateAdminQuery = `
        UPDATE Admin
        SET username = ?, password = ?, role = ?
        WHERE admin_id = ?;
    `;

    db.query(updateAdminQuery, [username, password, role, adminId], (err, result) => {
        if (err) {
            console.error('Error updating admin:', err);
            return res.status(500).json({ success: false, message: 'Error updating admin' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        res.status(200).json({ success: true, message: 'Admin updated successfully' });
    });
});
//#endregion



/*http.createServer((req, res) => {
    const filePath = `.${req.url}`;
    const mimeType = mime.lookup(filePath);
  
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('File not found!');
      } else {
        res.writeHead(200, {'Content-Type': mimeType || 'text/plain'});
        res.end(data);
      }
    });
  }).listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });*/
  

  app.listen(3000, () => {
    console.log('Server is running on https://localhost:3000/index');
});
