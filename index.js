
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

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

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Feedback Form HTML.html'));
});

app.get('/aboutus', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'About Us HTML.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
