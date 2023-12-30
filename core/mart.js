const 
    async = require("async"),
    _ = require("underscore");

const EVENTS = require("./../database/socket_events.json");

const Base = require("./base.js");

const Mart = function (main, socket, auth, db, scServer, dataMasterEvents) {
    Base.call(this, main, socket, auth, db, scServer, dataMasterEvents);
};


Mart.prototype = Object.create(Base.prototype);

const Resources = {
    items_market: require("../database/items_market.json") 
};

Mart.prototype.buy = function (input) {

    //input = {item_id, amount}

    const { item_id, amount } = input;

    const 
        bag = instantiateGameCoreKlass(Bag, this),
        item = Resources.items_market[item_id];

    console.log("OIIII");

    async.waterfall([
        // pegar quantidade de silvers e gold
        next => {
            console.log("OIIII2");
            this.mysqlQuery(
                "SELECT `silver`, `gold` FROM `in_game_data` WHERE `uid` = ?",
                [this.auth.uid],
                (err, results) => next(err, results[0])
            )
        },
        // autenticando se tem silvers/golds o suficiente para efetuar a compra
        (results, next) => {
            console.log("OIIII3");
            switch (item.price.type) {
                // silver
                case 1: {
                    if (results.silver < item.price.amount * amount) {
                        this.socket.emit(EVENTS.BUY_RESPONSE, {
                            success: false
                        });
                        console.log("Não tem silvers suficiente.");
                        return;
                    };
                    break;
                };
                // gold
                case 2: {
                    if (results.gold < item.price.amount * amount) {
                        this.socket.emit(EVENTS.BUY_RESPONSE, {
                            success: false
                        });
                        console.log("Não tem golds suficiente.");
                        return;
                    };
                    break;
                };
            };

            next(null, true);
        },
        // descontar moeda, inserir item e enviar ao client para atualizar 
        (nothing, next) => {
            console.log("OIIII4", item.price.amount * amount);
            async.parallel({
                discountCoin: cb => this.discountCoin(item.price.type, item.price.amount * amount, cb),
                insertItem: cb => bag.insertItem(null, item_id, amount, () => {cb(null, true)})
            }, () => {
                this.socket.emit(EVENTS.UPDATE_MONSTERS_ITEMS, {
                    items: true
                });

                this.socket.emit(EVENTS.BUY_RESPONSE, {
                    success: true
                });
            });
        }
    ]);
};

Mart.prototype.discountCoin = function (type, amount, callback) {
    switch (type) {
        // silver
        case 1: {
            this.mysqlQuery(
                "UPDATE `in_game_data` SET `silver` = `silver` - '" + this.escapeSQL(amount) + "' WHERE `uid` = ?",
                [this.auth.uid],
                callback
            );
            break;
        };
        // gold
        case 2: {
            this.mysqlQuery(
                "UPDATE `in_game_data` SET `gold` = `gold` - '" + this.escapeSQL(amount) + "' WHERE `uid` = ?",
                [this.auth.uid],
                callback
            );
            break;
        };
    }
};

module.exports = Mart;

const Bag = require("./bag.js");

const { instantiateGameCoreKlass } = require("../utils/utils.js");