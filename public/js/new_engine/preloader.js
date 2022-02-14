Game.Boot = {};

Game.Boot.Extends = Phaser.Scene;

Game.Boot.initialize = function () {
    Phaser.Scene.call(this, {key: "boot"});
};

Game.Boot.init = function (data) {
    this.data = data;
};

Game.Boot.preload = function () {
    this.load.image("load_background", "/assets/img/load_screen.png");
    this.load.json("database", "/assets/res/database.json");
};

Game.Boot.create = function () {
    this.scene.start(this.data.state, this.data);
};