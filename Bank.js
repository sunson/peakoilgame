
PeakOil.Bank = function (game, x, y, chart) {
    Phaser.Sprite.call(this, game, x, y, 'empty');
    this.originWidth = game.world.width;
    this.originHeight = game.world.height;

    this.chart = chart;
    this.balance = 0;
    this.loans = new Array();

    this.statusLabel = new Phaser.Text(game, 0, 0, "Bank", { font: "15px Arial", fill: "#AAAA33" });
    this.statusLabel.anchor.setTo(0.5, 0.5);
    this.addChild(this.statusLabel);
};

PeakOil.Bank.prototype = Object.create(Phaser.Sprite.prototype);
PeakOil.Bank.prototype.constructor = PeakOil.Bank;

PeakOil.Bank.prototype.mortgage = function(amt, maker) {
};

PeakOil.Bank.prototype.update = function() {
    if (this.game.world.width > this.game.world.height) {
	// landscape mode
	this.scale.setTo(1.2, 1.2);
    } else {
	this.scale.setTo(3, 3);
    }

};


PeakOil.Bank.prototype.resize = function(w, h) {
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
