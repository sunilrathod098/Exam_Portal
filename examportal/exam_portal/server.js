const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sunil@2002', // Replace with your MySQL password
    database: 'at_exam_portal'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Register endpoint
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Hashing error:', err);
            return res.status(500).send('Server error');
        }

        const sql = 'INSERT INTO Std_user (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Error registering user');
            }
            res.status(201).send('User registered');
        });
    });
});


// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM Std_user WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).send('Server error');
        if (results.length === 0) return res.status(400).send('Invalid credentials');

        const user = results[0];
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) return res.status(500).send('Server error');
            if (!match) return res.status(400).send('Invalid credentials');

            res.status(200).send({ id: user.id, name: user.name, email: user.email });
        });
    });
});


// Endpoint to save exam results
app.post('/results', (req, res) => {
    const { user_id, exam_category, score, total_questions, correct_answers, incorrect_answers, time_taken } = req.body;


    if (!user_id || !exam_category || !score || !total_questions || !correct_answers || !incorrect_answers || !time_taken) {
        return res.status(400).send('All fields are required');
    }
    const sql = 'INSERT INTO std_results (user_id, exam_category, score, total_questions, correct_answers, incorrect_answers, time_taken) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [user_id, exam_category, score, total_questions, correct_answers, incorrect_answers, time_taken], (err, result) => {
        if (err) return res.status(500).send('Error saving exam results');
        res.status(201).send('Exam results saved successfully');
    });
});

// Endpoint to retrieve exam results for a specific user
app.get('/results/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    const sql = 'SELECT * FROM std_results WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send('Server error');
        if (results.length === 0) return res.status(404).send('No results found for this user');

        res.status(200).json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

