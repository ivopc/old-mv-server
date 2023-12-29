<p align="center" width="100%">
    <img src="https://i.imgur.com/bh8ZbWe.png">
</p>

# Monster Valle Old Server
Old Monster Valle server, crap architecture. I Just turned it public to rewrite to new one: https://github.com/ivopc/new-mv-server

# Secretly I'm doing a closed-source release of my game with TypeScript+Phaser3+NuxtJS+NestJS :)

The Old Game Client and and Old Game Server are avaliable here: https://monstervalle.onrender.com/

## Dependences
- NodeJS
- MySQL

## Build Setup

Do not forget to create an `.env` file in the project root path based in `.env.example` and add your MySQL credentials.

``` bash
# install dependencies
npm install

# start server at localhost:8000
npm run start

# run database seeds (as first usage you need it to run the game server that depends on database)
npm run database-seed

# if you get some bug, black screen or issue in battle gameplay just reset the battle related databases
npm run database-reset-battle
```

# License
The code of game source project is released under the MIT license.

# Credits
This projects is mainly created, idealized and full coded by: Ivo Pires de Camargo (me). 
The art is not public, owned and created by: mainly by [Everton Luiz](https://soundcloud.com/evertonluizmaestro?), [Clara Luz Romagnolli](https://linktr.ee/shaarpie) and Victor Athayde. [Caio Carlos](https://clockworkraven.itch.io/), Junio Henrike and Gabriel Faleiros. Please do not use the art and musics in any commercial project.


https://github.com/ivopc/Monster-Valle
