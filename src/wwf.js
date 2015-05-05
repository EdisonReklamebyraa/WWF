var _ = require('lodash');

var EnergyScenario = require('./energyScenario.js');
var RES = require('./res.js');

var Tables = require("./tables.js");
var UI = require("./UI.js");
var Results = require("./Results.js");
var _ = require("lodash");


module.exports = WWF;

function WWF() {

    this.ui = new UI();
    this.results = new Results();
    this.tables = new Tables();
}


WWF.prototype = _.create(WWF.prototype, {
    tables: null,
    ui: null
});
