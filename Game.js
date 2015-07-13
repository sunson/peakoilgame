
PeakOil.Game = function (game) {
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

PeakOil.Game.prototype = {

    create: function () {
	this.metalayer = this.game.add.group();
	this.bglayer = this.game.add.group();
	this.midlayer = this.game.add.group();
	this.fglayer = this.game.add.group();
	this.metalayer.add(this.bglayer);
	this.metalayer.add(this.midlayer);
	this.metalayer.add(this.fglayer);
	this.wells = [];
	this.fields = [];

	// close button
	this.closeButton = new Phaser.Button(this.game, this.game.width - 30, 30, 'closebutton', function () { this.game.state.start("MainMenu"); }, this, 1, 0, 1, 0);
	this.closeButton.anchor.setTo(0.5, 0.5);

	this.land = new PeakOil.Land(this.game, this);
	this.land.inputEnabled = true;
	var that = this;
	this.land.events.onInputDown.add(function(spr, pt) {
	    that.createWellAt(pt.clientX, pt.clientY);
	});
	var that = this;
	var dashwid = 150;
	this.dashboard = new PeakOil.Chart(this.game, this.game.width - dashwid - 60, 10, dashwid, 60);
	this.bglayer.add(this.land);
	this.fglayer.add(this.dashboard);
	this.fglayer.add(this.closeButton);
	this.createRandomFields(50, 200, this.game.world.width, this.game.world.height);
    },

    createRandomFields: function(count, maxsize, w, h) {
	for (var i = 0; i < count; i++) {
	    var endow = this.game.rnd.integerInRange(maxsize / 2, maxsize);
	    var wid = this.game.rnd.integerInRange(50, w / 5);
	    var hei = this.game.rnd.integerInRange(50, h / 3);
	    var x = this.game.rnd.integerInRange(wid / 2, w - wid);
	    var y = this.game.rnd.integerInRange(hei / 2, h - hei);
	    var f = new PeakOil.Field(this.game, x, y, wid, hei, endow);
	    this.bglayer.add(f);
	    this.fields.push(f);
	}
    },

    gameLoop: function() {
	if (!this.isPaused) {
	    var tickProduced = 0;
	    this.wells.forEach(function(w) {
		if (w.canProduce) {
		    var p = w.produceOil();
		    console.log("w prod", w.id, p);
		    tickProduced += p;
		}
	    });
	    if (tickProduced) {
		this.dashboard.addData(tickProduced);
	    }
	}
    },

    createWellAt: function(x, y) {
	var w = new PeakOil.Well(this.game, x, y, this.dashboard);
	this.wells.push(w);
	this.midlayer.add(w);
	var fields_here = PeakOil.Field.findAt(x, y);
	console.log("Fields here", fields_here);
	if (fields_here.length) {
	    fields_here.forEach(function(f) {
		f.reveal();
	    });
	    w.attachTo(fields_here);
	} else {
	    w.turnOff();
	    w.alpha = 0.5;
	}
    },

    update: function () {
	this.closeButton.bringToTop();
    },

    quitGame: function (pointer) {
        this.state.start('MainMenu');
    },

    resize: function (width, height) {
	this.wells.forEach(function(w) {
	    console.log("W resize", w);
	    w.resize(width, height);
	});
	this.fields.forEach(function(f) {
	    console.log("F resize", f);
	    f.resize(width, height);
	});
	this.land.resize(width, height);
	this.closeButton.x = width - 30;
	this.closeButton.y = 30;
    }

};
