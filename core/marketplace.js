const 
    async = require("async"),
    _ = require("underscore");

const Resources = {
    Dex: require("./../database/dex.json"),
    Items: require("./../database/items.json")
};

const Bag = require("./bag.js");

const Base = require("./base.js");

const MarketPlace = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
};

MarketPlace.prototype = Object.create(Base.prototype);

// Pegar dados dos itens/monstros que estão a venda
MarketPlace.prototype.getMerchandises = function (input, callback) {

    input = input || {};

    input.page = input.page || 1;
    input.type = input.type || 0;

    // limit = número de produtos que vai exibir por página
    const 
        limit = 10,
        starting_limit = (input.page - 1) * limit;

    async.parallel({
        // pega número total de produtos
        total: next => {
            this.mysqlQuery(
                "SELECT `id` FROM `marketplace` WHERE `item_or_monster` = ? AND `enabled` = '1' AND `uid` <> ?",
                [input.type, this.auth.uid],
                (err, data) => next(err, data)
            );
        },
        // pega produtos da página
        products: next => {
            this.mysqlQuery(
                "SELECT * FROM `marketplace` WHERE `item_or_monster` = ?  AND `enabled` = '1' AND `uid` <> ? ORDER BY `id` DESC LIMIT " + this.escapeSQL(starting_limit) + ", " + this.escapeSQL(limit),
                [input.type, this.auth.uid],
                (err, data) => next(err, data)
            );
        }
    }, (err, data) => {
        // envia total e produtos da página
        callback({
            total: Math.ceil(data.total.length / limit),
            products: data.products
        });
    });
};

// Organizar o que exigiu para vender/trocar item
MarketPlace.prototype.sortRequested = function (product) {
    let sort;

    switch (product.negotiation_type) {

        // troca
        case 0: {
            switch (product.requested_item_or_monster) {
                // item
                case 1: {
                    sort = {
                        value: Resources.Items[product.requested_id].name,
                        url: "/assets/img/items/" + product.requested_id + ".png"
                    };
                    break;
                };
                // monstro
                case 2: {
                    sort = {
                        value: Resources.Dex[product.requested_id].specie,
                        url: "/assets/img/monsters/" + product.requested_id + ".png"
                    };
                    break;
                };
            };

            break;
        };

        // venda
        case 1: {

            sort = {
                value: product.requested_amount,
                url: "/assets/img/items/" + (product.requested_coin == 1 ? "silver" : "gold") + ".png"
            };
            // se for maior de mil converte pra k, ex.: 1200 -> 1,2k
            if (sort.value >= 1000 && sort.value < 1000000) {
                sort.value /= 1000;
                sort.value += "k";

                sort.value = sort.value.replace(".", ",");
            };
            // se for maior de um milhão converte pra kk, ex.: 4250000 -> 4,25kk
            if (sort.value >= 1000000) {
                sort.value /= 1000000;
                sort.value += "kk";

                sort.value = sort.value.replace(".", ",");                
            };
            break;
        };
    };

    return sort;
};

// Comprar item ou monstro que está sendo ofertado
MarketPlace.prototype.buyItemMonster = function (input) {};

// Trocar item por item/monstro que está sendo ofertado
MarketPlace.prototype.tradeItem = function () {};

// Fazer uma oferta do seu monstro pelo item/monstro que está sendo ofertado
MarketPlace.prototype.requestTradeMonster = function () {};

// Por item/monstro pra vender (postar na lista de itens/monstros)
MarketPlace.prototype.sellItemMonster = function (uid, id, type, coin, callback) {
    switch (type) {
        // item
        case 0: {
            this.mysqlQuery(
                "INSERT INTO `marketplace` SET ?", {
                    enabled: 1,
                    id: null,
                    uid,
                    if_is_monster_monsterpedia_id: 0,
                    sale_id: id,
                    negotiation_type: 1,
                    item_or_monster: 0,
                    requested_item_or_monster: 0,
                    requested_id: 0,
                    requested_coin: coin.type,
                    requested_amount: coin.value
                },
                callback
            );
            break;
        };
        // monstro
        case 1: {
            async.waterfall([
                next => {
                    this.mysqlQuery(
                        "SELECT `monsterpedia_id` FROM `monsters` WHERE `id` = ? AND `uid` = ?",
                        [id, uid],
                        next
                    );
                },
                (results, fields, next) => {
                    //console.log("pqpp", results, fields, next);
                    this.mysqlQuery(
                        "INSERT INTO `marketplace` SET ?", {
                            enabled: 1,
                            id: null,
                            uid,
                            if_is_monster_monsterpedia_id: results[0].monsterpedia_id,
                            sale_id: id,
                            negotiation_type: 1,
                            item_or_monster: 1,
                            requested_item_or_monster: 0,
                            requested_id: 0,
                            requested_coin: coin.type,
                            requested_amount: coin.value
                        },
                        callback
                    );
                }
            ])
            break;
        };
    }
};

// Cancelar monstro a venda/troca
MarketPlace.prototype.cancelMonsterSellTrade = function (uid, negotiation_id, callback) {
    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `sale_id` FROM `marketplace` WHERE `uid` = ? AND `id` = ?",
                [uid, negotiation_id],
                next 
            );
        },
        (results, fields, next) => {

            if (!results.length) {
                callback(null, {dontExists: true});
                return;
            };

            results = results[0];

            async.parallel({
                disableNegotiation: next => {
                    this.mysqlQuery(
                        "UPDATE `marketplace` SET `enabled` = '0' WHERE `id` = ? AND `uid` = ?",
                        [negotiation_id, uid],
                        next
                    )
                },
                enableUnfreezeMonster: next => {
                    this.enableUnfreezeMonster(results.sale_id, next);
                }
            }, (err, data) => {
                console.log(err, data);
                callback(err, data);
            });
        }
    ])
};

// Cancelar item a venda/troca
MarketPlace.prototype.cancelItemSellTrade = function (uid, negotiation_id, callback) {
    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `sale_id` FROM `marketplace` WHERE `uid` = ? AND `id` = ?",
                [uid, negotiation_id],
                next
            );
        },
        (results, fields, next) => {

            if (!results.length) {
                callback(null, {dontExists: true});
                return;
            };

            results = results[0];

            async.parallel({
                disableNegotiation: next => {
                    this.mysqlQuery(
                        "UPDATE `marketplace` SET `enabled` = '0' WHERE `id` = ? AND `uid` = ?",
                        [negotiation_id, uid],
                        next
                    )
                },
                unfreezeItem: next => {
                    this.unfreezeItem(uid, results.sale_id, next);
                },
                reinsertItem: next => {
                    new Bag(null, {uid}, {mysql: this.db.mysql})
                        .insertItem(uid, results.sale_id, 1, next);
                }
            }, (err, data) => {
                console.log(err, data);
                callback(err, data);
            });
        }
    ]);
};

// Transferir monstro
MarketPlace.prototype.transferMonster = function (monster_id, uid_transfer, uid_seller, callback) {
    async.parallel([
        next => {
            this.mysqlQuery(
                "UPDATE `monsters` SET `uid` = ? WHERE `id` = ?",
                [uid_transfer, monster_id],
                next
            );
        },
        next => {
            this.mysqlQuery(
                "DELETE FROM `monsters_in_box` WHERE `uid` = ? AND `monster_id` = ?",
                [uid_seller, monster_id],
                next
            );
        }
    ], callback);

};

// Congelar Item/Monstro
MarketPlace.prototype.freezeItemMonster = function (uid, id, type, callback) {
    switch (type) {
        // item
        case 0: {

            const bag = new Bag(null, {uid}, this.db);

            async.parallel({
                remove: next => {
                    bag.discontItem(id, data => {
                        next(null, data);
                    });
                },
                freeze: next => {
                    this.mysqlQuery(
                        "INSERT INTO `freeze_items_monsters` SET ?", {
                            id: null,
                            uid,
                            sale_id: id,
                            item_or_monster: 0
                        },
                        next
                    );
                }
            }, (err, data) => {
                callback(err, 1);
            });


            break;
        };
        // monstro
        case 1: {
            async.parallel({
                disable: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `enabled` = '0' WHERE `uid` = ? AND `id` = ?",
                        [uid, id],
                        next
                    );
                },
                freeze: next => {
                    this.mysqlQuery(
                        "INSERT INTO `freeze_items_monsters` SET ?", {
                            id: null,
                            uid,
                            sale_id: id,
                            item_or_monster: 1
                        },
                        next
                    );
                }
            }, 
            (err, data) => {
                //console.log(err, data);

                callback(err, 1);
            });
            break;
        };

    };
};

// Descongelar Item
MarketPlace.prototype.unfreezeItem = function (uid, item_id, callback) {
    this.mysqlQuery(
        "DELETE FROM `freeze_items_monsters` WHERE `uid` = ? AND `sale_id` = ?",
        [uid, item_id],
        callback
    );
};

// Checar se item/monstro pode ser vendido
MarketPlace.prototype.checkItemMonsterAuthenticity = function (uid, id, type, callback) {
    async.parallel({
        isNotFreeze: next => {
            this.mysqlQuery(
                "SELECT `id` FROM `freeze_items_monsters` WHERE `uid` = ? AND `sale_id` = ? AND `item_or_monster` = ?",
                [uid, id, type],
                (err, results) => next(err, results)
            );
        },
        isFromPlayer: next => {
            switch (type) {
                case 1: { // monstro
                    this.mysqlQuery(
                        "SELECT `id` FROM `monsters` WHERE `uid` = ? AND `id` = ? AND `enabled` = '1' AND `in_pocket` = '0' AND `can_trade` = '1'",
                        [uid, id],
                        (err, results) => next(err, results)
                    );
                    break;
                };

                case 0: { // item
                    this.mysqlQuery(
                        "SELECT `amount` FROM `items` WHERE `uid` = ? AND `item_id` = ? AND `amount` >= 0",
                        [uid, id],
                        (err, results) => next (err, results)
                    );
                    break;
                };
            }
        }
    }, (err, data) => {
        if (err) {
            new ErrorHandler(err, "marketplace");
            return;
        };
        console.log(err, data);

        callback(err, !data.isNotFreeze.length && data.isFromPlayer.length > 0);
    });
};

// Checar autenticidade da compra
MarketPlace.prototype.checkPurchaseAuthenticity = function (uid, id, callback) {
    async.parallel({
        ordered: next => {
            this.mysqlQuery(
                "SELECT `enabled`, `id`, `uid`, `sale_id`, `if_is_monster_monsterpedia_id`, `requested_coin`, `requested_amount` FROM `marketplace` WHERE `id` = ?", 
                [id],
                next
            );
        },
        amount: next => {
            this.mysqlQuery(
                "SELECT `silver`, `gold` FROM `in_game_data` WHERE `uid` = ?",
                [uid],
                next
            );
        }
    }, (err, data) => {
        if (err) {
            console.log(err);
            //new ErrorHandler(err, "marketplace");
            return;
        };

        //console.log(99, data.ordered[0][0]);

        switch (data.ordered[0][0].requested_coin) {
            // silver
            case 1: {
                callback(err, {
                    // se silver é maior ou igual
                    enabled: data.ordered[0][0].enabled,
                    id: data.ordered[0][0].id,
                    canBuy: data.amount[0][0].silver >= data.ordered[0][0].requested_amount,
                    uid: data.ordered[0][0].uid,
                    isUidEquals: uid == data.ordered[0][0].uid,
                    amount: data.ordered[0][0].requested_amount,
                    sale_id: data.ordered[0][0].sale_id,
                    if_is_monster_monsterpedia_id: data.ordered[0][0].if_is_monster_monsterpedia_id,
                    type: 1

                });
                break;
            };
            // gold
            case 2: {
                callback(err, {
                    // se gold é maior ou igual
                    enabled: data.ordered[0][0].enabled,
                    id: data.ordered[0][0].id,
                    canBuy: data.amount[0][0].gold >= data.ordered[0][0].requested_amount,
                    uid: data.ordered[0][0].uid,
                    isUidEquals: uid == data.ordered[0][0].uid,
                    amount: data.ordered[0][0].requested_amount,
                    sale_id: data.ordered[0][0].sale_id,
                    if_is_monster_monsterpedia_id: data.ordered[0][0].if_is_monster_monsterpedia_id,
                    type: 2
                });
                break;
            };

        }
    });
};

// Descontar moeda do comprador
MarketPlace.prototype.discontCoin = function (uid, type, amount, callback) {
    switch (type) {
        // silver
        case 1: {
            this.mysqlQuery(
                "UPDATE `in_game_data` SET `silver` = `silver` - '" + this.escapeSQL(amount) + "' WHERE `uid` = ?",
                [uid],
                callback
            );
            break;
        };
        // gold
        case 2: {
            this.mysqlQuery(
                "UPDATE `in_game_data` SET `gold` = `gold` - '" + this.escapeSQL(amount) + "' WHERE `uid` = '" + uid + "'",
                [uid],
                callback
            );
            break;
        }
    }
};

// Adicionar moeda ao vendedor
MarketPlace.prototype.addCoin = function (uid, type, amount, callback) {
    switch (type) {
        // silver
        case 1: {
            this.mysqlQuery(
                "UPDATE `in_game_data` SET `silver` = `silver` + '" + this.escapeSQL(amount) + "' WHERE `uid` = ?",
                [uid],
                callback
            );
            break;
        };
        // gold
        case 2: {
            this.mysqlQuery(
                "UPDATE `in_game_data` SET `gold` = `gold` + '" + this.escapeSQL(amount) + "' WHERE `uid` = ?",
                [uid],
                callback
            );
            break;
        };
    }
};

// Desfreezar monstro
MarketPlace.prototype.enableUnfreezeMonster = function (id, callback) {

    async.parallel([
        next => {
            this.mysqlQuery(
                "DELETE FROM `freeze_items_monsters` WHERE `sale_id` = ?",
                [id],
                next
            );
        },
        next => {
            this.mysqlQuery(
                "UPDATE `monsters` SET `enabled` = '1' WHERE `id` = ?",
                [id],
                next
            );
        }
    ], callback);
};

// Terminar/desabilitar venda
MarketPlace.prototype.disableSale = function (id, callback) {
    this.mysqlQuery(
        "UPDATE `marketplace` SET `enabled` = '0' WHERE `id` = ?",
        [id],
        callback
    );
}; 

// Checar se o mesmo tipo de item já está sendo negociado
MarketPlace.prototype.checkIfItemIsInNegotiation = function (uid, id, callback) {
    this.mysqlQuery(
            "SELECT * FROM `freeze_items_monsters` WHERE `sale_id` = ? AND `item_or_monster` = '0' AND `uid` = ?",
            [id, uid],
            (err, results) => {
                callback(err, results.length > 0);
            }
        );
};

// Enviar notificação pro vendedor que o item/monstro foi comprado/trocado
MarketPlace.prototype.sendSaleNotification = function (sellerId, productType, productId) {

    console.log({sellerId, productType, productId});

    async.waterfall([
        next => {
            new Notify(null, this.auth, this.db)
                .insertPurchase(sellerId, productType, productId, next);
        },
        (data, next) => {
            this.scServer.exchange.publish("u-" + sellerId, {
                enabled: 1,
                id: data.id.notification,
                n_id: data.id.action,
                type: 3,
                uid: sellerId,
                viewed: 1,
                action: 2
            });
        }
    ]);
};


module.exports = MarketPlace;

const Notify = require("./notify.js");