PeakOil.MenuItem = function (game, x, y, index, cb) {
    Phaser.Sprite.call(this, game, x, y, 'menu');
    this.frame = index;
    this.inputEnabled = true;
    this.events.onInputOver.add(function(spr, pt) { spr.frame = index + 1; spr.scale.setTo(1.1, 1.1); }, this);
    this.events.onInputOut.add(function(spr, pt) { spr.frame = index; spr.scale.setTo(1, 1); }, this);
    this.events.onInputDown.add(function(spr, pt) { cb(index, pt); }, this);

    this.anchor.setTo(0.5, 0.5);
};

PeakOil.MenuItem.prototype = Object.create(Phaser.Sprite.prototype);
PeakOil.MenuItem.prototype.constructor = PeakOil.MenuItem;

PeakOil.MenuItem.prototype.update = function() {
};

PeakOil.MenuItem.prototype.resize = function(w, h) {
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
