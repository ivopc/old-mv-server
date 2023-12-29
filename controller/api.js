const PlayerData = require("../core/playerdata");

const pdata = new PlayerData();

exports.players = function (req, res) {
    res.json({
        players: JSON.parse(JSON.stringify(pdata.getAll()))
    });
};