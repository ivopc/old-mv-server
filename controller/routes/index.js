const async = require("async");

const Species = require("../../core/species.js");

module.exports = (req, res) => {

    async.parallel({
        // pegar monstros no bracelete
        monsters: next => {
            const species = new Species({auth: {uid: req.session["uid"]}, db: {mysql: req.mysql}}, null, {uid: req.session["uid"]}, {mysql: req.mysql}, null);        
            console.log(species);
            species.getMonstersInPocket((err, data) => {
                species.filterMonstersData(err, data, next);
            });
        }
        // avatar: next => {
        //     req.mysql.query(
        //         "SELECT `sprite` FROM `in_game_data` WHERE `uid` = '" + req.session["uid"] + "'",
        //         next
        //     );
        // }
        // player: next => {
        //     req.mysql.query(
        //         "SELECT `rank`, `exp` FROM `in_game_data` WHERE `uid` = '" + req.session["uid"] + "'"
        //     )
        // }
    //rank, exp, badges
    }, (err, data) => {

        const team = [];

        for (let i = 0; i < 6; i ++)
            team[i] = data.monsters["monster" + i];

        res.json({
            team,
            nickname: req.session["nickname"],
            rank: "Ranger"
        });
    });


};