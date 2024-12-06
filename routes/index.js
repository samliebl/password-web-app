import home from './home.js';
import login from './login.js';
import protectedRoute from './protected.js';
import logout from './logout.js';

/**
 * Sets up all routes in the app.
 * @param {import('express').Application} app - The Express app instance.
 */
export default (app) => {
    app.use('/', home);
    app.use('/', login);
    app.use('/', protectedRoute);
    app.use('/', logout);
};
