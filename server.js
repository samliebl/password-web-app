/**
 * Main server file for the Password Web App.
 * Sets up the Express server, routes, middleware, and session handling.
 * @module server
 */

import express from 'express';
import session from 'express-session';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';
import setupRoutes from './routes/index.js';

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
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

/**
 * Middleware to protect routes by checking session authentication.
 * @param {import('express').Request} req - The incoming HTTP request.
 * @param {import('express').Response} res - The outgoing HTTP response.
 * @param {Function} next - The next middleware function.
 */
function authenticate(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/protected/login');
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Nunjucks setup
nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

// Routes
setupRoutes(app);

// Start the server
/**
 * Starts the Express server on the specified port.
 * Logs the URL to the console.
 */
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
