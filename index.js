const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3002;

// Connect to SQLite database
const db = new sqlite3.Database('users5.db');

// Your Azure Storage account connection string
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=cloudshell332255291;AccountKey=rIu+Fgw8oN3NRiAII07pMN2JjdfSPXOnv5Uc+jdcvtrHxn80qP41vpiqCea/tD4bquxlEpZoT24V+AStQKoifA==;EndpointSuffix=core.windows.net';

// Create a BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Create a container client for a specific container (replace 'containerName' with your container name)
const containerName = 'firewall';
const containerClient = blobServiceClient.getContainerClient(containerName);

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Multer middleware for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage for simplicity
const upload = multer({ storage: storage });

// ... (existing code)
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});
// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file.buffer;

  // Get a block blob client with a unique name
  const blobName = Date.now() + '-' + req.file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload the file
  try {
    await blockBlobClient.upload(file, file.length);
    res.send('File uploaded successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('File upload failed');
  }
});


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a table for users if it doesn't exist
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL
);)`
);

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS cash_on_delivery_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    address TEXT,
    email TEXT,
    locality_apartment TEXT,
    pincode TEXT,
    contact_no TEXT,
    date TEXT,
    time_slot TEXT
  )
`);

// Define a route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home Page HTML.html'));
});

// Define a route for the registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});



// Handle registration form submission
app.post('/register', (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  // Insert new user into the SQLite database
  db.run(
    'INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
    [first_name, last_name, email, phone, password],
    (error) => {
      if (error) {
        return res.status(500).send('Registration failed. Please try again.');
      }
      res.redirect('/login');
    }
  );
});

// Define a route for the registration page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists in the SQLite database
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, user) => {
    if (error || !user) {
      return res.status(401).send('Invalid username or password');
    }

    // Redirect to the home page after successful login
    res.redirect('/');
  });
});




// Define a route for the registration page
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkoutdeetails.html'));
});


app.post('/checkout', (req, res) => {
  const {
    name,
    address,
    email,
    locality_apartment,
    pincode,
    contact_no,
    date,
    time_slot
  } = req.body;

  // Insert new details into the SQLite database
  db.run(
    'INSERT INTO cash_on_delivery_details (name, address, email, locality_apartment, pincode, contact_no, date, time_slot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, address, email, locality_apartment, pincode, contact_no, date, time_slot],
    (error) => {
      if (error) {
        return res.status(500).send('Submission failed. Please try again.');
      }
      res.redirect('/');
    }
  );
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Feedback Form HTML.html'));
});

app.get('/aboutus', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'About Us HTML.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

