const mysql = require('mysql')


const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'chopain'
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