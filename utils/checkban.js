const async = require("async");

module.exports = (req, res, next) => {
    if (!req.session["isConnected"]) {
        next();
    } else {
        req.mysqlConn.query(
            "SELECT `ban` FROM `users` WHERE `id` = ?",
            [req.session["uid"]],
            (err, results) => delegate(results[0].ban, req, res, next)
        );
    };
};

function delegate (isBan, req, res, next) {
    // se for banido expulsa
    if (isBan) {
        async.series([
            next => req.session.destroy(next),
            () => res.redirect("/?ban=1")
        ]);
    } else {
        next();
    };
};