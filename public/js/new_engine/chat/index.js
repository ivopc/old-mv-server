var Chat = function (socket) {
    this.socket = socket;
};

Chat.prototype.sendMessage = function (msg) {
    console.log("mensagem enviada", msg);

    // enviar mensagem pro servidor
    this.socket.publish("g", {
        msg: msg
    });

    // appenda mensagem
    this.receiveMessage({
        message: msg,
        player: "Ivopc"
    });
};

Chat.prototype.receiveMessage = function (data) {

    var chat_msg = Elements.chat.querySelector("#chat-messages"),
        scrollThis;

    // se estiver na posição limite do scroll, manda scrollar
    if (chat_msg.scrollHeight == chat_msg.scrollTop + chat_msg.clientHeight)
        scrollThis = true;

    // adiciona mensagem
    chat_msg.innerHTML += "<div><b>" + data.player + "</b>: " + data.message + "</div>";

    // se mandar scrollar, scrolla pro limite do chat
    if (scrollThis)
        chat_msg.scrollTo(0, chat_msg.scrollHeight);
};