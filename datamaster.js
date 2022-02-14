const 
    socketCluster = require("socketcluster-client"),
    _ = require("underscore");

/*
Datamaster gerencia variavéis do jogo de forma global, guarda por exemplo: ações do PvP
e articula e gerencia emição de dados sw forma global
 */

const Datamaster = function () {

    // conectar ao server como datamaster
    this.socket = socketCluster.connect({
        query: {
            isAdmin: "true",
            password: this.password
        },
        port: 8000,
        hostname: "localhost",
        rejectUnauthorized: false
    });

    // Quando conectar, liberar clients a acessar jogo
    this.socket.on("connect", () => {
        console.log("Conectou, ok?");
    });

    this.socket.on("error", err =>
        console.log(err)
    );

    // Escuta de eventos
    this.masterListener = this.socket.subscribe("datamaster");
    this.masterListener.watch(data => this.handleEvents(data));
};

// Manipular eventos
Datamaster.prototype.handleEvents = function (data) {
    switch (data.type) {
        // inserir batalha
        case 0: {
            this.insertBattle(data);
            break;
        };

        // escolher ação (move - batalha PvP)
        case 1: {
            this.chooseBattleAction(data);
            break;
        };

        // remover batalha
        case 2: {
            this.removeBattle(data);
            break;
        };

        // inserir timer da batalha
        case 3: {
            this.insertBattleTimer(data);
            break;
        };


        // inserir que precisa trocar de monstro, pois ele está faintado
        case 4: {
            this.insertFaintedMonster(data);
            break;
        };

        // Trocar monstro faintado
        case 5: {
            this.changeFaintedMonster(data);
            break;
        };
    };
};

// * Eventos
// Inserir batalha
Datamaster.prototype.insertBattle = function (data) {
    this.PvP[data.battle_id] = {};
    this.PvP[data.battle_id].actionSended = {};
    this.PvP[data.battle_id].timerActive = false;
    this.PvP[data.battle_id].needToTradeFaintedMonster = [];
    console.log("inserindo batalha", this.PvP);
};

// Escolher ação
Datamaster.prototype.chooseBattleAction = function (data) {
    // se ninguém escolheu o move ainda, apenas insere
    if (_.isEmpty(this.PvP[data.battle_id].actionSended)) {
        console.log("N tem!", data);
        this.PvP[data.battle_id].actionSended = {action: data.action, param: data.param, uid: data.uid};
    } else {

        // se alguém já escolheu: reseta timer
        console.log("Já tem!");
        if (this.PvP[data.battle_id].timerActive) {
            clearInterval(this.PvP[data.battle_id].timer);
            this.PvP[data.battle_id].timerActive = false;
        };
        // envia ações pro server processar e enviar pro client
        this.socket.emit("1", {
            battle_id: data.battle_id,
            actions: [
                this.PvP[data.battle_id].actionSended,
                {action: data.action, param: data.param, uid: data.uid}
            ],
            changeMonster: this.PvP[data.battle_id].needToTradeFaintedMonster
        });
        // limpa ações enviadas
        this.PvP[data.battle_id].actionSended = {};
    };
};

// Remover batalha
Datamaster.prototype.removeBattle = function (data) {
    // limpa timer
    if (this.PvP[data.battle_id].timerActive)
        clearInterval(this.PvP[data.battle_id].timer);

    // limpa objeto no objeto global de PvP
    delete this.PvP[data.battle_id];
};

// Inserir timer no PvP
Datamaster.prototype.insertBattleTimer = function (data) {
    // se timer já estiver ativado, retorna
    if (this.PvP[data.battle_id].timerActive)
        return;

    // ativa timer
    this.PvP[data.battle_id].timerActive = true;

    // execura timer
    this.PvP[data.battle_id].timer = setTimeout(() => {
        console.log("Timer ends");
        this.socket.emit("2", {
            battle_id: data.battle_id,
            action: this.PvP[data.battle_id].actionSended
        });
        this.PvP[data.battle_id].timerActive = false;
    }, this.pvpTimer); 
};

// Inserir que precisa trocar de monstro, pois ele está faintado
Datamaster.prototype.insertFaintedMonster = function (data) {
    // loopa os que foram faintados
    this.PvP[data.battle_id].needToTradeFaintedMonster = data.fainted.map(fainted => ({
        uid: fainted.uid,
        changed: false,
        change_monster: null
    }));

    console.log("Fainted precisa trocar");
    console.log(this.PvP[data.battle_id].needToTradeFaintedMonster);
};

// Trocar monstro faintado no PvP
Datamaster.prototype.changeFaintedMonster = function (data) {
    console.log("LULZ1");
    // ** se só precisar trocar um
    if (this.PvP[data.battle_id].needToTradeFaintedMonster.length == 1) {
        console.log("LULZ2");
        // emitir pra trocar
        this.socket.emit("3", {
            battle_id: data.battle_id,
            params: [{
                iAm: data.iAm,
                uid: data.uid,
                change_monster: data.change_monster
            }]
        });

        // limpa need to trade fainted
        this.PvP[data.battle_id].needToTradeFaintedMonster = [];
    } else {

        // ** precisa trocar os dois

        console.log("LULZ3");

        // alguém já escolheu
        if (this.PvP[data.battle_id].needToTradeFaintedMonster.some(props => props.changed == true)) {
            console.log("Alguém já escolheu!");

            const change = this.PvP[data.battle_id].needToTradeFaintedMonster.find(props => props.uid == data.uid);
        
            change.changed = true;
            change.change_monster = data.change_monster;
            change.iAm = data.iAm;

            console.log(this.PvP[data.battle_id].needToTradeFaintedMonster);

            this.socket.emit("3", {
                battle_id: data.battle_id,
                params: this.PvP[data.battle_id].needToTradeFaintedMonster
            })

            // limpa need to trade fainted
            this.PvP[data.battle_id].needToTradeFaintedMonster = [];

        // ninguém escolheu ainda
        } else {
            console.log("Ninguém escolheu ainda");
            const change = this.PvP[data.battle_id].needToTradeFaintedMonster.find(props => props.uid == data.uid);
        
            change.changed = true;
            change.change_monster = data.change_monster;
            change.iAm = data.iAm;
        };

    };
};

// Objeto de todos os PvP
Datamaster.prototype.PvP = {};

// Timer do PVP de limite de espera do outro jogador
Datamaster.prototype.pvpTimer = 5500; //120000

// Senha para entrar como datamaster
Datamaster.prototype.password = "m7nb3vk9cazngk78gh1fj6mfh6k8k8hgsvadac4n0m1z8mhg3vallelol123321";


module.exports = Datamaster;