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
            d INTEGER, 
            month INTEGER, 
            year INTEGER, 
            hours INTEGER, 
            minutes INTEGER)`);
    }
});

app.post('/set_time', (req, res) => {
    const { d, month, year, hours, minutes } = req.body;

    // Check if all fields are present
    if (d === undefined || month === undefined || year === undefined || hours === undefined || minutes === undefined) {
        return res.status(400).json({ message: 'Missing fields. All fields (d, month, year, hours, minutes) are required.' });
    }

    // Ensure all values are valid integers
    if (
        isNaN(d) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)
    ) {
        return res.status(400).json({ message: 'Invalid input. All fields must be numbers.' });
    }

    const intD = parseInt(d, 10);
    const intMonth = parseInt(month, 10);
    const intYear = parseInt(year, 10);
    const intHours = parseInt(hours, 10);
    const intMinutes = parseInt(minutes, 10);
    console.log(intD);
    console.log(intMonth);
    console.log(intYear);
    console.log(intHours);
    console.log(intMinutes);
    // Insert the time into the database
    const stmt = db.prepare(`INSERT INTO time_info (d, month, year, hours, minutes) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(intD, intMonth, intYear, intHours, intMinutes, function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error setting time.', error: err });
        }
        res.status(200).json({ message: 'Time set successfully' });
    });
});


// Route to get the time
app.get('/get_time', (req, res) => {
    db.get(`SELECT d, month, year, hours, minutes FROM time_info ORDER BY id DESC LIMIT 1`, (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching time.', error: err });
        }
        if (!row) {
            return res.status(404).json({ message: 'No time found in the database.' });
        }
        res.status(200).json({
            d: row.d,
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
