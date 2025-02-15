const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create the table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS time_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            month TEXT,
            year TEXT,
            hours TEXT,
            minutes TEXT
        )`);
    }
});

// Route to set time
app.post('/set_time', (req, res) => {
    const { d, month, year, hours, minutes } = req.body;

    if (!d || !month || !year || !hours || !minutes) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const queryDelete = 'truncate table time_data;'
    db.run(queryDelete, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
    const query = `INSERT INTO time_data (date, month, year, hours, minutes) VALUES (?, ?, ?, ?, ?)`;


    db.run(query, [d, month, year, hours, minutes], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Route to get time
app.get('/get_time', (req, res) => {
    const query = `SELECT * FROM time_data ORDER BY id DESC LIMIT 1`;
    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'No time data found' });
        }
        res.json(row);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});