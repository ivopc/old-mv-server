// Get the canvas DOM element
var canvas = document.querySelector("#game");
// Load the 3D engine
var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
// CreateScene function that creates and return the scene

axios.get("/assets/maps/city.json").then(req => {
    var createScene = function(){
        var scene = new BABYLON.Scene(engine);

        // Create camera and light
        var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 10, 5), scene);
    // Parameters: alpha, beta, radius, target position, scene
        var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);

    // Positions the camera overwriting alpha, beta, radius
        camera.setPosition(new BABYLON.Vector3(0, 0, 0));

        camera.attachControl(canvas, true);

        var SpriteManager = {};


        SpriteManager.Tiles1 = new BABYLON.SpriteManager("Tiles1", document.querySelector("div").innerHTML, 9999, 32, scene);


        for (let i = 0, l = req.data.tilesets.length; i < l; i ++)
            if (req.data.tilesets[i].name !== "TilesPropriedade")
                SpriteManager[req.data.tilesets[i].name].firstgid = req.data.tilesets[i].firstgid;
    
        var total = 0,
            layer = [],
            data = req.data.layers[0].data,
            tilesimg = new Image(),
            tileSize = req.data.tilewidth,
            mapColumns = req.data.width * req.data.tilewidth,
            tilemap = document.querySelector("#tile"),
            ctx = tilemap.getContext("2d");

        tilesimg.src = document.querySelector("div").innerHTML;

        tilemap.width = req.data.width * req.data.tilewidth;
        tilemap.height = req.data.height * req.data.tileheight;

        function getDestination (position, tile) {
            

        };

        for (let y = 0; y < req.data.height; y++) {
            // add layer data z
            layer.push([]);

            for (let x = 0; x < req.data.width; x++) {

                console.log({x, y});

                ctx.drawImage(
                    tilesimg, 
                    x * tileSize, 
                    y * tileSize, 
                    req.data.tilewidth, 
                    req.data.tileheight, 
                    x * req.data.tilewidth, 
                    y * req.data.tileheight, 
                    req.data.tilewidth, 
                    req.data.tileheight
                );

                // add layer data x
                layer[y].push(data[total++]);
            };
        };

// var map = {
//   cols: 30,
//   rows: 30,
//   tsize: 32,
//   tiles: data,
//   getTile: function(col, row) {
//     return this.tiles[row * map.cols + col];
//   }
// };

// for (var c = 0; c < map.cols; c++) {
//   for (var r = 0; r < map.rows; r++) {
//     var tile = map.getTile(c, r);
//     if (tile !== 0) { // 0 => empty tile
//       ctx.drawImage(
//         tileAtlas, // image
//         (tile - 1) * map.tsize, // source x
//         0, // source y
//         map.tsize, // source width
//         map.tsize, // source height
//         c * map.tsize, // target x
//         r * map.tsize, // target y
//         map.tsize, // target width
//         map.tsize // target height
//       );
//     }
//   }
// }

        // for(let i = 0; i < mapColumns * req.data.height; i++) {
        //     let tile = data[i];
        //     let sourceX = ((tile % mapColumns) * req.data.tilewidth);
        //     let sourceY = (Math.floor (tile / mapColumns) * req.data.tileheight);
        //     let targetX = (i % mapColumns) * req.data.tilewidth;
        //     let targetY = Math.floor (i / mapColumns) * req.data.tileheight;
        //     ctx.drawImage(
            //     tilesimg, 
            //     sourceX, 
            //     sourceY, 
            //     req.data.tilewidth, 
            //     req.data.tileheight, 
            //     targetX, 
            //     targetY, 
            //     req.data.tilewidth,
            //      req.data.tileheight
            // );
        // };



  // for(let i=0;i<mapColumns*mapHeight;i++) {
  //   let tile = tiles[i];
  //   let sourceX = (tile % mapColumns) * tileWidth;
  //   let sourceY = Math.floor (tile/mapColumns)* tileHeight;
  //   let targetX = (i % mapColumns) * tileWidth;
  //   let targetY = Math.floor (i/mapColumns)* tileHeight;
  //   context.drawImage(image, sourceX, sourceY, tileWidth, tileHeight, targetX, targetY, tileWidth, tileHeight);
  // }

        var converted = tilemap.toDataURL("image/png");

        var spriteManagerPlayer = new BABYLON.SpriteManager("map", converted, 2, {width: tilemap.width, height: tilemap.height}, scene);

        console.log(converted);

        var tiles = new BABYLON.Sprite("tile", spriteManagerPlayer);
        tiles.position.x = 0;
        tiles.position.z = 0;



        // for (let z = 0; z < req.data.height; z++) {
        //     // add layer data z
        //     layer.push([]);

        //     for (let x = 0; x < req.data.width; x++) {

        //         console.log("z", z, "x", x);
        //         // add layer data x
        //         layer[z].push(data[total++]);

        //         // render tiles
        //         var tiles = new BABYLON.Sprite("tile", SpriteManager.Tiles1);
        //         tiles.position.x = (x) * tileSize / tileSize;
        //         tiles.position.z = (z) * tileSize / tileSize;

        //         tiles.cellIndex = layer[z][x] - SpriteManager.Tiles1.firstgid;

        //     };
        // };

        // for (let z = 0; z < req.data.height; z++) {
        //     // add layer data z
        //     layer.push([]);

        //     for (let x = 0; x < req.data.width; x++) {

        //         console.log("z", z, "x", x);
        //         // add layer data x
        //         layer[z].push(data[total++]);

        //         // render tiles
        //         var tiles = new BABYLON.Sprite("tile", SpriteManager.Tiles1);
        //         tiles.position.x = (x) * tileSize / tileSize;
        //         tiles.position.z = (z) * tileSize / tileSize;

        //         tiles.cellIndex = layer[z][x] - SpriteManager.Tiles1.firstgid;

        //     };
        // };

        // Create a sprite manager to optimize GPU ressources
        // Parameters : name, imgUrl, capacity, cellSize, scene

        // tiles = [];
        // var unit = 32;
        // var add = 32;
        // var pos = {
        //     x: 0,
        //     z: 0
        // };
        // var trade = true;

        // //We create 2000 tiles at random positions
        // for (var i = 0; i < 100; i++) {
        //     tiles[i] = new BABYLON.Sprite("tile", SpriteManager.Tiles1);
        //     tiles[i].position.x = (pos.x++)  * add / unit;
        //     tiles[i].position.z = (pos.z++)  * add / unit;
        //     tiles[i].isPickable = true;

        //     tiles[i].cellIndex = trade ? 1 : 0;

        //     trade = !trade;

        //     if (Math.round(Math.random() * 5) === 0) {
        //         tiles[i].angle = Math.PI * 90 / 180;
        //         tiles[i].position.y = -0.3;
        //     }
        // };


        // First animated anim_tile
        // var anim_tile = new BABYLON.Sprite("anim_tile", SpriteManager.Tiles1);
        // anim_tile.playAnimation(0, 40, true, 100);
        // anim_tile.position.y = -0.3;
        // anim_tile.size = 0.3;
        // anim_tile.isPickable = true;

        //SpriteManager.Tiles1.isPickable = true;

        scene.onPointerDown = function (evt) {
            var pickResult = scene.pickSprite(this.pointerX, this.pointerY);
            if (pickResult.hit) {
                pickResult.pickedSprite.angle += 0.1;
            }
        };
        return scene;
    };
    // call the createScene function
    var scene = createScene();
    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
    });
});

// the canvas/window resize event handler
window.addEventListener("resize", function () {
    engine.resize();
});

// function change(unit) {
//     var pos = {
//         x: 0,
//         y: 0
//     };
//     var add = 32;
//     for (var i = 0; i < 2000; i++) {
//         tiles[i].position.x = (pos.x++)  * add / unit;
//         tiles[i].position.z = (pos.y++)  * add / unit;
//     };        

// };

// change(30);