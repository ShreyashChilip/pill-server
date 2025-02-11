const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./time_db.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS time_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            date INTEGER, 
            month INTEGER, 
            year INTEGER, 
            hours INTEGER, 
            minutes INTEGER)`);
    }
});

// Route to set the time
app.post('/set_time', (req, res) => {
    const { date, month, year, hours, minutes } = req.body;

    if (![date, month, year, hours, minutes].every(Number.isInteger)) {
        return res.status(400).json({ message: 'Invalid input. All fields must be integers.' });
    }

    // Insert the time into the database
    const stmt = db.prepare(`INSERT INTO time_info (date, month, year, hours, minutes) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(date, month, year, hours, minutes, function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error setting time.', error: err });
        }
        res.status(200).json({ message: 'Time set successfully' });
    });
});

// Route to get the time
app.get('/get_time', (req, res) => {
    db.get(`SELECT date, month, year, hours, minutes FROM time_info ORDER BY id DESC LIMIT 1`, (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching time.', error: err });
        }
        if (!row) {
            return res.status(404).json({ message: 'No time found in the database.' });
        }
        res.status(200).json({
            date: row.date,
            month: row.month,
            year: row.year,
            hours: row.hours,
            minutes: row.minutes
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
