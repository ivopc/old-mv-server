const 
    async = require("async"),
    _ = require("underscore");

// index do admin
exports.index = function (req, res) {
    res.render("admin");
};

// rota para banir
exports.ban = function (req, res) {

    async.waterfall([
        next => {
            // vê se player existe
            req.mysqlConn.query(
                "SELECT `id` FROM `users` WHERE `id` = ?",
                [req.body["uid"]],
                (err, results) => {
                    if (!results.length) {
                        res.json({error: 1});
                        return;
                    };

                    next(null, true);
                }
            );
        },
        (nothing, next) => {
            // bane
            req.mysqlConn.query(
                "UPDATE `users` SET `ban` = '1' WHERE `id` = ?",
                [req.body["uid"]],
                (err, results) => next(err, results)
            );
        },
        (nothing, next) => {
            // vê se player tá online e pega infos dele
            req.mysqlConn.query(
                "SELECT `sckt_id` FROM `online_offline_flag` WHERE `uid` = ?",
                [req.body["uid"]],
                next
            );
        },
        // desconecta player do jogo
        (results, fields, next) => {
            // se não há ninguém conectado só vai pro proximo
            if (!results.length) {
                next(null, true);
                return;
            };
            
            // * se há alguém conectado, desconecta ele
            // desconecta
            for (let i = 0; i < results.length; i ++) {
                if (results[i].sckt_id in req.scServer.clients)
                    req.scServer.clients[results[i].sckt_id].disconnect();
            };

            // remove na db q está conectado
            req.mysqlConn.query(
                "DELETE FROM `online_offline_flag` WHERE `uid` = ?",
                [req.body["uid"]],
                (err, results) => next(err, true)
            );

        },
        () => {
            // desconectado e banido com sucesso
            res.json({success: true});

            console.log(`User de ID ${req.body["uid"]} Banido com sucesso`);
        }
    ]);
};

// rota para debanir
exports.unban = function (req, res) {
    async.waterfall([
        next => {
            // vê se player existe
            req.mysqlConn.query(
                "SELECT `id` FROM `users` WHERE `id` = ?",
                [req.body["uid"]],
                (err, results) => {
                    if (!results.length) {
                        res.json({error: 1});
                        return;
                    };

                    next(null, true);
                }
            );
        },
        (nothing, next) => {
            // disbane
            req.mysqlConn.query(
                "UPDATE `users` SET `ban` = '0' WHERE `id` = ?",
                [req.body["uid"]],
                (err, results) => next(err, results)
            );
        },
        () => res.json({success: true})
    ])
};