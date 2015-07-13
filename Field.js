PeakOil.Fields = [];

var fldCount = 0;

PeakOil.Field = function (game, x, y, fw, fh, endowment) {
    Phaser.Sprite.call(this, game, x, y, 'oil');
    this.endowment = endowment;
    this.remaining = endowment;
    this.flowRate = 0.05;
    this.attachedWells = [];

    this.id = "field#" + fldCount++;

    this.fieldWidth = fw;
    this.fieldHeight = fh;

    this.revealed = false;

    this.originWidth = game.world.width;
    this.originHeight = game.world.height;
    this.animations.add('invisible', [0], 1, false);
    this.animations.add('hole', [1], 1, false);
    this.animations.add('bubble', [1,2,3,4,5,6,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],30,true);
    this.animations.play('hole');


    this.anchor.setTo(0.3, 0.7);
    PeakOil.Fields.push(this);
};

PeakOil.Field.prototype = Object.create(Phaser.Sprite.prototype);
PeakOil.Field.prototype.constructor = PeakOil.Field;

PeakOil.Field.prototype.reveal = function() {
    this.revealed = true;
};

// class method
PeakOil.Field.findAt = function(x, y) {
    var matched = [];
    PeakOil.Fields.forEach(function(f) {
	if ( (x > f.x && x < (f.x + f.fieldWidth)) && ( y > f.y && y < (f.y + f.fieldHeight)) ) {
	    matched.push(f);
	} else {
	}
    });
    return matched;
};


// object method
PeakOil.Field.prototype.update = function() {
    if (this.revealed) {
	if (this.remaining) {
	    this.alpha = 1;
	} else {
	    this.alpha = 0.5;
	}
    } else {
	this.alpha = 0;
    }
};

PeakOil.Field.prototype.attachWell = function(well) {
    this.attachedWells.push(well);
};

PeakOil.Field.prototype.produce = function(well) {
    var r = this.flowRate; // per well
    var to_produce = this.remaining * r;
    if (to_produce > well.capacity) {
	to_produce = well.capacity;
    }
    to_produce = Math.ceil(to_produce);
    this.remaining -= to_produce;
    return to_produce;
};

// called to reposition when screen is resized
PeakOil.Field.prototype.resize = function(w, h) {
    // if x and y were for originWidth and originHeight, then compute new x and y for new w and ho
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
