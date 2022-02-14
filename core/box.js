const 
    async = require("async"),
    _ = require("underscore");

const Species = require("./species.js");

const Base = require("./base.js");

const EVENTS = require("./../database/socket_events.json");

const Box = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
};

Box.prototype = Object.create(Base.prototype);

// inserir monstro na box
Box.prototype.insert = function (monster_id, callback) {
    async.auto({
        freeSpace: next => this.getFreeSpace(next),
        changeInPocket: next => {
            this.mysqlQuery(
                "UPDATE `monsters` SET `in_pocket` = '0' WHERE `id` = ?",
                [monster_id], 
                next
            );
        },
        insert: ["freeSpace", (data, next) => {
            this.mysqlQuery("INSERT INTO `monsters_in_box` SET ?", {
                id: null,
                uid: this.auth.uid,
                slot_position: data.freeSpace,
                monster_id
            }, next);
        }]
    }, callback);
};

// pegar monstros na box (com paginação)
Box.prototype.get = function (input) {

    input = input || {};
    input.page = input.page || 1;

    // definindo os monstros que vai pegar na página (32 per page)
    let max = 32 * input.page,
        min = (max - 32);

    // corrige o número máximo por página
    max--;

    console.log({min, max});

    let in_box_data;

    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `monster_id`, `slot_position` FROM `monsters_in_box` WHERE `slot_position` BETWEEN " + this.escapeSQL(min) + " AND " + this.escapeSQL(max) + " AND `uid` = '" + this.auth.uid + "'", 
                (err, results) => next(err, results)
            )
        },
        (results, next) => {

            const 
                species = new Species(null, this.auth, this.db),
                fn = [];

            in_box_data = results;

            for (let i = 0; i < results.length; i ++)
                fn.push(cb => species.get(results[i].monster_id, cb));

            async.parallel(fn, next);
        },
        data => {
            

            for (let i = 0; i < in_box_data.length; i ++)
                data[i].slot_position = in_box_data[i].slot_position;

            //console.log("oiii", data[0]);

            this.socket.emit(EVENTS.SEND_IN_BOX_MONSTERS, data);
        }
    ]);
};

// pegar espaço livre na box para depositar monstro lá
Box.prototype.getFreeSpace = function (callback) {

    this.mysqlQuery(
        "SELECT `slot_position` FROM `monsters_in_box` WHERE `uid` = ?",
        [this.auth.uid], 
        (err, results) => {
            if (!results.length) {
                callback(err, 0);
                return;
            };

            let freeSpace;

            for (let i = 0; i < 501; i ++) {
                freeSpace = _.findWhere(results, {slot_position: i});

                if (!freeSpace) {
                    freeSpace = i;
                    break;
                };
            };

            callback(err, freeSpace);
    });
};

// mudar posição do monstro na box
// not empty box -> empty box
Box.prototype.changeInBoxMonsterPosition = function (input) {

    console.log("not empty box -> empty box");

    async.parallel({
        from: callback => {
            this.mysqlQuery(
                "SELECT * FROM `monsters_in_box` WHERE `slot_position` = ? AND `uid` = ?",
                [input.from, this.auth.uid],
                (err, results) => callback(err, results[0])
            );
        },
        to: callback => {
            this.mysqlQuery(
                "SELECT * FROM `monsters_in_box` WHERE `slot_position` = ? AND `uid` = ?",
                [input.to, this.auth.uid],
                (err, results) => callback(err, results[0])
            );
        } 
    }, (err, data) => {
        if (!data.to) {
            this.mysqlQuery(
                "UPDATE `monsters_in_box` SET `slot_position` = ? WHERE `slot_position` = ? AND `uid` = ?",
                [input.to, input.from, this.auth.uid]
            );
        };
    });
};

// mudança de posição da party pra uma da box vazia
// party -> empty box
Box.prototype.changePartyToEmptyBox = function (input) {
    console.log("party -> empty box");

    const species = new Species(null, this.auth, this.db);

    async.parallel({
        from: next => species.getMonstersInPocket(next),
        to: next => {
            this.mysqlQuery(
                "SELECT * FROM `monsters_in_box` WHERE `slot_position` = ? AND `uid` = ?",
                [input.to, this.auth.uid],
                (err, results) => next(err, results[0])
            );
        }
    }, (err, data) => {
        if (data.from["monster" + input.from] && !data.to) {
            async.auto({
                removeFromParty: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters_in_pocket` SET `monster" + this.escapeSQL(input.from) + "` = '0' WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                removeFromPocket: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `in_pocket` = '0' WHERE `id` = '" + this.escapeSQL(data.from["monster" + input.from].id) + "'",
                        next
                    );
                },
                moveToBox: next => {
                    this.mysqlQuery("INSERT INTO `monsters_in_box` SET ?", {
                        id: null,
                        uid: this.auth.uid,
                        slot_position: input.to,
                        monster_id: data.from["monster" + input.from].id
                    }, next);
                },
                organizeParty: ["removeFromParty", (_data, next) => species.reorganizeParty(next)]
            }, (err, data) => {
                console.log(err, data);
                this.socket.emit(EVENTS.UPDATE_SPECIFIC_BOX_MONSTERS);
            });
        };
    });
};

// mudança de posição da box para uma party vazia
// box -> empty party
Box.prototype.changeBoxToEmptyParty = function (input) {
    console.log(input);
    console.log("box -> empty party");

    async.parallel({
        from: next => {
            this.mysqlQuery(
                "SELECT * FROM `monsters_in_box` WHERE `slot_position` = ? AND `uid` = ?",
                [input.from, this.auth.uid],
                (err, results) => next(err, results[0])
            );
        },
        to: next => {
            new Species(null, this.auth, this.db)
                .getMonstersInPocket(next);
        }
    }, (err, data) => {
        console.log(data.from);
        if (data.from && !data.to["monster" + input.to]) {
            console.log("FOI CRL!");
            async.auto({
                deleteBox: next => {
                    this.mysqlQuery(
                        "DELETE FROM `monsters_in_box` WHERE `slot_position` = ? AND `uid` = ?",
                        [input.from, this.auth.uid],
                        next
                    );
                },
                updateParty: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters_in_pocket` SET `monster" + this.escapeSQL(input.to) + "` = '" + this.escapeSQL(data.from.monster_id) + "' WHERE `uid` = ?",
                        [this.auth.uid],
                        next                        
                    )
                },
                addInPocket: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `in_pocket` = '1' WHERE `id` = '" + this.escapeSQL(data.from.monster_id) + "'",
                        next
                    );
                },
                organizeParty: ["updateParty", (_data, next) => {
                    new Species(null, this.auth, this.db)
                        .reorganizeParty(next);
                }]

            }, (err, data) => {
                console.log(err, data);
            });
        };
    })
};

// mudança de posição de box para uma party
/// box -> party
Box.prototype.changeBoxToParty = function (input) {
    console.log(input);
    console.log("box -> party");
    async.parallel({
        from: next => {
            this.mysqlQuery(
                "SELECT * FROM `monsters_in_box` WHERE `slot_position` = ? AND `uid` = ?",
                [input.from, this.auth.uid],
                (err, results) => next(err, results[0])
            );
        },
        to: next => {
            new Species(null, this.auth, this.db)
                .getMonstersInPocket(next);
        }
    }, (err, data) =>  {
        if (data.from && data.to["monster" + input.to]) {
            //console.log("LOLADS");
            async.parallel({
                changeFrom: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters_in_pocket` SET `monster" + this.escapeSQL(input.to) + "` = '" + this.escapeSQL(data.from.monster_id) + "' WHERE `uid` = ?",
                        [this.auth.uid],
                        next
                    );
                },
                addPocketFrom: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `in_pocket` = '1' WHERE `id` = '" + this.escapeSQL(data.from.monster_id) + "'",
                        next
                    );
                },
                changeTo: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters_in_box` SET `monster_id` = '" + this.escapeSQL(data.to["monster" + input.to].id) + "' WHERE `uid` = '" + this.escapeSQL(this.auth.uid) + "' AND `slot_position` = '" + this.escapeSQL(input.from) + "'",
                        next
                    );
                },
                addPocketTo: next => {
                    this.mysqlQuery(
                        "UPDATE `monsters` SET `in_pocket` = '0' WHERE `id` = '" + this.escapeSQL(data.to["monster" + input.to].id) + "'",
                        next
                    );
                }
            }, (err, data) => {
                console.log(err, data);
                //this.socket.emit(EVENTS.UPDATE_SPECIFIC_BOX_MONSTERS);
            });
        }
    });
};

module.exports = Box;