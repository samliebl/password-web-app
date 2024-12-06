import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Route for logging out the user.
 * Ends the session and logs session details to a file.
 * @name GET /logout
 */
router.get('/logout', async (req, res) => {
    if (!req.session.startTime) {
        return res.redirect('/');
    }

    const loginLogPath = path.join(__dirname, '../user_login.json');
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
        const rawData = await fs.readFile(loginLogPath, 'utf8').catch(() => '[]');
        const logData = rawData.trim() ? JSON.parse(rawData) : [];
        logData.push(loginEntry);
        await fs.writeFile(loginLogPath, JSON.stringify(logData, null, 2));
    } catch (err) {
        console.error('Error writing login log:', err);
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        res.redirect('/?loggedOut=true');
    });
});

export default router;
