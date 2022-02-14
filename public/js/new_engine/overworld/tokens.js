// possivel ações
Game.Overworld.actions = {
    walking: 1,
    dialog: 2
};

Game.Overworld.questAction = {
    1: "defeat",
    2: "tame",
    3: "drop"
};

Game.Overworld.invertedQuestAction = {
    "defeat": 1,
    "tame": 2,
    "drop": 3
};

// mapobject
Game.Overworld.mapObjectPosition = {};

// ação atual
Game.Overworld.currentAction = null;

// objeto que personagem interagiu
Game.Overworld.currentObjectInteracted = null;


Game.Overworld.dialogAnimationLetterTime = 75;

// posição atual do dialogo na lista do array
Game.Overworld.dialogIndex = 0;

// sprite atual do dialogo
Game.Overworld.dialogCurrentSprite = null;

// array contendo o texto
Game.Overworld.dialogCurrentText = null;

// objeto de renderização do texto (da engine)
Game.Overworld.dialogCurrentRenderingText = null;

// callback de quando o dialogo acabar
Game.Overworld.dialogCallback = null;

// flag para definir se troca de dialogo está bloqueada
Game.Overworld.isDialogLocked = true;

// flag para definir se interação está bloqueada
Game.Overworld.isInteractionLocked = false;