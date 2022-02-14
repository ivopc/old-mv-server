// add sprite
this.sprite = this.add.sprite(
    0,
    0,
    "texture"
)
    .setOrigin(0, 0)
    .setScrollFactor(0);

this.containers.interface.add(this.sprite);

// add text
this.text = this.add.text(0, 0, "texto", { 
    fontFamily: "Century Gothic", 
    fontSize: 14, 
    color: "#000" 
})
    .setOrigin(0, 0)
    .setScrollFactor(0);
this.containers.interface.add(this.text);

// word wrap
this.text = this.add.text(0, 0, "", {
    fontFamily: "Century Gothic", 
    fontSize: 14, 
    color: "#fff",
    wordWrap: {
        width: this.sys.game.canvas.width,
        useAdvancedWrap: true
    }
})
    .setScrollFactor(0);
this.containers.interface.add(this.text);

// centralizar
    .setOrigin(0.5)
    .setX(sprite.getCenter().x)
    .setY(sprite.getCenter().y);

// trocar de avatar
const sprite = 3;
overworld.Socket.emit("51", {
    sprite
});
overworld.player.changeSprite(sprite);

// abrir monster box
overworld.Socket.emit("12");

// market
overworld.appendMarket();

// mostrar notificaçlões
overworld.appendNotifications();
overworld.requestMoveNotification(1);
overworld.requestEvolveNotification(1);

// * requisitar ação da notificação
// mudar move
overworld.requestChangeMoveByNotification({
    n_id: 1,
    position: 1
});
// evoluir monstro
overworld.requestEvolveByNotification({
    n_id: 1
});

getTileAt && worldToTileXY && tileToWorldXY && putTileAt;

// get text
this.cache.json.get("language").set["phrase"][this.lang];

// button
this.button = new Phaser.Button(this, {
    x: 461,
    y: 6,
    spritesheet: "profile-close-btn",
    on: {
        click: () => {
            this.fn();
        }
    },
    frames: {click: 2, over: 1, up: 0, out: 0}
});
this.button.sprite.setScrollFactor(0);
this.containers.interface.add(this.button.sprite);