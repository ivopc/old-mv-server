const 
    async = require("async"),
    _ = require("underscore");

const SubClasses = {};

const EVENTS = require("./../database/socket_events.json");

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

const SP_CHECKER = 65656556;

const Base = require("./base.js");

const Player = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
    this.networking = new SubClasses.Networking(socket, scServer, auth.uid);
    /**
     * @type {number}
     */
    this.autoSaveTimer;
};

const AUTO_SAVE_TIMER_UPDATE = 30000;

Player.prototype = Object.create(Base.prototype);

// quando jogador conecta
Player.prototype.connect = async function () {

    console.log(`Jogador ID ${this.auth.uid} conectou.`);

    const pdata = new PlayerData();

    if (!pdata.has(this.auth.uid)) {
        console.log("dosent has");
        pdata.set(this.auth.uid, await this.fetchDataFromPersistent());
    };

    // setar no banco de dados que player está online
    pdata.set(this.auth.uid, {online: true});

    this.autoSaveTimer = setInterval(() => this.autoSaveData(), AUTO_SAVE_TIMER_UPDATE);

    async.series([
        // checar se tem outro player conectado
        next => this.checkIfTheresOtherPlayerConnected(next),
        // pegar dados do jogador e enviar ao client
        () => this.getRawPlayerData((err, data) => this.sendInitialData(err, data))
    ]);
};

// quando jogador desconecta
Player.prototype.disconnect = function () {
    console.log(`Jogador ID ${this.auth.uid} desconectou.`);

    const pdata = new PlayerData();

    // não está mais online nas flags de que só pode um user on de cada ID
    this.mysqlQuery(
        "DELETE FROM `online_offline_flag` WHERE `uid` = ? AND `sckt_id` = ?",
        [this.auth.uid, this.networking.socket.id]
    );

    // setar no banco de dados que player está off-line
    pdata.set(this.auth.uid, {online: false});

    // tirar boneco do mapa | excluir sprite no mapa
    pdata.get(this.auth.uid, (err, data) => {
        this.networking.sendToMap(data.map, {
            uid: this.auth.uid,
            dataType: 3
        });
    });

    clearInterval(this.autoSaveTimer);
    this.autoSaveData();
};

// ping-pong
Player.prototype.pong = function () {
    this.networking.send(EVENTS.PONG);
};

// checando se tem outro jogador conectado na mesma conta
Player.prototype.checkIfTheresOtherPlayerConnected = function (callback) {

    console.log("checkIfTheresOtherPlayerConnected");

    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `sckt_id` FROM `online_offline_flag` WHERE `uid` = ?",
                [this.auth.uid],
                (err, data) => next(err, data)
            );
        },
        (results, next) => {

            // se não há ninguém conectado só vai pro proximo
            if (!results.length) {
                next(null, true);
                return;
            };

            // * se há alguém conectado, desconecta ele

            // desconecta
            for (let i = 0; i < results.length; i ++) {
                if (results[i].sckt_id in this.scServer.clients)
                    this.scServer.clients[results[i].sckt_id].disconnect();
            };

            // remove na db
            this.mysqlQuery(
                "DELETE FROM `online_offline_flag` WHERE `uid` = ?",
                [this.auth.uid],
                (err, results) => next(err, true)
            );
        },
        (nothing, next) => this.insertOnlinePlayer(next)
    ], callback);
};
 
// inserir na db que player está online
Player.prototype.insertOnlinePlayer = function (callback) {
    this.mysqlQuery("INSERT INTO `online_offline_flag` SET ?", {
        id: null,
        uid: this.auth.uid,
        sckt_id: this.networking.socket.id
    }, callback);
};

// prepara informação para client iniciar o jogo
Player.prototype.sendInitialData = function (err, data) {

    console.log("flags", data.flags);
    console.log("game data", data.game_data);

    // pegando flag do mapa que está atualmente
    const flag = data.flags.find(flag => flag.flag_id == data.game_data.map);

    // caso esteja batalhando
    if (data.current.battle_type > 0) {

        // vendo se é batalha selvagem ou de domador ou pvp
        switch (data.current.battle_type) {
            // caso seja contra monstro selvagem
            case 1: {
                this.sendWildBattle(data);
                break;
            };
            // caso seja contra domador (cpu)
            case 2: {
                this.sendTamerBattle(data);
                break;
            };
            // PvP
            case 3: {
                this.sendPvPBattle(data);
                break;
            };
        };

        return;
    };
    // se estiver esperando uma luta selvagem
    if (data.current.waiting_wild_battle > 0) {
        this.sendWaitWildBattle(data, flag);
        return;
    };

    // envia ao client os dados
    this.networking.send(EVENTS.START_CLIENT, {
        state: 0,
        param: {
            monsters: data.monsters,
            position: {
                x: data.game_data.pos_x,
                y: data.game_data.pos_y,
                facing: data.game_data.pos_facing,
            },
            items: data.items,
            sprite: data.game_data.sprite,
            map: data.game_data.map,
            nickname: data.game_data.nickname,
            flag: flag.value,
            battle: false,
            tamers: data.tamersInMap,
            notify: data.notify
        }
    });
};

// pegar dados do jogador separadamente
Player.prototype.getPlayerData = function () {

    this.getRawPlayerData((err, data) => {
        // pega flag do mapa
        const flag = data.flags.find(flag => flag.flag_id == data.game_data.map);
        // envia ao client
        this.networking.send(EVENTS.IN_BATTLE_GET_PLAYER_DATA, {
            monsters: data.monsters,
            position: {
                x: data.game_data.pos_x,
                y: data.game_data.pos_y,
                facing: data.game_data.pos_facing,
            },
            items: data.items,
            sprite: data.game_data.sprite,
            map: data.game_data.map,
            flag: flag.value,
            battle: false,
            tamers: data.tamersInMap,
            notify: data.notify
        });
    });
};

// enviar informações de batalha com o monstro selvagem para o client
Player.prototype.sendWildBattle = function (data) {

    async.auto({
        battle: next => {
            this.mysqlQuery(
                "SELECT * FROM `battle` WHERE `uid` = ?",
                [this.auth.uid],
                (err, results) => next(err, results[0])
            );
        },
        // pegar infos do monstro selvagem
        wild: next => {
            this.mysqlQuery(
                "SELECT * FROM `monsters` WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1'",
                [this.auth.uid],
                (err, results) => next(err, results[0])
            );
        },
        buff_nerf: ["battle", (_data, next) => {
            this.mysqlQuery(
                "SELECT * FROM `battle_buffs_nerfs` WHERE `battle_id` = ?",
                [_data.battle.id],
                (err, results) => {
                    results = results || [];
                    next(err, results);
                }
            );
        }]
    }, (err, battle_data) => {
        // seta buff e nerf
        battle_data.battle.buff_nerf = battle_data.buff_nerf;
        // manda infos da batalha pro client
        this.networking.send(EVENTS.START_CLIENT, {
            state: 1,
            param: {
                playerMonsters: data.monsters,
                battleInfo: battle_data.battle,
                wild: battle_data.wild,
                items: data.items
            }
        });

        // seta que jogador já viu a apresentação
        this.mysqlQuery(
            "UPDATE `battle` SET `seen_presentation` = '1' WHERE `uid` = ?",
            [this.auth.uid]
        );

    });
};

// enviar informações da batalha contra domador
Player.prototype.sendTamerBattle = function (data) {
    async.auto({
        battle: next => {
            this.mysqlQuery(
                "SELECT * FROM `battle` WHERE `uid` = ?",
                [this.auth.uid],
                (err, results) => next(err, results[0])
            );
        },
        buff_nerf: ["battle", (_data, next) => {
            this.mysqlQuery(
                "SELECT * FROM `battle_buffs_nerfs` WHERE `battle_id` = ?",
                [_data.battle.id],
                (err, results) => next(err, results)
            );
        }],
        tamerMonsters: ["battle",  (_data, next) => {
            new Tamer(null, this.auth, this.db)
                .getMonstersInParty(_data.battle.challenged, next);
        }]
    }, (err, battle_data) => {
        // seta buff e nerf
        battle_data.battle.buff_nerf = battle_data.buff_nerf;
        // manda infos da batalha pro client
        this.networking.send(EVENTS.START_CLIENT, {
            state: 1,
            param: {
                playerMonsters: data.monsters,
                tamerMonsters: battle_data.tamerMonsters,
                battleInfo: battle_data.battle,
                items: data.items
            }
        });

        // seta que jogador já viu a apresentação
        this.mysqlQuery(
            "UPDATE `battle` SET `seen_presentation` = '1' WHERE `uid` = ?",
            [this.auth.uid]
        );

    });
};

// enviar informações da batalha de pvp para o client
Player.prototype.sendPvPBattle = function (data) {
    const species = new Species(null, this.auth, this.db);
    async.auto({
        battle: next => {
            this.mysqlQuery(
                "SELECT * FROM `battle` WHERE `id` = ?",
                [data.current.if_is_pvp_battle_id],
                (err, results) => next(err, results[0])
            );
        },
        buff_nerf: ["battle", (_data, next) => {
            this.mysqlQuery(
                "SELECT * FROM `battle_buffs_nerfs` WHERE `battle_id` = ?",
                [_data.battle.id],
                (err, results) => next(err, results)
            );
        }],
        inviter: ["battle", (_data, next) => species.getMonstersInPocket(next, _data.battle.uid)],
        receiver: ["battle", (_data, next) => species.getMonstersInPocket(next, _data.battle.challenged)]
    }, (err, battle_data) => {
        //console.log(data);
        // seta buff e nerf
        battle_data.battle.buff_nerf = battle_data.buff_nerf;

        // vendo quem é o oponente 
        let opponent = battle_data.battle.uid == this.auth.uid ? "receiver" : "inviter";

        // manda infos da batalha pro client
        this.networking.send(EVENTS.START_CLIENT, {
            state: 1,
            param: {
                playerMonsters: data.monsters,
                opponentPlayerMonsters: battle_data[opponent],
                battleInfo: battle_data.battle,
                items: data.items
            }
        });

        this.mysqlQuery(
            "UPDATE `battle` SET `seen_presentation` = '1' WHERE `id` = ?",
            [data.current.if_is_pvp_battle_id]
        );

    });
};

// enviar informações básicas + monstro selvagem que está esperando
Player.prototype.sendWaitWildBattle = function (data, flag) {

    async.parallel({
        monsterData: next => {
            this.mysqlQuery(
                "SELECT `monsterpedia_id`, `level`, `sp_HP`,  `sp_attack`, `sp_defense`, `sp_speed` FROM `monsters` WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1'",
                [this.auth.uid],
                (err, results) => next(err, results[0])
            );
        },
        checkIfHaveItem: next => {
            new Bag(null, this.auth, this.db)
                .checkIfHaveItem(SP_CHECKER, next);
        }
    }, (err, _data) => {

        console.log("----------------------------------");
        console.log(_data.checkIfHaveItem);

        const monsterData = {
            id: _data.monsterData.monsterpedia_id,
            level: _data.monsterData.level
        };

        // se tiver item necessário para
        if (_data.checkIfHaveItem) {
            monsterData.canSeeSP = true;
            monsterData.hp = _data.monsterData.sp_HP;
            monsterData.atk = _data.monsterData.sp_attack;
            monsterData.def = _data.monsterData.sp_defense;
            monsterData.spe = _data.monsterData.sp_speed;
        };

        this.networking.send(EVENTS.START_CLIENT, {
            state: 0,
            param: {
                monsters: data.monsters,
                position: {
                    x: data.game_data.pos_x,
                    y: data.game_data.pos_y,
                    facing: data.game_data.pos_facing,
                },
                items: data.items,
                sprite: data.game_data.sprite,
                map: data.game_data.map,
                flag: flag.value,
                wild: monsterData,
                battle: false,
                notify: data.notify,
                tamers: data.tamersInMap
            }
        });
    });
};

// pegar dados do jogador (cru/seco e com callback)
Player.prototype.getRawPlayerData = function (callback) {
    async.auto({
        // pegar dados do player in-game
        game_data: next => {
            this.mysqlQuery(
                `SELECT sprite, map, pos_x, pos_y, pos_facing FROM in_game_data WHERE uid = ?`,
                this.auth.uid,
                (err, [ data ]) => next(err, data)
            );
        },
        // pegar flags do mapa
        flags: next => {
            this.mysqlQuery(
                "SELECT `flag_id`, `value` FROM `flags` WHERE `uid` = ? AND `type` = 'm'",
                [this.auth.uid],
                (err, results) => next(err, results)
            );
        },
        // pegar monstros do player
        monsters: next => {
            const species = new Species(null, this.auth, this.db);
            
            species.getMonstersInPocket((err, data) => {
                species.filterMonstersData(err, data, next);
            });
        },
        // pegar itens do player
        items: next => {
            new Bag(null, this.auth, this.db)
                .getItems(next);
        },
        // o que jogador está fazendo atualmente
        current: next => {
            this.mysqlQuery(
                "SELECT `battle_type`, `waiting_wild_battle`, `if_is_pvp_battle_id` FROM `current_doing` WHERE `uid` = ?",
                [this.auth.uid],
                (err, results) => next(err, results[0])
            )
        },
        // dados dos domadores que estão no mapa
        tamersInMap: ["game_data", (data, next) => {
            if (MapData[data.game_data.map].tamers) {
                new Map(null, this.auth, this.db)
                    .getActiveTamers(data.game_data.map, next);
            } else {
                next(null, null);
            };
        }],
        // notificações do player
        notify: next => {
            new Notify(null, this.auth, this.db)
                .getRaw(null, next);
        }
    }, callback);
};

// atualizar itens ou monstros no client
Player.prototype.getItemsMonster = function (input) {

    input = input || {};

    if ("monsters" in input) {

        const species = new Species(null, this.auth, this.db);
        
        species.getMonstersInPocket((err, data) => {
            species.filterMonstersData(err, data, (error, monsters) => {
                this.networking.send(EVENTS.RECEIVE_UPDATED_MONSTERS_ITEMS, {
                    type: 1,
                    data: monsters
                });
            });
        });
    };
    if ("items" in input) {
        new Bag(null, this.auth, this.db)
            .getItems((err, data) => {
                this.networking.send(EVENTS.RECEIVE_UPDATED_MONSTERS_ITEMS, {
                    type: 2,
                    data
                });
            });
    };
};

// enviar convite de pvp
Player.prototype.sendPvPInvite = function (inviter, receiver, req, callback) {

    async.parallel({
        insert: next => {
            this.mysqlQuery("INSERT INTO `pvp_invites` SET ?", {
                id: null,
                inviter,
                receiver,
                accepted: 0
            }, () => next());
        },
        inviterData: next => {
            new PlayerData()
                .get(inviter, next);
        }
    }, (err, data) => {
        req.data.nickname = data.inviterData.nickname;
        callback();
    });
};

// responder ao convite de pvp
Player.prototype.respondPvPInvite = function (receiver, inviter, accepted, next) {

    // se aceitou ou recusou, tratando pra inserir na db
    switch (accepted) {
        case true: {
            accepted = 1;
            break;
        };

        case false: {
            accepted = 2;
            break;
        };

        default: {
            return;
        };
    };

    // faz as ações na db
    async.auto({
        updateInvite: callback => {
            this.mysqlQuery(
                "UPDATE `pvp_invites` SET `accepted` = ? WHERE `inviter` = ? AND `receiver` = ? AND accepted = '0'",
                [accepted, inviter, receiver],
                callback
            );
        },
        battle: callback => {
            // caso aceitou a batalha
            if (accepted == 1) {
                new Battle(null, this.auth, this.db, this.scServer)
                    .insert({
                        uid: inviter,
                        battle_type: 3,
                        challenged: receiver
                    }, callback);
            } else {
                callback(null, null);
            };
        },
        changeCurrentDoing: ["battle", (data, callback) => {

            // caso aceitou a batalha
            if (accepted == 1) {
                async.parallel([
                    cb => {
                        this.mysqlQuery(
                            "UPDATE `current_doing` SET `if_is_pvp_battle_id` = ?, `battle_type` = '3' WHERE `uid` = ?",
                            [data.battle[0].insertId, receiver],
                            cb
                        );
                    },
                    cb => {
                        this.mysqlQuery(
                            "UPDATE `current_doing` SET `if_is_pvp_battle_id` = ?, `battle_type` = '3' WHERE `uid` = ?", 
                            [data.battle[0].insertId, inviter],
                            cb
                        );
                    }
                ], callback);
            } else {
                callback(null, null);
            };
        }]
    }, (err, data) => {

        if (accepted != 1)
            return;

        const 
            species = new Species(null, this.auth, this.db),
            pdata = new PlayerData();

        // pegar monstros do player
        async.parallel({
            receiverMonsters: cb => species.getMonstersInPocket(cb, receiver),
            inviterMonsters: cb => species.getMonstersInPocket(cb, inviter),
            receiverData: cb => pdata.get(receiver, cb),
            inviterData: cb => pdata.get(inviter, cb),
            battle: cb => {
                this.mysqlQuery(
                    "SELECT * FROM `battle` WHERE `id` = ?",
                    [data.battle.insertId],
                    (err, results) => cb(err, results[0])
                );
            }
        }, (err, response) => {

            // ação que inicia pvp
            const action = 5;

            // ** publicar no canal dos dois que vão iniciar o pvp

            // canal do que recebeu o convite de pvp
            this.networking.sendToRemotePlayer(receiver, {
                action,
                battleInfo: response.battle,
                opponentPlayerMonsters: response.inviterMonsters,
                opponentData: {
                    nickname: response.inviterData.nickname,
                    sprite: response.inviterData.sprite
                }
            });
            // canal do que enviou o convite de pvp
            this.networking.sendToRemotePlayer(inviter, {
                action,
                battleInfo: response.battle,
                opponentPlayerMonsters: response.receiverMonsters,
                opponentData: {
                    nickname: response.receiverData.nickname,
                    sprite: response.receiverData.sprite
                }
            });

            this.mysqlQuery(
                "UPDATE `battle` SET `seen_presentation` = '1' WHERE `id` = ?",
                [data.battle[0].insertId]
            );
            next();
        });
    });
};

// pegar dados do próprio profile do player
Player.prototype.getSelfProfileData = function () {
    async.parallel([
        next => {
            new PlayerData()
                .get(this.auth.uid, next);
        },
        next => {
            this.mysqlQuery(
                "SELECT * FROM `in_game_data` WHERE `uid` = ?", 
                [this.auth.uid], 
                (err, results) => next(err, results[0])
            );
        },
        next => this.checkIfIsVip(next)

    ], (err, data) => {
        const dataMerged = { ... data[0], ... data[1], ... data[2] };
        //console.log(dataMerged);
        this.networking.send(EVENTS.SELF_PROFILE_DATA, dataMerged);
    });
};

// pegar dados do profile de outro jogador
Player.prototype.getProfileData = function (input) {
    async.parallel({
        monsters: next => {
            const species = new Species(null, this.auth, this.db);
            species.getMonstersInPocket((err, data) => {
                next(null, species.filterOtherProfileMonstersData(data));
            }, input.uid);
        },
        player_data: next => {
            this.mysqlQuery(
                "SELECT `rank` FROM `in_game_data` WHERE `uid` = ?", 
                [input.uid], 
                (err, results) => next(err, results[0])
            );
        }
    }, (err, data) => this.networking.send(EVENTS.OTHER_PROFILE_DATA, data));
};

// Skins com seu item_id para verificar no change skin
const SKINS = {
    2: "default",
    3: 16
};

// skin id no database.json do client: item id
Player.prototype.changeSkin = function (input) {

    const { sprite } = input;

    if ( !(sprite in SKINS) )
        return console.log("Skin não existe");

    const 
        item = SKINS[sprite],
        pdata = new PlayerData();

    async.waterfall([
        next => {

            // todos podem equipar a skin default
            if (item == "default") {
                next(null, true);
                console.log("É default");
                return;
            };

            this.mysqlQuery(
                "SELECT `id` FROM `items` WHERE `item_id` = ? AND `uid` = ?",
                [item, this.auth.uid],
                (err, results) => {
                    //  não tem item
                    if (!results.length)
                        return console.log("Não tem o item da skin!");

                    console.log("Pode usar item!");
                    // tem o item
                    next(null, true);

                }
            );
        },
        (nothing, next) => pdata.get(this.auth.uid, next),
        (data, next) => {
            this.networking.sendToMap(data.map, {
                dataType: 4,
                uid: this.auth.uid,
                sprite
            });

            pdata.set(this.auth.uid, {sprite});
        }
    ]);
};


// * vip

/*
tempo em m/s
30 dias = 2595600000
60 dias = 5187600000
90 dias = 7779600000
*/

// Inserir dias VIP
Player.prototype.insertVip = function (date, callback) {
    // const d = new Date(1593275923616);
    // d.toString();

    async.waterfall([
        // pegando informações sobre o vip
        next => this.checkIfIsVip(next),
        (data, next) => {

            //let new_vip_date = data.vip ? Number(data.vip_date) + date : Date.now() + date;
            let new_vip_date;
            // se já for VIP só acrescenta a ultima data do VIP
            if (data.vip) {
                new_vip_date = Number(data.vip_date) + date;
            } else {
            // se não for acrescenta a partir da data atual
                new_vip_date = Date.now() + date;
            };

            // atualiza na DB
            this.mysqlQuery(
                "UPDATE `users` SET `vip_date` = ?, `vip` = '1' WHERE `id` = ?",
                [new_vip_date, this.auth.uid],
                next
            );
        }
    ], callback);
};

// Ver se player é vip
Player.prototype.checkIfIsVip = function (callback) {
    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `vip`, `vip_date` FROM `users` WHERE `id` = ?", 
                [this.auth.uid],
                next
            );
        },
        results => {
            let data = results[0];
            // se não for VIP
            if (!data.vip) {
                callback(null, data);
            } else {
                // verificando se já acabou tempo de VIP
                if ( Date.now() >= Number(data.vip_date) ) {
                    // retira vip do player na db
                    this.mysqlQuery(
                        "UPDATE `users` SET `vip` = '0', `vip_date` = '0' WHERE `id` = ?",
                        [this.auth.uid],
                        err => callback(err, {vip: 0, vip_date: 0})
                    );

                // não acabou o tempo vip
                } else {
                    callback(null, data);
                };
            };
        }
    ]);
};

Player.prototype.autoSaveData = function () {
    const pdata = new PlayerData();

    pdata.get(this.auth.uid, (
            err, 
            { map, pos_x, pos_y, pos_facing }
        ) => {
        this.mysqlQuery(
            `UPDATE in_game_data SET 
            map = '${map}', 
            pos_x = ${pos_x}, 
            pos_y = '${pos_y}', 
            pos_facing = '${pos_facing}' WHERE uid = ?`,
            [this.auth.uid]
        );
    });

    
};

Player.prototype.fetchDataFromPersistent = async function () {
    const data = await new Promise((resolve, reject) => {
        this.mysqlQuery(
            `SELECT uid, nickname, sprite, map, pos_x, pos_y, pos_facing FROM in_game_data WHERE uid = ?`,
            [this.auth.uid],
            (err, [data]) => err ? reject(err) : resolve(data)
        )
    });
    return data;
};

module.exports = Player;

// Main classes
const
    Battle = require("./battle.js"),
    Species = require("./species.js"),
    Bag = require("./bag.js"),
    Tamer = require("./tamer.js"),
    Map = require("./map.js"),
    PlayerData = require("./playerdata.js"),
    Notify = require("./notify.js");

// SubClasses
SubClasses.Networking = require("./subclasses/networking.js");