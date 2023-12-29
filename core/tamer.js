const async = require("async");

const EVENTS = require("./../database/socket_events.json");

const Resources = {
    Tamers: require("./../database/tamers.json")
};

const Base = require("./base.js");

const Tamer = function (main, socket, auth, db, scServer, dataMasterEvents) {
    Base.call(this, main, socket, auth, db, scServer, dataMasterEvents);
};

Tamer.prototype = Object.create(Base.prototype);

// inserir
Tamer.prototype.insert = function (tamer_id, callback) {
    const 
        species = instantiateGameCoreKlass(Species, this.main),
        tamer = Resources.Tamers[tamer_id],
        team = tamer.team,

        fns = {};

    for (let i = 0; i < 6; i ++) {
        fns["monster" + i] = next => {
            if (team[i]) {
                species.insert({
                    monsterpedia_id: team[i].monsterpedia_id,
                    level: team[i].level,
                    type: 2
                }, next);
            } else {
                next(null, 0);
            };
        };
    };

    async.parallel(fns, (err, data) => {
        console.log("------------------------");
        //console.log(data);

        const monsters = [];

        for (let i = 0; i < 6; i ++) {
            if (typeof(data["monster" + i]) == "number") {
                monsters[i] = 0;
            } else {
                monsters[i] = data["monster" + i][0].insertId;
            };
        };

        this.mysqlQuery("INSERT INTO `tamer_bot_monsters_in_pocket` SET ?", {
            id: null,
            uid: this.auth.uid,
            tamer_id: tamer.id,
            monster0: monsters[0],
            monster1: monsters[1],
            monster2: monsters[2],
            monster3: monsters[3],
            monster4: monsters[4],
            monster5: monsters[5]
        }, callback);
    });
};

// iniciar batalha
Tamer.prototype.startBattle = function (tamer_id, callback) {
    async.auto({
        tamer: next => this.insert(tamer_id, next),
        items: next => {
            instantiateGameCoreKlass(Bag, this.main)
                .getItems(next);
        },
        insertBattle: next => {
            instantiateGameCoreKlass(Battle, this.main)
                .insert({
                    uid: this.auth.uid,
                    battle_type: 2,
                    challenged: tamer_id
                }, next);
        },
        setUserBattling: next => {
            this.mysqlQuery(
                "UPDATE `current_doing` SET `battle_type` = '2' WHERE `uid` = ?",
                [this.auth.uid],
                next
            );
        },
        battle: ["insertBattle", (data, next) => {
            this.mysqlQuery(
                "SELECT * FROM `battle` WHERE `uid` = ? AND `id` = ?",
                [this.auth.uid, data.insertBattle.insertId],
                next
             );
        }],
        tamerMonsters: ["tamer", (data, next) => {
            this.getMonstersInParty(tamer_id, next);
        }],
        playerMonsters: next => {
            instantiateGameCoreKlass(Species, this.main)
                .getMonstersInPocket(next);
        }
    }, (err, data) => {
        // manda infos da batalha pro client
        this.socket.emit(EVENTS.SEND_TAMER_BATTLE, {
            param: {
                playerMonsters: data.playerMonsters,
                tamerMonsters: data.tamerMonsters,
                battleInfo: data.battle[0][0],
                items: data.items
            }
        });

        // seta que jogador já viu a apresentação
        this.mysqlQuery(
            "UPDATE `battle` SET `seen_presentation` = '1' WHERE `uid` = ?",
            [this.auth.uid]
        );
        
        callback();
    });
};

// checar se tem um monstro 'vivo' || se não tiver retorna -1
Tamer.prototype.getAliveMonster = function (tamer_id, callback) {
    this.getMonstersInParty(tamer_id, (err, data) => {

        for (let i = 0; i < 6; i ++) {
            if (data["monster" + i] && data["monster" + i].current_HP > 0) {
                callback(null, i);
                return;
            };
        };
        
        callback(null, -1);
    });
};

// pegar informação de todos os monstros que estão no bolso (PRINCIPAL)
Tamer.prototype.getMonstersInParty = function (tamer_id, main_callback) {

    async.waterfall([

        // pegar o id de todos os monstros que estão no pocket
        callback => {
            this.mysqlQuery(
                "SELECT `monster0`, `monster1`, `monster2`, `monster3`, `monster4`, `monster5` FROM `tamer_bot_monsters_in_pocket` WHERE `uid` = ? AND `tamer_id` = ?", 
                [this.auth.uid, tamer_id],
                (err, data) => callback(err, data)
            );
        },

        // retornar informações de todos os monstros
        (results, callback) => {
            //console.log(results[0].monster0);

            // definir monstro que estão no pocket
            const 
                monsterInParty = results[0],
                fns = {};

            for (let i = 0; i < 6; i++) {
                fns["monster" + i] = next => {
                    this.getInPartyMonsterInfo(
                        monsterInParty,
                        // monster index
                        "monster" + i,
                        next
                    );
                };
            };
            // pega info de todos os monstros que estão no pocket
            async.parallel(fns, main_callback);
        }
    ]);
};

// pegar informação do monstro ESPECIFICO que está no bolso (complementar a getMonstersInPocket)
Tamer.prototype.getInPartyMonsterInfo = function (monsterInParty, monsterIndex, next) {

    // ver se o id é maior que 0, se for há um monstro no pocket
    if (monsterInParty[monsterIndex] > 0) {
        // se tiver, pega as informações dele
        // e manda pro proximo
        this.mysqlQuery(
            "SELECT * FROM `monsters` WHERE `id` = ?", 
            [monsterInParty[monsterIndex]],
            (err, results) => next(err, results[0])
        );
    } else {
        // se não, enviar como nulo
        next(null, null);
    };
};

// mudar monstro de posição na party
Tamer.prototype.changePartyPosition = function (input, tamer_id, callback) {

    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `monster" + this.escapeSQL(input.from) + "`, `monster" + this.escapeSQL(input.to) + "` FROM `tamer_bot_monsters_in_pocket` WHERE `uid` = ? AND `tamer_id` = ?",
                [this.auth.uid, tamer_id],
                next
            );
        },
        (results) => {
            results = results[0];

            const change = [];

            // monstro que vai ir
            change[0] = results["monster" + input.to];
            // monstro que será substituido
            change[1] = results["monster" + input.from];

            // não mexa nisso !!!!!
            this.mysqlQuery(
                "UPDATE `tamer_bot_monsters_in_pocket` SET `monster" + this.escapeSQL(input.to) + "` = ?, `monster" + this.escapeSQL(input.from) + "` = ? WHERE `uid` = ? AND `tamer_id` = ?",
                [change[1], change[0], this.auth.uid, tamer_id],
                callback
            );
        }
    ]);
};

module.exports = Tamer;

const 
    Battle = require("./battle.js"),
    Species = require("./species.js"),
    Bag = require("./bag.js");

const { instantiateGameCoreKlass } = require("../utils/utils.js");