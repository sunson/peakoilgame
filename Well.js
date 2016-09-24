var wellCount = 0;

PeakOil.WELL_COST = 10000;

PeakOil.Well = function (game, x, y, chart, bank) {
    Phaser.Sprite.call(this, game, x, y, 'well');
    this.originWidth = game.world.width;
    this.originHeight = game.world.height;

    this.id = "Well#" + wellCount++;

    this.chart = chart;
    this.bank = bank;

    this.selected = false;
    this.attachedFields = new Array();
    this.canProduce = true;
    this.produced = 0;

    this.oilPrice = 60; // money per unit produced

    this.animations.add('off', [0], 1, false);
    this.animations.add('on', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 15, true);

    this.inputEnabled = true;
    this.events.onInputDown.add(function(spr) { spr.selected = !spr.selected; });
    // this.debugGraphic = new Phaser.Graphics(game, 0, 0);
    // this.debugGraphic.beginFill('0xFFFFFF',1);
    // this.debugGraphic.drawRect(-2, -2, 2, 2);
    // this.addChild(this.debugGraphic);

    this.animations.play('off');

    this.anchor.setTo(0.5, 0.9);
};

PeakOil.Well.prototype = Object.create(Phaser.Sprite.prototype);
PeakOil.Well.prototype.constructor = PeakOil.Well;

PeakOil.Well.prototype.update = function() {
    if (this.game.world.width > this.game.world.height) {
    } else {
    }

};

PeakOil.Well.prototype.attachTo = function(fields) {
    this.animations.play('on');
    if (fields.length) {
	var x  = this.attachedFields.concat(fields);
	this.attachedFields = x;
	this.game.time.events.loop(Phaser.Timer.SECOND, this.gameLoop, this);
    }
};


PeakOil.Well.prototype.gameLoop = function() {
    this.produceOil();
};

PeakOil.Well.prototype.turnOn = function() {
    this.canProduce = true;
};

PeakOil.Well.prototype.turnOff = function() {
    this.animations.play('off');
    this.canProduce = false;
};

PeakOil.Well.prototype.produceOil = function() {
    if (this.canProduce) {
	var well = this;
	var this_produced = 0;
	this.attachedFields.forEach(function(f) {
	    this_produced += f.produce(well);
	});
	this.produced += this_produced;
	this.lastProduced = this_produced;
	if (this.lastProduced <= 0) {
	    this.turnOff();
	    this.alpha = 0.5;
	    this.animations.play('off');
	}
	this.chart.addData(this_produced);
	if (!this.chart.gameoverflag) {
	    this.bank.earn(this_produced * this.oilPrice);
	    return this_produced;
	} else {
	    
	    this.turnOff();
	    return 0;
	}
    } else {
	this.alpha = 0.5;
	return 0;
    }
};

PeakOil.Well.prototype.resize = function(w, h) {
    // if x and y were for originWidth and originHeight, then compute new x and y for new w and h
    this.x = Math.round(w / this.originWidth * this.x);
    this.y = Math.round(h / this.originHeight * this.y);
    this.originWidth = w;
    this.originHeight = h;

    if (this.x > w) {
	this.x = w - this.width;
    }

    if (this.y > h) {
	this.y = h - this.height;
    }

};
