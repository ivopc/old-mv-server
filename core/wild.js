const 
    async = require("async"),
    _ = require("underscore");

const EVENTS = require("./../database/socket_events.json");

const Base = require("./base.js");

const Wild = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
};

Wild.prototype = Object.create(Base.prototype);

const Resources = {
    Location: require("./../database/monster_location.json"),
    Formulas: require("./../database/formulas.js")
};

const SP_CHECKER = 1;

const math = {
    random: {}
};

math.random.between = function (num) {
    return Math.floor(Math.random() * (num[1] - num[0] + 1) + num[0]);
};

// inserir monstro selvagem na db (com tds variações de level, shiny e etc)
Wild.prototype.insert = function (wild, callback) {

    // gerando randômicamente qual Monstro ira aparecer e seus status, level e etc
    // se será lendário, comum, incomum e a variação do monstro
    let rate = this.randomizeAppearRate(),
        // lista dos monstros de acordo com a rate (se é comum, incomum, lenda...)
        list = wild[this.getCurrentDayPeriod()][rate.rarity],
        // ID do monstro que irá aparecer !!!!!!!!! PRINCIPAL !!!!!!!!!
        monsterpedia_id = list[Math.floor(Math.random() * list.length)],
        // variação do monstro
        variation = 1,
        // level randômico
        level = math.random.between(wild.levelRate);

    // inserir monstro na batalha
    new Species(null, this.auth, this.db)
        .insert({
            monsterpedia_id,
            level,
            type: 1
        }, callback);
};

// procurar monstro selvagem
Wild.prototype.search = function () {
    console.log("search");
    async.waterfall([
        // pegar informações do jogador
        callback => {
            this.mysqlQuery(
                "SELECT `battle_type`, `waiting_wild_battle` FROM `current_doing` WHERE `uid` = ?",
                [this.auth.uid],
                callback
            );
        },
        // checar se já está batalhando
        (results, fields, callback) => {
            results = results[0];

            // se o player já estiver batalhando, impossibilita ele de criar
            // outra batalha, e se já estiver esperando outro wild
            if (parseInt(results.battle_type) > 0 || parseInt(results.waiting_wild_battle) > 0) {
                this.socket.emit(157, ["????"]);
                return;
            };

            callback(null, true);
        },
        // atualizar que o player está esperando uma luta selvagem
        (nothing, callback) => {
            this.mysqlQuery(
                "UPDATE `current_doing` SET `waiting_wild_battle` = '1' WHERE `uid` = ?", 
                [this.auth.uid],
                callback
            );
        },
        // pegar mapa que o jogador está
        (results, callback) => {
            console.log({results, callback});
            new PlayerData()
                .get(this.auth.uid, callback);
        }
    ], (err, results) => {
        // gerar novo monstro selvagem
        this.generateNewWild(results);
    });
};

// manipular aceitação/rejeição da luta selvagem
Wild.prototype.handleAcceptReject = function (input) {

    // verificando se quer lutar
    const wantToBattle = Number(input.wantToBattle) == 1;

    async.parallel({
        // pegar monstro do jogador
        player: next => {
            new Species(this.socket, this.auth, this.db)
                .getMonstersInPocket(next);
        },
        // pegar dados do monstro selvagem
        wild: next => {
            this.mysqlQuery(
                "SELECT * FROM `monsters` WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1'",
                [this.auth.uid],
                (err, results) => next(err, results[0])
            );
        }
    }, (err, data) => {
        //console.log("comparativa", data);

        this.decideIfBattle(
            data,
            wantToBattle
        );
    })
};

// gerar novo monstro selvagem (função complementar a 'search')
Wild.prototype.generateNewWild = function (data) {

    console.log("generateNewWild", data);
	
    const wild = Resources.Location[data.map];

    //console.log("wiiiiiild", wild);

    async.waterfall([
        // inserir monstro selvagem
        next => this.insert(wild, next),
        // pegar informações do monstro selvagem
        (results, next) => {
            this.mysqlQuery(
                "SELECT `monsterpedia_id`, `level`, `sp_HP`,  `sp_attack`, `sp_defense`, `sp_speed` FROM `monsters` WHERE `id` = ? AND `type` = '1' AND `uid` = ?",
                [results.insertId, this.auth.uid],
                next
            );
        },

        // enviar para o client
        (results, fields, next) => {

            let wild_monster = results[0];


            console.log("wildo", wild_monster);

            // checando se tem o item do SP CHECKER
            new Bag(null, this.auth, this.db)
                .checkIfHaveItem(SP_CHECKER, (err, have) => {

                    const monsterData = {
                        id: wild_monster.monsterpedia_id,
                        level: wild_monster.level
                    };

                    if (have) {
                        console.log("TEM SP CHECKER");
                        monsterData.canSeeSP = true;
                        monsterData.hp = wild_monster.sp_HP;
                        monsterData.atk = wild_monster.sp_attack;
                        monsterData.def = wild_monster.sp_defense;
                        monsterData.spe = wild_monster.sp_speed;
                    };

                    console.log(monsterData);

                    this.socket.emit(EVENTS.SEND_WILD_PRE, monsterData);
                });
        }
    ]);
};

// decidir se vai batalhar ou não
Wild.prototype.decideIfBattle = function (monsters_data, wantToBattle) {

    // se não quer batalhar
    //console.log("quer lutar?", wantToBattle);
    //console.log("info dos jogadores", monsters_data);

    // se não quer batalhar
    if (!wantToBattle) {

        // vendo velocidade do monstro, se for mais rápido foge
        if (monsters_data.player.monster0.stats_speed >= monsters_data.wild.stats_speed) {
            //console.log("pode fugir! vc: " + monsters_data.player.monster0.stats_speed, "seu inimigo: " + monsters_data.wild.stats_speed);
            // jogador fugiu com sucesso
            this.runWithSuccess();
            
        } else {
            //console.log("não pode fugir! vc: " + monsters_data.player.monster0.stats_speed, "seu inimigo: " + monsters_data.wild.stats_speed);
            // jogador não pode fugir, então é obrigado a lutar
            this.startBattle(
                monsters_data,
                // state: condição da luta (wild vai pra cima)
                2
            );
        };

        return;
    };

    // se quiser batalhar
    this.startBattle(
        monsters_data,
        // state: condição da luta (wild não vai pra cima)
        3
    );
};

// fugiu com sucesso
Wild.prototype.runWithSuccess = function () {

    async.parallel({
        // desabilita monstro selvagem
        disableWild: next => {
            this.mysqlQuery(
                "UPDATE `monsters` SET `enabled` = '0' WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1'",
                [this.auth.uid],
                next
            );
        },
        // setar que jogador não está esperando por luta selvagem
        setUserNotWaitingWildBattle: next => {
            this.mysqlQuery(
                "UPDATE `current_doing` SET `waiting_wild_battle` = '0' WHERE `uid` = ?",
                [this.auth.uid],
                next
            );
        }
    }, 
    // enviando ao jogador que ele pode fugir
    () => {
        this.socket.emit(EVENTS.SEND_WILD_BATTLE, {
            state: 1
        });
    });  
};

// iniciar batalha
Wild.prototype.startBattle = function (monsters_data, state) {
    
    // se quer batalhar
    async.parallel({
        // insere batalha no banco de dados
        battle: next => {
            // infos que serão inseridos            
            let data = {
                uid: this.auth.uid,
                battle_type: 1
            };
            // insere batalha
            new Battle(this.socket, this.auth, this.db)
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
            new Bag(null, this.auth, this.db)
                .getItems(next);
        }
    }, (err, data) => {
        console.log("infos de batalha1", data.battle);

        async.waterfall([
            next => {
                // pega informações da batalha
                this.mysqlQuery(
                    "SELECT * FROM `battle` WHERE `uid` = ? AND `id` = ?",
                    [this.auth.uid, data.battle[0].insertId],
                    next
                 );
            },
            // envia pro client as informações
            (results, fields, callback) => {

                //console.log("infos da batalha2", results);

                // manda infos da batalha pro client
                this.socket.emit(EVENTS.SEND_WILD_BATTLE, {
                    state,
                    param: {
                        playerMonsters: monsters_data.player,
                        battleInfo: results[0],
                        wild: monsters_data.wild,
                        items: data.items
                    }
                });

                // seta que jogador já viu a apresentação
                this.mysqlQuery(
                    "UPDATE `battle` SET `seen_presentation` = '1' WHERE `uid` = ?",
                    [this.auth.uid]
                );
            }
        ]);
    });
};

// randomizar o tipo de raridade do monstro, se ele é shiny e etc
Wild.prototype.randomizeAppearRate = function (object) {

    object = object || {};
    object.rate = object.rate || 25000;
    object.shiny = object.shiny || Resources.Formulas.Species.Generate.Shiny();

    const rate = Math.floor(Math.random() * object.rate) + 1;

    if (rate <= 17000) // 68%
        return {"rarity": "common"};
        //return ["common", object.shiny];

    if (rate <= 22000) // 20%
        return {"rarity": "uncommon"};
        //return ["uncommon", object.shiny];

    if (rate <= 24900) // 11.6%
        return {"rarity": "rare"};
        //return ["rare", object.shiny]; 

    return {"rarity": "rare2"}; // 0.4%

    //return ["rare2", object.shiny]; 
};

Wild.prototype.getCurrentDayPeriod = function () {
    return "morning";
};

module.exports = Wild;

const
    Species = require("./species.js"),
    Battle = require("./battle.js"),
    Bag = require("./bag.js"),
    PlayerData = require("./playerdata.js");