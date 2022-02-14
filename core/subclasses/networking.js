class Networking {
    constructor (socket, scServer, uid) {
        this.socket = socket;
        this.scServer = scServer;
        this.uid = uid;
    }

    // Enviar dados para o client
    send (event, data, callback) {
        this.socket.emit(event, data, callback);
    }

    // Enviar dados para um player especifico
    sendToRemotePlayer (remoteUid, data, callback) {
        this.scServer.exchange.publish("u-" + remoteUid, data, callback);
    }

    // Enviar dados para todos que estão inscritos no mapa especifico
    sendToMap (id, data, callback) {
        this.scServer.exchange.publish("m" + id, data, callback);
    }
};

module.exports = Networking;