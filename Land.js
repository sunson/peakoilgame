PeakOil.Land = function (game, thegame) {

    //  We call the Phaser.Sprite passing in the game reference
    //  We're giving it a random X/Y position here, just for the sake of this demo - you could also pass the x/y in the constructor
    Phaser.TileSprite.call(this, game, 0, 0, game.world.width, game.world.height, 'land');
    this.theGame = thegame;
    this.inputEnabled = true;
    var that = this;
    this.events.onInputDown.add(function(sprite, pt) { 
	if (that.theGame.toolStatus == 'add') {
	    that.theGame.createWellAt(pt.clientX, pt.clientY); 
	}
    });
};

PeakOil.Land.prototype = Object.create(Phaser.TileSprite.prototype);
PeakOil.Land.prototype.constructor = PeakOil.Land;

PeakOil.Land.prototype.update = function() {
};

PeakOil.Land.prototype.resize = function(w, h) {
    this.width = w;
    this.height = h;
};
