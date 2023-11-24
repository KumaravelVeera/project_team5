
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }))


app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

const { CosmosClient } = require("@azure/cosmos");

const endpoint = "<your-cosmos-db-endpoint>";
const key = "<your-cosmos-db-key>";

const client = new CosmosClient({ endpoint, key });

const databaseId = "<your-database-id>";
const containerId = "<your-container-id>";

const database = client.database(databaseId);
const container = database.container(containerId);


// Define a route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home Page HTML.html'));

});

// Define a route for the registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Handle registration form submission
app.post('/register', async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  try {
    await container.items.create({
      first_name,
      last_name,
      email,
      phone,
      password
    });

    res.redirect('/login');
  } catch (error) {
    res.status(500).send('Registration failed. Please try again.');
  }
});

// Handle checkout form submission
app.post('/checkout', async (req, res) => {
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

  try {
    await container.items.create({
      name,
      address,
      email,
      locality_apartment,
      pincode,
      contact_no,
      date,
      time_slot
    });

    res.redirect('/');
  } catch (error) {
    res.status(500).send('Submission failed. Please try again.');
  }
});


// Define a route for the registration page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login form submission
// Handle login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.email = @email AND c.password = @password",
      parameters: [
        { name: "@email", value: email },
        { name: "@password", value: password }
      ]
    };

    const { resources } = await container.items.query(querySpec).fetchAll();

    if (resources.length === 0) {
      return res.status(401).send('Invalid username or password');
    }

    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error during login. Please try again.');
  }
});




// Define a route for the registration page
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkoutdeetails.html'));
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
