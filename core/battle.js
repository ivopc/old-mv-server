const 
    async = require("async"),
    _ = require("underscore");

const EVENTS = require("./../database/socket_events.json");

const Base = require("./base.js");

const Battle = function (main, socket, auth, db, scServer, dataMasterEvents) {
    Base.call(this, main, socket, auth, db, scServer, dataMasterEvents);
    // this.action = new Action();
    // this.turns = new Turns();
    // this.script = new Script();
    // this.reward = new Reward();
    // this.events = new Events();
    // this.formulas = new Formulas();
    // this.netwoking = new Networking();
};

Battle.prototype = Object.create(Base.prototype);

const Resources = {
    Tamers: require("./../database/tamers.json"),
    Moves: require("./../database/newmoves.js"),
    Formulas: require("./../database/formulas.js"),
    Dex: require("./../database/dex.json"),
    Items: require("./../database/items_effect.json"),
    ItemDrop: require("./../database/item_drop.json"),
    StatChange: require("./../database/statchange.json"),
    Quests: require("../database/quests.json")
};


const math = {
    random: {}
};

math.random.between = function (num) {
    return Math.floor(Math.random() * (num[1] - num[0] + 1) + num[0]);
};

// Inserir nova batalha na database
Battle.prototype.insert = function (data, callback) {

    data = data || {};

    // se a id do player não for incluido
    if (!("uid" in data))
        return;

    // id da batalha é nulo (AUTO_INCREMENT)
    data.id = null;

    // user id
    //data.uid = data.uid;
    
    // batalha habilitada
    data.enabled = 1;

    // tipo de batalha: 1 = wild | 2 = domador | 3 = pvp | 4 = monstro indomável
    data.battle_type = data.battle_type || 1;

    // categoria do local da batalha: 
    // 1 = mato | 2 = água | 3 = lava | 4 = caverna
    data.field_category = data.field_category || 1;

    /* condições climáticas de batalha:
       0 = normal | 1 = chuva | 2 = ensolarado | 3 = tempestade de areia 
       4 = chuva de granizo
    */
    data.field_weather = data.field_weather || 0;

    data.field_special = 0;

    data.need_to_trade_fainted_monster = 0;

    data.seen_presentation = 0;

    data.challenged = data.challenged || 0;

    this.mysqlQuery("INSERT INTO `battle` SET ?", data, (err, results) => {
        // se for pvp inserir no datamaster
        if (data.battle_type == 3) {
            this.dataMasterEvents.insertBattle({
                battle_id: results.insertId
            });
        };
        callback(err, results);
    });
};

// Quando algum monstro é derrotado
Battle.prototype.fainted = function (actions, data, fainted_type, fainted_monster_data) {
    
    // vendo qual monstro morreu
    switch (fainted_type) {
        // caso for wild oponente
        case "wild": {

            async.parallel({
                // setar q n esta fazendo ação de batalha e o tipo de batalha é zero
                setCurrentDoing: next => {
                    this.mysqlQuery(
                        "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                // desabilitar monstro selvagem
                disableWild: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `enabled` = '0' WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1' AND `id` = ?",
                        [this.auth.uid, fainted_monster_data.id],
                        next
                    );
                },
                // remover batalha
                removeBattle: next => {
                    this.mysqlQuery(
                        "DELETE FROM `battle` WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                // checar se tem missão e se tiver, inserir que derrotou monstro
                checkAndInsertQuestDefeat: next => this.checkAndInsertQuestDefeat(fainted_monster_data, next)
            },
            () => {
                async.parallel({
                    // dar exp e transportar dados pro client
                    expReward: next => {
                        this.expReward(actions, data, fainted_monster_data, next);
                    },
                    // chance de dropar item
                    itemDrop: next => this.itemDrop(fainted_monster_data, next)
                }, (err, _data) => {
                    // adicionar ação de wild fainted
                    actions.postTurn.push({
                        fn_name: "fainted",
                        param: {
                            target: "wild",
                            id: fainted_monster_data.id,
                            reward: {
                                exp: _data.expReward
                            }
                        }
                    });

                    // adicionar ação de item dropado
                    for (let i = 0; i < _data.itemDrop.length; i ++)
                        actions.regular.push({
                            fn_name: "item_drop",
                            param: {
                                item: _data.itemDrop[i].item
                            }
                        });
                    
                    // enviar ao client ações
                    this.socket.emit(EVENTS.BATTLE_ACTIONS_RESPONSE, {
                        actions
                    });
                });
            });

            break;
        };

        // caso for monstro do outro domador (cpu/pc)
        case "tamer": {
            // console.log("Monstro do domador oponente faintou");
            
            // verificar se tem algum monstro vivo
            // se tiver -> troca monstro, dá exp, continua battle
            // se não tiver -> da exp, acaba batalha
            const tamer = instantiateGameCoreKlass(Tamer, this.main);

            async.waterfall([
                // pegar monstro vivo
                next => tamer.getAliveMonster(data.battle.challenged, next),
                have => {
                    // se tiver algum vivo
                    if (have > 0) {
                        async.parallel({
                            // muda monstro do domador de posição e troca para um
                            // que está 'vivo'
                            changePartyPosition: next => {
                                tamer.changePartyPosition({
                                    from: 0,
                                    to: have
                                }, data.battle.challenged, next);
                            },
                            // dá exp
                            expReward: next => {
                                this.expReward(actions, data, fainted_monster_data, next);
                            }
                        }, (err, data) => {
                            // add as ações
                            actions.postTurn.push({
                                fn_name: "fainted",
                                param: {
                                    target: "opponent",
                                    id: fainted_monster_data.id,
                                    reward: {
                                        exp: data.expReward
                                    },
                                    changed: have,
                                    battleEnded: false
                                }
                            });

                            // enviar ao client ações
                            this.socket.emit(EVENTS.BATTLE_ACTIONS_RESPONSE, {
                                actions
                            });
                        });

                    // se não tiver
                    } else {
                        // console.log("Não tem mais monstros sobrando");
                        // current doing, remove in party, remove battle, disable monster
                        // exp reward

                        async.parallel({
                            setCurrentDoing: next => {
                                this.mysqlQuery(
                                    "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                                    [this.auth.uid],
                                    next
                                );
                            },
                            removeParty: next => {
                                this.mysqlQuery(
                                    "DELETE FROM `tamer_bot_monsters_in_pocket` WHERE `uid` = ?",
                                    [this.auth.uid],
                                    next
                                );
                            },
                            removeBattle: next => {
                                this.mysqlQuery(
                                    "DELETE FROM `battle` WHERE `uid` = ?",
                                    [this.auth.uid],
                                    next
                                );
                            },
                            disableInPartyMonsters: next => {
                                this.mysqlQuery(
                                    "UPDATE `monsters` SET `enabled` = '0' WHERE `type` = '2' AND `uid` = ? AND `enabled` = '1'",
                                    [this.auth.uid],
                                    next
                                );
                            },
                            expReward: next => {
                                this.expReward(actions, data, fainted_monster_data, next);
                            },
                            coinReward: next => {
                                this.coinReward(data, fainted_monster_data, next);
                            }
                        }, (err, data) => {
                         // add as ações
                            actions.postTurn.push({
                                fn_name: "fainted",
                                param: {
                                    target: "opponent",
                                    id: fainted_monster_data.id,
                                    reward: {
                                        exp: data.expReward,
                                        coin: data.coinReward
                                    },
                                    battleEnded: true
                                }
                            });

                            // enviar ao client ações
                            this.socket.emit(EVENTS.BATTLE_ACTIONS_RESPONSE, {
                                actions
                            });
                        });
                    };
                }
            ]);
            break;
        };

        // caso for o jogador
        case "player": {
            async.waterfall([
                next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .getAliveMonster(next);
                },
                have => {
                    // se tem monstro vivo
                    if (have > 0) {
                        
                        // adicionando ação regular que o monstro do jogador está fora de batalha
                        actions.postTurn.push({
                            fn_name: "fainted",
                            param: {
                                target: "player",
                                id: fainted_monster_data.id
                            }
                        });

                        async.series([
                            next => {
                                // atualizando na db que precisa trocar
                                this.mysqlQuery(
                                    "UPDATE `battle` SET `need_to_trade_fainted_monster` = '1' WHERE `uid` = ?",
                                    [this.auth.uid],
                                    next
                                );
                            },
                            next => {
                                // envia para o client
                                this.socket.emit(EVENTS.BATTLE_ACTIONS_RESPONSE, {
                                    actions
                                });
                            }
                        ]);
                    } else {
                        // se não tem um monstro 'vivo'
                        data.battle_info = data.battle;
                        // console.log("AKI SEU FDP", data.battle_info);
                        this.onPlayerLose(actions, data, fainted_monster_data);
                    };
                }
            ]);

            break;
        };

        // caso for no pvp
        case "pvp": {

            /// manda pro datamaster
            this.dataMasterEvents.insertFaintedMonster({
                battle_id: data.battle_info.id,
                fainted: [
                    {uid: fainted_monster_data.uid}
                ]
            });

            async.waterfall([
                next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .getAliveMonster(next, fainted_monster_data.uid);
                },
                have => {
                    // se tem monstro vivo
                    if (have > 0) {
                        // adicionando ação regular que o monstro do jogador está fora de batalha
                        actions.postTurn.push({
                            fn_name: "fainted",
                            param: {
                                target: fainted_monster_data.owner,
                                id: fainted_monster_data.id
                            }
                        });

                        // publica que monstro faintou
                        this.scServer.exchange.publish("p" + data.battle_info.id, {
                            type: 0,
                            actions
                        });
                    } else {
                        // quando player perde
                        this.onPlayerLose(actions, data, fainted_monster_data);
                    };
                }
            ])

            break;
        };

        // caso for os monstros dos 2 players q morreram
        case "pvpall": {
            // console.log("Os dois foram defeatados");
            //// console.log(fainted_monster_data);

            /// manda pro datamaster para ambos mudarem de monstro
            this.dataMasterEvents.insertFaintedMonster({
                battle_id: data.battle_info.id,
                fainted: [
                    {uid: fainted_monster_data[0].uid},
                    {uid: fainted_monster_data[1].uid}
                ]
            });

            // pega monstro do inviter e receiver
            const
                inviter = fainted_monster_data.find(monster => monster.uid == data.battle_info.uid),
                receiver = fainted_monster_data.find(monster => monster.uid == data.battle_info.challenged);

            const species = new Species(this.main, null, {uid: null}, this.db);

            // vê se tem monstro vivos do inviter e receiver
            async.parallel({
                aliveInviterMonsters: next => {
                    species.getAliveMonster(next, data.battle_info.uid);
                },
                aliveReceiverMonsters: next => {
                    species.getAliveMonster(next, data.battle_info.challenged);
                }
            }, (err, _data) => {
                //// console.log(_data);
                // quando os dois tem monstros vivos
                if (_data.aliveInviterMonsters > 0 && _data.aliveReceiverMonsters > 0) {

                    // console.log("Os dois tem monstros vivos");
                    // ambos morreram
                    actions.postTurn.push({
                        fn_name: "fainted",
                        param: {
                            target: "both",
                            id: "both"
                        }
                    });

                    // publica que monstro faintou
                    this.scServer.exchange.publish("p" + data.battle_info.id, {
                        type: 0,
                        actions
                    });
                    return;

                };

                // os dois não tem nenhum vivo, então é empate
                if (_data.aliveInviterMonsters < 0 && _data.aliveReceiverMonsters < 0) {

                    // console.log("Empate");
                    this.onDraw(actions, data);
                    return;
                };

                // inviter perdeu não tem mais monstros vivos
                if (_data.aliveInviterMonsters < 0)
                    this.onPlayerLose(actions, data, inviter);

                // receiver perdeu, não tem mais monstros vivos
                if (_data.aliveReceiverMonsters < 0)
                    this.onPlayerLose(actions, data, receiver);
            });
            break;
        };
    };
};

// Quando o jogador perde a batalha
Battle.prototype.onPlayerLose = function (actions, data, fainted_monster_data) {

    switch (data.battle_info.battle_type) {
        // wild
        case 1: {
            async.parallel({
                // setar q n esta fazendo ação de batalha e o tipo de batalha é 0
                setCurrentDoing: next => {
                    this.mysqlQuery(
                        "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                // desabilitar monstro selvagem
                disableWild: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `enabled` = '0' WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1'",
                        [this.auth.uid],
                        next
                    );
                },
                // remover batalha
                removeBattle: next => {
                    this.mysqlQuery(
                        "DELETE FROM `battle` WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                // teletransportar para healing place
                teleportToHealingPlace: next => {
                    instantiateGameCoreKlass(Map, this.main)
                        .teleportToHealingPlace(next);
                },
                // healar monstros do player
                healPlayerMonsters: next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .healAllPlayerMonsters(next);
                }
            }, (err, _data) => {
                // adicionando ação regular que o monstro do jogador está fora
                // de batalha e também a batalha acabou
                actions.postTurn.push({
                    fn_name: "fainted",
                    param: {
                        target: "player",
                        id: fainted_monster_data.id,
                        battleEnded: true
                    }
                });

                // envia para o client
                this.socket.emit(EVENTS.BATTLE_ACTIONS_RESPONSE, {
                    actions
                });
            });
            break;
        };
        // tamer
        case 2: {
            // current doing, remove in party, remove battle, disable monster, 
            // teleport to healing place map, heal monsters
            async.parallel({
                setCurrentDoing: next => {
                    this.mysqlQuery(
                        "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                removeParty: next => {
                    this.mysqlQuery(
                        "DELETE FROM `tamer_bot_monsters_in_pocket` WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                removeBattle: next => {
                    this.mysqlQuery(
                        "DELETE FROM `battle` WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                disableInPartyMonsters: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `enabled` = '0' WHERE `type` = '2' AND `uid` = ? AND `enabled` = '1'",
                        [this.auth.uid],
                        next
                    );
                },
                // teletransportar para healing place
                teleportToHealingPlace: next => {
                    instantiateGameCoreKlass(Map, this.main)
                        .teleportToHealingPlace(next);
                },
                // healar monstros do player
                healPlayerMonsters: next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .healAllPlayerMonsters(next);
                }
            }, (err, _data) => {

                // adicionando ação regular que o monstro do jogador está fora de batalha
                // e também a batalha acabou
                actions.postTurn.push({
                    fn_name: "fainted",
                    param: {
                        target: "player",
                        id: fainted_monster_data.id,
                        battleEnded: true
                    }
                });

                // envia para o client
                this.socket.emit(EVENTS.BATTLE_ACTIONS_RESPONSE, {
                    actions
                });
            });
            break;
        };
        // pvp
        case 3: {
            async.parallel({
                setCurrentDoingInviter: next => {
                    this.mysqlQuery(
                        "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                        [data.battle_info.uid],
                        next
                    );
                },
                setCurrentDoingReceiver: next => {
                    this.mysqlQuery(
                        "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                        [data.battle_info.challenged],
                        next
                    );
                },
                removeBattle: next => {
                    this.mysqlQuery(
                        "DELETE FROM `battle` WHERE `uid` = ?",
                        [data.battle_info.uid],
                        next
                    );
                },
                // teletransportar perdedor para healing place
                teleportLoserToHealingPlace: next => {
                    instantiateGameCoreKlass(Map, this.main)
                        .teleportToHealingPlace(next, fainted_monster_data.uid);
                },
                // healar monstros do player que foi derrotado
                healLoserPlayerMonsters: next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .healAllPlayerMonsters(next, fainted_monster_data.uid);
                }
            }, (err, _data) => {
                // console.log("----------------------------------");
                // console.log("Termimonou a batalha here");

                // adicionando ação regular que o monstro do jogador está fora
                // de batalha e também a batalha acabou
                actions.postTurn.push({
                    fn_name: "fainted",
                    param: {
                        target: fainted_monster_data.owner,
                        id: fainted_monster_data.id,
                        battleEnded: true
                    }
                });

                // envia para os client
                this.scServer.exchange.publish("p" + data.battle_info.id, {
                    type: 0,
                    actions
                });
            });
            break;
        };
    };
};

// Quando há empate
Battle.prototype.onDraw = function (actions, data) {
    switch (data.battle_info.battle_type) {
        // pvp
        case 3: {
           async.parallel({
                setCurrentDoingInviter: next => {
                    this.mysqlQuery(
                        "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                        [data.battle_info.uid],
                        next
                    );
                },
                setCurrentDoingReceiver: next => {
                    this.mysqlQuery(
                        "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                        [data.battle_info.challenged],
                        next
                    );
                },
                removeBattle: next => {
                    this.mysqlQuery(
                        "DELETE FROM `battle` WHERE `uid` = ?",
                        [data.battle_info.uid],
                        next
                    );
                },
                // teletransportar inviter para healing place
                teleportInviterToHealingPlace: next => {
                    instantiateGameCoreKlass(Map, this.main)
                        .teleportToHealingPlace(next, data.battle_info.uid);
                },
                // healar monstros do inviter
                healInviterPlayerMonsters: next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .healAllPlayerMonsters(next, data.battle_info.uid);
                },
                // teletransportar receiver para healing place
                teleportReceiverToHealingPlace: next => {
                    instantiateGameCoreKlass(Map, this.main)
                        .teleportToHealingPlace(next, data.battle_info.challenged);
                },
                // healar monstros do inviter
                healReceiverPlayerMonsters: next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .healAllPlayerMonsters(next, data.battle_info.challenged);
                }
            }, (err, _data) => {
                // console.log("----------------------------------");
                // console.log("Termimonou a batalha here");

                // adicionando ação regular que o monstro do jogador está fora
                // de batalha e também a batalha acabou
                actions.postTurn.push({
                    fn_name: "fainted",
                    param: {
                        target: "both",
                        id: null,
                        battleEnded: true
                    }
                });

                // envia para os client
                this.scServer.exchange.publish("p" + data.battle_info.id, {
                    type: 0,
                    actions
                });
            });
            break;
        };
    };
}; 

// Checar se monstro está na quest
Battle.prototype.checkAndInsertQuestDefeat = function (monster_data, callback) {

    const 
        quest = instantiateGameCoreKlass(Quest, this.main),
        insert = [];

    // console.log("Entrou no método quest defeat");

    async.waterfall([
        next => {
            // checar se tem quests
            quest.checkIfHaveQuests((err, have) => {

                // console.log("Tem quests?", have ? "Sim" : "Não");

                if (have)
                    next(null, true);
                else
                    callback(null, false);
            });
        },
        // pegar lista de quests de forma crua
        (nothing, next) => quest.getListRaw(next),
        (data, next) => {
            // console.log("Dados das quests", data);
            // checar se monstro está nos requisitos
            for (let i = 0; i < data.length; i ++) {
                const action = quest.checkIfMonsterIsInRequisits(
                    data[i].quest_id,
                    monster_data.monsterpedia_id
                );
                // add para inserir na db
                if (action && action.type == "defeat")
                    insert.push({
                        action_type: 1,
                        quest_id: data[i].quest_id, 
                        monsterpedia_id: monster_data.monsterpedia_id
                    });

                next(null, true);

            };
        },
        (nothing, next) => quest.insertQuestAction(insert, next),
        () => callback(null, true)
    ]);
};

// Dar recompensa de EXP
Battle.prototype.expReward = function (actions, data, fainted_monster_data, callback) {

    // console.log("========================================================");
    // exp q o monstro ganhou
    let exp_reward = Resources.Formulas.Exp.Calc.battleExpReward({
        battle: {
            trainerOrWild: 1,
            isHoldingLuckyEgg: 1
        },
        number: 1,
        opponent: {
            // level
            level: fainted_monster_data.level,
            // exp base
            expbase: Resources.Dex[fainted_monster_data.monsterpedia_id].expbase
        }
    });

    async.waterfall([
        // pegar todos os monstros que participaram da batalha
        next => {
            this.mysqlQuery(
                "SELECT `monster_id` FROM `battle_exp_share` WHERE `battle_id` = ?",
                [data.battle.id],
                (err, data) => next(err, data)
            );
        },
        // dar EXP a eles
        (results, next) => {
            // console.log(results);
            // quando somente há um único monstro
            if (!results.length || results.length === 1) {
                // console.log("SÓ TEM UM");
                this.giveExpRaw(
                    exp_reward,
                    this.getFirstPlayerMonsterAlive(data.playerMonsters),
                    fainted_monster_data,
                    callback
                );

            // quando há mais de um monstro que recebeu o xp
            } else {
                // reparte todo exp pelos monstros q participaram da luta
                const reward = Math.floor(exp_reward / results.length);
                // percorre resultados e pega e adiciona exp dividida
                const fns = results.map(monster => cb => {
                    this.giveExpRaw(
                        reward,
                        this.getInPartyMonsterDataById(monster.monster_id, data.playerMonsters),
                        fainted_monster_data,
                        cb
                    );
                });
                // pega id dos monstros e joga numa array pra enviar pro client
                const monsters = results.map(monster => monster.monster_id);
                
                // executa
                async.parallel(fns, err => callback(err, {reward, monsters}));
            };
        }
    ]);
};

// Dar EXP (de forma crua) -- função complementar a `expReward`
Battle.prototype.giveExpRaw = function (exp_reward, playerMonster, fainted_monster_data, callback) {
    // dados de upgrade ao monstro
    let total_exp = exp_reward + playerMonster.experience,
        new_level = Resources.Formulas.Exp.Calc.exp2Level(total_exp),
        specie = Resources.Dex[playerMonster.monsterpedia_id],
        specie_evo = Resources.Dex[specie.evos.default] ? Resources.Dex[specie.evos.default] : null,
        evo_level = specie.evoLevel ? specie.evoLevel : null,
        evolved = evo_level != null ? new_level >= evo_level : false;

    // console.log("total EXP ANTES", {total_exp});
    // console.log("FUUUUUUUUCK", {new_level, current: playerMonster.level});

    //// console.log("exp", exp_reward, "new_level", new_level);

    async.waterfall([
        // checar se player é vip para duplicar o EXP
        next => {
            instantiateGameCoreKlass(Player, this.main)
                .checkIfIsVip(next);
        },
        (isVip, next) => {
            // console.log("------------------------------------");
            // console.log(isVip.vip ? "É VIP sim." : "Não é VIP.");

            
            if (isVip.vip) {
                // se for vip multiplica a exp ganha dele por 2
                exp_reward *= 2;

                // ajustaR o resto
                total_exp = exp_reward + playerMonster.experience;
                new_level = Resources.Formulas.Exp.Calc.exp2Level(total_exp);
                evolved = evo_level != null ? new_level >= evo_level : false;
                // console.log("TOTAL EXP DEPOIS", {total_exp, new_level});
            };

            // adiciona exp, drop points, muda stats, aprender move, evoluir
            instantiateGameCoreKlass(Species, this.main)
                .addExpRewards({
                    isVip,
                    id: playerMonster.id,
                    moves: [playerMonster.move_0, playerMonster.move_1, playerMonster.move_2, playerMonster.move_3],
                    exp: total_exp,
                    evolved,
                    opponent: fainted_monster_data.monsterpedia_id,
                    specie: {
                        current: specie,
                        evo: specie_evo
                    },
                    level: {
                        new: new_level,
                        current: playerMonster.level
                    },
                    stats: {
                        dp: {
                            hp: playerMonster.dp_HP,
                            atk: playerMonster.dp_attack,
                            def: playerMonster.dp_defense,
                            spe: playerMonster.dp_speed
                        },
                        sp: {
                            hp: playerMonster.sp_HP,
                            atk: playerMonster.sp_attack,
                            def: playerMonster.sp_defense,
                            spe: playerMonster.sp_speed
                        },
                        vita: {
                            hp: playerMonster.vita_HP,
                            atk: playerMonster.vita_attack,
                            def: playerMonster.vita_defense,
                            spe: playerMonster.vita_speed
                        }
                    }
                },
                    // adiciona exp reward p/ enviar p/ client
                    err => callback(err, {reward: exp_reward, monsters: [playerMonster.id]})
                );
        }
    ]);
};

// Adicionar recompensa de EXP ao monstro 
Battle.prototype.addExpShareToMonster = function (monster, battle_id, callback) {
    async.waterfall([
        // checando se já está na db de exp share
        next => {
            this.mysqlQuery(
                "SELECT `id` FROM `battle_exp_share` WHERE `battle_id` = ? AND `monster_id` = ?",
                [battle_id, monster.id],
                (err, results) => next(err, results.length > 0)
            );
        },
        // se já foi adicionado apenas da callback de ok, se não add à exp share
        (alredyHaveExpShare, next) => {
            if (alredyHaveExpShare) {
                next(null, true);
            } else {
                this.mysqlQuery("INSERT INTO `battle_exp_share` SET ?", {
                    id: null,
                    uid: this.auth.uid,
                    battle_id,
                    monster_id: monster.id
                }, next);
            };
        }
    ], (err, data) => {
        // console.log(err, data);
        callback(err, true);
    });
};

// Remover recompensa de EXP do monstro que faintou
Battle.prototype.removeExpShareToMonster = function (monster, battle_id, callback) {
    this.mysqlQuery(
        "DELETE FROM `battle_exp_share` WHERE `battle_id` = ? AND `monster_id` = ?",
        [battle_id, monster.id],
        callback
    );
};

// Dar recompensa de silver (só contra outro domador CPU/bot)
Battle.prototype.coinReward = function (data, fainted_monster_data, callback) {
    
    const tamer_id = data.challenged;

    let reward = 50 * fainted_monster_data.level;

    async.waterfall([
        next => {
            instantiateGameCoreKlass(Player, this.main)
                .checkIfIsVip(next);
        },
        isVip => {

            if (isVip.vip)
                reward *= 2;

            this.mysqlQuery(
                "UPDATE `in_game_data` SET `silver` = `silver` + '" + reward + "' WHERE `uid` = ?",
                [this.auth.uid],
                err => callback(err, reward)
            );
        }
    ]);
};

// Drop de item após vencer a batalha com monstro selvagem
Battle.prototype.itemDrop = function (fainted_monster_data, callback) {
    
    const 
        monster_rarity = Resources.Dex[fainted_monster_data.monsterpedia_id].rarity,
        items = Resources.ItemDrop[monster_rarity],
        sorted_item = items[Math.floor(Math.random() * items.length)],
        rate = math.random.between([0, 100]);

    // setar flag pra ver se pegou item e ações
    let geted = false,
        actions = [];

    // define se pegou o item ou não baseado em sua raridade
    switch (monster_rarity) {
        case "common": {
            // 40%
            geted = rate <= 40;
            break;
        };
        case "uncommon": {
            // 60%
            geted = rate <= 60;
            break;
        };
        case "rare": {
            // 85%
            geted = rate <= 85;
            break;
        };
        case "rare2": {
            // 100%
            geted = true;
            break;
        };
    };

    async.parallel([
        next => {
            if (geted) {

                // console.log(`Pegou item de drop! com ${rate}%`);

                actions.push({
                    item: sorted_item
                });

                instantiateGameCoreKlass(Bag, this.main)
                    .insertItem(null, sorted_item, 1, () => next(null, null));
            } else {
                // console.log(`Não pegou item de drop! tem ${rate}%`);
                next(null, null);
            };
        },
        next => {

            if (fainted_monster_data.monsterpedia_id in Resources.ItemDrop) {
                let _rate = math.random.between([0, 100]),
                    _geted = _rate <= 50;

                if (_geted) {

                    // console.log(`Pegou item do monstro! ${_rate}%`);

                    let _items = Resources.ItemDrop[fainted_monster_data.monsterpedia_id],
                        _sorted_item = _items[Math.floor(Math.random() * _items.length)];

                    actions.push({
                        item: _sorted_item
                    });

                    instantiateGameCoreKlass(Bag, this.main)
                        .insertItem(null, _sorted_item, 1, () => next(null, null));
                } else {
                    // console.log(`Não pegou item do monstro! ${_rate}%`);
                    next(null, null);
                };

            } else {
                next(null, null);
            };
        }
    ], (err, data) => {
        // console.log("ações", actions);
        callback(err, actions);
    });
};

// Iniciar controle de ação do jogador
Battle.prototype.initHandleAction = function (input) {

    console.log("initHandleAction", input);

    let battle_type,
        if_is_pvp_battle_id;

    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `battle_type`, `doing_battle_action`, `if_is_pvp_battle_id` FROM `current_doing` WHERE `uid` = ?",
                [this.auth.uid],
                (err, results) => {
                    console.log("aab", results[0]);
                    // se o jogador já está fazendo alguma ação de batalha, 
                    //ele não pode fazer duas ao mesmo tempo
                    if (+results[0].doing_battle_action > 0) {
                        return;
                    };

                    battle_type = +results[0].battle_type;

                    if (battle_type == 3)
                        if_is_pvp_battle_id = results[0].if_is_pvp_battle_id;

                    next(err, results);
                }
            );
        }, (results, next) => {
            console.log("initHandleAction2");
            // setar q está fazendo uma ação de batalha
            this.mysqlQuery(
                "UPDATE `current_doing` SET `doing_battle_action` = '0' WHERE `uid` = ?",
                [this.auth.uid],
                next
            );
        }, (results, next) => {
            if (battle_type !== 3) {
                // pegar infos da batalha (monstros do jogador, tamer/wild monstros, infos batalha)
                this.getAllBattleInfo(
                    battle_type,
                    if_is_pvp_battle_id,
                    next
                );
            } else {
                this.handlePvPInput(input, if_is_pvp_battle_id);
            };
        }, 
        // manipular ação
        data => {
            console.log("haha fdpt", data);
            this.handleAction(input, data);
        } 

    ]);
};

// Controlar ação do jogador
Battle.prototype.handleAction = function (input, data) {
    console.log(input, data, "handleAction");
    switch (data.battle.battle_type) {

        // vs wild
        case 1: {
            this.handleActionVsWild(
                input, 
                data
            );
            break;
        };

        // vs domador
        case 2: {
            this.handleActionVsTamer(
                input,
                data
            );
            break;
        };

        // pvp
        case 3: {
            // console.log("VSF CRL!", input, data);
            break;
        };
    }
};

/*
============================
            <PvP>
============================
*/
Battle.prototype.handlePvPInput = function (input, battle_id) {

    // vendo se é alguma ação proibida
    if (["run", "item"].includes(input.action)) {
        this.socket.emit(EVENTS.BATTLE_ERROR_DATA, {error: 1});
        return;
    };

    console.log({
        action: input.action,
        param: input.param,
        battle_id,
        uid: this.auth.uid
    });

    // publicar para o datamaster
    this.dataMasterEvents.chooseBattleAction({
        action: input.action,
        param: input.param,
        battle_id,
        uid: this.auth.uid
    });
};

Battle.prototype.preHandleActionPvP = function (input) {
    this.getAllBattleInfo(3, input.battle_id, (err, data) =>
        this.handleActionPvP(input.actions, data)
    );
};

// Controlar ação dos jogadores no PvP
Battle.prototype.handleActionPvP = function (input, data) {

    // identificando quem é quem: o que cada um escolheu nas inputs
    // I am = o ultimo que escolheu o move 
    // Other is = primeiro q escolher o move
    const
        iAm = data.battle_info.uid == input[0].uid ? {name: "inviter", uid: input[0].uid} : {name: "receiver", uid: input[0].uid},
        otherIs = iAm.name == "inviter" ? {name: "receiver", uid: input[1].uid} : {name: "inviter", uid: input[1].uid};

    this.iAm = iAm;
    this.otherIs = otherIs;

    // listar todas as ações que ocorrem na batalha
    const actions = {
        preTurn: [],
        regular: [],
        postTurn: []
    },
    // ação dos jogadores
        action = {},
        monster = {};

    monster[iAm.name] = this.getFirstPlayerMonsterAlive(data[iAm.name]);
    monster[otherIs.name] = this.getFirstPlayerMonsterAlive(data[otherIs.name]);

    this.monster = monster;

    this.monster.inviter.owner = "inviter";
    this.monster.receiver.owner = "receiver";

    // buffs e nerfs da batalha
    const buffs_nerfs = this.treatBuffNerfPvP({
        [iAm.name]: {
            id: monster[iAm.name].id,
            owner: iAm.name
        },
        [otherIs.name]: {
            id: monster[otherIs.name].id,
            owner: otherIs.name
        },
    }, data.buffs_nerfs);

    // * Tratando ações dos players, começando por 'I Am'
    action[iAm.name] = this.treatPvPAction(
        input,
        _.findIndex(input, {uid: iAm.uid}),
        data,
        buffs_nerfs,
        iAm.name
    );

    // quem está fazendo o move
    action[iAm.name].id = iAm.name;

    // quem vai atacar
    action[iAm.name].target = {
        data: monster[otherIs.name],
        name: otherIs.name
    };

    // ** Checar se tem algum Status Problem
    if (monster[iAm.name].status_problem > 0)
        this.handleStatusProblem(monster[iAm.name], action[iAm.name], actions);

    // vendo ação do player
    switch (action[iAm.name].fn_name) {

        // checando se é move de dano
        case "move_damage": {

            let move_id = action[iAm.name].param.move_id,
                mana = Resources.Moves[move_id].manaNeeded;

            if (mana) {
                if (monster[iAm.name].current_MP - mana < 0) {
                    // se não tiver mana suficiente da erro expulsa
                    this.socket.emit(EVENTS.BATTLE_ERROR_DATA, {error: 3});
                    return;
                } else {
                    // desconta mana
                    monster[iAm.name].current_MP -= mana;
                };
            };
            break;
        };

        case "status_problem": {
            break;
        };

        // checando se jogador quer mudar de monstro    
        case "change_monster": {
            // console.log("Mudou para: ", action[iAm.name]);
            // criando novo objeto dos monstros do jogador
            let new_order = _.clone(data[iAm.name]);
            // fazendo a troca de monstro no objeto
            data[iAm.name].monster0 = new_order["monster" + action[iAm.name].param.index];
            data[iAm.name]["monster" + action[iAm.name].param.index] = new_order.monster0;
            // att. do objeto
            monster[iAm.name] = data[iAm.name].monster0;
            data[iAm.name].index = 0;

            // modificando buff/nerf do monstro (já que trocou)
            buffs_nerfs[iAm.name] = this.recalcBuffNerf(monster[iAm.name].id, data.buffs_nerfs);
            break;
        };
    };

    // Tratando ações dos players, terminando por 'Other is'
    action[otherIs.name] = this.treatPvPAction(
        input,
        _.findIndex(input, {uid: otherIs.uid}),
        data,
        buffs_nerfs,
        otherIs.name
    );
    // quem está fazendo o move
    action[otherIs.name].id = otherIs.name;

    // quem vai atacar
    action[otherIs.name].target = {
        data: monster[iAm.name],
        name: iAm.name
    };

    // ** Checar se tem algum Status Problem
    if (monster[otherIs.name].status_problem > 0)
        this.handleStatusProblem(monster[otherIs.name], action[otherIs.name], actions);

    // vendo ação do player
    switch (action[otherIs.name].fn_name) {

        // checando se é move de dano
        case "move_damage": {

            let move_id = action[otherIs.name].param.move_id,
                mana = Resources.Moves[move_id].manaNeeded;

            if (mana) {
                if (monster[otherIs.name].current_MP - mana < 0) {
                    // se não tiver mana suficiente da erro expulsa
                    this.socket.emit(EVENTS.BATTLE_ERROR_DATA, {error: 3});
                    return;
                } else {
                    // desconta mana
                    monster[otherIs.name].current_MP -= mana;
                };
            };
            break;
        };

        case "status_problem": {
            break;
        };

        // checando se jogador quer mudar de monstro    
        case "change_monster": {
            // console.log("Mudou para: ", action[otherIs.name]);
            // criando novo objeto dos monstros do jogador
            let new_order = _.clone(data[otherIs.name]);
            // fazendo a troca de monstro no objeto
            data[otherIs.name].monster0 = new_order["monster" + action[otherIs.name].param.index];
            data[otherIs.name]["monster" + action[otherIs.name].param.index] = new_order.monster0;
            // att. do objeto
            monster[otherIs.name] = data[otherIs.name].monster0;
            data[otherIs.name].index = 0;
            // modificando buff/nerf do monstro (já que trocou)
            buffs_nerfs[otherIs.name] = this.recalcBuffNerf(monster[otherIs.name].id, data.buffs_nerfs);
            break;
        };
    };

    // console.log("----------------------------------------------");
    // console.log("BUFF E DEBUFS PVP");
    // console.log(buffs_nerfs);

    // if e else if para verificar se um dos players trocaram de monstro
    if (action[iAm.name].fn_name == "change_monster" && action[otherIs.name].fn_name == "change_monster") {
        actions.preTurn.push(action[iAm.name]);
        actions.preTurn.push(action[otherIs.name]);
    } else if (action[iAm.name].fn_name == "change_monster") {
        actions.preTurn.push(action[iAm.name]);
        actions.regular.push(action[otherIs.name]);
    } else if (action[otherIs.name].fn_name == "change_monster") {
        actions.preTurn.push(action[otherIs.name]);
        actions.regular.push(action[iAm.name]);
    } else {
        // se os dois escolheram moves regulares
        // console.log("-----------------------------------------");
        // console.log("BUFF DEBUF DO SPEED");
        // console.log(buffs_nerfs[iAm.name].spe);
        // console.log(Resources.StatChange.stats[buffs_nerfs[iAm.name].spe], Resources.StatChange.stats[buffs_nerfs[otherIs.name].spe]);
         // checando qual é mais rápido, e listando as ações seguindo a ordem
        if (monster[iAm.name].stats_speed * Resources.StatChange.stats[buffs_nerfs[iAm.name].spe] > monster[otherIs.name].stats_speed * Resources.StatChange.stats[buffs_nerfs[otherIs.name].spe]) {
            // se for mais rápido
            actions.regular.push(action[iAm.name]);
            actions.regular.push(action[otherIs.name]);
        } else if (monster[iAm.name].stats_speed == monster[otherIs.name].stats_speed) {
            // se velocidade for igual, escolhe random
            // randomiza ordem de quem vai atacar
            let random = _.shuffle([iAm.name, otherIs.name]);

            actions.regular.push(action[random[0]]);
            actions.regular.push(action[random[1]]);
        } else {
            // se for mais lento
            actions.regular.push(action[otherIs.name]);
            actions.regular.push(action[iAm.name]);
        };
    };

    // ** Modificadores

    // caso o monstro do player for o primeiro a atacar e ele escolheu status problem
    if (
        action[iAm.name].fn_name == "status_problem" && 
        actions.regular.findIndex(action => action.param.attacker_id == monster[iAm.name].id) == 0 &&
        action[iAm.name].param.canDoMove &&
        action[iAm.name].param.hited
        ) {
        monster[otherIs.name].status_problem = action[iAm.name].param.stat;
        this.handleStatusProblem(monster[otherIs.name], action[otherIs.name], actions);
    };

    if (
        action[otherIs.name].fn_name == "status_problem" && 
        actions.regular.findIndex(action => action.param.attacker_id == monster[otherIs.name].id) == 0 &&
        action[otherIs.name].param.canDoMove &&
        action[otherIs.name].param.hited
        ) {
        monster[iAm.name].status_problem = action[otherIs.name].param.stat;
        this.handleStatusProblem(monster[iAm.name], action[iAm.name], actions);
    };

    // se o primeiro a escolher a ação for de dano, se hitou e se pode fazer o move
    if (actions.regular[0].fn_name == "move_damage" && actions.regular[0].param.hited && actions.regular[0].param.canDoMove) {
        // se o hp do primeiro monstro atigindo for igual a zero
        // remove o dano do que atacou em segundo
        if (actions.regular[0].param.hp <= 0) {
            //// console.log("matou o " + actions.regular[0].target.name + " !!!");
            delete actions.regular[1];
        };
    };

    // ** Aplicar ações
    async.series([
        // preturn
        next => {
            let script = new BattleScript(this, data.battle_info.id);
            script.codeParser(actions.preTurn);
            script.exec(next);
        }, 
        // regular
        next => {
            let script = new BattleScript(this, data.battle_info.id);
            script.codeParser(actions.regular);
            script.exec(next);
        },
        //post turn
        next => {
            let script = new BattleScript(this, data.battle_info.id);
            script.codeParser(actions.postTurn);
            script.exec(next);
        }
    ], () => {
        // pegar dados da batalha atualizado
        this.getAllBattleInfo(3, data.battle_info.id, (err, response) => {

            // ir pra próximo turno
            this.nextTurnPvP(
                actions,
                response
            );
        });
    });
};

// Tratar ação/input do jogador
Battle.prototype.treatPvPAction = function (input, index, data, buffs_nerfs, whoIs) {

    let action;

    // definindo oponente
    const opponent = whoIs == "inviter" ? "receiver" : "inviter";

    // console.log("-----------------------------------------------------------");
    // console.log(whoIs, buffs_nerfs[whoIs], opponent, buffs_nerfs[opponent]);

    //// console.log("PQP FDP! LOOL", opponent);

    //// console.log("inputs do jogador", input);
    switch (input[index].action) {
        case "move": {
            action = this.handleMove(
                // move
                Resources.Moves[this.monster[whoIs]["move_" + input[index].param]],
                // attacker = monstro atual do jogador
                this.monster[whoIs],
                // target = monstro do outro jogador
                this.monster[opponent],
                // buffs e nerfs
                {
                    attacker: buffs_nerfs[whoIs],
                    target: buffs_nerfs[opponent]
                }
            );
            break;
        };

        // caso tente fugir
        case "run": {
            return;
            action = this.handleRun(
                this.player.monster,
                data.wildMonster
            );
            break;
        };

        // caso escolheu um item
        case "item": {
            return;
            action = this.handleItem(
                input[index].param.item,
                data.playerMonsters["monster" + input[index].param.monster]
            );
            break;
        };

        // caso tente mudar o monstro
        case "change": {
            action = {
                fn_name: "change_monster",
                param: {
                    index: input[index].param,
                    uid: this.monster[whoIs].uid
                }
            };
            break;
        };
    };

    return action;
};

// Próximo turno
Battle.prototype.nextTurnPvP = function (actions, data) {

    //// console.log("p" + data.battle_info.id);

    console.log("ações do turno", actions);

    // quando os monstros de ambos desmaiam
    if (data[this.iAm.name]["monster0"].current_HP <= 0 && data[this.otherIs.name]["monster0"].current_HP <= 0) {
        this.fainted(
            actions, 
            data, 
            "pvpall",
            [data[this.iAm.name]["monster0"], data[this.otherIs.name]["monster0"]]
        );
        return;
    };

    data[this.iAm.name]["monster0"].owner = this.iAm.name;
    data[this.otherIs.name]["monster0"].owner = this.otherIs.name;

    // quando só do I Am
    if (data[this.iAm.name]["monster0"].current_HP <= 0) {

        this.fainted(
            actions, 
            data, 
            "pvp",
            data[this.iAm.name]["monster0"]
        );
        return;
    };

    // quando só do Other Is
    if (data[this.otherIs.name]["monster0"].current_HP <= 0) {
        this.fainted(
            actions, 
            data, 
            "pvp",
            data[this.otherIs.name]["monster0"]
        );
        return;
    };

    // se ngm desmaiou, prossegue
    this.scServer.exchange.publish("p" + data.battle_info.id, {
        type: 0,
        actions
    });
};

// Requisitar Troca de monstro que está desmaiado (PvP)
Battle.prototype.requestChangeFaintedMonsterPvP = function (input) {
    
    const monsterPartyIndex = input.id;

    let battle_id, iAm;
    
    async.waterfall([
        // pegar dados necessários para pegar infos da batalha
        next => {
            this.mysqlQuery(
                "SELECT `battle_type`, `doing_battle_action`, `if_is_pvp_battle_id` FROM `current_doing` WHERE `uid` = ?",
                [this.auth.uid],
                (err, results) => next(err, results)
            );
        },
        // pegar dados da batalha
        (results, next) => {

            battle_id = results[0].if_is_pvp_battle_id;

            this.getAllBattleInfo(3, battle_id, next);
        },
        (data, next) => {

            if (this.auth.uid == data.battle_info.uid) {
                iAm = "inviter";
            } else {
                iAm = "receiver";
            };

            this.dataMasterEvents.changeFaintedMonster({
                battle_id,
                iAm,
                uid: this.auth.uid,
                change_monster: monsterPartyIndex
            });
        }
    ]);




    return;


    if (!data.playerMonsters["monster" + input.param]) {
        this.socket.emit(EVENTS.BATTLE_ERROR_DATA, {error: 2});
        // console.log(2);
        return;
    };
};

// Trocar monstro faintado 
Battle.prototype.changeFaintedMonsterPvP = function (input) {
    // let input = {
    //     battle_id,
    //     iAm,
    //     uid,
    //     change_monster
    // };

    const actions = input.params.map(data => ({
        fn_name: "change_fainted_pvp",
        param: {
            target: data.iAm,
            monsterPartyIndex: data.change_monster,
            uid: data.uid
        }
    }));

    const fns = actions.map(data => next => this.rawChangeMonster(data.param.monsterPartyIndex, data.param.uid, next));

    async.parallel(fns, () => {
        this.scServer.exchange.publish("p" + input.battle_id, {
            type: 0,
            actions: {
                preTurn: actions,
                regular: [],
                postTurn: []
            }
        });
    });
};

// mudar monstro do player (cru)
Battle.prototype.rawChangeMonster = function (changePartyIndex, uid, callback) {

    uid = uid || this.auth.uid;

    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `monster0`, `monster" + this.escapeSQL(changePartyIndex) + "` FROM `monsters_in_pocket` WHERE `uid` = '" + this.escapeSQL(uid) + "'", 
                (err, data) => next(err, data)
            );
        },
        results => {

            results = results[0];

            const change = [];

            // monstro que vai ir pra batalha
            change[0] = results["monster" + changePartyIndex];
            // monstro que será substituido (q vai sair da batalha)
            change[1] = results["monster0"];

            // fazer update na db
            this.mysqlQuery(
                "UPDATE `monsters_in_pocket` SET `monster0` = '" + this.escapeSQL(change[0]) + "', `monster" + this.escapeSQL(changePartyIndex) + "` = '" + this.escapeSQL(change[1]) + "' WHERE `uid` = '" + this.escapeSQL(uid) + "'",
                callback
            );
        }
    ]);
};

// Buff e nerf no PvP
// Tratar buffs/nerfs para ser lido na batalha
Battle.prototype.treatBuffNerfPvP = function (monsters_info, buffs_nerfs) {

    const total = {
        inviter: {
            atk: 0,
            def: 0,
            spe: 0,
            accuracy: 0,
            evasion: 0
        },
        receiver: {
            atk: 0,
            def: 0,
            spe: 0,
            accuracy: 0,
            evasion: 0
        }
    };

    // iterando buffs/nerfs que vieram da db
    for (let i = 0, l = buffs_nerfs.length; i < l; i ++) {

        let buff_nerf = buffs_nerfs[i],
            affected;

        // vendo se o monstro é do oponente ou do player
        if (buff_nerf.affected_monster == monsters_info.inviter.id) {
            affected = "inviter"
        } else if (buff_nerf.affected_monster == monsters_info.receiver.id) {
            affected = "receiver";
        } else {
            continue;
        };

        // adiciona ao statchange o valor que foi buffado/nerfado
        switch (+buff_nerf.stats_affected) {
            case 0: {
                total[affected].atk += buff_nerf.value;
                break;
            };
            case 1: {
                total[affected].def += buff_nerf.value;
                break;
            };
            case 2: {
                total[affected].spe += buff_nerf.value;
                break;
            };
            case 3: {
                total[affected].accuracy += buff_nerf.value;
                break;
            };
            case 4: {
                total[affected].evasion += buff_nerf.value;
                break;
            };
        };
    };


    _.each(total.inviter, (val, attr) => {
        if (total.inviter[attr] > 6)
            total.inviter[attr] = 6;

        if (total.inviter[attr] < -6)
            total.inviter[attr] = -6;
    });

    _.each(total.receiver, (val, attr) => {
        if (total.receiver[attr] > 6)
            total.receiver[attr] = 6;


        if (total.receiver[attr] < -6)
            total.receiver[attr] = -6;
    });

    return total;
};

// Recalcular buff/nerf caso algum player mude de monstro
Battle.prototype.recalcBuffNerf = function (monster_id, buffs_nerfs) {

    const buff_nerf = {
        atk: 0,
        def: 0,
        spe: 0,
        accuracy: 0,
        evasion: 0
    };

    // iterando buffs/nerfs que vieram da db
    for (let i = 0, l = buffs_nerfs.length; i < l; i ++) {

        let _buff_nerf = buffs_nerfs[i];
        // vendo se o monstro é do oponente ou do player
        if (_buff_nerf.affected_monster !== monster_id)
            continue;
        
        // adiciona ao statchange o valor que foi buffado/nerfado
        switch (+_buff_nerf.stats_affected) {
            case 0: {
                buff_nerf.atk += _buff_nerf.value;
                break;
            };
            case 1: {
                buff_nerf.def += _buff_nerf.value;
                break;
            };
            case 2: {
                buff_nerf.spe += _buff_nerf.value;
                break;
            };
            case 3: {
                buff_nerf.accuracy += _buff_nerf.value;
                break;
            };
            case 4: {
                buff_nerf.evasion += _buff_nerf.value;
                break;
            };
        };
    };

    // limitando o máximo do buff e nerf
    _.each(buff_nerf, (val, attr) => {
        if (buff_nerf[attr] > 6)
            buff_nerf[attr] = 6;

        if (buff_nerf[attr] < -6)
            buff_nerf[attr] = -6;
    });

    return buff_nerf;
};

// Pedir pra ativar contador
Battle.prototype.claimTimer = function () {

    this.mysqlQuery(
        "SELECT `battle_type`, `if_is_pvp_battle_id` FROM `current_doing` WHERE `uid` = ?",
        [this.auth.uid],
        (err, results) => {
            this.dataMasterEvents.insertBattleTimer({
                battle_id: results[0].if_is_pvp_battle_id
            });
            this.scServer.exchange.publish("p" + results[0].if_is_pvp_battle_id, {
                type: 1
            });
        }
    );
};

// Quando tempo limite para escolher a ação acaba e jogador requisita a vitória
Battle.prototype.claimVictory = function (data) {
    // console.log(`${data.action.uid} ganhou por tempo de reposta na batalha de ID ${data.battle_id}`);

    if (!data.action.uid) {
        return;
    };

    async.auto({
        playerData: next => {
            this.mysqlQuery(
                "SELECT `uid`, `challenged` FROM `battle` WHERE `id` = ?",
                [data.battle_id],
                (err, results) => next(err, results[0])
            )
        },
        removeBattle: ["playerData", (_data, next) => {
            this.mysqlQuery(
                "DELETE FROM `battle` WHERE `id` = ?",
                [data.battle_id],
                next
            );
        }],
        changeDoing0: ["playerData", (_data, next) => {
            this.mysqlQuery(
                "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0', `if_is_pvp_battle_id` = '0' WHERE `uid` = ?",
                [_data.playerData.uid],
                next
            );
        }],
        changeDoing1: ["playerData", (_data, next) => {
            this.mysqlQuery(
                "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0', `if_is_pvp_battle_id` = '0' WHERE `uid` = ?",
                [_data.playerData.challenged],
                next
            );
        }]
    }, () => {

        this.dataMasterEvents.removeBattle({
            battle_id: data.battle_id
        });

        this.scServer.exchange.publish("p" + data.battle_id, {
            type: 2,
            param: {
                winner: data.action.uid
            }
        });
    });
};



/*
============================
            </PvP>
============================
*/


// Trocar monstro que está desmaiado
Battle.prototype.changeFaintedMonster = function (input, data) {
    if (input.action !== "change") {
        this.socket.emit(EVENTS.BATTLE_ERROR_DATA, {error: 1});
        // console.log(1);
        return;
    };

    if (!data.playerMonsters["monster" + input.param]) {
        this.socket.emit(EVENTS.BATTLE_ERROR_DATA, {error: 2});
        // console.log(2);
        return;
    };

    // criando novo objeto dos monstros do jogador
    let new_order = _.clone(data.playerMonsters);
    // fazendo a troca de monstro no objeto
    data.playerMonsters.monster0 = new_order["monster" + input.param];
    data.playerMonsters["monster" + input.param] = new_order.monster0;

    async.parallel([
        // trocar ordem do monstro
        next => this.rawChangeMonster(input.param, this.auth.uid, next),
        // remover EXP share do monstro que faintou
        next => this.removeExpShareToMonster(new_order.monster0, data.battle.id, next),
        // adicionar EXP share ao monstro que entrou
        next => this.addExpShareToMonster(data.playerMonsters.monster0, data.battle.id, next),
        // liberar
        next => {
            // atualizando na db que não precisa mais trocar
            this.mysqlQuery(
                "UPDATE `battle` SET `need_to_trade_fainted_monster` = '0' WHERE `uid` = ?",
                [this.auth.uid],
                next
            );
        }
    ], () => {
        // console.log("Cabou!");
        this.socket.emit(EVENTS.CHANGE_FAINTED_MONSTER);
    });
};

// Controlar ação do jogador contra monstro selvagem
Battle.prototype.handleActionVsWild = function (input, data) {
    /*
    data:
        playerMonsters: informação dos monstros do jogador
        wildMonster: informação do monstro selvagem/domador
        battle: informação da batalha
            buffs_nerfs: buffs e nerfs da batalha

    actions é uma array, pra cada index é uma parte da ação:
        0 = pre-turn
        1 = inputs do usuário/cpu
        2 = post-turn
    */

    // checar se player precisa trocar de monstro 
    if (data.battle.need_to_trade_fainted_monster) {
        // console.log("Precisa trocar de monstro");
        this.changeFaintedMonster(input, data);
        return;
    };

    // listar todas as ações que ocorrem na batalha
    const actions = {
        preTurn: [],
        regular: [],
        postTurn: []
    },
    // ação do bot/cpu e do jogador
        action = {},
        player = {};

    // monstro do jogador (primeiro monstro que está "vivo")
    player.monster = this.getFirstPlayerMonsterAlive(data.playerMonsters);
    // index atual do monstro
    player.index = this.getIndexById(player.monster.id, data.playerMonsters); 
    this.player = player;

    // buffs e nerfs da batalha
    const buffs_nerfs = this.treatBuffNerf({
        player: player.monster.id,
        opponent: data.wildMonster.id
    }, data.battle.buffs_nerfs, data);

    // tratar ação do jogador
    action.player = this.treatPlayerActionVsWild(
        // input do jogador 
        input,
        // info da batalha
        data,
        // buffs e nerfs
        buffs_nerfs
    );
    // diferenciando id da ação (id de quem está fazendo a ação)
    action.player.id = "player";
    // informações do alvo
    action.player.target = {
        data: data.wildMonster,
        name: "opponent"
    };
    
    // console.log("status", player.monster.status_problem);

    // ** Checar se tem algum Status Problem
    if (player.monster.status_problem > 0)
        this.handleStatusProblem(player.monster, action.player, actions);

    // vendo ação do player
    switch (action.player.fn_name) {

        case "status_problem": {
            // console.log("HAHA STATUS PROBLEM");
            // console.log(action.player);
            //return;
            break;
        };

        // se é move de buff debuff
        case "buff_nerf": {

            //// console.log(buffs_nerfs);
            //// console.log(action.player.param.effect);
            break;
        };

        // checando se é move de dano
        case "move_damage": {

            let move_id = action.player.param.move_id,
                mana = Resources.Moves[move_id].manaNeeded;

            if (mana) {
                if (player.monster.current_MP - mana < 0) {
                    // se não tiver mana suficiente da erro expulsa
                    this.socket.emit(EVENTS.BATTLE_ERROR_DATA, {error: 3});
                    return;
                } else {
                    player.monster.current_MP -= mana;
                };
            };
            break;
        };

        // checando se jogador que fugir da batalha
        case "run": {
            // console.log("Tentou Fugir!", action.player);
            break;
        };

        // caso jogador use poção healer
        case "health_potion": {
            let monster = data.playerMonsters["monster" + input.param.monster];
            data.playerMonsters["monster" + input.param.monster].current_HP = monster.current_HP + action.player.param.effect.heal > monster.stats_HP ? monster.stats_HP : monster.current_HP + action.player.param.effect.heal;
            break;
        };

        // caso jogador use um selo mágico
        case "magic_seal": {
            let tamed = this.tryTameMonster(
                data.wildMonster, 
                action.player.param.item_id,
                {
                    current: data.wildMonster.current_HP,
                    total: data.wildMonster.stats_HP
                }
            );
            action.player.param.tamed = tamed;
            // console.log("Domou?", tamed ? "Sim" : "Não");
            break;
        };

        // checando se jogador quer mudar de monstro    
        case "change_monster": {
            // limpando ações post turn do player, já que ele vai trocar de monstro
            actions.postTurn = actions.postTurn.filter(action => action.param.id != player.monster.id);

            // console.log("Mudou para: ", action.player);
            // criando novo objeto dos monstros do jogador
            let new_order = _.clone(data.playerMonsters);
            // fazendo a troca de monstro no objeto
            data.playerMonsters.monster0 = new_order["monster" + action.player.param.index];
            data.playerMonsters["monster" + action.player.param.index] = new_order.monster0;
            // att. do objeto
            player.monster = data.playerMonsters.monster0;
            player.index = 0;
            this.player = player;
            break;
        };
    };

    // escolher ação do bot
    action.bot = this.chooseWildAction(
        data,
        player.monster
    );

    // tratar ação do bot
    action.bot = this.treatWildAction(
        // inputs do cpu
        action.bot,
        // attacker
        data.wildMonster,
        // target
        player.monster,
        // buffs e nerfs
        buffs_nerfs
    );

    // diferenciando id da ação (id de quem está fazendo a ação)
    action.bot.id = "opponent";
    // informações do alvo
    action.bot.target = {
        data: player.monster,
        name: "player"
    };

    // ** Checando se wild tem algum status problem
    if (data.wildMonster.status_problem > 0)
        this.handleStatusProblem(data.wildMonster, action.bot, actions);

    // ** Quem ataca primeiro
    //this.setActionPriority(data, actions, action);

    switch (action.player.fn_name) {
        // são todas ações que devem acontecer antes do turno regular
        case "health_potion":
        case "magic_seal":
        case "change_monster":
        case "run":
        {
            actions.preTurn.push(action.player);
            actions.regular.push(action.bot);
            break;
        };

        default: {

            // quando é normal baseia-se na velocidade de quem vai atacar primeiro

            // checando qual é mais rápido, e listando as ações seguindo a ordem
            if (player.monster.stats_speed * Resources.StatChange.stats[buffs_nerfs.player.spe] >= data.wildMonster.stats_speed * Resources.StatChange.stats[buffs_nerfs.opponent.spe]) {
                actions.regular.push(action.player);
                actions.regular.push(action.bot);
            } else {
                actions.regular.push(action.bot);
                actions.regular.push(action.player);
            };
            break;
        };
    };

    // ** Modificadores

    // caso o monstro do player for o primeiro a atacar e ele escolheu status problem
    if (
        action.player.fn_name == "status_problem" && 
        actions.regular.findIndex(action => action.param.attacker_id == player.monster.id) == 0 &&
        action.player.param.canDoMove &&
        action.player.param.hited
        ) {
        data.wildMonster.status_problem = action.player.param.stat;
        this.handleStatusProblem(data.wildMonster, action.bot, actions, true);

        // monstro não pode acordar no mesmo turno que ele usou o move
        if (action.player.param.stat == 5) {
            action.bot.param.canDoMove = false;
        };
    };

    // se o primeiro a escolher a ação for de dano, se hitou e se pode fazer o move
    if (actions.regular[0].fn_name == "move_damage" && actions.regular[0].param.hited && actions.regular[0].param.canDoMove) {
        // se o hp do primeiro monstro atigindo for igual a zero
        // remove o dano do que atacou em segundo
        if (actions.regular[0].param.hp <= 0) {
            //// console.log("maotu o " + actions.regular[0].target.name + " !!!");
            delete actions.regular[1];
        };
    };

    // se o jogador tentar fugir e poder fugir
    if (action.player.fn_name == "run" && action.player.param == true) {
        // loopa ações regulares pra tirar ação do wild, já que player pode fugir
        for (let i = 0; i < actions.regular.length; i++) {
            if (actions.regular[i].id == "opponent")
                delete actions.regular[i];
        };
    };

    // ** Aplicar ações
    async.series([
        // preturn
        next => {
            let script = new BattleScript(this, data.battle.id);
            script.codeParser(actions.preTurn);
            script.exec(next);
        }, 
        // regular
        next => {
            let script = new BattleScript(this, data.battle.id);
            script.codeParser(actions.regular);
            script.exec(next);
        },
        //post turn
        next => {
            let script = new BattleScript(this, data.battle.id);
            script.codeParser(actions.postTurn);
            script.exec(next);
        }
    ], () => {
        // pegar dados da batalha atualizado
        this.getAllBattleInfo(data.battle.battle_type, null, (err, _data) => {

            // ir pra próximo turno
            this.nextTurnWild(
                actions,
                _data
            );
        });
    });
};

// Controlar ação do jogador contra outro domador (cpu/bot)
Battle.prototype.handleActionVsTamer = function (input, data) {
    //// console.log("vs tamer", input, data);
    /*
    data:
        playerMonsters: informação dos monstros do jogador
        tamerMonsters: informação dos monstro do domador (cpu)
        battle: informação da batalha
        buffs_nerfs: buffs e nerfs da batalha
    */

    // checar se player precisa trocar de monstro 
    if (data.battle.need_to_trade_fainted_monster) {
        // console.log("Precisa trocar de monstro");
        this.changeFaintedMonster(input, data);
        return;
    };

    // monstros
    const monster = {};
    // do player
    monster.player = this.getFirstPlayerMonsterAlive(data.playerMonsters);
    monster.player.index = this.getIndexById(monster.player.id, data.playerMonsters);
    // do domador
    monster.tamer = this.getFirstPlayerMonsterAlive(data.tamerMonsters);
    this.monster = monster;

    // ações do turno
    const actions = {
        preTurn: [],
        regular: [],
        postTurn: []
    },
    // ação do player e do domador
        action = {};

    // buffs e nerfs da batalha
    const buffs_nerfs = this.treatBuffNerf({
        player: monster.player.id,
        opponent: monster.tamer.id
    }, data.buffs_nerfs || [], data);

    // tratar ação do jogador
    action.player = this.treatPlayerActionVsTamer(
        // input do jogador 
        input,
        // info da batalha
        data,
        // buffs e nerfs
        buffs_nerfs
    );
    // diferenciando id da ação (id de quem está fazendo a ação)
    action.player.id = "player";
    // informações do alvo
    action.player.target = {
        data: monster.tamer,
        name: "opponent"
    };

    // ** Checar se tem algum Status Problem
    if (monster.player.status_problem > 0)
        this.handleStatusProblem(monster.player, action.player, actions);

    // vendo ação do player
    switch (action.player.fn_name) {

        case "status_problem": { 
            break;
        };

        // checando se é move de dano
        case "move_damage": {

            let move_id = action.player.param.move_id,
                mana = Resources.Moves[move_id].manaNeeded;

            if (mana) {
                if (monster.player.current_MP - mana < 0) {
                    // se não tiver mana suficiente da erro expulsa
                    this.socket.emit(EVENTS.BATTLE_ERROR_DATA, {error: 3});
                    return;
                } else {
                    monster.player.current_MP -= mana;
                };
            };
            break;
        };

        // checando se jogador que fugir da batalha
        case "run": {
            // console.log("Tentou Fugir!", action.player);
            break;
        };

        // caso jogador use poção healer
        case "health_potion": {
            let monster = data.playerMonsters["monster" + input.param.monster];
            data.playerMonsters["monster" + input.param.monster].current_HP = monster.current_HP + action.player.param.effect.heal > monster.stats_HP ? monster.stats_HP : monster.current_HP + action.player.param.effect.heal;
            break;
        };

        // checando se jogador quer mudar de monstro    
        case "change_monster": {
            // console.log("Mudou para: ", action.player);
            // criando novo objeto dos monstros do jogador
            let new_order = _.clone(data.playerMonsters);
            // fazendo a troca de monstro no objeto
            data.playerMonsters.monster0 = new_order["monster" + action.player.param.index];
            data.playerMonsters["monster" + action.player.param.index] = new_order.monster0;
            // att. do objeto
            monster.player = data.playerMonsters.monster0;
            monster.player.index = 0;
            break;
        };
    };

    // escolher ação do bot
    action.bot = this.chooseTamerAction(
        data,
        monster.player,
        monster.tamer
    );

    // tratar ação do bot
    action.bot = this.treatTamerAction(
        // inputs do cpu
        action.bot,
        // attacker
        monster.tamer,
        // target
        monster.player,
        // buffs e nerfs
        buffs_nerfs
    );

    // diferenciando id da ação (id de quem está fazendo a ação)
    action.bot.id = "opponent";
    // informações do alvo
    action.bot.target = {
        data: monster.player,
        name: "player"
    };

    // ** Checando se wild tem algum status problem
    if (monster.tamer.status_problem > 0)
        this.handleStatusProblem(monster.tamer, action.bot, actions);

    // ** Quem ataca primeiro
    //this.setActionPriority(data, actions, action);

    switch (action.player.fn_name) {
        // são todas ações que devem acontecer antes do turno regular
        case "health_potion":
        case "change_monster":
        {
            actions.preTurn.push(action.player);
            actions.regular.push(action.bot);
            break;
        };

        default: {

            // quando é normal baseia-se na velocidade de quem vai atacar primeiro
            // checando qual é mais rápido, e listando as ações seguindo a ordem
            if (monster.player.stats_speed * Resources.StatChange.stats[buffs_nerfs.player.spe] >= monster.tamer.stats_speed * Resources.StatChange.stats[buffs_nerfs.opponent.spe]) {
                actions.regular.push(action.player);
                actions.regular.push(action.bot);
            } else {
                actions.regular.push(action.bot);
                actions.regular.push(action.player);
            };
            break;
        };
    };


    // ** Modificadores

    // caso o monstro do player for o primeiro a atacar e ele escolheu status problem
    if (
        action.player.fn_name == "status_problem" && 
        actions.regular.findIndex(action => action.param.attacker_id == player.monster.id) == 0 &&
        action.player.param.canDoMove &&
        action.player.param.hited
        ) {
        monster.tamer.status_problem = action.player.param.stat;
        this.handleStatusProblem(monster.tamer, action.bot, actions);
    };

    // se o primeiro a escolher a ação for de dano, se hitou e se pode fazer o move
    if (actions.regular[0].fn_name == "move_damage" && actions.regular[0].param.hited && actions.regular[0].param.canDoMove) {
        // se o hp do primeiro monstro atigindo for igual a zero
        // remove o dano do que atacou em segundo
        if (actions.regular[0].param.hp <= 0) {
            //// console.log("matou o " + actions.regular[0].target.name + " !!!");
            delete actions.regular[1];
        };
    };

    // ** Aplicar ações
    async.series([
        // preturn
        next => {
            let script = new BattleScript(this, data.battle.id);
            script.codeParser(actions.preTurn);
            script.exec(next);
        }, 
        // regular
        next => {
            let script = new BattleScript(this, data.battle.id);
            script.codeParser(actions.regular);
            script.exec(next);
        },
        //post turn
        next => {
            let script = new BattleScript(this, data.battle.id);
            script.codeParser(actions.postTurn);
            script.exec(next);
        }
    ], () => {
        // pegar dados da batalha atualizado
        this.getAllBattleInfo(data.battle.battle_type, null, (err, _data) => {

            // ir pra próximo turno
            this.nextTurnTamer(
                actions,
                _data
            );
        });
    });
};

// Próximo turno contra monstro selvagem
Battle.prototype.nextTurnWild = function (actions, data) {

    //console.log("ações do turno", actions);

    // ** checando se alguém morreu

    // se o oponente morreu
    if (data.wildMonster && data.wildMonster.current_HP <= 0) {
        this.fainted(
            actions, 
            data, 
            "wild", 
            data.wildMonster
        );
        return;
    };

    // se o monstro do player morreu
    if (data.playerMonsters["monster" + this.player.index].current_HP <= 0) {

        this.fainted(
            actions, 
            data, 
            "player", 
            this.player.monster
        );
        return;
    };

    // enviando ações ao jogador
    this.socket.emit(EVENTS.BATTLE_ACTIONS_RESPONSE, {
        actions
    });
};

// Próximo turno contra monstro de domador (cpu/bot)
Battle.prototype.nextTurnTamer = function (actions, data) {

    console.log("ações do turno", actions);

    // ** checando se alguém morreu

    // se o oponente morreu
    if (data.tamerMonsters["monster0"].current_HP <= 0) {
        this.fainted(
            actions, 
            data, 
            "tamer", 
            this.monster.tamer
        );
        return;
    };

    // se o monstro do player morreu
    if (data.playerMonsters["monster" + this.monster.player.index].current_HP <= 0) {

        this.fainted(
            actions, 
            data, 
            "player", 
            this.monster.player
        );
        return;
    };

    // enviando ações ao jogador
    this.socket.emit(EVENTS.BATTLE_ACTIONS_RESPONSE, {
        actions
    });
};

// Tratar input do jogador qnd está vs monstro selvagem
Battle.prototype.treatPlayerActionVsWild = function (input, data, buffs_nerfs) {

    let action;

    //// console.log("inputs do jogador", input);

    switch (input.action) {
        case "move": {
            action = this.handleMove(
                // move
                Resources.Moves[this.player.monster["move_" + input.param]],
                // attacker = monstro atual do jogador
                this.player.monster,
                // target = monstro selvagem
                data.wildMonster,
                // buffs e nerfs
                {
                    attacker: buffs_nerfs.player,
                    target: buffs_nerfs.opponent
                }
            );
            break;
        };

        // caso tente fugir
        case "run": {
            action = this.handleRun(
                this.player.monster,
                data.wildMonster
            );
            break;
        };

        // caso escolheu um item
        case "item": {
            action = this.handleItem(
                input.param.item,
                data.playerMonsters["monster" + input.param.monster]
            );
            break;
        };

        // caso tente mudar o monstro
        case "change": {
            action = {
                fn_name: "change_monster",
                param: {
                    index: input.param,
                    hasExpShare: true
                }
            };
            break;
        };
    };

    return action;
};

// Tratar input do jogador qnd está vs domador (cpu/bot)
Battle.prototype.treatPlayerActionVsTamer = function (input, data, buffs_nerfs) {

    let action;

    //// console.log("inputs do jogador", input);

    switch (input.action) {
        case "move": {
            action = this.handleMove(
                // move
                Resources.Moves[this.monster.player["move_" + input.param]],
                // attacker = monstro atual do jogador
                this.monster.player,
                // target = monstro selvagem
                this.monster.tamer,
                // buffs e nerfs
                {
                    attacker: buffs_nerfs.player,
                    target: buffs_nerfs.opponent
                }
            );
            break;
        };

        // caso escolheu um item
        case "item": {
            action = this.handleItem(
                input.param.item,
                data.playerMonsters["monster" + input.param.monster]
            );
            break;
        };

        // caso tente mudar o monstro
        case "change": {
            action = {
                fn_name: "change_monster",
                param: {
                    index: input.param,
                    hasExpShare: true
                }
            };
            break;
        };
    };

    return action;
};

// Escolher ação do oponente || monstro selvagem
Battle.prototype.chooseWildAction = function (data, playerMonster) {

    let choose = false,
        move;

    while (!choose) {
        move = data.wildMonster["move_" + String(Math.floor(Math.random() * 4))];

        if (move in Resources.Moves)
            choose = true;
    };

    return {
        action: "move",
        param: Resources.Moves[move]
    };
};

// Tratar ação do bot/cpu || monstro selvagem
Battle.prototype.treatWildAction = function (input, wildMonster, target, buffs_nerfs) {

    // console.log("treatWildAction", buffs_nerfs);

    // guarda ação
    let action;

    switch (input.action) {
        case "move": {

            action = this.handleMove(
                // move
                input.param,
                // attacker (wildMonster) = monstro atual
                wildMonster,
                // target = monstro atual do jogador
                target,
                {
                    attacker: buffs_nerfs.opponent,
                    target: buffs_nerfs.player
                }
            );

            break;
        };

        case "run": {
            break;
        };
    };

    return action;
};

// Escolher ação do oponente || outro domador
Battle.prototype.chooseTamerAction = function (data, playerMonster, tamerMonster) {
    
    let choose = false,
        move;

    while (!choose) {
        move = tamerMonster["move_" + String(Math.floor(Math.random() * 4))];

        if (move in Resources.Moves) 
            choose = true;
    };

    return {
        action: "move",
        param: Resources.Moves[move]
    };
};

// Tratar ação do bot/cpu || outro domador
Battle.prototype.treatTamerAction = function (input, tamerMonster, target, buffs_nerfs) {
    //// console.log({input});

    // guarda ação
    let action;

    switch (input.action) {
        case "move": {

            action = this.handleMove(
                // move
                input.param,
                // attacker = monstro atual
                tamerMonster,
                // target = monstro atual do jogador
                target,
                {
                    attacker: buffs_nerfs.opponent,
                    target: buffs_nerfs.player
                }
            );
            break;
        };

    };

    return action;
};

// Controlar movimento escolhido
Battle.prototype.handleMove = function (move, attacker, target, buffs_nerfs) {

    let action = {};

    switch (move.category) {
        // ataque normal
        case "Normal":
        case "Magic": 
        {
            action.fn_name = "move_damage";
            action.param = this.applyDamage(
                // movimento
                move,
                // quem atacou
                attacker,
                // mirou em quem
                target,
                // buffs
                {
                    attacker: buffs_nerfs.attacker.atk,
                    target: buffs_nerfs.target.def
                }
            );
            action.param.hited = this.applyAccuracy(move, buffs_nerfs.attacker.accuracy);
            action.param.canDoMove = true;
            action.param.move_id = move.id;
            action.param.attacker_id = attacker.id;
            break;
        };
        
        // caso seja buff/nerf
        case "Status": {
            action.fn_name = "buff_nerf";
            action.param = {};
            action.param.hited = this.applyAccuracy(move, buffs_nerfs.attacker.accuracy);
            action.param.canDoMove = true;
            action.param.move_id = move.id;
            action.param.attacker_id = attacker.id;
            action.param.effectTarget = move.target;

            // vendo em quem será o alvo do move
            let moveTarget;

            switch (move.target) {
                case "opponent": {
                    moveTarget = target;
                    break;
                };

                case "self": {
                    moveTarget = attacker;
                    break;
                }; 
            };
            //action.param.effect = [];
            action.param.effect = move.boosts.map(mv => ({
                target: moveTarget.id,
                value: mv.value,
                stat: mv.stat
            }));
            break;
        };

        // caso seja status problem (queimado, evenenado e etc)
        case "StatusProblem": {
            action.fn_name = "status_problem";
            action.param = this.applyStatusProblem(
                // movimento
                move,
                // quem atacou
                attacker,
                // mirou em quem
                target
            );

            action.param.hited = this.applyAccuracy(move, buffs_nerfs.attacker.accuracy);
            action.param.canDoMove = true;

            action.param.move_id = move.id;
            action.param.attacker_id = attacker.id;

            break;
        };

    };

    return action;
};

// Controlar uso de item
Battle.prototype.handleItem = function (item_id, monster) {
    
    const 
        item = Resources.Items[item_id],
        effect = item.effect;

    const object = {
        fn_name: item.type,
        param: {
            effect,
            item_id
        }
    };

    // se for um item que se usa no monstro
    if (monster)
        object.param.monster_id = monster.id;

    return object;
};

// Controlar tentativa de fuga
Battle.prototype.handleRun = function (runner, chaser) {

    // comparando velocidade do corredor e do perseguidor
    return {
        fn_name: "run",
        param: runner.stats_speed >= chaser.stats_speed
    };
};

// Controlar e aplicar status problem
Battle.prototype.handleStatusProblem = function (monster, action, actions, isNotTheFirstMove) {
    switch (monster.status_problem) {
        // paralizado
        case 1: {
            let rate = math.random.between([0, 100]);
            action.param.canDoMove = rate <= 40;
            // console.log("chance de paralizar:", rate, "paralizou?", action.param.canDoMove ? "Não" : "Sim");
            break;
        };
        // envenenado
        case 2: {

            // calcula o damage tomado
            let minval = 5,
                range = math.random.between([1, 10]),
                val = minval + range,
                poisoned = Math.floor((val * monster.stats_HP) / 100);

            // adiciona ao monstro o poison
            actions.postTurn.push({
                fn_name: "raw_damage",
                param: {
                    id: monster.id,
                    damage: poisoned,
                    type: "psn"
                }
            });

            // console.log({range, val, poisoned});
            break;
        };
        // dormindo
        case 5: {

            if (action.fn_name == "move_damage" || action.fn_name == "buff_nerf") {
                // tem 20% de chance de acordar
                let rate = math.random.between([0, 100]),
                    awaked = rate <= 20;

                // pode fazer o move?
                action.param.canDoMove = awaked;

                console.log({isNotTheFirstMove});

                // se acordou, adiciona ação de pré-turn que monstro acordou
                if (awaked && !isNotTheFirstMove) {
                    actions.preTurn.push({
                        fn_name: "awake",
                        param: {
                            id: monster.id
                        }
                    });

                    // seta stats problem pra nenhum
                    monster.status_problem = 0;
                };
            };

            break;
        };
    };
};

// Calcular o damage do ataque
Battle.prototype.applyDamage = function (move, attacker, target, buffs) {

    // vendo se é stab ou não
    let stab = Resources.Formulas.Battle.Calc.stab({
        move_type: move.type,
        monster_type: Resources.Dex[attacker.monsterpedia_id].types
    }),
    // faz o calculos de tipos: fraqueza, vantagem e imunidade
        typeChart = Resources.Formulas.Battle.Calc.typeChart({
            attacker: move.type,
            target: Resources.Dex[target.monsterpedia_id].types
        }),
    // escolhe aleatóriamente (10%) se o ataque é crítico --> _.math.random.percentage(10)
        critical = false,
    // calcula os dados com todas as variavéis acima
        damage = Resources.Formulas.Battle.Calc.damage.all({
        attacker: {
            level: attacker.level,
            atk: attacker.stats_attack,
            basePower: move.basePower
        },
        target: {
            def: target.stats_defense
        },
        mod: {
            stab,
            critical,
            typeChart,
            item: null
        },
        buffs: {
            attacker: buffs.attacker,
            target: buffs.target
        }
    }),
    // edita o hp atual do monstro de acordo com o dano
        hp = (target["current_HP"] - damage < 0) ? 0 : target["current_HP"] - damage;

    return {
        hp,
        damage
    };
};

// Aplicar status problem
Battle.prototype.applyStatusProblem = function (move, attacker, target) {

    const stats = {};

    switch (move.statProblem) {
        
        // paralizado
        case "par": {
            stats.stat = 1;
            break;
        };

        // envenenado
        case "psn": {
            stats.stat = 2;
            break;
        };

        // dormindo
        case "slp": {
            stats.stat = 5;
            break;
        };
    };

    return stats;
};

// Ver se acertou
Battle.prototype.applyAccuracy = function (move, buff_nerf) {

    buff_nerf = buff_nerf || 0;

    // se for impossível de errar
    if (typeof(move.accuracy) == "boolean" && move.accuracy)
        return true;

    // chance comum de acerto
    const rate = math.random.between([0, 100]);
    return rate <= move.accuracy * Resources.StatChange.accuracy[buff_nerf];
};

// Tentar domar monstro
Battle.prototype.tryTameMonster = function (monster, seal_id, hp) {

    let dexData = Resources.Dex[monster.monsterpedia_id],
        seal = Resources.Items[seal_id],
        rate = math.random.between([0, 100]);

    // se for selo mestre, sempre vai ser 100% de chance capturar
    if (seal.effect.tame_rate == 0)
        return true;
    
    // * HP changes
    // porcentagem do HP
    let percentage = (hp.current / hp.total) * 100;

    // seta pra multiplicar por 1
    let hp_rate = 1;

    // se for 1% aumenta 2.1, se for 20% 1.7 e 50% 1.2
    if (percentage <= 1) {
        hp_rate = 2.1;
    } else if (percentage <= 20 && !(percentage >= 20)) {
        hp_rate = 1.7;
    } else if (percentage <= 50 && !(percentage >= 50)) {
        hp_rate = 1.2;
    };


    // * Status problem changes
    let status_problem_rate = 1;

    switch (monster.status_problem) {
        // paralizado
        case 1: {
            status_problem_rate = 1.3;
            break;
        };
        // dormindo
        case 5: {
            status_problem_rate = 1.8;
            break;
        };
    }

    console.log(
        "---------------------------------",
        "\nsorteado:", rate, 
        "\nchance de cap. do monstro:", dexData.tame_rate, 
        "\nboost aumentado do selo:", seal.effect.tame_rate, 
        "\nboost aumentado de acordo com o HP:", hp_rate,
        "\nboost aumentado de acordo com status problem:", status_problem_rate,
        "\nchance de cap. com os modificadores (boosts):", dexData.tame_rate * seal.effect.tame_rate * hp_rate * status_problem_rate
    );

    // pega porcentagem
    return rate <= dexData.tame_rate * seal.effect.tame_rate * hp_rate * status_problem_rate;
};

// Tratar buffs/nerfs para ser lido na batalha
Battle.prototype.treatBuffNerf = function (monsters_id, buffs_nerfs, data) {

    const total = {
        player: {
            atk: 0,
            def: 0,
            spe: 0,
            accuracy: 0,
            evasion: 0
        },
        opponent: {
            atk: 0,
            def: 0,
            spe: 0,
            accuracy: 0,
            evasion: 0
        }
    };

    // iterando buffs/nerfs que vieram da db
    for (let i = 0, l = buffs_nerfs.length; i < l; i ++) {

        let buff_nerf = buffs_nerfs[i],
            affected;

            //// console.log("haaaaaaaaaa", buff_nerf);

        // vendo se o monstro é do oponente ou do player
        if (buff_nerf.affected_monster == monsters_id.player) {
            affected = "player"
        } else if (buff_nerf.affected_monster == monsters_id.opponent) {
            affected = "opponent";
        } else {
            continue;
        };

        //// console.log("cu de bunda", affected);

        //// console.log("ADSQWE", buff_nerf.affected_monster, monsters_id.player, monsters_id.opponent);

        // adiciona ao statchange o valor que foi buffado/nerfado
        switch (+buff_nerf.stats_affected) {
            case 0: {
                total[affected].atk += buff_nerf.value;
                break;
            };
            case 1: {
                total[affected].def += buff_nerf.value;
                break;
            };
            case 2: {
                total[affected].spe += buff_nerf.value;
                break;
            };
            case 3: {
                total[affected].accuracy += buff_nerf.value;
                break;
            };
            case 4: {
                total[affected].evasion += buff_nerf.value;
                break;
            };
        };
    };

    _.each(total.player, (val, attr) => {
        if (total.player[attr] > 6)
            total.player[attr] = 6;

        if (total.player[attr] < -6)
            total.player[attr] = -6;
    });

    _.each(total.opponent, (val, attr) => {
        if (total.opponent[attr] > 6)
            total.opponent[attr] = 6;


        if (total.opponent[attr] < -6)
            total.opponent[attr] = -6;
    });

    return total;
};

// Pegar primeiro monstro do jogador que não esteja desmaiado
Battle.prototype.getFirstPlayerMonsterAlive = function (monsters) {
    for (let i = 0; i < 6; i++)
        if (monsters["monster" + i] && monsters["monster" + i].current_HP > 0)
            return monsters["monster" + i];

    return null;
};

// Pegar index do monstro na party pelo ID do monstro especificado 
Battle.prototype.getIndexById = function (id, monsters) {
    for (let i = 0; i < 6; i ++)
        if (monsters["monster" + i] && monsters["monster" + i].id == id)
            return i;

    return null;
};

// Pegar dados do monstro na party pelo ID
Battle.prototype.getInPartyMonsterDataById = function (id, monsters) {
    for (let i = 0; i < 6; i ++)
        if (monsters["monster" + i] && monsters["monster" + i].id == id)
            return monsters["monster" + i];

    return null;
};

// Pegar todas as informações da batalha
Battle.prototype.getAllBattleInfo = function (battle_type, if_is_pvp_battle_id, callback) {

    /*
    battle_type:
        1 = wild
        2 = tamer
        3 = pvp
    */

    switch (+battle_type) {
        // wild
        case 1: {

            async.parallel({
                // pegar infos dos monstros do player que estão no pocket
                playerMonsters: next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .getMonstersInPocket(next);
                },
                // pegar informação do wild que está lutando
                wildMonster: next => {
                    this.mysqlQuery(
                        "SELECT * FROM `monsters` WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1'",
                        [this.auth.uid],
                        (err, results) => {
                            next(err, results[0]);
                        }
                    );
                },
                // pegar info da batalha
                battle: next => {

                    let battle_info;

                    async.waterfall([
                        cb => {
                            this.mysqlQuery(
                                "SELECT * FROM `battle` WHERE `uid` = ?",
                                [this.auth.uid],
                                (err, results) => {
                                    battle_info = results[0] || {};
                                    cb(err, battle_info);
                                }
                            );
                        },
                        (results, cb) => {
                            this.mysqlQuery(
                                "SELECT * FROM `battle_buffs_nerfs` WHERE `battle_id` = ?",
                                [battle_info.id],
                                (err, results) => {
                                    
                                    results = results || [];

                                    battle_info.buffs_nerfs = results;
                                    cb(err, results);
                                }
                            )
                        },
                        () => {
                            next(null, battle_info);
                        }
                    ]);
                }
            }, callback);
            break;
        };

        // tamer
        case 2: {
            async.auto({
                battle: next => {
                    this.mysqlQuery(
                        "SELECT * FROM `battle` WHERE `uid` = ?",
                        [this.auth.uid],
                        (err, results) => next(err, results[0])
                        
                    );
                },
                buff_nerf: ["battle", (data, next) => {
                    this.mysqlQuery(
                        "SELECT * FROM `battle_buffs_nerfs` WHERE `battle_id` = ?",
                        [data.battle.id],
                        (err, results) => next(err, results || [])
                    );
                }],
                playerMonsters: next => {
                    instantiateGameCoreKlass(Species, this.main)
                        .getMonstersInPocket(next);
                },
                tamerMonsters: ["battle", (data, next) => {
                    instantiateGameCoreKlass(Tamer, this.main)
                        .getMonstersInParty(data.battle.challenged, next);
                }]
            }, callback);

            break;
        };

        // pvp
        case 3: {
            async.auto({
                battle_info: next => {
                    this.mysqlQuery(
                        "SELECT * FROM `battle` WHERE `id` = ?",
                        [if_is_pvp_battle_id],
                        (err, results) => next(err, results[0])
                    );
                },
                buffs_nerfs: next => {
                    this.mysqlQuery(
                        "SELECT * FROM `battle_buffs_nerfs` WHERE `battle_id` = ?",
                        [if_is_pvp_battle_id],
                        (err, results) => next(err, results)
                        
                    );
                },
                // monstros do inviter e do receiver
                inviter: ["battle_info", (data, next) => {
                    instantiateGameCoreKlass(Species, this.main)
                        .getMonstersInPocket(next, data.battle_info.uid);
                    
                }],
                receiver: ["battle_info", (data, next) => {
                    instantiateGameCoreKlass(Species, this.main)
                        .getMonstersInPocket(next, data.battle_info.challenged);
                }]
            }, callback);
            break;
        };
    };
};

// Script para aplicar ações na batalha
const BattleScript = function (main, battle_id) {

    Base.call(main.main, {}, main.auth, main.db, {});

    this.main = main;

    this.fn = [];
    this.battle_id = battle_id;
};

BattleScript.prototype = Object.create(Base.prototype);

BattleScript.prototype.codeParser = function (scripts) {
    // percorre scripts
    for (let i = 0; i < scripts.length; i ++) {
        // stora script atual do loop
        let script = scripts[i];

        // autentica
        if (!script || !script.fn_name)
            continue;

        // stora parametros do script e nome da função
        let param,
            fn_name = this.fnNames[script.fn_name];

        // vendo qual o nome da função e setando o parâmetro 
        // de acordo com suas variantes
        switch (fn_name) {
            // aplicar dano
            case 2: {
                param = {
                    id: script.target.data.id,
                    hp: script.param.hp,
                    damage: script.param.damage,
                    hited: script.param.hited,
                    canDoMove: script.param.canDoMove,
                    move_id: script.param.move_id,
                    attacker_id: script.param.attacker_id
                };
                break;
            };

            // buff/debuff
            case 3: {
                param = script.param;
                break;
            };

            // fugir
            case 4: {
                param = {
                    canRun: script.param,
                    target: script.target.data.id
                };
                break;
            };

            // trocar monstro
            case 5: {
                param = {
                    changeID: script.param.index,
                    uid: script.param.uid,
                    hasExpShare: script.param.hasExpShare
                };
                break;
            };

            // poção healer
            case 6: {
                param = {
                    heal: script.param.effect.heal,
                    monster_id: script.param.monster_id,
                    item_id: script.param.item_id
                };
                break;
            };

            // selo mágico
            case 7: {
                param = {
                    tamed: script.param.tamed,
                    monster_id: script.target.data.id,
                    item_id: script.param.item_id
                };
                break;
            };

            // status problem
            case 8: {
                param = {
                    id: script.target.data.id,
                    hited: script.param.hited,
                    canDoMove: script.param.canDoMove,
                    move_id: script.param.move_id,
                    attacker_id: script.param.attacker_id,
                    stat: script.param.stat
                };
                break;
            };

            // acordou (awake)
            case 9: {
                param = {
                    id: script.param.id
                };
                break;
            };

            // damage cru (sem nenhum efeito adicional e sem chance de errar)
            case 99: {
                param = {
                    id: script.param.id,
                    damage: script.param.damage,
                    type: script.param.type
                };
                break;
            };
        };

        // adiciona a função de executar em fileira sincronizada
        this.fn.push(next => this.fns[fn_name].bind(this)(param, next));
    };
};

BattleScript.prototype.exec = function (callback) {
    // executa array de funções e quando todas forem executadas chama callback
    async.series(this.fn, callback);
};

BattleScript.prototype.fnNames = {
    "preTurn": 0,
    "postTurn": 1,
    "move_damage": 2,
    "buff_nerf": 3,
    "run": 4,
    "change_monster": 5,
    "health_potion": 6,
    "magic_seal": 7,
    "status_problem": 8,
    "awake": 9,
    "raw_damage": 99
};

BattleScript.prototype.fns = [];

// Aplicar dano
BattleScript.prototype.fns[2] = function (param, next) {

    // console.log(param, "executando: move_damage");

    // caso não tenha acertado o move ou esteja travado
    if (!param.hited || !param.canDoMove) {
        next();
        return;
    };

    async.parallel([
        callback => {
            this.mysqlQuery(
                "UPDATE `monsters` SET `current_HP` = `current_HP` - '" + this.escapeSQL(param.damage) + "' WHERE `id` = '" + this.escapeSQL(param.id) + "'",
                callback
            );
        },
        callback => {

            let mana = Resources.Moves[param.move_id].manaNeeded;

            if (mana) {
                this.mysqlQuery(
                    "UPDATE `monsters` SET `current_MP` = `current_MP` - '" + mana + "' WHERE `id` = '" + this.escapeSQL(param.attacker_id) + "'",
                    callback
                );
            } else {
                callback();
            };
        }
    ], () => next());
};

// Aplicar buff/nerf
BattleScript.prototype.fns[3] = function (params, next) {

    const fns = [];

    // console.log("executando 'buff/nerf'", params);

    // caso não tenha acertado o move ou esteja travado
    if (!params.hited || !params.canDoMove) {
        next();
        return;
    };

    //// console.log("OIIIIII", params, this.battle_id);

    for (let i = 0, l = params.effect.length; i < l; i ++) {
        // vendo qual stat vai buffar/nerfar

        let param = params.effect[i];

        switch (param.stat) {
            case "atk": {
                param.stat = 0;
                break;
            };
            case "def": {
                param.stat = 1;
                break;
            };
            case "spe": {
                param.stat = 2;
                break;
            };
            case "accuracy": {
                param.stat = 3;
                break;
            };
            case "evasion": {
                param.stat = 4;
                break;
            };
        };

        fns.push(callback => {
            this.mysqlQuery("INSERT INTO `battle_buffs_nerfs` SET ?", {
                id: null,
                battle_id: this.battle_id,
                affected_monster: param.target,
                value: param.value,
                stats_affected: param.stat,
                duration: 10
            }, callback);
        });
    };

    async.parallel(fns, next);
};

// Fugir da luta (só pode em wild)
BattleScript.prototype.fns[4] = function (param, next) {

    //// console.log(param, "executando: run");

    // se pode fugir
    if (param.canRun) {
        async.parallel({
            // setar q n esta fazendo ação de batalha e o tipo de batalha é zero
            setCurrentDoing: callback => {
                this.mysqlQuery(
                    "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                    [this.auth.uid],
                    callback
                );
            },
            // desabilitar monstro selvagem
            disableWild: callback => {
                this.mysqlQuery(
                    "UPDATE `monsters` SET `enabled` = '0' WHERE `type` = '1' AND `uid` = ? AND `enabled` = '1' AND `id` = ?",
                    [this.auth.uid, param.target],
                    callback
                );
            },
            // remover batalha
            removeBattle: callback => {
                this.mysqlQuery(
                    "DELETE FROM `battle` WHERE `uid` = ?",
                    [this.auth.uid],
                    callback
                );
            }
        }, () => next());
    } else {
        // se não pode fugir
        next();
    };
};

// Mudar de monstro
BattleScript.prototype.fns[5] = function (param, callback) {

    let change = [],
        uid;

    if (this.auth) {
        uid = this.auth.uid;
    } else {
        uid = param.uid;
    };

    // console.log(param, uid, this.auth, "PARAMETRO DE MUDAR MONSTRO");

    async.waterfall([
        // pega id dos monstros que vai efetuar a troca
        next => {
            this.mysqlQuery(
                "SELECT `monster0`, `monster" + this.escapeSQL(param.changeID) + "` FROM `monsters_in_pocket` WHERE `uid` = ?", 
                [uid],
                (err, data) => next(err, data)
            );
        },
        // muda de posição
        (results, next) => {

            results = results[0];

            // monstro que vai ir pra batalha
            change[0] = results["monster" + param.changeID];
            // monstro que será substituido (q vai sair da batalha)
            change[1] = results["monster0"];

            // fazer update na db
            this.mysqlQuery(
                "UPDATE `monsters_in_pocket` SET `monster0` = '" + this.escapeSQL(change[0]) + "', `monster" + this.escapeSQL(param.changeID) + "` = ? WHERE `uid` = ?",
                [change[1], uid],
                err => next(err, true)
            );
        },
        // verificando se pode compartilhar xp na batalha
        (nothing, next) => {
            // console.log("AQUI1");
            if (param.hasExpShare) {
                next(null, true);
            } else {
                callback();
            };
        },
        // add exp share (e pq aos dois? pq o q saiu também terá xp compartilhada)
        () => {
            async.parallel([
                next => this.main.addExpShareToMonster({id: change[0]}, this.battle_id, next),
                next => this.main.addExpShareToMonster({id: change[1]}, this.battle_id, next)
            ], callback);
        } 
    ], (err, data) => {
        // console.log(err);
    });
};

// Usa item de poção healer
BattleScript.prototype.fns[6] = function (param, next) {

    // console.log(param);

    async.series([
        // desconta item
        callback => {
            instantiateGameCoreKlass(Bag, this.main.main)
                .discontItem(
                    +param.item_id,
                    () => callback()
                );
        },
        // adiciona HP
        callback => {
            instantiateGameCoreKlass(Species, this.main.main)
                .addHp(
                    param.heal, 
                    param.monster_id, 
                    callback
                );
        },
        () => next()
    ]);
};

// Usar selo mágico (domar monstro selvagem)
BattleScript.prototype.fns[7] = function (param, next) {

    // console.log(param);

    async.series([
        // desconta item
        callback => {
            instantiateGameCoreKlass(Bag, this.main.main)
                .discontItem(
                    +param.item_id,
                    () => callback()
                );
        },
        callback => {
            // ver se domou ou não
            if (param.tamed) {
                // se domou
                async.waterfall([
                    // transforma monstro selvagem em monstro do domador
                    cb => {
                        this.mysqlQuery(
                            "UPDATE `monsters` SET `type` = '0' WHERE `id` = ?",
                            [param.monster_id],
                            (err, data) => cb(err, data)
                        );
                    },
                    // pega espaço livre no bracelete
                    (results, cb) => {
                        instantiateGameCoreKlass(Species, this.main.main)
                            .getFreeSpaceInPocket(freespace => cb(null, freespace));
                    },
                    // se tiver espaço livre, joga monstro dentro do bracelete
                    (freespace, cb) => {
                        if (typeof(freespace) == "number") {
                            async.parallel([
                                _next => {
                                    this.mysqlQuery(
                                        "UPDATE `monsters` SET `in_pocket` = '1' WHERE `id` = ?",
                                        [param.monster_id],
                                        _next
                                    );
                                },
                                _next => {
                                    this.mysqlQuery(
                                        "UPDATE `monsters_in_pocket` SET `monster" + String(freespace) + "` = '" + this.escapeSQL(param.monster_id) + "' WHERE `uid` = ?",
                                        [this.auth.uid],
                                        _next
                                    );
                                }
                            ], cb);
                        } else {
                            //cb(null, 1);
                            instantiateGameCoreKlass(Box, this.main.main)
                                .insert(param.monster_id, cb);
                        };
                    }
                ], (err, data) => {
                    // apaga batalha
                    async.parallel({
                        // setar q n esta fazendo ação de batalha e o tipo de batalha é zero
                        setCurrentDoing: callback => {
                            this.mysqlQuery(
                                "UPDATE `current_doing` SET `doing_battle_action` = '0', `battle_type` = '0' WHERE `uid` = ?",
                                [this.auth.uid],
                                callback
                            );
                        },
                        // remover batalha
                        removeBattle: callback => {
                            this.mysqlQuery(
                                "DELETE FROM `battle` WHERE `uid` = ?",
                                [this.auth.uid],
                                callback
                            );
                        }
                    }, () => next());
                });
            } else {
                // se não domou
                // console.log("Não domou!");

                next();
            };
        }
    ]);
};

// Status problem 
BattleScript.prototype.fns[8] = function (param, next) {

    // caso não tenha acertado o move ou esteja travado
    if (!param.hited || !param.canDoMove) {
        next();
        return;
    };

    this.mysqlQuery(
        "UPDATE `monsters` SET `status_problem` = ? WHERE `id` = ?",
        [param.stat, param.id],
        (err, results) => {
            // console.log("HAaaaaaaaaaaaaaaYYYYYYYY");
            // console.log(err, results);
            next();
        }
    );
};

// Acordou
BattleScript.prototype.fns[9] = function (param, next) {

    // console.log(param, "fn_name -> 'awake'");

    this.mysqlQuery(
        "UPDATE `monsters` SET `status_problem` = '0' WHERE `id` = ?",
        [param.id],
        next
    );
};

// Raw Damage
BattleScript.prototype.fns[99] = function (param, next) {

    this.mysqlQuery(
        "UPDATE `monsters` SET `current_HP` = `current_HP` - '" + param.damage + "' WHERE `id` = '" + param.id + "'",
        next
    );
};

module.exports = Battle;

const 
    Tamer = require("./tamer.js"),
    Player = require("./player.js"),
    Species = require("./species.js"),
    Bag = require("./bag.js"),
    Quest = require("./quest.js"),
    Map = require("./map.js"),
    Box = require("./box.js");

const { instantiateGameCoreKlass } = require("../utils/utils.js");

/*
    `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `uid` int(10) NOT NULL,
    `battle_type` tinyint(1) NOT NULL,
    `field_category` tinyint(1) NOT NULL,
    `field_weather` tinyint(1) NOT NULL,
    `field_special` tinyint(1) NOT NULL
*/