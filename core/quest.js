const 
    async = require("async"),
    _ = require("underscore");

const EVENTS = require("./../database/socket_events.json");

const Base = require("./base.js");

const Quest = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
};

Quest.prototype = Object.create(Base.prototype);

const Bag = require("./bag.js");

const Resources = {
    Quests: require("../database/quests.json")
};

// Inserir missão na db
Quest.prototype.insert = function (quest_id, callback) {
    this.mysqlQuery("INSERT INTO `quests` SET ?", {
        id: null,
        uid: this.auth.uid,
        quest_id,
        completed: 0
    }, callback);
};

// Iniciar quest
Quest.prototype.startQuest = function (input) {
    const quest_id = input.quest_id;

    if ( !("quest_id" in input) || isNaN(input.quest_id))
        return;

    this.insert(quest_id, (err, results) => {
        console.log("oiii xD", results);
        this.socket.emit(EVENTS.SEND_QUEST_REQUEST_ACTION, {
            param: 4
        });
    });
};

// Alguma requisição em relação a quest especifica
Quest.prototype.request = function (input) {
    if ( !("id" in input) )
        return;

    async.parallel({
        checkIfQuestIsInDB: next => {
            this.mysqlQuery(
                "SELECT * FROM `quests` WHERE `uid` = ? AND `quest_id` = ?",
                [this.auth.uid, input.id],
                (err, results) => next(err, results)
            );
        },
        checkIfQuestIsComplete: next => this.checkIfQuestIsComplete(input.id, next)
    }, (err, data) => {
        // 0 -> iniciar missão: perguntar se quer iniciar missão ou não.
        // 1 -> iniciou missão e não concluiu ainda.
        // 2 -> completou missão, dar premiações.
        // 3 -> missão já foi concluida.

        console.log(data);

        if (!data.checkIfQuestIsInDB.length) {
            console.log("Não há missão!");
            this.socket.emit(EVENTS.SEND_QUEST_REQUEST_ACTION, {
                param: 0
            });
            return;
        };

        if (data.checkIfQuestIsInDB[0].completed == 1) {
            console.log("Missão já foi concluida.");
            this.socket.emit(EVENTS.SEND_QUEST_REQUEST_ACTION, {
                param: 3
            });
            return;
        };

        if (data.checkIfQuestIsComplete) {
            console.log("Missão completa");


            this.complete(input.id, () => {
                this.socket.emit(EVENTS.SEND_QUEST_REQUEST_ACTION, {
                    param: 2
                });
            });
        } else {
            console.log("Missão incompleta");
            this.socket.emit(EVENTS.SEND_QUEST_REQUEST_ACTION, {
                param: 1
            });
            
        };
    });
};

// Pegar lista de missões
Quest.prototype.getList = function (input) {

    input = input || {};

    input.page = input.page || 1;

    // limit = número de produtos que vai exibir por página
    const limit = 6,
          starting_limit = (input.page - 1) * limit;

    this.mysqlQuery(
        "SELECT * FROM `quests` WHERE `uid` = ? AND `completed` = '0' ORDER BY `id` DESC LIMIT " + this.escapeSQL(starting_limit) + ", " + this.escapeSQL(limit),
        [this.auth.uid],
        (err, results) => {
            this.socket.emit(EVENTS.SEND_QUEST_LIST, results)
        }
    );
};

// Pegar lista de missões (cru/seco)
Quest.prototype.getListRaw = function (callback) {
    this.mysqlQuery(
        "SELECT * FROM `quests` WHERE `uid` = ? AND `completed` = '0'",
        [this.auth.uid],
        (err, data) => callback(err, data)
    );
};

// Pegar dados de missão especifica
Quest.prototype.getSpecific = function (input) {
    this.mysqlQuery(
        "SELECT `action_type`, `monsterpedia_id` FROM `quest_action` WHERE `uid` = ? AND `quest_id` = ?",
        [this.auth.uid, input.quest_id],
        (err, results) => this.socket.emit(EVENTS.SEND_SPECIFIC_QUEST_DATA, results)
    );
};

// Requisitar pra completar missão
Quest.prototype.complete = function (quest_id, callback) {

    async.waterfall([
        next => {
            this.checkIfQuestIsComplete(quest_id, next);
        },
        (complete, next) => {

            if (!complete) {
                console.log("Não completou a quest");
                this.socket.emit("99999", {error: true});
                return;
            };

            const quest = Resources.Quests[quest_id],
                rewards = {
                    silver: 0,
                    exp: 0,
                    items: []
                };

            for (let i = 0; i < quest.rewards.length; i ++) {
                let reward = quest.rewards[i];

                switch (reward.type) {
                    case "silver": {
                        rewards.silver += reward.amount;
                        break;
                    };

                    case "item": {
                        rewards.items.push({id: reward.item_id, amount: reward.amount});
                        break;
                    };

                    case "exp": {
                        rewards.exp += reward.amount;
                        break;
                    };
                };
            };

            async.parallel({
                giveSilvers: next => this.giveSilvers(rewards.silver, next),
                giveItems: next => this.giveItems(rewards.items, next),
                giveExp: next => next(null, true),
                completeQuest: next => {
                    this.mysqlQuery(
                        "UPDATE `quests` SET `completed` = '1' WHERE `uid` = ? AND `quest_id` = ?",
                        [this.auth.uid, quest_id],
                        next
                    );
                }
            }, (err, data) => {
                console.log("Completou quest");
                callback(err, data);
                this.socket.emit(EVENTS.UPDATE_MONSTERS_ITEMS, {
                    items: true
                });
            });

        }
    ]);
};

// Checar se tem missões
Quest.prototype.checkIfHaveQuests = function (callback) {
    this.mysqlQuery(
        "SELECT `uid` FROM `quests` WHERE `uid` = ? AND `completed` = '0'", 
        [this.auth.uid],
        (err, results) => callback(err, results.length > 0)
    );
};

// Checar se missão está completa
Quest.prototype.checkIfQuestIsComplete = function (quest_id, callback) {
    async.parallel({
        quest: next => {
            this.mysqlQuery(
                "SELECT * FROM `quests` WHERE `uid` = ? AND `quest_id` = ?",
                [this.auth.uid, quest_id],
                (err, results) => next(err, results)
            );
        },
        actions: next => {
            this.mysqlQuery(
                "SELECT * FROM `quest_action` WHERE `uid` = ? AND `quest_id` = ?",
                [this.auth.uid, quest_id],
                (err, results) => next(err, results)
            );
        }
    }, (err, data) => {

        // se quest não existir na db
        if (!data.quest.length) {
            callback(err, false);
            return;
        };

        // se quest já for completada
        if (data.quest[0].completed) {
            callback(err, false);
            return;
        };

        callback(err, this.compareQuestData(quest_id, data));
    });
};

Quest.prototype.compareQuestData = function (quest_id, data) {
    // se não tiver nenhuma ação completa
    if (!data.actions.length)
        return false;

    //console.log(data.actions);

    // pega requisitos
    const requisits = Resources.Quests[quest_id].requisits;

    // loopa requisitos nas ações registradas na db para checar se todas estão feitas
    for (let i = 0; i < requisits.length; i ++) {
        let requisit = requisits[i];

        let amount = data.actions.filter(
            data =>
                data.action_type == this.invertedToken[requisit.type] && 
                data.monsterpedia_id == requisit.monsterpedia_id
        );

        console.log("Tem todas as ações?", amount.length >= requisit.amount);

        if ( !(amount.length >= requisit.amount) )
            return false;
    };

    return true;
};

// Checar se o monstro selvagem está nos requisitos da missão
Quest.prototype.checkIfMonsterIsInRequisits = function (quest_id, monsterpedia_id) {
    return Resources.Quests[quest_id].requisits.find(requisit => requisit.monsterpedia_id == monsterpedia_id);
};

// Inserir ações feitas da quest
Quest.prototype.insertQuestAction = function (insert, callback) {

    console.log("ações que serão inseridas", insert);

    const fns = [];

    // pega todas as ações e transforma para inseri-las no banco de dados[]
    for (let i = 0; i < insert.length; i ++)
        fns.push(next => {
            this.mysqlQuery("INSERT INTO `quest_action` SET ?", {
                id: null,
                uid: this.auth.uid,
                quest_id: insert[i].quest_id,
                action_type: insert[i].action_type,
                monsterpedia_id: insert[i].monsterpedia_id
            }, next);
        });

    async.parallel(fns, callback);
};

Quest.prototype.giveItems = function (data, callback) {

    console.log("tnc fdp", data);

    const fns = [];

    // pega todas as ações e transforma para inseri-las no banco de dados
    for (let i = 0; i < data.length; i ++)
        fns.push(next => {
            new Bag(this.socket, this.auth, this.db)
                .insertItem(null, data[i].id, data[i].amount, next);
        });

    async.series(fns, callback);
};

// Dar silvers a missão concluida
Quest.prototype.giveSilvers = function (amount, callback) {

    this.mysqlQuery(
        "UPDATE `in_game_data` SET `silver` = `silver` + '" + this.escapeSQL(amount) + "' WHERE `uid` = ?",
        [this.auth.uid],
        callback
    );
};

Quest.prototype.token = {
    1: "defeat",
    2: "tame",
    3: "drop"
};

Quest.prototype.invertedToken = {
    "defeat": 1, 
    "tame": 2,
    "drop": 3
};

module.exports = Quest;

/*
var requisits = [
    {"type": "defeat", "monsterpedia_id": 10, "amount": 5},
    {"type": "tame", "monsterpedia_id": 1, "amount": 1}
];

var dbdata = [
    {action_type: 1, monsterpedia_id: 10},
    {action_type: 1, monsterpedia_id: 10},
    {action_type: 1, monsterpedia_id: 10},
    {action_type: 1, monsterpedia_id: 10},
    {action_type: 1, monsterpedia_id: 10},
    {action_type: 2, monsterpedia_id: 1}
];

var token = {
    1: "defeat",
    2: "tame",
    3: "drop"
};

var invertedToken = {
    "defeat": 1, 
    "tame": 2,
    "drop": 3
};

for (let i = 0; i < requisits.length; i ++) {
    let requisit = requisits[i];

    let amount = dbdata.filter(
        data =>
            data.action_type == invertedToken[requisit.type] && 
            data.monsterpedia_id == requisit.monsterpedia_id
    );

    console.log(amount.length >= requisit.amount);

    if ( !(amount.length >= requisit.amount) )
        console.log("Não foi");

    // dbdata.find(
    //     data =>
    //         data.action_type == invertedToken[requisit.type]
    // );
};

var filtered = {};

for (let i = 0; i < dbdata.length; i ++) {

    let data = dbdata[i];

    if (!(data.action_type + "-" + data.monsterpedia_id in filtered)) {
        filtered[data.action_type + "-" + data.monsterpedia_id] = 1;
    } else {
        filtered[data.action_type + "-" + data.monsterpedia_id]++;
    };
};

console.log(filtered);

var missionComplete = true;

for (let i = 0; i < dbdata.length; i ++) {
    let find = requisits.find(
        requisit => 
            requisit.type == token[dbdata[i].action_type] &&
            requisit.monsterpedia_id == dbdata[i].monsterpedia_id &&
            requisit.amount <= dbdata[i].amount
    );
    
    if (!find)
        missionComplete = false;
};

if (requisits.length != dbdata.length)
    missionComplete = false;

console.log(missionComplete ? "Missão concluída!" : "Missão não está concluída");
*/