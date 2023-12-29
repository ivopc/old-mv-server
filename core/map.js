const async = require("async");

const EVENTS = require("./../database/socket_events.json");

const PlayerData = require("./playerdata.js");

const Base = require("./base.js");

const Map = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
};

Map.prototype = Object.create(Base.prototype);

const 
    Resources = {
        position: require("./../database/maps_list.json")
    },
    MapData = {};

for (let i = 0, l = Resources.position.length; i < l; i++) {

    // definindo o nome do mapa
    let res = Resources.position[i];

    // definindo mapa
    MapData[res.id] = require("./../database/maps/" + res.name + ".json");
};

//console.log("dados do mapa", MapData);

// Mudar de mapa
Map.prototype.changeMap = function (input) {
    //input:
        // mid = id do mapa que vai
        // tid = id do teleport que vai
    input = input || {};

    // autenticando
    if (isNaN(input.mid) || isNaN(input.tid)) {
        console.log("erro - 1 - map.js - método 'changeMap'");
        return;
    };

    // o id do mapa não existe
    if ( !(input.mid in MapData) ) {

        console.log("erro - 2 - map.js - método 'changeMap'");

        // main.callAGmPossibleCheater();
        return;
    };

    // checando se o id do teleport n existe
    if (!(input.tid in MapData[input.mid].incomingteleport)) {

        console.log(input.tid);

        console.log("erro - 3 - map.js - método 'changeMap'");

        // main.callAGmPossibleCheater();
        return;
    };

    console.log("ok - 4 - map.js - método 'changeMap'");

    // definindo flag e objeto playerdata
    let flag,
        pdata;

    async.waterfall([
        // procura no banco de dados o flag
        next => {
            // faz query procurando o tipo 'm' (flags de mapa)
            this.mysqlQuery(
                "SELECT `value` FROM `flags` WHERE `uid` = ? AND `type` = 'm' AND `flag_id` = ?",
                [this.auth.uid, input.mid],
                (err, results) => {
                    /* não achou nada, então provavelmente 
                    aconteceu um bug ou o jogador está tentando trapacear 
                    o sistema, chama erro com namespace de 1 */
                    if (!results.length) {
                        console.log("erro - 5 - map.js - método 'changeMap'");
                        next(1);
                        return;
                    };

                    // definindo flag
                    flag = results[0];

                    // vai pro próximo com os resultados
                    next(null, results[0]);
                }
            );
        }, 
        (results, next) => {

            /*o jogador não pode ir para o mapa, 
            pois a flag para aquele mapa não foi setada
            então ele é oficialmente um trapaceiro */
            if ( flag.value < 1 ) {
                console.log("erro - 6 - map.js - método 'changeMap'");
                next(2);
                return;
            };

            next(null, true);
        },
        (nothing, next) => {
            pdata = new PlayerData();

            // remover player (sprite) do mapa que ele vai air
            pdata.get(this.auth.uid, (err, data) => {
                this.scServer.exchange.publish("m" + data.map, {
                    uid: this.auth.uid,
                    dataType: 3
                });
                next(null, true);
            });
        },
        (nothing, next) => {
            // posição atual
            let incomingteleport = MapData[input.mid].incomingteleport[input.tid];

            // muda de mapa
            pdata.set(this.auth.uid, {
                pos_x: incomingteleport.x,
                pos_y: incomingteleport.y,
                pos_facing: incomingteleport.facing,
                map: input.mid
            }, next);
        }
    ], (err, data) => {
        // se houver erro
        if (err || !data) {
            console.log("Deu erro: ", err);
            switch(err) {

                case 1: {

                    this.socket.emit(157, ["???"]);
                    // main.dbRollBack();
                    // main.callAGm();
                    break;
                };

                default: {

                    this.socket.emit(157, ["???"]);

                    // main.dbRollBack();
                    // main.callAGm();

                    break;
                };
            };
            return;
        };

        // pegar dados complementares ao mapa
        async.parallel({
            tamers: next => {
                if (MapData[input.mid].tamers) {
                    this.getActiveTamers(input.mid, next);
                } else {
                    next(null, null);
                };
            }
        }, (err, data) => {

            console.log("hey yaooooow", data);

            this.socket.emit(EVENTS.CHANGE_MAP, {
                mid: input.mid,
                flag: flag.value,
                tamers: data.tamers
            });
        });
    });
};

// Pegar players que estão no mapa
Map.prototype.getActivePlayersInMap = function () {
    const pdata = new PlayerData();

    async.waterfall([
        // pegar mapa atual
        next => pdata.get(this.auth.uid, next),
        // pegar players que estão no mapa
        (data, next) => pdata.getActivePlayersInMap(data.map, this.auth.uid, next),
        // enviar players que estão no mapa
        data => {
            if (data.length > 0)
                this.socket.emit(EVENTS.SEND_PLAYERS_IN_MAP, data);
        }
    ]);
};

// Pegar domadores que estão ativados naquele mapa
Map.prototype.getActiveTamers = function (map_id, callback) {
    const 
        map = MapData[map_id],
        fns = {};



    console.log({ map });

    for (let i = 0; i < map.tamers.length; i ++) {
        let tamer = map.tamers[i];
        fns[tamer.id] = next => {
            this.mysqlQuery(
                "SELECT `value` FROM `flags` WHERE `type` = 't' AND `flag_id` = ? AND `uid` = ?",
                [tamer.id, this.auth.uid],
                (err, results) => {
                    if (!results.length) {
                        next(err, {});
                        return;
                    };

                    next(err, results[0]);
                }
            );
        };
    };

    async.parallel(fns, callback);
};

// Teletransportar pro healing place
Map.prototype.teleportToHealingPlace = function (callback, uid) {
    // get map id

    const pdata = new PlayerData();

    uid = uid || this.auth.uid;

    async.waterfall([
        next => pdata.get(uid, next),
        (data, next) => {
            
            const
                map = MapData[data.map].healingplace,
                position = MapData[map].healingplaceposition;

            pdata.set(uid, {
                pos_x: position.x,
                pos_y: position.y,
                pos_facing: position.facing,
                map
            }, next);
        }
    ], callback);
};

/*
    Erros:
        changeMap:
            1 - flag especificada pelo client não existe.
            2 - não tem flag necessária.
*/

module.exports = Map;