const mysql = function (mysql) {
    this.mysql = mysql;
};

mysql.prototype.query = function () {
	const args = arguments;
    this.mysql.getConnection((err, conn) => {
        if (err) throw err;
        const q = conn.query(... args);
        q.on("end", () => conn.release());
    });
};

module.exports = function (req, res, next) {
    req.mysqlConn = new mysql(req.mysql);
    next();
};

