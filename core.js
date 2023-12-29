// libs externas
const 
    fs = require("fs"),
    url = require("url");

// banco de dados
const db = require("./models/setdb.js").inConn();

const mysqlQuery = function (db, arg1, arg2, arg3) {
    db.getConnection((err, conn) => {
        if (err) throw err;
        const q = conn.query(arg1, arg2, arg3);
        q.on("end", () => conn.release());
    });
};

// core das libs internas
const
    Player = require("./core/player.js"),
    Flag = require("./core/flag.js"),
    Move = require("./core/move.js"),
    Chat = require("./core/chat.js"),
    Species = require("./core/species.js"),
    Box = require("./core/box.js"),
    Battle = require("./core/battle.js"),
    Wild = require("./core/wild.js"),
    Map = require("./core/map.js"),
    Bag = require("./core/bag.js"),
    Mart = require("./core/mart.js"),
    Quest = require("./core/quest.js"),
    Tamer = require("./core/tamer.js"),
    Notify = require("./core/notify.js");

const Main = function (socket, server, auth) {
    /**@type {DataMaster} */
    this.dataMasterEvents;
    this.socket = socket;
    this.server = server;
    this.db = db;
    /** @type {{ uid: string }} */
    this.auth = auth;
};


// manipulação de i/o (pós-autenticar) de quando o usuário conectar
Main.prototype.conn = function (socket, scServer) {
    const auth = url.parse(socket.request.url, true).query;
    this.auth = auth;
    this.socket = socket;
    this.server = scServer;
    console.log(`Oi usuário de ID ${auth.uid}`);
    this.dataMasterEvents = new DataMaster(this);
    // configurar conexão do jogador
    instantiateGameCoreKlass(Player, this).connect();

    // instantiateGameCoreKlass(Player, this)
    //     .insertVip(7779600000, function () {
    //         console.log(arguments);
    //     });

    // ping-pong
    socket.on(EVENTS.PING, () => instantiateGameCoreKlass(Player, this).pong()
    );

    // jogador requisita usar item
    socket.on(EVENTS.USE_ITEM, input => 
        instantiateGameCoreKlass(Bag, this)
            .useItem(input)
    );

    // comprar item
    socket.on(EVENTS.BUY_ITEM, input => 
        instantiateGameCoreKlass(Mart, this)
            .buy(input)
    );

    // pegar monstros que estão na box
    socket.on(EVENTS.GET_MONSTER_BOX, input =>
        instantiateGameCoreKlass(Box, this)
            .get(input)
    );

    // jogador requisita um encontro com monstro selvagem
    socket.on(EVENTS.REQUEST_WILD_ENCOUNTER, () =>
        instantiateGameCoreKlass(Wild, this)
            .search()
    );

    // jogador aceitou/recusou batalha selvagem
    socket.on(EVENTS.ACCEPT_REJECT_WILD_BATTLE, input => 
        instantiateGameCoreKlass(Wild, this)
            .handleAcceptReject(input)
    );

    // escolher ação na batalha
    socket.on(EVENTS.CHOOSE_BATTLE_ACTION, input => 
        instantiateGameCoreKlass(Battle, this)
            .initHandleAction(input)
    );

    // requisitar troca de monstro faintado
    socket.on(EVENTS.TRADE_FAINTED_MONSTER_PVP, input =>
        instantiateGameCoreKlass(Battle, this)
            .requestChangeFaintedMonsterPvP(input)
    );

    // requisitar timer no PvP
    socket.on(EVENTS.CLAIM_PVP_TIMER, () =>
        instantiateGameCoreKlass(Battle, this)
            .claimTimer()
    );

    // jogador requisita executar flag
    socket.on(EVENTS.EXEC_FLAG, input => 
        instantiateGameCoreKlass(Flag, this)
            .requestExecution(input)
    );

    // jogador quer mudar de mapa
    socket.on(EVENTS.CHANGE_MAP, input => 
        instantiateGameCoreKlass(Map, this)
            .changeMap(input)
    );

    // jogagor muda skin
    socket.on(EVENTS.CHANGE_SKIN, input => 
        instantiateGameCoreKlass(Player, this)
            .changeSkin(input)
    );

    // PEGAR dados do profile do próprio player
    socket.on(EVENTS.REQUEST_SELF_PROFILE_DATA, () => 
        instantiateGameCoreKlass(Player, this)
            .getSelfProfileData()
    );

    // pegar dados do profile
    socket.on(EVENTS.REQUEST_PROFILE_DATA, input =>
        instantiateGameCoreKlass(Player, this)
            .getProfileData(input)
    );

    // box to party
    socket.on(EVENTS.CHANGE_BOX_TO_PARTY, input =>
        instantiateGameCoreKlass(Box, this)
            .changeBoxToParty(input)
    );

    // box to empty party
    socket.on(EVENTS.CHANGE_BOX_TO_EMPTY_PARTY, input =>
        instantiateGameCoreKlass(Box, this)
            .changeBoxToEmptyParty(input)
    );

    // party to empty box
    socket.on(EVENTS.CHANGE_PARTY_TO_EMPTY_BOX, input =>
        instantiateGameCoreKlass(Box, this)
            .changePartyToEmptyBox(input)
    );

    // jogador quer mudar posição do monstro na party
    socket.on(EVENTS.CHANGE_PARTY_POSITION, input => 
        instantiateGameCoreKlass(Species, this)
            .changePartyPosition(input)
    );

    // mudar posição da box do monstro
    socket.on(EVENTS.CHANGE_BOX_POSITION, input =>
        instantiateGameCoreKlass(Box, this)
            .changeInBoxMonsterPosition(input)
    );

    // pegar monstros/itens
    socket.on(EVENTS.GET_MONSTERS_ITEMS, input => 
        instantiateGameCoreKlass(Player, this)
            .getItemsMonster(input)
    );

    // pegar infos do player
    socket.on(EVENTS.GET_PLAYER_DATA, () =>
        instantiateGameCoreKlass(Player, this)
            .getPlayerData()
    );

    // pegar lista de quests (com paginação)
    socket.on(EVENTS.GET_QUESTS_LIST, input => 
        instantiateGameCoreKlass(Quest, this)
            .getList(input)
    );

    // pegar dados de quest especifica
    socket.on(EVENTS.GET_SPECIFIC_QUEST_DATA, input =>
        instantiateGameCoreKlass(Quest, this)
            .getSpecific(input)
    );

    // alguma requisição em relação a quest especifica
    socket.on(EVENTS.REQUEST_QUEST, input =>
        instantiateGameCoreKlass(Quest, this)
            .request(input)
    );

    // requisição pra iniciar a missão
    socket.on(EVENTS.REQUEST_START_QUEST, input =>
        instantiateGameCoreKlass(Quest, this)
            .startQuest(input)
    );

    // requisição pra pegar dados das notificações na page
    socket.on(EVENTS.GET_NOTIFICATIONS, input =>
        instantiateGameCoreKlass(Notify, this)
            .getNotifications(input)
    );

    // requisição pra pegar dados da notificação de aprender move
    socket.on(EVENTS.GET_MOVE_NOTIFICATION, input =>
        instantiateGameCoreKlass(Notify, this)
            .getMoveNotification(input)
    );

    // requisição pra pegar dados da notificação de evoluir
    socket.on(EVENTS.GET_EVOLVE_NOTIFICATION, input =>
        instantiateGameCoreKlass(Notify, this)
            .getEvolveNotification(input)
    );

    // requisição de pegar dados da venda
    socket.on(EVENTS.GET_MARKETPLACE_NOTIFICATION, input =>
        instantiateGameCoreKlass(Notify, this)
            .getMarketPlaceNotification(input)
    );


    // requisitar aprender move
    socket.on(EVENTS.REQUEST_LEARN_MOVE_NOTIFY_ACTION, input =>
        instantiateGameCoreKlass(Notify, this)
            .requestLearnMove(input)
    );

    // requisitar não aprender move
    socket.on(EVENTS.REQUEST_DONT_LEARN_MOVE_NOTIFY_ACTION, input =>
        instantiateGameCoreKlass(Notify, this)
            .requestDontLearnMove(input)
    );
    

    // requisitar evoluir monstro
    socket.on(EVENTS.REQUEST_EVOLVE_NOTIFY_ACTION, input =>
        instantiateGameCoreKlass(Notify, this)
            .requestEvolveMonster(input)
    );
    
    // setar que já viu notificação
    socket.on(EVENTS.SET_NOTIFICATION_SEEN, input =>
        instantiateGameCoreKlass(Notify, this)
            .setSeen(input)
    );
    
    
    // quando jogador desconectar
    socket.on(EVENTS.DISCONNECT, () =>
        instantiateGameCoreKlass(Player, this)
            .disconnect()
    );
};

// ************
// <MIDDLEWARES>

// autenticar a entrada do client
Main.prototype.authConn = function (req, next) {

    let input = url.parse(req.url, true).query;

    console.time("i/o Auth");

    // procura token na db
    new mysqlQuery(
        db.mysql, 
        "SELECT `active` FROM `security_tokens` WHERE `uid` = ? AND token = ?",
        [input.uid, input.token],
        (err, results) => {
            console.timeEnd("i/o Auth");
            console.log(results);
            // verificar IP e informar GM atividade suspeita
            // aconteceu algum erro ou os dados não são compatíveis
            if (err || !results.length) {
                next(true);
                return;
            };

            // permite entrar
            next();
    });
};

// manipulação de inscrição nos canais
Main.prototype.subscribe = function (req, scServer, next) {

    // storando nome do canal e autenticação do client
    const 
        channel = String(req.channel),
        auth = url.parse(req.socket.request.url, true).query;

    // ver qual canal é
    switch(channel.substr(0, 1)) {

        // mapa
        case "m": {
            instantiateGameCoreKlass(Map, this)
                .getActivePlayersInMap();
            break;
        };

        // privado
        case "u": {
            // pegando id do usuário e autenticando, se não for ele mesmo: negar
            if (channel.split("-")[1] !== auth.uid) {
                next(true);
                return;
            };
            break;
        };

        // chat
        case "c": {
            instantiateGameCoreKlass(Chat, this).subscribe({
                type: req.data.type
            });

            break;
        };

        // pvp
        case "p": {
            // checar se pode se inscrever naquele pvp
            console.log("AEUHAEUHEAUEH PVP", {channel});
            break;
        };

        // global
        case "g": {
            break;
        };
        default: {
            next(true);
            return;
        };
    };

    next();
};

// manipulação de publicação nos canais
Main.prototype.publishIn = function (req, scServer, next) {

    // storando nome do canal e autenticação do client
    const 
        channel = String(req.channel),
        auth = url.parse(req.socket.request.url, true).query;

    //console.log(channel);

    //tratando entrada  do canal
    switch(channel.substr(0, 1)) {

        // global
        case "g": {
            req.data.uid = +auth.uid;

            switch (+req.data.type) {
                // mensagem chat
                case 1: {
                    instantiateGameCoreKlass(Chat, this)
                        .sendMessage(next, req.data);
                    return;
                    break;
                };
            };
            
            next();
            break;
        };

        // mapa
        case "m": {
            //console.log("socket", req.data);

            // vendo o tipo de dado
            switch (req.data.dataType) {
                // envia que se mexeu no mapa
                case 1: {
                    instantiateGameCoreKlass(Move, this)
                        .walk(next, req.data);
                    break;
                };

                // envia que mudou de facing no mapa
                case 2: {
                    instantiateGameCoreKlass(Move, this)
                        .face(next, req.data);
                    break;
                };

                // envia nova mensagem no chat
                case 3: {
                    instantiateGameCoreKlass(Chat, this)
                        .sendMessage(next, req.data);
                    break;
                };
                // enviar que está digitando
                case 5: {
                    instantiateGameCoreKlass(Chat, this)
                        .sendTyping(next, req.data);
                    break;
                };

                default: {
                    next(true);
                    break;
                }
            };
            break;
        };

        // chat
        case "c": {
            break;
        };

        // pvp
        case "p": {
            console.log("publishou heahuheahuea");
            if (req.data.type == 3)
                req.data.uid = +auth.uid;
            
            next();
            break;
        };

        // mensagem privada para jogador
        case "u": {
            if ( !("action" in req.data) ) {
                next(true);
                return;
            };
            let player = instantiateGameCoreKlass(Player, this);
            req.data.uid = +auth.uid;
            switch(req.data.action) {
                case 1: {break;};
                case 2: {break;};
                case 3: {
                    player.sendPvPInvite(auth.uid, channel.split("-")[1], req, next);
                    return;
                };
                case 4: {
                    player.respondPvPInvite(auth.uid, channel.split("-")[1], req.data.accept, next);
                    return;
                };

                default: {
                    next(true);
                    return;
                };
            };

            next();
            break;
        };

        // datamaster
        case "d": {
            console.log("Publishou");
            next();
            break;
        };
        // nenhuma das acima
        default: {
            next(true);
            return;
        };
    };
};

// após a publicação ser processada e autenticada, controle de enviar para quem
Main.prototype.publishOut = function (req, next) {
    // storando nome do canal e autenticação do client

    const 
        channel = String(req.channel),
        auth = url.parse(req.socket.request.url, true).query;

    // pegar primeira linha da string

    switch(channel.substr(0, 1)) {
        // mapa e global
        case "g":
        case "m": 
        {
            // não deixar o client publicar para ele mesmo
            if (req.data.uid != auth.uid) {
                next();
            } else {
                next(true);
            };
            break;
        };
        // chat
        case "c": {
            break;
        };
        // pvp
        case "p": {
            next();
            break;
        };

        // privado player
        case "u": {
            next();
            break;
        };
        // datamaster
        case "d": {
            next();
            break;
        }
    };
};

// manipulação de emição
Main.prototype.emit = function (req, next) {
    next();
};



// </MIDDLEWARES>
// **************



const EVENTS = {
    "PING": "0",
    "USE_ITEM": "10",
    "BUY_ITEM": "11",
    "GET_MONSTER_BOX": "12",
    "REQUEST_WILD_ENCOUNTER": "20",
    "ACCEPT_REJECT_WILD_BATTLE": "22",
    "CHOOSE_BATTLE_ACTION": "30",
    "TRADE_FAINTED_MONSTER_PVP": "31",
    "CLAIM_PVP_TIMER": "39",
    "EXEC_FLAG": "40",
    "CHANGE_MAP": "50",
    "CHANGE_SKIN": "51",
    "REQUEST_SELF_PROFILE_DATA": "52",
    "REQUEST_PROFILE_DATA": "53",
    "CHANGE_BOX_TO_PARTY": "62",
    "CHANGE_BOX_TO_EMPTY_PARTY": "63",
    "CHANGE_PARTY_TO_EMPTY_BOX": "64",
    "CHANGE_PARTY_POSITION": "65",
    "CHANGE_BOX_POSITION": "67",
    "GET_MONSTERS_ITEMS": "68",
    "GET_PLAYER_DATA": "69",
    "GET_QUESTS_LIST": "70",
    "GET_SPECIFIC_QUEST_DATA": "71",
    "GET_SPECIFIC_MONSTER_DATA": "72",
    "REQUEST_QUEST": "74",
    "REQUEST_START_QUEST": "75",
    "GET_NOTIFICATIONS": "80",
    "GET_MOVE_NOTIFICATION": "81",
    "GET_EVOLVE_NOTIFICATION": "82",
    "GET_MESSAGE_NOTIFICATION": "83",
    "REQUEST_LEARN_MOVE_NOTIFY_ACTION": "84",
    "REQUEST_EVOLVE_NOTIFY_ACTION": "85",
    "GET_MARKETPLACE_NOTIFICATION": "86",
    "REQUEST_DONT_LEARN_MOVE_NOTIFY_ACTION": "87",
    "SET_NOTIFICATION_SEEN": "88",
    "DISCONNECT": "disconnect"
};
/*

sockets =>

    namespaces =>
        0 => ping-pong
        20 => jogador solicita uma batalha selvagem
        21 => jogador recebe uma batalha selvagem (só servidor pode enviar)
        30 => jogador recebe informações da batalha, para ser iniciada (só servidor pode)
        31 => jogador envia um ataque
        32 => jogador recebe os movimentos do turno (só servidor pode)
        33 => jogador é informado que a batalha acabou (só servidor pode)
        40 => jogador solicita ver se flag está disponível
        50 => jogador solicita mudar de mapa
        99 => quando servidor envia informação para o client iniciar (só servidor pode)

    canais =>
        g => mensagens globais, de administradores para jogadores

        u-[uid] => usuário | uid = id do usuário

        m[id] => mapas | id = número do mapa

        c[id] => chats | id = identificação do chat
            0 = global
            1 = clan

        p[id] => PvP | id = identificação do PvP

*/

 module.exports = Main;

 const DataMaster = require("./datamaster.js");
const Base = require("./core/base.js");
const { instantiateGameCoreKlass } = require("./utils/utils.js");
