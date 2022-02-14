const 
    mysql = require("mysql");

const config = require("./../database/dbconfig.json");

const mysqlConnection = mysql.createPool(config.mysql);

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
