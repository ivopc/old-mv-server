class Character extends Phaser.GameObjects.Sprite {

    constructor (scene, data) {

        super(
            scene, 
            scene.positionToRealWorld(data.position.x), 
            scene.positionToRealWorld(data.position.y)
        );

        this.scene = scene;

        this.elements = {
            nickname: null,
            clan: null,
            balloon: {
                typing: null,
                dialog: null,
                emotion: null,
                quest: null
            }
        };

        // eventos
        this.events = {
            startMove: [],
            endMove: [],
            cantMove: []
        };
        
        // overlay do matinho
        this.grassOverlay;

        data = data || {};
        // normaliza dados
        data.position = data.position || {};
        data.position.x = data.position.x || 0;
        data.position.y = data.position.y || 0;
        data.position.facing = data.position.facing || 0;
        data.follower = data.follower || {};
        data.follower.has = data.follower.has || false;
        data.follower.id = data.follower.id || null;

        // aplica dados
        this._data = {
            type: data.type,
            name: data.name,
            sprite: data.sprite,
            atlas: scene.database.characters[data.sprite].atlas,
            position: {
                x: data.position.x,
                y: data.position.y,
                facing: data.position.facing
            },
            stepFlag: 0,
            follower: {
                has: data.follower.has,
                id: data.follower.name
            },
            moveInProgress: false
        };

        if (data.isTamer) {
            this._data.isTamer = true;
            this._data.maxview = data.maxview;
        };

        if (data.type == 1) {
            this._data.nickname = data.nickname;
        }

        // seta textura
        this.setTexture(scene.database.characters[data.sprite].atlas);
        this.setFrame(scene.database.characters[data.sprite].name + "_" + scene.database.overworld.directions[data.position.facing] + "_idle0");

        // seta posição
        this.setPosition(
            scene.positionToRealWorld(data.position.x), 
            scene.positionToRealWorld(data.position.y)
        );

        // seta origem
        const origin = scene.database.characters[data.sprite].origin[scene.database.overworld.directions[data.position.facing]];
        this.setOrigin(origin.x, origin.y);

        // adiciona animação de idle
        for (let i = 0, l = scene.database.overworld.directions.length; i < l; i++) {
            // criar animação idle para todos os lados
            scene.anims.create({
                key: scene.database.characters[data.sprite].name + "_idle_" + scene.database.overworld.directions[i],
                frames: [
                    {key: scene.database.characters[data.sprite].atlas, frame: scene.database.characters[data.sprite].name + "_" + scene.database.overworld.directions[i] + "_idle0"}, 
                    {key: scene.database.characters[data.sprite].atlas, frame: scene.database.characters[data.sprite].name + "_" + scene.database.overworld.directions[i] + "_idle1"}
                ],
                frameRate: 2,
                repeat: -1
            });

            // adiciona animação a sprite do player
            this.anims.load(scene.database.characters[data.sprite].name + "_idle_" + scene.database.overworld.directions[i]);
        };

        // play na animação idle
        this.anims.play(scene.database.characters[data.sprite].name + "_idle_" + scene.database.overworld.directions[data.position.facing]);
    }

    changeSprite (sprite) {

        this._data.sprite = sprite;
        // seta textura
        this.setTexture(this.scene.database.characters[sprite].atlas);
        this.setFrame(this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[this._data.position.facing] + "_idle0");
    
        // seta origem
        const origin = this.scene.database.characters[sprite].origin[this.scene.database.overworld.directions[this._data.position.facing]];
        this.setOrigin(origin.x, origin.y);

        // adiciona animação de idle
        for (let i = 0, l = this.scene.database.overworld.directions.length; i < l; i++) {
            // criar animação idle para todos os lados
            this.scene.anims.create({
                key: this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[i],
                frames: [
                    {key: this.scene.database.characters[sprite].atlas, frame: this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[i] + "_idle0"}, 
                    {key: this.scene.database.characters[sprite].atlas, frame: this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[i] + "_idle1"}
                ],
                frameRate: 2,
                repeat: -1
            });

            // adiciona animação a sprite do player
            this.anims.load(this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[i]);
        };

        // play na animação idle
        this.anims.play(this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[this._data.position.facing]);
    }

    onStartMove(callback) {
        this.events.startMove.push(callback);
    }

    onEndMove(callback) {
        this.events.endMove.push(callback);
    }

    onCantMove(callback) {
        this.events.cantMove.push(callback);
    }

    triggerStartMove (pos) {
        for (let i = 0, l = this.events.startMove.length; i < l; i++)
            this.events.startMove[i](pos);
    }

    triggerEndMove (pos) {
        for (let i = 0, l = this.events.endMove.length; i < l; i++)
            this.events.endMove[i](pos);
    }

    triggerCantMove (pos) {
        for (let i = 0, l = this.events.cantMove.length; i < l; i++)
            this.events.cantMove[i](pos);
    }

    addInteraction (fn) {
        this.setInteractive().on("pointerdown", fn);
    }

    createFollower (sprite) {

        const
            position = _.clone(this._data.position),
            DIRECTIONS = this.scene.database.overworld.directions_hash;

        switch (this._data.position.facing) {
            case DIRECTIONS.UP: {
                position.y ++;
                break;
            };
            case DIRECTIONS.RIGHT: {
                position.x --;
                break;
            };
            case DIRECTIONS.DOWN: {
                position.y --;
                break;
            };
            case DIRECTIONS.LEFT: {
                position.x ++;
                break;
            };
        };

        const follower = this.scene.appendCharacter({
            name: "follower_" + Date.now() + "_" + (Math.floor(Math.random() * 1000)),
            char: sprite,
            pos: {
                x: position.x,
                y: position.y
            },
            dir: this._data.position.facing,
            type: 3
        });

        this.setFollower(follower._data.name);

        this.scene.depthSort();
    }

    setFollower (id) {
        this._data.follower = {
            has: true,
            id
        };
    }

    removeFollower () {

        if (!this._data.follower.has)
            return;

        this.scene.follower_data[this._data.follower.id].destroy();
        delete this.scene.follower_data[this._data.follower.id];

        this._data.follower = {
            has: false,
            id: null
        };
    }

    addGrassOverlay (sprite) {
        this.grassOverlay = sprite;
    }

    removeGrassOverlay () {
        if (this.grassOverlay) {
            this.grassOverlay.destroy();
            this.grassOverlay = null;
        };
    }

    addTypingBalloon () {
        this.elements.balloon.typing = new BalloonDialog(this.scene)
            .setOrigin(0.5)
            .setX(this.getCenter().x)
            .setY(this.y - this.displayHeight + 10);
    }

    removeTypingBalloon () {
        if (this.elements.balloon.typing) {
            this.elements.balloon.typing.destroy();
            this.elements.balloon.typing = null;
        };
    }

    displayName (name) {
        this.elements.nickname = this.scene.add.text(0, 0, name, { 
            fontFamily: "Century Gothic", 
            fontSize: 12,
            color: "#fff" 
        })
            .setOrigin(0.5)
            .setX(this.getCenter().x)
            .setY(this.y + this.displayHeight);
        //this.elementsContainer.add(r);

        this.scene.containers.main.add(this.elements.nickname);

        //this.elementsContainer.iterate(el => console.log(el));
    }

    elementsFollow () {
        if (this.elements.nickname) {
            this.elements.nickname
                .setOrigin(0.5)
                .setX(this.getCenter().x)
                .setY(this.y + this.displayHeight);
        };

        if (this.elements.balloon.typing) {
            this.elements.balloon.typing
                .setOrigin(0.5)
                .setX(this.getCenter().x)
                .setY(this.y - this.displayHeight + 10);
        };
    }

    removeSprite () {
        if (this.elements.nickname)
            this.elements.nickname.destroy();

        this.removeTypingBalloon();

        this.destroy();
    }

    // andar no mapa
    walk (direction, callback) {
        // se for o jogador
        if (this._data.isPlayer) {
            // se walk estiver em progresso -> sai
            // se jogador estiver parado -> sai
            if (this._data.moveInProgress || this._data.stop)
                return;
        };
        // posição antiga
        const older = _.clone(this._data.position);
        // callback interna
        let internal_callback;
        // executar colisão
        const collision = this.collide(direction);
        // vendo quem é
        switch (this._data.type) {
            // se é player
            case 0: {
                switch (collision) {

                    // não pode se mover
                    case 0: {
                        //** publicando no canal do mapa que mudou facing para tal direção
                        if (this.scene.subscribe.map.is && this._data.position.facing != direction)
                            this.scene.subscribe.map.conn.publish({
                                dir: direction,
                                dataType: 2
                            });
                        // mudando facing na memória
                        this._data.position.facing = direction;
                        // executando animação idle para o lado
                        this.anims.play(this.scene.database.characters[this._data.sprite].name + "_idle_" + this.scene.database.overworld.directions[direction]);
                        // disparando evento de cant move
                        this.triggerCantMove({
                            facing: direction,
                            x: this._data.position.x,
                            y: this._data.position.y
                        });
                        // saindo pois não ira se mexer
                        return;
                    };

                    // solicitar mudança de mapa
                    case 3: {
                        // pegando eventos, buscando map id e teleport id
                        let teleport = _.findWhere(this.scene.cache.json.get(this.scene.getCurrentMapName("events")).map.teleport, {
                            x: this._data.position.x,
                            y: this._data.position.y
                        });

                        // adicionar callback e enviar request para o servidor
                        internal_callback = () => this.scene.requestMapChange(teleport.mid, teleport.tid);
                        break;
                    };

                    // solicitar batalha selvagem | criar overlay do matinho
                    case 4: {
                        let pos = {
                            x: this._data.position.x,
                            y: this._data.position.y
                        };
                        // remove grass antigo
                        this.removeGrassOverlay();

                        // appenda particulas de grama
                        internal_callback = () => {
                            // adiciona overlay
                            this.addGrassOverlay(this.scene.appendGrassOverlay(pos.x, pos.y));
                            // add particles
                            this.scene.appendGrassParticles(pos.x, pos.y);
                            // requisitar batalha selvagem
                            this.scene.requestWildBattle();
                        };


                        break;
                    };

                    // checar se tem algum evento
                    case 7: {
                        // pegando eventos, buscando map id e teleport id
                        const 
                            mapData = this.scene.cache.json.get(this.scene.getCurrentMapName("events")),
                            event = _.findWhere(mapData.events.config, {
                                x: this._data.position.x,
                                y: this._data.position.y
                            });

                        console.log({event});
                        console.log(mapData.events.script[event.id].requiredFlagValueToExec);

                        internal_callback = () => {
                            if (_.indexOf(mapData.events.script[event.id].requiredFlagValueToExec, this.scene.flag) >= 0) {
                                this.scene.automatizeAction({
                                    type: 2
                                }, mapData.events.script[event.id].script);
                            };
                        };
                        break;
                    };
                };

                //** pode andar
                // se tiver overlay de grass
                this.removeGrassOverlay();

                // setando walk em progresso
                this._data.moveInProgress = true;
                // mudando facing
                this._data.position.facing = direction;
                // parando animação do idle para iniciar animação 'procedural'
                this.anims.stop();
                //** publicando no canal do mapa que andou para tal direção
                if (this.scene.subscribe.map.is)
                    this.scene.subscribe.map.conn.publish({
                        dir: direction,
                        dataType: 1 
                    });

                // fazer seguidor seguir personagem (se tiver)
                if (this._data.follower.has)
                    this.scene.follower_data[this._data.follower.id].walk(older.facing);
                break;
            };

            // se for um jogador online ou um npc, ou um follower, ou npc domador
            case 1:
            case 2:
            case 3:
            case 4:
            {

                // verificando tipo da colisão e execuntando o que deve ser feito
                switch(collision) {
                    case 0: {
                        // mudando facing
                        this._data.position.facing = direction;
                        // executando animação idle para o lado
                        this.anims.play(this.scene.database.characters[this._data.sprite].name + "_idle_" + this.scene.database.overworld.directions[direction]);
                        // saindo
                        return;
                    };
                    //matinho
                    case 4: {

                        console.log("MATINHO 1");

                        let pos = {
                            x: this._data.position.x,
                            y: this._data.position.y
                        };
                        // remove grass antigo
                        this.removeGrassOverlay();

                        // appenda particulas de grama
                        internal_callback = () => {
                            console.log("MATINHO 2");
                            // adiciona overlay
                            this.addGrassOverlay(this.scene.appendGrassOverlay(pos.x, pos.y));
                            // add particles
                            this.scene.appendGrassParticles(pos.x, pos.y);
                        };
                        break;
                    };
                };

                //** pode andar
                // se tiver overlay de grass
                this.removeGrassOverlay();

                // mudando facing
                this._data.position.facing = direction;
                // parando animação do idle para iniciar animação 'procedural'
                this.anims.stop();

                // fazer seguidor seguir personagem (se tiver)
                if (this._data.follower.has)
                    this.scene.follower_data[this._data.follower.id].walk(older.facing);

                if (this._data.type == 2 || this._data.type == 4) {

                    const element = this.scene.cache.json.get(this.scene.getCurrentMapName("events")).elements.config[this._data.name];

                    // se mandar salvar a posição dinamica
                    if (element.saveDynamicPosition) {
                        const el = element[this.scene.flag] || element["default"];
                        // preservar a posição do npc
                        el.position = {
                            x: this._data.position.x,
                            y: this._data.position.y,
                            facing: this._data.position.facing
                        };
                    };
                };
                break;
            };
        };

        // executa animação de andar
        // se for player online
        if (this._data.type == 1)
            this.syncAnimationWalk(direction, internal_callback, callback);
        else
            this.asyncAnimationWalk(direction, internal_callback, callback);
    }

    // mudar facing
    face (direction) {
        // se a direção for se virar ao jogador
        if (direction == "toplayer") {
            // pega qual lado jogar está posicionado
            switch(this.scene.player._data.position.facing) {
                case 0: { // cima
                    direction = 2;
                    break;
                };
                case 2: {  // baixo
                    direction = 0;
                    break;
                };
                case 3: { // esquerda
                    direction = 1;
                    break;
                };
                case 1: { // direita
                    direction = 3;
                    break;
                };
            };
        };

        // mudando facing na memória
        this._data.position.facing = direction;
        // para animação (hack para caso esteja no mesmo lado)
        this.anims.stop();
        // executando animação idle para o lado escolhido
        this.anims.play(this.scene.database.characters[this._data.sprite].name + "_idle_" + this.scene.database.overworld.directions[direction]);
        // se for player publica no mapa q vai virar pra tal direção
        if (this._data.isPlayer && this.scene.subscribe.map.is)
            this.scene.subscribe.map.conn.publish({
                dir: direction,
                dataType: 2
            });
    }

    // andar no mapa (animação/renderização) assincrono
    asyncAnimationWalk (direction, internal_callback, callback) {
        async.series([
            next => this.asyncWalkStep0(direction, next),
            next => this.changePositionAsync(direction, next),
            next => this.asyncWalkStep1(direction, next),
            next => this.changePositionAsync(direction, next)
        ], () => this.walkEndStep(direction, internal_callback, callback));
    }

    // função complementar ao asyncAnimationWalk
    asyncWalkStep0 (direction, next) {
        // disparar evento de start move
        this.triggerStartMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
        // mudar origem em relação ao próprio eixo
        this.changeOrigin(direction);
        // tocar flag de step
        this.switchSpriteStep(direction, this._data.stepFlag, "walk");
        // mudar posição
        this.changePositionAsync(direction, next);
    }

    // função complementar ao asyncAnimationWalk
    asyncWalkStep1 (direction, next) {
        // tocar flag de step
        this.switchSpriteStep(direction, 0, "idle");
        // mudar posição
        this.changePositionAsync(direction, next);
    }

    // andar no mapa (animação/renderização) sincrono
    syncAnimationWalk(direction, internal_callback, callback) {
        async.series([
            next => this.syncWalkStep0(direction, next),
            next => this.changePositionSync(direction, next),
            next => this.changePositionSync(direction, next),
            next => this.changePositionSync(direction, next),
            next => this.syncWalkStep1(direction, next),
            next => this.changePositionSync(direction, next),
            next => this.changePositionSync(direction, next),
            next => this.changePositionSync(direction, next)
        ], () => this.walkEndStep(direction, internal_callback, callback));
    }

    // função complementar ao syncAnimationWalk
    syncWalkStep0 (direction, next) {
        // disparar evento de start move
        this.triggerStartMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
        // mudar origem em relação ao próprio eixo
        this.changeOrigin(direction);
        // tocar flag de step
        this.switchSpriteStep(direction, this._data.stepFlag, "walk");
        // mudar posição
        this.changePositionSync(direction, next);
    }

    // função complementar ao syncAnimationWalk
    syncWalkStep1 (direction, next) {
        // tocar flag de step
        this.switchSpriteStep(direction, 0, "idle");
        // mudar posição
        this.changePositionSync(direction, next);
    }

    // quando o walk termina
    walkEndStep (direction, internal_callback, callback) {

        // se for o jogador
        if (this._data.isPlayer) {
            this._data.moveInProgress = false;
            // checar posição dos domadores
            this.scene.checkPlayerPositionTamer(this.scene.cache.json.get(this.scene.getCurrentMapName("events")));
        };

        // começa animação idle
        this.anims.play(this.scene.database.characters[this._data.sprite].name + "_idle_" + this.scene.database.overworld.directions[direction]);

        // atualizando profundidade dos objetos do grupo main
        this.scene.depthSort();

        // chama callback interno
        if (typeof(callback) == "function")
            callback();

        // chama callback externo
        if (typeof(internal_callback) == "function")
            internal_callback();

        // triggar end move
        this.triggerEndMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
    }

    // executar colisão
    collide (direction) {
        // posição do char
        const position = _.clone(this._data.position);

        // incrementa nova posição
        switch(direction) {
            // cima
            case 0: {
                position.y --;
                break;
            };
            // direita
            case 1: {
                position.x ++;
                break;
            };
            // down
            case 2: {
                position.y ++;
                break;
            };
            // esquerda
            case 3: {
                position.x --;
                break;
            };
        };

        // pega informação dos tiles para executar colisão
        const 
            tileY = this.scene.collisionLayer.data[position.y] ? this.scene.collisionLayer.data[position.y] : 0,
            tileX = tileY[position.x] ? tileY[position.x] : 0,
            tilesXY = tileY ? this.scene.database.overworld.tile.properties[tileX.index] : 0;

        // se não for o jogador
        if (!this._data.isPlayer) {

            if (this._data.type == 1) { // outro jogador online
                
                // muda posição
                this._data.position.x = position.x;
                this._data.position.y = position.y;
                
                // se for matinho
                if (tilesXY.wild)
                    return 4;

                // ok
                return 1;
            };

            // checa se colide com posição atual do jogador
            let collision = position.x == this.scene.player._data.x && position.y == this.scene.player._data.y;
            
            // se não colidir, muda posição
            if (!collision && this._data.type != 3) {

                // apaga posição atual no mapa
                delete this.scene.mapObjectPosition[this._data.position.x + "|" + this._data.position.y];
                
                // cria nova posição
                this.scene.mapObjectPosition[position.x + "|" + position.y] = this._data.name;

                // edita posição do objeto
                this._data.position.x = position.x;
                this._data.position.y = position.y;
            };
            // criar overlay do matinho
            if (tilesXY.wild)
                return 4;

            // informa se colidiu ou não
            return collision ? 0 : 1;
        };

        // se for tile limite, bloqueio, ou existir algum objeto no lugar
        if (!tileY || !tileX || !tilesXY || tilesXY.block || this.scene.mapObjectPosition[position.x + "|" + position.y])
            return 0; // 0

        // muda posição do jogador
        this._data.position.x = position.x;
        this._data.position.y = position.y;

        // ** daqui pra baixo pode executar em assincronia
        // solicita mudar de mapa
        if (tilesXY.door)
            return 3;

        // solicita luta selvagem
        if (tilesXY.wild)
            return 4;

        // chega tile de evento
        if (tilesXY.event)
            return 7;

        // ok, pode andar
        return 1;
    }

    // mudar posição do move (assincrono)
    changePositionAsync (direction, next) {

        switch(direction) {

            case 0: { // up
                this.scene.tweens.add({
                    targets: this,
                    ease: "Linear",
                    duration: this.scene.database.overworld.time.step,
                    y: "-=" + (this.scene.database.overworld.tile.size / 4),
                    onComplete: () => next()
                });
                break;
            };

            case 1: { // left
                this.scene.tweens.add({
                    targets: this,
                    ease: "Linear",
                    duration: this.scene.database.overworld.time.step,
                    x: "+=" + (this.scene.database.overworld.tile.size / 4),
                    onComplete: () => next()
                });
                break;
            }
            break;

            case 2: { // down
                this.scene.tweens.add({
                    targets: this,
                    ease: "Linear",
                    duration: this.scene.database.overworld.time.step,
                    y: "+=" + (this.scene.database.overworld.tile.size / 4),
                    onComplete: () => next()
                });
                break;
            }
            break;

            case 3: { // right
                this.scene.tweens.add({
                    targets: this,
                    ease: "Linear",
                    duration: this.scene.database.overworld.time.step,
                    x: "-=" + (this.scene.database.overworld.tile.size / 4),
                    onComplete: () => next()
                });
                break;
            };
        };

        this.elementsFollow();
    }

    // mudar posição do move (sync)
    changePositionSync (direction, next) {

        switch(direction) {

            case 0: { // up
                this.y -= this.scene.database.overworld.tile.size / 8;
                break;
            };

            case 1: { // left
                this.x += this.scene.database.overworld.tile.size / 8;
                break;
            }
            break;

            case 2: { // down
                this.y += this.scene.database.overworld.tile.size / 8;
                break;
            }
            break;

            case 3: { // right
                this.x -= this.scene.database.overworld.tile.size / 8;
                break;
            };
        };

        this.elementsFollow();

        this.scene.time.addEvent({delay: this.scene.database.overworld.time.step / 2, callback: next});
    }

    // trocar sprite do passo
    switchSpriteStep (direction, flag, type) {

        // vendo se sprite é de step e mudando step flag
        if (typeof(flag) == "number" && type == "walk") {
            flag = flag ? 0 : 1;
            this._data.stepFlag = flag;
        };

        // mudando frame
        this.setFrame(this.scene.database.characters[this._data.sprite].name + "_" + this.scene.database.overworld.directions[direction] + "_" + type + flag);
    }

    // mudar posição em relação ao próprio eixo
    changeOrigin (direction) {
        const origin = this.scene.database.characters[this._data.sprite].origin[this.scene.database.overworld.directions[direction]];
        this.setOrigin(origin.x, origin.y);
    }
};

class Player extends Character {
    constructor (scene, data) {
        super(scene, data);
        this._data.stop = data.stop || false;
        this._data.isPlayer = true;
        this._data.nickname = data.nickname;
    }
};

class MonsterOverworldIcon extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y, sprite) {
        super(scene, x, y, sprite);

        this.setTexture(scene.database.characters[sprite].atlas);
        this.setFrame(scene.database.characters[sprite].name + "_" + scene.database.overworld.directions[2] + "_idle0");

        const origin = scene.database.characters[sprite].origin[scene.database.overworld.directions[2]];

        this.setOrigin(origin.x, origin.y);
        // adiciona animação de idle
        for (let i = 0, l = scene.database.overworld.directions.length; i < l; i++) {
            // criar animação idle para todos os lados
            scene.anims.create({
                key: scene.database.characters[sprite].name + "_idle_" + scene.database.overworld.directions[i],
                frames: [
                    {key: scene.database.characters[sprite].atlas, frame: scene.database.characters[sprite].name + "_" + scene.database.overworld.directions[i] + "_idle0"}, 
                    {key: scene.database.characters[sprite].atlas, frame: scene.database.characters[sprite].name + "_" + scene.database.overworld.directions[i] + "_idle1"}
                ],
                frameRate: 2,
                repeat: -1
            });

            // adiciona animação a sprite do player
            this.anims.load(scene.database.characters[sprite].name + "_idle_" + scene.database.overworld.directions[i]);
        };

        this.anims.play(scene.database.characters[sprite].name + "_idle_" + scene.database.overworld.directions[2]);

    }
};

class RawCharacter extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y, data) {

        super(scene, x, y, data);
        

        // seta textura
        this.setTexture(scene.database.characters[data.sprite].atlas);
        this.setFrame(scene.database.characters[data.sprite].name + "_" + scene.database.overworld.directions[data.facing] + "_idle0");

        // seta posição
        this.setPosition(x, y);

        this.setScrollFactor(0);

        // adiciona animação de idle
        for (let i = 0, l = scene.database.overworld.directions.length; i < l; i++) {
            // criar animação idle para todos os lados
            scene.anims.create({
                key: scene.database.characters[data.sprite].name + "_idle_" + scene.database.overworld.directions[i],
                frames: [
                    {key: scene.database.characters[data.sprite].atlas, frame: scene.database.characters[data.sprite].name + "_" + scene.database.overworld.directions[i] + "_idle0"}, 
                    {key: scene.database.characters[data.sprite].atlas, frame: scene.database.characters[data.sprite].name + "_" + scene.database.overworld.directions[i] + "_idle1"}
                ],
                frameRate: 2,
                repeat: -1
            });

            // adiciona animação a sprite do player
            this.anims.load(scene.database.characters[data.sprite].name + "_idle_" + scene.database.overworld.directions[i]);
        };

        // play na animação idle
        this.anims.play(scene.database.characters[data.sprite].name + "_idle_" + scene.database.overworld.directions[data.facing]);
    
        scene.add.existing(this);
    }
};

class Loading extends Phaser.GameObjects.Sprite {
    constructor (scene) {
        let pos;

        if (scene.isMobile) {
            pos = {
                x: 39,
                y: 39
            };
        } else {
            pos = {
                x: 441,
                y: 201
            }
        };
        super(scene, pos.x, pos.y, "loading");
        this.setScrollFactor(0);
        scene.add.existing(this);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.angle += 1.5;
    }
};

class BalloonDialog extends Phaser.GameObjects.Sprite {
    constructor (scene) {
        super(scene);

        this.setTexture("chat-balloon");
        //this.setFrame(2);
        //this.setScrollFactor(0);

        scene.anims.create({
            key: "balloon_chating",
            frames: scene.anims.generateFrameNumbers("chat-balloon"),
            frameRate: 2,
            repeat: -1
        });

        this.anims.load("balloon_chating");
        this.anims.play("balloon_chating");

        scene.add.existing(this);
    }
};