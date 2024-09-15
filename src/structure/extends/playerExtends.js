//const { KazagumoPlayer, Kazagumo } = require("kazagumo");
//const { Player } = require("shoukaku");

const { Player } = require("lavalink-client");

Player.prototype.filter = false;
Player.prototype.speedAmount = 1;
Player.prototype.rateAmount = 1;
Player.prototype.pitchAmount = 1;
Player.prototype.nightcore = false;
Player.prototype.vaporwave = false;
Player.prototype.bassboostLevel = "";
Player.prototype._8d = false;
Player.prototype.pop = false;
Player.prototype.party = false;
Player.prototype.bass = false;
Player.prototype.radio = false;
Player.prototype.treblebass = false;
Player.prototype.soft = false;
Player.prototype.electrocic = false;
Player.prototype.rock = false;
Player.prototype.earrape = false;
Player.prototype.karaoke = false;
Player.prototype.vibrato = false;

Player.prototype.setSpeed = async function (amount) {
  if (!this.filter) this.filter = true;
  this.speedAmount = Math.max(Math.min(amount, 5), 0.05);

  this.filterManager.setSpeed(amount);

  return this;
};

Player.prototype.setEarrape = async function (value) {
  this.earrape = value;

  if (this.earrape) {
    if (!this.filter) this.filter = value;
    const bands = [
      { band: 0, gain: 0.25 },
      { band: 1, gain: 0.5 },
      { band: 2, gain: -0.5 },
      { band: 3, gain: -0.25 },
      { band: 4, gain: 0 },
      { band: 5, gain: -0.0125 },
      { band: 6, gain: -0.025 },
      { band: 7, gain: -0.0175 },
      { band: 8, gain: 0 },
      { band: 9, gain: 0 },
      { band: 10, gain: 0.0125 },
      { band: 11, gain: 0.025 },
      { band: 12, gain: 0.375 },
      { band: 13, gain: 0.125 },
      { band: 14, gain: 0.125 },
    ];

    this.setVolume(this.volume * 2 + 50);
    this.filterManager.setEQ(bands);
  } else {
    this.clearfilter();
  }
  return this;
};

Player.prototype.setPitch = async function (amount) {
  if (!this.filter) this.filter = true;
  this.pitchAmount = Math.max(Math.min(amount, 5), 0.05);
  this.filterManager.setPitch(this.pitchAmount);
  return this;
};

Player.prototype.setBassboost = async function (level) {
  this.filter = true;
  this.bassboostLevel = level;
  let val = 0;
  if (level !== "none") {
    if (level === "low") val = 1;
    else if (level === "medium") val = 2;
    else if (level === "high") val = 3;
    else if (level === "max") val = 5;

    this.bassboost = val;
    let num = (val - 1) * (1.25 / 9) - 0.25;
    this.filterManager.setEQ(
      Array(13)
        .fill(0)
        .map((n, i) => ({
          band: i,
          gain: num,
        }))
    );
  } else {
    this.clearfilter();
  }
  return this;
};

Player.prototype.setPop = async function (value) {
  this.pop = value;

  if (this.pop) {
    if (!this.filter) this.filter = value;
    const bands = [
      { band: 0, gain: -0.25 },
      { band: 1, gain: 0.48 },
      { band: 2, gain: 0.59 },
      { band: 3, gain: 0.72 },
      { band: 4, gain: 0.56 },
      { band: 5, gain: 0.15 },
      { band: 6, gain: -0.24 },
      { band: 7, gain: -0.24 },
      { band: 8, gain: -0.16 },
      { band: 9, gain: -0.16 },
      { band: 10, gain: 0 },
      { band: 11, gain: 0 },
      { band: 12, gain: 0 },
      { band: 13, gain: 0 },
      { band: 14, gain: 0 },
    ];

    this.filterManager.setEQ(bands);
  } else {
    this.clearfilter();
  }

  return this;
};

Player.prototype.setParty = async function (value) {
  this.party = value;

  if (this.party) {
    if (!this.filter) this.filter = true;
    const bands = [
      { band: 0, gain: -1.16 },
      { band: 1, gain: 0.28 },
      { band: 2, gain: 0.42 },
      { band: 3, gain: 0.5 },
      { band: 4, gain: 0.36 },
      { band: 5, gain: 0 },
      { band: 6, gain: -0.3 },
      { band: 7, gain: -0.21 },
      { band: 8, gain: -0.21 },
    ];

    this.filterManager.setEQ(bands);
  } else {
    this.clearfilter();
  }

  return this;
};

Player.prototype.setBass = async function (value) {
  this.bass = value;

  if (this.bass) {
    if (!this.filter) this.filter = true;
    const bands = [
      { band: 0, gain: 0.6 },
      { band: 1, gain: 0.7 },
      { band: 2, gain: 0.8 },
      { band: 3, gain: 0.55 },
      { band: 4, gain: 0.25 },
      { band: 5, gain: 0 },
      { band: 6, gain: -0.25 },
      { band: 7, gain: -0.45 },
      { band: 8, gain: -0.55 },
      { band: 9, gain: -0.7 },
      { band: 10, gain: -0.3 },
      { band: 11, gain: -0.25 },
      { band: 12, gain: 0 },
      { band: 13, gain: 0 },
      { band: 14, gain: 0 },
    ];

    this.filterManager.setEQ(bands);
  } else {
    this.clearfilter();
  }

  return this;
};

Player.prototype.setRadio = async function (value) {
  this.radio = value;

  if (this.radio) {
    if (!this.filter) this.filter = true;
    const bands = [
      { band: 0, gain: 0.65 },
      { band: 1, gain: 0.45 },
      { band: 2, gain: -0.45 },
      { band: 3, gain: -0.65 },
      { band: 4, gain: -0.35 },
      { band: 5, gain: 0.45 },
      { band: 6, gain: 0.55 },
      { band: 7, gain: 0.6 },
      { band: 8, gain: 0.6 },
      { band: 9, gain: 0.6 },
      { band: 10, gain: 0 },
      { band: 11, gain: 0 },
      { band: 12, gain: 0 },
      { band: 13, gain: 0 },
      { band: 14, gain: 0 },
    ];

    this.filterManager.setEQ(bands);
  } else {
    this.clearfilter();
  }

  return this;
};

Player.prototype.setTreblebass = async function (value) {
  this.treblebass = value;

  if (this.treblebass) {
    if (!this.filter) this.filter = true;
    const bands = [
      { band: 0, gain: 0.6 },
      { band: 1, gain: 0.67 },
      { band: 2, gain: 0.67 },
      { band: 3, gain: 0 },
      { band: 4, gain: -0.5 },
      { band: 5, gain: 0.15 },
      { band: 6, gain: -0.45 },
      { band: 7, gain: 0.23 },
      { band: 8, gain: 0.35 },
      { band: 9, gain: 0.45 },
      { band: 10, gain: 0.55 },
      { band: 11, gain: 0.6 },
      { band: 12, gain: 0.55 },
      { band: 13, gain: 0 },
      { band: 14, gain: 0 },
    ];

    this.filterManager.setEQ(bands);
  } else {
    this.filterManager.clearEQ();
  }

  return this;
};

Player.prototype.setSoft = async function (value) {
  this.soft = value;

  if (this.soft) {
    if (!this.filter) this.filter = true;
    const bands = [
      { band: 0, gain: 0 },
      { band: 1, gain: 0 },
      { band: 2, gain: 0 },
      { band: 3, gain: 0 },
      { band: 4, gain: 0 },
      { band: 5, gain: 0 },
      { band: 6, gain: 0 },
      { band: 7, gain: 0 },
      { band: 8, gain: -0.25 },
      { band: 9, gain: -0.25 },
      { band: 10, gain: -0.25 },
      { band: 11, gain: -0.25 },
      { band: 12, gain: -0.25 },
      { band: 13, gain: -0.25 },
      { band: 14, gain: -0.25 },
    ];

    this.filterManager.setEQ(bands);
  } else {
    this.clearfilter();
  }

  return this;
};
Player.prototype.setElectronic = async function (value) {
  this.electrocic = value;

  if (this.electrocic) {
    if (!this.filter) this.filter = true;
    const bands = [
      { band: 0, gain: 0.375 },
      { band: 1, gain: 0.35 },
      { band: 2, gain: 0.125 },
      { band: 3, gain: 0 },
      { band: 4, gain: 0 },
      { band: 5, gain: -0.125 },
      { band: 6, gain: -0.125 },
      { band: 7, gain: 0 },
      { band: 8, gain: 0.25 },
      { band: 9, gain: 0.125 },
      { band: 10, gain: 0.15 },
      { band: 11, gain: 0.2 },
      { band: 12, gain: 0.25 },
      { band: 13, gain: 0.35 },
      { band: 14, gain: 0.4 },
    ];

    this.filterManager.setEQ(bands);
  } else {
    this.clearfilter();
  }
};

Player.prototype.setRock = async function (value) {
  this.rock = value;

  if (this.rock) {
    if (!this.filter) this.filter = true;
    const bands = [
      { band: 0, gain: 0.3 },
      { band: 1, gain: 0.25 },
      { band: 2, gain: 0.2 },
      { band: 3, gain: 0.1 },
      { band: 4, gain: 0.05 },
      { band: 5, gain: -0.05 },
      { band: 6, gain: -0.15 },
      { band: 7, gain: -0.2 },
      { band: 8, gain: -0.1 },
      { band: 9, gain: -0.05 },
      { band: 10, gain: 0.05 },
      { band: 11, gain: 0.1 },
      { band: 12, gain: 0.2 },
      { band: 13, gain: 0.25 },
      { band: 14, gain: 0.3 },
    ];

    this.filterManager.setEQ(bands);
  } else {
    this.clearfilter();
  }

  return this;
};

Player.prototype.setNightCore = async function (value) {
  if (!this.filters) this.filters = true;
  this.nightcore = value;
  if (this.vaporwave) this.vaporwave = false;

  if (this.nightcore) {
    this.speedAmount = 1.2999999523162842;
    this.pitchAmount = 1.2999999523162842;

    this.filterManager.setSpeed(this.speedAmount);
    this.filterManager.setPitch(this.pitchAmount);
  } else {
    this.clearfilter();
  }

  return this;
};

Player.prototype.setVaporwave = async function (value) {
  if (!this.filter) this.filter = true;
  if (this.nightcore) this.nightcore = false;
  this.vaporwave = value;

  if (this.vaporwave) {
    this.speedAmount = 0.8500000238418579;
    this.pitchAmount = 0.800000011920929;

    this.filterManager.setSpeed(this.speedAmount);
    this.filterManager.setPitch(this.pitchAmount);
  } else {
    this.clearfilter();
  }
  return this;
};

Player.prototype.set8D = async function (value) {
  if (!this.filter) this.filter = true;
  this._8d = value;

  if (this._8d) {
    this.filterManager.toggleRotation(0.2);
  } else {
    this.clearfilter();

    return this;
  }
};

Player.prototype.setKaraoke = async function (value) {
  if (!this.filter) this.filter = true;
  this.karaoke = value;

  if (this.karaoke) {
    this.filterManager.toggleKaraoke(1, 1, 220, 100);
  } else {
    this.clearfilter();

    return this;
  }
};

Player.prototype.setVibrato = async function (value) {
  if (!this.filter) this.filter = true;
  this.vibrato = value;

  if (this.vibrato) {
    this.filterManager.toggleVibrato(10, 0.9);
  } else {
    this.clearfilter();
  }
  return this;
};

Player.prototype.clearfilter = async function () {
  this.filterManager.clearEQ();
  this.speedAmount = 1;
  this.pitchAmount = 1;
  this.rateAmount = 1;
  this.bassboostLevel = "";
  this.setVolume(80);
  if (this.nightcore) this.nightcore = false;
  if (this.vaporwave) this.vaporwave = false;
  if (this.pop) this.pop = false;
  if (this._8d) this._8d = false;
  if (this.filter) this.filter = false;
  if (this.bass) this.bass = false;
  if (this.party) this.party = false;
  if (this.radio) this.radio = false;
  if (this.soft) this.soft = false;
  if (this.electrocic) this.electrocic = false;
  if (this.rock) this.rock = false;
  if (this.earrape) this.earrape = false;
  if (this.karaoke) this.karaoke = false;
  if (this.vibrato) this.vibrato = false;
  if (this.channelMix) this.channelMix = false;
  this.filterManager.resetFilters();

  return this;
};
