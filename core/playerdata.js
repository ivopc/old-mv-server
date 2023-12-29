const PlayersModel = new Map([
    [0, {
        uid: 0,
        nickname: "",
        online: false,
        sprite: 0,
        map: 0,
        pos_x: 0,
        pos_y: 0,
        pos_facing: 0      
    }]
]);

//setInterval(() => console.log(PlayersModel), 3000);

const PlayerData = function () {};

// inserir na db
PlayerData.prototype.insert = function (object, callback) {
    PlayersModel.set(Number(object.uid), object);
    callback();
};

// pegar dados de um player especifico
PlayerData.prototype.get = function (uid, callback, _connection) {
    callback(null, PlayersModel.get(Number(uid)));
};

// setar algum dado especifico
PlayerData.prototype.set = function (uid, object, callback) {

    console.log("setter pdata", object);
    const player = { ... PlayersModel.get(Number(uid)) };
    PlayersModel.set(Number(uid), { ... player, ... object});
    typeof callback === "function" ? callback(null, PlayersModel.get(Number(uid))) : null;
};

PlayerData.prototype.has = function (uid) {
    return PlayersModel.has(Number(uid));
};

// pegar players que estão online no mapa especifico
PlayerData.prototype.getActivePlayersInMap = function (map_id, notUid, callback) {
    const arr = [ ...PlayersModel.values() ];
    const players = arr.filter(player => player.map == map_id && player.online === true && player.uid !== +notUid)
    callback(null, players);
};

PlayerData.prototype.getAll = function (map_id, notUid, callback) {
    return [ ...PlayersModel.values() ];
};

// updeitar posição do player no mapa para certa direção
PlayerData.prototype.walk = function (uid, direction, callback) {

    const player = { ... PlayersModel.get(Number(uid)) };

    switch (direction) {
        case 0: { // up
            player.pos_y --;
            break;
        };
        case 1: { // right
            player.pos_x ++;
            break;
        };
        case 2: { // down
            player.pos_y ++;
            break;
        };
        case 3: { // left
            player.pos_x --;
            break;
        };
    };
    player.pos_facing = direction;
    PlayersModel.set(Number(uid), player);
    typeof callback === "function" ? callback(null, PlayersModel.get(Number(uid))) : null;
};

// updeitar facing do player
PlayerData.prototype.face = function (uid, direction, callback) {
    const player = PlayersModel.get(Number(uid));
    PlayersModel.set(Number(uid), {... player, pos_facing: direction});
    typeof callback === "function" ? callback(null, PlayersModel.get(Number(uid))) : null;

};

module.exports = PlayerData;

// ** cheatsheet

// r.connect({
//     host: "localhost",
//     port: 28015
// }, (err, conn) => {
    // ** cria tabela
    // r.tableCreate("game_data").run(conn, (err, data) => {
    //     console.log(data);
    // });

    // limpa db
    //r.db("test").tableDrop("game_data").run(conn, () => console.log("limpou!"));

    // ** inserir na tabela
    // r.table("game_data").insert([
    //     {
    //         uid: 1,
    //         nickname: "Ivopc",
    //         map: 3,
    //         online: true,
    //         pos_x: 29,
    //         pos_y: 21,
    //         pos_facing: 0,
    //         sprite: 2
    //     }
    // ]).run(conn, (err, data) => {
    //     console.log(data);
    // });

    // ** buscar valores
    // r.table("game_data").filter(r.row("uid").eq(1)).run(conn, (err, cursor) => {
    //         cursor.toArray((err, data) => {
    //             console.log(data[0]);
    //         });
    // });

    //** update
    // r.table("game_data").
    // filter(r.row("uid").eq(1)).
    // update({pos_x: 2}).
    // run(conn, function(err, result) {
    //     if (err) throw err;
    //     console.log(result);
    // });

    // ** update add (increment)
    // r.table("game_data").
    // filter(r.row("uid").eq(1)).
    // update({pos_y: r.row("pos_y").add(1)}).
    // run(conn, (err, result) => {
    //     if (err) throw err;
    //     console.log(result);
    // });

    // ** update menos (substact)
    // r.table("game_data").
    // filter(r.row("uid").eq(1)).
    // update({pos_y: r.row("pos_y").sub(1)}).
    // run(conn, (err, result) => {
    //     if (err) throw err;
    //     console.log(result);
    // });

    // ** deletar
    // r.table("game_data")
    //     .filter(r.row("uid").eq(1))
    //     .delete()
    //         .run(conn, (err, data) => {
    //            console.log(data); 
    //         });

    // ** pegar todos
    // r.table("game_data").run(conn, function(err, cursor) {
    //     if (err) throw err;
    //     cursor.toArray(function(err, result) {
    //         if (err) throw err;
    //         console.log(JSON.stringify(result, null, 2));
    //     });
    // });
//});