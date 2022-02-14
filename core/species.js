const async = require("async");

const Base = require("./base.js");

const SP_CHECKER = 1;

const Species = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
};

Species.prototype = Object.create(Base.prototype);

const Resources = {
    Dex: require("./../database/dex.json"),
    Formulas: require("./../database/formulas.js"),
    Learnset: require("./../database/learnset.json")
};

const EVENTS = require("./../database/socket_events.json");

const helper = {};

helper.boolToInt = function (bool) {
    // switch (bool) {
    //     case true:
    //     case 1:
    //     {
    //         return 1;
    //     };

    //     case false:
    //     case 0:
    //     {
    //         return 0;
    //     };
    // }
    return bool == true ? 1 : 0;
};

helper.isFloat = n => Number(n) === n && n % 1 !== 0;

helper.sanatizePartyPositionChange = number => isNaN(number) || helper.isFloat(number) || number > 5 || number < 0;

// inserir nova espécie (incompleto)
Species.prototype.insert = function (data, callback) {

    // se a id do player, id da espécie e level não for incluido dá erro
    if (
        !("monsterpedia_id" in data) ||
        !("level" in data)
    )
        return;

    // id de auto_increment
    data.id = null;

    // uid do usuário, "dono" do monstro
    data.uid = data.uid || this.auth.uid;

    // habilitado
    data.enabled = 1;

    // tipo do monstro? 
    // 0 = monstro do jogador
    // 1 = monstro selvagem (wild)
    // 2 = monstro de domador (bot/npc)
    // 3 = monstro indomável (de missão)
    data.type = data.type || 0;

    // é shiny?
    data.shiny = data.shiny || Resources.Formulas.Species.Generate.Shiny() ? 1 : 0;
 
    // é o monstro inicial?
    data.is_initial = helper.boolToInt(data.is_initial) || 0;

    // pode trocar?
    data.can_trade = "can_trade" in data ? helper.boolToInt(data.can_trade) : 1;

    // está no bolso do jogador?
    data.in_pocket = helper.boolToInt(data.in_pocket) || 0;

    // id do monstro na monsterpedia
    data.monsterpedia_id = data.monsterpedia_id;

    // nickname
    data.nickname = "";

    // level do monstro
    data.level = data.level || 0;

    // pega o level e mede a experiencia
    data.experience = Resources.Formulas.Exp.Calc.level2Exp(data.level);
 
    // pega o genero do monstro
    data.gender = data.gender || Resources.Formulas.Species.Generate.Gender(data.monsterpedia_id);

    // item q o monstro está segurando
    data.hold_item = data.hold_item || 0;

    // item q o monstro foi capturado
    data.catch_item = data.catch_item || 1;

    // movimentos de batalha do monstro
    const moves = this.learnAllMoves({
        level: data.level,
        id: data.monsterpedia_id
    });

    //console.log("moves", moves);

    data.move_0 = moves[0] || 0;
    data.move_1 = moves[1] || 0;
    data.move_2 = moves[2] || 0;
    data.move_3 = moves[3] || 0;

    // cria objeto dos singular points
    const 
        SP = Resources.Formulas.Stats.Generate.SP(),
    // cria todos os stats
        stats = Resources.Formulas.Stats.Calc.stats.all({
            sp: {
                hp: SP.hp,
                atk: SP.atk,
                def: SP.def,
                spe: SP.spe
            },
            dp: {
                hp: 0,
                atk: 0,
                def: 0,
                spe: 0
            },
            level: data.level,
            baseStats: Resources.Dex[data.monsterpedia_id]["baseStats"]
        });

    //console.log("sp", SP);
    //console.log("stats", stats);

    data.status_problem = 0;

    // stats do monstro
    data.current_HP = stats.hp;
    data.stats_HP = stats.hp;
    data.stats_attack = stats.atk;
    data.stats_defense = stats.def;
    data.stats_speed = stats.spe;

    // mp
    data.current_MP = 100;
    data.stats_MP = 100;

    // determina drop points do monstro
    data.dp_HP = 0;
    data.dp_attack = 0;
    data.dp_defense = 0;
    data.dp_speed = 0;

    // determina os singular points do monstro
    data.sp_HP = data.sp_HP || SP.hp;
    data.sp_attack = data.sp_attack || SP.atk;
    data.sp_defense = data.sp_defense || SP.def;
    data.sp_speed = data.sp_speed || SP.spe;

    // determina as vitaminas
    data.vita_HP = 0;
    data.vita_attack = 0;
    data.vita_defense = 0;
    data.vita_speed = 0;

    // é um ovo? (boolean)
    data.egg_is = helper.boolToInt(data.egg_is) || 0;

    // se sim, vai chocar quando? 0 caso não seja um ovo
    data.egg_date = data.egg_date || 0;

    this.mysqlQuery("INSERT INTO `monsters` SET ?", data, callback);
};

// pegar informações de um monstro pelo seu ID (sem autenticação/cru)
Species.prototype.get = function (id, callback) {
    this.mysqlQuery(
        "SELECT * FROM `monsters` WHERE `id` = ?",
        [id], 
        (err, results) => callback(err, results[0])
    );
};

// pegar informações de um monstro pelo seu ID, porém terá autenticação
Species.prototype.getPlayerMonsterData = function (input) {
    this.get(input.id, (err, data) => {
        if (data.uid != this.auth.uid)
            return console.log("It's different");

        this.socket.emit("9999999999999", data);
    });
};

// pegar espaço livre no bolso, respeitando monstros na pocket e etc (completo)
Species.prototype.getFreeSpaceInPocket = function (callback) {

    this.mysqlQuery(
        "SELECT `monster0`, `monster1`, `monster2`, `monster3`, `monster4`, `monster5` FROM `monsters_in_pocket` WHERE `uid` = ?", 
        [this.auth.uid],
        (err, results) => {

            let monstersInPocket = results[0],
            // ordem do pocket que o monstro será colocado
                setIndex;

            // loopa os monstros no pocket
            for (let i = 0; i < 6; i++) {

                // se não houver nenhum monstro na index iterada
                // coloca ele ali e sai do loop
                if (monstersInPocket["monster" + (i)] == 0) {
                    setIndex = i;
                    break;
                // se todas as index estão em uso então põe o monstro no box
                } else {
                    setIndex = false;
                };
            };

            callback(setIndex);
    });
};

// pegar informação de todos os monstros que estão no bolso (PRINCIPAL)
Species.prototype.getMonstersInPocket = function (main_callback, id) {

    id = id || this.auth.uid;

    async.waterfall([

        // pegar o id de todos os monstros que estão no pocket
        callback => {
            this.mysqlQuery(
                "SELECT `monster0`, `monster1`, `monster2`, `monster3`, `monster4`, `monster5` FROM `monsters_in_pocket` WHERE `uid` = ?", 
                [id],
                callback
            );
        },

        // retornar informações de todos os monstros
        (results, fields, callback) => {
            //console.log(results[0].monster0);

            // definir monstro que estão no pocket
            const 
                monsterInPocket = results[0],
                fns = {};

            for (let i = 0; i < 6; i++) {
                fns["monster" + i] = next => {
                    this.getInPocketMonsterInfo(
                        monsterInPocket,
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
Species.prototype.getInPocketMonsterInfo = function (monsterInPocket, monsterIndex, next) {

    // ver se o id é maior que 0, se for há um monstro no pocket
    if (monsterInPocket[monsterIndex] > 0) {
        // se tiver, pega as informações dele
        // e manda pro proximo
        this.get(monsterInPocket[monsterIndex], next);
    } else {
        // se não, enviar como nulo
        next(null, null);
    };
};

// mudar monstro de posição na party
Species.prototype.changePartyPosition = function (input) {

    // tratando inputs
    if (
        helper.sanatizePartyPositionChange(input.from) || 
        helper.sanatizePartyPositionChange(input.to) ||
        input.from == input.to
    )
        return console.log(123);

    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `monster" + this.escapeSQL(input.from) + "`, `monster" + this.escapeSQL(input.to) + "` FROM `monsters_in_pocket` WHERE `uid` = ?",
                [this.auth.uid],
                next
            );
        },
        (results, fields) => {
            results = results[0];

            var change = [];

            // monstro que vai ir
            change[0] = results["monster" + input.to];
            // monstro que será substituido
            change[1] = results["monster" + input.from];

            // não mexa nisso !!!!!
            this.mysqlQuery(
                "UPDATE `monsters_in_pocket` SET `monster" + this.escapeSQL(input.to) + "` = ?, `monster" + this.escapeSQL(input.from) + "` = ? WHERE `uid` = ?",
                [change[1], change[0], this.auth.uid]
            );
        }
    ]);
};

// reorganizar party
Species.prototype.reorganizeParty = function (callback) {

    async.waterfall([
        next => this.getMonstersInPocket(next),
        (inParty, next) => {
            const 
                monstersArray = [],
                newMonstersObject = {};

            for (let i = 0; i < 6; i ++) {
                if (inParty["monster" + i])
                    monstersArray.push(inParty["monster" + i].id);
            };

            for (let i = 0; i < 6; i ++) {
                if (monstersArray[i]) {
                    newMonstersObject["monster" + i] = monstersArray[i];
                } else {
                    newMonstersObject["monster" + i] = 0;
                };
            };

            console.log("novo objeto de monstros arrumado", newMonstersObject);

            this.mysqlQuery(
                "UPDATE `monsters_in_pocket` SET `monster0` = ?, `monster1` = ?, `monster2` = ?, `monster3` = ?, `monster4` = ?, `monster5` = ? WHERE `uid` = ?",
                [
                    newMonstersObject.monster0, 
                    newMonstersObject.monster1, 
                    newMonstersObject.monster2, 
                    newMonstersObject.monster3, 
                    newMonstersObject.monster4, 
                    newMonstersObject.monster5, 
                    this.auth.uid
                ],
                next
            );
        }
    ], callback);
};

// pegar monstro 'vivo' na party
Species.prototype.getAliveMonster = function (callback, uid) {

    uid = uid || this.auth.uid;

    this.getMonstersInPocket((err, data) => {
        for (let i = 0; i < 6; i ++) {
            if (data["monster" + i] && data["monster" + i].current_HP > 0) {
                callback(err, i);
                return;
            };
        };

        // não tem nenhum vivo
        callback(err, -1);
    }, uid);
};

// adicionar HP ao monstro
Species.prototype.addHp = function (value, monster_id, callback) {

    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `current_HP`, `stats_HP` FROM `monsters` WHERE `id` = ?",
                [monster_id],
                next
            );
        },
        (results, fields, next) => {
            results = results[0];
            
            let HP = results.current_HP,
            // se valor do novo HP exceder o valor máximo de então seta o valor da HP stat
                newHP = HP + value > results.stats_HP ? results.stats_HP : HP + value;

            // console.log({value, HP, newHP, monster_id});

            this.mysqlQuery(
                "UPDATE `monsters` SET `current_HP` = ? WHERE `id` = ?",
                [newHP, monster_id],
                next
            );
        },
        (results, fields, next) => {
            //console.log({results, fields});
            next();
        },
        () => callback()
    ]);
};

// adicionar MP ao monstro
Species.prototype.addMp = function (value, monster_id, callback) {
    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `current_MP`, `stats_MP` FROM `monsters` WHERE `id` = ?",
                [monster_id],
                next
            );
        },
        (results, fields, next) => {
            results = results[0];
            
            let MP = results.current_MP,
            // se valor do novo HP exceder o valor máximo de então seta o valor da MP stat
                newMP = MP + value > results.stats_MP ? results.stats_MP : MP + value;

            // console.log({value, MP, newMP, monster_id});*/

            this.mysqlQuery(
                "UPDATE `monsters` SET `current_MP` = ? WHERE `id` = ?",
                [newMP, monster_id],
                next
            );
        },
        (results, fields, next) => {
            //console.log({results, fields});
            next();
        },
        () => callback()
    ]);
};

// healar monstros que estão na party do player
Species.prototype.healAllPlayerMonsters = function (callback, uid) {

    uid = uid || this.auth.uid;

    async.waterfall([
        next => this.getMonstersInPocket(next, uid),
        data => {

            // pilha de funções pra healar
            const recovery = [];

            // percorrer party toda
            for (let i = 0; i < 6; i ++) {
                if (data["monster" + i]) {
                    // healar status problem
                    recovery.push(cb => {
                        this.mysqlQuery(
                            "UPDATE `monsters` SET `status_problem` = '0' WHERE `id` = ?",
                            [data["monster" + i].id],
                            cb
                        );
                    });
                    // healear HP
                    recovery.push(cb => this.addHp(Infinity, data["monster" + i].id, cb));
                    // healear MP
                    recovery.push(cb => this.addMp(Infinity, data["monster" + i].id, cb));
                };
            };

            // executar todos
            async.parallel(recovery, () => callback(null, true));
        }
    ]);
};

// organizar e enviar infos dos monstros que estão na pocket ao client
Species.prototype.filterMonstersData = function (err, data, callback) {
    //console.log(data);

    new Bag(null, this.auth, this.db)
        .checkIfHaveItem(SP_CHECKER, (err, have) => {
            const monsters = {};
            for (let i = 0; i < 6; i++) {
                if (data["monster" + i]) {

                    let monster = data["monster" + i];

                    const {
                        id, uid, shiny, is_initial, in_pocket, monsterpedia_id, nickname, level, 
                        experience, gender, hold_item, catch_item, move_0, move_1, move_2, 
                        move_3, current_HP, status_problem, stats_HP, current_MP, stats_MP, 
                        stats_attack, stats_defense, stats_speed, egg_is, egg_date
                    } = monster;

                    const total = {
                        id, uid, shiny, is_initial, in_pocket, monsterpedia_id, nickname, level, 
                        experience, gender, hold_item, catch_item, move_0, move_1, move_2, 
                        move_3, current_HP, status_problem, stats_HP, current_MP, stats_MP, 
                        stats_attack, stats_defense, stats_speed, egg_is, egg_date
                    };

                    total.canSeeSP = false;

                    if (!have) {
                        monsters["monster" + i] = total;
                    } else {
                        total.canSeeSP = true;
                        total.sp_HP = monster.sp_HP;
                        total.sp_attack = monster.sp_attack;
                        total.sp_defense = monster.sp_defense;
                        total.sp_speed = monster.sp_speed;
                        monsters["monster" + i] = total;
                    };
                } else {
                    monsters["monster" + i] = null;
                };
            };

            callback(err, monsters);
        });
};

// filtrar dados de um único monstro
Species.prototype.uniqueMonsterDataFilter = function (err, data, callback) {
    new Bag(null, this.auth, this.db)
        .checkIfHaveItem(SP_CHECKER, (err, have) => {

            const {
                id, uid, shiny, is_initial, in_pocket, monsterpedia_id, level, 
                experience, gender, hold_item, catch_item, move_0, move_1, move_2, 
                move_3, current_HP, status_problem, stats_HP, current_MP, stats_MP, 
                stats_attack, stats_defense, stats_speed, egg_is, egg_date
            } = data;

            const total = {
                id, uid, shiny, is_initial, in_pocket, monsterpedia_id, level, 
                experience, gender, hold_item, catch_item, move_0, move_1, move_2, 
                move_3, current_HP, status_problem, stats_HP, current_MP, stats_MP, 
                stats_attack, stats_defense, stats_speed, egg_is, egg_date
            };

            total.canSeeSP = false;

            if (!have) {
                callback(err, total);
            } else {
                total.canSeeSP = true;
                total.sp_HP = data.sp_HP;
                total.sp_attack = data.sp_attack;
                total.sp_defense = data.sp_defense;
                total.sp_speed = data.sp_speed;
                callback(err, total);
            };
        });
};

// filtrar dados dos monstros de profile de outros players
Species.prototype.filterOtherProfileMonstersData = function (data) {
    const monsters = {};
    for (let i = 0; i < 6; i++) {
        if (data["monster" + i]) {

            let monster = data["monster" + i];

            const {
                id, uid, shiny, monsterpedia_id, level, 
                gender, hold_item, current_HP, stats_HP, current_MP, stats_MP, 
                stats_attack, stats_defense, stats_speed, egg_is, egg_date
            } = monster;

            const total = {
                id, uid, shiny, monsterpedia_id, level, 
                gender, hold_item, current_HP, stats_HP, current_MP, stats_MP, 
                stats_attack, stats_defense, stats_speed, egg_is, egg_date
            };

            monsters["monster" + i] = total;

        } else {
            monsters["monster" + i] = null;
        };
    };

    return monsters;
};

// Pega todos os moves que pode aprender até o level (usado para inserir novos
// monstros)
Species.prototype.learnAllMoves = function (object) {

    // pega o learnset do monstro e cria uma array para registrar os moves que
    // aprendeu
    var moves = Resources.Learnset[object.id].level,
        learn_moves = [];

    for (let i = 0, l = moves.length; i < l; i++) {
        // se o aprendizado do move for antes ou no level
        // adiciona na array de moves de aprendizado
        if (moves[i][0] <= object.level) {
            // se o número de moves for igual a 4 troca pelo primeiro
            // (4 -> maximo de moves q um monstro pode ter)
            if (learn_moves.length == 4) {
                learn_moves[3] = moves[i][1];
            } else {
                // senão adiciona na array de moves
                learn_moves.push(moves[i][1]);
            };
        };
    };
    // retorna os moves que aprendeu
    return learn_moves;
};

// Ensinar moves de acordo com o level que upou (usado quando monstro upa)
Species.prototype.learnMoveByLevel = function (object) {
    // new = novo level
    // current = level atual (antes de receber exp)
    // specie = pokémon

    // pega o learnset do pokémon e cria uma array para registrar os moves que
    // vai aprender
    const 
        moves = Resources.Learnset[object.specie.monsterpedia_id].level,
        learn_moves = [];

    // faz um loop do level antes de vencer o oponente até o level que upou
    // para pegar todos os ataques possíveis
    for(let i = object["new"]; i > object["current"]; --i) {

        // faz um loop em todo o learnset
        for (let j = 0, l = moves.length; j < l; j ++) {
                // se o level que percorreu enquanto upou tiver 
                // algum move de aprender adiciona na array esse move
                if (moves[j][0] == i)
                        learn_moves.push(moves[j][1]);
        }; 
    };
    // entrega inverso para aprender desde o level mais baixo
    return learn_moves.reverse();
};

// Após batalha adicionar exp e suas possíveis recompensas
Species.prototype.addExpRewards = function (object, callback) {

    // verifica se upou de level subtraindo suposto novo level com level antes de upar para incrementar na db
    let lvl_inc = object.level.new > object.level.current ? object.level.new - object.level.current : 0,
    // incrementa dp atual com dp do oponente que venceu
        dp = Resources.Formulas.Stats.Calc.stats.incDp(object.stats["dp"], object.opponent, object.isVip),
        specie = object.specie.current,
    // pega todos os golpes que aprendeu upando de level
        learn = this.learnMoveByLevel({
            new: object.level.new,
            current: object.level.current,
            specie
        });

    // ** Normalizar Drop Points

    // guarda stats que já chegaram ao limite
    const statusReached = [];
    Object.keys(dp).forEach(stat => {
        if (dp[stat] > 252) {
            dp[stat] = 252;
            // add status q chegou ao limite
            statusReached.push(stat);
        };
    });

    // se já chegou a limite, seta oq estava antes
    if ( (dp.hp + dp.atk + dp.def + dp.spe) >= 510) {

        dp = object.stats["dp"];

        // seta status q já chegaram ao limite
        statusReached.forEach(stat => {
            dp[stat] = 252;
        });
    };

    // dp.hp
    // dp.atk
    // dp.def
    // dp.spe

    if (object.evolved)
        specie = Resources.Dex[Resources.Dex[specie.monsterpedia_id].evos.default];

    console.log("Level atual: " + (object["level"]["current"]) + "\nQuantos lvl upou? " + (lvl_inc));
    console.log("Evoluiu? " + (object["evolved"] ? "Sim" : "Não"));
    console.log("monstro atual", specie);
    console.log("aprendeu", learn);
    console.log("drop points", dp);

    // calcula novos status de acordo com dp que adquiriu na batalha
    const stats = Resources.Formulas.Stats.Calc.stats.all({
        sp: {
            hp: object.stats.sp["hp"],
            atk: object.stats.sp["atk"],
            def: object.stats.sp["def"],
            spe: object.stats.sp["spe"]
        },
        dp: {
            hp: dp.hp + (object.stats.vita["hp"] * 10),
            atk: dp.atk + (object.stats.vita["atk"] * 10),
            def: dp.def + (object.stats.vita["def"] * 10),
            spe: dp.spe + (object.stats.vita["spe"] * 10)
        },
        level: object.level.new,
        baseStats: Resources.Dex[specie.monsterpedia_id]["baseStats"]
    });

    console.log("dp atk", dp.atk + (object.stats.vita["atk"] * 10), object.stats.vita["atk"] * 10, stats.atk);

    //console.log("stats", stats);
    // caso upou
    if (lvl_inc > 0) {
        console.log("--------------------------------------__");
        console.log("HELLOUUUU UPOU SIM");

        const notify = new Notify(this.socket, this.auth, this.db);

        async.parallel({
            learnMove: next => {
                console.log({learn});
                if (learn.length > 0) {
                    console.log("VAI APRENDER ALGO");
                    notify.insertLearnMove({id: object.id, moves: object.moves}, learn, next);
                } else {
                    console.log("Não vai aprender nada");
                    next(null, false);
                };
            },
            evolved: next => {
                if (object.evolved) {
                    notify.insertEvolveMonster({id: object.id}, specie.monsterpedia_id, next);
                } else {
                    next(null, false);
                };
            },
            updateMonster: next => {
                this.mysqlQuery(
                    "UPDATE `monsters` SET `monsterpedia_id` = '" + specie.monsterpedia_id + "', `level` = '" + object.level.new + "', `experience` = '" + object.exp + "', `stats_HP` = '" + stats.hp + "', `stats_attack` = '" + stats.atk + "', `stats_defense` = '" + stats.def + "', `stats_speed` = '" + stats.spe + "', `dp_HP` = '" + dp.hp + "', `dp_attack` = '" + dp.atk + "', `dp_defense` = '" + dp.def + "', `dp_speed` = '" + dp.spe + "' WHERE `id` = '" + object.id + "'",
                    next
                );
            }
        }, callback);

    } else {
        console.log("UPOU NADA POHA!!");
        this.mysqlQuery(
            "UPDATE `monsters` SET `experience` = '" + object.exp + "', `dp_HP` = '" + dp.hp + "', `dp_attack` = '" + dp.atk + "', `dp_defense` = '" + dp.def + "', `dp_speed` = '" + dp.spe + "' WHERE `id` = '" + object.id + "'",
            callback
        );
    };
};

// Ensinar move
Species.prototype.learnMove = function (monster_id, move_id, position, callback) {

    if (isNaN(position) || position < 0 || position > 3 || helper.isFloat(position) || isNaN(move_id) || helper.isFloat(move_id))
        return;

    // verificar se monstro é do player
    // trocar move do player com a position
    // mandar att monstros no client

    async.waterfall([
        // pegando user_id para verificar se é o monstro do player
        next => this.get(monster_id, next),
        (data, next) => {
            // verificando se o monstro é do player mesmo
            if (data.uid == this.auth.uid) {
                next(null, true);
            } else {
                next(1);
            };
        },
        (nothing, next) => {
            // atualizando move
            this.mysqlQuery(
                "UPDATE `monsters` SET `move_" + this.escapeSQL(position) + "` = ? WHERE `id` = ?",
                [move_id, monster_id],
                next
            );
        },
        (results, fields, next) => {
            // atualizar monstros
            this.socket.emit(EVENTS.UPDATE_MONSTERS_ITEMS, {
                monsters: true
            });

            next(null, true);
        }
    ], callback);
};

// Evoluir monstro
Species.prototype.evolve = function (monster_id, evolve_to, callback) {

    async.waterfall([
        // pegando user_id para verificar se é o monstro do player
        next => this.get(monster_id, next),
        (data, next) => {
            // verificando se o monstro é do player mesmo
            if (data.uid == this.auth.uid) {
                next(null, data);
            } else {
                next(1);
            };
        },
        (monsterData, next) => {

            // recalcular stats
            const stats = Resources.Formulas.Stats.Calc.stats.all({
                sp: {
                    hp: monsterData.sp_HP,
                    atk: monsterData.sp_attack,
                    def: monsterData.sp_defense,
                    spe: monsterData.sp_speed
                },
                dp: {
                    hp: monsterData.dp_HP + (monsterData.vita_HP * 10),
                    atk: monsterData.dp_attack + (monsterData.vita_attack * 10),
                    def: monsterData.dp_defense + (monsterData.vita_defense * 10),
                    spe: monsterData.dp_speed + (monsterData.vita_speed * 10)
                },
                level: monsterData.level,
                baseStats: Resources.Dex[evolve_to]["baseStats"]
            });

            console.log(stats);

            // evoluir monstro e mudar stats
            this.mysqlQuery(
                "UPDATE `monsters` SET `monsterpedia_id` = '" + evolve_to + "', `stats_HP` = '" + stats.hp + "', `stats_attack` = '" + stats.atk + "', `stats_defense` = '" + stats.def + "', `stats_speed` = '" + stats.spe + "' WHERE `id` = '" + monster_id + "'",
                next
            );
        },
        (results, fields, next) => {

            console.log(results, "POHAAAAA");

            // atualizar monstros
            this.socket.emit(EVENTS.UPDATE_MONSTERS_ITEMS, {
                monsters: true
            });

            next(null, true);
        }
    ], callback);
};

module.exports = Species;

const 
    Bag = require("./bag.js"),
    Notify = require("./notify.js");

/*
id
uid
wild
shiny
is_initial
can_trade
in_pocket
monsterpedia_id
level
experience
gender
hold_item
catch_item
move_1
move_2
move_3
move_4
current_HP
status_problem
stats_HP
current_MP
stats_MP
stats_attack
stats_defense
stats_speed
dp_HP
dp_attack
dp_defense
dp_speed
sp_HP
sp_attack
sp_defense
sp_speed
egg_is
egg_date

Learnset - aprender moves por level
level:
    [level, id do move]
    [1, 2]
    no caso acima é o level 1 e o id do move 2

*/