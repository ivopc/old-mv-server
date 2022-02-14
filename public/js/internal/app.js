var App = function (router, $Auth) {

    this.isClientStarted = false;

    // templates
    this.templates = {};
    this.titles = {};

    // seta templates
    _.forEach(
        document.querySelectorAll("[data-template]"), 
        this.setTemplates.bind(this)
    );

    this.auth = $Auth;

    this.router = router;
    //* configurando rotas
    router
    // ** rotas primárias (fora do jogo)
    // index
    .on(this.routeHandler.index.bind(this))

    .on("/play", this.routeHandler.play.bind(this))

    // perfil
    .on("/profile", this.routeHandler.selfProfile.bind(this))
    // premium market
    .on("/shop", this.routeHandler.shop.bind(this))
    // estastíticas
    .on("/statistics", this.routeHandler.statistics.bind(this))
    // configurações
    .on("/settings", this.routeHandler.settings.bind(this))
    // desconectar
    .on("/logout", this.routeHandler.logout.bind(this))

    // ** rotas especificas
    // perfil especifico
    .on("/profile/:id", this.routeHandler.profile.bind(this))
    // clan
    .on("/clan/:id", this.routeHandler.clan.bind(this))

    .resolve();

    // quando url não existe
    router.notFound(this.routeHandler.notFoundUrl.bind(this));
};

// pegar todos os templates disponíveis
App.prototype.setTemplates = function (el) {
    // pega atributo do nome do template
    var template = el.getAttribute("data-template");
    // seta template pelo nome e pega HTML do template
    this.templates[template] = _.template(el.innerHTML);
    // pega título do template
    this.titles[template] = el.getAttribute("data-title") || null;
};

// pegar esqueleto especifico de cada página
App.prototype.getSkeleton = function (callback) {

    $.ajax({
        url: "/routes/" + this.pageSkeleton,
        method: "POST",
        dataType: "json",
        success: function (data) {
            callback(null, data);
        }
    });
};

// renderizar página (final)
App.prototype.renderPage = function (err, data, callback) {

    $("#main").html(
        this.templates[this.pageSkeleton](data.skeleton)
    );

    if (typeof(callback) == "function")
        callback();
};

// renderizar esqueleto da página (método principal)
App.prototype.renderSkeleton = function (page, callback) {

    // salva a página que deve ser renderizada
    this.pageSkeleton = page;

    // pega esqueleto da página
    async.parallel({
        skeleton: this.getSkeleton.bind(this)
    },
        function (err, data) {
            this.renderPage.bind(this)(err, data, callback)
        }.bind(this)
    );
};

// controlador das rotas
App.prototype.routeHandler = {
    index: function () {
        if (this.isClientStarted) {
            $("#main").fadeIn(800);
            $(this.client).fadeOut(800);
        };
        this.renderSkeleton("index");
        console.log("Você está na index");
    },
    play: function () {
        $("#main").fadeOut();

        if (this.isClientStarted) {
            $(this.client).fadeIn(800);
            return;
        };

        async.series([
            next => {
                this.scriptLoader([
                    "/js/new_engine/newboot.js",
                ], next);
            },
            () => {
                $("header").fadeOut(500);
                $("main").fadeOut(500);
                $("footer").fadeOut(500);
            }
        ])


        // this.scriptLoader([
        //     "/js/socketcluster.js",
        //     "/js/replacephrase.js",
        //     "/js/phaser3.js",
        //     "/js/phaser3.button.js",
        //     "/js/HealthBar.p3.js",
        //     "/js/rexvirtualjoystickplugin.min.js",
        //     "/js/new_engine/property.js",
        //     "/js/new_engine/preloader.js",
        //     "/js/new_engine/overworld/index.js",
        //     "/js/new_engine/overworld/map.js",
        //     "/js/new_engine/overworld/sprite.js",
        //     "/js/new_engine/overworld/movement.js",
        //     "/js/new_engine/overworld/interface.js",
        //     "/js/new_engine/overworld/dialog.js",
        //     "/js/new_engine/overworld/automatized.js",
        //     "/js/new_engine/overworld/online.js",
        //     "/js/new_engine/overworld/tokens.js",
        //     "/js/new_engine/battle/index.js",
        //     "/js/new_engine/battle/sprite.js",
        //     "/js/new_engine/battle/controller.js",
        //     "/js/new_engine/battle/online.js",
        //     "/js/new_engine/chat/index.js"
        // ], () => {

        //     console.log("lol");

        //     // this.client = document.createElement("iframe");
        //     // this.client.setAttribute("src", "/newclient/" + this.auth.auth);
        //     // this.client.setAttribute("id", "gameiframe");
        //     // // colocando na div do game
        //     // document.querySelector("#game").appendChild(this.client);
        //     // // setando flag que client já iniciou
        //     // this.isClientStarted = true;

        // });
    },
    selfProfile: function () {
        this.renderSkeleton("profile");
    },
    shop: function () {},
    statistics: function () {},
    settings: function () {},
    logout: function () {
        console.log("Você está no logout");
        if (confirm("Tem certeza que deseja desconectar?")) {
            $.ajax({
                url: "/account/logout",
                method: "POST",
                dataType: "json",
                data: {
                    token: this.auth.csrf
                },
                success: function (data) {
                    if (data.success) {
                        location = "/";
                    } else {
                        alert("Algum erro ocorreu!");
                    }
                }
            });
        };
    },
    profile: function (params) {
        this.renderSkeleton("profile");
        console.log("Você está no perfil " + (params.id));
    },
    clan: function () {},
    notFoundUrl: function () {}
};


App.prototype.onRender = {
    explore: function () {
    }
};

App.prototype.scriptLoader = function (scripts, callback) {
    var total = scripts.length,
        current = 0;

    for (let i = 0; i < total; i ++) {

        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", scripts[i]);
        document.body.appendChild(script);
        script.addEventListener("load", () => {
            if (++current == total)
                if (callback && typeof(callback) == "function")
                    callback();
        });
    };
};

// quando DOM estiver pronto chama esse função
function init (obj) {
    new App(
        obj.router,
        obj.auth
    );
};

// inicialização do DOM
$(function () {
    init({
        router: new Navigo(),
        auth: $Authentication
    });
});