// Script para aplicar ações na batalha
const Script = function (main, battle_id) {

    Base.call(this, {}, main.auth, main.db, {});

    this.main = main;

    this.fn = [];
    this.battle_id = battle_id;
};

Script.prototype = Object.create(Base.prototype);

Script.prototype.codeParser = function (scripts) {
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

Script.prototype.exec = function (callback) {
    // executa array de funções e quando todas forem executadas chama callback
    async.series(this.fn, callback);
};

Script.prototype.fnNames = {
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

Script.prototype.fns = [];

// Aplicar dano
Script.prototype.fns[2] = function (param, next) {

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
Script.prototype.fns[3] = function (params, next) {

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
Script.prototype.fns[4] = function (param, next) {

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
Script.prototype.fns[5] = function (param, callback) {

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
Script.prototype.fns[6] = function (param, next) {

    // console.log(param);

    async.series([
        // desconta item
        callback => {
            new Bag(null, this.auth, this.db)
                .discontItem(
                    +param.item_id,
                    () => callback()
                );
        },
        // adiciona HP
        callback => {
            new Species(null, this.auth, this.db)
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
Script.prototype.fns[7] = function (param, next) {

    // console.log(param);

    async.series([
        // desconta item
        callback => {
            new Bag(null, this.auth, this.db)
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
                        new Species(null, this.auth, this.db)
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
                        instantiateGameCoreKlass(Box, this.main)
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
Script.prototype.fns[8] = function (param, next) {

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
Script.prototype.fns[9] = function (param, next) {

    // console.log(param, "fn_name -> 'awake'");

    this.mysqlQuery(
        "UPDATE `monsters` SET `status_problem` = '0' WHERE `id` = ?",
        [param.id],
        next
    );
};

// Raw Damage
Script.prototype.fns[99] = function (param, next) {

    this.mysqlQuery(
        "UPDATE `monsters` SET `current_HP` = `current_HP` - '" + param.damage + "' WHERE `id` = '" + param.id + "'",
        next
    );
};

module.exports = Script;