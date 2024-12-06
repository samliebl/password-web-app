import express from 'express';

const router = express.Router();

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

/**
 * Route for the protected page.
 * Renders the protected content view.
 * @name GET /protected
 * @middleware authenticate
 */
router.get('/protected', authenticate, (req, res) => {
    res.render('protected/index.njk', { name: req.session.name });
});

export default router;
