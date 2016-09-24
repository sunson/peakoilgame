
PeakOil.Preloader = function (game) {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

PeakOil.Preloader.prototype = {

    preload: function () {

        //      These are the assets we loaded in Boot.js
        //      A nice sparkly background and a loading progress bar

        this.background = this.add.sprite(0, 0, 'preloaderBackground');
        this.background.width = this.game.world.width;
        this.background.height = this.game.world.height;
        this.preloadBar = this.add.sprite(300, 400, 'preloaderBar');

        //      This sets the preloadBar sprite as a loader sprite.
        //      What that does is automatically crop the sprite from 0 to full-width
        //      as the files below are loaded in.

        this.load.setPreloadSprite(this.preloadBar);

        //      Here we load the rest of the assets our game needs.
        //      You can find all of these assets in the Phaser Examples repository

	this.game.load.image("land", "sprites/land.png");
        this.game.load.image("panel","images/menu.png");
        this.game.load.image("empty","images/empty.png");

        this.game.load.atlasJSONArray("oil","sprites/oil_spritesheet.png","sprites/oil_spritesheet.json");
        this.game.load.atlasJSONArray("startbutton","sprites/startbutton.png","sprites/startbutton.json");
        this.game.load.atlasJSONArray("closebutton","sprites/closebutton.png","sprites/closebutton.json");
        this.game.load.atlasJSONArray("well","sprites/well_spritesheet.png","sprites/well_spritesheet.json");
    },

    create: function () {
        this.game.state.start('MainMenu');
        //this.game.state.start('Game');

    }

};
