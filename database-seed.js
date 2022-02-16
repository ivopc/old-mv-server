const PlayerData = require("./core/playerdata");

const pdata = new PlayerData();

Promise.all([
    new Promise(resolve => 
        pdata.insert({
            uid: 1,
            nickname: "SouXiterMex1",
            online: false,
            sprite: 2,
            map: 7,
            pos_x: 2,
            pos_y: 3,
            pos_facing: 3
        }, 
    resolve)
    ),
    new Promise(resolve => 
        pdata.insert({
            uid: 2,
            nickname: "Roberto",
            online: false,
            sprite: 2,
            map: 7,
            pos_x: 2,
            pos_y: 3,
            pos_facing: 3
        }, 
    resolve)
    )
]).then(() => {
    console.log("Players database data inserted, it's done!");
});