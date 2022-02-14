const Base = function (socket, auth, db, scServer) {
    this.socket = socket;
    this.auth = auth;
    this.db = db;
    this.scServer = scServer;
};

Base.prototype.mysqlQuery = function () {
    const args = arguments;
    this.db.mysql.getConnection((err, conn) => {
        if (err) throw err;
        const q = conn.query(... args);
        q.on("end", () => conn.release());
    });
};

Base.prototype.escapeSQL = function (string) {
    return this.db.mysql.escape(string);
};

module.exports = Base;