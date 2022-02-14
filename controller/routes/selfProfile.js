const Species = require("../../core/species.js");

module.exports = function (req, res) {
    async.parallel({
        // pegar monstros no bracelete
        monsters: next => {
            const species = new Species(null, {uid: req.session["uid"]}, {mysql: req.mysql}, null);        
            species.getMonstersInPocket(next);
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
        res.json({
            team: data.monsters,
            nickname: req.session["nickname"]
        });
    });
};