const 
    r = require("rethinkdb"),
    async = require("async");

const config = require("./../database/dbconfig.json");

const PlayerData = function () {};

// Conectar a db
PlayerData.prototype.connect = function (callback) {
    r.connect(config.rethinkdb, callback);
};

// inserir na db
PlayerData.prototype.insert = function (object, callback) {
    
    let connection;

    async.waterfall([
        next => this.connect(next),
        (conn, next) => {
            connection = conn;

            // object =
            // uid,
            // nickname: req.body["nickname"],
            // online: false,
            // sprite: 2,
            // map: default_init.position.map,
            // pos_x: default_init.position.x,
            // pos_y: default_init.position.y,
            // pos_facing: default_init.position.facing

            r.table("game_data")
                .insert([object])
                    .run(conn, next);
        },
        () => {
            connection.close();

            if (typeof(callback) == "function")
                callback();
        }
    ]);
};

// pegar dados de um player especifico
PlayerData.prototype.get = function (uid, callback, _connection) {

    let connection;

    async.waterfall([
        next => _connection ? next(null, _connection) : this.connect(next),
        (conn, next) => {
            connection = conn;
            
            r.table("game_data")
                .filter(r.row("uid").eq(+uid))
                    .run(conn, next);
        },
        (cursor, next) => {
            connection.close();
            cursor.toArray((err, data) => next(err, data[0]));
        }
    ], callback);
};

// setar algum dado especifico
PlayerData.prototype.set = function (uid, object, callback) {
    let connection;
    async.waterfall([
        next => this.connect(next),
        (conn, next) => {
            connection = conn;
            r.table("game_data")
                .filter(r.row("uid").eq(+uid))
                .update(object)
                    .run(conn, next);
        },
        data => {
            if (typeof(callback) == "function")
                callback(null, data);

            connection.close();
        }
    ]);
};

// pegar players que estão online no mapa especifico
PlayerData.prototype.getActivePlayersInMap = function (map_id, notUid, callback) {

    let connection;

    async.waterfall([
        next => this.connect(next),
        (conn, next) => {
        connection = conn;
            r.table("game_data")
                .filter(r.row("map").eq(map_id))
                .filter(r.row("online").eq(true))
                // não incluir o próprio jogador
                .filter(r.row("uid").ne(+notUid))
                    .run(conn, next);
        },
        (cursor, next) => {
            connection.close();
            cursor.toArray(next);
        }
    ], callback);
};

// updeitar posição do player no mapa para certa direção
PlayerData.prototype.walk = function (uid, direction, callback) {
    
    let connection;

    async.waterfall([
        next => this.connect(next),
        (conn, next) => {
            connection = conn;
            // storando query
            let query;
            // vendo pra qual direção vai
            switch (direction) {

                case 0: { // up
                    query = {pos_y: r.row("pos_y").sub(1)};
                    break;
                };

                case 1: { // right
                    query = {pos_x: r.row("pos_x").add(1)};
                    break;
                };

                case 2: { // down
                    query = {pos_y: r.row("pos_y").add(1)};
                    break;
                };

                case 3: { // left
                    query = {pos_x: r.row("pos_x").sub(1)};
                    break;
                };
            };
            // atualiza facing
            query.pos_facing = direction;

            // updeita na db
            r.table("game_data")
                .filter(r.row("uid").eq(+uid))
                .update(query)
                    .run(conn, next);
        },
        // retornar dados do player
        () => this.get(uid, callback, connection)
    ]);
};

// updeitar facing do player
PlayerData.prototype.face = function (uid, direction, callback) {
    let connection;

    async.waterfall([
        next => this.connect(next),
        (conn, next) => {
            connection = conn;

            // updeita na db
            r.table("game_data")
                .filter(r.row("uid").eq(+uid))
                .update({pos_facing: direction})
                    .run(conn, next);
        },
        // retornar dados do player
        () => this.get(uid, callback, connection)
    ]);
};

module.exports = PlayerData;

// ** cheatsheet

// r.connect({
//     host: "localhost",
//     port: 28015
// }, (err, conn) => {
    // ** cria tabela
    // r.tableCreate("game_data").run(conn, (err, data) => {
    //     console.log(data);
    // });

    // limpa db
    //r.db("test").tableDrop("game_data").run(conn, () => console.log("limpou!"));

    // ** inserir na tabela
    // r.table("game_data").insert([
    //     {
    //         uid: 1,
    //         nickname: "Ivopc",
    //         map: 3,
    //         online: true,
    //         pos_x: 29,
    //         pos_y: 21,
    //         pos_facing: 0,
    //         sprite: 2
    //     }
    // ]).run(conn, (err, data) => {
    //     console.log(data);
    // });

    // ** buscar valores
    // r.table("game_data").filter(r.row("uid").eq(1)).run(conn, (err, cursor) => {
    //         cursor.toArray((err, data) => {
    //             console.log(data[0]);
    //         });
    // });

    //** update
    // r.table("game_data").
    // filter(r.row("uid").eq(1)).
    // update({pos_x: 2}).
    // run(conn, function(err, result) {
    //     if (err) throw err;
    //     console.log(result);
    // });

    // ** update add (increment)
    // r.table("game_data").
    // filter(r.row("uid").eq(1)).
    // update({pos_y: r.row("pos_y").add(1)}).
    // run(conn, (err, result) => {
    //     if (err) throw err;
    //     console.log(result);
    // });

    // ** update menos (substact)
    // r.table("game_data").
    // filter(r.row("uid").eq(1)).
    // update({pos_y: r.row("pos_y").sub(1)}).
    // run(conn, (err, result) => {
    //     if (err) throw err;
    //     console.log(result);
    // });

    // ** deletar
    // r.table("game_data")
    //     .filter(r.row("uid").eq(1))
    //     .delete()
    //         .run(conn, (err, data) => {
    //            console.log(data); 
    //         });

    // ** pegar todos
    // r.table("game_data").run(conn, function(err, cursor) {
    //     if (err) throw err;
    //     cursor.toArray(function(err, result) {
    //         if (err) throw err;
    //         console.log(JSON.stringify(result, null, 2));
    //     });
    // });
//});