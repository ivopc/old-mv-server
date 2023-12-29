const mysql = require("mysql2");

const config = require("./../database/dbconfig.json");

require('dotenv').config();

const mysqlConnection = mysql.createPool({
    ... config.mysql,
    ... {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME
    }
});


function inReq (req, res, next) {
    req.mysql = mysqlConnection;
    next();
};


function inConn () {
    return {
        mysql: mysqlConnection
    };
};

module.exports = { inReq, inConn };
