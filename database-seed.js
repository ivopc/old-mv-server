require('dotenv').config();

const mysql = require("mysql2");

const mysqlConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    multipleStatements: true
});
const { readFileSync } = require("fs");
const databaseEntries = readFileSync("./database/db.sql", { encoding: 'utf8' });
console.log("Database seed inited!");
mysqlConnection.query(databaseEntries, err => {
    if (err) {
        console.error(err);
    } else {
        console.log("Database seed completed!!");
    };
    mysqlConnection.end();
});