const 
    async = require("async"),
    _ = require("underscore"),
    fs = require("fs");

const Resources = {
    Dex: require("./../database/dex.json"),
    Items: require("./../database/items.json"),
    Lang: require("./../database/language.json")
};

const MarketPlace = require("./../core/marketplace.js");

// renderizar view da página inicial (deslogado) ou dashboard (rota dinâmica)
exports.index = function (req, res) {

    // se não tiver conectado, renderiza o login
    if (!req.session["isConnected"]) {
        res.render("newlogin", {
            lang: req.cookies["lang"] || "br",
            texts: Resources.Lang
        });
        return;
    };

    res.render("newdashboard", {
        isConnected: true,
        uid: req.session["uid"],
        nickname: req.session["nickname"],
        authToken: req.session["authToken"],
        csrfToken: req.session["csrfToken"],
        lang: req.session["lang"]
    });

    return;
        
    // renderiza a dashboard se estiver conectado
    res.render("dashboard", {
        isConnected: true,
        uid: req.session["uid"],
        nickname: req.session["nickname"],
        authToken: req.session["authToken"],
        csrfToken: req.session["csrfToken"],
        rank: req.session["rank"]
    });
};

// trocas e negócios --> listar todos os itens/monstros
exports.marketplace = function (req, res) {

    // vendo se vai listar itens ou monstros
    let type = req.route.path.split("/");

    console.log({type});

    if (type[1]) {
        switch (type[1]) {

            case "items": {
                type = 0;
                break;
            };

            case "monsters": {
                type = 1;
                break;
            };

            default: {
                type = 0;
                break;
            };
        };
    } else {
        type = 0;
    };

    //console.log({type});

    // pegar mercadorias
    const market = new MarketPlace(null, {uid: req.session["uid"]}, {mysql: req.mysql}, null);
    
    market.getMerchandises({
        page: req.query["page"],
        type
    }, data => {

        var pagination = [],
            list = [],
            products = data.products;

        // se o número página solicitada for maior que o número total de página
        // manda pra base da URL
        if (req.query["page"] > data.total) {
            res.redirect(req.route.path);
            return;
        };

        // faz paginação
        for (let i = 1; i <= data.total; i ++)
            pagination.push(i);

        // listando os itens/monstros a venda
        for (let i = 0, l = products.length; i < l; i ++) {
            list[i] = {
                id: products[i].id,
                item_or_monster: products[i].item_or_monster == 0 ? "items" : "monsters",
                negotiation_type: products[i].negotiation_type,
                sale_id: products[i].sale_id,
                name: products[i].item_or_monster == 0 ? Resources.Items[products[i].sale_id].name : Resources.Dex[products[i].if_is_monster_monsterpedia_id].specie,
                item_monster_id: products[i].item_or_monster == 0 ? products[i].sale_id : products[i].if_is_monster_monsterpedia_id,
                negotiation_type: products[i].negotiation_type == 0 ? "Troca" : "Venda",
                requested: market.sortRequested(products[i])
            };
        };

        console.log({list});

        // renderiza view
        res.render("marketplace", {
            pagination,
            products: list,
            type: type == 0 ? "Item" : "Monstro",
            logged: req.session["isConnected"]
        });
    });
};

// trocas e negócios --> por pra vender/trocar
exports.marketplacesell = function (req, res) {
    // se não tiver conectado, renderiza o login
    if (!req.session["isConnected"]) {
        res.redirect("/");
        return;
    };

    async.parallel({
        monsters: next => {
            req.mysql.query(
                "SELECT * FROM `monsters` WHERE `uid` = '" + req.session["uid"] + "' AND `type` = '0' AND `in_pocket` = '0' AND `enabled` = '1' AND `can_trade` = '1'",
                next
            );
        },
        items: next => {
            req.mysql.query(
                "SELECT * FROM `items` WHERE `uid` = '" + req.session["uid"] + "'",
                next
            );
        }
    }, (err, data) => {

        res.render("marketplacesell", {
            token: req.session["csrfToken"],
            monsters: data.monsters[0],
            items: data.items[0],
            db: {
                dex: Resources.Dex,
                items: Resources.Items
            }
        });
    });
};

// trocas e negócios --> ver minhas vendas e possivelmente remove-las
exports.marketplacemy = function (req, res) {
    // se não tiver conectado, renderiza o login
    if (!req.session["isConnected"]) {
        res.redirect("/");
        return;
    };

    const list = {
        monsters: [],
        items: []
    };

    async.waterfall([
        next => {
            req.mysql.query(
                "SELECT * FROM `marketplace` WHERE `uid` = ? AND enabled = '1'",
                [req.session["uid"]],
                next
            )
        },
        (results, next) => {
            for (let i = 0; i < results.length; i ++) {
                switch (results[i].item_or_monster) {
                    case 0: { // item
                        list.items.push({
                            id: results[i].id,
                            sale_id: results[i].sale_id
                        });
                        break;
                    };
                    case 1: { // monstro
                        list.monsters.push({
                            id: results[i].id,
                            monsterpedia_id: results[i].if_is_monster_monsterpedia_id
                        });
                        break;
                    };
                }
            };

            res.render("marketplacemy", {
                token: req.session["csrfToken"],
                monsters: list.monsters,
                items: list.items,
                db: {
                    dex: Resources.Dex,
                    items: Resources.Items
                }
            });
        }
    ]);
};

// trocas e negócios --> mostrar mercadoria especifica
exports.marketplacespecific = function (req, res) {

    var product_name,
        data;

    // pegar mercadorias
    var market = new MarketPlace();

    async.waterfall([
        next => {
            req.mysql.query(
                "SELECT * FROM `marketplace` WHERE `id` = ?",
                [req.params["id"]], 
                next
            );
        },
        (results, fields, next) => {
            if (!results.length) {
                res.render("marketplacenotfound");
                return;
            };

            data = results[0];

            if (!data.enabled) {
                res.render("marketplacenotfound");
                return;                
            };

            //console.log("AKI CRL@!", data);

            switch (data.item_or_monster) {
                case 0: {
                    product_name = Resources.Items[data.sale_id].name;
                    break;
                };

                case 1: {
                    product_name = Resources.Dex[data.if_is_monster_monsterpedia_id].specie;
                    break;
                };
            };

            next(null, true);
        },
        (nothing, next) => {
            req.mysql.query(
                "SELECT `nickname` FROM `users` WHERE `id` = '" + data.uid + "'",
                next
            );
        },
        (results, fields, next) => {
            res.render("marketplacespecific", {
                token: req.session["csrfToken"],
                id: req.params["id"],
                nickname: results[0].nickname,
                coin_value: data.requested_amount,
                product_name,
                product_data: market.sortRequested(data),
                item_or_monster: data.item_or_monster
            });
        }
    ]);

    /*req.scServer.exchange.publish("u-" + results.uid, {
        alguem: "está interessado"
    });*/
};

const scripts = [
    //"/js/socketcluster.js",
    "/js/replacephrase.js",
    //"/js/phaser3.js",
    "/js/phaser3.button.js",
    "/js/HealthBar.p3.js",
    "/js/rexdragplugin.min.js",
    "/js/rexuiplugin.min.js",
    "/js/rexgridtableplugin.min.js",
    "/js/new_engine/property.js",
    "/js/new_engine/property.js",
    "/js/new_engine/preloader.js",
    "/js/new_engine/overworld/index.js",
    "/js/new_engine/overworld/map.js",
    "/js/new_engine/overworld/sprite.js",
    "/js/new_engine/overworld/movement.js",
    "/js/new_engine/overworld/interface.js",
    "/js/new_engine/overworld/dialog.js",
    "/js/new_engine/overworld/automatized.js",
    "/js/new_engine/overworld/online.js",
    "/js/new_engine/overworld/miscellaneous.js",
    "/js/new_engine/overworld/tokens.js",
    "/js/new_engine/battle/index.js",
    "/js/new_engine/battle/sprite.js",
    "/js/new_engine/battle/controller.js",
    "/js/new_engine/battle/online.js"
];

exports.gamesource = function (req, res) {
    const fns = [];
    let content = "";
    for (let i = 0; i < scripts.length; i ++) {
        fns.push(next => {
            fs.readFile("C:/nodejs/MonsterValleNew/server/public" + scripts[i], "utf8", (err, data) => {
                content += data;
                next(err, data);
            });
        });
    }

    async.series(fns, () => {
        res.type("application/javascript");
        res.send(content);
    });
};

const scriptsoverworld = [
    "/js/new_engine/overworld/index.js",
    "/js/new_engine/overworld/automatized.js",
    "/js/new_engine/overworld/dialog.js",
    "/js/new_engine/overworld/gameobjects.js",
    "/js/new_engine/overworld/map.js",
    "/js/new_engine/overworld/miscellaneous.js",
    "/js/new_engine/overworld/online.js",
    "/js/new_engine/overworld/sprite.js",
    "/js/new_engine/overworld/tokens.js"
];

    // "/js/new_engine/overworld/index.js" x
    // "/js/new_engine/overworld/map.js" x
    // "/js/new_engine/overworld/sprite.js" x
    // "/js/new_engine/overworld/gameobjects.js" x
    // "/js/new_engine/overworld/dialog.js" x
    // "/js/new_engine/overworld/automatized.js" x
    // "/js/new_engine/overworld/online.js" x
    // "/js/new_engine/overworld/miscellaneous.js" x
    // "/js/new_engine/overworld/tokens.js" x

exports.gamesourceoverworld = function (req, res) {
    const fns = [];
    let content = "";
    for (let i = 0; i < scriptsoverworld.length; i ++) {
        fns.push(next => {
            fs.readFile("C:/nodejs/MonsterValleNew/server/public" + scriptsoverworld[i], "utf8", (err, data) => {
                content += data;
                next(err, data);
            });
        });
    }

    async.series(fns, () => {
        res.type("application/javascript");
        content = content.replace(/Phaser.Button/gi, "Button");
        content = content.replace(/Game.Overworld/gi, "Overworld");
        res.send(content);
    });
};

const scritsbattle = [
    "/js/new_engine/battle/index.js",
    "/js/new_engine/battle/sprite.js",
    "/js/new_engine/battle/controller.js",
    "/js/new_engine/battle/online.js"
];

exports.gamesourcebattle = function (req, res) {
    const fns = [];
    let content = "";
    for (let i = 0; i < scritsbattle.length; i ++) {
        fns.push(next => {
            fs.readFile("C:/nodejs/MonsterValleNew/server/public" + scritsbattle[i], "utf8", (err, data) => {
                content += data;
                next(err, data);
            });
        });
    }

    async.series(fns, () => {
        res.type("application/javascript");
        res.send(content);
    });
};