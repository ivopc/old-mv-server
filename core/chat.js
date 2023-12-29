const PlayerData = require("./playerdata.js");

const Base = require("./base.js");

const Chat = function (main, socket, auth, db, scServer, dataMasterEvents) {
    Base.call(this, main, socket, auth, db, scServer, dataMasterEvents);
};

Chat.prototype = Object.create(Base.prototype);

Chat.prototype.sendMessage = function (next, input) {
    new PlayerData()
        .get(this.auth.uid, (err, data) => {
            input.nickname = data.nickname;
            next();
        });
};

Chat.prototype.sendTyping = function (next, input) {
    input.uid = +this.auth.uid;

    next();
};

module.exports = Chat;