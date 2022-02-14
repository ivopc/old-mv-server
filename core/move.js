const _ = require("underscore");

const PlayerData = require("./playerdata.js");

const Base = require("./base.js");

const Move = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
};

Move.prototype = Object.create(Base.prototype);

const utils = require("./../utils/utils.js");

// player andar no mapa
Move.prototype.walk = function (next, input) {

    console.time("User {" + this.auth.uid + "} tempo de andar");
    
    input = input || {};

    // filtrar inputs, se tiver algo errado manda client voltar ação
    // se a input ou direção estiver vazio
    if (!input || !utils.has(input, ["dir", "dataType"]) || !this.filterInput.direction.includes(input.dir))
        return this.socket.emit("move back");

    // e definir user id do jogador
    input.uid = +this.auth.uid;

    // faz player andar pra direção,
    // enviar os dados dele pro client
    // e transmitir movimento do jogador para todos
    new PlayerData()
        .walk(
            this.auth.uid, 
            input.dir, 
            (err, data) => this.publishWalkToCurrentMap(err, input, data, next)
        );
};

// player muda facing no mapa
Move.prototype.face = function (next, input) {

    console.time("User {" + this.auth.uid + "} tempo de facing");
    input = input || {};

    // filtrar inputs, se tiver algo errado manda client voltar ação
    // se a input ou direção estiver vazio
    if (!input || !utils.has(input, ["dir", "dataType"]))
        return this.socket.emit("move back");

    if ( !this.filterInput.direction.includes(input.dir) )
        return this.socket.emit("move back");

    //  definir user id do jogador
    input.uid = +this.auth.uid;

    // faz player virar pra direção
    // transmitir movimento do jogador para todos, e
    new PlayerData()
        .face(
            this.auth.uid, 
            input.dir, 
            (err, data) => this.publishFacingToCurrentMap(err, input, data, next)
        );
};

// player pular no mapa
Move.prototype.jump = function () {};

// publicar que andou para o mapa atual
Move.prototype.publishWalkToCurrentMap = function (err, input, data, next) {

    console.timeEnd("User {" + this.auth.uid + "} tempo de andar");
    //console.log(data);
    //console.log("andar", data);

    // aplicar nova posição
    input.pos = {
        x: data.pos_x,
        y: data.pos_y
    };

    // aplicar sprite
    input.char = data.sprite;

    // nickname do player
    input.nickname = data.nickname;

    /*
        dataType:
        1 = char andando
        2 = char facing
        3 = remover char do mapa
    */
    input.dataType = 1;

    // envia para o canal que o jogador está que ele andou
    next();
};

// publicar que andou para o mapa atual
Move.prototype.publishFacingToCurrentMap = function (err, input, data, next) {
    console.timeEnd("User {" + this.auth.uid + "} tempo de facing");

    // setar posição atual
    input.pos = {
        x: data.pos_x,
        y: data.pos_y
    };

    // aplicar sprite
    input.char = data.sprite;

    // nickname do player
    input.nickname = data.nickname;

    /*
        dataType:
        1 = char andando
        2 = char facing
        3 = remover char do mapa
    */
    input.dataType = 2;

    // envia para o canal que o jogador está que ele andou
    next();
};

// Filtrar inputs
Move.prototype.filterInput = {
    direction: [0, 1, 2, 3]
};

module.exports = Move;