const Formulas = function () {};

// Calcular o damage do ataque
Formulas.prototype.applyDamage = function (move, attacker, target, buffs) {

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
Formulas.prototype.applyStatusProblem = function (move, attacker, target) {

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
Formulas.prototype.applyAccuracy = function (move, buff_nerf) {

    buff_nerf = buff_nerf || 0;

    // se for impossível de errar
    if (typeof(move.accuracy) == "boolean" && move.accuracy)
        return true;

    // chance comum de acerto
    const rate = math.random.between([0, 100]);
    return rate <= move.accuracy * Resources.StatChange.accuracy[buff_nerf];
};

// Tentar domar monstro
Formulas.prototype.tryTameMonster = function (monster, seal_id, hp) {

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
Formulas.prototype.treatBuffNerf = function (monsters_id, buffs_nerfs, data) {
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
        let buff_nerf = buffs_nerfs[i], affected;

        // vendo se o monstro é do oponente ou do player
        if (buff_nerf.affected_monster == monsters_id.player) {
            affected = "player"
        } else if (buff_nerf.affected_monster == monsters_id.opponent) {
            affected = "opponent";
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

module.exports = Formulas;