const 
    mysql = require("mysql2");

const config = require("./../database/dbconfig.json");

const mysqlConnection = mysql.createPool({
    ... config.mysql,
    ... {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

// setar os bancos de dados na requisição
function inReq (req, res, next) {
    req.mysql = mysqlConnection;
    next();
};


// setar na conexão
function inConn () {
    return {
        mysql: mysqlConnection
    };
};

module.exports = {
    inReq,
    inConn
};
