import express from 'express';

const router = express.Router();

/**
 * Route for the login page.
 * Renders the login form view.
 * @name GET /protected/login
 */
router.get('/protected/login', (req, res) => {
    res.render('protected/login.njk', { error: null });
});

/**
 * Route for handling login form submission.
 * Authenticates the user and starts a session.
 * @name POST /protected/login
 */
router.post('/protected/login', (req, res) => {
    const { name, password } = req.body;

    if (!/^[a-zA-Z0-9 ]{1,16}$/.test(name)) {
        return res.render('protected/login.njk', {
            error: 'Name must be alphanumeric, up to 16 characters.',
        });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.render('protected/login.njk', { error: 'Invalid password.' });
    }

    req.session.isAuthenticated = true;
    req.session.name = name;
    req.session.startTime = new Date();
    res.redirect('/protected');
});

export default router;
