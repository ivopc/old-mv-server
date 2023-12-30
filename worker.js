const 
    SCWorker = require("socketcluster/scworker"),
    express = require("express"),
    expressSession = require("express-session"),
    MySQLStore = require("express-mysql-session")(expressSession),
    validator = require("express-validator"),
    async = require("async"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    swig = require("swig"),
    svgCaptcha = require("svg-captcha"),
    path = require("path"),
    morgan = require("morgan"),
    healthChecker = require("sc-framework-health-check");

    const url = require("url");

let scServer;

const app = express();

const Core = require("./core.js");

const setdb = require("./models/setdb.js");

const setPool = require("./models/setpool.js");

const checkIfIsBan = require("./utils/checkban.js");

const routes = require("./controller/routes/routes.json");

const Router = {
    main: express.Router(),
    routes: express.Router(),
    account: express.Router(),
    marketplace: express.Router(),
    admin: express.Router(),
    payment: express.Router(),
    api: express.Router()
};

const Controller = {
    main: require("./controller/main.js"),
    account: require("./controller/account.js"),
    admin: require("./controller/admin.js"),
    payment: require("./controller/payment.js"),
    api: require("./controller/api.js"),
    routes: {}
};

// configurando as rotas
for (let i = 0, l = routes.length; i < l; i++)
    Controller.routes[routes[i]] = require("./controller/routes/" + routes[i] + ".js");

// render engine
app
    .engine("html", swig.renderFile)
    .set("view engine", "html")
    .set("views", __dirname + "/views");

Router.main
    .use(checkIfIsBan)
    // páginas iniciais
    .all("/", Controller.main.index)
    .get("/about", Controller.main.index)
    .get("/contact", Controller.main.index)
    .get("/terms", Controller.main.index)
    .get("/wiki", Controller.main.index)

    // página do jogo
    .get("/play", Controller.main.index)

    .get("/premium", Controller.main.index)
    .get("/community", Controller.main.index)
    .get("/config", Controller.main.index)

    // páginas que estão "fora" do jogo
    .get("/profile", Controller.main.index)
    .get("/profile/:name", Controller.main.index)

    // lugar de vendas
    .get("/statistics", Controller.main.index)
    .get("/settings", Controller.main.index)
    .get("/logout", Controller.main.index)

    .get("/clan/:id", Controller.main.index)


    // captcha
    .get("/captcha.svg", (req, res) => {

        const captcha = svgCaptcha.create({
            noise: 2,
            ignoreChars: "QWERTYUIOPASDFGHJKLZXCVBNM"
        });

        req.session["captcha"] = captcha.text;
        
        res.type("svg");
        res.status(200).send(captcha.data);
    })
    .get("/gamesource.js", Controller.main.gamesource)
    .get("/overworld.js", Controller.main.gamesourceoverworld) 
    .get("/battle.js", Controller.main.gamesourcebattle)

// rotas de controle de rotas
Router.routes
    .use((req, res, next) => {
        // se não tiver conectado, renderiza o login
        if (!req.session.isConnected) {
            res.json({
                "login": true
            });
            return;
        };

        next();
    })
    .post("/index", Controller.routes.index)
    .post("/profile", Controller.routes.selfProfile)
    .post("/shop", Controller.routes.shop)
    .post("/statistics", Controller.routes.statistics)
    .post("/marketplace", Controller.routes.marketplace)
    .post("/settings", Controller.routes.settings)
    .post("/team", Controller.routes.team)
    .post("/tamers", Controller.routes.tamers)
    .post("/tournament", Controller.routes.tournament)
    .post("/monsterpedia", Controller.routes.monsterpedia)
    .post("/profile/:id", Controller.routes.profile)
    .post("/clan/:id", Controller.routes.clan);

// rotas de controle da conta
Router.account
    .use((req, res, next) => {
        next();
    })
    .post("/register", Controller.account.register)
    .post("/login", Controller.account.login)
    .post("/logout", Controller.account.logout)
    .post("/settings", Controller.account.settings);

// rota de controle do mercado de trocas
Router.marketplace
    .get("/", Controller.main.marketplace)
    .get("/sell", Controller.main.marketplacesell)
    .get("/my", Controller.main.marketplacemy)
    .get("/purchase/:id", Controller.main.marketplacespecific)
    .get("/items", Controller.main.marketplace)
    .get("/monsters", Controller.main.marketplace);

// rota de controle das ações de admin
Router.admin
    .use((req, res, next) => {
        // se não tiver conectado, e não for admin nem mod expulsa
        if (!req.session.isConnected || req.session["rank"] < 1) {
            res.redirect("/");
            return;
        };

        next();
    })
    .get("/", Controller.admin.index)
    .post("/ban", Controller.admin.ban)
    .post("/unban", Controller.admin.unban);

// rota de controle de ações de pagamento
Router.payment
    .use((req, res, next) => {
        // se não tiver conectado, e não for admin nem mod expulsa
        if (!req.session.isConnected) {
            res.redirect("/");
            return;
        };

        next();
    })
    .post("/pay", Controller.payment.pay)
    .post("/callback", Controller.payment.callback);



Router.api
    .get("/players-online", Controller.api.players);


// middlewares
app
    .use(express.static(__dirname + "/public"))
    .use(cookieParser())
    .use(setdb.inReq)
    .use(setPool)
    .use(validator())
    .use(bodyParser.urlencoded({extended: true}))
    .use(bodyParser.json())
    .use(expressSession({
        "secret": "supfgASF6fbdnvm4uiovmq1zab5678i0m1an3",
        "name": "sessid",
        resave: false,
        saveUninitialized: false
    }));



// setar servidor de websockets
app
    .use((req, res, next) => {
        req.scServer = scServer;
        next();
    });

// configurando rotas
app
    .use("/", Router.main)
    .use("/routes", Router.routes)
    .use("/account", Router.account)
    .use("/marketplace", Router.marketplace)
    .use("/admin", Router.admin)
    .use("/payment", Router.payment)
    .use("/api", Router.api);

const wsConn = sck => {
    const core = new Core();
    core.conn(sck, scServer);
    },
    wsAuth = (req, next) => { 
        const core = new Core();
        core.authConn(req, next)
    },
      wsSubscribe = (req, next) => coreFactory(req).subscribe(req, scServer, next),
      wsPublishIn = (req, next) => coreFactory(req).publishIn(req, scServer, next),
      wsPublishOut = (req, next) => coreFactory(req).publishOut(req, next),
      wsEmit = (req, next) => coreFactory(req).emit(req, next);
    
function coreFactory (req) {
    return new Core(req.socket, scServer, url.parse(req.socket.request.url, true).query);
};

class Worker extends SCWorker {
    run() {
        console.log("   >> Worker PID:", process.pid);
        const environment = this.options.environment;

        const httpServer = this.httpServer;
        scServer = this.scServer;

        if (environment === "dev") {
            // Log every HTTP request. See https://github.com/expressjs/morgan for other
            // available formats.
            app.use(morgan("dev"));
        };

        // Add GET /health-check express route
        healthChecker.attach(this, app);

        httpServer.on("request", app);

        scServer.on("connection", wsConn);

        // Autenticar entrada no websocket
        scServer.addMiddleware(scServer.MIDDLEWARE_HANDSHAKE_WS, wsAuth);

        // Autenticar inscrição nos canais
        scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE, wsSubscribe);

        // Autenticar publicação nos canais
        scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_IN, wsPublishIn);

        // Controlar pra quem vai enviar nos canais
        scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_OUT, wsPublishOut);

        // Controlar emição de socket
        scServer.addMiddleware(scServer.MIDDLEWARE_EMIT, wsEmit);
    }
};

new Worker();
