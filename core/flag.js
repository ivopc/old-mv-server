const
    fs = require("fs"),
    _ = require("underscore"),
    async = require("async");

const EVENTS = require("./../database/socket_events.json");

const Scripts = {};

fs.readdirSync(__dirname + "/script").forEach(file => Scripts[file.split(".")[0]] = require("./script/" + file));

const Base = require("./base.js");

const Flag = function (socket, auth, db, scServer) {
    Base.call(this, socket, auth, db, scServer);
};

Flag.prototype = Object.create(Base.prototype);

// requisitar execução do flag
Flag.prototype.requestExecution = function (input) {

    // vendo se script que o client requisitou existe
    // se não existir manda uma resposta de erro
    if (! ( (input.type + "-" + input.id) in Scripts) ) {
        console.log("Flag não existe!");
        return;
    };

    async.waterfall([
        next => {
            this.mysqlQuery(
                "SELECT `type`, `flag_id`, `value` FROM `flags` WHERE `uid` = ?",
                [this.auth.uid],
                next
            );
        },
        (results, fields, next) => {
            // console.log("flags", results);

            // script para execução e validação da flag requisitada
            const script = JSON.parse(JSON.stringify(Scripts[input.type + "-" + input.id]));

            // propriedades da flag requisitada
            const flag = _.findWhere(results, {
                type: input.type,
                flag_id: String(input.id)
            });

            // flags necessárias
            const required_flags = script.flagRequisits;

            //verificando se só pode executar uma vez
            // e vendo se a flag já foi executada
            if (script.config.limitOnceExecution && flag && flag.value > 0) {

                console.log("Não pode executar mais de uma vez! Negado!");

                // se não precisar de resposta direta do servidor
                if (script.config.dontNeedServerResponse)
                    return;

                this.socket.emit(EVENTS.OBJECT_RESPONSE, {
                    type: script.config.data.type,
                    flag_id: script.config.data.flag_id,
                    value: 1
                });
                return;
            };

            // vendo se precisa verificar os flags requisitados
            // e verificando se tem todas as flags necessárias
            if (required_flags.length > 0 && !this.checkRequired(results, required_flags)) {
                console.log("Não tem todas as flags necessárias! Negado!");
                return; 
            };

            // vendo se tem alguma input do usuário
            var hasParam = false;

            // se tiver alguma escolha do usuário e precisar autenticar input
            if (script.authenticate_input) {
                // ver se deve continuar
                let keep = true;

                // se objeto estiver vazio: sai
                if (_.isEmpty(input.data))
                    return;

                // percore parametros, verifica se parametro existe no server
                // e se a input escolhida é uma das possíveis no servidor
                for (let i = 0, params = Object.keys(input.data), l = params.length; i < l; i ++) {

                    if ( 
                        !(params[i] in script.authenticate_input) ||
                        (_.indexOf(script.authenticate_input[params[i]], +input.data[params[i]]) < 0)
                    )
                        keep = false;

                };

                if (!keep)
                    return console.log("Input inválida!");

                console.log("Foi!", input.data);

                // seta que há parametros
                hasParam = true;
            };

            async.series([
                next => {
                    // instancia pixioscript para executar
                    let pixioscript = new PixioScript(this.socket, this.auth, this.db);

                    // se houver parâmetros de input do usuário, aplica eles
                    if (hasParam)
                        pixioscript.applyParams(input.data, _.clone(script.script));

                    pixioscript.codeParser(script.script);

                    // executa ações do flag
                    pixioscript.exec(next);
                },
                next => {

                    // executa ações após o script estiver pronto
                    let pixioscript = new PixioScript(this.socket, this.auth, this.db),
                        code = _.clone(script.onscriptdone);

                    // adiciona que já executou flag requisitada pelo client
                    code.push(
                        ["setflag", {
                            "type": script.config.data.type,
                            "flag_id": script.config.data.flag_id,
                            "value": 1
                        }]
                    );

                    pixioscript.codeParser(code);

                    pixioscript.exec(next);
                },
                next => {
                    // se não precisar de resposta direta do servidor
                    if (script.config.dontNeedServerResponse)
                        return;

                    // envia para o client a resposta
                    this.socket.emit(EVENTS.OBJECT_RESPONSE, {
                        type: script.config.data.type,
                        flag_id: script.config.data.flag_id,
                        value: 0
                    });
                }
            ]);
        }
    ]);
};

// checar se tem todas as flags necessárias
Flag.prototype.checkRequired = function (flags, required) {
    for (let i = 0, l = required.length; i < l; i ++) {
            
        const has = _.findWhere(flags, {
            type: required[i].type,
            flag_id: String(required[i].flag_id)
        });

        if (!has)
            return false;
    };

    return true;
};

// inserir/atualizar flag
Flag.prototype.insertUpdate = function (type, flag_id, value, callback) {
    async.waterfall([
        // pega a o flag em especifico
        next => {
            this.mysqlQuery(
                "SELECT `id` FROM `flags` WHERE `uid` = ? AND `type` = ? AND `flag_id` = ?",
                [this.auth.uid, type, flag_id],
                next
            );
        },
        (results, fields, next) => {
            console.log(2);
            // se o player já tiver o flag, apenas edita valor da linha já existente
            if (results.length > 0) {
                console.log(3);
                results = results[0];
                this.mysqlQuery(
                    "UPDATE `flags` SET `value` = ? WHERE `id` = ?",
                    [value, results.id],
                    next
                );
            } else {
                console.log(4);
                // se não tiver, insere flag na database
                this.mysqlQuery("INSERT INTO `flags` SET ?", {
                    id: null,
                    uid: this.auth.uid,
                    type,
                    flag_id,
                    value
                }, next);
            };
        },
        () => callback()
    ]);
};

// flags especificos
Flag.prototype.customFlag = {};

module.exports = Flag;

const PixioScript = require("./pixioscript.js");