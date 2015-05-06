var _ = require('lodash');

var EnergyScenario = require('./energyScenario.js');
var RES = require('./res.js');

var Data = require("./data.js");
var UI = require("./UI.js");
var Results = require("./Results.js");
var _ = require("lodash");


module.exports = WWF;

function WWF() {

    this.ui = new UI();
    this.results = new Results();
    this.data = new Data();
}


WWF.prototype = _.create(WWF.prototype, {
    data: null,
    ui: null
});
