import express from 'express';

const router = express.Router();

/**
 * Route for the landing page.
 * Renders the home page view.
 * @name GET /
 */
router.get('/', (req, res) => {
    res.render('index.njk', { title: 'Welcome to Password Web App' });
});

export default router;
