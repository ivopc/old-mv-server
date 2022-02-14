// mostrar monstros na party
Game.Overworld.toggleParty = function (bool) {

    this.statusShowingParty = !this.statusShowingParty;

    if (!this.statusShowingParty) {
        this.clearPartyInterface(true);
        this.player._data.stop = false;
        return;
    };

    this.player._data.stop = true;
    this.appendPartyInterface();
};