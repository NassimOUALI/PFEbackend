const mysql = require('mysql')


const db = mysql.createPool({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

db.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to the database: ", err);
        return;
    }
    console.log("Connected to DB successfully");
    connection.release(); 
});

module.exports = db;