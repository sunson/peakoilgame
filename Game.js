
PeakOil.Game = function (game) {
    this.bglayer;
    this.midlayer;
    this.fglayer;
    this.bank;
    this.land;
    this.gameoverflag = false;
    this.wells;
    this.fields;
    this.score;
    this.dashboard;
    this.bankboard;
    this.menuCollapsed = true;
    this.toolStatus = false;
    this.hint = true;
    this.gameoverstats;
    this.gameovertitle;
};

PeakOil.Game.prototype = {

    create: function () {
	this.gameoverflag = false;
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
	    if (that.gameoverflag) {
		that.state.start('MainMenu');
	    } else {
		that.createWellAt(pt.clientX, pt.clientY);
	    }
	});
	var that = this;
	var dashwid = 150;
	this.dashboard = new PeakOil.Chart(this.game, this.game.width - dashwid - 60, 10, dashwid, 60);
	this.dashboard.setTitle("Oil");
	this.bankboard = new PeakOil.Chart(this.game, this.game.width - dashwid * 2 - 80, 10, dashwid, 60);
	this.bankboard.setTitle("Money");
	this.bankboard.toggleAreaUnderCurve();
	this.bank = new PeakOil.Bank(this.game, this.game.world.width / 2, 20, this.bankboard);
	this.gameovertitle = new Phaser.Text(this.game, this.game.world.width / 4 * 3, this.game.world.height / 4, "Peak Oil Game", { font: "30px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: this.game.width / 4 - 20 });
	this.gameoverstats = new Phaser.Text(this.game, this.game.world.width / 4 * 3 + 5, this.game.world.height / 4 + this.gameovertitle.height + 50, "Peak Oil Game", { font: "25px Arial", fill: "#FFFFAA", wordWrapWidth: this.game.world.width / 4 - 20, wordWrap: true });
	this.fglayer.add(this.bank);
	this.bglayer.add(this.land);
	this.fglayer.add(this.dashboard);
	this.fglayer.add(this.bankboard);
	this.fglayer.add(this.gameovertitle);
	this.fglayer.add(this.gameoverstats);
	this.gameoverstats.alpha = 0;
	this.gameovertitle.alpha = 0;
	this.gameovertitanim = this.add.tween(this.gameovertitle).to({alpha: 0.5}).to({alpha: 1}).loop();

	this.fglayer.add(this.closeButton);
	this.createRandomFields(10, 5, this.game.world.width, this.game.world.height);
	this.resize(this.game.world.width, this.game.world.height);
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
	if (w) {
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
	}
    },

    update: function () {
	this.closeButton.bringToTop();
	this.bank.bringToTop();
	if (this.bank.panicState || this.dashboard.hasEnded()) {
	    this.gameOver();
	}
    },

    gameOver: function() {
	this.gameoverflag = true;
	this.bankboard.gameover();
	this.dashboard.gameover();
	this.dashboard.myHeight = this.game.world.height / 4;
	this.dashboard.myWidth = this.game.world.width / 4;
	this.bankboard.myHeight = this.game.world.height / 4;
	this.bankboard.myWidth = this.game.world.width / 4;
	this.dashboard.x = this.game.world.width / 3 - this.dashboard.myWidth;
	this.dashboard.y = this.game.world.height / 2 - this.dashboard.myHeight;
	this.bankboard.x = this.game.world.width / 3 * 2 - this.bankboard.myWidth;
	this.bankboard.y = this.game.world.height / 2 - this.bankboard.myHeight;
	this.dashboard.anchor.setTo(0.5, 0.5);
	this.gameovertitle.alpha = 1;
	this.gameoverstats.alpha = 1;
	if (this.bank.panicState) {
	    this.gameovertitle.text = "Bank Owns You";
	    this.gameoverstats.text = "You borrowed too much and failed to take account of how loans grow exponentially. It would've all been OK if you hadn't drilled too many dry holes. You walked into debt slavery, my friend. Debt slavery is worse than running out of oil. \n\n";
	} else if (this.dashboard.hasEnded()) {
	    if (this.dashboard.hasPeaked(this.dashboard.allData())) {
		this.gameovertitle.text = "You Successful Capitalist Leech!";
		this.gameoverstats.text = "Nobody can win over capitalist leeches like you who can suck the mother earth dry!\n\n";
	    } else {
		this.gameovertitle.text = "Timed Out!";
		this.gameoverstats.text = "The mother earth has given you all the oil to exploit. The bank has given you all the loan you need. We've given you an easy point and click interface. And you still don't want to exploit oil? Come on! Try again!.\n\n";
	    }

	}
	this.gameoverstats.text += "Balance: $" + this.bank.balance + "\n";
	this.gameoverstats.text += "Loans: " + this.bank.activeLoansCount() + "\n";
	this.gameoverstats.text += "Unpaid Loan Dues: $" + this.bank.upcomingDues + "\n";
	this.gameoverstats.text += "Wells: " + this.bank.loans.length + "\n";
	this.gameoverstats.text += "Profit: $" + this.bank.netProfit() + "\n";
	this.gameoverstats.text += "Serviced: $" + this.bank.historicPaid + "\n";

	this.dashboard.legend.x = this.dashboard.myWidth / 2 - this.dashboard.legend.width / 2;
	this.dashboard.legend.y = this.dashboard.myHeight + 10;
	this.bankboard.legend.x = this.bankboard.myWidth / 2 - this.bankboard.legend.width / 2;
	this.bankboard.legend.y = this.bankboard.myHeight + 10;

	this.resize(this.game.world.width, this.game.world.height);

    },

    quitGame: function (pointer) {
        this.state.start('MainMenu');
    },

    resize: function (width, height) {
	this.wells.forEach(function(w) {
	    w.resize(width, height);
	});
	this.fields.forEach(function(f) {
	    f.resize(width, height);
	});
	this.land.resize(width, height);
	if (width > height) {
	    // landscape
	    this.dashboard.alpha = 0.7;
	    this.bankboard.alpha = 0.7;
	    this.closeButton.x = width - 30;
	    this.closeButton.y = 30;
	    this.closeButton.scale.setTo(2, 2);
	    if (this.gameoverflag) {
		this.gameovertitle.x = width / 4 * 3 - 5;
		this.gameovertitle.y = height / 5 - 40;
		this.gameoverstats.x = width / 4 * 3;
		this.gameoverstats.y = height / 5 + 40;

		this.dashboard.alpha = 1;
		this.bankboard.alpha = 1;
		this.dashboard.myHeight = height / 4;
		this.dashboard.myWidth = width / 4;
		this.bankboard.myHeight = height / 4;
		this.bankboard.myWidth = width / 4;
		this.dashboard.x = width / 3 - this.dashboard.myWidth;
		this.dashboard.y = height / 2 - this.dashboard.myHeight;
		this.bankboard.x = width / 3 * 2 - this.bankboard.myWidth;
		this.bankboard.y = height / 2 - this.bankboard.myHeight;
		this.gameovertitle.wordWrapWidth = width / 4 - 10;
		this.gameoverstats.wordWrapWidth = width / 4 - 10;
	    } else {
		this.dashboard.myHeight = this.bankboard.myHeight = 60;
		this.dashboard.myWidth = this.bankboard.myWidth = 120;
		this.dashboard.x = width - this.dashboard.myWidth * 2 - 70;
		this.dashboard.y = 10;
		this.bankboard.x = width - this.bankboard.myWidth - 50;
		this.bankboard.y = 10;
	    }		
	} else {
	    // portrait
	    this.closeButton.x = width - 30;
	    this.closeButton.y = 30;
	    this.closeButton.scale.setTo(1.5,1.5);
	    if (this.gameoverflag) {
		this.dashboard.alpha = 1;
		this.bankboard.alpha = 1;
		this.dashboard.myHeight = height / 4;
		this.dashboard.myWidth = width / 2;
		this.bankboard.myHeight = height / 4;
		this.bankboard.myWidth = width / 2;
		this.dashboard.x = 0;
		this.dashboard.y = height / 3 - this.dashboard.myHeight;
		this.bankboard.x = width / 2;
		this.bankboard.y = height / 3 - this.bankboard.myHeight;
		
		this.gameovertitle.x = 5;
		this.gameovertitle.y = height / 5 + 5 + this.dashboard.myHeight / 2;
		this.gameoverstats.x = 10;
		this.gameoverstats.y = height / 5 + 50 + this.dashboard.myHeight / 2;
		this.closeButton.x = width - 30;
		this.closeButton.y = 30;
		this.gameovertitle.wordWrapWidth = width;
		this.gameoverstats.wordWrapWidth = width;
	    } else {
		this.dashboard.myHeight = this.bankboard.myHeight = height / 6;
		this.dashboard.myWidth = this.bankboard.myWidth = width / 2 - 20;
		this.dashboard.x = 0;
		this.dashboard.y = this.bank.statusLabel.height + 5;
		this.bankboard.x = width - this.bankboard.myWidth;
		this.bankboard.y = this.bank.statusLabel.height + 5;
		this.dashboard.alpha = 0.5;
		this.bankboard.alpha = 0.5;
	    }

	}
	this.bank.x = width / 2;
	this.bank.y = 5;
	this.bank.statusLabel.wordWrapWidth = width - this.closeButton.width;
	this.bank.statusLabel.fontSize = 30;
	this.bank.anchor.setTo(0.5, 0.5);
	this.bank.y = 30;

    }

};
