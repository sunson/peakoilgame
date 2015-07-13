PeakOil.Chart = function (game, x, y, w, h) {
    Phaser.Sprite.call(this, game, x, y, 'empty');
    this.originWidth = game.world.width;
    this.originHeight = game.world.height;
    this.myWidth = w;
    this.myHeight = h;
    this.testCounter = 0;
    this.incomingBuf = [];
    this.samplePeriod = 3;
    this.nextTime = Math.floor(this.game.time.totalElapsedSeconds()) + this.samplePeriod;
    this.graphic = new Phaser.Graphics(game, 0, 0);
    this.legend = new Phaser.Text(game, 0, this.myHeight, "Test", { font: "12px Arial", fill: "#ffff00", wordWrap: true, wordWrapWidth: this.myWidth - 5 });
    this.addChild(this.graphic);
    this.addChild(this.legend);

    this.gameover = new Phaser.Text(this.game, 0, 0, "Game Over!", { font: "40px Arial", fill: "#FFFFFF" });
    this.gameover.alpha = 0;
    this.addChild(this.gameover);

    this.dataPoints = [];
    var that = this;
};

PeakOil.Chart.prototype = Object.create(Phaser.Sprite.prototype);
PeakOil.Chart.prototype.constructor = PeakOil.Chart;

PeakOil.Chart.prototype.update = function() {
    if (this.hasEnded()) {
	this.myHeight = this.game.world.height / 2;
	this.myWidth = this.game.world.width / 2;
	this.x = this.game.world.width / 2 - this.myWidth / 2;
	this.y = this.game.world.height / 2 - this.myHeight / 2;
	this.anchor.setTo(0.5, 0.5);
	this.legend.x = this.myWidth / 2 - this.legend.width / 2;
	this.legend.y = this.myHeight + 10;
	this.gameover.alpha = 0.8;
	this.gameover.x = this.x + this.myWidth / 2;
	this.gameover.y = this.y + this.myHeight / 2;
	this.gameover.anchor.setTo(0.5, 0.5);
	this.game.add.existing(this.gameover);
	this.anchor.setTo(0.5, 0.5);
	this.legend.scale.setTo(2, 2);
	this.renderChart();
    } else {
	this.renderChart();
    }
};

PeakOil.Chart.prototype.hasEnded = function() {
    var noweltime = this.game.time.totalElapsedSeconds();
    var nt = Math.floor(noweltime);
    if (this.nextTime + this.samplePeriod / 2 < nt) {
	return true;
    } else {
	return false;
    }
};

PeakOil.Chart.prototype.hasPeaked = function(allData) {
    var max = this.maxData();
    var lp = this.dataPoints[this.dataPoints.length - 1];
    var s = this.lastDataPoint();
    var peaked;
    if (lp < max && s < max) {
	peaked = true;
    // if last half of dataPoints is < max then we say, we're beyond peak
	for (var i = Math.floor(allData.length / 2); i < allData.length; i++) {
	    var p = allData[i];
	    if (p > max) {
		peaked = false;
	    }
	}
    } else {
	peaked = false;
    }
    return peaked;
};


PeakOil.Chart.prototype.maxData = function() {
    var max = 0;
    var lastval = this.lastDataPoint();
    
    this.dataPoints.forEach(function (p) {
	if (p > max) {
	    max = p;
	}
    });
    if (lastval > max) { 
	max = lastval;
    }
    return max;
};

PeakOil.Chart.prototype.lastDataPoint = function() {
    var s = 0;
    this.incomingBuf.forEach(function (i) { s += i; });
    return s;
}

PeakOil.Chart.prototype.addData = function(p) {
    var eltime = this.game.time.totalElapsedSeconds();
    var thisTime = Math.floor(eltime);
    if (thisTime < this.nextTime) {
	this.incomingBuf.push(Math.abs(p));
    } else {
	var s = this.lastDataPoint();
	this.dataPoints.push(s);
	this.incomingBuf = [];
	this.nextTime = thisTime + this.samplePeriod;
    }
}

PeakOil.Chart.prototype.allData = function () {
    var lv = this.lastDataPoint();
    var ret = this.dataPoints.concat([lv]);
    return ret;
    
};

PeakOil.Chart.prototype.renderChart = function() {
    var max = this.maxData();
    var dpts = this.allData();
    var xoffset = this.myWidth / dpts.length;
    var plot = [];
    var curx = xoffset;
    var tot = 0;
    for (var i = 0; i < dpts.length; i++) {
	var p = dpts[i];
	var plen = p / max * this.myHeight;
	var pt = this.myHeight - plen;
	plot.push([curx, pt]);
	tot += p;
	curx += xoffset;
    }
    this.graphic.clear();
    this.graphic.lineStyle(2, '0x000000', 0.5);
    this.graphic.beginFill('0x000000', 0.5);
    this.graphic.drawRect(-2, -2, this.myWidth + 4, this.myHeight + 20);
    this.graphic.lineStyle(1, '0x00FF00', 1);
    if (this.hasPeaked(dpts)) {
	this.graphic.beginFill('0xFF0000', 0.5);
	this.legend.text = "Peak: " + max + ", Tot: " + tot;
    } else {
	this.legend.text = "Max: " + max + ", Tot: " + tot;
	this.graphic.beginFill('0x000000', 0.5);
    }	
    this.graphic.drawRect(0, 0, this.myWidth, this.myHeight);
    this.graphic.endFill();
    this.graphic.lineStyle(1, '0x00FFFF', 1);
    this.graphic.beginFill('0x00FF00', 0.5);
    this.graphic.moveTo(0, this.myHeight);
    for (var i = 0; i < plot.length; i++) { 
	var a = plot[i];
	var x = a[0];
	var y = a[1];
	this.graphic.lineTo(x, y);
    }
    this.graphic.lineTo(this.myWidth, this.myHeight);
    this.graphic.endFill();
};

PeakOil.Chart.prototype.resize = function(w, h) {
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
