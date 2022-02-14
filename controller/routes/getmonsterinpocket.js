var async = require("async"),
    Resources = {
        Dex: require("./../../database/dex.json")
    }
    Species = require("./../../core/species.js");

var Helper = function () {};

// organizar e enviar infos dos monstros que estão na pocket ao client
Helper.prototype.sendInfo = function (err, data, res) {
    //console.log(data);
    // define todos os monstros q estão na pocket
    var allMonsters = [];

    // "loopa" as informações dos monstros para passar pro client
    for(let i = 0; i < 6; i++) {

        // define monstro
        var monster = data["monster" + i];


        console.log({monster});

        // se tiver um monstro na ordem da pocket
        if (monster) {
            // pega todas as infos para passar pro client
            allMonsters[i] = {
                "monsterpedia_id": monster.monsterpedia_id,
                "id": monster.id,
                "name": Resources.Dex[monster.monsterpedia_id].specie,
                "types": Resources.Dex[monster.monsterpedia_id].types,
                "level": monster.level,
                "isInitial": monster.is_initial ? true : false,
                "stats": {
                    "hp": monster.stats_HP,
                    "atk": monster.stats_attack,
                    "def": monster.stats_defense,
                    "spe": monster.stats_speed
                },
                "moves": [
                    monster.move_0,
                    monster.move_1,
                    monster.move_2,
                    monster.move_3
                ],
                "hp": {
                    "current": monster.current_HP,
                    "total": monster.stats_HP
                },
                "exp": monster.experience
            };
        } else {
            // se não houver nenhum monstro, então define zero
            allMonsters[i] = null;
        };
    };

    // envia resposta ao client dos monstros que estão no pocket
    res.json(allMonsters);
};

module.exports = function (req, res) {
    // pegar monstros que estão no bolso e todas suas infos
    new Species().getMonstersInPocket(
        req.session.uid,
        req.mysql,
        function (err, data) {
            // após pegar, enviar as infos para o client
            new Helper().sendInfo(
                err,
                data,
                res
            );
        }
    );
};