const 
    async = require("async"),
    _ = require("underscore");

const Resources = {
    Dex: require("./../database/dex.json"),
    Learnset: require("./../database/learnset.json")
};

const ERROR = {
    IS_NOT_PLAYER: 1,
    NOT_FOUND: 2
};

const EVENTS = require("./../database/socket_events.json");

const helper = {};

helper.boolToInt = function (bool) {
    switch (bool) {
        case true:
        case 1:
        case "true":
        case "1":
        {
            return 1;
        };

        case false:
        case 0:
        case "false":
        case "0":
        {
            return 0;
        };
    };
};

helper.isFloat = n => Number(n) === n && n % 1 !== 0;

const Base = require("./base.js");

const Notify = function (main, socket, auth, db, scServer, dataMasterEvents) {
    Base.call(this, main, socket, auth, db, scServer, dataMasterEvents);
};


Notify.prototype = Object.create(Base.prototype);

// Pegar notificações (de forma crua)
Notify.prototype.getRaw = function (input = {}, callback) {
    input = input || {};
    input.page = input.page || 1;

    // limit = número de notificações que vai exibir por página
    const 
        limit = 4,
        starting_limit = (input.page - 1) * limit;

    async.parallel({
        data: next => {
            this.mysqlQuery(
                "SELECT * FROM `notify` WHERE `enabled` = '1' AND uid = ? ORDER BY `id` DESC LIMIT " + this.escapeSQL(starting_limit) + ", " + this.escapeSQL(limit),
                [this.auth.uid], 
                (err, results) => next(err, results)
            );
        },
        count: next => {
            this.mysqlQuery(
                "SELECT COUNT(*) FROM `notify` WHERE `viewed` = '0' AND `uid` = ?",
                [this.auth.uid],
                (err, results) => next(err, results[0]["COUNT(*)"])
            );
        }
    }, callback);
};

// Pegar notificações (e passar via sockets)
Notify.prototype.getNotifications = function (input = {}) {
    const { page } = input;

    this.getRaw({
        page
    }, (err, data) => this.socket.emit(EVENTS.SEND_NOTIFICATIONS_DATA, data));
};

// Pegar notificação de move
Notify.prototype.getMoveNotification = function (input = {}) {

    let data;

    const { id } = input;

    async.waterfall([
        // pega dados da notificação
        next => {
            this.mysqlQuery(
                "SELECT * FROM `notify_learn_move` WHERE `uid` = ? AND `id` = ? AND `enabled` = '1'",
                [this.auth.uid, id],
                (err, results) => next(err, results)
            );
        },
        (results, next) => {
            // se não for notificação do user, retorna
            if (!results.length) {
                return;
            };

            data = results[0];

            // pega dados do monstro que vai mudar o move
            instantiateGameCoreKlass(Species, this.main)
                .get(data.monster_id, next);
        },
        result => {
            // atribui valores necessários para o client exibir
            data.monsterData = {
                monsterpedia_id: result.monsterpedia_id,
                moves: [result.move_0, result.move_1, result.move_2, result.move_3]
            };

            // envia ao client
            this.socket.emit(EVENTS.MOVE_NOTIFICATION_DATA, data);
        }
    ]);
};

// Pegar notificação de evolução
Notify.prototype.getEvolveNotification = function (input = {}) {

    let data;

    const { id } = input;

    async.waterfall([
        // pega dados da notificação
        next => {
            this.mysqlQuery(
                "SELECT * FROM `notify_evolve` WHERE `uid` = ? AND `id` = ? AND `enabled` = '1'",
                [this.auth.uid, id],
                (err, results) => next(err, results)
            );
        },
        (results, next) => {
            // se não for notificação do user, retorna
            if (!results.length) {
                return;
            };

            data = results[0];

            // pega dados do monstro que vai mudar o move
            instantiateGameCoreKlass(Species, this.main)
                .get(data.monster_id, next);
        },
        result => {
            // atribui valores necessários para o client exibir
            data.monsterData = {
                monsterpedia_id: result.monsterpedia_id
            };

            // envia ao client
            this.socket.emit(EVENTS.EVOLVE_NOTIFICATION_DATA, data);
        }
    ]);
};

// Pegar notificação de negociação
Notify.prototype.getMarketPlaceNotification = function (input = {}) {
    const { id } = input;

    async.waterfall([
        // pega dados da notificação
        next => {
            this.mysqlQuery(
                "SELECT * FROM `notify_marketplace` WHERE `uid` = ? AND `id` = ? AND `enabled` = '1'",
                [this.auth.uid, id],
                (err, results) => next(err, results)
            );
        },
        (results, next) => {

            // se não for notificação do user, retorna
            if (!results.length)
                return;

            this.socket.emit(EVENTS.MARKETPLACE_NOTIFICATION_DATA, results[0]);
        }
    ]);
};

Notify.prototype.send = function () {};

// Inserir que monstro do player pode aprender um move novo
Notify.prototype.insertLearnMove = function (monster, moves, callback) {

    // {level, monsterpedia_id, id}

    const fns = moves.map(move => cb => {

        let trade = false,
            used = 0,
            position;

        // verificando se tem espaço vazio nas moves 
        for (let i = 0; i < 4; i ++) {
            if (monster.moves[i] <= 0) {
                used = 1;
                trade = true;
                position = i;
                monster.moves[i] = move;
                break;
            };
        };

        async.waterfall([
            // se tiver algum espaço vazio, aprender move automaticamente
            next => {
                if (trade) {
                    instantiateGameCoreKlass(Species, this.main)
                        .learnMove(monster.id, move, position, next);
                } else {
                    next(null, true);
                };
            },
            // inserir notify que deve aprender move
            (nothing, next) => {

                this.mysqlQuery("INSERT INTO `notify_learn_move` SET ?", {
                    id: null,
                    uid: this.auth.uid,
                    enabled: 1,
                    used,
                    move_id: move,
                    monster_id: monster.id
                }, (err, data) => next(err, data));
            },
            // inserir notificação
            (results, next) => {
                this.mysqlQuery("INSERT INTO `notify` SET ?", {
                    id: null,
                    uid: this.auth.uid,
                    enabled: 1,
                    viewed: 0,
                    type: 1,
                    n_id: results.insertId
                }, next);
            }
        ], cb);
    });

    // executa em paralelo
    async.parallel(fns, callback);
};

// Inserir que o monstro do player pode evoluir
Notify.prototype.insertEvolveMonster = function (monster, evolve_id, callback) {
    // {level, monsterpedia_id, id}

    async.waterfall([
        // inserir notify que deve aprender move
        next => {
            this.mysqlQuery("INSERT INTO `notify_evolve` SET ?", {
                id: null,
                uid: this.auth.uid,
                enabled: 1,
                used: 0,
                evolve_to: evolve_id,
                monster_id: monster.id
            }, (err, data) => next(err, data));
        },
        // inserir notificação
        (results, next) => {
            //results.insertId

            this.mysqlQuery("INSERT INTO `notify` SET ?", {
                id: null,
                uid: this.auth.uid,
                enabled: 1,
                viewed: 0,
                type: 2,
                n_id: results.insertId
            }, next);
        }
    ], callback);
};

// Inserir que o monstro/item do player foi negociado
Notify.prototype.insertPurchase = function (sellerId, productType, productId, callback) {
    
    let action;

    async.waterfall([
        // inserir notify que deve aprender move
        next => {
            console.log("FOIOOOOOOOOOOOOOOOI111");
            this.mysqlQuery("INSERT INTO `notify_marketplace` SET ?", {
                id: null,
                uid: sellerId,
                enabled: 1,
                item_or_monster: productType,
                solded: productId
            }, (err, data) => next(err, data));
        },
        // inserir notificação
        (results, next) => {
            //results.insertId
            console.log("FOIOOOOOOOOOOOOOOOI222");
            action = results.insertId;
            this.mysqlQuery("INSERT INTO `notify` SET ?", {
                id: null,
                uid: sellerId,
                enabled: 1,
                viewed: 0,
                type: 3,
                n_id: action
            }, next);
        }
    ], (err, data, a1, a2, a3) => {
        console.log("KEKEKE", err, data, a1, a2, a3);
        callback(err, {
            id: {
                notification: data.insertId,
                action
            }
        });
    });
};

// Desabilitar notificação
Notify.prototype.disable = function (id, callback) {
    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT * FROM `notify` WHERE `id` = ? AND `uid` = ?",
                [id, this.auth.uid],
                (err, data) => next(err, data)
            );
        },
        (results, next) => {

            // se não for do player sai com erro
            if (!results.length) {
                next(ERROR.IS_NOT_PLAYER);
                return;
            };

            async.parallel({
                // desabilita notificação
                disableNotify: next => {
                    this.mysqlQuery(
                        "UPDATE `notify` SET `enabled` = '0' WHERE `id` = ?",
                        [id],
                        next
                    );
                },
                // desabilita ação da notificação
                disableActionNotify: next => {
                    this.disableAction(results[0], next);
                }
            }, next);
        }
    ], callback);
};

// Desabilitar ação da notificação
Notify.prototype.disableAction = function (data, callback) {
    switch (+data.type) {
        case 0: {
            break;
        };
        // move learn
        case 1: {
            this.mysqlQuery(
                "UPDATE `notify_learn_move` SET `enabled` = '0' WHERE `id` = ?",
                [data.n_id],
                callback
            );
            break;
        };
        case 2: {
            break;
        };
    };
};

// Setar que ação da notificação já está utilizada
Notify.prototype.setAlreadyUsedAction = function (data, callback) {
    switch (+data.type) {
        case 0: {
            break;
        };
        // move learn
        case 1: {
            this.mysqlQuery(
                "UPDATE `notify_learn_move` SET `used` = '1' WHERE `id` = ?",
                [data.n_id],
                callback
            );
            break;
        };

        // evolve
        case 2: {
            this.mysqlQuery(
                "UPDATE `notify_evolve` SET `used` = '1' WHERE `id` = ?",
                [data.n_id],
                callback
            );
            break;
        };
    };
};

// Setar que já viu a notificação
Notify.prototype.setSeen = function (input = {}) {

    const { id } = input;

    if (!id)
        return console.log("TNC POW, kero entrosar COMA GALREA AKI");

    async.waterfall([
        next => {

            // vê se notify é do player mesmo
            this.mysqlQuery(
                "SELECT * FROM `notify` WHERE `id` = ? AND `uid` = ?",
                [id, this.auth.uid],
                (err, data) => next(err, data)
            );
        },
        (results, next) => {

            // se não for do player sai com erro
            if (!results.length) {
                next(ERROR.IS_NOT_PLAYER);
                return;
            };

            // seta que já viu notificação
            this.mysqlQuery(
                "UPDATE `notify` SET `viewed` = '1' WHERE `id` = ?",
                [id]
            );
        }
    ], (err, data) => {
        if (err) {
            console.log("I DEU RUIM, error id:", err);
            return;
        }
    });
};

// Requisitar aprender move
Notify.prototype.requestLearnMove = function (input = {}) {
    // pegar dados da ação de notificação -> {monster_id, move_id}
    // desabilitar ação da notificação

    const { n_id, position } = input;

    // if (isNaN(position) || position < 0 || position > 3 || helper.isFloat(position))
    //     return console.log("VAI TOMA NO CU POW");

    if ( !this.filterInput.position.includes(position) )
        return console.log("TNC FDP");

    async.waterfall([
        // pegar dados do move e monstro
        next => {
            this.mysqlQuery(
                "SELECT * FROM `notify_learn_move` WHERE `id` = ? AND `enabled` = '1' AND `used` = '0'",
                [n_id],
                (err, data) => next(err, data)
            );
        },
        (results, next) => {

            let data = results[0];

            // se não achou nada
            if (!results.length) {
                next(ERROR.NOT_FOUND);
                return;
            };

            // SE NÃO FOR A AÇÃO DO PLAYER
            if (data.uid != this.auth.uid) {
                next(ERROR.IS_NOT_PLAYER);
                return;
            };

            // ensinar move
            instantiateGameCoreKlass(Species, this.main)
                .learnMove(data.monster_id, data.move_id, position, next);
        },
        // desabilitar ação da notificação de aprender move
        (nothing, next) => {
            this.setAlreadyUsedAction({
                type: 1,
                n_id 
            }, next);
        }
    ], (err, data) => {

        if (err) {
            console.log("Erro (requestLearnMove) - ID: " + err);
            return;
        };

        console.log("FOI PORRA FDP");

        // atualizar monstros
        this.socket.emit(EVENTS.UPDATE_MONSTERS_ITEMS, {
            monsters: true
        });

        // enviar que ensinou move
        this.socket.emit(EVENTS.SEND_LEARN_MOVE_BY_NOTIFICATION);
    });
};

// Requisitar não aprender move
Notify.prototype.requestDontLearnMove = function (input = {}) {
    const { n_id } = input;

    async.waterfall([
        // pegar dados do move e monstro
        next => {
            this.mysqlQuery(
                "SELECT * FROM `notify_learn_move` WHERE `id` = ? AND `enabled` = '1' AND `used` = '0'",
                [n_id],
                (err, data) => next(err, data)
            );
        },
        (results, next) => {

            let data = results[0];

            // se não achou nada
            if (!results.length) {
                next(ERROR.NOT_FOUND);
                return;
            };

            // SE NÃO FOR A AÇÃO DO PLAYER
            if (data.uid != this.auth.uid) {
                next(ERROR.IS_NOT_PLAYER);
                return;
            };

            // desabilitar ação da notificação de aprender move
            this.setAlreadyUsedAction({
                type: 1,
                n_id 
            }, next);
        },
        

    ], (err, data) => {

        if (err) {
            console.log("Erro (requestDontLearnMove) - ID: " + err);
            return;
        };

        console.log("FOI PORRA FDP (requestDontLearnMove)");

        // enviar que não ensinou move
        this.socket.emit(EVENTS.SEND_DONT_LEARN_MOVE_BY_NOTIFICATION);
    });
};

// Requisitar evoluir monstro
Notify.prototype.requestEvolveMonster = function (input = {}) {

    const { n_id } = input;

    async.waterfall([
        // pegar dados da evolução do monstro
        next => {
            this.mysqlQuery(
                "SELECT * FROM `notify_evolve` WHERE `id` = ? AND `enabled` = '1' AND `used` = '0'",
                [n_id],
                (err, data) => next(err, data)
            );
        },
        // autenticar e evoluir monstro
        (results, next) => {
            let data = results[0];

            // se não achou nada
            if (!results.length) {
                next(ERROR.NOT_FOUND);
                return;
            };

            // SE NÃO FOR A AÇÃO DO PLAYER
            if (data.uid != this.auth.uid) {
                next(ERROR.IS_NOT_PLAYER);
                return;
            };

            // evoluir monstro
            instantiateGameCoreKlass(Species, this.main)
                .evolve(data.monster_id, data.evolve_to, next);
        },
        (notthing, next) => {
            // setar que ação já foi usada
            this.setAlreadyUsedAction({
                type: 2,
                n_id 
            }, next);
        }
    ], (err, data) => {
        console.log(err, data, "Evoluiu porra");
        this.socket.emit(EVENTS.SEND_EVOLVE_BY_NOTIFICATION);
    });
};

// Filtrar inputs
Notify.prototype.filterInput = {
    position: [0, 1, 2, 3]
};

module.exports = Notify;

const Species = require("./species.js");
const { instantiateGameCoreKlass } = require("../utils/utils.js");