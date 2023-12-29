const 
     _ = require("underscore"),
    EventEmitter = require("events");

/*
Datamaster gerencia variavéis do jogo de forma global, guarda por exemplo: ações do PvP
e articula e gerencia emição de dados sw forma global
 */

const pvpEvents = {
    "HANDLE_PVP_ACTION": "1",
    "PVP_TIME_OVER": "2",
    "TRADE_FAINTED_MONSTERS": "3"
};

const PvP = {};

/**
 * 
 * @param {Main} main 
 */
const Datamaster = function (main) {
    EventEmitter.call(this);
    this.socket = main.socket;
    this.server = main.server;
    this.on(pvpEvents.HANDLE_PVP_ACTION, data =>
        instantiateGameCoreKlass(Battle, main)
            .preHandleActionPvP(data)
    );
    this.on(pvpEvents.PVP_TIME_OVER, data =>
        instantiateGameCoreKlass(Battle, main)
            .claimVictory(data)
    );
    this.on(pvpEvents.TRADE_FAINTED_MONSTERS, data =>
        instantiateGameCoreKlass(Battle, main)
            .changeFaintedMonsterPvP(data)
    );
};

Datamaster.prototype = Object.create(EventEmitter.prototype);

// * Eventos
// Inserir batalha
Datamaster.prototype.insertBattle = function (data) {
    console.log("Datamaster.insertBattle", data);
    PvP[data.battle_id] = {};
    PvP[data.battle_id].actionSended = {};
    PvP[data.battle_id].timerActive = false;
    PvP[data.battle_id].needToTradeFaintedMonster = [];
};

// Escolher ação
Datamaster.prototype.chooseBattleAction = function (data) {
    console.log("Datamaster.chooseBattleAction", data);
    // se ninguém escolheu o move ainda, apenas insere
    if (_.isEmpty(PvP[data.battle_id].actionSended)) {
        console.log("N tem!", data);
        PvP[data.battle_id].actionSended = {action: data.action, param: data.param, uid: data.uid};
    } else {

        // se alguém já escolheu: reseta timer
        console.log("Já tem!");
        if (PvP[data.battle_id].timerActive) {
            clearInterval(PvP[data.battle_id].timer);
            PvP[data.battle_id].timerActive = false;
        };
        // envia ações pro server processar e enviar pro client
        this.emit(pvpEvents.HANDLE_PVP_ACTION, {
            battle_id: data.battle_id,
            actions: [
                PvP[data.battle_id].actionSended,
                {action: data.action, param: data.param, uid: data.uid}
            ],
            changeMonster: PvP[data.battle_id].needToTradeFaintedMonster
        });
        // limpa ações enviadas
        PvP[data.battle_id].actionSended = {};
    };
};

// Remover batalha
Datamaster.prototype.removeBattle = function (data) {
    console.log("Datamaster.removeBattle", data);
    // limpa timer
    if (PvP[data.battle_id].timerActive)
        clearInterval(PvP[data.battle_id].timer);

    // limpa objeto no objeto global de PvP
    delete PvP[data.battle_id];
};

// Inserir timer no PvP
Datamaster.prototype.insertBattleTimer = function (data) {
    console.log("Datamaster.insertBattleTimer", data);
    // se timer já estiver ativado, retorna
    if (PvP[data.battle_id].timerActive)
        return;

    // ativa timer
    PvP[data.battle_id].timerActive = true;

    // execura timer
    PvP[data.battle_id].timer = setTimeout(() => {
        console.log("Timer ends");
        this.emit(pvpEvents.PVP_TIME_OVER, {
            battle_id: data.battle_id,
            action: PvP[data.battle_id].actionSended
        });
        PvP[data.battle_id].timerActive = false;
    }, this.pvpTimer); 
};

// Inserir que precisa trocar de monstro, pois ele está faintado
Datamaster.prototype.insertFaintedMonster = function (data) {
    console.log("Datamaster.insertFaintedMonster", data);
    // loopa os que foram faintados
    PvP[data.battle_id].needToTradeFaintedMonster = data.fainted.map(fainted => ({
        uid: fainted.uid,
        changed: false,
        change_monster: null
    }));

    console.log("Fainted precisa trocar");
    console.log(PvP[data.battle_id].needToTradeFaintedMonster);
};

// Trocar monstro faintado no PvP
Datamaster.prototype.changeFaintedMonster = function (data) {
    console.log("Datamaster.changeFaintedMonster", data);
    console.log(PvP);
    // ** se só precisar trocar um
    if (PvP[data.battle_id].needToTradeFaintedMonster.length == 1) {
        console.log("LULZ2");
        // emitir pra trocar
        this.emit(pvpEvents.TRADE_FAINTED_MONSTERS, {
            battle_id: data.battle_id,
            params: [{
                iAm: data.iAm,
                uid: data.uid,
                change_monster: data.change_monster
            }]
        });

        // limpa need to trade fainted
        PvP[data.battle_id].needToTradeFaintedMonster = [];
    } else {

        // ** precisa trocar os dois

        console.log("LULZ3");

        // alguém já escolheu
        if (PvP[data.battle_id].needToTradeFaintedMonster.some(props => props.changed == true)) {
            console.log("Alguém já escolheu!");

            const change = PvP[data.battle_id].needToTradeFaintedMonster.find(props => props.uid == data.uid);
        
            change.changed = true;
            change.change_monster = data.change_monster;
            change.iAm = data.iAm;

            console.log(PvP[data.battle_id].needToTradeFaintedMonster);

            this.emit(pvpEvents.TRADE_FAINTED_MONSTERS, {
                battle_id: data.battle_id,
                params: PvP[data.battle_id].needToTradeFaintedMonster
            })

            // limpa need to trade fainted
            PvP[data.battle_id].needToTradeFaintedMonster = [];

        // ninguém escolheu ainda
        } else {
            console.log("Ninguém escolheu ainda");
            const change = PvP[data.battle_id].needToTradeFaintedMonster.find(props => props.uid == data.uid);
        
            change.changed = true;
            change.change_monster = data.change_monster;
            change.iAm = data.iAm;
        };

    };
};

// Objeto de todos os PvP
Datamaster.prototype.PvP = {};

// Timer do PVP de limite de espera do outro jogador
Datamaster.prototype.pvpTimer = 120000; //120000


module.exports = Datamaster;

const Battle = require("./core/battle.js");
const Main = require("./core.js");
const { instantiateGameCoreKlass } = require("./utils/utils.js");