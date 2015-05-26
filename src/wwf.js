var _ = require('lodash');

var EnergyScenario = require('./energyScenario.js');
var RES = require('./res.js');

var Data = require("./data.js");
var UI = require("./UI.js");
var Results = require("./Results.js");
var ElectricityDataTable = require("./ElectricityDataTable.js");
var BackgroundDataTable = require("./BackgroundDataTable.js");
var InvestmentDataTable = require("./InvestmentDataTable.js");
var SharesDataTable = require("./SharesDataTable.js");
var Charts = require("./Charts.js");




var _ = require("lodash");




module.exports = WWF;

function WWF() {

    this.ui = new UI();
    this.results = new Results();
    this.data = new Data();
    this.electricityDataTable = new ElectricityDataTable();
    this.backgroundDataTable = new BackgroundDataTable();
    this.investmentDataTable = new InvestmentDataTable();
    this.sharesDataTable = new SharesDataTable();
    this.sharesDataTable = new Charts();
}


WWF.prototype = _.create(WWF.prototype, {
    data: null,
    ui: null
});
