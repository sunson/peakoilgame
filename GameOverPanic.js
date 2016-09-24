
PeakOil.GameOverPanic = function (game) {
    this.bglayer;
    this.midlayer;
    this.fglayer;
    this.bank;
    this.land;
    this.wells;
    this.fields;
    this.score;
    this.dashboard;
    this.menuCollapsed = true;
    this.toolStatus = false;
    this.hint = true;
};

PeakOil.GameOverPanic.prototype = {

    create: function () {
	this.bglayer = this.add.group();
	this.fglayer = this.add.group();
	this.land = new PeakOil.Land(this.game, this);
	this.bglayer.add(this.land);
	this.title = new Phaser.Text(this.game, this.game.world.width / 2, this.game.world.height / 2, "Bank Owns You", { font: "60px Arial", fill: "#FFFF00" });
	this.title.anchor.setTo(0.5, 0.5);
	this.add.tween(this.title).to({width: this.title.width + 100}).to({width: this.title.width}).loop().start();
	this.fglayer.add(this.title);
	this.land.inputEnabled = true;
	var that = this;
	this.land.events.onInputDown.add(function() { that.game.state.start('MainMenu'); }, this);
    },

    gameLoop: function() {
	if (!this.isPaused) {
	    var tickProduced = 0;
	    this.wells.forEach(function(w) {
		if (w.canProduce) {
		    var p = w.produceOil();
		    tickProduced += p;
		}
	    });
	    if (tickProduced) {
		this.dashboard.addData(tickProduced);
	    }
	}
    },

    createWellAt: function(x, y) {
	var that = this;
	var w = this.bank.mortgage(PeakOil.WELL_COST, function() {
	    var w2 = new PeakOil.Well(that.game, x, y, that.dashboard);
	    return w2;
	});
	this.wells.push(w);
	this.midlayer.add(w);
	var fields_here = PeakOil.Field.findAt(x, y);
	if (fields_here.length) {
	    fields_here.forEach(function(f) {
		f.reveal();
	    });
	    w.attachTo(fields_here);
	} else {
	    w.turnOff();
	    w.alpha = 0.5;
	}
	return w;
    },

    update: function () {
    },

    resize: function (width, height) {
    }

};
