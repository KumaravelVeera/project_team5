
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }))


app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

const express = require('express');
const { CosmosClient } = require("@azure/cosmos");
const path = require('path');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const endpoint = "YOUR_COSMOS_DB_ENDPOINT";
const key = "YOUR_COSMOS_DB_KEY";
const client = new CosmosClient({ endpoint, key });
const databaseId = "krsuser";
const containerId = "user1";
const database = client.database(databaseId);
const container = database.container(containerId);

app.set('port', (process.env.PORT || 5000));

// Define routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home Page HTML.html'));
});

// Registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

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
    console.error(error);
    res.status(500).send('Registration failed. Please try again.');
  }
});

// Checkout page
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
    console.error(error);
    res.status(500).send('Submission failed. Please try again.');
  }
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

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
    console.error(error);
    res.status(500).send('Error during login. Please try again.');
  }
});

// Other pages
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

app.listen(app.get('port'), () => {
  console.log(`Node app is running at localhost:${app.get('port')}`);
});
