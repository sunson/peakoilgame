PeakOil.Chart = function (game, x, y, w, h) {
    Phaser.Sprite.call(this, game, x, y, 'empty');
    this.originWidth = game.world.width;
    this.originHeight = game.world.height;
    this.areaUnderCurve = true;
    this.title = "Chart";
    this.myWidth = w;
    this.myHeight = h;
    this.testCounter = 0;
    this.incomingBuf = [];
    this.samplePeriod = 3;
    this.nextTime = Math.floor(this.game.time.totalElapsedSeconds()) + this.samplePeriod;
    this.graphic = new Phaser.Graphics(game, 0, 0);
    this.legend = new Phaser.Text(game, 0, this.myHeight, "Test", { font: "12px Arial", fill: "#ffff00", wordWrap: true, wordWrapWidth: this.myWidth - 5 });
    this.titletxt = new Phaser.Text(game, 0, this.myHeight, this.title, { font: "15px Arial", fill: "#FFFFFF"});
    this.addChild(this.graphic);
    this.addChild(this.legend);
    this.addChild(this.titletxt);

    this.gameover = new Phaser.Text(this.game, 0, 0, "Game Over!", { font: "40px Arial", fill: "#FFFFFF" });
    this.gameover.alpha = 0;
    this.addChild(this.gameover);

    this.dataPoints = [];
    var that = this;
};

PeakOil.Chart.prototype = Object.create(Phaser.Sprite.prototype);
PeakOil.Chart.prototype.constructor = PeakOil.Chart;

PeakOil.Chart.prototype.update = function() {
    this.renderChart();
    this.titletxt.text = this.title;
};

PeakOil.Chart.prototype.toggleAreaUnderCurve = function() {
    this.areaUnderCurve = !this.areaUnderCurve;
}

PeakOil.Chart.prototype.setTitle = function(t) {
    this.title = t;
}

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
    this.graphic.drawRect(-2, -2, this.myWidth + 4, this.myHeight + this.legend.height + this.title.height);
    this.graphic.lineStyle(1, '0x00FF00', 1);
    this.legend.wordWrapWidth = this.myWidth - 10;
    if (this.hasPeaked(dpts)) {
	this.graphic.beginFill('0xFF0000', 0.5);
	this.legend.text = "Peak: " + max;
    } else {
	this.legend.text = "Max: " + max;
	this.graphic.beginFill('0x000000', 0.5);
    }
    this.title.text = this.title;
    if (this.areaUnderCurve) {
	this.legend.text += " Tot: " + tot;
    } else {
	this.legend.text += " Last: " + dpts[dpts.length - 2];
    }
    this.legend.x = 0;
    this.title.x = 0;
    this.title.y = this.myHeight - this.legend.height - this.title.height;
    this.legend.y = this.myHeight - this.legend.height;
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
