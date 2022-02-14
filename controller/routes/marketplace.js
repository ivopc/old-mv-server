const async = require("async");

const 
    MarketPlace = require("./../../core/marketplace.js"),
    Bag = require("./../../core/bag.js"),
    Box = require("./../../core/box.js");

const isFloat = n => Number(n) === n && n % 1 !== 0;

module.exports = function (req, res) {
    //res.json(req.body);
    console.log(req.body);

    if (req.body["token"] !== req.session["csrfToken"]) {
        res.json({error: 0});
        return;
    };

    const marketplace = new MarketPlace(null, null, {mysql: req.mysql}, req.scServer);

    switch (+req.body["type"]) {
        // por monstro a venda
        case 1: {

            // autenticar inputs
            const soldPrice = Number(req.body["price"]),
                cashType = Number(req.body["cashType"]);

            if (
                isNaN(soldPrice) ||
                soldPrice < 0 ||
                soldPrice >= 100000000 ||
                isFloat(soldPrice) ||
                isNaN(cashType) ||
                cashType == 0 ||
                (cashType < 1 || cashType > 2) ||
                isFloat(cashType)
            ) {
                res.json({error: 1});
                return;
            };


            async.waterfall([
                // ver se monstro está freezado e ver se ele é do jogador
                next => {
                    marketplace
                        .checkItemMonsterAuthenticity(
                            req.session["uid"],
                            req.body["id"],
                            1,
                            next
                        );
                },
                // ir pra próxima rotina ou sair com erro
                (data, next) => {
                    if (data) {
                        // se estiver autenticado
                        next(null, true);
                    } else {
                        // se não estiver autenticado
                        res.json({error: 2});
                        return;
                    };
                },
                (nothing, next) => {
                    // freezar monstro
                    marketplace
                        .freezeItemMonster(
                            req.session["uid"],
                            req.body["id"],
                            1,
                            () => next(null, true)
                        );
                },
                (nothing, next) => {
                    // botar pra vender
                    marketplace
                        .sellItemMonster(
                            req.session["uid"],
                            req.body["id"],
                            1,
                            {
                                type: cashType,
                                value: soldPrice
                            },
                            next
                        );
                }, 
                (results, fields, next) => {
                    //res.json(results);
                    res.json({
                        success: true,
                        id: results.insertId
                    })
                }
            ]);
            break;
        };

        // comprar monstro
        case 2: {

            let id, sale_id, box, seller_id, monster_id;

            async.waterfall([
                // checar se pode comprar
                next => {
                    //console.log(1);
                    marketplace
                        .checkPurchaseAuthenticity(
                            req.session["uid"],
                            req.body["id"],
                            next
                        );
                },
                // descontar moedas do comprador e add moedas ao vendedor
                (data, next) => {
                    //console.log(2, data, next);
                    // se a venda não estiver habilitada, sai
                    if (!data.enabled) {
                        res.json({error: 1});
                        return;
                    };
                    // se não tem moeda o suficiente pra comprar, sai
                    if (!data.canBuy) {
                        res.json({error: 2});
                        return;
                    };
                    // se estiver comprando dele mesmo
                    if (data.isUidEquals) {
                        res.json({error: 3});
                        return;
                    };
                    // id da venda
                    id = data.id;
                    // user id do vendedor
                    seller_id = data.uid;
                    // id do monstro que está vendendo
                    sale_id = data.sale_id;
                    // id do monstro (da monsterpedia)
                    monster_id = data.if_is_monster_monsterpedia_id;

                    console.log("to aki poja", data);

                    async.parallel({
                        discont: cb => {
                            marketplace
                                .discontCoin(
                                    req.session["uid"],
                                    data.type,
                                    data.amount,
                                    cb
                                );
                        },
                        add: cb => {
                            marketplace
                                .addCoin(
                                    data.uid,
                                    data.type,
                                    data.amount,
                                    cb
                                );
                        }
                    }, next);
                },
                (results, next) => {
                    //console.log(3, results, next);

                    async.auto({
                        enableUnfreeze: cb => {
                            marketplace
                                .enableUnfreezeMonster(
                                    sale_id,
                                    cb
                                );
                        },
                        transfer: cb => {
                            marketplace
                                .transferMonster(
                                    sale_id,
                                    req.session["uid"],
                                    seller_id,
                                    cb
                                );
                        },
                        disableSale: cb => {
                            marketplace
                                .disableSale(
                                    id,
                                    cb
                                );
                        },
                        putInMonsterBox: ["transfer", (data, cb) => {
                            box = new Box(null, {uid: req.session["uid"]}, {mysql: req.mysql}, null);
                            box.insert(sale_id, cb);
                        }]
                    }, next);
                },
                () => {
                    marketplace.sendSaleNotification(seller_id, 1, monster_id);
                    res.json({success: true});
                }
            ]);
            break;
        };

        // cancelar venda de monstro da loja
        case 3: {

            async.waterfall([
                next => {
                    marketplace
                        .cancelMonsterSellTrade(
                            req.session["uid"],
                            req.body["id"],
                            next
                        );
                },
                (data, next) => {
                    
                    console.log(data, next);
                    
                    if (data.dontExists) {
                        res.json({error: 1});
                        return;
                    };

                    res.json({success: true});
                }
            ]);

            break;
        };

        // por item a venda
        case 4: {
            // autenticar inputs
            const soldPrice = Number(req.body["price"]),
                cashType = Number(req.body["cashType"]);

            if (
                isNaN(soldPrice) ||
                soldPrice < 0 ||
                soldPrice >= 100000000 ||
                isFloat(soldPrice) ||
                isNaN(cashType) ||
                cashType == 0 ||
                (cashType < 1 || cashType > 2) ||
                isFloat(cashType)
            ) {
                res.json({error: 1});
                return;
            };


            async.waterfall([
                // ver se item está freezado e ver se ele é do jogador
                next => {
                    marketplace
                        .checkItemMonsterAuthenticity(
                            req.session["uid"],
                            req.body["id"],
                            0,
                            next
                        );
                },
                // ir pra próxima rotina ou sair com erro
                (data, next) => {
                    if (data) {
                        // se estiver autenticado
                        next(null, true);
                    } else {
                        // se não estiver autenticado
                        res.json({error: 2});
                        return;
                    };
                },
                (nothing, next) => {
                // checando se o item já estiver sendo negociado
                // há um problema que só possibilita cada item de cada tipo ser negociado
                // de uma única vez
                    marketplace
                        .checkIfItemIsInNegotiation(
                            req.session["uid"],
                            req.body["id"],
                            (err, isIn) => {
                                // se já estiver sendo negociado
                                if (isIn) {
                                    res.json({error: 3});
                                    return;
                                } else {
                                    next(null, true);
                                };
                            }
                        );
                },
                (nothing, next) => {
                    // congela
                    marketplace
                        .freezeItemMonster(
                            req.session["uid"],
                            req.body["id"],
                            0,
                            () => next(null, true)
                        );
                },
                (nothing, next) => {
                    // põe pra vender
                    marketplace
                        .sellItemMonster(
                            req.session["uid"],
                            req.body["id"],
                            0,
                            {
                                type: cashType,
                                value: soldPrice
                            },
                            next
                        );
                },
                results => {
                    res.json({
                        success: true,
                        id: results.insertId
                    })
                }
            ]);



            break;
        };

        // comprar item
        case 5: {

            let id,
                sale_id,
                seller_uid;

            async.waterfall([
                // puxar valores na db pra ver se pode comprar
                next => {
                    //console.log(1);
                    marketplace
                        .checkPurchaseAuthenticity(
                            req.session["uid"],
                            req.body["id"],
                            next
                        );
                },
                // checar se pode comprar
                (data, next) => {
                    console.log(data);
                    // se a venda não estiver habilitada, sai
                    if (!data.enabled) {
                        res.json({error: 1});
                        return;
                    };
                    // se não tem moeda o suficiente pra comprar, sai
                    if (!data.canBuy) {
                        res.json({error: 2});
                        return;
                    };
                    // se estiver comprando dele mesmo
                    if (data.isUidEquals) {
                        res.json({error: 3});
                        return;
                    };
                    // id da venda
                    id = data.id;

                    // id do item que está vendendo
                    sale_id = data.sale_id;

                    // id do vendedor
                    seller_uid = data.uid;

                    // efetuar desconto de moedas do comprador
                    // e 'transferir' à conta do vendedor
                    console.log(11);
                    async.parallel({
                        discont: cb => {
                            console.log(22);
                            marketplace
                                .discontCoin(
                                    req.session["uid"],
                                    data.type,
                                    data.amount,
                                    cb
                                );
                        },
                        add: cb => {
                            console.log(33);
                            marketplace
                                .addCoin(
                                    seller_uid,
                                    data.type,
                                    data.amount,
                                    cb
                                );
                        }
                    }, next);
                },
                (results, next) => {
                    console.log(444);
                    async.parallel({
                        insertItem: next => {
                            const bag = new Bag(null, {uid: req.session["uid"]}, {mysql: req.mysql});

                            bag.insertItem(
                                req.session["uid"],
                                sale_id,
                                1,
                                next
                            );
                        },
                        disableSale: next => {
                            marketplace.disableSale(
                                id,
                                next
                            );
                        },
                        unfreeze: next => {
                            marketplace.unfreezeItem(
                                seller_uid,
                                sale_id,
                                next
                            );
                        }
                    }, next);
                },
                (a, b, c) => {
                    console.log("finally!!", a, b, c);
                    res.json({success: true});
                }
            ]);
            break;
        };

        // cancela venda do item na loja
        case 6: {
            async.waterfall([
                next => {
                    marketplace.cancelItemSellTrade(
                        req.session["uid"],
                        req.body["id"],
                        next
                    );
                },
                (data, next) => {
                    
                    console.log(data, next);
                    
                    if (data.dontExists) {
                        res.json({error: 1});
                        return;
                    };

                    res.json({success: true});
                }
            ]);
            break;
        };

        default: {
            res.json({error: 999});
            break;
        };
    };
};