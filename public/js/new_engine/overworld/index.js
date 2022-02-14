// 1.75

Game = Game || {};

Game.Overworld = {};

Game.Overworld.Extends = Phaser.Scene;

Game.Overworld.initialize = function () {
    Phaser.Scene.call(this, {key: "overworld"});
};

Game.Overworld.init = function (data) {
    //console.log("Overworld Scene init", obj);
    // transportando escopo

    // dependencias primárias
    this.Data = data.data;
    this.Socket = data.socket;

    // auth data
    this.auth = data.auth;

    // player
    this.player = {};
    //player data
    this.player._data = _.clone(data.player);
    this.player._data.older;
    //online player data
    this.online_player_data = {};
    // object data
    this.object_data = {};
    // follower data
    this.follower_data = {};

    // gerenciador
    this.manager = data.manager;

    // notificações
    this.notify = data.notify;

    // flag data
    this.flag = data.flag === 1 ? "default" : data.flag;

    // se estiver trocando mapa
    this.switchingMap = false;
    if (data.switchingMap)
        this.switchingMap = true;

    // se veio da batalha
    if (data.comeFromBattle)
        this.player._data.stop = false;

    /// se tiver esperando algum monstro selvagem e se não estiver vindo de batalha
    this.wild = null;
    if (data.wild && !data.comeFromBattle)
        this.wild = data.wild;

    // teleport id
    if (data.tid)
        this.tid = data.tid;

    // ações injetadas
    this.injectedActions = data.injectedActions;

    // tamers no mapa
    this.tamers = data.tamers;

    this.subscribe = {
        map: {
            is: false,
            conn: null
        }
    };

    this.map;
    this.layer = [];
    this.overlay;
    this.collisionLayer;

    this.containers = {};

    this.mapObjectPosition = {};
    this.mapFollowersPosition = {};

    this.lang = "br";

    this.isMobile = _.clone(isMobile);
};

Game.Overworld.preload = function () {
    //console.log("Overworld Scene preload");

    this.database = this.cache.json.get("database");

    const bg = this.add.sprite(
        0,
        0,
        "load_background"
    ).setOrigin(0, 0);

    bg.displayWidth = 480;
    bg.scaleY = 0.25;

    const
        width = this.cameras.main.width,
        height = this.cameras.main.height;

    const percentText = this.add.text(width / 2, height / 2 - 5, "0%", {
        fontFamily: "monospace",
        fontSize: 18,
        color: "#fff"
    });
    percentText.setOrigin(0.5, 0.5);

    const percentBar = new PointsBar(this, {x: 182, y: 132, width: 114, height: 6, bar: {color: 15528177}});
    percentBar.setPercentDirectly(0);

    this.load.on("progress", value => {
        let val = parseInt(value * 100);

        try {
            percentText.setText(val + "%");
            percentBar.setPercent(val);
        } catch (e) {
            //console.log("lol", e);
        };
    });

    this.load.on("complete", () => {
        bg.destroy();
        percentText.destroy();
        percentBar.destroy();
    });

    // plugins
    this.load.scenePlugin({
        key: "AnimatedTiles",
        url: "/js/plugin/animatedtiles.js",
        sceneKey: "animatedTiles"
    });
    this.load.scenePlugin({
        key: "IlluminatedJS",
        url: "/js/plugin/illuminated.p3.js",
        sceneKey: "illuminated"
    });

    // tileset
    this.load.image("tileset1", "/assets/img/tileset/tiles1.png");
    this.load.image("tileset2", "/assets/img/tileset/tiles2.png");
    this.load.image("indoors", "/assets/img/tileset/indoors.png");
    this.load.spritesheet("grass_overlay", "/assets/img/tileset/grass_overlay.png", {frameWidth: 32, frameHeight: 32});

    this.load.tilemapTiledJSON(this.getCurrentMapName("level"), "/assets/maps/" + this.database.maps[this.Data.CurrentMap].name + ".json");

    // audio
    this.load.audio(this.database.maps[this.Data.CurrentMap].music.name, "/assets/audio/" + this.database.maps[this.Data.CurrentMap].music.src);

    // characters sprites
    this.load.atlas("characters", "/assets/img/characters/baseMV.png", "/assets/res/characters.json");
    this.load.atlas("character_male1", "/assets/img/characters/male_char1.png", "/assets/res/male_char1.json");
    this.load.atlas("character_male2", "/assets/img/characters/male_char2.png", "/assets/res/male_char2.json");
    this.load.image("character_male1_full", "/assets/img/characters/boy_battle1.png");
    this.load.atlas("character_female1", "/assets/img/characters/female_char1.png", "assets/res/female_char1.json");
    // possíveis wild monsters
    if (this.database.maps[this.Data.CurrentMap].hasWild) {
        for (let i = 0; i < this.database.maps[this.Data.CurrentMap].wild_appearence.length; i ++) {
            let id = this.database.maps[this.Data.CurrentMap].wild_appearence[i]; 
            this.load.atlas(
                this.database.characters[this.database.monsters[id].name].atlas,
                "/assets/img/monsters/overworld/" + id + ".png",
                "/assets/res/monster_" + id + "_overworld.json"
            );
        };
    };

    // custom assets do mapa
    if (this.database.maps[this.Data.CurrentMap].customAssets && this.database.maps[this.Data.CurrentMap].customAssets.length > 0) {
        for (let i = 0; i < this.database.maps[this.Data.CurrentMap].customAssets.length; i ++) {
            let customAsset = this.database.maps[this.Data.CurrentMap].customAssets[i];
            switch (customAsset.type) {
                case "image": {
                    this.load.image(customAsset.key, customAsset.src);
                    break;
                };
                case "spritesheet": {
                    this.load.spritesheet(customAsset.key, customAsset.src, {frameWidth: customAsset.frame.width, frameHeight: customAsset.frame.height});
                    //this.load.spritesheet("button_new", "/assets/img/battle/button_spritesheet.png", {frameWidth: 105, frameHeight: 38});
                    break;
                };

                case "atlas": {
                    this.load.atlas(customAsset.key, customAsset.src, customAsset.atlas);
                    //this.load.atlas("monster_" + (monster.monsterpedia_id), "/assets/img/monsters/" + monster.monsterpedia_id + ".png", "/assets/res/monster_" + (monster.monsterpedia_id) + ".json");
                    break;
                };
            };
        };
    };

    // monstros que estão no bracelete
     for (let i = 0; i < 6; i ++) {
        let monster = this.Data.CurrentMonsters["monster" + i];

        if (monster) {
            this.load.atlas(
                this.database.characters[this.database.monsters[monster.monsterpedia_id].name].atlas,
                "/assets/img/monsters/overworld/" + monster.monsterpedia_id + ".png",
                "/assets/res/monster_" + monster.monsterpedia_id + "_overworld.json"
            );
        };
     };

    [1, 4, 7, 10, 12, 15].forEach(monster => {
        this.load.atlas(
            "monster_" + monster + "_overworld",
            "/assets/img/monsters/overworld/" + monster + ".png",
            "/assets/res/monster_" + monster + "_overworld.json"
        );

        this.load.atlas(
            "monster_" + monster, 
            "/assets/img/monsters/" + monster + ".png", 
            "/assets/res/monster_" + monster + ".json"
        );
    });

    // 5, 6, 1, 8

    // miscellaneous
    this.load.image("rain", "/assets/img/rain.png");
    this.load.image("magic-seal", "/assets/img/items/1.png");
    this.load.image("super-potion", "/assets/img/items/6.png");
    this.load.image("antidote", "/assets/img/items/10.png");
    this.load.image("parchment", "/assets/img/items/25.png");
    this.load.image("coin-silver", "/assets/img/items/silver.png");
    this.load.image("coin-gold", "/assets/img/items/gold.png");
    this.load.image("vip", "/assets/img/vip.png");

    // sprites placeholder
    this.load.image("placeholder_monster", "/assets/img/monsters/placeholdermonster.png");
    this.load.image("placeholder-avatar", "/assets/img/profile/avatar.png");

    //this.load.spritesheet("placeholder_overworldmonster");
    //this.load.spritesheet("placeholder_overworldplayer");

    // ** ui
    this.load.atlas("icons", "/assets/img/interface/icons.png", "/assets/res/icons.json");
    this.load.atlas("types", "/assets/img/interface/types.png", "/assets/res/types.json");
    this.load.atlas("status-problem", "/assets/img/interface/status_problem.png", "/assets/res/status_problem.json");
    this.load.image("dialog", "/assets/img/interface/dialog.png");
    this.load.atlas("d-pad", "/assets/img/interface/dpad/dpad.png", "/assets/res/d-pad.json");
    this.load.spritesheet("button_new", "/assets/img/battle/button_spritesheet.png", {frameWidth: 105, frameHeight: 38});
    this.load.image("mask", "/assets/img/mask1.png");
    this.load.image("loading", "assets/img/interface/loading.png");
    this.load.image("blue-background", "/assets/img/interface/blue_background.png");
    this.load.image("tile-background", "/assets/img/interface/tile_background.png");
    this.load.spritesheet("chat-balloon", "/assets/img/interface/balloonsheet.png", {frameWidth: 39, frameHeight: 36});
    // pre-battle
    this.load.image("wild-box", "/assets/img/prebattle/box.png");
    this.load.spritesheet("battle-button", "/assets/img/prebattle/battle_sheet2.png", {frameWidth: 105, frameHeight: 38});
    this.load.spritesheet("run-button", "/assets/img/prebattle/run_sheet.png", {frameWidth: 105, frameHeight: 38});
    this.load.spritesheet("info-button", "/assets/img/prebattle/info_sheet.png", {frameWidth: 40, frameHeight: 40});
    this.load.image("wild-tooltip", "/assets/img/prebattle/tooltip-normal.png");
    this.load.image("wild-tooltip-special", "/assets/img/prebattle/tooltip-special.png");
    this.load.spritesheet("rating", "/assets/img/prebattle/rating.png", {frameWidth: 86, frameHeight: 20});
    // party
    this.load.image("party-background", "/assets/img/party/background.png");
    this.load.spritesheet("party-slot", "/assets/img/party/slotsheet.png", {frameWidth: 148, frameHeight: 39});
    this.load.spritesheet("party-tooltip", "/assets/img/party/tooltip_spritesheet.png", {frameWidth: 220, frameHeight: 50});
    this.load.image("tab-party-button", "/assets/img/party/tabpartybutton.png");
    //this.load.image("party-return-button", "/assets/img/party/return-button.png");
    this.load.spritesheet("gender", "/assets/img/party/gen.png", {frameWidth: 11, frameHeight: 11});
    this.load.spritesheet("button_back", "/assets/img/battle/back_spritesheet.png", {frameWidth: 38, frameHeight: 40});
    // specific-party
    this.load.image("party-info", "/assets/img/party/info2.png");
    this.load.image("party-stats", "/assets/img/party/statistics.png");
    this.load.image("party-moves", "/assets/img/party/moves2.png");
    this.load.image("party-hud", "/assets/img/party/hud.png");
    this.load.image("party-move-button", "/assets/img/party/move-btn.png");
    this.load.image("party-move-window", "/assets/img/party/move-window.png");
    // itens
    this.load.image("items-background", "/assets/img/items/itens/background.png");
    this.load.image("items-window-box", "/assets/img/items/itens/ui-itens-box.png");
    this.load.spritesheet("items-button", "/assets/img/items/itens/ui-itens-btn.png", {frameWidth: 113, frameHeight: 42});
    this.load.image("items-close-btn", "/assets/img/items/itens/ui-itens-close-btn.png");
    //selfie-profile
    this.load.image("selfprofile-background", "/assets/img/selfprofile/bg.png");
    this.load.image("selfprofile-info1", "/assets/img/selfprofile/ui-info1.png");
    this.load.image("selfprofile-info2", "/assets/img/selfprofile/ui-info2.png");
    this.load.image("selfprofile-earns", "/assets/img/selfprofile/ui-earns.png");
    this.load.image("selfprofile-special-box", "/assets/img/selfprofile/special-box.png");
    this.load.image("selfprofile-boxskin", "/assets/img/selfprofile/box-skin.png");
    this.load.spritesheet("selfprofile-slotskin", "/assets/img/selfprofile/slot-skin.png", {frameWidth: 39, frameHeight: 50});
    this.load.image("selfprofile-skin-tab-pagination", "/assets/img/selfprofile/skin-tab-pagination.png");
    // profile
    this.load.image("profile-background", "/assets/img/profile/bg.png");
    this.load.image("profile-info", "/assets/img/profile/infos.png");
    this.load.image("profile-monster-slot", "/assets/img/profile/monster-slot.png");
    this.load.image("profile-achievements", "/assets/img/profile/achievements.png");
    this.load.image("profile-invite-box", "/assets/img/profile/ui-invite-box.png");
    this.load.spritesheet("profile-close-btn", "/assets/img/profile/close-btn.png", {frameWidth: 14, frameHeight: 14});
    this.load.image("profile-empty", "/assets/img/profile/emptyhelper.png");
    // quests
    this.load.image("quest-base", "/assets/img/quest/base.png");
    this.load.image("quest-accept-base", "/assets/img/quest/accept-base.png");
    this.load.image("quest-div", "/assets/img/quest/div.png");
    this.load.image("quest-item-slot", "/assets/img/quest/item-slot.png");
    this.load.image("quest-amount-bg", "/assets/img/quest/amount-bg.png");
    this.load.spritesheet("quest-pagination-btn", "/assets/img/quest/pagination-btn.png", {frameWidth: 7, frameHeight: 9});
    this.load.spritesheet("quest-btn-accept", "/assets/img/quest/btn-accept.png", {frameWidth: 263, frameHeight: 35});
    // box
    this.load.image("box-background", "/assets/img/box/background.png");
    this.load.image("box-in-party", "/assets/img/box/ui-inparty.png");
    this.load.spritesheet("box-pagination", "/assets/img/box/ui-pagination.png", {frameWidth: 7, frameHeight: 12});
    this.load.image("box-info", "/assets/img/box/ui-info.png");
    this.load.spritesheet("box-btn-slot", "/assets/img/box/ui-slot-button.png", {frameWidth: 37, frameHeight: 34});
    // market
    this.load.image("market-background", "/assets/img/market/bg.png");
    this.load.image("market-tab1", "/assets/img/market/tab1.png");
    this.load.image("market-tab2", "/assets/img/market/tab2.png");
    this.load.image("market-tab3", "/assets/img/market/tab3.png");
    this.load.image("market-tab4", "/assets/img/market/tab4.png");
    this.load.image("market-tab5", "/assets/img/market/tab5.png");
    this.load.spritesheet("market-select-pagination", "/assets/img/market/select-pagination.png", {frameWidth: 7, frameHeight: 11});
    this.load.spritesheet("market-slot-btn", "/assets/img/market/slot-btn.png", {frameWidth: 109, frameHeight: 52});
    this.load.image("market-confirm-window", "/assets/img/market/window-bg.png");
    this.load.image("market-amount-bg", "/assets/img/market/amount-bg.png");
    this.load.spritesheet("market-select-amount", "/assets/img/market/select-amount.png", {frameWidth: 12, frameHeight: 6});
    this.load.spritesheet("market-btn-confirm", "/assets/img/market/btn-confirm.png", {frameWidth: 98, frameHeight: 43});
    this.load.spritesheet("market-btn-reject", "/assets/img/market/btn-reject.png", {frameWidth: 98, frameHeight: 43});
    // notify
    this.load.image("notify-popover", "/assets/img/notify/popover.png");
    this.load.image("notify-div", "/assets/img/notify/ui-div.png");
    this.load.image("notify-background", "/assets/img/notify/background.png");
    this.load.spritesheet("notify-pagination", "/assets/img/notify/ui-pagination.png", {frameWidth: 9, frameHeight: 17});
    // learn-move
    this.load.spritesheet("learn-btn", "/assets/img/notify/newmove/ui-btn.png", {frameWidth: 139, frameHeight: 39});

    // dados
    this.load.json("language", "/assets/res/phrases.json");
    this.load.json(this.getCurrentMapName("events"), "/assets/maps/" + this.database.maps[this.Data.CurrentMap].name + ".events.json");
    this.load.json("experience", "/assets/res/experience.json");
};

Game.Overworld.create = function () {

    overworld = this;

    //console.log("Overworld Scene create");
    //this.cursors = this.input.keyboard.createCursorKeys();
    // this.sys.canvas.parentNode
    // buttons e texts
    this.btn = {};
    this.text = {};

    // controlador de interfaces
    this.iconsHandler = {};
    this.interfacesHandler = {};

    // keyboard listeners
    this.keyup = e => this.key.onKeyUp(e);
    this.keydown = e => this.key.onKeyDown(e);
    document.addEventListener("keyup", this.keyup, false);
    document.addEventListener("keydown", this.keydown, false);

    // colocando mapa
    this.map = this.add.tilemap(this.getCurrentMapName("level"));

    // colocando tilesets
    this.tile = [
        this.map.addTilesetImage("Tiles1", "tileset1"),
        this.map.addTilesetImage("Tiles2", "tileset2"),
        this.map.addTilesetImage("Indoors", "indoors")
    ];

    // containers
    this.containers.map = this.add.container();
    this.containers.main = this.add.container();
    this.containers.preOverlay = this.add.container();
    this.containers.overlay = this.add.container();
    this.containers.illumination = this.add.container();
    this.containers.interface = this.add.container();

    //console.log(this.lights);

    // gerar mapa
    this.generateMap();
    // animar tiles
    this.animatedTiles.init(this.map);

    //this.add.sprite(0, 0, "").setOrigin(0, 0);
    //gerar iluminação
    // this.lamps = [];
    // this.generateIllumination();
    // //this.illuminated.occlusionCulling = true;
    // // criar layermask de escuridão
    // const mask = this.illuminated.createDarkMask(this.lamps, {
    //     width: this.map.width * this.map.tileWidth,
    //     height: this.map.height * this.map.tileHeight,
    // }, "rgba(0, 0, 0, 0.7)");

    // this.containers.illumination.add(this.lamps);
    // this.containers.illumination.add(mask);
    // this.containers.illumination.add(mask.lampsEdge);

    // this.recObject = this.illuminated.createRectangleObject(0, 0, 16, 16);

    // for (let i = 0; i < this.lamps.length; i ++) {
    //     this.lamps[i].createLighting([this.recObject]);
    // };

    if (this.switchingMap) {
        // mudando posição do personagem
        let incomingteleport = this.cache.json.get(this.getCurrentMapName("events")).map.incomingteleport[this.tid];
        this.player._data.position.x = incomingteleport.x;
        this.player._data.position.y = incomingteleport.y;
        this.player._data.position.facing = incomingteleport.facing;
        this.player._data.stop = false;
    };

    // setando ação atual
    this.currentAction = this.actions.walking;
 
    // ** adicionar jogador
    this.addPlayer();
    //this.player.createFollower("Fogara");
    //this.follower_data[this.player._data.follower.id].createFollower(1);
    //this.follower_data[this.follower_data[this.player._data.follower.id]._data.follower.id].createFollower(4);
    this.interactionButtonEnabled = true;

    console.log(this.player._data.position);

    this.scale.stopListeners();

    // setInterval(() => {
    //     console.log(this.scale.isFullscreen);
    // }, 500);

    //console.log(this.cache);

    // ** adicionar objetos e npcs
    this.appendMapObjects();

    // verificar tile atual
    switch (
            this.testColl({
            x: this.player._data.position.x,
            y: this.player._data.position.y
        })
    ) {
        case 4: {
            // adiciona overlay
            this.player.addGrassOverlay(this.appendGrassOverlay(this.player._data.position.x, this.player._data.position.y));
            break;
        };

        case 7: {
            // pegando eventos, buscando map id e teleport id
            const 
                mapData = this.cache.json.get(this.getCurrentMapName("events")),
                event = _.findWhere(mapData.events.config, {
                    x: this.player._data.position.x,
                    y: this.player._data.position.y
                });

            if (_.indexOf(mapData.events.script[event.id].requiredFlagValueToExec, this.flag) >= 0) {
                this.automatizeAction({
                    type: 2
                }, mapData.events.script[event.id].script);
            };

            break;
        };
    };

    // verificar se tem algum domador ao alcance do player
    this.checkPlayerPositionTamer(this.cache.json.get(this.getCurrentMapName("events")));
    // chuva
    //this.weather.rain.bind(this)();
    
    // ** conexão ws
    this.initConnection();

    // ** interface
    this.icon = {};

    this.icon.profile = new Phaser.Button(this, {
        x: 128,
        y: 5,
        spritesheet: "icons",
        on: {
            click: () => {
                this.Socket.emit("52");
            }
        },
        frames: {click: "icon_profile", over: "icon_profile", up: "icon_profile", out: "icon_profile"}
    });
    this.icon.profile.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.profile.sprite);

    this.icon.party = new Phaser.Button(this, {
        x: 161,
        y: 5,
        spritesheet: "icons",
        on: {
            click: () => {
                this.toggleParty();
            }
        },
        frames: {click: "icon_party", over: "icon_party", up: "icon_party", out: "icon_party"}
    });
    this.icon.party.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.party.sprite);

    this.icon.bag = new Phaser.Button(this, {
        x: 188,
        y: 6,
        spritesheet: "icons",
        on: {
            click: () => {
                this.appendBag();
            }
        },
        frames: {click: "icon_bag", over: "icon_bag", up: "icon_bag", out: "icon_bag"}
    });
    this.icon.bag.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.bag.sprite);

    this.chatMessages = "";
    this.countChatMessages = 0;
    this.newChatNotificationMessages = 0;

    this.icon.chat = new Phaser.Button(this, {
        x: 218,
        y: 7,
        spritesheet: "icons",
        on: {
            click: () => {
                this.toggleChat();
            }
        },
        frames: {click: "icon_chat", over: "icon_chat", up: "icon_chat", out: "icon_chat"}
    });
    this.icon.chat.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.chat.sprite);

    this.icon.quests = new Phaser.Button(this, {
        x: 251,
        y: 8,
        spritesheet: "icons",
        on: {
            click: () => {
                this.toggleQuests();
            }
        },
        frames: {click: "icon_quests", over: "icon_quests", up: "icon_quests", out: "icon_quests"}
    });
    this.icon.quests.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.quests.sprite);

    this.icon.notify = new Phaser.Button(this, {
        x: 278,
        y: 4,
        spritesheet: "icons",
        on: {
            click: () => {
                console.log("click notify!");
                this.toggleNotifications();
            }
        },
        frames: {click: "icon_notifications", over: "icon_notifications", up: "icon_notifications", out: "icon_notifications"}
    });
    this.icon.notify.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.notify.sprite);

    this.icon.config = new Phaser.Button(this, {
        x: 308,
        y: 7,
        spritesheet: "icons",
        on: {
            click: () => {
                console.log("click config!");
            }
        },
        frames: {click: "icon_config", over: "icon_config", up: "icon_config", out: "icon_config"}
    });
    this.icon.config.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.config.sprite);

    this.fullScreenEnabled = document.fullscreenElement ? true : false;
    this.icon.fullscreen = {};
    this.icon.fullscreen.sprite = this.add.sprite(
        335, 
        7,
        "icons"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setFrame(this.fullScreenEnabled ? "icon_fullscreen_on" : "icon_fullscreen_off")
        .setInteractive({
            useHandCursor: true
        });

    this.icon.fullscreen.sprite.on("pointerdown", () => {

        this.fullScreenEnabled = !this.fullScreenEnabled;

        toggleFullScreen();

        if (this.fullScreenEnabled) {
            this.icon.fullscreen.sprite.setFrame("icon_fullscreen_on");
        } else {
            this.icon.fullscreen.sprite.setFrame("icon_fullscreen_off");
        };
    });


    this.containers.interface.add(this.icon.fullscreen.sprite);

    if (this.database.maps[this.Data.CurrentMap].music.name != this.manager.audio) {
        this.manager.audio = this.database.maps[this.Data.CurrentMap].music.name;
        this.music = this.sound.add(this.database.maps[this.Data.CurrentMap].music.name, {
            loop: true
        });

        this.music.play();
    };

    if (this.notify.count > 0)
        this.appendNotificationBadge();

    this.statusShowingParty = false;
    this.statusShowingItems = false;
    this.statusShowingChat = false;
    this.statusShowingQuests = false;
    this.statusShowingNotifications = false;

    const key1 = this.input.keyboard.addKey("one");
    key1.on("down", () => {
        this.toggleParty();
        //this.toggleItems();
    });

    const key3 = this.input.keyboard.addKey("three");
    key3.on("down", () => {
        //this.togglePocketMonsters();
        this.toggleChat();
    });

    const key4 = this.input.keyboard.addKey("four");
    key4.on("down", () => {
        this.toggleQuests();
    });

    const key5 = this.input.keyboard.addKey("five");
    key5.on("down", () => {
        this.toggleNotifications();
        this.appendNotifications();
    });


    const keyZ = this.input.keyboard.addKey("Z");
    keyZ.on("down", () => {
        this.zButton();
    });

    this.isChatInputOpenned = false;

    const keyEnter = this.input.keyboard.addKey("Enter");
    const chatInput = Elements.chat.querySelector("[data-type=chat]");

    // trickzin pra typing funcionar
    chatInput.style.display = "none";

    keyEnter.on("down", () => {

        if (!this.statusShowingChat)
            return;

        // abrir input de texto caso esteja fechado
        if (chatInput.style.display == "none") {
            this.isChatInputOpenned = true;
            chatInput.style.display = "block";
            chatInput.focus();
            this.sendTypingBalloon(true);
        // fechar input de texto caso não tenha nada digitado
        } else if (chatInput.style.display != "none" && (chatInput.value.length === 0 || !chatInput.value.trim()) ) {
            console.log("Não aki");

            this.isChatInputOpenned = false;
            chatInput.style.display = "none";
            this.sendTypingBalloon(false);
        // enviar mensagem
        } else if (chatInput.style.display != "none" && chatInput.value.length > 0) {
            console.log("Veio aki");
            this.isChatInputOpenned = true;
            this.sendChatMessage(chatInput.value);
            this.sendTypingBalloon(false);
            chatInput.value = "";
            chatInput.style.display = "none";
            this.isChatInputOpenned = false;
        };
    });

    this.keyEnter = keyEnter;
    this.keyZ = keyZ;
    this.key1 = key1;
    this.key3 = key3;
    this.key4 = key4;
    this.key5 = key5;

    if (this.isMobile)
        this.appendDPad();

    this.resize();
    this.scale.on("resize", () => this.resize());

    this.depthSort();

    // ações injetáveis
    if (this.injectedActions) {
        for (let i = 0; i < this.injectedActions.length; i ++)
            this.execInjectedAction(this.injectedActions[i]);
    };

    //this.appendChatMessages();

    //this.appendPartyInterface();

    //this.appendSelfProfile();

    //this.iter = 0;

    //
    this.dispatchToasts();
    //this.appendMarket();
    

    // this.addLoader();
    //new BalloonDialog(this);


    //this.appendChatNotification();

    // setTimeout(() => {
    //     
    // }, 3000);
    //this.weather.rain.bind(this)();
    this.ping();
    setInterval(() => this.ping(), 2000);
};

Game.Overworld.update = function (time, delta) {
    this.isMobile ? this.checkDPad() : this.checkInputs();
    // this.recObject.originalX = this.player.x - 70;
    // this.recObject.originalY = this.player.y - 70;

    //console.log(this.cameras.main.worldView);

    // if (this.bglol) {
    //     console.log("lol");
    //     this.animatedBg.tilePositionX = this.iter * 100;
    //     this.animatedBg.tilePositionY = this.iter * 100;

    //     this.iter += 0.01;
    // };
};

Game.Overworld.checkInputs = function () {

    if (this.isChatInputOpenned)
        return;

    if (this.disableMoveInputs)
        return;

    //console.log(this.key.time);

    if (this.key.isDown(this.key.UP) || this.key.isDown(this.key.W))
        this.doMovement(0);
    else if (this.key.isDown(this.key.DOWN) || this.key.isDown(this.key.S))
        this.doMovement(2);

    if (this.key.isDown(this.key.LEFT) || this.key.isDown(this.key.A))
        this.doMovement(3);
    else if (this.key.isDown(this.key.RIGHT) || this.key.isDown(this.key.D)) 
        this.doMovement(1);
};

Game.Overworld.appendDPad = function () {
    
    this.dpad = {};

    this.dpad.up = new Phaser.Button(this, {
        x: 40,
        y: 136,
        spritesheet: "d-pad",
        on: {
            click: () => {
                console.log("click!");
            },
            over: () => {
                console.log("hover!");
                this.dpad.up.isDown = true;
            },
            out: () => {
                console.log("out!");
                this.dpad.up.isDown = false;
            }
        },
        frames: {click: "d_up_hover", over: "d_up_hover", up: "d_up", out: "d_up"}
    });
    this.dpad.up.sprite.setScrollFactor(0);
    this.dpad.up.isDown = false;

    this.dpad.right = new Phaser.Button(this, {
        x: 62,
        y: 164,
        spritesheet: "d-pad",
        on: {
            click: () => {
                console.log("click!");
            },
            over: () => {
                console.log("hover!");
                this.dpad.right.isDown = true;
            },
            out: () => {
                console.log("out!");
                this.dpad.right.isDown = false;
            }

        },
        frames: {click: "d_right_hover", over: "d_right_hover", up: "d_right", out: "d_right"}
    });
    this.dpad.right.sprite.setScrollFactor(0);
    this.dpad.right.isDown = false;

    this.dpad.down = new Phaser.Button(this, {
        x: 40,
        y: 185,
        spritesheet: "d-pad",
        on: {
            click: () => {
                console.log("click!");
            },
            over: () => {
                console.log("hover!");
                this.dpad.down.isDown = true;
            },
            out: () => {
                console.log("out!");
                this.dpad.down.isDown = false;
            }
        },
        frames: {click: "d_down_hover", over: "d_down_hover", up: "d_down", out: "d_down"}
    });
    this.dpad.down.sprite.setScrollFactor(0);
    this.dpad.down.isDown = false;

    this.dpad.left = new Phaser.Button(this, {
        x: 10,
        y: 166,
        spritesheet: "d-pad",
        on: {
            over: () => {
                console.log("hover!");
                this.dpad.left.isDown = true;
            },
            out: () => {
                console.log("out!");
                this.dpad.left.isDown = false;
            }

        },
        frames: {click: "d_left_hover", over: "d_left_hover", up: "d_left", out: "d_left"}
    });
    this.dpad.left.sprite.setScrollFactor(0);
    this.dpad.left.isDown = false;

    this.dpad.button = new Phaser.Button(this, {
        x: 415,
        y: 174,
        spritesheet: "d-pad",
        on: {
            click: () => {
                this.zButton();
            }
        },
        frames: {click: "button_press", over: "button_press", up: "button", out: "button"}
    });
    this.dpad.button.sprite.setScrollFactor(0);

    this.containers.interface.add(this.dpad.up.sprite);
    this.containers.interface.add(this.dpad.right.sprite);
    this.containers.interface.add(this.dpad.down.sprite);
    this.containers.interface.add(this.dpad.left.sprite);
    this.containers.interface.add(this.dpad.button.sprite);
};

Game.Overworld.checkDPad = function () {

    if (this.isChatInputOpenned)
        return;

    if (this.disableMoveInputs)
        return;

    // tratando input de movimentação
    if (this.dpad.up.isDown)
        this.doMovement(0);
    else if (this.dpad.down.isDown)
        this.doMovement(2);

    if (this.dpad.left.isDown)
        this.doMovement(3);
    else if (this.dpad.right.isDown)
        this.doMovement(1);
};

// movimento do player -> principal
Game.Overworld.doMovement = function (direction, callback) {
    try {
        this.player.walk(direction, callback);
    } catch (e) {};
};

Game.Overworld.zButton = function () {

    console.log(this.layer[0].worldToTileXY(this.player.x, this.player.y));

    // caso o botão de interação não esteja habilitado
    if (!this.interactionButtonEnabled)
        return;
    
    //console.log(event.target);

    //console.log("ação atual", this.currentAction);

    //console.log(this.boxPageLimits);
    //console.table(this.Data.BoxMonsters);    
    switch (this.currentAction) {
        //walking
        case this.actions.walking: {
            this.interactWithObject();
            break;
        };
        // dialog
        case this.actions.dialog: {
            this.nextDialog();
            break;
        };
    };
};

Game.Overworld.ping = function () {
    this.Socket.emit("0");
    this.pingDate = Date.now();
};

Game.Overworld.calcPing = function () {
    console.log("ping: ", Date.now() - this.pingDate);
};

Game.Overworld.getCurrentMapName = function (str) {
    return str + "_" + this.database.maps[this.Data.CurrentMap].name;
};
// database.maps
Game.Overworld.resize = function () {
    Div.applyToCenter(Elements.chat, this.sys.game.canvas.style.width);
};

Game.Overworld.key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    W: 87,
    A: 65,
    S: 83,
    D: 68,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    onKeyDown: function (e) {
        this._pressed[e.keyCode] = true;
    },

    onKeyUp: function (e) {
        delete this._pressed[e.keyCode];
    },

    unbind: function () {
        //console.log(this);
        document.removeEventListener("keyup", this.keyup, false);
        document.removeEventListener("keydown", this.keydown, false);
        this.keyEnter.destroy();
        this.keyZ.destroy();
        this.key1.destroy();
        this.key3.destroy();
        this.key4.destroy();
        this.key._pressed = {};
    }
};

Game.Overworld.stopScene = function () {
    this.scene.stop();
    this.music.stop();
    this.unsubscribeToMap();
    // remove eventos de keyboard
    this.key.unbind.bind(this)();
};

Game.Overworld.addLoader = function () {

    this._load = new Loading(this);

    this._overlay = this.add.sprite(0, 0, "tab-party-button")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();

    this._overlay.displayWidth = 480;
    this._overlay.displayHeight = 240;

    this.interactionButtonEnabled = false;
};

Game.Overworld.removeLoader = function () {
    if (this._load && this._overlay) {
        this._load.destroy();
        this._overlay.destroy();
        this._load = null;
        this._overlay = null;
        this.interactionButtonEnabled = true;
    };
};