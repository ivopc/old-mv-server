const async = require("async");

const EVENTS = require("./../database/socket_events.json");

const Base = require("./base.js");

const PixioScript = function (main, socket, auth, db, scServer, dataMasterEvents) {
    Base.call(this, main, socket, auth, db, scServer, dataMasterEvents);
    // lista das funções que serão executas em runtime
    this.fn = [];
    // lista dos códigos
    this.codes = null;
};

PixioScript.prototype = Object.create(Base.prototype);

// parseia e executa o código
PixioScript.prototype.codeParser = function (codes) {

    this.codes = this.codes || codes;

    // executando loop na array de códigos para registra-las na array 'fn'
    for (let i = 0, l = codes.length; i < l; i++) {

        /* declarando parametro e nome da função que sempre irá mudar em cada loop
        e pegando nome da função, que é a primeira instrução, caso ela não seja um 
        número então devemos pegar o valor na array de funções*/
        var code = codes[i];

        var param,
            fnName = isNaN(code[0]) ? this.fnNames[code[0]] : code[0];

        // vendo qual o nome da função e setando o parâmetro de acordo com suas variantes
        switch (fnName) {

            // giveitem
            case this.fnNames["giveitem"]: {
                // id do item e quantidade: fallback pra 1
                param = {
                    id: code[1].id,
                    amount: code[1].amount || 1
                };

                break;
            };

            // givemonster
            case this.fnNames["givemonster"]: {
                param = {
                    monsterpedia_id: code[1].monsterpedia_id,
                    shiny: code[1].shiny || false,
                    is_initial: code[1].is_initial || false,
                    can_trade: code[1].can_trade || true,
                    can_trade: "can_trade" in code[1] ? code[1].can_trade : true,
                    level: code[1].level || 0,
                    hold_item: code[1].hold_item || 0,
                    catch_item: code[1].catch_item || 0,
                    egg_is: code[1].egg_is || false,
                    egg_date: code[1].egg_date || 0
                };

                break;
            };

            //healmonster
            case this.fnNames["healmonster"]: {
                param = {
                    target: code[1]
                };
                break;
            };

            // teleport
            case this.fnNames["teleport"]: {
                // coordenadas x e y, e facing com fallback pra baixo (2)
                param = {
                    x: code[1].x,
                    y: code[1].y,
                    facing: code[1].facing || 2
                };

                break;
            };

            // setflag
            case this.fnNames["setflag"]: {
                param = {
                    type: code[1].type,
                    flag_id: code[1].flag_id,
                    value: code[1].value
                };

                break;
            };
            // battlevstamer
            case this.fnNames["battlevstamer"]: {
                param = {
                    tamer_id: code[1].tamer_id
                };
                break;
            };

            case this.fnNames["battlevswild"]: {
                param = {
                    monsterpedia_id: code[1].monsterpedia_id,
                    level: code[1].level,
                    isTutorial: code[1].isTutorial || false
                };
                break;
            };
        };

        // adicionar função com nome dinâmico aplicando os parametros e objeto
        // ao escopo dela
        this.fn.push(this.fns[fnName].bind({
            param,
            main: this.main,
            socket: this.socket,
            db: this.db,
            mysqlQuery: this.mysqlQuery,
            auth: this.auth
        }));
    };
};

// aplicar parametros --> não mexa!
PixioScript.prototype.applyParams = function (params, codes) {
    this.codes = codes;

    console.log(params);

    for (var i = 0, l = this.codes.length; i < l; i ++) {
        var code = this.codes[i][1];
        for (var i2 = 0, attr = Object.keys(code), l2 = attr.length; i2 < l2; i2 ++) {
            for (var i3 = 0, param = Object.keys(params), l3 = param.length; i3 < l3; i3 ++) {
                if (this.codes[i][1][attr[i2]] == this.toInput(param[i3])) {
                    this.codes[i][1][attr[i2]] = params[param[i3]];
                };
            };
        };
    };
};

// executar em runtime
PixioScript.prototype.exec = function (callback) {
    // executa array de funções e quando todas forem executadas chama callback
    async.series(this.fn, callback);
};

PixioScript.prototype.toInput = function (str) {
    return "$input{" + str + "}";
};

// converte pixioscript para json
PixioScript.prototype.pixioToJson = function (codes) {};

// compila javascript diretamente
PixioScript.prototype.compile = function (codes) {};

// aconteceu um erro no runtime
PixioScript.prototype.runTimeErrorHandler = function () {};

// nome das funções nativas
PixioScript.prototype.fnNames = {
    "giveitem": 0,
    "givemonster": 1,
    "healmonster": 2,
    "tamerbattle": 3,
    "sethealingplace": 4,
    "handlesilver": 5,
    "teleport": 6,
    "setflag": 7,
    "battlevstamer": 8,
    "battlevswild": 9
};

// lista das funções nativas
PixioScript.prototype.fns = [];

// giveitem
PixioScript.prototype.fns[0] = function (next) {

    console.log(this.param, "executando: giveitem");

    // id, amount
    // this.param.id | this.param.amount

    async.series([
        callback => {
            // inserindo item
            instantiateGameCoreKlass(Bag, this.main)
                .insertItem(
                    null, // user id setado automaticamente
                    this.param.id, // id do item
                    this.param.amount, // quantidade do item
                    callback
                );
        },
        callback => {
            // enviar ao client para atualizar itens
            this.socket.emit(EVENTS.UPDATE_MONSTERS_ITEMS, {
                items: true
            });
            callback();
        },
        () => next()
    ]);
};

// givemonster
PixioScript.prototype.fns[1] = function (next) {

    console.log(this.param, "executando: givemonster");

    // posição que está livre no bracelete
    let index;

    const 
        param = this.param,
        species = instantiateGameCoreKlass(Species, this.main);

    async.waterfall([
        callback => {
            // pegar espaço livre no bracelete
            species.getFreeSpaceInPocket(results => {

                console.log("index", results);

                index = results;
                // se for falso (bool) não há espaço livre, ou seja: não está no pocket
                if (typeof(results) == "boolean") {
                    param.in_pocket = false;
                } else {
                    param.in_pocket = true;
                };

                console.log("in_pocket", param.in_pocket);

                callback(null, results);
            });
        },
        (index, callback) => species.insert(param, callback),
        (data, callback) => {
            console.log("Chegou até aqui");
            // se estiver no pocket, atualiza monstro pra pocket atual
            if (typeof(index) == "number") {
                console.log("updeita db pocket", index);
                this.mysqlQuery(
                    "UPDATE `monsters_in_pocket` SET `monster" + index + "` = ? WHERE `uid` = ?",
                    [data.insertId, this.auth.uid],
                    err => callback(err)
                );
            } else {
                console.log("não updeita db pocket", index);
                callback();
            };
        },
        callback => {
            // enviar ao client para atualizar monstros
            console.log("UPDATE CLIENT");
            this.socket.emit(EVENTS.UPDATE_MONSTERS_ITEMS, {
                monsters: true
            });
            callback();
        }
    ], err => err ? console.error("Ixi deu ruim", err) : next());
};

// healmonster
PixioScript.prototype.fns[2] = function (next) {
    console.log(this.param, "executando: healmonster");

    async.waterfall([
        callback => {
            // healar monstros
            instantiateGameCoreKlass(Species, this.main)
                .healAllPlayerMonsters(callback);
        },
        () => {
            // enviar ao client para atualizar monstros
            this.socket.emit(EVENTS.UPDATE_MONSTERS_ITEMS, {
                monsters: true
            });

            next();
        }
    ]);
};

// teleport
PixioScript.prototype.fns[6] = function (next) {

    console.log(this.param, "executando teleport");
    new PlayerData().set(this.auth.uid, {
        posx: param.x,
        posy: param.y,
        posfacing: param.facing
    });
    next();
};

// setflag
PixioScript.prototype.fns[7] = function (next) {

    console.log(this.param, Object.keys(this.main), "executando setflag");

    // updeita flag
    const param = this.param;

    // muda flag na db
    instantiateGameCoreKlass(Flag, this.main)
        .insertUpdate(
            param.type,
            param.flag_id,
            param.value,
            next
        );
};

// battlevstamer
PixioScript.prototype.fns[8] = function (next) {
    const param = this.param;

    instantiateGameCoreKlass(Tamer, this.main)
        .startBattle(param.tamer_id, next);
};

// battlevswild
PixioScript.prototype.fns[9] = function (next) {
    const { monsterpedia_id, level, isTutorial } = this.param;

    const species = instantiateGameCoreKlass(Species, this.main);

    async.auto({
        // inserir monstro
        insertWildMonster: next => {
            species.insert({
                monsterpedia_id,
                level,
                type: 1
            }, next);
        },
        // inserir batalha
        insertBattle: next => {
            let data = {
                uid: this.auth.uid,
                battle_type: 1
            };
            instantiateGameCoreKlass(Battle, this.main)
                .insert(
                    data,
                    next
                );
        },
        // setar que usuário está lutando e não está mais esperando luta selvagem
        setUserBattling: next => {
            this.mysqlQuery(
                "UPDATE `current_doing` SET `battle_type` = '1', `waiting_wild_battle` = '0' WHERE `uid` = ?",
                [this.auth.uid],
                next
            );
        },
        // pegar itens
        items: next => {
            instantiateGameCoreKlass(Bag, this.main)
                .getItems(next);
        },
        // pegar dados do monstro selvagem
        wild: ["insertWildMonster", (data, next) => {
            this.mysqlQuery(
                "SELECT * FROM `monsters` WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1'",
                [this.auth.uid],
                (err, results) => next(err, results[0])
            );
        }],
        // pegar monstro do jogador
        player: next => species.getMonstersInPocket(next),
        // pegar dados da batalha
        battle: ["insertBattle", (data, next) => {
            console.log("--------------------------------");
            console.log("AKI FDP");
            console.log(data.insertBattle);
            this.mysqlQuery(
                "SELECT * FROM `battle` WHERE `uid` = ? AND `id` = ?",
                [this.auth.uid, data.insertBattle.insertId],
                (err, results) => next(err, results[0])
             );
        }]
    }, (err, data) => {

        // manda infos da batalha pro client
        this.socket.emit(EVENTS.SEND_WILD_BATTLE, {
            state,
            param: {
                playerMonsters: data.player,
                battleInfo: data.battle,
                wild: data.wild,
                items: data.items,
                isTutorial
            }
        });

        // seta que jogador já viu a apresentação
        this.mysqlQuery(
            "UPDATE `battle` SET `seen_presentation` = '1' WHERE `uid` = ?",
            [this.auth.uid]
        );

    });

};

module.exports = PixioScript;

const 
    Bag = require("./bag.js"),
    Species = require("./species.js"),
    Tamer = require("./tamer.js"),
    Battle = require("./battle.js"),
    Flag = require("./flag.js"),
    PlayerData = require("./playerdata.js");

const { instantiateGameCoreKlass } = require("../utils/utils.js");