const Networking = function (socket, scServer, uid) {
	this.socket = socket;
	this.scServer = scServer;
	this.uid = uid;
};

Networking.prototype.send = function (event, data, callback) {
	this.socket.emit(event, data, callback);
};

Networking.prototype.sendToMap = function () {
	this.scServer.exchange.publish("m" + id, data, callback);
};
Networking.prototype.sendToRemoteUser = function (remoteUid, data, callback) {
	this.scServer.exchange.publish("u-" + remoteUid, data, callback);
};