var _ = require('lodash');

var EnergyScenario = require('./energyScenario.js');
var RES = require('./res.js');

var Tables = require("./tables.js");
var UI = require("./UI.js");
var _ = require("lodash");


module.exports = WWF;

function WWF() {
    this.tables = new Tables();
    this.ui = new UI();
}


WWF.prototype = _.create(WWF.prototype, {
    tables: null,
    ui: null
});
