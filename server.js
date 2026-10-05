const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// ===============================
// MYSQL CONNECTION
// ===============================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1122",
    database: "student_db"
});

db.connect((err) => {

    if (err) {
        console.log("❌ MySQL connection failed!");
        console.log(err.message);
    } else {
        console.log("✅ MySQL Connected Successfully!");
    }

});

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");

// ===============================
// HOME + SEARCH
// ===============================

app.get("/", (req, res) => {

    const search = req.query.search;

    // ===============================
    // SEARCH STUDENT
    // ===============================

    if (search) {

        const sql = `
            SELECT * FROM students
            WHERE id = ?
            OR name LIKE ?
            LIMIT 1
        `;

        db.query(
            sql,
            [search, `%${search}%`],
            (err, results) => {

                if (err) {

                    return res.send(
                        "Database Error: " + err.message
                    );

                }

                res.render("index", {

                    students: [],

                    searchedStudent:
                        results.length > 0
                            ? results[0]
                            : null,

                    searchPerformed: true

                });

            }
        );

    }

    // ===============================
    // SHOW ALL STUDENTS
    // ===============================

    else {

        const sql = "SELECT * FROM students ORDER BY id";

        db.query(sql, (err, results) => {

            if (err) {

                return res.send(
                    "Database Error: " + err.message
                );

            }

            res.render("index", {

                students: results,

                searchedStudent: null,

                searchPerformed: false

            });

        });

    }

});

// ===============================
// ADD STUDENT PAGE
// ===============================

app.get("/add", (req, res) => {

    res.render("add");

});

// ===============================
// ADD STUDENT
// ===============================

app.post("/add", (req, res) => {

    const {
        name,
        email,
        course,
        marks
    } = req.body;

    const sql = `
        INSERT INTO students
        (name, email, course, marks)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, course, marks],
        (err) => {

            if (err) {

                return res.send(
                    "Error: " + err.message
                );

            }

            res.redirect("/");

        }
    );

});

// ===============================
// EDIT STUDENT PAGE
// ===============================

app.get("/edit/:id", (req, res) => {

    const id = req.params.id;

    const sql =
        "SELECT * FROM students WHERE id = ?";

    db.query(
        sql,
        [id],
        (err, results) => {

            if (err) {

                return res.send(
                    "Error: " + err.message
                );

            }

            if (results.length === 0) {

                return res.send(
                    "Student not found!"
                );

            }

            res.render("edit", {

                student: results[0]

            });

        }
    );

});

// ===============================
// UPDATE STUDENT
// ===============================

app.post("/edit/:id", (req, res) => {

    const id = req.params.id;

    const {
        name,
        email,
        course,
        marks
    } = req.body;

    const sql = `
        UPDATE students
        SET
            name = ?,
            email = ?,
            course = ?,
            marks = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            email,
            course,
            marks,
            id
        ],
        (err) => {

            if (err) {

                return res.send(
                    "Error: " + err.message
                );

            }

            res.redirect("/?search=" + id);

        }
    );

});

// ===============================
// DELETE STUDENT
// ===============================

app.get("/delete/:id", (req, res) => {

    const id = req.params.id;

    const sql =
        "DELETE FROM students WHERE id = ?";

    db.query(
        sql,
        [id],
        (err) => {

            if (err) {

                return res.send(
                    "Error: " + err.message
                );

            }

            res.redirect("/");

        }
    );

});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `🚀 Server running at http://localhost:${PORT}`
    );

});