const 
    async = require("async"),
    _ = require("underscore");

const helper = {};
helper.isFloat = n => Number(n) === n && n % 1 !== 0;

const ERROR = {
    CANT_USE: 1,
    NOT_FOUND: 2
};

const EVENTS = require("./../database/socket_events.json");

const Base = require("./base.js");

const Bag = function (main, socket, auth, db, scServer, dataMasterEvents) {
    Base.call(this, main, socket, auth, db, scServer, dataMasterEvents);
};

Bag.prototype = Object.create(Base.prototype);

const Resources = {
    Items: require("./../database/items_effect.json")
};

// inserir item
Bag.prototype.insertItem = function (uid, item_id, amount, callback) {

    // se não tiver nenhum uid setado então seta do próprio player
    uid = uid || this.auth?.uid;

    async.waterfall([
        // pega a quantidade de itens do player
        next => {
            this.mysqlQuery(
                "SELECT `id`, `amount` FROM `items` WHERE `uid` = ? AND `item_id` = ?",
                [uid, item_id],
                (err, data) => next(err, data)
            );
        },
        (results, next) => {
            // se o player já tiver o item, apenas edita quantidade da linha já existente
            if (results.length > 0) {
                results = results[0];
                this.mysqlQuery(
                    "UPDATE `items` SET `amount` = ? WHERE `id` = ?",
                    [(results.amount + amount), results.id],
                    next
                );
            } else {
                // se não, insere item linha na database
                this.mysqlQuery("INSERT INTO `items` SET ?", {
                    id: null,
                    uid,
                    item_id,
                    amount
                }, next);
            };

        },
        () => callback()
    ]);
};

// pegar todos os itens do player
Bag.prototype.getItems = function (callback) {
    this.mysqlQuery(
        "SELECT `item_id`, `amount` FROM `items` WHERE `uid` = ?",
        [this.auth.uid],
        (err, results) => callback(err, results)
    );
};

// usar item especifico
Bag.prototype.useItem = function (input) {

    input = input || {};

    // verificando se item e monstro existe
    if ( !(input.item in Resources.Items) )
        return console.log(1);

    if (!input.monster)
        return console.log(2);

    const item = Resources.Items[input.item];

    // se for um pergaminho precisa de um tratamento especial
    if (item.type == "parchment") {
        // autentica posição caso seja pra ensinar move
        if ("position" in input) {
            if (isNaN(input.position) || input.position < 0 || input.position > 3 || helper.isFloat(input.position))
                return;
        } else {
            return;
        };
    };

    async.waterfall([
        // verifica se monstro é do player e se monstro existe
        next => {
            this.mysqlQuery(
                "SELECT `id` FROM `monsters` WHERE `uid` = ? AND `id` = ?",
                [this.auth.uid, input.monster],
                (err, data) => next(err, data)
            );
        },
        // desconta (usa) item na database
        (results, next) => {

            if (!results.length) {
                next(ERROR.NOT_FOUND);
                return;
            };

            this.discontItem(input.item, can => {
                // se item foi descontado, continua a função
                // se item não existe sai da função and call gm, there's a possible xiter
                if (can) {
                    next(null, true);
                } else {
                    console.log("Não pode usar, pois não tem o item, xiter!!!!1011");
                    next(ERROR.CANT_USE);
                };
            });
        },
        (nothing, next) => {
            // usa efeito do item
            this.item[item.type].bind(this)(
                input,
                next
            );
        }
    ], (err, data) => {

        if (err) {
            console.log("Não foi! Bag.useItem", err);
            return;
        };
        // item utilizado
        console.log("Foi! Bag.useItem");
        this.socket.emit(EVENTS.ITEM_ACTION);
    });
};

// equipar item
Bag.prototype.equipItem = function () {};

// descontar (usar) item
Bag.prototype.discontItem = function (item_id, callback) {
    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `id`, `amount` FROM `items` WHERE `uid` = ? AND `item_id` = ?",
                [this.auth.uid, item_id],
                (err, data) => next(err, data)
            );
        },
        (results, next) => {

            if (!results.length)
                return callback(false);

            results = results[0];

            if (results.amount == 1) {
                this.mysqlQuery(
                    "DELETE FROM `items` WHERE `id` = ?",
                    [results.id],
                    next
                );
            } else {
                this.mysqlQuery(
                    "UPDATE `items` SET `amount` = ? WHERE `id` = ?",
                    [(--results.amount), results.id],
                    next
                );
            };

        },
        () => callback(true)
    ]);
};

// checar se tem o item
Bag.prototype.checkIfHaveItem = function (item_id, callback) {
    this.mysqlQuery(
        "SELECT `id` FROM `items` WHERE item_id = ? AND `uid` = ? AND `amount` > 0",
        [item_id, this.auth.uid],
        (err, results) => callback(err, results.length > 0)
    );
};

// aplicar efeito do item
Bag.prototype.item = {
    magic_seal: function () {},
    // recuperar HP
    health_potion: function (data, callback) {
        instantiateGameCoreKlass(Species, this.main)
            .addHp(
                Resources.Items[data.item].effect.heal,
                data.monster,
                callback
            );
    },
    // recuperar mana
    mana_potion: function (data, callback) {
        instantiateGameCoreKlass(Species, this.main)
            .addMp(
                Resources.Items[data.item].effect.heal,
                data.monster,
                callback
            );
    },
    // vitamina (aumentar stats)
    vitamin: function (data, callback) {

        // PEGA dados do item e da stat
        const
            item = Resources.Items[data.item],
            stat = "vita_" + item.effect.increase;

        async.waterfall([
            next => {
                // pega stat dados do monstro
                this.mysqlQuery(
                    "SELECT `" + this.escapeSQL(stat) + "` FROM `monsters` WHERE `id` = ?",
                    [data.monster],
                    (err, data) => next(err, data)
                );
            },
            (results, next) => {
                // pega valor da stat de vita
                const vita = results[0];

                // se já tiver acima de 9 no stat da vita não deixa
                if (vita[stat] > 9) {
                    console.log("Não pode usar");
                    this.insertItem(null, data.item, 1, next);
                } else {
                // se não tiver só acrescenta
                    console.log("Pode usar");
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `" + this.escapeSQL(stat) + "` = `" + this.escapeSQL(stat) + "` + '1' WHERE `id` = ?",
                        [data.monster],
                        (err, data) => next(err, data)
                    );
                };
            }
        ], callback);
    },
    // usar pergaminho (aprender move)
    parchment: function (data, callback) {

        instantiateGameCoreKlass(Species, this.main)
            .learnMove(
                data.monster, 
                Resources.Items[data.item].effect.learn_move, 
                data.position, 
                callback
            );
    }
};

module.exports = Bag;

const Species = require("./species.js");

const { instantiateGameCoreKlass } = require("../utils/utils.js");