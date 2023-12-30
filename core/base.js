const Base = function (main, socket, auth, db, scServer, dataMasterEvents) {
    /** @type {Main} */
    this.main = main;
    this.socket = socket;
    /** @type {{ uid: string }} */
    this.auth = auth;
    this.db = db;
    this.scServer = scServer;
    /**@type {Datamaster} */
    this.dataMasterEvents = dataMasterEvents;
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