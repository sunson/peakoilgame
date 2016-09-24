
PeakOil.Bank = function (game, x, y, chart) {
    Phaser.Sprite.call(this, game, x, y, 'empty');
    this.originWidth = game.world.width;
    this.originHeight = game.world.height;
    this.panicState = false;
    this.startBalance = false;

    this.upcomingDues = 0;
    this.clearedDues = 0;
    this.historicPaid = 0;

    this.chart = chart;
    this.balance = 100000;
    this.loans = new Array();
    this.ledger = new Array();
    this.EasyMode();

    this.graphic = new Phaser.Graphics(game, 0, 0);
    
    this.statusLabel = new Phaser.Text(game, 0, 0, "Bank", { font: "15px Arial", fill: "#333300", wordWrap: true, wordWrapWidth: this.game.world.width });
    this.statusLabel.anchor.setTo(0.5, 0.5);
    this.addChild(this.graphic);
    this.addChild(this.statusLabel);
    this.game.time.events.loop(Phaser.Timer.SECOND * this.durationFactor, this.gameLoop, this);
};

PeakOil.Bank.prototype = Object.create(Phaser.Sprite.prototype);
PeakOil.Bank.prototype.constructor = PeakOil.Bank;


PeakOil.Bank.prototype.EasyMode = function() {
    this.durationFactor = 1;
    this.default_interest_rate = 0.02;
    this.default_loan_duration = 20;
    this.lending_ratio = 5;
};

PeakOil.Bank.prototype.DifficultMode = function() {
    this.durationFactor = 3;
    this.default_interest_rate = 0.1;
    this.default_loan_duration = 30;
    this.lending_ratio = 1;
};



PeakOil.Bank.prototype.gameLoop = function() {
    // deduct all loan dues from balance
    if (!this.panicState) {
	var nt = Math.floor(this.game.time.totalElapsedSeconds());
	this.upcomingDues = 0;
	this.clearedDues = 0;
	this.historicPaid = 0;
	for (var i = 0; i < this.loans.length; i++) {
	    var l = this.loans[i];
	    if (this.isLoanMatured(l, nt)) {
		if (!l.dues_paid) {
		    var dueAmt = this.loanDues(l, nt);
		    if (this.spend(dueAmt)) {
			this.loans[i].dues_paid = true;
			this.clearedDues += dueAmt;
		    } else {
			this.panic();
		    }
		} else {
		    var dueAmt = this.loanDues(l, nt);
		    this.historicPaid += dueAmt;
		}
	    } else {
		var dueAmt = this.loanDues(l, nt);
		this.upcomingDues += dueAmt;
	    }
	}
	if (!this.startBalance) {
	    this.startBalance = this.balance;
	}
	this.chart.addData(this.balance);
    } else {
	// freeze upon panic
    }
};

PeakOil.Bank.prototype.netProfit = function() {
    return this.balance - this.startBalance;
};



PeakOil.Bank.prototype.isLoanMatured = function(l, t) {
    if ((l.start_date + (l.duration * this.durationFactor)) > t) {
	return false;
    } else {
	return true;
    }
};

PeakOil.Bank.prototype.loanDues = function(loan, nowtime) {
    if (loan.dues_paid) {
	var due = loan.amount;
	for (var i = 0; i < loan.duration; i++) {
	    due += due * loan.rate;
	}
	return Math.floor(due);
    } else {
	var due = loan.amount;
	for (var i = 0; i < (nowtime - loan.start_date) / this.durationFactor; i++) {
	    due += due * loan.rate;
	}
	return Math.floor(due);
    }
};

PeakOil.Bank.prototype.earn = function(amt) {
    if (!this.panicState) {
	this.balance += amt;
	this.ledger.push({type: 'credit', amount: amt});
    }
};

PeakOil.Bank.prototype.panic = function(amt) {
    this.panicState = true;
};


PeakOil.Bank.prototype.spend = function(amt) {
    if (amt < this.balance && !this.panicState) {
	this.balance -= amt;
	this.ledger.push({type: 'debit', amount: amt});
	return true;
    } else {
	return false;
    }
};


PeakOil.Bank.prototype.newLoan = function(amt, rate, dur) {
    this.loans.push({amount: amt, dues_paid: false, rate: rate, duration: dur, start_date: Math.floor(this.game.time.totalElapsedSeconds())});
};

PeakOil.Bank.prototype.getLoanPlan = function() {
    var rt = this.upcomingDues / (this.historicPaid ? 1 : this.historicPaid);
};

PeakOil.Bank.prototype.mortgage = function(amt, factory) {
    if (this.balance > amt * this.lending_ratio) {
	this.newLoan(amt, this.default_interest_rate, this.default_loan_duration);
	this.earn(amt);
	this.spend(amt);
	var thing = factory();
	thing.bank = this;
	return thing;
    } else {
	return false;
    }
};


PeakOil.Bank.prototype.activeLoansCount = function() {
    var active = 0;
    this.loans.forEach(function(l) { 
	if (!l.dues_paid) {
	    active++;
	}
    });
    return active;
};


PeakOil.Bank.prototype.update = function() {
    var active = this.activeLoansCount();
    this.statusLabel.text = "Bank: $" + this.balance + " [Loans: " + active + " / Clr: $" + this.clearedDues + " Pend: $" + Math.ceil(this.upcomingDues) + " ]";
    if (this.panicState) {
	this.statusLabel.text = "!!!" + this.statusLabel.text;
    }
    this.graphic.clear();
    this.graphic.lineStyle(3, '0xffffff', 0.3);
    this.graphic.beginFill('0xffffff', 0.6);
    this.graphic.drawRect(-1 * (this.statusLabel.width / 2 + 3), -1 * (this.statusLabel.height / 2 + 3), this.statusLabel.width + 6, this.statusLabel.height + 6);
    this.graphic.endFill();

    
    this.statusLabel.wordWrapWidth = this.game.world.width;
    if (this.game.world.width > this.game.world.height) {

    } else {
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
