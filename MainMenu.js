
PeakOil.MainMenu = function (game) {

    this.land;
    this.panel;
    this.waves;
    this.bank;
    this.introText;
    this.title;
    this.fglayer;
    this.bglayer;

    this.camXDir = 1;
    this.camYDir = 1;
    this.camXorig = 0;
    this.camYorig = 0;
    this.camXmax = 200;
    this.camYmax = 100;

};

PeakOil.MainMenu.prototype = {


    create: function () {

	this.bglayer = this.add.group();
	this.fglayer = this.add.group();

	this.land = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'land');

	this.startButton = new Phaser.Button(this.game, 0, 0, "startbutton", function () { this.game.state.start("Game"); }, this, 1, 0, 1, 0);

	// panel
	this.panel = new Phaser.Sprite(this.game, 0, 0, 'panel');
	this.panel.width = 600;
	this.panel.height = 400;
	this.title = new Phaser.Text(this.game, 0, 0, "Peak Oil", { font: "45px Serif", fill: "#990033" });
	this.title.enableBody = true;
	this.introText = new Phaser.Text(this.game, 0, 0, "Click on the land area to create an Oil well. The chart turns red when peak is reached. Peak oil is not the end of oil, but it means end of growth.\n\nDrill, baby, drill!", { font: "20px Serif", fill: "#000066", wordWrap: true, wordWrapWidth: this.panel.width - 200, align: "center"});
	this.panel.addChild(this.startButton);
	this.panel.addChild(this.title);
	this.game.add.existing(this.title);
	this.panel.addChild(this.introText);
	this.game.add.existing(this.introText);
	this.game.add.existing(this.startButton);
	this.introText.enableBody = true;
	this.bglayer.add(this.land);
	this.fglayer.add(this.panel);
	// this.fglayer.add(this.title);
	// this.fglayer.add(this.introText);
	// this.fglayer.add(this.startButton);
	this.makeMockWorld();
	this.resize(this.game.world.width, this.game.world.height);
    },

    makeMockWorld: function() {
	// create fields
	var dashwid = 200;

	var that = this;

	this.chart = new PeakOil.Chart(this.game, this.game.width - dashwid - 60, 10, dashwid, 90);
	this.chart.setTitle("Oil");
	this.chart2 = new PeakOil.Chart(this.game, this.game.width - dashwid * 2 - 60, 10, dashwid, 90);
	this.chart2.setTitle("Bank");
	this.chart2.toggleAreaUnderCurve();
	this.bank = new PeakOil.Bank(this.game, this.game.width / 2, 20, this.chart2);
	this.bank.EasyMode();
	this.bglayer.add(this.chart);
	this.bglayer.add(this.chart2);
	this.game.add.existing(this.chart);
	this.game.add.existing(this.chart2);
	this.game.add.existing(this.bank);
	for (var i = 0; i < 50; i++) { 
	    var f = new PeakOil.Field(this.game, this.game.rnd.integerInRange(0, this.game.world.width - 100), this.game.rnd.integerInRange(0, this.game.world.height - 100), 150, 150, 400);
	    f.visible = false;
	    this.game.add.existing(f);
	    this.bglayer.add(f);
	}
	var xscale = 10;
	var yscale = 5;
	for (var ix = 0; ix < xscale; ix++) {
	    for (var iy = 0; iy < yscale; iy++) { 
		this.game.time.events.add(Phaser.Timer.SECOND * this.game.rnd.integerInRange(1, 20) + this.game.rnd.integerInRange(10, 1100), function () {
		    var rx1 = that.game.rnd.integerInRange(0, that.panel.x);
		    var rx2 = that.game.rnd.integerInRange(that.panel.x + that.panel.width, that.game.world.width);
		    var ry1 = that.game.rnd.integerInRange(0, that.panel.y);
		    var ry2 = that.game.rnd.integerInRange(that.panel.y + that.panel.height, that.game.world.height);
		    var chosenx, choseny;
		    if (that.game.rnd.integerInRange(0, 1)) {
			if (that.game.rnd.integerInRange(0, 1)) {
			    chosenx = that.game.rnd.integerInRange(0, that.game.world.width);
			    choseny = ry1;
			} else {
			    choseny = ry2;
			    chosenx = that.game.rnd.integerInRange(0, that.game.world.width);
			}
		    } else {
			if (that.game.rnd.integerInRange(0, 1)) {
			    chosenx = rx1;
			    choseny = that.game.rnd.integerInRange(0, that.game.world.width);
			} else {
			    chosenx = rx2;
			    choseny = that.game.rnd.integerInRange(0, that.game.world.width);
			}
		    }

		    that.createWellAt(chosenx, choseny);
		}, this);
	    }
	}
    },


    createWellAt: function(x, y) {
	var that = this;
	var w = this.bank.mortgage(PeakOil.WELL_COST, function() {
	    var w2 = new PeakOil.Well(that.game, x, y, that.chart, that.bank);
	    return w2;
	});
	if (w) {
	    w.inputEnabled = false;
	    w.alpha = 1;
	    var fields_here = PeakOil.Field.findAt(x, y);
	    this.bglayer.add(w);
	    this.game.add.existing(w);
	    if (fields_here.length) {
		fields_here.forEach(function(f) {
		    f.reveal();
		});
		w.attachTo(fields_here);
	    } else {
		w.alpha = 0.5;
		w.turnOff();
	    }
	} else {
	    console.log("HAHA");
	}
    },

    update: function () {
	this.chart.bringToTop();
	this.chart2.bringToTop();
	this.panel.bringToTop();
	this.bank.bringToTop();
	if (this.chart.hasEnded() || this.bank.panicState) {
	    this.game.state.start("MainMenu");
	}
    },


    resize: function (width, height) {
        this.land.width = width;
        this.land.height = height;

	this.panel.x = width / 2 - this.panel.width / 2;
	this.panel.y = height / 2 - this.panel.height / 2;
	this.startButton.x = width / 2 - this.startButton.width / 2;
	this.startButton.y = height / 2 - this.startButton.height / 2;

	// this.chart.x = this.game.world.width - this.chart.myWidth - 100;
	// this.chart.y = 20;

	ReposCenter(this.panel, this.title);
	ReposCenter(this.panel, this.startButton);
	ReposCenter(this.panel, this.introText);
	this.title.y -= 120;
	this.introText.y -= 20;
	this.startButton.y += 90;
    }

};

function ReposCenter(parent, child, offset) {
    var offx, offy;
    if (offset) {
	offx = offset.x;
	offy = offset.y;
    } else {
	offx = offy = 0;
    }
    child.x = offx + parent.x + parent.width / 2 - child.width / 2 - (parent.anchor.x * parent.width);
    child.y = offy + parent.y + parent.height / 2 - child.height / 2 - (parent.anchor.y * parent.height);
}

function GridLayoutFactory(width, height, xspacing, yspacing, factFunc) {
    this.width = width;
    this.height = height;
    this.xspacing = xspacing;
    this.yspacing = yspacing;

    this.rowNum = 0;
    this.colNum = 0;

    this.factoryFunction = factFunc;
    
}

GridLayoutFactory.prototype.next = function() {
    if (this.rowNum * this.yspacing > height) {
	return null;
    }
    if (this.colNum * this.xspacing > width) {
	this.colNum = 0;
	this.rowNum++;
    }
    var thisx = this.colNum * this.xspacing;
    var thisy = this.rowNum * this.yspacing;
    this.factoryFunction(thisx, thisy);
    this.colNum++;
    return 1;
};