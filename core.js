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

const 
    Main = function () {},
    DataMaster = function () {};

// manipulação de entrada (pós-autenticar) método principal
Main.prototype.conn = function (socket, scServer) {

    const auth = url.parse(socket.request.url, true).query;

    if (this.authAdmin(auth)) {
        console.log("Oi admin");
        new DataMaster().conn(socket, scServer);
        return;
    };

    console.log(`Oi usuário de ID ${auth.uid}`);
    this.userConn(socket, scServer);
};

// manipulação de i/o (pós-autenticar) de quando o usuário conectar
Main.prototype.userConn = function (socket, scServer) {

    const 
        auth = url.parse(socket.request.url, true).query,
        EVENTS = this.events;

    // new Bag(socket, auth, db, scServer)
    //     .checkIfHaveItem(3, (err, have) => {
    //         console.log(have ? "Tem o item" : "Não tem o item");
    //     });

    // const species = new Species(null, auth, db);
    // species.getMonstersInPocket((err, data) => {
    //     species.filterMonstersData(err, data, (err, monster_data) => {
    //         console.log(monster_data);
    //     })
    // });

    // new Bag(socket, auth, db, scServer)
    //     .useItem({
    //         monster: 1,
    //         item: 15
    //     });

    // new Bag(socket, auth, db, scServer)
    //     .insertItem(null, 15, 2, () => {console.log("Oi");});

    // new Player(socket, auth, db, scServer)
    //     .checkIfIsVip((err, isVip) => console.log(isVip ? "É VIP sim." : "Não é VIP."));
    // const { id } = socket;
    // console.log({id});
    //console.log(scServer.clients);

    // scServer.clients[socket.id].emit("ola", {
    //     "kkk": 123
    // });

    // new Notify(socket, auth, db, scServer)
    //     .get();

    // new Species(socket, auth, db, scServer)
    //     .learnMove(229, 4, 1, function () {
    //         console.log("lol", arguments);
    //     });

    // configurar conexão do jogador
    new Player(socket, auth, db, scServer)
        .connect();

    // new Player(socket, auth, db, scServer)
    //     .insertVip(7779600000, function () {
    //         console.log(arguments);
    //     });

    // ping-pong
    socket.on(EVENTS.PING, () => 
        new Player(socket, auth, db, scServer)
            .pong()
    );

    // jogador requisita usar item
    socket.on(EVENTS.USE_ITEM, input => 
        new Bag(socket, auth, db, scServer)
            .useItem(input)
    );

    // comprar item
    socket.on(EVENTS.BUY_ITEM, input => 
        new Mart(socket, auth, db, scServer)
            .buy(input)
    );

    // pegar monstros que estão na box
    socket.on(EVENTS.GET_MONSTER_BOX, input =>
        new Box(socket, auth, db, scServer)
            .get(input)
    );

    // jogador requisita um encontro com monstro selvagem
    socket.on(EVENTS.REQUEST_WILD_ENCOUNTER, () =>
        new Wild(socket, auth, db, scServer)
            .search()
    );

    // jogador aceitou/recusou batalha selvagem
    socket.on(EVENTS.ACCEPT_REJECT_WILD_BATTLE, input => 
        new Wild(socket, auth, db, scServer)
            .handleAcceptReject(input)
    );

    // escolher ação na batalha
    socket.on(EVENTS.CHOOSE_BATTLE_ACTION, input => 
        new Battle(socket, auth, db, scServer)
            .initHandleAction(input)
    );

    // requisitar troca de monstro faintado
    socket.on(EVENTS.TRADE_FAINTED_MONSTER_PVP, input =>
        new Battle(socket, auth, db, scServer)
            .requestChangeFaintedMonsterPvP(input)
    );

    // requisitar timer no PvP
    socket.on(EVENTS.CLAIM_PVP_TIMER, () =>
        new Battle(socket, auth, db, scServer)
            .claimTimer()
    );

    // jogador requisita executar flag
    socket.on(EVENTS.EXEC_FLAG, input => 
        new Flag(socket, auth, db, scServer)
            .requestExecution(input)
    );

    // jogador quer mudar de mapa
    socket.on(EVENTS.CHANGE_MAP, input => 
        new Map(socket, auth, db, scServer)
            .changeMap(input)
    );

    // jogagor muda skin
    socket.on(EVENTS.CHANGE_SKIN, input => 
        new Player(socket, auth, db, scServer)
            .changeSkin(input)
    );

    // PEGAR dados do profile do próprio player
    socket.on(EVENTS.REQUEST_SELF_PROFILE_DATA, () => 
        new Player(socket, auth, db, scServer)
            .getSelfProfileData()
    );

    // pegar dados do profile
    socket.on(EVENTS.REQUEST_PROFILE_DATA, input =>
        new Player(socket, auth, db, scServer)
            .getProfileData(input)
    );

    // box to party
    socket.on(EVENTS.CHANGE_BOX_TO_PARTY, input =>
        new Box(socket, auth, db, scServer)
            .changeBoxToParty(input)
    );

    // box to empty party
    socket.on(EVENTS.CHANGE_BOX_TO_EMPTY_PARTY, input =>
        new Box(socket, auth, db, scServer)
            .changeBoxToEmptyParty(input)
    );

    // party to empty box
    socket.on(EVENTS.CHANGE_PARTY_TO_EMPTY_BOX, input =>
        new Box(socket, auth, db, scServer)
            .changePartyToEmptyBox(input)
    );

    // jogador quer mudar posição do monstro na party
    socket.on(EVENTS.CHANGE_PARTY_POSITION, input => 
        new Species(socket, auth, db, scServer)
            .changePartyPosition(input)
    );

    // mudar posição da box do monstro
    socket.on(EVENTS.CHANGE_BOX_POSITION, input =>
        new Box(socket, auth, db, scServer)
            .changeInBoxMonsterPosition(input)
    );

    // pegar monstros/itens
    socket.on(EVENTS.GET_MONSTERS_ITEMS, input => 
        new Player(socket, auth, db, scServer)
            .getItemsMonster(input)
    );

    // pegar infos do player
    socket.on(EVENTS.GET_PLAYER_DATA, () =>
        new Player(socket, auth, db, scServer)
            .getPlayerData()
    );

    // pegar lista de quests (com paginação)
    socket.on(EVENTS.GET_QUESTS_LIST, input => 
        new Quest(socket, auth, db, scServer)
            .getList(input)
    );

    // pegar dados de quest especifica
    socket.on(EVENTS.GET_SPECIFIC_QUEST_DATA, input =>
        new Quest(socket, auth, db, scServer)
            .getSpecific(input)
    );

    // alguma requisição em relação a quest especifica
    socket.on(EVENTS.REQUEST_QUEST, input =>
        new Quest(socket, auth, db, scServer)
            .request(input)
    );

    // requisição pra iniciar a missão
    socket.on(EVENTS.REQUEST_START_QUEST, input =>
        new Quest(socket, auth, db, scServer)
            .startQuest(input)
    );

    // requisição pra pegar dados das notificações na page
    socket.on(EVENTS.GET_NOTIFICATIONS, input =>
        new Notify(socket, auth, db, scServer)
            .getNotifications(input)
    );

    // requisição pra pegar dados da notificação de aprender move
    socket.on(EVENTS.GET_MOVE_NOTIFICATION, input =>
        new Notify(socket, auth, db, scServer)
            .getMoveNotification(input)
    );

    // requisição pra pegar dados da notificação de evoluir
    socket.on(EVENTS.GET_EVOLVE_NOTIFICATION, input =>
        new Notify(socket, auth, db, scServer)
            .getEvolveNotification(input)
    );

    // requisição de pegar dados da venda
    socket.on(EVENTS.GET_MARKETPLACE_NOTIFICATION, input =>
        new Notify(socket, auth, db, scServer)
            .getMarketPlaceNotification(input)
    );


    // requisitar aprender move
    socket.on(EVENTS.REQUEST_LEARN_MOVE_NOTIFY_ACTION, input =>
        new Notify(socket, auth, db, scServer)
            .requestLearnMove(input)
    );

    // requisitar não aprender move
    socket.on(EVENTS.REQUEST_DONT_LEARN_MOVE_NOTIFY_ACTION, input =>
        new Notify(socket, auth, db, scServer)
            .requestDontLearnMove(input)
    );
    

    // requisitar evoluir monstro
    socket.on(EVENTS.REQUEST_EVOLVE_NOTIFY_ACTION, input =>
        new Notify(socket, auth, db, scServer)
            .requestEvolveMonster(input)
    );
    
    // setar que já viu notificação
    socket.on(EVENTS.SET_NOTIFICATION_SEEN, input =>
        new Notify(socket, auth, db, scServer)
            .setSeen(input)
    );
    
    
    // quando jogador desconectar
    socket.on(EVENTS.DISCONNECT, () =>
        new Player(socket, auth, db, scServer)
            .disconnect()
    );
};

// ************
// <MIDDLEWARES>

// autenticar a entrada do client
Main.prototype.auth = function (req, next) {

    let input = url.parse(req.url, true).query;

    console.time("i/o Auth");

    // se for o datamaster
    if (this.authAdmin(input)) {
        console.log("Oi admin");
        next();
        return;
    };

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
            new Map(req.socket, auth, db)
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
            new Chat().subscribe({
                type: req.data.type
            });

            break;
        };

        // pvp
        case "p": {
            // checar se pode se inscrever naquele pvp
            console.log("AEUHAEUHEAUEH PVP", channel);
            break;
        };

        // global
        case "g": {
            break;
        };

        // datamaster
        case "d": {
            if (this.authAdmin(auth)) {
                console.log("Foi xD");
                next();
            } else {
                console.log("N foi xD");
                next(true);
            };
            return;
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
                    new Chat(req.socket, auth, db)
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
                    new Move(req.socket, auth, db)
                        .walk(next, req.data);
                    break;
                };

                // envia que mudou de facing no mapa
                case 2: {
                    new Move(req.socket, auth, db)
                        .face(next, req.data);
                    break;
                };

                // envia nova mensagem no chat
                case 3: {
                    new Chat(req.socket, auth, db)
                        .sendMessage(next, req.data);
                    break;
                };
                // enviar que está digitando
                case 5: {
                    new Chat(req.socket, auth, db)
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

            let player = new Player(req.socket, auth, db, scServer);

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

Main.prototype.password = "m7nb3vk9cazngk78gh1fj6mfh6k8k8hgsvadac4n0m1z8mhg3vallelol123321";

Main.prototype.authAdmin = function (data) {
    return data.isAdmin && data.password && JSON.parse(data.isAdmin) == true && data.password == this.password;
};

Main.prototype.events = {
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


// Quando o datamaster conecta
DataMaster.prototype.conn = function (socket, scServer) {

    const EVENTS = this.events;

    // handlar ações que os players escolheram do pvp
    socket.on(EVENTS.HANDLE_PVP_ACTION, data =>
        new Battle(socket, null, db, scServer)
            .preHandleActionPvP(data)
    );

    // timer - contador
    socket.on(EVENTS.PVP_TIME_OVER, data =>
        new Battle(socket, null, db, scServer)
            .claimVictory(data)
    );

    // trocar monstro faintado
    socket.on(EVENTS.TRADE_FAINTED_MONSTERS, data =>
        new Battle(socket, null, db, scServer)
            .changeFaintedMonsterPvP(data)
    );
};

DataMaster.prototype.events = {
    "HANDLE_PVP_ACTION": "1",
    "PVP_TIME_OVER": "2",
    "TRADE_FAINTED_MONSTERS": "3"
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
