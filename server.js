import express from 'express';
import session from 'express-session';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Create __dirname for ES modules
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'supersecretkey',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 3600000 }, // 1 hour
    })
);

// Login log file path
const loginLogPath = path.join(__dirname, 'user_login.json');

// Protected route middleware
function authenticate(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/protected/login');
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Nunjucks setup
import nunjucks from 'nunjucks';
nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

// Routes
// Landing page
app.get('/', (req, res) => {
    res.render('index.njk', { title: 'Welcome to Password Web App' });
});

// Login form page
app.get('/protected/login', (req, res) => {
    res.render('protected/login.njk', { error: null });
});

// Handle login form submission
app.post('/protected/login', async (req, res) => {
  const { name, password } = req.body;

  // Validate the name field
  if (!/^[a-zA-Z0-9 ]{1,16}$/.test(name)) {
    return res.render('protected/login.njk', {
      error: 'Name must be alphanumeric, up to 16 characters.',
    });
  }

  // Validate the password
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.render('protected/login.njk', { error: 'Invalid password.' });
  }

  // Authenticate the user
  req.session.isAuthenticated = true;
  req.session.name = name;
  req.session.startTime = new Date(); // Store login time in session

  res.redirect('/protected');
});


// Protected page
app.get('/protected', authenticate, (req, res) => {
    res.render('protected/index.njk', { name: req.session.name });
});

app.get('/logout', async (req, res) => {
  if (!req.session.startTime) {
    return res.redirect('/'); // No session to log out
  }

  const startTime = new Date(req.session.startTime);
  const endTime = new Date();
  const duration = new Date(endTime - startTime);

  const loginEntry = {
    time: startTime.toISOString(),
    name: req.session.name,
    session: {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      hours: duration.getUTCHours(),
      minutes: duration.getUTCMinutes(),
      seconds: duration.getUTCSeconds(),
    },
  };

  try {
    // Safely read and parse the JSON file
    const rawData = await fs.readFile(loginLogPath, 'utf8').catch(() => '[]'); // Fallback to empty array
    const logData = rawData.trim() ? JSON.parse(rawData) : []; // Handle empty or missing file

    logData.push(loginEntry); // Add the new session entry
    await fs.writeFile(loginLogPath, JSON.stringify(logData, null, 2)); // Write updated data
  } catch (err) {
    console.error('Error writing login log:', err);
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
    }
    res.redirect('/?loggedOut=true'); // Redirect to landing page
  });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});